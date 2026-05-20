import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { careGuideService } from '../services/api';

export const CareGuide = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = careGuideService.subscribe(
      (data) => {
        setContent(data.content);
        setLoading(false);
      },
      (error) => {
        console.error('Falha ao carregar guia de cuidados:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center font-serif tracking-widest text-zinc-400 uppercase text-xs">
        Carregando Guia...
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
        <h1 className="text-display-md uppercase tracking-[0.2em] mb-4">Guia de Cuidados</h1>
        <p className="text-[10px] font-label-caps tracking-[0.3em] text-zinc-400">PRESERVANDO A BELEZA DAS SUAS JOIAS</p>
      </header>

      <div className="max-w-none">
        <div 
          className="text-body-md text-zinc-700 care-content"
          dangerouslySetInnerHTML={{ __html: content || 'Nenhum guia definido.' }}
        />
      </div>
      
      <style>{`
        .care-content,
        .care-content p,
        .care-content div,
        .care-content span,
        .care-content li,
        .care-content strong,
        .care-content em {
          font-family: "Manrope", sans-serif !important;
          font-size: 1rem !important;
          line-height: 1.6 !important;
        }
        .care-content h1,
        .care-content h2,
        .care-content h3 {
          color: #18181b;
          font-family: "Noto Serif", serif !important;
          font-weight: 400 !important;
          line-height: 1.3 !important;
        }
        .care-content h1 { font-size: 2rem !important; margin: 0.67em 0; }
        .care-content h2 { font-size: 1.5rem !important; margin: 0.83em 0; }
        .care-content h3 { font-size: 1.25rem !important; margin: 1em 0; }
        .care-content p { margin: 1em 0; }
        .care-content ul { list-style-type: disc; margin: 1em 0; padding-left: 40px; }
        .care-content li { margin: 0; }
        .care-content strong { font-weight: 700 !important; }
      `}</style>
    </motion.div>
  );
};
