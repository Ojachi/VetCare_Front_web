import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, activateProduct, fetchCategories } from '../../api/products';
import ProductForm from '../../components/ProductForm';
import ProductTable from '../../components/ProductTable';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchProducts();
      setProducts(list);
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (e) {
      setError('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    try {
      await createProduct(payload);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e) {
      alert('Error creando');
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateProduct(editing.id, payload);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e) {
      alert('Error actualizando');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      alert('Error eliminando');
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateProduct(id);
      await load();
    } catch (e) {
      alert('Error activando');
    }
  };

  const onEdit = (p) => {
    setEditing(p);
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onSelect = (id) => navigate(`/productos/${id}`);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-icons text-teal text-4xl">inventory</span>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
          </div>
          <p className="text-gray-600">Administra el catálogo de productos</p>
        </div>
        
        {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-4">{error}</p>}
        
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <div className="flex gap-2">
            <button onClick={openNew} className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <span className="material-icons">add_circle</span>
              Agregar Producto
            </button>
            <button onClick={() => navigate('/admin/categorias')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <span className="material-icons">category</span>
              Gestionar Categorías
            </button>
          </div>
          <button onClick={load} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="material-icons">refresh</span>
            Refrescar
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="material-icons text-gray-400">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-teal/40 bg-white"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-teal/40 bg-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
          </div>
        )}
        
        {!showForm && !loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ProductTable
              products={products.filter(p => {
                const matchName = p.name.toLowerCase().includes(search.toLowerCase());
                const cid = p.categoryId || p.category?.id;
                const matchCat = !categoryFilter || cid == categoryFilter;
                return matchName && matchCat;
              })}
              role="ADMIN"
              onEdit={onEdit}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onSelect={onSelect}
            />
          </div>
        )}
        
        {showForm && (
          <div className="max-w-2xl bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-teal">{editing ? 'edit' : 'add_box'}</span>
              {editing ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <ProductForm
              product={editing}
              categories={categories}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductManagement;
