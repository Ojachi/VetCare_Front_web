import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/icon_dog.svg';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica de autenticación con el backend
    console.log('Login data:', formData);
    // Ejemplo: navigate('/dashboard');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="card-content">
          {/* Logo y título */}
          <div className="login-header center-align">
            <div className="logo-container">
              <img src={logo} alt="VetCare Logo" className="login-logo" />
            </div>
            <h4 className="grey-text text-darken-3">VetCare</h4>
          </div>

          {/* Título de bienvenida */}
          <div className="login-welcome center-align">
            <h5 className="grey-text text-darken-3">Bienvenido de nuevo</h5>
            <p className="grey-text">Accede a tu cuenta para gestionar la clínica.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Campo de email */}
            <div className="input-field">
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                title="Por favor ingresa un correo electrónico válido"
              />
              <label htmlFor="email">Correo Electrónico</label>
            </div>

            {/* Campo de contraseña */}
            <div className="input-field password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="password">Contraseña</label>
              <i 
                className="material-icons password-toggle" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </i>
            </div>

            {/* Enlace olvidaste contraseña */}
            <div className="right-align forgot-password">
              <Link to="/recuperar-password" className="teal-text">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de inicio de sesión */}
            <button 
              type="submit" 
              className="btn waves-effect waves-light teal btn-large btn-block"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Enlace a registro */}
          <div className="login-footer center-align">
            <p className="grey-text">
              ¿No tienes una cuenta?{' '}
              <Link to="/registro" className="teal-text">
                <strong>Regístrate aquí</strong>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;