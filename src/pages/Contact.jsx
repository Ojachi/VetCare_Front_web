import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="bg-white shadow rounded-xl p-8">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">
            Contáctanos
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Estamos aquí para ayudarte y a tu mascota
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            ¿Necesitas agendar una cita, resolver dudas sobre tratamientos o conocer más
            acerca de nuestros servicios? Escríbenos y un miembro de nuestro equipo
            te responderá en menos de 24 horas hábiles.
          </p>
          <dl className="space-y-5 text-gray-700">
            <div>
              <dt className="font-semibold text-gray-900">Teléfono</dt>
              <dd className="text-teal-700">+51 999 123 456</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Correo</dt>
              <dd className="text-teal-700">contacto@vetcare.com</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Dirección</dt>
              <dd>Av. Siempre Viva 742, Lima, Perú</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Horario</dt>
              <dd>Lunes a sábado — 8:00 am a 9:00 pm</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};

export default Contact;

