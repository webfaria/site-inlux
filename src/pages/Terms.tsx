import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { termsService } from '../services/api';

export const Terms = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = termsService.subscribe(
      (data) => {
        setContent(data.content);
        setLoading(false);
      },
      (error) => {
        console.error('Falha ao carregar termos de uso:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center font-serif tracking-widest text-zinc-400 uppercase text-xs">
        Carregando Termos...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-24 max-w-[800px] mx-auto px-8"
    >
      <header className="mb-24 text-center">
        <h1 className="text-display-md uppercase tracking-[0.2em] mb-4">Termos de Uso</h1>
        <p className="text-[10px] font-label-caps tracking-[0.3em] text-zinc-400">INLUX SEMIJÓIAS & PRATAS</p>
      </header>

      <div className="max-w-none">
        <div 
          className="text-body-md text-zinc-700 terms-content"
          dangerouslySetInnerHTML={{ __html: content || 'Nenhum termo definido.' }}
        />
      </div>
      
      <style>{`
        .terms-content,
        .terms-content p,
        .terms-content div,
        .terms-content span,
        .terms-content li,
        .terms-content strong,
        .terms-content em {
          font-family: "Manrope", sans-serif !important;
          font-size: 1rem !important;
          line-height: 1.6 !important;
        }
        .terms-content h1,
        .terms-content h2,
        .terms-content h3 {
          color: #18181b;
          font-family: "Noto Serif", serif !important;
          font-weight: 400 !important;
          line-height: 1.3 !important;
        }
        .terms-content h1 { font-size: 2rem !important; margin: 0.67em 0; }
        .terms-content h2 { font-size: 1.5rem !important; margin: 0.83em 0; }
        .terms-content h3 { font-size: 1.25rem !important; margin: 1em 0; }
        .terms-content p { margin: 1em 0; }
        .terms-content ul { list-style-type: disc; margin: 1em 0; padding-left: 40px; }
        .terms-content li { margin: 0; }
        .terms-content strong { font-weight: 700 !important; }
      `}</style>
    </motion.div>
  );
};
