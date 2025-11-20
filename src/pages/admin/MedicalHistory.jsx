import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SearchableDropdown from '../../components/SearchableDropdown';
import { diagnosisApi, petApi, userApi } from '../../api/services';

const AdminMedicalHistory = () => {
  const [loading, setLoading] = useState(true);
  const [diagnoses, setDiagnoses] = useState([]);
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({
    ownerId: 'ALL',
    petId: 'ALL',
    veterinarianId: 'ALL',
    search: '',
  });
  const [feedback, setFeedback] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const navigation = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'groups', label: 'Usuarios' },
    { path: '/admin/services', icon: 'build', label: 'Servicios' },
    { path: '/admin/appointments', icon: 'event', label: 'Citas' },
    { path: '/admin/medical-history', icon: 'medical_services', label: 'Historial Médico' },
  ];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [diagRes, userRes, petsRes] = await Promise.all([
        diagnosisApi.getAdmin(),
        userApi.getAllAdmin(),
        petApi.getAll(),
      ]);
      setDiagnoses(diagRes.data || []);
      setUsers(userRes.data || []);
      setPets(petsRes.data || []);
    } catch (error) {
      console.error('Error cargando historial médico:', error);
      setFeedback({ type: 'error', message: 'No se pudieron cargar los diagnósticos' });
    } finally {
      setLoading(false);
    }
  };

  const owners = useMemo(() => (users || []).filter(u => u.role === 'OWNER'), [users]);
  const veterinarians = useMemo(() => (users || []).filter(u => u.role === 'VETERINARIAN'), [users]);

  const ownerOptions = useMemo(() => [
    { id: 'ALL', name: 'Todos los dueños', email: '' },
    ...owners,
  ], [owners]);

  const veterinarianOptions = useMemo(() => [
    { id: 'ALL', name: 'Todos los veterinarios', email: '' },
    ...veterinarians,
  ], [veterinarians]);

  const petOptions = useMemo(() => {
    if (filters.ownerId === 'ALL') {
      return [{ id: 'ALL', name: 'Todas las mascotas' }, ...pets];
    }
    const filtered = pets.filter(p => {
      const ownerId = p.owner?.id;
      return String(ownerId) === String(filters.ownerId);
    });
    return [{ id: 'ALL', name: 'Todas las mascotas' }, ...filtered];
  }, [pets, filters.ownerId]);

  useEffect(() => {
    if (filters.ownerId !== 'ALL' && filters.petId !== 'ALL') {
      const exists = petOptions.some(p => String(p.id) === String(filters.petId));
      if (!exists) {
        setFilters(prev => ({ ...prev, petId: 'ALL' }));
      }
    }
  }, [filters.ownerId, filters.petId, petOptions]);

  const filteredDiagnoses = useMemo(() => {
    let list = diagnoses || [];

    if (filters.ownerId !== 'ALL') {
      list = list.filter(d => {
        const ownerId = d.appointment?.pet?.owner?.id;
        return ownerId && String(ownerId) === String(filters.ownerId);
      });
    }

    if (filters.petId !== 'ALL') {
      list = list.filter(d => {
        const petId = d.appointment?.pet?.id;
        return petId && String(petId) === String(filters.petId);
      });
    }

    if (filters.veterinarianId !== 'ALL') {
      list = list.filter(d => {
        const vetId = d.appointment?.assignedTo?.id;
        return vetId && String(vetId) === String(filters.veterinarianId);
      });
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      list = list.filter(d => {
        const petName = d.appointment?.pet?.name?.toLowerCase() || '';
        const ownerName = d.appointment?.pet?.owner?.name?.toLowerCase() || '';
        const vetName = d.appointment?.assignedTo?.name?.toLowerCase() || '';
        const serviceName = d.appointment?.service?.name?.toLowerCase() || '';
        return [petName, ownerName, vetName, serviceName].some(value => value.includes(term));
      });
    }
    return list;
  }, [diagnoses, filters]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    try {
      const date = new Date(dateTimeStr);
      return `${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} • ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateTimeStr;
    }
  };

  const handleDownloadPdf = async (diagnosisId) => {
    setDownloadingId(diagnosisId);
    try {
      const response = await diagnosisApi.downloadPdf(diagnosisId);
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostico_${diagnosisId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar diagnóstico:', error);
      setFeedback({ type: 'error', message: 'No se pudo descargar el diagnóstico' });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">medical_services</span>
              <h1 className="text-3xl font-bold text-gray-800">Historial Médico</h1>
            </div>
            <p className="text-gray-600 mt-2">Revisa todos los diagnósticos registrados en el sistema.</p>
          </div>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>
            {feedback.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Dueño</label>
              <SearchableDropdown
                options={ownerOptions}
                value={filters.ownerId}
                onChange={(val) => setFilters(prev => ({ ...prev, ownerId: val || 'ALL' }))}
                placeholder="Filtrar por dueño"
                getOptionLabel={(owner) => owner?.name || owner?.email || 'Todos'}
                getOptionSecondary={(owner) => owner?.email}
                getSearchableText={(owner) => `${owner?.name || ''} ${owner?.email || ''}`}
                sort={false}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Mascota</label>
              <SearchableDropdown
                options={petOptions}
                value={filters.petId}
                onChange={(val) => setFilters(prev => ({ ...prev, petId: val || 'ALL' }))}
                placeholder={filters.ownerId === 'ALL' ? 'Selecciona una mascota' : 'Mascotas del dueño seleccionado'}
                getOptionLabel={(pet) => pet?.name || 'Todas las mascotas'}
                getSearchableText={(pet) => pet?.name || ''}
                sort={filters.ownerId === 'ALL'}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Veterinario</label>
              <SearchableDropdown
                options={veterinarianOptions}
                value={filters.veterinarianId}
                onChange={(val) => setFilters(prev => ({ ...prev, veterinarianId: val || 'ALL' }))}
                placeholder="Filtrar por veterinario"
                getOptionLabel={(vet) => vet?.name || 'Todos'}
                getOptionSecondary={(vet) => vet?.email || ''}
                getSearchableText={(vet) => `${vet?.name || ''} ${vet?.email || ''}`}
                sort={false}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="Mascota, servicio, dueño..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
          </div>
        ) : filteredDiagnoses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">medical_services</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay diagnósticos</h3>
            <p className="text-gray-600">Ajusta los filtros o verifica que existan diagnósticos registrados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${diagnosis.active ? 'bg-teal/10 text-teal' : 'bg-gray-100 text-gray-600'}`}>
                        {diagnosis.active ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(diagnosis.date)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {diagnosis.appointment?.pet?.name || 'Mascota'} — {diagnosis.appointment?.service?.name || 'Consulta'}
                    </h3>
                    <p className="text-sm text-gray-600">Dueño: {diagnosis.appointment?.pet?.owner?.name || '—'}</p>
                    <p className="text-sm text-gray-600">Veterinario: {diagnosis.appointment?.assignedTo?.name || '—'}</p>
                    <p className="text-sm text-gray-600">Cita: {formatDateTime(diagnosis.appointment?.startDateTime)}</p>
                    <div className="mt-3 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">{diagnosis.description}</p>
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
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <button
                      onClick={() => handleDownloadPdf(diagnosis.id)}
                      disabled={downloadingId === diagnosis.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-teal rounded-md border border-teal/40 hover:bg-teal/10 disabled:opacity-50"
                    >
                      <span className="material-icons text-base">picture_as_pdf</span>
                      {downloadingId === diagnosis.id ? 'Descargando...' : 'Descargar PDF'}
                    </button>
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

export default AdminMedicalHistory;

