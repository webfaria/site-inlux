import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';

interface ProductImageCarouselProps {
  products: Product[];
}

const shuffleProducts = (products: Product[]) => {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

export const ProductImageCarousel = ({ products }: ProductImageCarouselProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);

  const availableProducts = useMemo(
    () => products.filter((product) => product.img && product.status !== 'ESGOTADO'),
    [products]
  );

  useEffect(() => {
    setRandomProducts(shuffleProducts(availableProducts).slice(0, 10));
  }, [availableProducts]);

  if (randomProducts.length < 3) return null;

  const carouselProducts = [...randomProducts, ...randomProducts];

  return (
    <section className="pb-20 bg-background overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="font-label-caps text-on-tertiary-container mb-4 block">Vitrine INLUX</span>
            <h2 className="text-headline-sm text-on-surface uppercase tracking-[0.12em]">Destaques da Coleção</h2>
          </div>
          <Link to="/catalog" className="font-label-caps text-[10px] tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors">
            Ver catálogo
          </Link>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
        >
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />

          <div className={`flex w-max gap-5 ${isPaused ? '' : 'animate-[carousel-scroll_42s_linear_infinite]'}`}>
            {carouselProducts.map((product, index) => (
              <Link
                key={`${product.id}-${index}`}
                to={`/product/${product.id}`}
                className="group block w-[160px] shrink-0 sm:w-[180px] md:w-[210px]"
              >
                <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="mt-3 font-serif text-[11px] uppercase tracking-[0.14em] text-zinc-900 line-clamp-2">
                  {product.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
