import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SearchableDropdown from '../../components/SearchableDropdown';
import { userApi, appointmentApi } from '../../api/services';

const roleMap = {
  'OWNER': 'Dueño',
  'ADMIN': 'Administrador',
  'VETERINARIAN': 'Veterinario',
  'EMPLOYEE': 'Empleado',
};

const NON_BLOCKING_STATUSES = ['CANCELADA', 'CANCELLED', 'COMPLETED', 'COMPLETADA', 'FINALIZADA'];
const isBlockingAppointmentStatus = (status) => {
  const normalized = (status || '').toUpperCase();
  return !NON_BLOCKING_STATUSES.includes(normalized);
};

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [filters, setFilters] = useState({ role: 'ALL', active: 'ALL', query: '' });

  const roleFilterOptions = useMemo(() => ([
    { value: 'ALL', label: 'Todos los roles' },
    { value: 'OWNER', label: 'Dueño' },
    { value: 'EMPLOYEE', label: 'Empleado' },
    { value: 'VETERINARIAN', label: 'Veterinario' },
    { value: 'ADMIN', label: 'Administrador' },
  ]), []);

  const stateFilterOptions = useMemo(() => ([
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' },
  ]), []);

  const roleOptions = useMemo(() => ([
    { value: 'OWNER', label: roleMap.OWNER },
    { value: 'EMPLOYEE', label: roleMap.EMPLOYEE },
    { value: 'VETERINARIAN', label: roleMap.VETERINARIAN },
    { value: 'ADMIN', label: roleMap.ADMIN },
  ]), []);

  const navigation = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'groups', label: 'Usuarios' },
    { path: '/admin/services', icon: 'build', label: 'Servicios' },
    { path: '/admin/appointments', icon: 'event', label: 'Citas' },
  ];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllAdmin();
      setUsers(res.data || []);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users || [];
    if (filters.role !== 'ALL') list = list.filter(u => u.role === filters.role);
    if (filters.active !== 'ALL') list = list.filter(u => String(u.active ?? u.enabled ?? true) === filters.active);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q));
    }
    return list;
  }, [users, filters]);

  const changeRole = async (userId, role) => {
    try {
      if (userApi.updateRole) {
        await userApi.updateRole(userId, role);
      } else {
        await userApi.update(userId, { role });
      }
      setFeedback({ type: 'success', message: 'Rol actualizado' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo actualizar el rol' });
    }
  };

  const fetchAppointmentsSafe = async (params) => {
    try {
      const res = await appointmentApi.getAllAdmin(params);
      return res.data || [];
    } catch (e) {
      if (e.response?.status === 403) {
        const fallback = await appointmentApi.getAll();
        return fallback.data || [];
      }
      throw e;
    }
  };

  const hasBlockingAppointmentsForUser = async (userObj) => {
    if (!['OWNER', 'VETERINARIAN'].includes(userObj.role)) return false;
    const params = userObj.role === 'VETERINARIAN'
      ? { assignedToId: userObj.id }
      : { ownerId: userObj.id };

    const appointments = await fetchAppointmentsSafe(params);
    return appointments
      .filter(ap => {
        if (userObj.role === 'VETERINARIAN') {
          const vetId = ap.assignedTo?.id || ap.assignedToId || ap.veterinarian?.id;
          return String(vetId) === String(userObj.id);
        }
        const ownerId = ap.pet?.owner?.id || ap.owner?.id;
        return String(ownerId) === String(userObj.id);
      })
      .some(ap => isBlockingAppointmentStatus(ap.status));
  };

  const toggleActive = async (userObj) => {
    const newActive = !(userObj.active ?? userObj.enabled ?? true);
    try {
      if (!newActive) {
        const blocked = await hasBlockingAppointmentsForUser(userObj);
        if (blocked) {
          setFeedback({ type: 'error', message: 'No puedes desactivar dueños o veterinarios con citas pendientes o en curso' });
          return;
        }
        if (userApi.deactivate) {
          await userApi.deactivate(userObj.id);
        } else {
          await userApi.update(userObj.id, { active: newActive });
        }
      } else if (userApi.activate) {
        await userApi.activate(userObj.id);
      } else {
        await userApi.update(userObj.id, { active: newActive });
      }
      setFeedback({ type: 'success', message: newActive ? 'Usuario activado' : 'Usuario desactivado' });
      load();
    } catch (e) {
      setFeedback({ type: 'error', message: 'No se pudo cambiar el estado' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-teal text-4xl" aria-hidden="true">groups</span>
              <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
            </div>
            <p className="text-gray-600 mt-2">Gestiona roles y estados de usuarios</p>
          </div>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>{feedback.message}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <SearchableDropdown
                options={roleFilterOptions}
                value={filters.role}
                onChange={(val) => setFilters({ ...filters, role: val || 'ALL' })}
                placeholder="Filtrar por rol"
                valueKey="value"
                getOptionLabel={(opt) => opt.label}
                sort={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <SearchableDropdown
                options={stateFilterOptions}
                value={filters.active}
                onChange={(val) => setFilters({ ...filters, active: val || 'ALL' })}
                placeholder="Filtrar por estado"
                valueKey="value"
                getOptionLabel={(opt) => opt.label}
                sort={false}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input value={filters.query} onChange={e => setFilters({ ...filters, query: e.target.value })} className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal" placeholder="Nombre, correo, teléfono..." />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-icons text-gray-300 text-6xl mb-4">groups</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay usuarios</h3>
            <p className="text-gray-600">No se encontraron usuarios con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">person</span>Nombre</th>
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">email</span>Correo</th>
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">phone</span>Teléfono</th>
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">badge</span>Rol</th>
                  <th className="px-4 py-3"><span className="material-icons inline align-middle text-base mr-2">check_circle</span>Estado</th>
                  <th className="px-4 py-3 text-right"><span className="material-icons inline align-middle text-base mr-2">tune</span>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.phone || '—'}</td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <SearchableDropdown
                        options={roleOptions}
                        value={u.role}
                        onChange={(val) => val && changeRole(u.id, val)}
                        placeholder="Selecciona rol"
                        valueKey="value"
                        getOptionLabel={(opt) => opt.label}
                        sort={false}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.active ?? u.enabled ?? true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                        {(u.active ?? u.enabled ?? true) ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleActive(u)} className={`px-3 py-1.5 text-sm rounded-md ${u.active ?? u.enabled ?? true ? 'text-red-600 hover:bg-red-50' : 'text-teal hover:bg-teal/10'}`}>
                        {(u.active ?? u.enabled ?? true) ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
