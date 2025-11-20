import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import logo from '../assets/icon_dog.svg';

const DashboardLayout = ({ children, navigation }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const defaultNavigationByRole = React.useMemo(() => ({
    OWNER: [
      { path: '/owner/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/owner/pets', icon: 'pets', label: 'Mis Mascotas' },
      { path: '/owner/appointments', icon: 'event', label: 'Mis Citas' },
      { path: '/owner/history', icon: 'history', label: 'Historial Médico' },
      { path: '/profile', icon: 'account_circle', label: 'Mi Perfil' },
    ],
    EMPLOYEE: [
      { path: '/employee/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/employee/pets', icon: 'pets', label: 'Mascotas' },
      { path: '/employee/appointments', icon: 'event', label: 'Citas' },
      { path: '/profile', icon: 'account_circle', label: 'Mi Perfil' },
    ],
    VETERINARIAN: [
      { path: '/veterinarian/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/veterinarian/appointments', icon: 'event', label: 'Citas' },
      { path: '/veterinarian/diagnoses', icon: 'medical_services', label: 'Diagnósticos' },
      { path: '/profile', icon: 'account_circle', label: 'Mi Perfil' },
    ],
    ADMIN: [
      { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/admin/users', icon: 'groups', label: 'Usuarios' },
      { path: '/admin/services', icon: 'build', label: 'Servicios' },
      { path: '/admin/appointments', icon: 'event', label: 'Citas' },
      { path: '/profile', icon: 'account_circle', label: 'Mi Perfil' },
    ],
  }), []);

  const resolvedNavigation = Array.isArray(navigation) && navigation.length
    ? navigation
    : defaultNavigationByRole[user?.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <span className="material-icons">menu</span>
              </button>
              <Link to="/" className="flex items-center gap-2 ml-2 md:ml-0">
                <img src={logo} alt="VetCare" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-800">VetCare</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-left hidden sm:block"
              >
                <p className="text-sm font-medium text-gray-800 hover:text-teal transition-colors">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                  {user?.role?.toLowerCase()}
                  <span className="material-icons text-xs text-teal">chevron_right</span>
                </p>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="material-icons text-xl">logout</span>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar 
          navigation={resolvedNavigation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
