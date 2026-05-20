import { useEffect, useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/api';

interface ProductDetailProps {
  products: Product[];
}

export const ProductDetail = ({ products }: ProductDetailProps) => {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (id) {
      productService.registerView(Number(id)).catch(console.error);
    }
  }, [id]);

  const handleImageMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <p className="text-zinc-400 font-serif italic text-lg">Produto não encontrado.</p>
        <Link to="/" className="mt-8 inline-block px-12 py-4 bg-zinc-900 text-white font-label-caps uppercase tracking-[0.2em] cursor-pointer">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-24 px-4 md:px-16 max-w-[1440px] mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 flex gap-6 flex-col md:flex-row">
          <div className="hidden md:flex flex-col gap-4 w-20 shrink-0">
            {[product.img, product.img, product.img].map((s, i) => (
              <div key={i} className={`aspect-[3/4] bg-surface-container overflow-hidden cursor-pointer border ${i === 0 ? 'border-zinc-900' : 'hover:opacity-80 transition-opacity'}`}>
                <img src={s} alt="Th" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <div className="flex-1">
            <div
              className="group relative aspect-[4/5] bg-surface-container overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleImageMouseMove}
            >
              <img
                src={product.img}
                alt={product.title}
                className="w-full h-full object-cover transition-opacity duration-200 lg:group-hover:opacity-0"
                referrerPolicy="no-referrer"
              />
              <div
                className={`pointer-events-none absolute inset-0 hidden bg-no-repeat lg:block transition-opacity duration-200 ${isZooming ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  backgroundImage: `url(${product.img})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '220%',
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-5 sticky top-40 h-fit space-y-12">
          <div>
            <p className="font-label-caps text-on-tertiary-container mb-4">{product.collection}</p>
            <h1 className="text-display-lg text-primary mb-6">{product.title}</h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              {product.description || 'Uma peça de expressão minimalista inspirada no movimento orgânico da água e na luz. Forjada com acabamento meticuloso, captura a essência da quiet luxury.'}
            </p>
          </div>

          <div className="space-y-8 pt-8 border-t border-zinc-200">
            <div>
              <h3 className="font-label-caps mb-3">Preço</h3>
              <p className="text-2xl font-serif text-zinc-900">{product.price}</p>
            </div>
            <div>
              <h3 className="font-label-caps mb-3">Composição</h3>
              <p className="text-body-md text-on-surface-variant italic">
                {product.composition || 'Joia de alta qualidade com acabamento polido espelhado. Isento de níquel.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {product.status === 'ESGOTADO' ? (
              <button
                disabled
                className="w-full py-6 bg-zinc-200 text-zinc-500 font-label-caps uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed"
              >
                Produto Esgotado
              </button>
            ) : (
              <button
                onClick={() => window.open(`https://wa.me/5535999828600?text=Olá, gostaria de saber mais sobre o produto: ${product.title}`, '_blank')}
                className="w-full py-6 bg-zinc-900 text-white font-label-caps uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-transform duration-200 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Solicitar via WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
