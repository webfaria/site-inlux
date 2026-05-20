import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { Product, Category as CategoryType } from '../types';
import { formatCategoryName } from '../utils/formatters';

interface CategoryProps {
  products: Product[];
  categories: CategoryType[];
}

export const Category = ({ products, categories }: CategoryProps) => {
  const { slug } = useParams();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const activeCategory = categories.find((category) => category.slug === slug && category.active !== false);
  const categoryName = activeCategory?.name || (slug ? formatCategoryName(slug) : '');

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];

    let result = products.filter(p => p.category === slug);

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
  }, [products, slug, selectedMaterials, activeCategory]);

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material) 
        : [...prev, material]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-24 max-w-[1440px] mx-auto px-4 md:px-16"
    >
      <header className="mb-16 text-center">
        <h1 className="text-display-lg uppercase tracking-[0.2em] mb-4">{categoryName}</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">Uma curadoria meticulosa de peças em prata e ouro, desenhadas para elevar a essência do luxo discreto.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-12">
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
              <p className="text-zinc-400 font-serif italic text-lg">Nenhum produto encontrado nesta categoria.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="mt-24 flex justify-center items-center space-x-8">
              <button className="font-label-caps text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer">Anterior</button>
              <div className="flex space-x-4">
                <span className="font-label-caps text-zinc-900 border-b border-zinc-900">01</span>
              </div>
              <button className="font-label-caps text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer">Próximo</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
