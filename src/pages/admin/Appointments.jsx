import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { appointmentApi, serviceApi, userApi, petApi } from '../../api/services';

const AdminAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [filters, setFilters] = useState({ status: 'ALL', date: '', veterinarianId: 'ALL' });
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    ownerId: '',
    petId: '',
    serviceId: '',
    date: '',
    time: '',
    veterinarianId: '',
  });

  const navigation = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'groups', label: 'Usuarios' },
    { path: '/admin/services', icon: 'build', label: 'Servicios' },
    { path: '/admin/appointments', icon: 'event', label: 'Citas' },
  ];

  const owners = useMemo(() => (users || []).filter(u => u.role === 'OWNER'), [users]); // ✅ Cambio: OWNER en lugar de DUENO
  const veterinarians = useMemo(() => (users || []).filter(u => u.role === 'VETERINARIAN'), [users]); // ✅ Cambio: VETERINARIAN en lugar de VETERINARIO
  const petsByOwner = useMemo(() => pets.filter(p => (p.owner?.id || p.ownerId) === formData.ownerId), [pets, formData.ownerId]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [apptRes, servRes, usersRes, petsRes] = await Promise.all([
        appointmentApi.getAll(),
        serviceApi.getAll(),
        userApi.getAll(),
        petApi.getAll(),
      ]);
      setAppointments(apptRes.data || []);
      setServices(servRes.data || []);
      setUsers(usersRes.data || []);
      setPets(petsRes.data || []);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    let list = appointments;
    if (filters.status !== 'ALL') list = list.filter(a => a.status === filters.status);
    if (filters.date) list = list.filter(a => (a.datetime || a.date)?.startsWith(filters.date));
    if (filters.veterinarianId !== 'ALL') list = list.filter(a => (a.veterinarian?.id || a.veterinarianId) === filters.veterinarianId);
    return list;
  }, [appointments, filters]);

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return;
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
      } else {
        await appointmentApi.update(id, { status: 'CONFIRMADA' });
      }
      setFeedback({ type: 'success', message: 'Cita confirmada' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo confirmar' });
    }
  };

  const handleAssignVet = async (appointmentId, veterinarianId) => {
    try {
      if (appointmentApi.assignVeterinarian) {
        await appointmentApi.assignVeterinarian(appointmentId, veterinarianId);
      } else {
        await appointmentApi.update(appointmentId, { veterinarianId });
      }
      setFeedback({ type: 'success', message: 'Veterinario asignado' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo asignar' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datetime = `${formData.date}T${formData.time}`;
      await appointmentApi.create({ ...formData, datetime });
      setFeedback({ type: 'success', message: 'Cita creada' });
      setShowModal(false);
      setFormData({ ownerId: '', petId: '', serviceId: '', date: '', time: '', veterinarianId: '' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: e.response?.data?.message || 'Error al crear cita' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Citas</h1>
            <p className="text-gray-600 mt-2">Gestiona todas las citas del sistema</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg">
            <span className="material-icons">add</span>
            <span>Nueva Cita</span>
          </button>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>{feedback.message}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario</label>
              <select value={filters.veterinarianId} onChange={e => setFilters({ ...filters, veterinarianId: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal">
                <option value="ALL">Todos</option>
                {veterinarians.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" /></div>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ap.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : ap.status === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' : ap.status === 'COMPLETADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ap.status}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.datetime).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{ap.pet?.name} - {ap.service?.name}</h3>
                    <p className="text-sm text-gray-600">Dueño: {ap.pet?.owner?.name || '—'}</p>
                    <p className="text-sm text-gray-600">Veterinario: {ap.veterinarian?.name || 'Por asignar'}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <select value={ap.veterinarian?.id || ''} onChange={(e) => handleAssignVet(ap.id, e.target.value)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal">
                        <option value="">Asignar Veterinario</option>
                        {veterinarians.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      {ap.status === 'PENDIENTE' && (
                        <button onClick={() => handleConfirm(ap.id)} className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md">Confirmar</button>
                      )}
                      {ap.status !== 'CANCELADA' && (
                        <button onClick={() => handleCancel(ap.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md">Cancelar</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Cita</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dueño</label>
                  <select required value={formData.ownerId} onChange={e => setFormData({ ...formData, ownerId: e.target.value, petId: '' })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal">
                    <option value="">Selecciona un dueño</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mascota</label>
                  <select required value={formData.petId} onChange={e => setFormData({ ...formData, petId: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal">
                    <option value="">Selecciona una mascota</option>
                    {petsByOwner.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                  <select required value={formData.serviceId} onChange={e => setFormData({ ...formData, serviceId: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal">
                    <option value="">Selecciona un servicio</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario (opcional)</label>
                  <select value={formData.veterinarianId} onChange={e => setFormData({ ...formData, veterinarianId: e.target.value })} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal">
                    <option value="">Sin asignar</option>
                    {veterinarians.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg">Crear</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAppointments;
