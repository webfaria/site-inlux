# Deploy INLUX com Hostinger + Firebase

## Arquitetura

- Hostinger: recebe apenas o front-end React buildado (`dist/`).
- Firebase Authentication: login do painel administrativo.
- Cloud Firestore: produtos, categorias, termos e guia de cuidados.
- Imagens dos produtos: arquivos estaticos em `public/uploads`, publicados junto com o front-end.

## 1. Criar projeto no Firebase

1. Acesse o Firebase Console.
2. Crie um projeto.
3. Adicione um app Web.
4. Copie as configurações do SDK para o arquivo `.env`.

Crie um arquivo `.env` baseado no `.env.example`:

```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_FIREBASE_ADMIN_EMAIL="admin@seudominio.com.br"
```

## 2. Ativar Authentication

1. Firebase Console > Authentication > Sign-in method.
2. Ative `Email/password`.
3. Em Users, crie o usuário administrador com o e-mail configurado em `VITE_FIREBASE_ADMIN_EMAIL`.
4. A senha desse usuário será a senha usada na tela de admin do site.

## 3. Ativar Firestore

Crie o banco Cloud Firestore em modo produção.

Cole estas regras iniciais em Firestore Rules:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /categories/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /siteContent/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 4. Imagens dos produtos

Como Firebase Storage nao esta sendo usado, as imagens dos produtos ficam como arquivos estaticos em `public/uploads`.

Durante o desenvolvimento local com `npm run dev`, o painel administrativo salva a imagem selecionada automaticamente em `public/uploads` e grava no Firestore o caminho no formato:

```txt
/uploads/nome-da-imagem.jpg
```

Ao trocar a imagem de um produto, o arquivo anterior em `public/uploads` e `dist/uploads` e removido localmente quando nao estiver sendo usado por outro produto.

Antes de publicar na Hostinger, rode `npm run build`. O Vite copia `public/uploads` para `dist/uploads`. Depois envie todo o conteudo da pasta `dist/`.

Observacao: na Hostinger, o site publicado e estatico. O navegador nao consegue gravar novos arquivos diretamente no servidor. Para cadastrar produtos com novas imagens sem Firebase Storage/backend, faça o cadastro localmente, gere o build e publique novamente.

## 5. Rodar localmente

```bash
npm install
npm run dev
```

## 6. Gerar build para Hostinger

```bash
npm run build
```

Depois envie todo o conteúdo da pasta `dist/` para `public_html/` na Hostinger.

## Observações importantes

- Não envie o arquivo `.env` para o GitHub.
- As chaves `VITE_FIREBASE_*` são públicas do app Web. A segurança real fica nas regras do Firestore.
- O projeto não precisa mais do `server.js` para rodar na Hostinger.
