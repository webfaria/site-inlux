/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

// Layout & Components
import { NavBar } from './components/layout/NavBar';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloat } from './components/common/WhatsAppFloat';

// Pages
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { ProductDetail } from './pages/ProductDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { Catalog } from './pages/Catalog';
import { Terms } from './pages/Terms';
import { CareGuide } from './pages/CareGuide';
import { AdminLogin } from './pages/AdminLogin';

// Hooks & Services
import { useProducts } from './hooks/useProducts';
import { useAuth } from './hooks/useAuth';


const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    loading
  } = useProducts();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const displayProducts = products;

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-serif tracking-widest text-zinc-400 uppercase text-xs">
        Carregando Experiência...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar categories={categories} />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home products={displayProducts} />} />
            <Route path="/category/:slug" element={<Category products={displayProducts} categories={categories} />} />
            <Route path="/catalog" element={<Catalog products={displayProducts} categories={categories} />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/care-guide" element={<CareGuide />} />
            <Route path="/product/:id" element={<ProductDetail products={displayProducts} />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard 
                    products={products} 
                    categories={categories}
                    onAdd={addProduct}
                    onUpdate={updateProduct}
                    onDelete={deleteProduct}
                    onAddCategory={addCategory}
                    onUpdateCategory={updateCategory}
                    onDeleteCategory={deleteCategory}
                  />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
