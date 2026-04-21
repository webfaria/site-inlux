/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Share2, Copy, Globe, ShieldCheck, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// --- Components ---

const Logo = ({ className = "" }: { className?: string }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to="/" className={`flex items-start ${className}`}>
      {!imgError ? (
        <img 
          src="/logo.png" 
          alt="INLUX SEMIJOIAS & PRATAS" 
          className="h-16 w-auto object-contain" 
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex flex-col items-center leading-none group w-fit">
          <span className="text-3xl font-light tracking-[0.15em] text-zinc-900 uppercase group-hover:text-zinc-600 transition-colors">INLUX</span>
          <div className="w-full flex justify-between text-[7px] font-serif uppercase text-zinc-400 mt-1.5 px-[0.1em]">
            {"SEMIJOIAS & PRATAS".split("").map((char, i) => (
              <span key={i}>{char === " " ? "\u00A0" : char}</span>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
};

const NavBar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isAdmin) return null;

  const categories = [
    { name: 'Brincos', path: '/category/brincos' },
    { name: 'Pulseiras', path: '/category/pulseiras' },
    { name: 'Colares', path: '/category/colares' },
    { name: 'Anéis', path: '/category/aneis' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-zinc-100 h-24 flex items-center">
      <div className="flex justify-between items-center w-full px-4 md:px-16 max-w-[1440px] mx-auto">
        <div className="flex-1 flex items-center">
          <button 
            className="md:hidden mr-4 p-2 hover:bg-zinc-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menu"
          >
            <div className="w-6 h-0.5 bg-zinc-900 mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-zinc-900 mb-1.5 transition-all"></div>
            <div className="w-4 h-0.5 bg-zinc-900 transition-all"></div>
          </button>
          <Logo />
        </div>
        <div className="hidden md:flex items-center space-x-12">
          {categories.map((cat) => (
            <Link 
              key={cat.path}
              to={cat.path} 
              className={`font-serif uppercase tracking-[0.15em] text-xs transition-colors duration-300 ${
                location.pathname === cat.path 
                ? 'text-zinc-900 border-b border-zinc-900 pb-1' 
                : 'text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <div className="flex-1 flex justify-end items-center space-x-6">
          <button className="hover:opacity-70 transition-opacity" aria-label="Buscar"><Search className="w-5 h-5 text-zinc-900" /></button>
          <button className="hidden sm:block hover:opacity-70 transition-opacity" aria-label="Favoritos"><Heart className="w-5 h-5 text-zinc-900" /></button>
          <button className="hover:opacity-70 transition-opacity" aria-label="Carrinho"><ShoppingBag className="w-5 h-5 text-zinc-900" /></button>
          <Link to="/admin" className="hover:opacity-70 transition-opacity" aria-label="Área Admin"><User className="w-5 h-5 text-zinc-900" /></Link>
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
                <Logo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="flex flex-col space-y-8">
                {categories.map((cat) => (
                  <Link 
                    key={cat.path}
                    to={cat.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-serif uppercase tracking-[0.2em] text-lg text-zinc-900"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="pt-8 border-t border-zinc-100 flex flex-col space-y-6">
                  <a href="#" className="font-serif uppercase tracking-[0.15em] text-zinc-400 text-sm">Herança</a>
                  <a href="#" className="font-serif uppercase tracking-[0.15em] text-zinc-400 text-sm">Sustentabilidade</a>
                  <a href="https://wa.me/5500000000000" className="font-serif uppercase tracking-[0.15em] text-zinc-400 text-sm">Contato</a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200">
      <div className="w-full px-16 py-24 grid grid-cols-1 md:grid-cols-3 gap-12 items-start max-w-[1440px] mx-auto">
        <div>
          <Logo className="mb-6" />
          <p className="font-serif uppercase text-[10px] tracking-[0.2em] text-zinc-400">Joias finas para almas exigentes.</p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4">
            <a href="#" className="font-serif uppercase text-[10px] tracking-[0.2em] text-zinc-400 hover:text-zinc-600 underline-offset-4 transition-colors">Herança</a>
            <a href="#" className="font-serif uppercase text-[10px] tracking-[0.2em] text-zinc-400 hover:text-zinc-600 underline-offset-4 transition-colors">Sustentabilidade</a>
          </div>
          <div className="flex flex-col space-x-4">
            <a 
              href="https://wa.me/5500000000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-serif uppercase text-[10px] tracking-[0.2em] text-zinc-400 hover:text-zinc-600 underline-offset-4 transition-colors"
            >
              Contato
            </a>
          </div>
        </div>
        <div className="md:text-right">
          <p className="font-serif uppercase text-[10px] tracking-[0.2em] text-zinc-400">© 2025 INLUX SEMIJOIAS & PRATAS. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Pages ---

const Home = () => {
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFSYudhKZTOKG_xtt9BNIV8-dkOOQDtRGS0VHw7WH8av64ftglcFOpF_ZkHsrU2KWZ0lSz43A7N9myYFfqjegPeTcXfVGt4SnftKVBwI7F_NaPtOhn98xHGTEY8HnxNedH4c3fq6kbtnkc2LVVw5qVTFcaF-U9iEA-37nuR6fWGcL_TZHeQz503J-fGpYRn1ToNb_cf-D5iSzMsbMu6bGwSTteFdkYpdWTDsR94z3GopjgGRpPZALtHnn5ylERRIT819zhcFceLBhj" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-8">
          <h1 className="text-display-lg text-white mb-6 uppercase tracking-[0.2em]">A Herança de Prata</h1>
          <p className="text-body-lg text-white/90 mb-12 max-w-2xl mx-auto font-light tracking-wide italic">Elegância atemporal esculpida em prata pura para quem busca o extraordinário no simples.</p>
          <Link to="/category/colares" className="inline-block px-12 py-4 bg-white text-primary font-label-caps uppercase tracking-[0.2em] hover:bg-zinc-100 transition-colors">
            Ver Coleção
          </Link>
        </div>
      </section>

      {/* Most Viewed */}
      <section className="py-[120px] bg-background">
        <div className="max-w-[1440px] mx-auto px-16">
          <div className="flex flex-col items-center mb-24 text-center">
            <span className="font-label-caps text-on-tertiary-container mb-4">Seleção Curada</span>
            <h2 className="text-headline-md text-on-surface uppercase tracking-[0.1em]">Mais Visualizados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 1, title: 'Anel Inlux Horizon', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtDdpn4bclaXzpk8UPno34DsPoDp4tuezTEqBAdEiNDHzXUZLCzFWzEmDMOcBqwPytPwnzL8B22IdfyKuovld2LOMUdL7AkgIQ5H2yAJ1Wc4FsU84jBvURRg_F2WhJCXU1ACCHYPFWEbG6aSRUFpk5GfzUtl20Ua71q9Uck_a-Q1nYHRLLvt0CGQKsdBWxVe8vpwMV6R1WM6kcucLkMg7Dlg0CvOFPvqU1Sbm2CZekYi26d6UhK5EwJtkjpNwLpJGs-N4AIMGqGBL7' },
              { id: 2, title: 'Brincos Gota Luna', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJyz-kkF3DBaKCp1pzfu-n5F4ypsWNXkPauSV2usGsQ9Kn5ECyoYGsh-HsJKUJlJkvI2yumcyAvxj_xQo7qhhOJnCYtso41BX6oP9nL9qjTuc7ATNud3JRSYJaM6eHefHUUDZK_UKpxNfgBAL5lDUkgMnsAt3qw6wfQB-evDHH-c3EpUFjrtxR1gX2lSUbW2068J9BHfb29l5AdgXQteuYmuLEzyahEWhkqDBqfcPqUZnM__GVxm6FP5EE7ixGctf-AtGiLymJT4i8' },
              { id: 3, title: 'Colar de Elos Ethereal', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGebwp6ZZJwSlMtvQxAkdGpxefbap6OCG8nHwxxR_cnl0b7d0-2j9EpWd5Eq7DwyLV9FZoDxTUS5sVYAhqdqirMBj3h-eSOaSRvG3v9nzxRN3V13spskIHLCwJtQB4fPR40ICoPwa8oCDtFP3kOKXJTelTbSGgaLlwqn43eVmhZuZ1uh6Ykcsnw9g_StjwNGyGpOMu6fTZx1qeOmshXnjR9hFJhSu2VUMuHvIEAL77XGIs_67xhl6-ydc9qoW7T_yeSsZPt9jmVtR' },
              { id: 4, title: 'Bracelete Rígido Vertex', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARH8n8CORRjQz1mVxywWkJBBJVsaGcUDGyb3sJTbjIThRVYKsRQgLdB-JYDVXl_36sVf7id-PlgSIr6LnwcY6g5Vr9sVX4QROZv7ctFDqwEMSQpHPkjxJ8PkBB4sDcdJIgcNYrJhR0xdSvVdaJU2PJnJC5evgPGUT0N3pEWDqEA6pIEpiljiH-L9nMkfRrRJyDR8XcJgFOCGbIBfbgr-k_ntbsrYmqlSCvpHdBCjLyT22wNs8AyuGTXAnPR1S3KSFo3-DXrs6S4XqC' }
            ].map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer text-center">
                <div className="aspect-[3/4] overflow-hidden bg-surface-container mb-6 relative">
                  <img src={product.img} alt={product.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
                  {product.id === 1 && <div className="absolute top-4 left-4"><span className="bg-zinc-900 text-white font-label-caps text-[10px] px-3 py-1">Novidade</span></div>}
                  {product.id === 4 && <div className="absolute top-4 left-4"><span className="bg-zinc-900 text-white font-label-caps text-[10px] px-3 py-1">Limitado</span></div>}
                </div>
                <h3 className="font-serif text-sm tracking-[0.15em] uppercase text-zinc-900 group-hover:text-zinc-600 transition-colors">{product.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="py-[120px] bg-surface-container-low overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-16 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="aspect-[4/5] bg-zinc-200">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUQK64raPg1edbmysB3fwSNSz02bcln_hNxnE3AsfW6DP5ozOCuEUznuD0QqOZbBVlAUEs1GWi02ya_g3aqzi3Svvu8hNrIoDTn_1Urnu2QWZuM5FjSaqSbN6oZwYEzXE_edx1YCYPzrExUj-SQF8QeP1_H1Vggz63D3lDTm8XRRlkAyJM1pAMI9D2RpqkWU9dMlgZVoGePRFk9EM7gd-uvxoJpHTO5qPFww737p3bycGI5Y6znfQ4jxQMQaKkzCJf48xtwElJ2Lgk" alt="Editorial" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-12 -right-12 w-2/3 aspect-square bg-zinc-300 border-[12px] border-surface-container-low hidden lg:block overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZLfaw69tnji3D77WVs3Mcr90VVhmf6ucWB3WM-PcKYvvhtq5O0YRnvPztkJXIH3oSOCBSkgAvZIIq-ECu7II4gmD874LoUicX6sBKbSPNtyDzcAudqcNgha_g7gie2CRdYGYpA6vI-y_fkvsgDWbtO9RBx6WDC4YDtavgL6LwLsAVoVea7CnMTEj_BAbES-zvOwJoPXls6oUSTQy73S0rGJFINV7RW0VBVi2sVJ58cEd5kmH0imHgbv2OZ7Vf5hOaNar-bw4aw0qP" alt="Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="space-y-8">
            <span className="font-label-caps text-secondary uppercase">Luxo Discreto</span>
            <h2 className="text-display-lg leading-tight uppercase tracking-widest">Feito para os Exigentes</h2>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Cada peça da coleção Inlux é fruto de um processo artesanal meticuloso. Utilizamos exclusivamente materiais certificados, garantindo que sua joia não seja apenas um acessório, mas um legado de sofisticação e sustentabilidade.
            </p>
            <div className="pt-4">
              <Link to="/heritage" className="font-label-caps uppercase tracking-[0.2em] border-b border-primary pb-2 hover:opacity-60 transition-opacity">Descubra a Tradição</Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const Category = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-24 max-w-[1440px] mx-auto px-4 md:px-16"
    >
      <header className="mb-16 text-center">
        <h1 className="text-display-lg uppercase tracking-[0.2em] mb-4">Colares</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">Uma curadoria meticulosa de peças em prata e ouro, desenhadas para elevar a essência do luxo discreto.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-12">
          <section>
            <h3 className="font-label-caps mb-6">Material</h3>
            <div className="flex flex-col space-y-4">
              {['Prata 950', 'Ouro 18k'].map((label) => (
                <label key={label} className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded-none border-zinc-300 text-black focus:ring-0" />
                  <span className="ml-3 text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-label-caps mb-6">Estilo</h3>
            <div className="flex flex-col space-y-4">
              {['Marcante', 'Minimalista', 'Correntes', 'Pingentes'].map((label) => (
                <label key={label} className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded-none border-zinc-300 text-black focus:ring-0" />
                  <span className="ml-3 text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[
              { id: 1, title: 'Colar Elo Fino Prata', collection: 'Coleção Minimalist', tag: 'Novo', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVBzjAqMuu1yT1c6GB_YqWvIXSTxHiOKH4YImMD4Khb2ccdFo2FHycEnrPxu_j4g5wyD0y-vm_Dd4vFchGeAmO6J21oJKxCEiUjcCJpQl7Rr13rB5lF7kfRZk-XDXjut0cHOoGwAUY5EsssFOeC0A4UWFBUn3YiUyF4uSxK9tsN3WIa2Fyqk6yBA5i4beDsWJBou1CoID-PlzG3E9iGMPuG-5CFkCxhp68UU98G_ypevZPrqMBkYJwBFYSo1N9TNR47lm7QhR1JXLq' },
              { id: 2, title: 'Colar Prisma Brutalist', collection: 'Peças Marcantes', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC84aDsdrD1BQRKPURKKFPohLiYjMISJjjG_wHG7_wer1jWCsXLs72dGgeWFJTm7ngZAqf59snuRbYzvbqdqym_G-Gz5LZDvoy6FjpetqXxhSpoWY9PGceL2Mwk_zKT0F9wz3TVM3a32YG79MAtwCSTFV6Twp8fqxkjOJiEkXOKEVI5M9On_rSFKk6P1sgHFFe0Rk3mcY_VE7KXBgjToH_2TVVnp-hcdS03RSrTwuakq04fL57oR0Nc9L_H9aC5mDo7bRz6v9k144RJ' },
              { id: 3, title: 'Colar Pérola Lunar', collection: 'Edição Heritage', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpLxxUF08b8JniMfmvE-pib49ra4HqBD3_s6Im5iy85uGl4ei1Ht0_RPX7Ldgpc7xWP_SbdU1OD-2uP2SX-RAi6HjPCHurkHnAGT685nRSKymNpmyVZr9cPXu2SDqi4o2y35czgGDdhZZm8xn7h1l8xLz9CraxwAhE8mXe82Wn6ihPDOyLjxdVRbeIPaV15a80moETnshxLLi7KeOmVyz-Rpnjz9koGndt7hD5cvlwZgs1HIomK0sZRqCEk-TXyISmJCvtBLEEOYX1' },
              { id: 4, title: 'Corrente Heavy Silver', collection: 'Série Clássica', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDBF6so8IN6WGsqDC6_jKlwPoMoeqBRgOv152LruNQx5owiJjkoGprI8xxyTaYDleLuES8I5gMLIsdSuyw0uNr5Z7s-rksvgZqn-01HIC6zN0JByM2B7hH9X-WKJHg1kik4nYsNaxn8h8Q8FEp2Hr7_bHZHl-cLezLzARezXm3culryH8JjMeLXr1AtmoJx8u00-V1R8e13Tu3SM8-j3rW92V8IEhc0iM5R9349uCeNraHP-jtvGrbb02fn8VKeHYM7gPDkY6z9qQc' },
              { id: 5, title: 'Colar Relicário Prata', collection: 'Alma Vintage', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgjPPE7Q_ykU6zQrVS4V_x0yWG1mrm6Ps--ZQZ03wZtwdVdecjFPwMPAfAcbFJt6hvr3lmu93Jm9lAeYaxaFLwTKKT856NAR4LGxgcOt8aEWT5DcSpytThWKM0Vv4GLtB8_K3xGLTMei6ROnNA_XxsVzR2483VjrSlCLm6ewFrbDAk5jHkCUalbDW_ydhDpoUidlt190ojs35GuafBk3C0CjoCG0I1DTUE8zD3ru491USHBtGtZlRcw3A2m-ZQiOTLgFIgUcasmL13' },
              { id: 6, title: 'Set Colares Layered', collection: 'Moderno Minimalista', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_qqqmSBSX6e2W0NNKp9KtkY_fpNPPjZL5KEQwyULQdAvjw6YqDHhfp_BfA-TdSzEXK0jxybbivIfzQHmRRTQIIFuBaSiIikXrg_cxsrCiIbsKNjFNs_AMFgoS7dP07gr5S_45wzbmKF2DZCTB2erfLCYgzjsgKJIjxImnKSCm6CS_RBME_Glc52Z8koLT2iSTQ5ycjXJJBFMOqqXuRtS95qYv-k_NRshCXLoElla05Gg8EazCpk6yCyNq21jBsjXOPD3TBiaALhYj' },
              { id: 7, title: 'Choker Aura Prata', collection: 'Alta Moda', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXgtB7rxkZfJ_MPTXJHKOA_-Yoh2hz8L_ZjNSNWqRA7lUvp211hKg1brGxjZ2GUA8a5oLUgft_K4TWpADKnr4lY1wLKqJ69RVdZbnlczZf8VQwmrnjQbr1l1hFkbg58g5ns4diwj7TBnYYIDYcnZZ5AxQoDkWKGFK3fiYQkZwbi9TKMqJQl0qEnf--h-uE4MTuIKZOsWQknlU1INMaupEyi4G5HnBvcEX4JWaLWvFuRtHfIabCT7j6LXiY1IM_KUckTpcxXTdvvmeQ' },
              { id: 8, title: 'Pingente Medalha Sigilo', collection: 'Coleção Artesanal', tag: 'Limitado', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_Tx_xYJEPpNrM8gRLNmJ_uJduf9YYpf0XoxuKL7uftnVGHq0A9B52Ujr7YTi_I6VVEb5vK1LdlIXgB57HQy9dCehZDgep5CjLgdltAVezEeWaJ8yNDnAz3T3T67NOSuXcmXyVkdAJTD02sWV-V1Gn46JJIlISUp8-CiQXFn9tFZOT2fdt3lMme3nGiip5w9-2usDbrPvjzQojtqMn1htw98VHCdO8EF_SNQZao58OTVHunElxVjT-2yqXO2WqQpnURyoPIUOycv97' },
            ].map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-surface-container overflow-hidden mb-6 relative">
                  <img src={product.img} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                  {product.tag && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-on-primary font-label-caps text-[10px] px-3 py-1 uppercase">{product.tag}</span>
                    </div>
                  )}
                </div>
                <h2 className="font-label-caps text-on-surface group-hover:opacity-70 transition-opacity">{product.title}</h2>
                <p className="text-body-md text-on-surface-variant mt-1">{product.collection}</p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-24 flex justify-center items-center space-x-8">
            <button className="font-label-caps text-zinc-400 hover:text-zinc-900 transition-colors">Anterior</button>
            <div className="flex space-x-4">
              <span className="font-label-caps text-zinc-900 border-b border-zinc-900">01</span>
              <span className="font-label-caps text-zinc-400 hover:text-zinc-900 cursor-pointer">02</span>
              <span className="font-label-caps text-zinc-400 hover:text-zinc-900 cursor-pointer">03</span>
            </div>
            <button className="font-label-caps text-zinc-400 hover:text-zinc-900 transition-colors">Próximo</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductDetail = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-24 px-4 md:px-16 max-w-[1440px] mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Gallery */}
        <div className="lg:col-span-12 overflow-x-auto pb-4 mb-8 md:hidden">
          <div className="flex gap-4 w-fit">
            {[
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAOcCjiUsI8XIf2ycWp6bbMEZHKzEBRcXXwmUw3zKPQoV5hU1WLpZdyomZ38O71qr6FVmMkYnqzaO86IZnMo40wxDCYU3ewWi_lfNNHP933D0CyXm3SBHCyXOORP1XowjRSPaGaSDgE4KE4in5UtbHIVlSQB_OwRwk7I4RDJNcWJLLI7pHoXwnLbkSynew0SzVpLKLlggS-VVMc8wn6bNfTd5IdjEk4UAJs8zYrFEHmegFnCbpW35U0yz0qJpKcZ2Qzg3Dh9C8LcKqA',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAlv3CX74YyaP_YrhSbqehC7yabz-aSq3eCQkh2SDwod_ZzcYuo3nQvlpLQaubJzaZTmwA6CC0wlLe7vLDrp89EQlP6UHwBbvNfGwr7NozLsffnCjOr0UuROMReTicKSeOmUpVkItIjeTb9CQ15XcwfOCXdFKMMrGStq_yckJDn6Eed9DtOJ1URQ4Qc7i_6Fwf_RJzpwdNQSODB14M43KbqpZv9jUC4Kf1qGzNNsNwHgfesMvrv4CCJxCKdhOVW8c2BRg4bLw2Wp-pd',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCchmcyQLG_of_4kqqHpvOKrF0wBhB9POIHcK0-TA-pTMzXZhibk6O1IsxhDi4qW9M82qlmhDj_eT9edidj6lnJpOXHtP4jBZllzfxMOVCfSLEHpcLIRf9oFZe5Py1L0-Az75j6t3lCaoL2ZQC3QGMJIMbVMbzYdxiqb6IgZXYz2qNNeN0_ImruyqOO-Jhch6NNov65FjA3IQfj_-UxeqKDmxKxzhdwxjS0rFYEK8oowBYhIiMERKL77o5uGCJZ9Gj45jFY44PzYLkm'
            ].map((s, i) => (
              <div key={i} className="w-24 aspect-[3/4] bg-surface-container overflow-hidden cursor-pointer border border-zinc-100">
                <img src={s} alt="Miniatura" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 flex gap-6 flex-col md:flex-row">
          <div className="hidden md:flex flex-col gap-4 w-20 shrink-0">
            {[
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAOcCjiUsI8XIf2ycWp6bbMEZHKzEBRcXXwmUw3zKPQoV5hU1WLpZdyomZ38O71qr6FVmMkYnqzaO86IZnMo40wxDCYU3ewWi_lfNNHP933D0CyXm3SBHCyXOORP1XowjRSPaGaSDgE4KE4in5UtbHIVlSQB_OwRwk7I4RDJNcWJLLI7pHoXwnLbkSynew0SzVpLKLlggS-VVMc8wn6bNfTd5IdjEk4UAJs8zYrFEHmegFnCbpW35U0yz0qJpKcZ2Qzg3Dh9C8LcKqA',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAlv3CX74YyaP_YrhSbqehC7yabz-aSq3eCQkh2SDwod_ZzcYuo3nQvlpLQaubJzaZTmwA6CC0wlLe7vLDrp89EQlP6UHwBbvNfGwr7NozLsffnCjOr0UuROMReTicKSeOmUpVkItIjeTb9CQ15XcwfOCXdFKMMrGStq_yckJDn6Eed9DtOJ1URQ4Qc7i_6Fwf_RJzpwdNQSODB14M43KbqpZv9jUC4Kf1qGzNNsNwHgfesMvrv4CCJxCKdhOVW8c2BRg4bLw2Wp-pd',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCchmcyQLG_of_4kqqHpvOKrF0wBhB9POIHcK0-TA-pTMzXZhibk6O1IsxhDi4qW9M82qlmhDj_eT9edidj6lnJpOXHtP4jBZllzfxMOVCfSLEHpcLIRf9oFZe5Py1L0-Az75j6t3lCaoL2ZQC3QGMJIMbVMbzYdxiqb6IgZXYz2qNNeN0_ImruyqOO-Jhch6NNov65FjA3IQfj_-UxeqKDmxKxzhdwxjS0rFYEK8oowBYhIiMERKL77o5uGCJZ9Gj45jFY44PzYLkm'
            ].map((s, i) => (
              <div key={i} className={`aspect-[3/4] bg-surface-container overflow-hidden cursor-pointer border ${i === 0 ? 'border-zinc-900' : 'hover:opacity-80 transition-opacity'}`}>
                <img src={s} alt="Th" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <div className="flex-1">
            <div className="aspect-[4/5] bg-surface-container overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcbca41PpXa47ee_ioZI1DLTVJVl5fk4oTNkSeOlelHlh6jHgSwVsBv2YPUzEC_76HnDQABr8FmoMdLqlEjBCKu2irO0BQWU-NCEu54O9e1mMQlv6YrRhJ_JWTwEt507sn2k2lU3ofzlFbw-gyTmYjSQ02jhI_S7RQI3KMJXm1aZJBycDjMoQ3q6DDtHpLMDe4yWBLDj_YZyys3p0azaR-o8rBrPUwB1JGWotTVLZzy4ah9ierjNWcSEMata4pzxn7w50A2PSACjKH" alt="Main" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div className="aspect-square bg-surface-container overflow-hidden">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB88MGzdJ0BDJhXvB9NhhNl07nGqN0sDw4kqpggieU8GMkPH1YdMt1lXcB9KnLKL4hsStH6hicQvYvFNpYq8yKSUm6Ls6UcBAqDrFNwdKnfiuX4LASVSzPxxPduJluQJFSH78TbwfaZP37270yKkwRy4pAbxQ9AtY7mhKv8nUvKTppEoBKwlxoFVjmwiM5aktae85V9rUItROv0Ry5VtHkvqTFQ6sKC-_p_OAMXEUMDusYgQFMs-RNAxr4M7OAibYtksdN6mae1Y77M" alt="Detail 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-square bg-surface-container overflow-hidden">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqhZPax2gjSOGFHznijduaKm_cMNl7DZMsSzxVbebdqvWFtlLwjwSL3AFdjq1Bb8Sj6AeGMa6KcNZLy3PgF4h4WdJfxltQz3G8kMqcpLBgGrr94Ob9hR6Imf3yd5DjU4Fslox0KoSV4quawjJtToynCMQ_oLwoKEZ0q9-2ZIW7HR6TpdMXgMGD7DInciQNJ_Sf0CeUIuVd6R1LMu5Cp_ZxdXnNJ19AETIUDZnXZr3pC2tUgHgTXkD1dWiWR2Y95NEcSr6bXbuge2Gs" alt="Detail 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-5 sticky top-40 h-fit space-y-12">
          <div>
            <p className="font-label-caps text-on-tertiary-container mb-4">Coleção Herança</p>
            <h1 className="text-display-lg text-primary mb-6">Colar Argentum Fluir</h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Uma peça de expressão minimalista inspirada no movimento orgânico da água. Forjada manualmente em Prata 950, este colar captura a essência da quiet luxury.
            </p>
          </div>

          <div className="space-y-8 pt-8 border-t border-zinc-200">
            <div>
              <h3 className="font-label-caps mb-3">Composição</h3>
              <p className="text-body-md text-on-surface-variant italic">Prata de Lei 950 com acabamento polido espelhado. Isento de níquel.</p>
            </div>
            <div>
              <h3 className="font-label-caps mb-3">Dimensões</h3>
              <ul className="text-body-md text-on-surface-variant space-y-2">
                <li>Corrente: 45cm com extensor de 5cm</li>
                <li>Pendente: 2.4cm x 1.8cm</li>
                <li>Peso aproximado: 12g</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <button 
              onClick={() => window.open('https://wa.me/5500000000000', '_blank')}
              className="w-full py-6 bg-zinc-900 text-white font-label-caps uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-transform duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar via WhatsApp
            </button>
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-6">
                <button className="text-zinc-400 hover:text-zinc-900 transition-colors"><Share2 className="w-5 h-5" /></button>
                <button className="text-zinc-400 hover:text-zinc-900 transition-colors"><Copy className="w-5 h-5" /></button>
              </div>
              <div className="flex gap-6 items-center">
                <span className="font-label-caps text-[10px]">Compartilhar</span>
                <div className="flex gap-4">
                  <ShieldCheck className="w-5 h-5 text-zinc-400" />
                  <Globe className="w-5 h-5 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen bg-background"
    >
      {/* Admin Sidebar */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 border-r border-zinc-200 flex flex-col py-8 px-4 space-y-6 bg-zinc-50">
        <div className="px-4 mb-8">
          <Logo className="h-12" />
          <p className="font-serif text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Painel Admin</p>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { name: 'Dashboard', label: 'Painel' },
            { name: 'Categories', label: 'Categorias' },
            { name: 'Products', label: 'Produtos' },
            { name: 'Orders', label: 'Pedidos' }
          ].map((item) => (
            <a 
              key={item.name} 
              href="#" 
              className={`flex items-center gap-3 px-4 py-3 font-serif text-sm tracking-wider transition-colors ${item.name === 'Products' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-200'}`}
            >
              <div className="w-5 h-5 bg-current opacity-20 rounded-full" />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="px-4 pt-6 border-t border-zinc-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
            <User className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <p className="text-xs font-semibold">Perfil Admin</p>
            <button className="text-[10px] text-zinc-500 hover:text-zinc-900">Sair</button>
          </div>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="ml-64 flex-1">
        <header className="h-24 flex items-center justify-between px-16 bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-10">
          <div>
            <h2 className="text-headline-sm uppercase tracking-widest text-xl">Catálogo de Produtos</h2>
            <p className="text-[10px] font-label-caps text-zinc-400">GERENCIE SUA COLEÇÃO DE LUXO</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <input type="text" placeholder="BUSCAR PRODUTO..." className="bg-transparent border-none border-b border-zinc-200 focus:ring-0 focus:border-black text-[10px] font-label-caps w-64 placeholder:text-zinc-300" />
              <Search className="absolute right-0 top-1 text-zinc-400 w-4 h-4" />
            </div>
            <button className="bg-primary text-on-primary font-label-caps px-8 py-3 text-[10px] tracking-[0.2em] hover:opacity-90 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              NOVO PRODUTO
            </button>
          </div>
        </header>

        <div className="p-4 md:p-16">
          <div className="bg-white border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">PRODUTO</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">CATEGORIA</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">STATUS</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em]">PREÇO</th>
                  <th className="px-8 py-6 font-label-caps text-[10px] text-zinc-400 tracking-[0.2em] text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {[
                  { name: 'Anel de Prata Minimalista', ref: 'AUR-0012', cat: 'Anéis', status: 'EM ESTOQUE', price: 'R$ 450,00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhuScyT4LQpSbX4bmXlGOLD6EvXXrUyh0-0bBdq3-dVtLopVjqmAeaRUQ-q4V9QvF3v5mh5FogzQvaZSYoZP_DfRLHGhh5oGoyP42dj2BgsX3ralFhi1vtnuQkgQF-_PweN4s8YWkXKyP7K8dwvtUmXzzdtsmCO_p9OOP9gJaF8ASAxaAzdfQjSmgs-CGtxQl9Fss7MQzk2TdMf3UxJNOM1KjKhXV5xpYVO6IHCHEk6ier7JGtWn9L0iR0qK-rTXJC14FaoLTEr5U0' },
                  { name: 'Colar Essential Silver', ref: 'AUR-0089', cat: 'Colares', status: 'BAIXO ESTOQUE', price: 'R$ 890,00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaBbgQVf58aKnb4b0y5rSdUDhxy0f-78eBxF19XFOJFyDLW4zHmhUxsRNwP-8TyWXIFsaj1rY-Y-AydjkYtTyzfT6pJY6KYB-QB07zHnZrlF3Qxy4JckWT7eRz5SrvF3-nOpkIm_xQGWQIbdsnReP2BN1QG5aPE6AcQ0CPFnlqrLTWtcx7D7d14pUW72rbf2UDx_Fm9kKPkbLVj4H6Haz5JduOorN9Xf4iPz06avFg4-OZlRq0UOM2kGfI238xOjzeoL6xMgdNQ09N' },
                  { name: 'Brincos Heritage Hoop', ref: 'AUR-0045', cat: 'Brincos', status: 'EM ESTOQUE', price: 'R$ 620,00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzTZcQnC6ip3SiYVTaXk6wcntdIPW_ddJLL1bUwlol2U8qy2ya1VdlyxKQey6f_WhRW63sl8ZFvELVL75lyzX6WI_SQ5Bn6TGLSvjV_SdyKgRqRYCucnLdcessJhVl4YrA6gVAEF0B8X3oAfn1hiasZTqyhkoS1jT_KcGbtsVzjHnxCnPTNSLEtWq9Rz9dYg2ctNMEWzgvogta3wG5jI3OfVPXWV6DgMy6ZlKpo8nHkgOpnlImuA9_GHW-OgTbLS0OFe3xD-yBl7CB' },
                  { name: 'Pulseira Bold Link', ref: 'AUR-0122', cat: 'Pulseiras', status: 'ESGOTADO', price: 'R$ 1.250,00', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhhhVFep5Vz7O8mesBRUtR8Zvf-LhvaV5M1Cw8Zjc3bNWjV3XQ1VJ1W1njR71dtNPL4PBNeVqSsZoo12uPe0_C8shek5q6K6g9gmHxEZuhwTtnSXcV2laSJGja_P1UQGG5On4aGm9-TlsCeH9cJTEKt7ys1waV-B6-MMaeeeFFxi-mfAJgD7aZGUpkYX8Y-U7_JJ1qKMeprbT6NYiUcQwsB_GUApH2npjd3NcdNxPuGQajc9-Xh_-d4vbCx8KCc9fugLjW3K-LvPpc' }
                ].map((p, i) => (
                  <tr key={i} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-surface-container overflow-hidden">
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-serif text-sm text-zinc-900 tracking-wide">{p.name}</p>
                          <p className="text-[10px] font-label-caps text-zinc-400 mt-1">REF: {p.ref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-label-caps text-[10px] text-zinc-600 bg-zinc-100 px-3 py-1">{p.cat}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'EM ESTOQUE' ? 'bg-zinc-900' : p.status === 'BAIXO ESTOQUE' ? 'bg-zinc-300' : 'bg-error'}`}></span>
                        <span className={`font-label-caps text-[10px] ${p.status === 'ESGOTADO' ? 'text-error' : 'text-zinc-900'}`}>{p.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-serif text-sm text-zinc-900">{p.price}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button className="text-zinc-400 hover:text-zinc-900 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button className="text-zinc-400 hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-6 border-t border-zinc-100 flex items-center justify-between">
              <p className="text-[10px] font-label-caps text-zinc-400">EXIBINDO 4 DE 48 PRODUTOS</p>
              <div className="flex items-center gap-4">
                <button className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors disabled:opacity-30" disabled><ChevronLeft className="w-4 h-4" /></button>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center font-label-caps text-[10px] bg-zinc-900 text-white">1</span>
                  <span className="w-8 h-8 flex items-center justify-center font-label-caps text-[10px] text-zinc-400 hover:bg-zinc-50 cursor-pointer">2</span>
                  <span className="w-8 h-8 flex items-center justify-center font-label-caps text-[10px] text-zinc-400 hover:bg-zinc-50 cursor-pointer">3</span>
                </div>
                <button className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

// --- App Root ---

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        
        {/* Floating WhatsApp Action (Only on non-admin) */}
        <FloatingCallToAction />
      </div>
    </Router>
  );
}

const FloatingCallToAction = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <a 
      href="https://wa.me/5500000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-zinc-900 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95 duration-200 rounded-full"
      aria-label="Fale conosco via WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
    </a>
  );
}

