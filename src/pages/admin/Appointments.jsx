import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ServiceSelector from '../../components/ServiceSelector';
import SearchableDropdown from '../../components/SearchableDropdown';
import { appointmentApi, serviceApi, userApi, petApi } from '../../api/services';

const AdminAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [filters, setFilters] = useState({ status: 'ALL', date: '', veterinarianId: 'ALL', serviceId: 'ALL' });
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

  const owners = useMemo(() => (
    (users || []).filter(u => u.role === 'OWNER' && (u.active ?? u.enabled ?? true))
  ), [users]);
  const veterinarians = useMemo(() => (users || []).filter(u => u.role === 'VETERINARIAN'), [users]);
  const activeServices = useMemo(() => (
    (services || []).filter(s => s.active ?? true)
  ), [services]);
  const petsByOwner = useMemo(() => {
    if (!formData.ownerId) return [];
    return pets.filter(p => {
      const petOwnerId = p.owner?.id;
      return petOwnerId && Number(petOwnerId) === Number(formData.ownerId);
    });
  }, [pets, formData.ownerId]);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!formData.ownerId) return;
    const ownerStillActive = owners.some(o => String(o.id) === String(formData.ownerId));
    if (!ownerStillActive) {
      setFormData(prev => ({ ...prev, ownerId: '', petId: '' }));
    }
  }, [owners, formData.ownerId]);

  useEffect(() => {
    if (!formData.serviceId) return;
    const serviceStillActive = activeServices.some(s => String(s.id) === String(formData.serviceId));
    if (!serviceStillActive) {
      setFormData(prev => ({ ...prev, serviceId: '' }));
    }
  }, [activeServices, formData.serviceId]);

  const load = async () => {
    setLoading(true);
    try {
      const [apptRes, servRes, usersRes, petsRes] = await Promise.all([
        appointmentApi.getAll(),
        serviceApi.getAll(),
        userApi.getAllAdmin(),
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

  const STATUS_CONFIG = useMemo(() => ({
    PENDING: { label: 'Pendiente', badge: 'bg-yellow-100 text-yellow-800' },
    ACCEPTED: { label: 'Confirmada', badge: 'bg-blue-100 text-blue-800' },
    COMPLETED: { label: 'Completada', badge: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelada', badge: 'bg-red-100 text-red-800' },
  }), []);

  const statusOptions = useMemo(() => ([
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'ACCEPTED', label: 'Confirmada' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
  ]), []);

  const veterinarianFilterOptions = useMemo(() => ([
    { id: 'ALL', name: 'Todos los veterinarios', email: '' },
    ...veterinarians,
  ]), [veterinarians]);

  const serviceFilterOptions = useMemo(() => ([
    { id: 'ALL', name: 'Todos los servicios' },
    ...services,
  ]), [services]);

  const assignableVeterinarians = useMemo(() => ([
    { id: '', name: 'Sin asignar', email: '' },
    ...veterinarians,
  ]), [veterinarians]);

  const normalizeStatus = (status) => (status || '').toUpperCase();

  const filteredAppointments = useMemo(() => {
    let list = appointments;
    if (filters.status !== 'ALL') {
      list = list.filter(a => normalizeStatus(a.status) === filters.status);
    }
    if (filters.date) {
      list = list.filter(a => (a.startDateTime || a.datetime || a.date || '').startsWith(filters.date));
    }
    if (filters.veterinarianId !== 'ALL') {
      list = list.filter(a => {
        const vetId = a.assignedTo?.id || a.assignedToId || a.veterinarian?.id;
        return vetId && String(vetId) === String(filters.veterinarianId);
      });
    }
    if (filters.serviceId !== 'ALL') {
      list = list.filter(a => {
        const serviceId = a.service?.id || a.serviceId;
        return serviceId && String(serviceId) === String(filters.serviceId);
      });
    }
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
      await appointmentApi.updateStatus(id, 'ACCEPTED');
      setFeedback({ type: 'success', message: 'Cita confirmada' });
      load();
    } catch (e) {
      console.error('Error al confirmar cita:', e);
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo confirmar' });
    }
  };

  const handleAssignVet = async (appointmentId, veterinarianId) => {
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
        assignedToId: veterinarianId,
        note: appointment.note || ''
      };
      
      await appointmentApi.update(appointmentId, updateData);
      setFeedback({ type: 'success', message: 'Veterinario asignado' });
      load();
    } catch (e) {
      console.error('Error al asignar veterinario:', e);
      setFeedback({ type: 'error', message: e.response?.data?.message || 'No se pudo asignar' });
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
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">event</span>
              <h1 className="text-3xl font-bold text-gray-800">Citas</h1>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario</label>
              <SearchableDropdown
                options={veterinarianFilterOptions}
                value={filters.veterinarianId}
                onChange={(val) => setFilters({ ...filters, veterinarianId: val || 'ALL' })}
                placeholder="Filtrar por veterinario"
                getOptionLabel={(vet) => vet?.name || 'Todos'}
                getOptionSecondary={(vet) => vet?.email || ''}
                getSearchableText={(vet) => `${vet?.name || ''} ${vet?.email || ''}`}
                sort={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
              <SearchableDropdown
                options={serviceFilterOptions}
                value={filters.serviceId}
                onChange={(val) => setFilters({ ...filters, serviceId: val || 'ALL' })}
                placeholder="Filtrar por servicio"
                getOptionLabel={(service) => service?.name || 'Todos'}
                getSearchableText={(service) => `${service?.name || ''} ${service?.description || ''}`}
                sort={false}
              />
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
            {filteredAppointments.map(ap => {
              const currentStatus = normalizeStatus(ap.status);
              const canManage = ['PENDING', 'PENDIENTE'].includes(currentStatus);
              return (
              <div key={ap.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[currentStatus]?.badge || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_CONFIG[currentStatus]?.label || ap.status}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{ap.pet?.name} - {ap.service?.name}</h3>
                    <p className="text-sm text-gray-600">Dueño: {ap.pet?.owner?.name || '—'}</p>
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
                    <div className="flex gap-2">
                      {canManage && (
                        <button onClick={() => handleConfirm(ap.id)} className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md">Confirmar</button>
                      )}
                      {canManage && (
                        <button onClick={() => handleCancel(ap.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md">Cancelar</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Cita</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dueño</label>
                  <SearchableDropdown
                    options={owners}
                    value={formData.ownerId}
                    onChange={(ownerId) => setFormData({ ...formData, ownerId: ownerId || '', petId: '' })}
                    placeholder="Selecciona un dueño"
                    required
                    getOptionLabel={(owner) => owner?.name || owner?.email || ''}
                    getOptionSecondary={(owner) => owner?.email}
                    getSearchableText={(owner) => `${owner?.name || ''} ${owner?.email || ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mascota</label>
                  <SearchableDropdown
                    options={petsByOwner}
                    value={formData.petId}
                    onChange={(petId) => setFormData({ ...formData, petId: petId || '' })}
                    placeholder={formData.ownerId ? 'Selecciona una mascota' : 'Selecciona un dueño primero'}
                    required
                    disabled={!formData.ownerId || petsByOwner.length === 0}
                    emptyStateMessage={() =>
                      formData.ownerId
                        ? 'Este dueño no tiene mascotas registradas'
                        : 'Selecciona un dueño para ver sus mascotas'
                    }
                    getOptionLabel={(pet) => pet?.name || ''}
                    getOptionSecondary={(pet) => pet?.breed || ''}
                    getSearchableText={(pet) => `${pet?.name || ''} ${pet?.breed || ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                  <ServiceSelector
                    services={activeServices}
                    value={formData.serviceId}
                    onChange={(serviceId) => setFormData({ ...formData, serviceId })}
                    required
                  />
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
                  <SearchableDropdown
                    options={assignableVeterinarians}
                    value={formData.veterinarianId}
                    onChange={(vetId) => setFormData({ ...formData, veterinarianId: vetId || '' })}
                    placeholder="Asignar veterinario"
                    getOptionLabel={(vet) => vet?.name || 'Sin asignar'}
                    getOptionSecondary={(vet) => vet?.email || ''}
                    getSearchableText={(vet) => `${vet?.name || ''} ${vet?.email || ''}`}
                    sort={false}
                  />
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
