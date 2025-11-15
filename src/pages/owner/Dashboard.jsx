import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { petApi, appointmentApi } from '../../api/services';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pets: 0, appointments: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);

  const navigation = [
    { path: '/owner/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/owner/pets', icon: 'pets', label: 'Mis Mascotas' },
    { path: '/owner/appointments', icon: 'event', label: 'Mis Citas' },
    { path: '/owner/history', icon: 'history', label: 'Historial Médico' },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [petsRes, appointmentsRes] = await Promise.all([
        petApi.getAll(),
        appointmentApi.getAll(),
      ]);
      const appointments = appointmentsRes.data || [];
      const upcoming = appointments.filter(a => a.status === 'PENDING').length;
      setStats({
        pets: petsRes.data?.length || 0,
        appointments: appointments.length,
        upcoming,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user?.name}</h1>
          <p className="text-gray-600 mt-2">Gestiona la salud de tus mascotas desde aquí</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mis Mascotas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pets}</p>
                </div>
                <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center">
                  <span className="material-icons text-teal text-2xl">pets</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Citas Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-blue-600 text-2xl">event</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Citas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.appointments}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-green-600 text-2xl">calendar_month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <a href="/owner/pets" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="material-icons text-teal">add_circle</span>
                <span className="font-medium text-gray-700">Registrar Nueva Mascota</span>
              </a>
              <a href="/owner/appointments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="material-icons text-teal">event_available</span>
                <span className="font-medium text-gray-700">Agendar Cita</span>
              </a>
              <a href="/owner/history" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="material-icons text-teal">description</span>
                <span className="font-medium text-gray-700">Ver Historial Médico</span>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal to-teal-dark rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">💡 Consejo del Día</h2>
            <p className="text-sm leading-relaxed opacity-95">
              Recuerda mantener al día las vacunas de tu mascota. Las visitas preventivas ayudan a detectar problemas de salud temprano.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
