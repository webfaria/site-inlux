import { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ProductCard } from '../components/common/ProductCard';
import { Category, Product } from '../types';

interface CatalogProps {
  products: Product[];
  categories: Category[];
}

export const Catalog = ({ products, categories }: CatalogProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get('q');
  const isFavoritesOnly = searchParams.get('favorites') === 'true';
  const selectedCategory = searchParams.get('category') || '';
  const activeCategories = useMemo(() => categories.filter((category) => category.active !== false), [categories]);
  
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    if (isFavoritesOnly) {
      const saved = JSON.parse(localStorage.getItem('inlux_favorites') || '[]');
      setFavoriteIds(saved);
    }
  }, [isFavoritesOnly, location.key]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Filter
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.description || '').toLowerCase().includes(q) ||
        (p.composition || '').toLowerCase().includes(q)
      );
    }

    // Favorites Filter
    if (isFavoritesOnly) {
      result = result.filter(p => favoriteIds.includes(p.id));
    }

    // Category Filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Material Filter
    if (selectedMaterials.length > 0) {
      result = result.filter(product => {
        if (!product.material) return false;
        return selectedMaterials.some(material => {
          if (material === 'Prata') return product.material === 'Prata';
          if (material === 'Semi-joias') return product.material === 'Semi-joia';
          return false;
        });
      });
    }

    return result;
  }, [products, query, isFavoritesOnly, favoriteIds, selectedCategory, selectedMaterials]);

  const updateCategoryFilter = (category: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (category) {
      nextParams.set('category', category);
    } else {
      nextParams.delete('category');
    }

    setSearchParams(nextParams);
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material) 
        : [...prev, material]
    );
  };

  const title = isFavoritesOnly ? 'Meus Favoritos' : query ? `Busca: ${query}` : 'Catálogo';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-24 max-w-[1440px] mx-auto px-4 md:px-16"
    >
      <header className="mb-16 text-center">
        <h1 className="text-display-lg uppercase tracking-[0.2em] mb-4">{title}</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          {isFavoritesOnly 
            ? 'Suas peças selecionadas com o coração, prontas para iluminar seu estilo.' 
            : 'Explore nossa coleção completa de luxo atemporal.'}
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-12">
          <section>
            <h3 className="font-label-caps mb-6">Categoria</h3>
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => updateCategoryFilter('')}
                className={`text-left font-serif text-body-md transition-colors cursor-pointer ${!selectedCategory ? 'text-zinc-900 font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Todas
              </button>
              {activeCategories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => updateCategoryFilter(category.slug)}
                  className={`text-left font-serif text-body-md transition-colors cursor-pointer ${selectedCategory === category.slug ? 'text-zinc-900 font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-label-caps mb-6">Material</h3>
            <div className="flex flex-col space-y-4">
              {['Prata', 'Semi-joias'].map((label) => (
                <label key={label} className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedMaterials.includes(label)}
                    onChange={() => toggleMaterial(label)}
                    className="w-4 h-4 rounded-none border-zinc-300 text-black focus:ring-0 cursor-pointer" 
                  />
                  <span className={`ml-3 text-body-md transition-colors ${selectedMaterials.includes(label) ? 'text-zinc-900 font-medium' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} textAlign="left" />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-zinc-400 font-serif italic text-lg">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
