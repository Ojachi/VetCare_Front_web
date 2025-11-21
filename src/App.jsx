import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import RecoverPassword from './pages/recoverpassword';
import ResetPassword from './pages/resetpassword';
import LegalPrivacy from './pages/LegalPrivacy';
import LegalTerms from './pages/LegalTerms';
import OurTeam from './pages/OurTeam';
import Contact from './pages/Contact';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerPets from './pages/owner/Pets';
import OwnerAppointments from './pages/owner/Appointments';
import OwnerHistory from './pages/owner/History';
import Cart from './pages/owner/Cart';
import PurchaseHistory from './pages/owner/PurchaseHistory';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeePets from './pages/employee/Pets';
import EmployeeAppointments from './pages/employee/Appointments';
import SalesHistoryEmployee from './pages/employee/SalesHistory';
import SalesRegisterEmployee from './pages/employee/SalesRegister';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminServices from './pages/admin/Services';
import AdminAppointments from './pages/admin/Appointments';
import AdminPets from './pages/admin/Pets';
import AdminMedicalHistory from './pages/admin/MedicalHistory';
import ProductManagement from './pages/admin/ProductManagement';
import SalesRegister from './pages/admin/SalesRegister';
import SalesHistory from './pages/admin/SalesHistory';
import VeterinarianDashboard from './pages/veterinarian/Dashboard';
import VeterinarianAppointments from './pages/veterinarian/Appointments';
import VeterinarianDiagnosis from './pages/veterinarian/Diagnosis';
import Profile from './pages/Profile';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Catalog from './pages/product/Catalog';
import Detail from './pages/product/Detail';
import './App.css';
import './styles/products.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/registro" element={<><Navbar /><Register /></>} />
          <Route path="/recuperar-password" element={<><Navbar /><RecoverPassword /></>} />
          <Route path="/restablecer-password" element={<><Navbar /><ResetPassword /></>} />
          <Route path="/terminos" element={<><Navbar /><LegalTerms /><Footer /></>} />
          <Route path="/privacidad" element={<><Navbar /><LegalPrivacy /><Footer /></>} />
          <Route path="/nuestro-equipo" element={<><Navbar /><OurTeam /><Footer /></>} />
          <Route path="/contacto" element={<><Navbar /><Contact /><Footer /></>} />

          {/* Catálogo Productos (roles autenticados) */}
          <Route
            path="/productos"
            element={
              <ProtectedRoute allowedRoles={['OWNER','EMPLOYEE','VETERINARIAN','ADMIN']}>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos/:id"
            element={
              <ProtectedRoute allowedRoles={['OWNER','EMPLOYEE','VETERINARIAN','ADMIN']}>
                <Detail />
              </ProtectedRoute>
            }
          />

          {/* Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/pets"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerPets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/appointments"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/history"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/cart"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/purchases"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <PurchaseHistory />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/pets"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeePets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/appointments"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/sales/register"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <SalesRegisterEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/sales/history"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <SalesHistoryEmployee />
              </ProtectedRoute>
            }
          />

          {/* Veterinarian Routes */}
          <Route
            path="/veterinarian/dashboard"
            element={
              <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                <VeterinarianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/veterinarian/appointments"
            element={
              <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                <VeterinarianAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/veterinarian/diagnoses"
            element={
              <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                <VeterinarianDiagnosis />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback Routes */}
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pets"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medical-history"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMedicalHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ventas/registro"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SalesRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ventas/historial"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SalesHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen"><div className="text-center"><h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1><p className="text-gray-600">No tienes permisos para acceder a esta página</p></div></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;