interface ProductAIAnalysisInput {
  imageFile: File;
  title?: string;
  category?: string;
  material?: string;
}

export interface ProductAIAnalysis {
  title: string;
  description: string;
  composition: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error('Nao foi possivel ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });

const parseGeminiJson = (text: string): ProductAIAnalysis => {
  const cleanedText = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleanedText);

  if (
    typeof parsed.title !== 'string' ||
    typeof parsed.description !== 'string' ||
    typeof parsed.composition !== 'string'
  ) {
    throw new Error('A IA retornou uma resposta fora do formato esperado.');
  }

  return {
    title: parsed.title.trim(),
    description: parsed.description.trim(),
    composition: parsed.composition.trim(),
  };
};

export const analyzeProductImage = async ({
  imageFile,
  title,
  category,
  material,
}: ProductAIAnalysisInput): Promise<ProductAIAnalysis> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Configure GEMINI_API_KEY no arquivo .env para ativar a geração com IA.');
  }

  if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('A imagem precisa ter ate 8 MB para ser analisada pela IA.');
  }

  const imageBase64 = await readFileAsBase64(imageFile);
  const context = [
    title?.trim() ? `Titulo informado: ${title.trim()}` : '',
    category?.trim() ? `Categoria: ${category.trim()}` : '',
    material?.trim() ? `Material selecionado no cadastro: ${material.trim()}` : '',
  ].filter(Boolean).join('\n');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: imageFile.type || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              text: `Analise a imagem de uma joia/semi-joia para cadastro em ecommerce de luxo.
${context}

Gere somente JSON valido, sem markdown, neste formato:
{
  "title": "titulo curto do produto em portugues do Brasil, com ate 5 palavras, sem codigo de referencia",
  "description": "descricao comercial em portugues do Brasil, elegante, objetiva, com 2 a 3 frases",
  "composition": "composicao e materiais provaveis em portugues do Brasil, sem afirmar pureza/quilatagem se nao for visivel, com 2 a 3 frases"
}

O titulo deve ser especifico para o tipo de peca vista na imagem, por exemplo "Brincos Dourados Organicos", "Anel Prata Minimalista" ou "Colar Delicado Perolado".
Evite inventar marca, pedras preciosas, banho, quilates ou garantia quando nao houver evidencia visual. Use termos como "aparenta", "acabamento de aspecto" e "estrutura de aspecto metalico" quando a informacao vier apenas da imagem.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Nao foi possivel gerar a descricao com IA.';
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('A IA nao retornou texto para esta imagem.');
  }

  return parseGeminiJson(text);
};
