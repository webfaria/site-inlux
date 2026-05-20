import { useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../types';
import { productService, categoryService } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let hasProductsLoaded = false;
    let hasCategoriesLoaded = false;

    const finishInitialLoad = () => {
      if (hasProductsLoaded && hasCategoriesLoaded) {
        setLoading(false);
      }
    };

    const handleRealtimeError = (err: Error) => {
      setError('Falha ao carregar dados');
      setLoading(false);
      console.error(err);
    };

    const unsubscribeProducts = productService.subscribe((productsData) => {
      hasProductsLoaded = true;
      setProducts(productsData);
      setError(null);
      finishInitialLoad();
    }, handleRealtimeError);

    const unsubscribeCategories = categoryService.subscribe((categoriesData) => {
      hasCategoriesLoaded = true;
      setCategories(categoriesData);
      setError(null);
      finishInitialLoad();
    }, handleRealtimeError);

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>, imageFile?: File | null) => {
    const result = await productService.add(product, imageFile ?? undefined);
    return result;
  };

  const updateProduct = async (id: number, product: Partial<Product>, imageFile?: File | null) => {
    const result = await productService.update(id, product, imageFile ?? undefined);
    return result;
  };

  const deleteProduct = async (id: number) => {
    const result = await productService.delete(id);
    return result;
  };

  const addCategory = async (category: Category) => {
    const result = await categoryService.add(category);
    return result;
  };

  const updateCategory = async (slug: string, category: Category) => {
    const result = await categoryService.update(slug, category);
    return result;
  };

  const deleteCategory = async (slug: string) => {
    const result = await categoryService.delete(slug);
    return result;
  };

  return {
    products,
    categories,
    loading,
    error,
    refresh: fetchData,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
