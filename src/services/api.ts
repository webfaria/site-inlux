import { Product, Category } from '../types';
import { auth, db } from './firebase';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

const DEFAULT_TERMS = '<h1><strong>Termos de uso</strong></h1><p>Edite este conteúdo no painel administrativo.</p>';
const DEFAULT_CARE_GUIDE = '<h2>Cuidados com as joias</h2><p>Edite este conteúdo no painel administrativo.</p>';

const toProduct = (documentId: string, data: any): Product => ({
  id: Number(data.id || documentId),
  title: data.title || '',
  category: data.category || '',
  collection: data.collection || '',
  price: data.price || '',
  ref: data.ref || '',
  status: data.status || 'EM ESTOQUE',
  tag: data.tag || '',
  img: data.img || '',
  description: data.description || '',
  composition: data.composition || '',
  material: data.material || 'Prata',
  views: Number(data.views || 0),
});

const productDocId = (id: number | string) => String(id);

const authError = (code: string, message: string) => Object.assign(new Error(message), { code });
const dataError = (code: string, message: string) => Object.assign(new Error(message), { code });

const waitForAuthenticatedUser = () =>
  new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let unsubscribe = () => {};
    const timeout = window.setTimeout(() => {
      unsubscribe();
      reject(authError('auth/session-expired', 'Sessao expirada. Entre novamente no painel administrativo.'));
    }, 5000);

    unsubscribe = onAuthStateChanged(auth, (user) => {
      window.clearTimeout(timeout);
      unsubscribe();

      if (user) {
        resolve(user);
        return;
      }

      reject(authError('auth/session-expired', 'Sessao expirada. Entre novamente no painel administrativo.'));
    }, (error) => {
      window.clearTimeout(timeout);
      unsubscribe();
      reject(error);
    });
  });

const nextNumericId = async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  const ids = snapshot.docs.map((item) => Number(item.data().id || item.id)).filter(Number.isFinite);
  return ids.length ? Math.max(...ids) + 1 : 1;
};

const normalizeUploadFileName = (fileName: string) =>
  {
    const extension = fileName.includes('.') ? `.${fileName.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '')}` : '.jpg';
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const normalizedBase = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return `${normalizedBase || Date.now()}${extension}`;
  };

const getStaticUploadPath = (file: File) => `/uploads/${normalizeUploadFileName(file.name)}`;
const getProductImage = (product: Partial<Product>, imageFile?: File) =>
  product.img || (imageFile ? getStaticUploadPath(imageFile) : '');

const toCategory = (documentId: string, data: any): Category => ({
  name: data.name || documentId,
  slug: data.slug || documentId,
  active: data.active !== false,
});

