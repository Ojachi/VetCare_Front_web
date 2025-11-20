import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SearchableDropdown from '../../components/SearchableDropdown';
import { petApi } from '../../api/services';

const OwnerPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    sex: '',
  });
  const [feedback, setFeedback] = useState(null);

  const sexOptions = useMemo(() => ([
    { value: 'M', label: 'Macho' },
    { value: 'F', label: 'Hembra' },
  ]), []);

  const navigation = [
    { path: '/owner/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/owner/pets', icon: 'pets', label: 'Mis Mascotas' },
    { path: '/owner/appointments', icon: 'event', label: 'Mis Citas' },
    { path: '/owner/history', icon: 'history', label: 'Historial Médico' },
  ];

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const response = await petApi.getAll();
      setPets(response.data || []);
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      setFeedback({ type: 'error', message: 'Error al cargar las mascotas' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await petApi.update(editingPet.id, formData);
        setFeedback({ type: 'success', message: 'Mascota actualizada exitosamente' });
      } else {
        await petApi.create(formData);
        setFeedback({ type: 'success', message: 'Mascota registrada exitosamente' });
      }
      setShowModal(false);
      setEditingPet(null);
      setFormData({ name: '', species: '', breed: '', age: '', weight: '', sex: '' });
      loadPets();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      sex: pet.sex,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta mascota?')) return;
    try {
      await petApi.delete(id);
      setFeedback({ type: 'success', message: 'Mascota eliminada' });
      loadPets();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Error al eliminar' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">pets</span>
              <h1 className="text-3xl font-bold text-gray-800">Mis Mascotas</h1>
            </div>
            <p className="text-gray-600 mt-2">Gestiona la información de tus mascotas</p>
          </div>
          <button
            onClick={() => {
              setEditingPet(null);
              setFormData({ name: '', species: '', breed: '', age: '', weight: '', sex: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg transition-shadow"
          >
            <span className="material-icons">add</span>
            <span>Nueva Mascota</span>
          </button>
        </div>

        {feedback && (
          <div className={`mb-6 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>
            {feedback.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
          </div>
        ) : pets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">pets</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No tienes mascotas registradas</h3>
            <p className="text-gray-600 mb-6">Comienza registrando tu primera mascota</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-teal text-white rounded-lg"
            >
              Registrar Mascota
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center">
                    <span className="material-icons text-teal text-2xl">pets</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pet)}
                      className="p-1 text-gray-600 hover:text-teal"
                    >
                      <span className="material-icons text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <span className="material-icons text-xl">delete</span>
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Especie:</span> {pet.species}</p>
                  <p><span className="font-medium">Raza:</span> {pet.breed}</p>
                  <p><span className="font-medium">Sexo:</span> {pet.sex === 'M' ? 'Macho' : 'Hembra'}</p>
                  <p><span className="font-medium">Edad:</span> {pet.age} años</p>
                  <p><span className="font-medium">Peso:</span> {pet.weight} kg</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingPet ? 'Editar Mascota' : 'Registrar Mascota'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especie</label>
                  <input
                    type="text"
                    required
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                  <input
                    type="text"
                    required
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <SearchableDropdown
                    options={sexOptions}
                    value={formData.sex}
                    onChange={(val) => setFormData({ ...formData, sex: val || '' })}
                    placeholder="Seleccionar sexo"
                    required
                    valueKey="value"
                    getOptionLabel={(opt) => opt.label}
                    sort={false}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg"
                  >
                    {editingPet ? 'Actualizar' : 'Registrar'}
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

export default OwnerPets;
