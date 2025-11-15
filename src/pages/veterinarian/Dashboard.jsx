import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { appointmentApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const VeterinarianDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const navigation = [
    { path: '/veterinarian/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/veterinarian/appointments', icon: 'event', label: 'Citas' },
    { path: '/veterinarian/diagnoses', icon: 'medical_services', label: 'Diagnósticos' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await appointmentApi.getAll();
        setAppointments(res.data || []);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const myAppointments = useMemo(() => {
    if (!user) return [];
    return (appointments || []).filter(a => (a.assignedTo?.id || a.assignedToId) === user.id);
  }, [appointments, user]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = useMemo(() => 
    myAppointments.filter(a => {
      if (!a.startDateTime) return false;
      const appointmentDate = new Date(a.startDateTime).toISOString().split('T')[0];
      return appointmentDate === todayStr;
    }), 
    [myAppointments, todayStr]
  );
  const pendingCount = useMemo(() => myAppointments.filter(a => a.status === 'PENDING').length, [myAppointments]);
  const confirmedCount = useMemo(() => myAppointments.filter(a => a.status === 'ACCEPTED').length, [myAppointments]);
  const completedCount = useMemo(() => myAppointments.filter(a => a.status === 'COMPLETED').length, [myAppointments]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Veterinario</h1>
        <p className="text-gray-600 mb-8">Resumen de tus citas y actividad</p>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icons text-blue-600">today</span>
                  <h3 className="text-sm font-medium text-gray-600">Citas de Hoy</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{todayAppointments.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icons text-yellow-600">hourglass_empty</span>
                  <h3 className="text-sm font-medium text-gray-600">Pendientes</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icons text-blue-600">event_available</span>
                  <h3 className="text-sm font-medium text-gray-600">Confirmadas</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{confirmedCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icons text-green-600">check_circle</span>
                  <h3 className="text-sm font-medium text-gray-600">Completadas</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{completedCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Citas de hoy</h2>
              </div>
              {todayAppointments.length === 0 ? (
                <p className="text-gray-600">No tienes citas programadas para hoy.</p>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map(ap => (
                    <div key={ap.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ap.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ap.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : ap.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ap.status}</span>
                            <span className="text-sm text-gray-500">{new Date(ap.startDateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-800">{ap.pet?.name} — {ap.service?.name}</h3>
                          <p className="text-sm text-gray-600">Dueño: {ap.pet?.owner?.name || '—'}</p>
                        </div>
                        <a href="/veterinarian/appointments" className="px-3 py-1.5 text-sm text-teal hover:bg-teal/10 rounded-md">Ver</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VeterinarianDashboard;
