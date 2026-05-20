import { Link } from 'react-router-dom';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo = ({ className = "h-28", light = false }: LogoProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to="/" className={`flex flex-col items-start justify-center cursor-pointer transition-opacity hover:opacity-80 ${className}`}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="inlux. SEMIJOIAS & PRATAS"
          className="h-full w-auto object-contain"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={{ filter: light ? 'brightness(0) invert(1)' : 'none' }}
        />
      ) : (
        <div className={`flex flex-col ${light ? 'text-white' : 'text-zinc-900'}`}>
          <span className="text-3xl font-sans font-bold tracking-tight leading-none">
            inlux<span className="text-primary">.</span>
          </span>
          <span className="text-[8px] font-sans font-medium tracking-[0.3em] uppercase mt-1 opacity-80">
            SEMIJOIAS & PRATAS
          </span>
        </div>
      )}
    </Link>
  );
};
