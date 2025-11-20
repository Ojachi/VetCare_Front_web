import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SearchableDropdown from '../../components/SearchableDropdown';
import { diagnosisApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const VeterinarianDiagnosis = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [diagnoses, setDiagnoses] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: 'ALL', search: '' });
  const [feedback, setFeedback] = useState(null);
  const [actionState, setActionState] = useState({ type: null, id: null });

  const navigation = [
    { path: '/veterinarian/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/veterinarian/appointments', icon: 'event', label: 'Citas' },
    { path: '/veterinarian/diagnoses', icon: 'medical_services', label: 'Diagnósticos' },
  ];

  const statusOptions = useMemo(() => ([
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'ACTIVE', label: 'Activos' },
    { value: 'INACTIVE', label: 'Inactivos' },
  ]), []);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      let response;
      if (user?.role === 'ADMIN') {
        response = await diagnosisApi.getAll();
      } else if (diagnosisApi.getMine) {
        response = await diagnosisApi.getMine();
      } else {
        response = await diagnosisApi.getAll();
      }
      setDiagnoses(response.data || []);
    } catch (e) {
      console.error('Error al cargar diagnósticos:', e);
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudieron cargar los diagnósticos' });
      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  };

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

  const filtered = useMemo(() => {
    let list = diagnoses;
    if (filters.date) {
      list = list.filter((d) => (d.date || '').startsWith(filters.date));
    }
    if (filters.status === 'ACTIVE') list = list.filter((d) => d.active);
    if (filters.status === 'INACTIVE') list = list.filter((d) => !d.active);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      list = list.filter((d) => {
        const petName = d.appointment?.pet?.name?.toLowerCase() || '';
        const ownerName = d.appointment?.pet?.owner?.name?.toLowerCase() || '';
        const serviceName = d.appointment?.service?.name?.toLowerCase() || '';
        return petName.includes(term) || ownerName.includes(term) || serviceName.includes(term);
      });
    }
    return list;
  }, [diagnoses, filters]);

  const handleToggleActive = async (diagnosis) => {
    setActionState({ type: 'toggle', id: diagnosis.id });
    try {
      if (diagnosis.active) {
        await diagnosisApi.deactivate(diagnosis.id);
        setFeedback({ type: 'success', message: 'Diagnóstico desactivado' });
      } else {
        await diagnosisApi.activate(diagnosis.id);
        setFeedback({ type: 'success', message: 'Diagnóstico activado' });
      }
      await load();
    } catch (e) {
      console.error('Error al actualizar diagnóstico:', e);
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo actualizar el diagnóstico' });
    } finally {
      setActionState({ type: null, id: null });
    }
  };

  const handleDownloadPdf = async (diagnosisId) => {
    setActionState({ type: 'pdf', id: diagnosisId });
    try {
      const response = await diagnosisApi.downloadPdf(diagnosisId);
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostico_${diagnosisId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al descargar PDF:', e);
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo descargar el diagnóstico' });
    } finally {
      setActionState({ type: null, id: null });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">assignment_ind</span>
              <h1 className="text-3xl font-bold text-gray-800">Diagnósticos</h1>
            </div>
            <p className="text-gray-600 mt-2">Historial de diagnósticos registrados</p>
          </div>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>
            {feedback.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <SearchableDropdown
                options={statusOptions}
                value={filters.status}
                onChange={(val) => setFilters({ ...filters, status: val || 'ALL' })}
                placeholder="Filtrar por estado"
                valueKey="value"
                getOptionLabel={(opt) => opt.label}
                sort={false}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Mascota, dueño o servicio"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">medical_services</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay diagnósticos</h3>
            <p className="text-gray-600">No se encontraron diagnósticos con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((diagnosis) => (
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
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    <button
                      onClick={() => handleDownloadPdf(diagnosis.id)}
                      disabled={actionState.type === 'pdf' && actionState.id === diagnosis.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-teal rounded-md border border-teal/40 hover:bg-teal/10 disabled:opacity-50"
                    >
                      <span className="material-icons text-base">picture_as_pdf</span>
                      {actionState.type === 'pdf' && actionState.id === diagnosis.id ? 'Descargando...' : 'Descargar PDF'}
                    </button>
                    <button
                      onClick={() => handleToggleActive(diagnosis)}
                      disabled={actionState.type === 'toggle' && actionState.id === diagnosis.id}
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md ${
                        diagnosis.active ? 'text-red-600 border border-red-200 hover:bg-red-50' : 'text-green-600 border border-green-200 hover:bg-green-50'
                      } disabled:opacity-50`}
                    >
                      <span className="material-icons text-base">{diagnosis.active ? 'block' : 'check_circle'}</span>
                      {actionState.type === 'toggle' && actionState.id === diagnosis.id
                        ? 'Actualizando...'
                        : diagnosis.active
                        ? 'Desactivar'
                        : 'Activar'}
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

export default VeterinarianDiagnosis;
