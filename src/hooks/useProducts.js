import { useState, useEffect } from 'react';
import { fetchProducts, clearProductsCache } from '../api/products';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filterParams };
      if (params.activeOnly !== undefined) {
        params.active = params.activeOnly;
        delete params.activeOnly;
      }
      
      const list = await fetchProducts(params);
      setProducts(list);
    } catch (e) {
      setError(e.message || 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    loadProducts(newFilters);
  };

  const refreshProducts = () => {
    clearProductsCache();
    loadProducts(initialFilters);
  };

  useEffect(() => {
    loadProducts(initialFilters);
  }, []);

  return {
    products,
    loading,
    error,
    updateFilters,
    refreshProducts,
    loadProducts
  };
};