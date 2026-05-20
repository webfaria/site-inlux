import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const WHATSAPP_URL = 'https://wa.me/5535999828600?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20INLUX.';

export const WhatsAppFloat = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a INLUX no WhatsApp"
      className="fixed right-5 bottom-5 md:right-8 md:bottom-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};
