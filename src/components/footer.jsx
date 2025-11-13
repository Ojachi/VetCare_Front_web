import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="page-footer teal darken-1">
    <div className="container">
      <div className="row">
        <div className="col l3 s12">
          <h5 className="white-text">🐾 VetCare</h5>
          <p className="grey-text text-lighten-4">
            Cuidando a tu mascota como si fuera nuestra.
          </p>
        </div>
        <div className="col l3 s12">
          <h5 className="white-text">Nuestra Clínica</h5>
          <ul>
            <li><Link to="/servicios" className="grey-text text-lighten-3">Servicios</Link></li>
            <li><Link to="/nuestro-equipo" className="grey-text text-lighten-3">Nuestro Equipo</Link></li>
            <li><Link to="/urgencias" className="grey-text text-lighten-3">Urgencias</Link></li>
          </ul>
        </div>
        <div className="col l3 s12">
          <h5 className="white-text">Portal del Cliente</h5>
          <ul>
            <li><Link to="/login" className="grey-text text-lighten-3">Iniciar Sesión</Link></li>
            <li><Link to="/registro" className="grey-text text-lighten-3">Registrarse</Link></li>
            <li><Link to="/contacto" className="grey-text text-lighten-3">Contacto</Link></li>
          </ul>
        </div>
        <div className="col l3 s12">
          <h5 className="white-text">Legal</h5>
          <ul>
            <li><Link to="/privacidad" className="grey-text text-lighten-3">Política de Privacidad</Link></li>
            <li><Link to="/terminos" className="grey-text text-lighten-3">Términos de Servicio</Link></li>
          </ul>
        </div>
      </div>
    </div>
    <div className="footer-copyright">
      <div className="container center-align">
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>
          <span>© 2024 VetCare. Todos los derechos reservados.</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;