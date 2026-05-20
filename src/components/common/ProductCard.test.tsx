import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';

// Cast localStorage to any for testing
const localStorage = globalThis.localStorage as any;

const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  price: '100',
  category: 'bed-linen',
  collection: 'Test Collection',
  description: 'A test product',
  material: 'Prata',
  img: '/test-image.jpg',
  status: 'EM ESTOQUE',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue('[]');
    localStorage.setItem.mockClear();
  });

  it('should render product information', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render image with correct alt text', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    const img = screen.getByAltText('Test Product');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  it('should show ESGOTADO status when product is out of stock', () => {
    const esgotadoProduct = { ...mockProduct, status: 'ESGOTADO' as const };
    renderWithRouter(<ProductCard product={esgotadoProduct} />);
    
    expect(screen.getByText('Esgotado')).toBeInTheDocument();
  });

  it('should toggle favorite on button click', async () => {
    localStorage.getItem.mockReturnValue('[]');
    
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    const favoriteButton = screen.getByRole('button', { name: /Adicionar aos favoritos/i });
    fireEvent.click(favoriteButton);
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'inlux_favorites',
        JSON.stringify([1])
      );
    });
  });

  it('should remove from favorites when already favorited', async () => {
    localStorage.getItem.mockReturnValue('[1]');
    
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    const favoriteButton = screen.getByRole('button', { name: /Remover dos favoritos/i });
    fireEvent.click(favoriteButton);
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'inlux_favorites',
        JSON.stringify([])
      );
    });
  });

  it('should apply correct text alignment', () => {
    const { container: centerContainer } = renderWithRouter(
      <ProductCard product={mockProduct} textAlign="center" />
    );
    expect(centerContainer.querySelector('.text-center')).toBeInTheDocument();

    const { container: leftContainer } = renderWithRouter(
      <ProductCard product={mockProduct} textAlign="left" />
    );
    expect(leftContainer.querySelector('.text-left')).toBeInTheDocument();
  });
});