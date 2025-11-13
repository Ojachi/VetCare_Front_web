import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import M from 'materialize-css';
import '../styles/navbar.css';
import logo from '../assets/icon_dog.svg';

const Navbar = () => {
  useEffect(() => {
    // Inicializar el menú mobile (sidenav)
    const sidenav = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenav);
  }, []);

  return (
    <>
      {/* Navbar Desktop */}
      <nav className="white navbar-custom">
        <div className="nav-wrapper">
          <div className="navbar-container">
            {/* Logo */}
            <Link to="/" className="brand-logo left">
              <img src={logo} alt="VetCare Logo" className="navbar-logo" />
              <span className="navbar-title grey-text text-darken-3">VetCare</span>
            </Link>

            {/* Menú hamburguesa para mobile */}
            <a href="#!" data-target="mobile-nav" className="sidenav-trigger right">
              <i className="material-icons grey-text text-darken-3">menu</i>
            </a>

            {/* Menú central - Desktop */}
            <ul className="center hide-on-med-and-down navbar-menu">
              <li><Link to="/servicios" className="grey-text text-darken-1">Servicios</Link></li>
              <li><Link to="/nuestro-equipo" className="grey-text text-darken-1">Nuestro Equipo</Link></li>
              <li><Link to="/contacto" className="grey-text text-darken-1">Contacto</Link></li>
            </ul>

            {/* Botones - Desktop */}
            <ul className="right hide-on-med-and-down navbar-actions">
              <li>
                <Link to="/login" className="btn-flat grey-text text-darken-2 waves-effect">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/registro" className="btn waves-effect waves-light teal">
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Menú Mobile (Sidenav) */}
      <ul className="sidenav" id="mobile-nav">
        <li>
          <div className="user-view teal lighten-5">
            <div className="center-align" style={{ padding: '20px' }}>
              <img src={logo} alt="VetCare Logo" style={{ width: '60px', height: '60px' }} />
              <h5 className="grey-text text-darken-3">VetCare</h5>
            </div>
          </div>
        </li>
        <li><Link to="/servicios" className="waves-effect">Servicios</Link></li>
        <li><Link to="/nuestro-equipo" className="waves-effect">Nuestro Equipo</Link></li>
        <li><Link to="/contacto" className="waves-effect">Contacto</Link></li>
        <li><div className="divider"></div></li>
        <li><Link to="/login" className="waves-effect">Iniciar Sesión</Link></li>
        <li><Link to="/registro" className="waves-effect teal-text">Registrarse</Link></li>
      </ul>
    </>
  );
};

export default Navbar;