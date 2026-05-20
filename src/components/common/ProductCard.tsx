import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  textAlign?: 'center' | 'left';
}

export const ProductCard = ({ product, textAlign = 'center' }: ProductCardProps) => {
  const isEsgotado = product.status === 'ESGOTADO';
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.img);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('inlux_favorites') || '[]');
    setIsFavorite(favorites.includes(product.id));
  }, [product.id]);

  useEffect(() => {
    setImageSrc(product.img);
    setImageRetryCount(0);
    setHasImageError(false);
  }, [product.img]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem('inlux_favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: number) => id !== product.id);
    } else {
      newFavorites = [...favorites, product.id];
    }
    
    localStorage.setItem('inlux_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };
  
  const CardContent = (
    <>
      <div className="aspect-[3/4] overflow-hidden bg-surface-container mb-6 relative">
        {!hasImageError && imageSrc ? (
          <img 
            src={imageSrc} 
            alt={product.title} 
            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${isEsgotado ? 'opacity-50 grayscale' : ''}`} 
            onError={() => {
              if (product.img.startsWith('/uploads/') && imageRetryCount < 10) {
                const [basePath] = product.img.split('?');
                window.setTimeout(() => {
                  setImageRetryCount((current) => current + 1);
                  setImageSrc(`${basePath}?v=${Date.now()}&retry=${imageRetryCount + 1}`);
                }, 500);
                return;
              }

              setHasImageError(true);
            }}
            referrerPolicy="no-referrer" 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-zinc-400">
            <ImageOff className="w-8 h-8" />
            <span className="text-[10px] font-label-caps tracking-[0.2em] break-all">
              {product.img || 'Sem imagem'}
            </span>
          </div>
        )}
        
        {/* Favorite Button */}
        {!isEsgotado && (
          <button 
            onClick={toggleFavorite}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors cursor-pointer group/heart shadow-sm"
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart 
              className={`w-4 h-4 transition-all ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-zinc-400 group-hover/heart:text-red-400'}`} 
            />
          </button>
        )}

        {product.tag && !isEsgotado && (
          <div className="absolute top-4 left-4">
            <span className="bg-zinc-900 text-white font-label-caps text-[10px] px-3 py-1">{product.tag}</span>
          </div>
        )}
        {isEsgotado && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-white/90 text-black font-label-caps text-[10px] px-4 py-2 uppercase tracking-widest">Esgotado</span>
          </div>
        )}
      </div>
      <h3 className={`font-serif text-sm tracking-[0.15em] uppercase text-zinc-900 group-hover:text-zinc-600 transition-colors ${textAlign === 'center' ? 'text-center' : 'text-left'}`}>
        {product.title}
      </h3>
      {textAlign === 'left' && product.collection && (
        <p className="text-body-md text-on-surface-variant mt-1 text-left">{product.collection}</p>
      )}
    </>
  );

  if (isEsgotado) {
    return (
      <div className={`group opacity-80 cursor-default ${textAlign === 'center' ? 'text-center' : 'text-left'}`}>
        {CardContent}
      </div>
    );
  }

  return (
    <Link 
      to={`/product/${product.id}`} 
      className={`group cursor-pointer ${textAlign === 'center' ? 'text-center' : 'text-left'}`}
    >
      {CardContent}
    </Link>
  );
};
