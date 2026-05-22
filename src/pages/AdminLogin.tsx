import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Loader2, Mail } from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { authService, getApiErrorMessage } from '../services/api';
import { ADMIN_EMAIL } from '../services/firebase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');
    setResetMessage('');

    try {
      const response = await authService.login(email, password);
      if (response.success && response.token) {
        localStorage.setItem('inlux_admin_token', response.token);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Nao foi possivel acessar o painel.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Informe o e-mail do administrador para redefinir a senha.');
      return;
    }

    setIsSendingReset(true);
    setError('');
    setResetMessage('');

    try {
      await authService.sendPasswordReset(email);
      setResetMessage('Enviamos um e-mail do Firebase para redefinir a senha.');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Nao foi possivel enviar a redefinicao de senha.'));
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-zinc-100 flex flex-col items-center sm:p-12"
      >
        <div className="h-16 mb-8 sm:mb-12">
          <Logo className="h-16" />
        </div>
        
        <h1 className="font-serif text-xl text-zinc-900 tracking-widest uppercase mb-2">Acesso Restrito</h1>
        <p className="text-[10px] font-label-caps text-zinc-400 mb-8 text-center tracking-[0.16em] sm:mb-10 sm:tracking-[0.2em]">
          POR FAVOR, INSIRA A SENHA PARA ACESSAR O PAINEL DE CONTROLE
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Mail className="w-4 h-4 text-zinc-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail do administrador"
              className="w-full bg-zinc-50 border border-zinc-200 pl-12 pr-4 py-4 text-sm font-serif focus:border-black focus:ring-0 outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Lock className="w-4 h-4 text-zinc-400" />
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de administrador" 
              className="w-full bg-zinc-50 border border-zinc-200 pl-12 pr-4 py-4 text-sm font-serif focus:border-black focus:ring-0 outline-none transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-error font-serif text-center"
            >
              {error}
            </motion.p>
          )}

          {resetMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-700 font-serif text-center"
            >
              {resetMessage}
            </motion.p>
          )}

          <button 
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-black text-white py-4 font-label-caps text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                VERIFICANDO...
              </>
            ) : (
              <>
                ACESSAR PAINEL
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isSendingReset || !email}
            className="w-full text-zinc-500 py-2 font-label-caps text-[10px] tracking-[0.2em] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSendingReset ? 'ENVIANDO...' : 'REDEFINIR SENHA'}
          </button>
        </form>
      </motion.div>
      <p className="mt-8 text-zinc-400 text-[10px] font-label-caps tracking-widest">
        &copy; 2026 INLUX SEMIJOIAS
      </p>
    </div>
  );
};
