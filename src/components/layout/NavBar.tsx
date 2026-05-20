import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, User, Plus, X } from 'lucide-react';
import { Logo } from './Logo';
import { Category } from '../../types';

interface NavBarProps {
  categories: Category[];
}

export const NavBar = ({ categories }: NavBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  if (isAdmin) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-zinc-100 h-24 flex items-center">
      <div className="flex justify-between items-center w-full px-4 md:px-16 max-w-[1440px] mx-auto">
        <div className="flex-1 flex items-center">
          <button
            className="md:hidden mr-4 p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menu"
          >
            <div className="w-6 h-0.5 bg-zinc-900 mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-zinc-900 mb-1.5 transition-all"></div>
            <div className="w-4 h-0.5 bg-zinc-900 transition-all"></div>
          </button>
          <div className="relative h-28 flex items-center -ml-4">
            <Logo className="h-28" />
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-12">
          {!isSearchOpen ? (
            categories.filter(cat => cat.active !== false).map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`font-serif uppercase tracking-[0.15em] text-xs transition-colors duration-300 cursor-pointer ${location.pathname === `/category/${cat.slug}`
                    ? 'text-zinc-900 border-b border-zinc-900 pb-1'
                    : 'text-zinc-400 hover:text-zinc-900'
                  }`}
              >
                {cat.name}
              </Link>
            ))
          ) : (
            <motion.form 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              onSubmit={handleSearch}
              className="flex items-center border-b border-zinc-900 pb-1 w-64"
            >
              <input 
                autoFocus
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUSCAR JOIA..." 
                className="bg-transparent border-none outline-none font-serif text-xs uppercase tracking-widest w-full"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2">
                <X className="w-3 h-3 text-zinc-400" />
              </button>
            </motion.form>
          )}
        </div>

        <div className="flex-1 flex justify-end items-center space-x-6">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:opacity-70 transition-opacity cursor-pointer p-2" 
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 text-zinc-900" />
          </button>
          <Link 
            to={location.search.includes('favorites=true') ? '/' : '/catalog?favorites=true'}
            className="hidden sm:block hover:opacity-70 transition-opacity cursor-pointer p-2" 
            aria-label="Favoritos"
          >
            <Heart className={`w-5 h-5 ${location.search.includes('favorites=true') ? 'fill-red-500 text-red-500' : 'text-zinc-900'}`} />
          </Link>
          {/* Ícone do carrinho removido */}
          <Link to="/admin" className="hover:opacity-70 transition-opacity cursor-pointer p-2" aria-label="Área Admin"><User className="w-5 h-5 text-zinc-900" /></Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <Logo className="h-16" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 cursor-pointer">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="flex flex-col space-y-8">
                {categories.filter(cat => cat.active !== false).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-serif uppercase tracking-[0.2em] text-lg text-zinc-900 cursor-pointer"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="pt-8 border-t border-zinc-100 flex flex-col space-y-6">
                  <Link to="/care-guide" onClick={() => setIsMobileMenuOpen(false)} className="font-serif uppercase tracking-[0.15em] text-zinc-400 text-sm cursor-pointer">Guia de Cuidados</Link>
                  <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)} className="font-serif uppercase tracking-[0.15em] text-zinc-400 text-sm cursor-pointer">Termos de Uso</Link>
                  <a href="https://wa.me/5535999828600" className="font-serif uppercase tracking-[0.15em] text-zinc-400 text-sm cursor-pointer">Contato</a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
