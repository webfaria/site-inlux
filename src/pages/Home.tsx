import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { ProductImageCarousel } from '../components/common/ProductImageCarousel';
import { Product } from '../types';

interface HomeProps {
  products: Product[];
}

export const Home = ({ products }: HomeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-joias-inlux.png"
            alt="Mulher usando colares, brincos e anéis Inlux"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80 mb-4 font-light">Coleção Premium INLUX</p>
          <h1 className="text-display-lg text-white mb-8 uppercase tracking-[0.2em] font-light">Brilho que Perdura</h1>
          <p className="text-lg text-white/95 mb-12 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">Cada peça é uma celebração da sofisticação. Prata pura, design atemporal e qualidade impecável. Inlux: onde a elegância transcende as tendências.</p>
          <a href="#mais-visualizados" className="inline-block px-12 py-4 bg-white text-primary font-label-caps uppercase tracking-[0.2em] hover:bg-zinc-100 transition-colors cursor-pointer">
            Descubra Agora
          </a>
        </div>
      </section>

      {/* Most Viewed */}
      <section id="mais-visualizados" className="scroll-mt-24 py-[120px] bg-background">
        <div className="max-w-[1440px] mx-auto px-16">
          <div className="flex flex-col items-center mb-24 text-center">
            <span className="font-label-caps text-on-tertiary-container mb-4">Seleção Curada</span>
            <h2 className="text-headline-md text-on-surface uppercase tracking-[0.1em]">Mais Visualizados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...products]
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      </section>

      <ProductImageCarousel products={products} />

      {/* Editorial */}
      <section className="py-[120px] bg-surface-container-low overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-16 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="aspect-[4/5] bg-zinc-200">
              <img src="/pulseira-bicolor.jpg" alt="Pulseira Bicolor Inlux" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-12 -right-12 w-2/3 aspect-square bg-zinc-300 border-[12px] border-surface-container-low hidden lg:block overflow-hidden">
              <img src="/anel-dourado.jpg" alt="Anel Dourado Inlux" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-8">
            <span className="font-label-caps text-secondary uppercase">Luxo Discreto</span>
            <h2 className="text-display-lg leading-tight uppercase tracking-widest">Feito para os Exigentes</h2>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Cada peça da coleção Inlux é fruto de um processo artesanal meticuloso. Utilizamos exclusivamente materiais certificados, garantindo que sua joia não seja apenas um acessório, mas um legado de sofisticação e sustentabilidade.
            </p>
            <div className="pt-4">
              <Link to="/heritage" className="font-label-caps uppercase tracking-[0.2em] border-b border-primary pb-2 hover:opacity-60 transition-opacity cursor-pointer">Descubra a Tradição</Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
