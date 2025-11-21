import { useState, useEffect, useCallback } from 'react';
import { fetchProductsCached, clearProductsCache } from '../api/products';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const loadProducts = useCallback(async (filterParams = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filterParams };
      if (params.activeOnly !== undefined) {
        params.active = params.activeOnly;
        delete params.activeOnly;
      }
      
      const list = await fetchProductsCached(params);
      setProducts(list);
    } catch (e) {
      setError(e.message || 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    loadProducts(newFilters);
  }, [loadProducts]);

  const refreshProducts = useCallback(() => {
    clearProductsCache();
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    filters,
    updateFilters,
    refreshProducts,
    loadProducts
  };
};