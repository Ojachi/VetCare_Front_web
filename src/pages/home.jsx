import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import M from 'materialize-css';
import Footer from '../components/footer';
import ServiceCard from '../components/ServiceCard'; // agregado
import TestimonialCard from '../components/TestimonialCard'; // agregado

const Home = () => {
  useEffect(() => {
    
    M.AutoInit();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay valign-wrapper">
          <div className="container center-align">
            <h1 className="hero-title white-text">El mejor cuidado para tu mejor amigo</h1>
            <p className="hero-subtitle white-text flow-text">
              En VetCare, ofrecemos atención veterinaria excepcional. Gestiona las citas,
              historial médico y más, todo en un solo lugar.
            </p>
            <div className="hero-buttons">
              <Link to="/registro" className="btn-large waves-effect waves-light teal">
                Registra tu Mascota
              </Link>
              <Link to="/login" className="btn-large waves-effect waves-light white teal-text">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section className="services-section grey lighten-4">
        <div className="container">
          <h2 className="section-title center-align grey-text text-darken-3">Nuestros Servicios</h2>
          <p className="section-subtitle center-align grey-text text-darken-1">
            Ofrecemos una gama completa de servicios para garantizar la salud y felicidad de tu
            mascota, con la comodidad de gestionarlo todo online.
          </p>
          
          <div className="row">
            <ServiceCard
              icon="date_range"
              title="Gestión de Citas Online"
              description="Agenda, reprograma o cancela citas para tu mascota de forma fácil y rápida desde nuestro portal."
            />
            <ServiceCard
              icon="local_hospital"
              title="Atención Médica Integral"
              description="Desde consultas de rutina y vacunaciones hasta cirugías y cuidados de emergencia."
            />
            <ServiceCard
              icon="description"
              title="Historial Clínico Digital"
              description="Accede al historial de salud completo de tu mascota en cualquier momento y lugar."
            />
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section className="testimonials-section white">
        <div className="container">
          <h2 className="section-title center-align grey-text text-darken-3">
            Lo que dicen los dueños de mascotas
          </h2>
          
          <div className="row">
            <TestimonialCard
              avatar="https://i.pravatar.cc/150?img=5"
              name="Ana García"
              description="La plataforma de VetCare es fantástica. Puedo ver las vacunas de Rocky y pedir cita en segundos. ¡El equipo es amable y muy profesional! Totalmente recomendados."
              pet="dueña de Rocky"
              role="Cliente de VetCare"
            />

            <TestimonialCard
              avatar="https://i.pravatar.cc/150?img=12"
              name="Javier Martínez"
              description="La tranquilidad de tener todo el historial médico de Luna online no tiene precio. El sistema de recordatorios es genial para no olvidar ninguna cita. ¡Gracias, VetCare!"
              pet="dueño de Luna"
              role="Cliente de VetCare"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;