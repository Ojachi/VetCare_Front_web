import React, { useEffect, useState } from 'react';
import { fetchProducts, addToCart, activateProduct, deleteProduct, fetchCategories } from '../../api/products';
import ProductFilters from '../../components/ProductFilters';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();

  const loadData = async (filters = { active: true }) => {
    setLoading(true);
    setError(null);
    try {
      const [productList, categoryList] = await Promise.all([
        fetchProducts(filters),
        fetchCategories()
      ]);
      setProducts(productList);
      setCategories(categoryList);
    } catch (e) {
      setError(e.message || 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilters = (newFilters) => {
    const params = { ...newFilters };
    if (params.activeOnly !== undefined) {
      params.active = params.activeOnly;
      delete params.activeOnly;
    }
    loadData(params);
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ productId, quantity: 1 });
      alert('Producto agregado al carrito');
    } catch (e) {
      alert('Error al agregar al carrito');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    try {
      await deleteProduct(id);
      loadData();
    } catch (e) {
      alert('Error eliminando');
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateProduct(id);
      loadData();
    } catch (e) {
      alert('Error activando');
    }
  };

  const goDetail = (id) => navigate(`/productos/${id}`);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-icons text-teal text-4xl">store</span>
            <h1 className="text-3xl font-bold text-gray-800">Catálogo de Productos</h1>
          </div>
          <p className="text-gray-600">Explora nuestros productos veterinarios</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <ProductFilters onChange={handleFilters} categories={categories} />
        </div>
        
        {loading && <LoadingSpinner text="Cargando productos..." />}
        {error && <p className="text-red-600 text-sm bg-red-50 p-4 rounded-lg mb-4">{error}</p>}
        
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              role={role}
              onAddToCart={handleAddToCart}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onSelect={goDetail}
            />
          ))}
        </div>
        
        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <span className="material-icons text-gray-300 text-6xl mb-4">inventory_2</span>
            <p className="text-gray-600">No se encontraron productos</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Catalog;
