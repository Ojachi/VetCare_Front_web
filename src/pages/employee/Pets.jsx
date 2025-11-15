import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { petApi } from '../../api/services';

const EmployeePets = () => {
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [query, setQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    sex: '',
    color: '',
  });

  const navigation = [
    { path: '/employee/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/employee/pets', icon: 'pets', label: 'Mascotas' },
    { path: '/employee/appointments', icon: 'event', label: 'Citas' },
  ];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const petsRes = await petApi.getAll();
      setPets(petsRes.data || []);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = useMemo(() => {
    if (!query) return pets;
    const q = query.toLowerCase();
    return pets.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.species?.toLowerCase().includes(q) ||
      p.breed?.toLowerCase().includes(q) ||
      p.owner?.name?.toLowerCase().includes(q)
    );
  }, [pets, query]);

  const openEdit = (pet) => {
    setEditing(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      age: pet.age || '',
      weight: pet.weight || '',
      sex: pet.sex || '',
      color: pet.color || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (pet) => {
    if (!confirm(`¿Eliminar mascota "${pet.name}"?`)) return;
    try {
      await petApi.remove(pet.id);
      setFeedback({ type: 'success', message: 'Mascota eliminada' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo eliminar' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Solo permitir edición, no creación
      if (editing) {
        await petApi.update(editing.id, { ...formData });
        setFeedback({ type: 'success', message: 'Mascota actualizada' });
        setShowModal(false);
        setEditing(null);
        load();
      }
    } catch (e) {
      setFeedback({ type: 'error', message: e.response?.data?.message || 'Error al guardar' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mascotas</h1>
            <p className="text-gray-600 mt-2">Consulta y edita la información de las mascotas</p>
          </div>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>{feedback.message}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="w-full sm:w-80">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="Buscar por nombre, especie, dueño..."
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">pets</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay mascotas</h3>
            <p className="text-gray-600">No se encontraron mascotas en el sistema</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Especie</th>
                  <th className="px-4 py-3">Raza</th>
                  <th className="px-4 py-3">Edad</th>
                  <th className="px-4 py-3">Dueño</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPets.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3">{p.species}</td>
                    <td className="px-4 py-3">{p.breed}</td>
                    <td className="px-4 py-3">{p.age}</td>
                    <td className="px-4 py-3">{p.owner?.name || p.ownerName || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-teal hover:bg-teal/10 rounded-md">Editar</button>
                        <button onClick={() => handleDelete(p)} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Editar Mascota</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dueño</label>
                  <input 
                    type="text" 
                    value={editing?.owner?.name || 'Sin asignar'} 
                    disabled 
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">No se puede cambiar el dueño</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especie</label>
                    <input value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} required className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                    <input value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                    <select 
                      required
                      value={formData.sex} 
                      onChange={e => setFormData({ ...formData, sex: e.target.value })} 
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal"
                    >
                      <option value="">Seleccionar</option>
                      <option value="M">Macho</option>
                      <option value="F">Hembra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                    <input type="number" min="0" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                    <input type="number" min="0" step="0.01" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
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

export default EmployeePets;
