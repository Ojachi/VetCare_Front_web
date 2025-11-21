import React from 'react';
import { Link } from 'react-router-dom';

const linkGroup = [
  {
    title: 'Nuestra Clínica',
    links: [
      { to: '/nuestro-equipo', label: 'Nuestro Equipo' },
    ],
  },
  {
    title: 'Portal del Cliente',
    links: [
      { to: '/login', label: 'Iniciar Sesión' },
      { to: '/registro', label: 'Registrarse' },
      { to: '/contacto', label: 'Contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacidad', label: 'Política de Privacidad' },
      { to: '/terminos', label: 'Términos de Servicio' },
    ],
  },
];

const Footer = () => (
  <footer className="bg-teal text-white mt-0">
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid gap-10 md:grid-cols-4">
        <div>
          <h5 className="text-xl font-semibold mb-3">🐾 VetCare</h5>
          <p className="text-teal-light/90 text-sm leading-relaxed">
            Cuidando a tu mascota como si fuera nuestra.
          </p>
        </div>
        {linkGroup.map(group => (
          <div key={group.title}>
            <h5 className="text-lg font-semibold mb-3">{group.title}</h5>
            <ul className="space-y-2">
              {group.links.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-teal-light/80 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-black/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
        <span className="text-sm">© 2025 VetCare. Todos los derechos reservados.</span>
      </div>
    </div>
  </footer>
);

export default Footer;