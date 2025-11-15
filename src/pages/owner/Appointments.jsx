import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ServiceSelector from '../../components/ServiceSelector';
import { appointmentApi, petApi, serviceApi } from '../../api/services';

const OwnerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ petId: '', serviceId: '', date: '', time: '', assignedToId: '' });
  const [feedback, setFeedback] = useState(null);

  const navigation = [
    { path: '/owner/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/owner/pets', icon: 'pets', label: 'Mis Mascotas' },
    { path: '/owner/appointments', icon: 'event', label: 'Mis Citas' },
    { path: '/owner/history', icon: 'history', label: 'Historial Médico' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsRes, petsRes, servicesRes] = await Promise.all([
        appointmentApi.getAll(),
        petApi.getAll(),
        serviceApi.getAll(),
      ]);
      setAppointments(appointmentsRes.data || []);
      setPets(petsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const startDateTime = `${formData.date}T${formData.time}`;
      await appointmentApi.create({ ...formData, startDateTime });
      setFeedback({ type: 'success', message: 'Cita agendada exitosamente' });
      setShowModal(false);
      setFormData({ petId: '', serviceId: '', date: '', time: '', assignedToId: '' });
      loadData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Error al agendar cita' });
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Deseas cancelar esta cita?')) return;
    try {
      await appointmentApi.cancel(id);
      setFeedback({ type: 'success', message: 'Cita cancelada' });
      loadData();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Error al cancelar' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Citas</h1>
            <p className="text-gray-600 mt-2">Gestiona las citas de tus mascotas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg"
          >
            <span className="material-icons">add</span>
            <span>Agendar Cita</span>
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
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">event</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No tienes citas</h3>
            <p className="text-gray-600 mb-6">Agenda tu primera cita para tus mascotas</p>
            <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-teal text-white rounded-lg">Agendar Cita</button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(appointment.startDateTime).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-sm text-gray-500">{new Date(appointment.startDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{appointment.pet?.name} - {appointment.service?.name}</h3>
                    <p className="text-sm text-gray-600">Veterinario: {appointment.assignedTo?.name || 'Por asignar'}</p>
                  </div>
                  {appointment.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Agendar Cita</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mascota</label>
                  <select
                    required
                    value={formData.petId}
                    onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="">Selecciona una mascota</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                  <ServiceSelector
                    services={services}
                    value={formData.serviceId}
                    onChange={(serviceId) => setFormData({ ...formData, serviceId })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  />
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
                    Agendar
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

export default OwnerAppointments;
