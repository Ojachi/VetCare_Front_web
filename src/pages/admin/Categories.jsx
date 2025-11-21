import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../api/products';

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || ''
      });
    } else {
      setForm({ name: '', description: '' });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40"
          placeholder="Ej: Alimentos, Juguetes, Accesorios"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={200}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40"
          placeholder="Descripción de la categoría (opcional)"
        />
        <p className="text-xs text-gray-500 mt-1">{form.description.length}/200 caracteres</p>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (e) {
      setError('Error cargando categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (payload) => {
    try {
      await createCategory(payload);
      setShowForm(false);
      setEditing(null);
      await loadCategories();
    } catch (e) {
      alert('Error creando categoría: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateCategory(editing.id, payload);
      setShowForm(false);
      setEditing(null);
      await loadCategories();
    } catch (e) {
      alert('Error actualizando categoría: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (e) {
      alert('Error eliminando categoría: ' + (e.response?.data?.message || e.message));
    }
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setShowForm(true);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-icons text-teal text-4xl">category</span>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Categorías</h1>
          </div>
          <p className="text-gray-600">Administra las categorías de productos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span className="material-icons">add_circle</span>
            Nueva Categoría
          </button>

          <button
            onClick={loadCategories}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="material-icons">refresh</span>
            Refrescar
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="material-icons text-gray-400">search</span>
            <input
              type="text"
              placeholder="Buscar categorías"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal/40 bg-white"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
          </div>
        )}

        {!loading && showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-teal">{editing ? 'edit' : 'add_box'}</span>
              {editing ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <CategoryForm
              category={editing}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        {!loading && !showForm && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-icons text-gray-300 text-6xl mb-3">category</span>
                <p className="text-gray-500">
                  {search ? 'No se encontraron categorías' : 'No hay categorías registradas'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Productos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {cat.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="material-icons text-teal text-sm">label</span>
                            <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {cat.description || <span className="italic text-gray-400">Sin descripción</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cat.productCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEdit(cat)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="Editar"
                            >
                              <span className="material-icons text-sm">edit</span>
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                              title="Eliminar"
                            >
                              <span className="material-icons text-sm">delete</span>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total: {filteredCategories.length} {filteredCategories.length === 1 ? 'categoría' : 'categorías'}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Categories;
