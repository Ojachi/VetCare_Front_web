import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { serviceApi } from '../../api/services';

const AdminServices = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', duration: '', description: '', active: true });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const navigation = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'groups', label: 'Usuarios' },
    { path: '/admin/services', icon: 'build', label: 'Servicios' },
    { path: '/admin/appointments', icon: 'event', label: 'Citas' },
  ];

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await serviceApi.getAll();
      setServices(res.data || []);
    } catch (e) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query) return services;
    const q = query.toLowerCase();
    return (services || []).filter(s => (s.name || '').toLowerCase().includes(q) || String(s.price || '').includes(q));
  }, [services, query]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', price: '', duration: '', description: '', active: true });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setFormData({ 
      name: s.name || '', 
      price: s.price || '', 
      duration: s.durationMinutes || '', // ✅ Cambio: leer durationMinutes
      description: s.description || '', 
      requiresVeterinarian: s.requiresVeterinarian || false, // ✅ Cambio: agregar requiresVeterinarian
      active: s.active ?? true 
    });
    setShowModal(true);
  };

  const toggleActive = async (s) => {
    const newActive = !(s.active ?? true);
    try {
      if (serviceApi.deactivate && !newActive) {
        await serviceApi.deactivate(s.id);
      } else if (serviceApi.activate && newActive) {
        await serviceApi.activate(s.id);
      } else {
        await serviceApi.update(s.id, { active: newActive });
      }
      setFeedback({ type: 'success', message: newActive ? 'Servicio activado' : 'Servicio desactivado' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo cambiar el estado' });
    }
  };

  const handleDelete = async (s) => {
    setDeleteConfirm(s);
  };

  const confirmDelete = async () => {
    try {
      await serviceApi.remove(deleteConfirm.id);
      setFeedback({ type: 'success', message: 'Servicio eliminado' });
      setDeleteConfirm(null);
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo eliminar' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'El nombre es requerido' });
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFeedback({ type: 'error', message: 'El precio debe ser mayor a 0' });
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        durationMinutes: formData.duration ? parseInt(formData.duration) : 0, // ✅ Cambio: durationMinutes
        requiresVeterinarian: formData.requiresVeterinarian || false, // ✅ Cambio: agregar requiresVeterinarian
        active: formData.active,
      };
      
      if (editing) {
        await serviceApi.update(editing.id, payload);
        setFeedback({ type: 'success', message: 'Servicio actualizado' });
      } else {
        await serviceApi.create(payload);
        setFeedback({ type: 'success', message: 'Servicio creado' });
      }
      setShowModal(false);
      setEditing(null);
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: e.response?.data?.message || 'Error al guardar' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Servicios</h1>
            <p className="text-gray-600 mt-2">Gestiona el catálogo de servicios</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg">
            <span className="material-icons">add</span>
            <span>Nuevo Servicio</span>
          </button>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>{feedback.message}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="w-full sm:w-80">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" placeholder="Buscar por nombre o precio" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">build</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay servicios</h3>
            <p className="text-gray-600 mb-6">Crea el primer servicio</p>
            <button onClick={openCreate} className="px-6 py-2 bg-teal text-white rounded-lg">Nuevo Servicio</button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">shopping_bag</span>Nombre</th>
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">attach_money</span>Precio</th>
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">schedule</span>Duración</th>
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">check_circle</span>Estado</th>
                  <th className="px-4 py-3 text-center"><span className="material-icons inline align-middle text-base mr-2">tune</span>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3">${s.price}</td>
                    <td className="px-4 py-3">{s.durationMinutes ? `${s.durationMinutes} min` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(s.active ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                        {(s.active ?? true) ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(s)} className="px-3 py-1.5 text-teal hover:bg-teal/10 rounded-md">Editar</button>
                        <button onClick={() => toggleActive(s)} className={`px-3 py-1.5 rounded-md ${s.active ?? true ? 'text-yellow-700 hover:bg-yellow-50' : 'text-green-700 hover:bg-green-50'}`}>{(s.active ?? true) ? 'Desactivar' : 'Activar'}</button>
                        <button onClick={() => handleDelete(s)} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Confirmar eliminación</h2>
              <p className="text-gray-600 mb-6">¿Estás seguro de que deseas borrar el servicio <span className="font-semibold">"{deleteConfirm.name}"</span>? Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                    <input type="number" min="0" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                </div>
                <div className="flex items-center gap-2">
                  <input id="active" type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                  <label htmlFor="active" className="text-sm text-gray-700">Activo</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminServices;
