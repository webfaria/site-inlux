import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProducts } from '../hooks/useProducts';

// Mock the API services
vi.mock('../services/api', () => ({
  productService: {
    getAll: vi.fn(),
    subscribe: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoryService: {
    getAll: vi.fn(),
    subscribe: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { productService, categoryService } from '../services/api';

const mockProducts = [
  { id: 1, name: 'Product 1', price: 100, category: 'bed-linen', description: 'Test', material: 'Cotton' },
  { id: 2, name: 'Product 2', price: 200, category: 'curtains', description: 'Test', material: 'Silk' },
];

const mockCategories = [
  { id: 1, slug: 'bed-linen', name: 'Bed Linen', description: 'Test' },
  { id: 2, slug: 'curtains', name: 'Curtains', description: 'Test' },
];

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (productService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockProducts);
    (categoryService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategories);
    (productService.subscribe as ReturnType<typeof vi.fn>).mockImplementation((onChange) => {
      onChange(mockProducts);
      return vi.fn();
    });
    (categoryService.subscribe as ReturnType<typeof vi.fn>).mockImplementation((onChange) => {
      onChange(mockCategories);
      return vi.fn();
    });
  });

  it('should load products and categories on mount', async () => {
    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', () => {
    (productService.subscribe as ReturnType<typeof vi.fn>).mockImplementation(() => vi.fn());
    (categoryService.subscribe as ReturnType<typeof vi.fn>).mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    (productService.subscribe as ReturnType<typeof vi.fn>).mockImplementation((_onChange, onError) => {
      onError(new Error('API Error'));
      return vi.fn();
    });
    (categoryService.subscribe as ReturnType<typeof vi.fn>).mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Falha ao carregar dados');
  });

  it('should refresh data', async () => {
    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock new data
    const newProducts = [...mockProducts, { id: 3, name: 'Product 3', price: 300, category: 'test', description: 'Test', material: 'Wool' }];
    (productService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(newProducts);

    await act(async () => {
      await result.current.refresh();
    });

    expect(productService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.products).toEqual(newProducts);
  });

  it('should update products when realtime subscription changes', async () => {
    let emitProducts: (products: any[]) => void = () => undefined;
    (productService.subscribe as ReturnType<typeof vi.fn>).mockImplementation((onChange) => {
      emitProducts = onChange;
      onChange(mockProducts);
      return vi.fn();
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const realtimeProducts = [...mockProducts, { id: 3, name: 'Realtime Product', price: 300, category: 'test' }];

    act(() => {
      emitProducts(realtimeProducts);
    });

    expect(result.current.products).toEqual(realtimeProducts);
  });
});
