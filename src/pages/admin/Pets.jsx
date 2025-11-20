import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { petApi } from '../../api/services';

const AdminPets = () => {
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [breedValue, setBreedValue] = useState('');

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    setLoading(true);
    try {
      const res = await petApi.getAll();
      setPets(res.data || []);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setFeedback({ type: 'error', message: 'No se pudieron cargar las mascotas' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = useMemo(() => {
    if (!query) return pets;
    const q = query.toLowerCase();
    return pets.filter((pet) =>
      [pet.name, pet.species, pet.breed, pet.owner?.name, pet.owner?.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [pets, query]);

  const buildPetPayload = (pet, overrides = {}) => ({
    name: overrides.name ?? pet.name ?? '',
    species: overrides.species ?? pet.species ?? '',
    breed: overrides.breed ?? pet.breed ?? '',
    age: overrides.age ?? pet.age ?? 1,
    weight: overrides.weight ?? pet.weight ?? 1,
    sex: overrides.sex ?? pet.sex ?? 'M',
    ownerId: overrides.ownerId ?? pet.owner?.id ?? pet.ownerId ?? null,
  });

  const openEdit = (pet) => {
    setEditingPet(pet);
    setBreedValue(pet.breed || '');
    setShowModal(true);
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPet) return;
    if (!breedValue.trim()) {
      setFeedback({ type: 'error', message: 'La raza es obligatoria' });
      return;
    }

    try {
      const payload = buildPetPayload(editingPet, { breed: breedValue.trim() });
      await petApi.update(editingPet.id, payload);
      setFeedback({ type: 'success', message: 'Raza actualizada correctamente' });
      setShowModal(false);
      setEditingPet(null);
      setBreedValue('');
      loadPets();
    } catch (error) {
      console.error('Error actualizando mascota:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'No se pudo actualizar la raza' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">pets</span>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Mascotas</h1>
            </div>
            <p className="text-gray-600 mt-2">Consulta y ajusta la raza de las mascotas registradas</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-4 text-sm rounded-md px-4 py-3 ${
              feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="w-full sm:w-96">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                placeholder="Buscar por nombre, raza o dueño..."
              />
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
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay mascotas registradas</h3>
            <p className="text-gray-600">Cuando se registren mascotas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="px-4 py-3">
                    <span className="material-icons inline align-middle text-base mr-2">pets</span>
                    Nombre
                  </th>
                  <th className="px-4 py-3">
                    <span className="material-icons inline align-middle text-base mr-2">category</span>
                    Especie
                  </th>
                  <th className="px-4 py-3">
                    <span className="material-icons inline align-middle text-base mr-2">style</span>
                    Raza
                  </th>
                  <th className="px-4 py-3">
                    <span className="material-icons inline align-middle text-base mr-2">hourglass_empty</span>
                    Edad
                  </th>
                  <th className="px-4 py-3">
                    <span className="material-icons inline align-middle text-base mr-2">person</span>
                    Dueño
                  </th>
                  <th className="px-4 py-3 text-right">
                    <span className="material-icons inline align-middle text-base mr-2">tune</span>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPets.map((pet) => (
                  <tr key={pet.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-800">{pet.name}</td>
                    <td className="px-4 py-3">{pet.species}</td>
                    <td className="px-4 py-3">{pet.breed}</td>
                    <td className="px-4 py-3">{pet.age}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{pet.owner?.name || '—'}</span>
                        <span className="text-xs text-gray-500">{pet.owner?.email || ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md"
                        onClick={() => openEdit(pet)}
                      >
                        Editar raza
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && editingPet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Actualizar raza</h2>
              <p className="text-sm text-gray-600 mb-4">
                Mascota: <span className="font-semibold">{editingPet.name}</span> ({editingPet.species})
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva raza</label>
                  <input
                    type="text"
                    value={breedValue}
                    onChange={(e) => setBreedValue(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPet(null);
                      setBreedValue('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPets;

