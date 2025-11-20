import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';
import ServiceCard from '../components/ServiceCard';
import TestimonialCard from '../components/TestimonialCard';
import ChatWidget from '../components/ChatWidget';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative min-h-[500px] flex items-center justify-center text-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1600')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            El mejor cuidado para tu mejor amigo
          </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
              En VetCare, ofrecemos atención veterinaria excepcional. Gestiona las citas, historial médico y más, todo en un solo lugar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Link
                to="/registro"
                className="inline-flex items-center justify-center rounded-lg bg-teal px-8 py-3 text-white font-semibold shadow-teal-sm hover:shadow-teal-lg transition-shadow"
              >
                Registra tu Mascota
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-teal font-semibold shadow-sm hover:shadow-lg transition-shadow"
              >
                Iniciar Sesión
              </Link>
            </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Nuestros Servicios</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Ofrecemos una gama completa de servicios para garantizar la salud y felicidad de tu mascota, con la comodidad de gestionarlo todo online.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
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

      {/* Testimonios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Lo que dicen los dueños de mascotas</h2>
          <div className="grid gap-8 md:grid-cols-2">
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
      <ChatWidget />
    </div>
  );
};

export default Home;