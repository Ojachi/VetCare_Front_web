import React from 'react';

const LegalTerms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded-lg">
        <h1 className="text-3xl font-bold text-teal-800 mb-6">Términos de Servicio</h1>
        <div className="prose prose-teal max-w-none text-gray-600">
          <p className="mb-4">
            Bienvenido a VetCare. Al utilizar nuestros servicios, usted acepta cumplir con los siguientes términos y condiciones. Por favor, léalos detenidamente.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">1. Aceptación de los Términos</h2>
          <p className="mb-4">
            Al acceder o utilizar el sitio web y los servicios de VetCare, usted acepta estar legalmente vinculado por estos Términos de Servicio y nuestra Política de Privacidad.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">2. Descripción del Servicio</h2>
          <p className="mb-4">
            VetCare proporciona servicios veterinarios, programación de citas, historial médico de mascotas y venta de productos relacionados. Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">3. Registro y Cuenta</h2>
          <p className="mb-4">
            Para acceder a ciertas funciones, debe registrarse y crear una cuenta. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">4. Citas y Cancelaciones</h2>
          <p className="mb-4">
            Las citas deben programarse con antelación. Las cancelaciones deben realizarse con al menos 24 horas de anticipación para evitar cargos adicionales.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">5. Responsabilidad</h2>
          <p className="mb-4">
            VetCare se esfuerza por proporcionar la mejor atención posible, pero no garantiza resultados específicos. No seremos responsables por daños indirectos o consecuentes que surjan del uso de nuestros servicios.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">6. Modificaciones</h2>
          <p className="mb-4">
            Podemos actualizar estos términos ocasionalmente. Le notificaremos sobre cambios significativos a través de nuestro sitio web o por correo electrónico.
          </p>

          <p className="mt-8 text-sm text-gray-500">
            Última actualización: Noviembre 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalTerms;

