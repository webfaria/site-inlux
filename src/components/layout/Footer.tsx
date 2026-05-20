import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Phone, Mail } from 'lucide-react';
import { Logo } from './Logo';

export const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="bg-zinc-900 text-white pt-24 pb-12">
      <div className="max-w-[1440px] mx-auto px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <Logo className="h-24" />
            <p className="text-zinc-400 text-sm leading-relaxed max-w-[240px]">
              Elegância atemporal e design contemporâneo em semijóias de luxo e pratas 950.
            </p>
            <div className="flex space-y-4 flex-col">
              <div className="flex items-center gap-3 text-zinc-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-label-caps tracking-widest">CERTIFICADO DE GARANTIA</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-label-caps text-xs tracking-[0.2em] mb-8">Coleções</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><Link to="/category/colares" className="hover:text-white transition-colors cursor-pointer">Colares</Link></li>
              <li><Link to="/category/brincos" className="hover:text-white transition-colors cursor-pointer">Brincos</Link></li>
              <li><Link to="/category/aneis" className="hover:text-white transition-colors cursor-pointer">Anéis</Link></li>
              <li><Link to="/category/pulseiras" className="hover:text-white transition-colors cursor-pointer">Pulseiras</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-caps text-xs tracking-[0.2em] mb-8">Atendimento</h4>
            <ul className="space-y-5 text-zinc-400 text-sm">
              <li className="flex items-center gap-3 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:text-white transition-colors"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                <a href="https://www.instagram.com/inluxsemijoiasoficial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer">@inluxsemijoiasoficial</a>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="w-4 h-4 group-hover:text-white transition-colors" />
                <a href="https://wa.me/5535999828600" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer">(35) 9 9982-8600</a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-4 h-4 group-hover:text-white transition-colors" />
                <a href="mailto:contato@inluxsemijoias.com.br" className="hover:text-white transition-colors cursor-pointer text-xs sm:text-sm">contato@inluxsemijoias.com.br</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-caps text-xs tracking-[0.2em] mb-8">Newsletter</h4>
            <p className="text-zinc-400 text-sm mb-6">Inscreva-se para receber novidades e convites exclusivos.</p>
            <div className="flex border-b border-zinc-700 pb-2">
              <input type="email" placeholder="Seu e-mail" className="bg-transparent border-none outline-none text-sm w-full font-light" />
              <button className="text-xs font-label-caps tracking-widest hover:text-zinc-400 cursor-pointer">OK</button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-zinc-500 text-[10px] font-label-caps tracking-widest">
            © 2026 INLUX SEMIJOIAS. TODOS OS DIREITOS RESERVADOS.
          </p>
          <div className="flex gap-8 text-zinc-500 text-[10px] font-label-caps tracking-widest">
            <Link to="/care-guide" className="hover:text-white transition-colors cursor-pointer">GUIA DE CUIDADOS</Link>
            <Link to="/terms" className="hover:text-white transition-colors cursor-pointer">TERMOS DE USO</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