export const productService = {
  async getAll(): Promise<Product[]> {
    const snapshot = await getDocs(query(collection(db, 'products'), orderBy('id', 'asc')));
    return snapshot.docs.map((item) => toProduct(item.id, item.data()));
  },

  subscribe(onChange: (products: Product[]) => void, onError: (error: Error) => void) {
    return onSnapshot(
      query(collection(db, 'products'), orderBy('id', 'asc')),
      (snapshot) => onChange(snapshot.docs.map((item) => toProduct(item.id, item.data()))),
      onError
    );
  },

  async add(product: Omit<Product, 'id'>, imageFile?: File): Promise<Product> {
    await waitForAuthenticatedUser();
    const id = await nextNumericId();
    const img = getProductImage(product as Partial<Product>, imageFile);
    const newProduct: Product = { ...product, id, img };
    await setDoc(doc(db, 'products', productDocId(id)), {
      ...newProduct,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newProduct;
  },

  async update(id: number, product: Partial<Product>, imageFile?: File): Promise<any> {
    await waitForAuthenticatedUser();
    const documentRef = doc(db, 'products', productDocId(id));
    const current = await getDoc(documentRef);
    const currentData = current.exists() ? current.data() : {};
    const img = product.img || (imageFile ? getStaticUploadPath(imageFile) : currentData.img || '');

    const payload = { ...product, id, img, updatedAt: serverTimestamp() };
    await setDoc(documentRef, payload, { merge: true });
    return { success: true, product: payload };
  },

  async delete(id: number): Promise<any> {
    await waitForAuthenticatedUser();
    const documentRef = doc(db, 'products', productDocId(id));
    await deleteDoc(documentRef);
    return { success: true };
  },

  async registerView(id: number): Promise<void> {
    await updateDoc(doc(db, 'products', productDocId(id)), {
      views: increment(1),
      updatedAt: serverTimestamp(),
    });
  },
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')));
    return snapshot.docs.map((item) => toCategory(item.id, item.data()));
  },

  subscribe(onChange: (categories: Category[]) => void, onError: (error: Error) => void) {
    return onSnapshot(
      query(collection(db, 'categories'), orderBy('name', 'asc')),
      (snapshot) => onChange(snapshot.docs.map((item) => toCategory(item.id, item.data()))),
      onError
    );
  },

  async add(category: Category): Promise<Category> {
    await waitForAuthenticatedUser();
    const documentRef = doc(db, 'categories', category.slug);
    const current = await getDoc(documentRef);

    if (current.exists()) {
      throw dataError('already-exists', 'Ja existe uma categoria com este slug.');
    }

    await setDoc(doc(db, 'categories', category.slug), { ...category, updatedAt: serverTimestamp() });
    return category;
  },

  async update(slug: string, category: Category): Promise<Category> {
    await waitForAuthenticatedUser();
    const targetRef = doc(db, 'categories', category.slug);

    if (slug !== category.slug) {
      const target = await getDoc(targetRef);
      if (target.exists()) {
        throw dataError('already-exists', 'Ja existe uma categoria com este slug.');
      }
    }

    const batch = writeBatch(db);

    if (slug !== category.slug) {
      const productsSnapshot = await getDocs(query(collection(db, 'products'), where('category', '==', slug)));
      productsSnapshot.docs.forEach((productDoc) => {
        batch.update(productDoc.ref, { category: category.slug, updatedAt: serverTimestamp() });
      });
      batch.delete(doc(db, 'categories', slug));
    }

    batch.set(targetRef, { ...category, updatedAt: serverTimestamp() }, { merge: true });
    await batch.commit();
    return category;
  },

  async delete(slug: string): Promise<any> {
    await waitForAuthenticatedUser();
    const productsSnapshot = await getDocs(query(collection(db, 'products'), where('category', '==', slug)));

    if (!productsSnapshot.empty) {
      throw dataError('failed-precondition', 'Nao e possivel excluir uma categoria que possui produtos.');
    }

    await deleteDoc(doc(db, 'categories', slug));
    return { success: true };
  },
};

const contentService = (docId: 'terms' | 'care-guide', defaultContent: string) => ({
  async get(): Promise<{ content: string; updatedAt?: string }> {
    const documentRef = doc(db, 'siteContent', docId);
    const snapshot = await getDoc(documentRef);
    if (!snapshot.exists()) return { content: defaultContent };
    const data = snapshot.data();
    return { content: data.content ?? defaultContent, updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() };
  },

  subscribe(
    onChange: (content: { content: string; updatedAt?: string }) => void,
    onError: (error: Error) => void
  ) {
    return onSnapshot(
      doc(db, 'siteContent', docId),
      (snapshot) => {
        if (!snapshot.exists()) {
          onChange({ content: defaultContent });
          return;
        }

        const data = snapshot.data();
        onChange({
          content: data.content ?? defaultContent,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.(),
        });
      },
      onError
    );
  },

  async update(content: string): Promise<any> {
    await waitForAuthenticatedUser();
    await setDoc(doc(db, 'siteContent', docId), { content, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  },
});

export const termsService = contentService('terms', DEFAULT_TERMS);
export const careGuideService = contentService('care-guide', DEFAULT_CARE_GUIDE);

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; token: string }> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const token = await credential.user.getIdToken();
    return { success: true, token };
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: string }).code) : '';

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'E-mail ou senha incorretos. Se tiver duvida, redefina a senha pelo Firebase.';
  }
  if (code === 'auth/user-not-found') {
    return 'Este e-mail nao foi encontrado no Firebase Authentication.';
  }
  if (code === 'auth/invalid-email') {
    return 'O e-mail informado nao e valido.';
  }
  if (code === 'auth/user-disabled') {
    return 'Este usuario esta desativado no Firebase Authentication.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Ative o metodo Email/password no Firebase Authentication.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Este dominio nao esta autorizado no Firebase Authentication. Adicione o dominio da Hostinger em Authentication > Settings > Authorized domains.';
  }
  if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key') {
    return `${fallback} A chave VITE_FIREBASE_API_KEY publicada nao e valida. Confira as variaveis do GitHub Actions e gere um novo deploy.`;
  }
  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas seguidas. Aguarde alguns minutos ou redefina a senha.';
  }
  if (code === 'auth/session-expired') {
    return 'Sua sessao expirou. Saia do painel, entre novamente e tente de novo.';
  }
  if (code === 'permission-denied') {
    return `${fallback} O Firebase recusou a operacao. Verifique se voce esta logado e se as regras do Firestore foram publicadas.`;
  }
  if (code === 'unavailable') {
    return `${fallback} O Firebase esta indisponivel no momento. Tente novamente em alguns instantes.`;
  }
  if (code === 'already-exists') {
    return 'Ja existe um cadastro usando este slug.';
  }
  if (code === 'failed-precondition') {
    return 'Nao e possivel excluir uma categoria que possui produtos. Mova ou exclua os produtos primeiro.';
  }

  if (error instanceof Error && error.message) {
    if (error.message.includes('permission-denied')) {
      return `${fallback} O Firebase recusou a operacao. Verifique se voce esta logado e se as regras do Firestore foram publicadas.`;
    }
    if (error.message.includes('auth/invalid-credential') || error.message.includes('auth/wrong-password')) {
      return 'E-mail ou senha incorretos. Se tiver duvida, redefina a senha pelo Firebase.';
    }
    if (error.message.includes('auth/unauthorized-domain')) {
      return 'Este dominio nao esta autorizado no Firebase Authentication. Adicione o dominio da Hostinger em Authentication > Settings > Authorized domains.';
    }
    if (error.message.includes('auth/api-key-not-valid') || error.message.includes('auth/invalid-api-key')) {
      return `${fallback} A chave VITE_FIREBASE_API_KEY publicada nao e valida. Confira as variaveis do GitHub Actions e gere um novo deploy.`;
    }
    if (error.message.includes('Firebase')) {
      return `${fallback} Verifique as variaveis VITE_FIREBASE_* e as regras do Firebase.`;
    }
    return error.message;
  }
  return fallback;
};
