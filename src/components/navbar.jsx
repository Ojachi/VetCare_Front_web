import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/icon_dog.svg';

const navLinks = [
  { to: '/nuestro-equipo', label: 'Nuestro Equipo' },
  { to: '/contacto', label: 'Contacto' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="VetCare Logo" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-gray-800 group-hover:opacity-80">
            VetCare
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center justify-center rounded-lg bg-teal px-5 py-2 text-sm font-semibold text-white shadow-teal-sm hover:shadow-teal-lg transition-shadow"
          >
            Registrarse
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className="material-icons">{open ? 'close' : 'menu'}</span>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-sm">
          <ul className="px-4 py-4 space-y-2">
            {navLinks.map(l => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                onClick={() => setOpen(false)}
                className="block rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white text-center shadow-teal-sm hover:shadow-teal-lg"
              >
                Registrarse
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;