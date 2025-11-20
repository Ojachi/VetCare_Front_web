import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { petApi, diagnosisApi } from '../../api/services';

const OwnerHistory = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = [
    { path: '/owner/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/owner/pets', icon: 'pets', label: 'Mis Mascotas' },
    { path: '/owner/appointments', icon: 'event', label: 'Mis Citas' },
    { path: '/owner/history', icon: 'history', label: 'Historial Médico' },
  ];

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadDiagnoses(selectedPet.id);
    }
  }, [selectedPet]);

  const loadPets = async () => {
    try {
      const response = await petApi.getAll();
      const petsData = response.data || [];
      setPets(petsData);
      if (petsData.length > 0) {
        setSelectedPet(petsData[0]);
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiagnoses = async (petId) => {
    if (!petId) {
      setDiagnoses([]);
      return;
    }
    try {
      const response = await diagnosisApi.getByPet(petId);
      setDiagnoses(response.data || []);
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error);
      setDiagnoses([]);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navigation={navigation}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (pets.length === 0) {
    return (
      <DashboardLayout navigation={navigation}>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <span className="material-icons text-gray-300 text-6xl mb-4">pets</span>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No tienes mascotas registradas</h3>
          <p className="text-gray-600 mb-6">Registra una mascota para ver su historial médico</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="material-icons text-teal text-4xl" aria-hidden="true">history</span>
            <h1 className="text-3xl font-bold text-gray-800">Historial Médico</h1>
          </div>
          <p className="text-gray-600 mt-2">Consulta el historial médico de tus mascotas</p>
        </div>

        {/* Pet Selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona una mascota</label>
          <div className="flex gap-2 flex-wrap">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPet?.id === pet.id
                    ? 'bg-teal text-white shadow-teal-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pet.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pet Info */}
        {selectedPet && (
          <div className="bg-gradient-to-r from-teal to-teal-light rounded-lg shadow-teal-sm p-6 mb-6 text-white">
            <div className="flex items-start gap-4">
              <span className="material-icons text-5xl">pets</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{selectedPet.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="opacity-80">Especie:</span>
                    <p className="font-medium">{selectedPet.species}</p>
                  </div>
                  <div>
                    <span className="opacity-80">Raza:</span>
                    <p className="font-medium">{selectedPet.breed}</p>
                  </div>
                  <div>
                    <span className="opacity-80">Edad:</span>
                    <p className="font-medium">{selectedPet.age} años</p>
                  </div>
                  <div>
                    <span className="opacity-80">Peso:</span>
                    <p className="font-medium">{selectedPet.weight} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diagnoses Timeline */}
        {diagnoses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">history</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin historial médico</h3>
            <p className="text-gray-600">{selectedPet?.name} aún no tiene diagnósticos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            {diagnoses.map((diagnosis, index) => (
              <div key={diagnosis.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                      <span className="material-icons text-teal text-xl">medical_services</span>
                    </div>
                    {index < diagnoses.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {diagnosis.appointment?.service?.name || 'Consulta Médica'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(diagnosis.date || diagnosis.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      {diagnosis.veterinarian && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Veterinario</p>
                          <p className="text-sm font-medium text-gray-800">{diagnosis.veterinarian.name}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
                          {diagnosis.description || 'Sin descripción'}
                        </p>
                      </div>
                      {diagnosis.treatment && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Tratamiento</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">{diagnosis.treatment}</p>
                        </div>
                      )}
                      {diagnosis.medications && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Medicamentos</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">{diagnosis.medications}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerHistory;
