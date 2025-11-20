import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SearchableDropdown from '../../components/SearchableDropdown';
import { appointmentApi, diagnosisApi } from '../../api/services';
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

  const normalizeStatus = (s) => {
    if (!s) return '';
    const map = {
      PENDIENTE: 'PENDING',
      PENDING: 'PENDING',
      CONFIRMADA: 'ACCEPTED',
      ACCEPTED: 'ACCEPTED',
      COMPLETADA: 'COMPLETED',
      COMPLETED: 'COMPLETED',
      CANCELADA: 'CANCELLED',
      CANCELLED: 'CANCELLED',
    };
    const normalized = map[s.toUpperCase()];
    return normalized || s.toUpperCase();
  };

  const STATUS_CONFIG = {
    PENDING: { label: 'Pendiente', badge: 'bg-yellow-100 text-yellow-800' },
    ACCEPTED: { label: 'Confirmada', badge: 'bg-blue-100 text-blue-800' },
    COMPLETED: { label: 'Completada', badge: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelada', badge: 'bg-red-100 text-red-800' },
  };

  const statusOptions = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'ACCEPTED', label: 'Confirmada' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
  ];

  const navigation = [
    { path: '/veterinarian/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/veterinarian/appointments', icon: 'event', label: 'Citas' },
    { path: '/veterinarian/diagnoses', icon: 'medical_services', label: 'Diagnósticos' },
  ];

  useEffect(() => {
    load();
  }, []);

  const parseDiagnosisFromNote = (note) => {
    if (!note) return null;
    try {
      const parsed = JSON.parse(note);
      if (parsed?.type === 'DIAGNOSIS_V1' && parsed.diagnosis) {
        return parsed.diagnosis;
      }
    } catch (e) {
      // nota no es JSON válido, ignorar
    }
    return null;
  };

  const enrichAppointment = (appointment) => {
    if (!appointment) return appointment;
    const diagnosis = appointment.diagnosis || parseDiagnosisFromNote(appointment.note);
    return diagnosis ? { ...appointment, diagnosis } : appointment;
  };

  const load = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, diagnosesRes] = await Promise.all([
        appointmentApi.getAll(),
        diagnosisApi?.getMine ? diagnosisApi.getMine() : Promise.resolve({ data: [] }),
      ]);

      const rawAppointments = appointmentsRes.data || [];
      const appointmentsWithNotes = rawAppointments.map(enrichAppointment);

      const diagnosisByAppointmentId = {};
      (diagnosesRes?.data || []).forEach((diagnosis) => {
        const appointmentId = diagnosis.appointment?.id;
        if (appointmentId) {
          diagnosisByAppointmentId[appointmentId] = diagnosis;
        }
      });

      const merged = appointmentsWithNotes.map((appointment) => {
        const diagnosis = diagnosisByAppointmentId[appointment.id];
        return diagnosis ? { ...appointment, diagnosis } : appointment;
      });

      setAppointments(merged);
    } catch (e) {
      console.error('Error al cargar citas o diagnósticos:', e);
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
    if (filters.status !== 'ALL') list = list.filter(a => normalizeStatus(a.status) === filters.status);
    if (filters.date) list = list.filter(a => (a.startDateTime || a.datetime || a.date || '').startsWith(filters.date));
    return list;
  }, [myAppointments, filters]);

  const appointmentHasDiagnosis = (appointment) => {
    if (!appointment) return false;
    if (appointment.diagnosis) return true;
    if (appointment.diagnosisId) return true;
    if (Array.isArray(appointment.diagnoses) && appointment.diagnoses.length > 0) return true;
    if (parseDiagnosisFromNote(appointment.note)) return true;
    return false;
  };

  const assignedToVeterinarian = (appointment) => {
    if (!appointment) return false;
    const role = appointment.assignedTo?.role || appointment.assignedToRole || appointment.assignedTo?.roleName;
    return role === 'VETERINARIAN';
  };

  const canCompleteWithoutDiagnosis = (appointment) => {
    if (!appointment) return true;
    return !assignedToVeterinarian(appointment) || appointmentHasDiagnosis(appointment);
  };

  const getCurrentLocalDate = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const ap = appointments.find(a => a.id === appointmentId);
      const currentStatus = normalizeStatus(ap?.status);
      if (currentStatus !== 'ACCEPTED') {
        setFeedback({ type: 'error', message: 'Primero debes confirmar la cita antes de completarla' });
        return;
      }
      if (!canCompleteWithoutDiagnosis(ap)) {
        setFeedback({ type: 'error', message: 'Registra un diagnóstico antes de completar esta cita' });
        return;
      }

      if (appointmentApi.complete) {
        await appointmentApi.complete(appointmentId);
      } else {
        await appointmentApi.updateStatus(appointmentId, 'COMPLETED');
      }
      setFeedback({ type: 'success', message: 'Cita marcada como completada' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo completar la cita' });
    }
  };

  const openDiagnosis = (appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosisData({ observations: '', treatment: '', medications: '' });
    setShowDiagnosisModal(true);
  };

  const handleAccept = async (appointmentId) => {
    try {
      if (appointmentApi.confirm) {
        await appointmentApi.confirm(appointmentId);
      } else {
        await appointmentApi.updateStatus(appointmentId, 'ACCEPTED');
      }
      setFeedback({ type: 'success', message: 'Cita confirmada' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo confirmar la cita' });
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await appointmentApi.cancel(appointmentId);
      setFeedback({ type: 'success', message: 'Cita cancelada' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo cancelar' });
    }
  };

  const canEditDiagnosis = (appointment) => normalizeStatus(appointment?.status) === 'ACCEPTED';

  const submitDiagnosis = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    const currentStatus = normalizeStatus(selectedAppointment.status);
    if (currentStatus !== 'ACCEPTED' && currentStatus !== 'COMPLETED') {
      setFeedback({ type: 'error', message: 'Solo puedes registrar diagnósticos en citas confirmadas o completadas' });
      return;
    }

    const description = diagnosisData.observations.trim();
    if (!description) {
      setFeedback({ type: 'error', message: 'Las observaciones son obligatorias' });
      return;
    }

    const payload = {
      appointmentId: selectedAppointment.id,
      description,
      treatment: diagnosisData.treatment?.trim() || null,
      medications: diagnosisData.medications?.trim() || null,
      date: getCurrentLocalDate(),
      active: true,
    };

    try {
      if (currentStatus !== 'COMPLETED') {
        if (appointmentApi.complete) {
          await appointmentApi.complete(selectedAppointment.id);
        } else {
          await appointmentApi.updateStatus(selectedAppointment.id, 'COMPLETED');
        }
      }

      await diagnosisApi.create(payload);
      setFeedback({ type: 'success', message: 'Diagnóstico registrado. Ahora puedes completar la cita.' });
      setShowDiagnosisModal(false);
      setSelectedAppointment(null);
      setDiagnosisData({ observations: '', treatment: '', medications: '' });
      await load();
    } catch (error) {
      console.error('Error al guardar diagnóstico:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'No se pudo guardar el diagnóstico' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">event_available</span>
              <h1 className="text-3xl font-bold text-gray-800">Citas Asignadas</h1>
            </div>
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
            {filteredAppointments.map(ap => {
              const normalized = normalizeStatus(ap.status);
              const disableComplete = normalized === 'COMPLETED' || !canCompleteWithoutDiagnosis(ap);
              return (
              <div key={ap.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[normalized]?.badge || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_CONFIG[normalized]?.label || ap.status}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{ap.pet?.name} - {ap.service?.name}</h3>
                    <p className="text-sm text-gray-600">Dueño: {ap.pet?.owner?.name || '—'}</p>
                    {ap.notes && <p className="text-sm text-gray-600 mt-2">Notas: {ap.notes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {normalized === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAccept(ap.id)}
                          className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleCancel(ap.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {normalized === 'ACCEPTED' && (
                      <>
                        <button
                          onClick={() => openDiagnosis(ap)}
                          className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md"
                        >
                          Registrar Diagnóstico
                        </button>
                        <button
                          onClick={() => completeAppointment(ap.id)}
                          disabled={disableComplete}
                          className={`px-3 py-1.5 text-sm rounded-md ${
                            disableComplete
                              ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                              : 'text-green-700 hover:bg-green-50'
                          }`}
                        >
                          Marcar Completada
                        </button>
                      </>
                    )}
                  </div>
                  {normalized === 'ACCEPTED' && !canCompleteWithoutDiagnosis(ap) && (
                    <p className="text-xs text-red-600 mt-2 text-right">
                      Registra un diagnóstico antes de completar la cita.
                    </p>
                  )}
                </div>
              </div>
            )})}
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
