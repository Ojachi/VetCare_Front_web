import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import RecoverPassword from './pages/recoverpassword';
import Navbar from './components/navbar';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<RecoverPassword />} />
        {/* Agrega más rutas aquí según sea necesario */}
      </Routes>
    </Router>
  );
}

export default App;