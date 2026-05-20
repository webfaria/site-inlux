import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit, Trash2, Package, FolderOpen, 
  TriangleAlert, TrendingUp, Archive, Globe, 
  MessageCircle, Sparkles, Loader2, LogOut, ImagePlus
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { Product, Category } from '../types';
import { getApiErrorMessage, termsService, careGuideService } from '../services/api';
import { analyzeProductImage } from '../services/productAI';
import { formatCategoryName } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  onAdd: (product: any, image: File | null | undefined) => Promise<any>;
  onUpdate: (id: number, product: any, image: File | null | undefined) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  onAddCategory: (category: Category) => Promise<any>;
  onUpdateCategory: (slug: string, category: Category) => Promise<any>;
  onDeleteCategory: (slug: string) => Promise<any>;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}

interface RichTextEditorHandle {
  getHTML: () => string;
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({ value, onChange, className = '', style }, ref) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEditorValueRef = useRef('');

  useImperativeHandle(ref, () => ({
    getHTML: () => editorRef.current?.innerHTML ?? lastEditorValueRef.current,
  }), []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === lastEditorValueRef.current) return;

    editor.innerHTML = value;
    lastEditorValueRef.current = value;
  }, [value]);

  const handleInput = (event: FormEvent<HTMLDivElement>) => {
    const nextValue = event.currentTarget.innerHTML;
    lastEditorValueRef.current = nextValue;
    onChange(nextValue);
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      className={className}
      style={style}
    />
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export const AdminDashboard = ({ 
  products, 
  categories, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: AdminDashboardProps) => {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'Dashboard' | 'Categories' | 'Products' | 'Orders' | 'Terms' | 'CareGuide'>('Dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{ type: 'product' | 'category'; item: any; callback: () => void } | null>(null);
  const [termsContent, setTermsContent] = useState('');
  const [termsFeedback, setTermsFeedback] = useState('');
  const [isSavingTerms, setIsSavingTerms] = useState(false);
  const [careGuideContent, setCareGuideContent] = useState('');
  const [careGuideFeedback, setCareGuideFeedback] = useState('');
  const [isSavingCareGuide, setIsSavingCareGuide] = useState(false);
  const termsEditorRef = useRef<RichTextEditorHandle | null>(null);
  const careGuideEditorRef = useRef<RichTextEditorHandle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [productNameFilter, setProductNameFilter] = useState('');
  const [newProduct, setNewProduct] = useState({ 
    title: '', 
    category: categories[0]?.slug || '', 
    collection: '', 
    price: '', 
    ref: '', 
    status: 'EM ESTOQUE' as any, 
    img: '',
    description: '',
    composition: '',
    material: 'Semi-joia' as 'Prata' | 'Semi-joia'
  });
  const [newCategory, setNewCategory] = useState<{ name: string; slug: string; active: boolean }>({ name: '', slug: '', active: true });
  const [productError, setProductError] = useState('');
  const [productFeedback, setProductFeedback] = useState('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categoryFeedback, setCategoryFeedback] = useState('');
  const [editingCategorySlug, setEditingCategorySlug] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageCopyFeedback, setImageCopyFeedback] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalysis = async () => {
    setProductError('');
    setProductFeedback('');

    if (!imageFile) {
      setProductError('Selecione uma imagem do produto antes de gerar com IA.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await analyzeProductImage({
        imageFile,
        title: newProduct.title,
        category: categories.find((category) => category.slug === newProduct.category)?.name || newProduct.category,
        material: newProduct.material,
      });

      setNewProduct((currentProduct) => ({
        ...currentProduct,
        title: analysis.title || currentProduct.title,
        description: analysis.description,
        composition: analysis.composition,
      }));
      setProductFeedback('Título, descrição e composição gerados com IA a partir da imagem.');
    } catch (error) {
      setProductError(getApiErrorMessage(error, 'Nao foi possivel gerar a descricao com IA.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatPriceInput = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (!digits) return '';

    const amount = Number(digits) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
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

  const withImageVersion = (imagePath: string) => {
    const [pathWithoutQuery] = imagePath.split('?');
    return `${pathWithoutQuery}?v=${Date.now()}`;
  };

  const waitForImageAvailability = (imagePath: string) =>
    new Promise<void>((resolve, reject) => {
      const image = new Image();
      const timeout = window.setTimeout(() => {
        image.onload = null;
        image.onerror = null;
        reject(new Error('A imagem foi salva, mas ainda nao ficou disponivel para exibicao.'));
      }, 5000);

      image.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };

      image.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('A imagem foi salva, mas nao carregou pelo caminho /uploads.'));
      };

      image.src = withImageVersion(imagePath);
    });

  const saveImageToUploads = async () => {
    if (!imageFile) {
      setProductError('Selecione uma imagem antes de salvar em public/uploads.');
      return '';
    }

    const uploadFileName = normalizeUploadFileName(imageFile.name);
    setProductError('');
    setImageCopyFeedback('');
    setIsSavingImage(true);

    try {
      const response = await fetch('/api/local-upload', {
        method: 'POST',
        headers: {
          'Content-Type': imageFile.type || 'application/octet-stream',
          'X-File-Name': uploadFileName,
        },
        body: imageFile,
      });

      if (!response.ok) {
        throw new Error('Falha ao gravar a imagem em public/uploads.');
      }

      const data = await response.json();
      const imagePath = data.path || `/uploads/${uploadFileName}`;
      await waitForImageAvailability(imagePath);
      const versionedImagePath = withImageVersion(imagePath);
      setNewProduct((current) => ({ ...current, img: versionedImagePath }));
      setImageCopyFeedback(`Imagem salva em public/uploads/${uploadFileName}.`);
      setIsSavingImage(false);
      return versionedImagePath;
    } catch (error) {
      if (import.meta.env.DEV) {
        setProductError(error instanceof Error ? error.message : 'Nao foi possivel salvar a imagem automaticamente.');
        setIsSavingImage(false);
        return '';
      }
    }

    const showDirectoryPicker = (window as any).showDirectoryPicker;
    if (!showDirectoryPicker) {
      setProductError('Seu navegador nao permite salvar em uma pasta local. Use Chrome ou Edge, ou copie a imagem manualmente para public/uploads.');
      setIsSavingImage(false);
      return '';
    }

    try {
      const directoryHandle = await showDirectoryPicker({ mode: 'readwrite' });
      const fileHandle = await directoryHandle.getFileHandle(uploadFileName, { create: true });
      const writable = await fileHandle.createWritable();

      await writable.write(imageFile);
      await writable.close();

      const imagePath = `/uploads/${uploadFileName}`;
      await waitForImageAvailability(imagePath);
      const versionedImagePath = withImageVersion(imagePath);
      setNewProduct((current) => ({ ...current, img: versionedImagePath }));
      setImageCopyFeedback(`Imagem salva como public/uploads/${uploadFileName}. Gere o build para publicar.`);
      return versionedImagePath;
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      setProductError('Nao foi possivel salvar a imagem. Selecione a pasta public/uploads do projeto e permita a gravacao.');
      return '';
    } finally {
      setIsSavingImage(false);
    }
  };

  const getUploadPathWithoutQuery = (imagePath?: string) => imagePath?.split('?')[0] || '';
  const isLocalUploadPath = (imagePath?: string) => getUploadPathWithoutQuery(imagePath).startsWith('/uploads/');

  const deleteImageFromUploads = async (imagePath?: string) => {
    if (!isLocalUploadPath(imagePath)) return;

    try {
      const response = await fetch('/api/local-upload', {
        method: 'DELETE',
        headers: {
          'X-File-Path': getUploadPathWithoutQuery(imagePath),
        },
      });

      if (!response.ok && import.meta.env.DEV) {
        throw new Error('Nao foi possivel remover a imagem antiga de public/uploads.');
      }
    } catch {
      if (import.meta.env.DEV) {
        setProductError('O cadastro foi salvo, mas nao foi possivel remover a imagem antiga de public/uploads.');
      }
    }
  };

  const isImageUsedByAnotherProduct = (imagePath: string | undefined, productId: number) => {
    const imageBasePath = getUploadPathWithoutQuery(imagePath);
    return Boolean(imageBasePath) && products.some((product) => (
      product.id !== productId && getUploadPathWithoutQuery(product.img) === imageBasePath
    ));
  };

  const deleteProductImageIfUnused = async (imagePath: string | undefined, productId: number) => {
    if (!imagePath || isImageUsedByAnotherProduct(imagePath, productId)) return;
    await deleteImageFromUploads(imagePath);
  };

  useEffect(() => {
    if (!categories.length) return;
    if (!categories.some((category) => category.slug === newProduct.category)) {
      setNewProduct((current) => ({ ...current, category: categories[0].slug }));
    }
  }, [categories, newProduct.category]);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const termsData = await termsService.get();
        setTermsContent(termsData.content);
        const guideData = await careGuideService.get();
        setCareGuideContent(guideData.content);
      } catch (error) {
        console.error('Falha ao carregar textos administrativos:', error);
      }
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const resetProductForm = () => {
    setNewProduct({ 
      title: '', 
      category: categories[0]?.slug || '', 
      collection: '', 
      price: '', 
      ref: '', 
      status: 'EM ESTOQUE', 
      img: '',
      description: '',
      composition: '',
      material: 'Semi-joia'
    });
    setImageFile(null);
    setImagePreviewUrl('');
    setImageCopyFeedback('');
    setEditingProductId(null);
    setProductError('');
  };

  const categoryStats = categories.map((category) => ({
    value: category.slug,
    label: category.name,
    active: category.active !== false,
    total: products.filter((product) => product.category === category.slug).length,
  }));

  const normalizeCategorySlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesName = productNameFilter.trim() === '' ? true : product.title.toLowerCase().includes(productNameFilter.trim().toLowerCase());
    return matchesCategory && matchesName;
  });

  const renderAdminContent = () => {
    if (activeSection === 'Dashboard') {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white border border-zinc-100 p-8 hover:border-zinc-300 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-zinc-50 rounded-none group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                  <Package className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-zinc-300" />
              </div>
              <p className="font-label-caps text-[10px] text-zinc-400 tracking-[0.2em] mb-2">Total de Produtos</p>
              <p className="font-serif text-4xl text-zinc-900">{products.length}</p>
            </div>

            <div className="group bg-white border border-zinc-100 p-8 hover:border-zinc-300 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-zinc-50 rounded-none group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <Globe className="w-4 h-4 text-zinc-300" />
              </div>
              <p className="font-label-caps text-[10px] text-zinc-400 tracking-[0.2em] mb-2">Categorias Ativas</p>
              <p className="font-serif text-4xl text-zinc-900">{categoryStats.filter((category) => category.active !== false).length}</p>
            </div>

            <div className="group bg-white border border-zinc-100 p-8 hover:border-zinc-300 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-zinc-50 rounded-none group-hover:bg-error group-hover:text-white transition-colors duration-300">
                  <TriangleAlert className="w-5 h-5" />
                </div>
                <Archive className="w-4 h-4 text-zinc-300" />
              </div>
              <p className="font-label-caps text-[10px] text-zinc-400 tracking-[0.2em] mb-2">Esgotados</p>
              <p className="font-serif text-4xl text-zinc-900">{products.filter((product) => product.status === 'ESGOTADO').length}</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100">
               <h3 className="font-serif text-lg text-zinc-900 tracking-wide">Produtos Adicionados Recentemente</h3>
               <button onClick={() => setActiveSection('Products')} className="text-[10px] font-label-caps text-zinc-400 hover:text-zinc-900 tracking-widest transition-colors cursor-pointer">VER TODOS</button>
             </div>
             <div className="space-y-0">
               {products.slice(-5).reverse().map((p, i) => (
                 <div key={i} className="flex items-center justify-between py-5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 px-4 -mx-4 transition-colors">
                   <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-zinc-50 overflow-hidden border border-zinc-100">
                       <img src={p.img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                     <div>
                       <p className="font-serif text-sm text-zinc-900 tracking-wide">{p.title}</p>
                       <p className="text-[9px] font-label-caps text-zinc-400 uppercase tracking-[0.15em] mt-1">
                         {categories.find(c => c.slug === p.category)?.name || p.category}
                       </p>
                     </div>
                   </div>
                   <div className="text-right flex flex-col items-end gap-1">
                     <p className="font-serif text-sm text-zinc-900">{p.price}</p>
                     <span className={`text-[8px] font-label-caps px-2 py-0.5 tracking-widest ${p.status === 'ESGOTADO' ? 'bg-error/10 text-error' : 'bg-zinc-100 text-zinc-500'}`}>
                       {p.status || 'EM ESTOQUE'}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'Categories') {
      return (
        <div className="space-y-8">
          {categoryFeedback && (
            <div className="bg-zinc-900 text-white px-6 py-4 font-serif text-sm">
              {categoryFeedback}
            </div>
          )}
          {categoryError && (
            <div className="bg-red-50 text-red-700 border border-red-100 px-6 py-4 font-serif text-sm">
              {categoryError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`relative overflow-hidden group p-8 text-left transition-all duration-500 cursor-pointer border ${
                selectedCategory === null 
                ? 'bg-zinc-900 border-zinc-900 shadow-xl' 
                : 'bg-white border-zinc-100 hover:border-zinc-300 shadow-sm'
              }`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="font-label-caps text-[10px] tracking-[0.3em] text-zinc-400 mb-2">Coleção</p>
                  <h3 className={`font-serif text-2xl tracking-wide ${selectedCategory === null ? 'text-white' : 'text-zinc-900'}`}>Todas</h3>
                </div>
                <div className="mt-8 flex items-end justify-between">
                  <p className={`text-4xl font-serif ${selectedCategory === null ? 'text-white' : 'text-zinc-900'}`}>{products.length}</p>
                  <span className={`text-[9px] font-label-caps tracking-widest px-3 py-1 ${selectedCategory === null ? 'bg-white/10 text-white' : 'bg-zinc-50 text-zinc-400'}`}>PEÇAS</span>
                </div>
              </div>
              {selectedCategory === null && (
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Package className="w-24 h-24 text-white" />
                </div>
              )}
            </button>

            {categoryStats.map((category) => {
              const isActive = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`relative overflow-hidden group p-8 text-left transition-all duration-500 cursor-pointer border ${
                    isActive 
                    ? 'bg-zinc-900 border-zinc-900 shadow-xl' 
                    : 'bg-white border-zinc-100 hover:border-zinc-300 shadow-sm'
                  }`}
                >
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <p className="font-label-caps text-[10px] tracking-[0.3em] text-zinc-400 mb-2">Categoria</p>
                      <h3 className={`font-serif text-2xl tracking-wide ${isActive ? 'text-white' : 'text-zinc-900'}`}>{category.label}</h3>
                    </div>
                    <div className="mt-8 flex items-end justify-between">
                      <p className={`text-4xl font-serif ${isActive ? 'text-white' : 'text-zinc-900'}`}>{category.total}</p>
                      <span className={`text-[9px] font-label-caps tracking-widest px-3 py-1 ${isActive ? 'bg-white/10 text-white' : 'bg-zinc-50 text-zinc-400'}`}>PEÇAS</span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <FolderOpen className="w-24 h-24 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100">
              <h3 className="font-serif text-lg text-zinc-900">Gerenciar categorias</h3>
              <p className="text-[10px] font-label-caps text-zinc-400 mt-1">CRIE, EDITE E EXCLUA CATEGORIAS</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">NOME</th>
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">SLUG</th>
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">STATUS</th>
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">PRODUTOS</th>
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em] text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {categoryStats.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center font-serif text-sm text-zinc-500">
                        Nenhuma categoria cadastrada no Firestore.
                      </td>
                    </tr>
                  )}
                  {categoryStats.map((category) => (
                    <tr key={category.value} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-8 py-6">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFeedback('');
                            setSelectedCategory(category.value);
                          }}
                          className="font-serif text-sm text-zinc-900 hover:text-zinc-600 cursor-pointer"
                        >
                          {category.label}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-label-caps text-[10px] text-zinc-500">{category.value}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`font-label-caps text-[10px] ${category.active === false ? 'text-zinc-400' : 'text-zinc-900'}`}>{category.active === false ? 'INATIVA' : 'ATIVA'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-serif text-sm text-zinc-900">{category.total}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryFeedback('');
                              setCategoryError('');
                              setEditingCategorySlug(category.value);
                              setNewCategory({ name: category.label, slug: category.value, active: category.active });
                              setShowAddCategoryModal(true);
                            }}
                            className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                            aria-label={`Editar ${category.label}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDeleteConfirmModal(true);
                              setDeleteConfirmData({
                                type: 'category',
                                item: { name: category.label, slug: category.value },
                                callback: async () => {
                                  setCategoryFeedback('');
                                  setCategoryError('');
                                  try {
                                    await onDeleteCategory(category.value);
                                    if (selectedCategory === category.value) {
                                      setSelectedCategory(null);
                                    }
                                    setCategoryFeedback(`Categoria "${category.label}" excluida com sucesso.`);
                                  } catch (error: any) {
                                    setCategoryError(getApiErrorMessage(error, 'Nao foi possivel excluir a categoria.'));
                                  }
                                }
                              });
                            }}
                            className="text-zinc-400 hover:text-error transition-colors"
                            aria-label={`Excluir ${category.label}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg text-zinc-900">
                  {selectedCategory ? `Categoria: ${categories.find((category) => category.slug === selectedCategory)?.name || formatCategoryName(selectedCategory)}` : 'Todas as categorias'}
                </h3>
                <p className="text-[10px] font-label-caps text-zinc-400 mt-1">
                  {filteredProducts.length} PRODUTO{filteredProducts.length === 1 ? '' : 'S'}
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center w-full md:w-auto">
                <select
                  className="border border-zinc-200 rounded px-3 py-2 text-sm font-serif bg-white focus:border-black focus:ring-0 outline-none transition-colors"
                  value={selectedCategory || ''}
                  onChange={e => setSelectedCategory(e.target.value || null)}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Filtrar por nome do produto"
                  className="border border-zinc-200 rounded px-3 py-2 text-sm font-serif bg-white focus:border-black focus:ring-0 outline-none transition-colors"
                  value={productNameFilter}
                  onChange={e => setProductNameFilter(e.target.value)}
                  style={{ minWidth: 180 }}
                />
                {(selectedCategory || productNameFilter) && (
                  <button
                    onClick={() => { setSelectedCategory(null); setProductNameFilter(''); }}
                    className="font-label-caps text-[10px] tracking-[0.2em] text-zinc-500 hover:text-zinc-900 px-2"
                  >
                    LIMPAR FILTRO
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">PRODUTO</th>
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">CATEGORIA</th>
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">STATUS</th>
                    <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">PREÇO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-surface-container overflow-hidden">
                            <img src={p.img} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-serif text-sm text-zinc-900 tracking-wide">{p.title}</p>
                            <p className="text-[10px] font-label-caps text-zinc-400 mt-1">REF: {p.ref || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-label-caps text-[10px] text-zinc-600 bg-zinc-100 px-3 py-1 uppercase">
                          {categories.find((category) => category.slug === p.category)?.name || formatCategoryName(p.category)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`font-label-caps text-[10px] px-3 py-1 uppercase ${
                          p.status === 'ESGOTADO' ? 'bg-red-100 text-red-600' :
                          p.status === 'BAIXO ESTOQUE' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-600'
                        }`}>{p.status || 'EM ESTOQUE'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-serif text-sm text-zinc-900">{p.price}</p>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-zinc-400 font-serif italic">
                        Nenhum produto encontrado nesta categoria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'Terms') {
      return (
        <div className="space-y-8">
          {termsFeedback && (
            <div className="bg-zinc-900 text-white px-6 py-4 font-serif text-sm">
              {termsFeedback}
            </div>
          )}
          <div className="bg-white border border-zinc-100 p-12 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="font-serif text-2xl text-zinc-900 mb-2">Editar Termos de Uso</h3>
            <p className="text-[10px] font-label-caps text-zinc-400 mb-12 tracking-[0.2em]">O TEXTO ABAIXO SERÁ EXIBIDO NA PÁGINA PÚBLICA DE TERMOS</p>
            
            <div className="space-y-8">
              <div className="flex gap-4 pb-4 border-b border-zinc-100">
                <button 
                  type="button"
                  onClick={() => document.execCommand('bold', false)}
                  className="p-2 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                  title="Negrito"
                >
                  <strong className="font-serif text-lg">B</strong>
                </button>
                <button 
                  type="button"
                  onClick={() => document.execCommand('formatBlock', false, 'h2')}
                  className="p-2 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                  title="Título"
                >
                  <span className="font-serif text-lg">T</span>
                </button>
                <button 
                  type="button"
                  onClick={() => document.execCommand('insertUnorderedList', false)}
                  className="p-2 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                  title="Lista"
                >
                  <span className="font-serif text-lg">•</span>
                </button>
              </div>

              <RichTextEditor
                ref={termsEditorRef}
                value={termsContent}
                onChange={setTermsContent}
                className="w-full min-h-[500px] border border-zinc-200 p-8 text-body-md focus:border-black outline-none transition-colors overflow-y-auto bg-white"
                style={{ whiteSpace: 'normal' }}
              />
              
              <div className="flex justify-end">
                <button 
                  onClick={async () => {
                    setIsSavingTerms(true);
                    setTermsFeedback('');
                    try {
                      const currentTermsContent = termsEditorRef.current?.getHTML() ?? termsContent;
                      setTermsContent(currentTermsContent);
                      await termsService.update(currentTermsContent);
                      setTermsFeedback('Termos de uso atualizados com sucesso.');
                    } catch (error) {
                      setTermsFeedback(getApiErrorMessage(error, 'Erro ao salvar termos.'));
                    } finally {
                      setIsSavingTerms(false);
                    }
                  }}
                  disabled={isSavingTerms}
                  className="bg-primary text-on-primary px-12 py-4 font-label-caps tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {isSavingTerms ? 'SALVANDO...' : 'SALVAR TERMOS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'CareGuide') {
      return (
        <div className="space-y-8">
          {careGuideFeedback && (
            <div className="bg-zinc-900 text-white px-6 py-4 font-serif text-sm">
              {careGuideFeedback}
            </div>
          )}
          <div className="bg-white border border-zinc-100 p-12 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="font-serif text-2xl text-zinc-900 mb-2">Editar Guia de Cuidados</h3>
            <p className="text-[10px] font-label-caps text-zinc-400 mb-12 tracking-[0.2em]">ORIENTAÇÕES SOBRE COMO CUIDAR DAS JOIAS</p>
            
            <div className="space-y-8">
              <div className="flex gap-4 pb-4 border-b border-zinc-100">
                <button 
                  type="button"
                  onClick={() => document.execCommand('bold', false)}
                  className="p-2 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                >
                  <strong className="font-serif text-lg">B</strong>
                </button>
                <button 
                  type="button"
                  onClick={() => document.execCommand('formatBlock', false, 'h2')}
                  className="p-2 hover:bg-zinc-100 rounded cursor-pointer transition-colors"
                >
                  <span className="font-serif text-lg">T</span>
                </button>
              </div>

              <RichTextEditor
                ref={careGuideEditorRef}
                value={careGuideContent}
                onChange={setCareGuideContent}
                className="w-full min-h-[500px] border border-zinc-200 p-8 text-body-md focus:border-black outline-none transition-colors overflow-y-auto bg-white"
              />
              
              <div className="flex justify-end">
                <button 
                  onClick={async () => {
                    setIsSavingCareGuide(true);
                    setCareGuideFeedback('');
                    try {
                      const currentCareGuideContent = careGuideEditorRef.current?.getHTML() ?? careGuideContent;
                      setCareGuideContent(currentCareGuideContent);
                      await careGuideService.update(currentCareGuideContent);
                      setCareGuideFeedback('Guia de cuidados atualizado com sucesso.');
                    } catch (error) {
                      setCareGuideFeedback(getApiErrorMessage(error, 'Erro ao salvar guia.'));
                    } finally {
                      setIsSavingCareGuide(false);
                    }
                  }}
                  disabled={isSavingCareGuide}
                  className="bg-primary text-on-primary px-12 py-4 font-label-caps tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCareGuide ? 'SALVANDO...' : 'SALVAR GUIA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'Orders') {
      return (
        <div className="bg-white border border-zinc-100 p-12 text-center">
          <h3 className="font-serif text-2xl text-zinc-900 mb-4">Pedidos</h3>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Esta área ainda não possui integrações de pedidos. O menu agora navega corretamente e está pronto para receber essa funcionalidade.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {productFeedback && (
          <div className="bg-zinc-900 text-white px-6 py-4 font-serif text-sm">
            {productFeedback}
          </div>
        )}
        {productError && (
          <div className="bg-red-50 text-red-700 border border-red-100 px-6 py-4 font-serif text-sm">
            {productError}
          </div>
        )}
        <div className="bg-white border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-zinc-900">Catálogo de Produtos</h3>
              <p className="text-[10px] font-label-caps text-zinc-400 mt-1">
                {filteredProducts.length} PRODUTO{filteredProducts.length === 1 ? '' : 'S'}
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center w-full md:w-auto">
              <select
                className="border border-zinc-200 rounded px-3 py-2 text-sm font-serif bg-white focus:border-black focus:ring-0 outline-none transition-colors"
                value={selectedCategory || ''}
                onChange={e => setSelectedCategory(e.target.value || null)}
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.slug} value={category.slug}>{category.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Filtrar por nome do produto"
                className="border border-zinc-200 rounded px-3 py-2 text-sm font-serif bg-white focus:border-black focus:ring-0 outline-none transition-colors"
                value={productNameFilter}
                onChange={e => setProductNameFilter(e.target.value)}
                style={{ minWidth: 180 }}
              />
              {(selectedCategory || productNameFilter) && (
                <button
                  onClick={() => { setSelectedCategory(null); setProductNameFilter(''); }}
                  className="font-label-caps text-[10px] tracking-[0.2em] text-zinc-500 hover:text-zinc-900 px-2"
                >
                  LIMPAR FILTRO
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">PRODUTO</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">CATEGORIA</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">STATUS</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">PREÇO</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em] text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center font-serif text-sm text-zinc-500">
                      Nenhum produto cadastrado no Firestore.
                    </td>
                  </tr>
                )}
                {filteredProducts.map((p, i) => (
                  <tr key={i} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-surface-container overflow-hidden">
                          <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-serif text-sm text-zinc-900 tracking-wide">{p.title}</p>
                          <p className="text-[10px] font-label-caps text-zinc-400 mt-1">REF: {p.ref || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-label-caps text-[10px] text-zinc-600 bg-zinc-100 px-3 py-1 uppercase">{categories.find((category) => category.slug === p.category)?.name || formatCategoryName(p.category)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'ESGOTADO' ? 'bg-red-500' :
                          p.status === 'BAIXO ESTOQUE' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></span>
                        <span className={`font-label-caps text-[10px] ${
                          p.status === 'ESGOTADO' ? 'text-red-600' :
                          p.status === 'BAIXO ESTOQUE' ? 'text-yellow-700' :
                          'text-green-600'
                        }`}>{p.status || 'EM ESTOQUE'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-serif text-sm text-zinc-900">{p.price}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setProductFeedback('');
                            setProductError('');
                            setEditingProductId(p.id);
                            setNewProduct({
                              title: p.title || '',
                              category: p.category || categories[0]?.slug || '',
                              collection: p.collection || '',
                              price: p.price || '',
                              ref: p.ref || '',
                              status: p.status || 'EM ESTOQUE',
                              img: p.img || '',
                              description: p.description || '',
                              composition: p.composition || '',
                              material: p.material || 'Prata',
                            });
                            setImageFile(null);
                            setImagePreviewUrl('');
                            setImageCopyFeedback('');
                            setShowAddModal(true);
                          }}
                          className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirmModal(true);
                            setDeleteConfirmData({
                              type: 'product',
                              item: { title: p.title, id: p.id },
                              callback: async () => {
                                setProductFeedback('');
                                setProductError('');
                                try {
                                  await onDelete(p.id);
                                  await deleteProductImageIfUnused(p.img, p.id);
                                  setProductFeedback(`Produto "${p.title}" excluido com sucesso.`);
                                } catch (error) {
                                  setProductError(getApiErrorMessage(error, 'Nao foi possivel excluir o produto.'));
                                }
                              }
                            });
                          }}
                          className="text-zinc-400 hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setProductError('');
    setProductFeedback('');

    if (!newProduct.title.trim()) {
      setProductError('Informe o titulo do produto.');
      return;
    }

    if (!newProduct.price.trim()) {
      setProductError('Informe o preco do produto.');
      return;
    }

    if (!newProduct.ref.trim()) {
      setProductError('Informe a referencia do produto.');
      return;
    }

    if (!newProduct.category) {
      setProductError('Cadastre ou selecione uma categoria antes de salvar o produto.');
      return;
    }

    const submitProduct = async () => {
      setIsSavingProduct(true);
      try {
        const previousProduct = editingProductId !== null
          ? products.find((product) => product.id === editingProductId)
          : null;
        const uploadedImagePath = imageFile ? await saveImageToUploads() : '';
        if (imageFile && !uploadedImagePath) {
          throw new Error('A imagem nao foi salva. Reinicie o npm run dev e tente cadastrar novamente.');
        }
        const productPayload = {
          ...newProduct,
          title: newProduct.title.trim(),
          price: formatPriceInput(newProduct.price),
          ref: newProduct.ref.trim(),
        };
        const productToSave = uploadedImagePath ? { ...productPayload, img: uploadedImagePath } : productPayload;

        if (editingProductId !== null) {
          await onUpdate(editingProductId, productToSave, imageFile);
          const previousImagePath = getUploadPathWithoutQuery(previousProduct?.img);
          const currentImagePath = getUploadPathWithoutQuery(productToSave.img);

          if (previousImagePath && previousImagePath !== currentImagePath) {
            await deleteProductImageIfUnused(previousImagePath, editingProductId);
          }
          setProductFeedback(`Produto "${productToSave.title}" atualizado com sucesso.`);
        } else {
          await onAdd(productToSave, imageFile);
          setProductFeedback(`Produto "${productToSave.title}" criado com sucesso.`);
        }
        setShowAddModal(false);
        resetProductForm();
      } catch (error) {
        setProductError(getApiErrorMessage(error, 'Nao foi possivel salvar o produto.'));
      } finally {
        setIsSavingProduct(false);
      }
    };

    submitProduct();
  };

  const handleCategorySubmit = async (e: any) => {
    e.preventDefault();
    setCategoryError('');
    setCategoryFeedback('');
    const normalizedSlug = normalizeCategorySlug(newCategory.slug || newCategory.name);
    const trimmedName = newCategory.name.trim();

    if (!trimmedName || !normalizedSlug) {
      setCategoryError('Informe um nome de categoria valido.');
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingCategorySlug) {
        await onUpdateCategory(editingCategorySlug, { name: trimmedName, slug: normalizedSlug, active: newCategory.active });
        setCategoryFeedback(`Categoria "${trimmedName}" atualizada com sucesso.`);
      } else {
        await onAddCategory({ name: trimmedName, slug: normalizedSlug, active: newCategory.active });
        setCategoryFeedback(`Categoria "${trimmedName}" criada com sucesso.`);
      }
      setShowAddCategoryModal(false);
      setNewCategory({ name: '', slug: '', active: true });
      setEditingCategorySlug(null);
      setSelectedCategory(normalizedSlug);
    } catch (error: any) {
      setCategoryError(getApiErrorMessage(error, 'Nao foi possivel salvar a categoria.'));
    } finally {
      setIsSavingCategory(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen bg-background"
    >
      {/* Admin Sidebar */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 border-r border-zinc-200 flex flex-col bg-zinc-50">
        <div className="h-24 flex items-center px-8 border-b border-zinc-100 bg-white/80">
          <div className="relative h-20 flex items-center -ml-4">
            <Logo className="h-20" />
          </div>
        </div>
        <div className="flex-1 py-8 px-4 space-y-6">
          <div className="px-4 mb-4">
            <p className="font-serif text-[10px] tracking-wider text-zinc-500 uppercase">Painel Admin</p>
          </div>
        <nav className="flex-1 space-y-2">
          {[
            { name: 'Dashboard', label: 'Painel' },
            { name: 'Categories', label: 'Categorias' },
            { name: 'Products', label: 'Produtos' },
            { name: 'Orders', label: 'Pedidos' },
            { name: 'Terms', label: 'Termos' },
            { name: 'CareGuide', label: 'Guia de Cuidados' }
          ].map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveSection(item.name as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-serif text-sm tracking-wider transition-colors cursor-pointer ${item.name === activeSection ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-200'}`}
            >
              <div className="w-5 h-5 bg-current opacity-20 rounded-full" />
              {item.label}
            </button>
          ))}
          </nav>

          <div className="pt-8 mt-auto border-t border-zinc-200">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 font-serif text-sm tracking-wider text-error hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 opacity-70" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="ml-64 flex-1">
        <header className="h-24 flex items-center justify-between px-16 bg-white/[0.98] backdrop-blur-xl border-b border-white/80 shadow-[0_12px_40px_rgba(24,24,27,0.08)] supports-[backdrop-filter]:bg-white/[0.94] sticky top-0 z-20">
          <div>
            <h2 className="text-headline-sm uppercase tracking-widest text-xl">
              {activeSection === 'Dashboard' && 'Visão Geral'}
              {activeSection === 'Categories' && 'Categorias'}
              {activeSection === 'Products' && 'Catálogo de Produtos'}
              {activeSection === 'Orders' && 'Pedidos'}
              {activeSection === 'Terms' && 'Termos de Uso'}
              {activeSection === 'CareGuide' && 'Guia de Cuidados'}
            </h2>
            <p className="text-[10px] font-label-caps text-zinc-400">
              {activeSection === 'Categories' ? 'FILTRE E ACOMPANHE SUA CURADORIA' : 'GERENCIE SUA COLEÇÃO DE LUXO'}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {activeSection === 'Products' && (
              <button
                onClick={() => {
                  setProductFeedback('');
                  resetProductForm();
                  setShowAddModal(true);
                }}
                className="bg-primary text-on-primary font-label-caps px-8 py-3 text-[10px] tracking-[0.2em] hover:opacity-90 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                NOVO PRODUTO
              </button>
            )}
            {activeSection === 'Categories' && (
              <button
                onClick={() => {
                  setEditingCategorySlug(null);
                  setNewCategory({ name: '', slug: '', active: true });
                  setCategoryFeedback('');
                  setCategoryError('');
                  setShowAddCategoryModal(true);
                }}
                className="bg-primary text-on-primary font-label-caps px-8 py-3 text-[10px] tracking-[0.2em] hover:opacity-90 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                NOVA CATEGORIA
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-16">
          {renderAdminContent()}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmModal && deleteConfirmData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md p-12 shadow-2xl"
            >
              <h3 className="text-headline-md uppercase tracking-widest mb-6">
                Confirmar exclusão
              </h3>
              <p className="font-serif text-base text-zinc-700 mb-8 leading-relaxed">
                {deleteConfirmData.type === 'product'
                  ? `Tem a certeza que deseja excluir o produto "${deleteConfirmData.item.title}"? Esta ação não pode ser desfeita.`
                  : `Tem a certeza que deseja excluir a categoria "${deleteConfirmData.item.name}"? Esta ação não pode ser desfeita.`}
              </p>
              <div className="pt-8 flex justify-end gap-6">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="font-label-caps text-zinc-400 hover:text-black transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowDeleteConfirmModal(false);
                    if (deleteConfirmData.callback) {
                      await deleteConfirmData.callback();
                    }
                    setDeleteConfirmData(null);
                  }}
                  className="bg-error text-white px-12 py-4 font-label-caps tracking-widest hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Confirmar exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => {
              setShowAddModal(false);
              resetProductForm();
            }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-2xl p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-headline-md uppercase tracking-widest mb-8">
                {editingProductId !== null ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-label-caps text-[10px] text-zinc-400">Título</label>
                    <input required type="text" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-label-caps text-[10px] text-zinc-400">Categoria</label>
                    <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif bg-transparent">
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-label-caps text-[10px] text-zinc-400">Coleção</label>
                    <input type="text" value={newProduct.collection} onChange={e => setNewProduct({ ...newProduct, collection: e.target.value })} className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-label-caps text-[10px] text-zinc-400">Preço</label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: formatPriceInput(e.target.value) })}
                      placeholder="R$ 0,00"
                      className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-label-caps text-[10px] text-zinc-400">Referência (REF)</label>
                    <input required type="text" value={newProduct.ref} onChange={e => setNewProduct({ ...newProduct, ref: e.target.value })} placeholder="Ex.: AUR-0045" className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-label-caps text-[10px] text-zinc-400">Status</label>
                    <select value={newProduct.status} onChange={e => setNewProduct({ ...newProduct, status: e.target.value })} className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif bg-transparent">
                      <option value="EM ESTOQUE">Em Estoque</option>
                      <option value="BAIXO ESTOQUE">Baixo Estoque</option>
                      <option value="ESGOTADO">Esgotado</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-label-caps text-[10px] text-zinc-400">Material (Para Filtro)</label>
                    <select value={newProduct.material} onChange={e => setNewProduct({ ...newProduct, material: e.target.value as any })} className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif bg-transparent">
                      <option value="Semi-joia">Semi-joia</option>
                      <option value="Prata">Prata</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label-caps text-[10px] text-zinc-400">Descrição do Produto</label>
                    <button 
                      type="button"
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 text-[9px] font-label-caps text-primary hover:text-zinc-900 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {isAnalyzing ? 'ANALISANDO...' : 'GERAR COM IA'}
                    </button>
                  </div>
                  <textarea 
                    rows={3}
                    value={newProduct.description} 
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} 
                    placeholder="Descreva os detalhes e o estilo da peça..."
                    className="border border-zinc-200 focus:border-black outline-none px-4 py-3 font-serif text-sm resize-none"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label-caps text-[10px] text-zinc-400">Composição e Materiais</label>
                  <textarea 
                    rows={2}
                    value={newProduct.composition} 
                    onChange={e => setNewProduct({ ...newProduct, composition: e.target.value })} 
                    placeholder="Ex: Prata 950 com acabamento polido..."
                    className="border border-zinc-200 focus:border-black outline-none px-4 py-3 font-serif text-sm resize-none"
                  />
                </div>
                <div className="flex flex-col space-y-3">
                  <label className="font-label-caps text-[10px] text-zinc-400">Imagem do produto</label>
                  <div className="grid grid-cols-[120px_1fr] gap-4 items-stretch">
                    <div className="w-[120px] aspect-square bg-zinc-50 border border-zinc-200 overflow-hidden flex items-center justify-center">
                      {(imagePreviewUrl || newProduct.img) ? (
                        <img
                          src={imagePreviewUrl || newProduct.img}
                          alt={newProduct.title || 'Prévia do produto'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="w-8 h-8 text-zinc-300" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      <label className="self-start bg-zinc-900 text-white px-5 py-3 font-label-caps text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-colors cursor-pointer">
                        Selecionar imagem
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            setImageFile(file);
                            setImageCopyFeedback('');
                            if (file) {
                              setNewProduct({ ...newProduct, img: `/uploads/${normalizeUploadFileName(file.name)}` });
                            }
                          }}
                          className="sr-only"
                        />
                      </label>
                      <div className="text-xs text-zinc-500 font-serif break-all min-h-5">
                        {imageFile ? imageFile.name : newProduct.img || 'Nenhuma imagem selecionada'}
                      </div>
                      {newProduct.img && (
                        <div className="text-[11px] text-zinc-400 font-serif break-all">
                          {newProduct.img}
                        </div>
                      )}
                      <p className="text-xs text-zinc-500">A imagem será salva em public/uploads junto com o cadastro ao clicar em salvar.</p>
                      {imageCopyFeedback && (
                        <p className="text-xs text-green-700">{imageCopyFeedback}</p>
                      )}
                    </div>
                  </div>
                </div>
                {productError && (
                  <p className="text-sm text-red-600">{productError}</p>
                )}
                <div className="pt-8 flex justify-end gap-6">
                  <button type="button" onClick={() => {
                    setShowAddModal(false);
                    resetProductForm();
                  }} className="font-label-caps text-zinc-400 hover:text-black cursor-pointer">Cancelar</button>
                  <button type="submit" disabled={isSavingProduct} className="bg-black text-white px-12 py-4 font-label-caps tracking-widest hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSavingProduct ? 'Salvando...' : editingProductId !== null ? 'Salvar Alteracoes' : 'Salvar Produto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => {
              setShowAddCategoryModal(false);
              setEditingCategorySlug(null);
              setCategoryError('');
            }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-xl p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-headline-md uppercase tracking-widest mb-8">
                {editingCategorySlug ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}
              </h3>
              <form onSubmit={handleCategorySubmit} className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="font-label-caps text-[10px] text-zinc-400">Nome</label>
                  <input required type="text" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif" />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label-caps text-[10px] text-zinc-400">Slug</label>
                  <input type="text" value={newCategory.slug} onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })} placeholder="Opcional. Ex.: braceletes" className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif" />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label-caps text-[10px] text-zinc-400">Status</label>
                  <select value={newCategory.active === false ? 'false' : 'true'} onChange={e => setNewCategory({ ...newCategory, active: e.target.value === 'true' })} className="border-b border-zinc-200 focus:border-black outline-none px-0 py-2 font-serif bg-transparent">
                    <option value="true">Ativa</option>
                    <option value="false">Inativa</option>
                  </select>
                </div>
                {categoryError && (
                  <p className="text-sm text-red-600">{categoryError}</p>
                )}
                <div className="pt-8 flex justify-end gap-6">
                  <button type="button" onClick={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategorySlug(null);
                    setCategoryError('');
                  }} className="font-label-caps text-zinc-400 hover:text-black cursor-pointer">Cancelar</button>
                  <button type="submit" disabled={isSavingCategory} className="bg-black text-white px-12 py-4 font-label-caps tracking-widest hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSavingCategory ? 'Salvando...' : editingCategorySlug ? 'Salvar Alteracoes' : 'Salvar Categoria'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
