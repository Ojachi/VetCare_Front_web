import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SearchableDropdown from '../../components/SearchableDropdown';
import { appointmentApi } from '../../api/services';

const EmployeeAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [filters, setFilters] = useState({ status: 'ALL', date: '' });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });

  const statusOptions = useMemo(() => ([
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'ACCEPTED', label: 'Confirmada' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
  ]), []);

  const navigation = [
    { path: '/employee/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/employee/pets', icon: 'pets', label: 'Mascotas' },
    { path: '/employee/appointments', icon: 'event', label: 'Citas' },
  ];

  // Extraer veterinarios únicos de las citas existentes
  const veterinarians = useMemo(() => {
    const vetsMap = new Map();
    appointments.forEach(apt => {
      if (apt.assignedTo && apt.assignedTo.role === 'VETERINARIAN') {
        vetsMap.set(apt.assignedTo.id, apt.assignedTo);
      }
    });
    return Array.from(vetsMap.values());
  }, [appointments]);

  const assignableVeterinarians = useMemo(() => ([
    { id: '', name: 'Asignar veterinario', email: '' },
    ...veterinarians,
  ]), [veterinarians]);

  const canReschedule = (status) => ['PENDING', 'ACCEPTED'].includes(status);

  const toInputDate = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().split('T')[0];
  };

  const toInputTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const openReschedule = (appointment) => {
    setRescheduleTarget(appointment);
    setRescheduleForm({
      date: toInputDate(appointment.startDateTime),
      time: toInputTime(appointment.startDateTime),
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    if (!rescheduleForm.date || !rescheduleForm.time) {
      setFeedback({ type: 'error', message: 'Selecciona fecha y hora válidas.' });
      return;
    }

    try {
      const payload = {
        petId: rescheduleTarget.pet?.id || rescheduleTarget.petId,
        serviceId: rescheduleTarget.service?.id || rescheduleTarget.serviceId,
        assignedToId: rescheduleTarget.assignedTo?.id || rescheduleTarget.assignedToId || null,
        startDateTime: `${rescheduleForm.date}T${rescheduleForm.time}`,
        note: rescheduleTarget.note || '',
      };
      await appointmentApi.update(rescheduleTarget.id, payload);
      setFeedback({ type: 'success', message: 'Cita reprogramada correctamente.' });
      setShowRescheduleModal(false);
      setRescheduleTarget(null);
      load();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'No se pudo reprogramar la cita' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Para empleados queremos ver todas las citas: intentamos /appointments/admin primero
      // (el backend permite EMPLOYEE aquí). Si falla (403), caemos a /appointments
      let apptRes;
      try {
        apptRes = await appointmentApi.getAllAdmin();
        console.log('Citas desde /appointments/admin:', apptRes.data);
      } catch (adminError) {
        console.log('Sin acceso a /appointments/admin, usando /appointments');
        apptRes = await appointmentApi.getAll();
        console.log('Citas desde /appointments:', apptRes.data);
      }

      setAppointments(apptRes?.data || []);
    } catch (e) {
      console.error('Error al cargar citas:', e);
      setFeedback({ type: 'error', message: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    let list = appointments;
    console.log('Appointments antes de filtrar:', list);
    if (filters.status !== 'ALL') list = list.filter(a => a.status === filters.status);
    if (filters.date) list = list.filter(a => (a.startDateTime || a.datetime || a.date)?.startsWith(filters.date));
    console.log('Appointments después de filtrar:', list);
    return list;
  }, [appointments, filters]);

  const handleCancel = async (id) => {
    if (!confirm('¿Deseas cancelar esta cita?')) return;
    try {
      await appointmentApi.cancel(id);
      setFeedback({ type: 'success', message: 'Cita cancelada' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo cancelar' });
    }
  };

  const handleConfirm = async (id) => {
    try {
      if (appointmentApi.confirm) {
        await appointmentApi.confirm(id);
        setFeedback({ type: 'success', message: 'Cita confirmada' });
      } else {
        await appointmentApi.updateStatus(id, 'ACCEPTED');
        setFeedback({ type: 'success', message: 'Cita confirmada' });
      }
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo confirmar' });
    }
  };

  const handleAssignVet = async (appointmentId, assignedToId) => {
    try {
      // Encontrar la cita completa para enviar todos los campos requeridos
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) {
        setFeedback({ type: 'error', message: 'Cita no encontrada' });
        return;
      }
      
      // Enviar todos los campos requeridos por el backend
      const updateData = {
        petId: appointment.pet?.id || appointment.petId,
        serviceId: appointment.service?.id || appointment.serviceId,
        startDateTime: appointment.startDateTime || appointment.datetime,
        assignedToId: assignedToId,
        note: appointment.note || ''
      };
      
      await appointmentApi.update(appointmentId, updateData);
      setFeedback({ type: 'success', message: 'Asignación actualizada' });
      load();
    } catch (e) {
      console.error('Error al asignar veterinario:', e);
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo asignar' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">event</span>
              <h1 className="text-3xl font-bold text-gray-800">Citas</h1>
            </div>
            <p className="text-gray-600 mt-2">Gestiona y confirma las citas del sistema</p>
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
            <p className="text-gray-600">No se encontraron citas con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(ap => (
              <div key={ap.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ap.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ap.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : ap.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ap.status}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{ap.pet?.name} - {ap.service?.name}</h3>
                    <p className="text-sm text-gray-600">Dueño: {ap.pet?.owner?.name || ap.owner?.name || '—'}</p>
                    <p className="text-sm text-gray-600">Veterinario: {ap.assignedTo?.name || 'Por asignar'}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2 w-48">
                      <SearchableDropdown
                        options={assignableVeterinarians}
                        value={ap.assignedTo?.id || ''}
                        onChange={(val) => handleAssignVet(ap.id, val || '')}
                        placeholder="Asignar veterinario"
                        getOptionLabel={(vet) => vet?.name || 'Sin asignar'}
                        getOptionSecondary={(vet) => vet?.email || ''}
                        getSearchableText={(vet) => `${vet?.name || ''} ${vet?.email || ''}`}
                        sort={false}
                      />
                    </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          {ap.status === 'PENDING' && (
                            <button onClick={() => handleConfirm(ap.id)} className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md">Confirmar</button>
                          )}
                          {ap.status !== 'CANCELLED' && (
                            <button onClick={() => handleCancel(ap.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md">Cancelar</button>
                          )}
                        </div>
                        {canReschedule(ap.status) && (
                          <button
                            onClick={() => openReschedule(ap)}
                            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
                          >
                            Reprogramar
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showRescheduleModal && rescheduleTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Reprogramar cita</h2>
              <p className="text-sm text-gray-600 mb-4">
                {rescheduleTarget.pet?.name} — {rescheduleTarget.service?.name}
              </p>
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva fecha</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleForm.date}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva hora</label>
                    <input
                      type="time"
                      value={rescheduleForm.time}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
                      required
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setRescheduleTarget(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg"
                  >
                    Guardar cambios
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

export default EmployeeAppointments;
