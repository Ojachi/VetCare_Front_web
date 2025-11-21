import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { userApi, petApi, appointmentApi, serviceApi } from '../../api/services';
import { fetchPurchaseStatistics } from '../../api/products';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const navigation = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'groups', label: 'Usuarios' },
    { path: '/admin/services', icon: 'build', label: 'Servicios' },
    { path: '/admin/appointments', icon: 'event', label: 'Citas' },
    { path: '/productos', icon: 'store', label: 'Catálogo' },
    { path: '/admin/productos', icon: 'inventory', label: 'Gestión Productos' },
    { path: '/admin/categorias', icon: 'category', label: 'Categorías' },
    { path: '/admin/ventas/registro', icon: 'point_of_sale', label: 'Registro Ventas' },
    { path: '/admin/ventas/historial', icon: 'receipt_long', label: 'Historial Ventas' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [u, p, a, s] = await Promise.all([
          userApi.getAll(),
          petApi.getAll(),
          appointmentApi.getAll(),
          serviceApi.getAll(),
        ]);
        setUsers(u.data || []);
        setPets(p.data || []);
        setAppointments(a.data || []);
        setServices(s.data || []);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true); setStatsError(null);
      try {
        const data = await fetchPurchaseStatistics();
        setStats(data);
      } catch (e) {
        setStatsError('Error cargando estadísticas de ventas');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const counts = useMemo(() => {
    const owners = users.filter(u => u.role === 'OWNER').length;
    const employees = users.filter(u => u.role === 'EMPLOYEE').length;
    const vets = users.filter(u => u.role === 'VETERINARIAN').length;
    const admins = users.filter(u => u.role === 'ADMIN').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const today = appointments.filter(a => {
      if (!a.startDateTime) return false;
      const appointmentDate = new Date(a.startDateTime).toISOString().split('T')[0];
      return appointmentDate === todayStr;
    }).length;
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    return {
      users: users.length,
      owners, employees, vets, admins,
      pets: pets.length,
      services: services.length,
      appointments: appointments.length,
      todayAppointments: today,
      pendingAppointments: pending,
    };
  }, [users, pets, services, appointments]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-icons text-teal text-4xl" aria-hidden="true">space_dashboard</span>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        </div>
        <p className="text-gray-600 mb-8">Visión general del sistema</p>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2"><span className="material-icons text-teal">groups</span><h3 className="text-sm font-medium text-gray-600">Usuarios</h3></div>
                <p className="text-3xl font-bold text-gray-800">{counts.users}</p>
                <p className="text-xs text-gray-500 mt-1">Dueños {counts.owners} · Empleados {counts.employees} · Vets {counts.vets} · Admin {counts.admins}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2"><span className="material-icons text-teal">pets</span><h3 className="text-sm font-medium text-gray-600">Mascotas</h3></div>
                <p className="text-3xl font-bold text-gray-800">{counts.pets}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2"><span className="material-icons text-teal">build</span><h3 className="text-sm font-medium text-gray-600">Servicios</h3></div>
                <p className="text-3xl font-bold text-gray-800">{counts.services}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2"><span className="material-icons text-blue-600">event</span><h3 className="text-sm font-medium text-gray-600">Citas</h3></div>
                <p className="text-3xl font-bold text-gray-800">{counts.appointments}</p>
                <p className="text-xs text-gray-500 mt-1">Hoy {counts.todayAppointments} · Pendientes {counts.pendingAppointments}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2"><span className="material-icons text-purple-600">point_of_sale</span><h3 className="text-sm font-medium text-gray-600">Ventas</h3></div>
                {statsLoading ? (
                  <p className="text-sm text-gray-500">Cargando...</p>
                ) : statsError ? (
                  <p className="text-xs text-red-600">{statsError}</p>
                ) : stats ? (
                  <>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Ingresos: ${stats.totalAmount?.toFixed?.(2) || stats.totalAmount || 0}</p>
                    {stats.averageOrderValue && (
                      <p className="text-xs text-gray-500 mt-1">Promedio: ${stats.averageOrderValue?.toFixed?.(2)}</p>
                    )}
                  </>
                ) : <p className="text-xs text-gray-500">Sin datos</p>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Citas más próximas</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-600">No hay citas registradas.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map(ap => (
                    <div key={ap.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${ap.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ap.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : ap.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ap.status}</span>
                          <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <p className="text-sm text-gray-700"><strong>{ap.pet?.name}</strong> — {ap.service?.name} · Vet: {ap.assignedTo?.name || '—'}</p>
                      </div>
                      <a className="text-teal text-sm hover:underline" href="/admin/appointments">Ver todas</a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><span className="material-icons text-purple-600">trending_up</span>Top Productos</h2>
              {statsLoading ? <p className="text-sm text-gray-500">Cargando...</p> : statsError ? <p className="text-xs text-red-600">{statsError}</p> : stats?.topSellingProducts?.length ? (
                <div className="space-y-2">
                  {stats.topSellingProducts.slice(0,5).map(tp => (
                    <div key={tp.productId} className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{tp.productName || 'Producto ' + tp.productId}</p>
                        <p className="text-xs text-gray-500">Ventas: {tp.quantitySold} · Ingresos: ${tp.revenue?.toFixed?.(2) || tp.revenue}</p>
                      </div>
                      <span className="material-icons text-teal text-sm">local_offer</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Sin datos de productos destacados.</p>}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
