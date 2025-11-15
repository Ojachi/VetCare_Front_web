import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { appointmentApi } from '../../api/services';
// import { diagnosisApi } from '../../api/services'; // No disponible en backend actual
import { useAuth } from '../../context/AuthContext';

const VeterinarianAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ status: 'ALL', date: '' });
  const [feedback, setFeedback] = useState(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState({ observations: '', treatment: '', medications: '' });

  const navigation = [
    { path: '/veterinarian/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/veterinarian/appointments', icon: 'event', label: 'Citas' },
    { path: '/veterinarian/diagnoses', icon: 'medical_services', label: 'Diagnósticos' },
  ];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getAll();
      setAppointments(res.data || []);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error al cargar citas' });
    } finally {
      setLoading(false);
    }
  };

  const myAppointments = useMemo(() => {
    if (!user) return [];
    return (appointments || []).filter(a => (a.assignedTo?.id || a.assignedToId) === user.id);
  }, [appointments, user]);

  const filteredAppointments = useMemo(() => {
    let list = myAppointments;
    if (filters.status !== 'ALL') list = list.filter(a => a.status === filters.status);
    if (filters.date) list = list.filter(a => (a.datetime || a.date)?.startsWith(filters.date));
    return list;
  }, [myAppointments, filters]);

  const completeAppointment = async (appointmentId) => {
    try {
      if (appointmentApi.complete) {
        await appointmentApi.complete(appointmentId);
      } else {
        await appointmentApi.updateStatus(appointmentId, 'COMPLETED');
      }
      setFeedback({ type: 'success', message: 'Cita marcada como completada' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo completar la cita' });
    }
  };

  const openDiagnosis = (appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosisData({ observations: '', treatment: '', medications: '' });
    setShowDiagnosisModal(true);
  };

  const submitDiagnosis = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      // Los diagnósticos no están implementados en el backend actual
      // Solo marcar cita como completada
      if (appointmentApi.complete) {
        await appointmentApi.complete(selectedAppointment.id);
      } else {
        await appointmentApi.updateStatus(selectedAppointment.id, 'COMPLETED');
      }
      setFeedback({ type: 'success', message: 'Cita marcada como completada' });
      setShowDiagnosisModal(false);
      setSelectedAppointment(null);
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: e.response?.data?.message || 'Error al completar cita' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Citas Asignadas</h1>
            <p className="text-gray-600 mt-2">Gestiona y atiende tus citas</p>
          </div>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>{feedback.message}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal">
                <option value="ALL">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">event</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay citas</h3>
            <p className="text-gray-600">No tienes citas asignadas con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(ap => (
              <div key={ap.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ap.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : ap.status === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' : ap.status === 'COMPLETADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ap.status}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{ap.pet?.name} - {ap.service?.name}</h3>
                    <p className="text-sm text-gray-600">Dueño: {ap.pet?.owner?.name || '—'}</p>
                    {ap.notes && <p className="text-sm text-gray-600 mt-2">Notas: {ap.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    {ap.status !== 'COMPLETADA' && (
                      <button onClick={() => openDiagnosis(ap)} className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md">Crear Diagnóstico</button>
                    )}
                    {ap.status !== 'COMPLETADA' && (
                      <button onClick={() => completeAppointment(ap.id)} className="px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 rounded-md">Marcar Completada</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDiagnosisModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo Diagnóstico</h2>
              <form onSubmit={submitDiagnosis} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea value={diagnosisData.observations} onChange={e => setDiagnosisData({ ...diagnosisData, observations: e.target.value })} required rows={3} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
                  <textarea value={diagnosisData.treatment} onChange={e => setDiagnosisData({ ...diagnosisData, treatment: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicamentos</label>
                  <textarea value={diagnosisData.medications} onChange={e => setDiagnosisData({ ...diagnosisData, medications: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowDiagnosisModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg">Registrar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VeterinarianAppointments;
