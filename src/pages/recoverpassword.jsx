import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/recoverpassword.css';
import logo from '../assets/icon_dog.svg';
import M from 'materialize-css';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí irá la lógica para enviar el email de recuperación al backend
    console.log('Email para recuperación:', email);
    
    // Simular envío exitoso
    setIsSubmitted(true);
    
    // Mostrar toast de Materialize
    M.toast({
      html: '¡Correo de recuperación enviado! Revisa tu bandeja de entrada.',
      classes: 'teal rounded',
      displayLength: 4000
    });

    // Opcional: redirigir al login después de unos segundos
    // setTimeout(() => navigate('/login'), 3000);
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="recover-container">
      <div className="recover-card card">
        <div className="card-content">
          {/* Logo y título */}
          <div className="recover-header center-align">
            <div className="logo-container">
              <img src={logo} alt="VetCare Logo" className="recover-logo" />
            </div>
            <h4 className="grey-text text-darken-3">VetCare</h4>
          </div>

          {!isSubmitted ? (
            <>
              {/* Título de recuperación */}
              <div className="recover-welcome center-align">
                <h5 className="grey-text text-darken-3">¿Olvidaste tu contraseña?</h5>
                <p className="grey-text">
                  No te preocupes, ingresa tu correo electrónico y te enviaremos 
                  instrucciones para restablecer tu contraseña.
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit}>
                {/* Campo de email */}
                <div className="input-field">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleInputChange}
                    required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    title="Por favor ingresa un correo electrónico válido"
                  />
                  <label htmlFor="email">Correo Electrónico</label>
                </div>

                {/* Botón de enviar */}
                <button 
                  type="submit" 
                  className="btn waves-effect waves-light teal btn-large btn-block"
                >
                  Enviar Instrucciones
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Mensaje de éxito */}
              <div className="recover-success center-align">
                <i className="material-icons large teal-text">check_circle</i>
                <h5 className="grey-text text-darken-3">¡Correo Enviado!</h5>
                <p className="grey-text">
                  Hemos enviado las instrucciones para restablecer tu contraseña a:
                </p>
                <p className="email-sent teal-text">
                  <strong>{email}</strong>
                </p>
                <p className="grey-text text-lighten-1">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam 
                  o intenta nuevamente.
                </p>
              </div>

              {/* Botón para volver al login */}
              <Link 
                to="/login" 
                className="btn waves-effect waves-light teal btn-large btn-block"
              >
                Volver al Inicio de Sesión
              </Link>
            </>
          )}

          {/* Enlace a login */}
          {!isSubmitted && (
            <div className="recover-footer center-align">
              <p className="grey-text">
                ¿Recordaste tu contraseña?{' '}
                <Link to="/login" className="teal-text">
                  <strong>Iniciar Sesión</strong>
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;