import React from 'react';

const LegalPrivacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded-lg">
        <h1 className="text-3xl font-bold text-teal-800 mb-6">Política de Privacidad y Seguridad</h1>
        <div className="prose prose-teal max-w-none text-gray-600">
          <p className="mb-4">
            En VetCare, nos tomamos muy en serio la privacidad y seguridad de sus datos. Esta política describe cómo recopilamos, usamos y protegemos su información personal.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">1. Recopilación de Información</h2>
          <p className="mb-4">
            Recopilamos información que usted nos proporciona directamente, como su nombre, dirección, correo electrónico, número de teléfono y detalles de sus mascotas, así como información sobre transacciones y citas.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">2. Uso de la Información</h2>
          <p className="mb-4">
            Utilizamos su información para:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>Proporcionar y mejorar nuestros servicios veterinarios.</li>
            <li>Procesar pagos y gestionar citas.</li>
            <li>Comunicarnos con usted sobre el cuidado de su mascota y actualizaciones del servicio.</li>
            <li>Personalizar su experiencia en nuestro sitio web.</li>
          </ul>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">3. Seguridad de los Datos</h2>
          <p className="mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos cifrado para la transmisión de datos sensibles.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">4. Compartir Información</h2>
          <p className="mb-4">
            No vendemos ni alquilamos su información personal a terceros. Solo compartimos información con proveedores de servicios de confianza que nos ayudan a operar nuestro negocio (por ejemplo, procesadores de pagos), bajo estrictas obligaciones de confidencialidad.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">5. Cookies</h2>
          <p className="mb-4">
            Utilizamos cookies para mejorar la funcionalidad de nuestro sitio web y analizar el tráfico. Puede configurar su navegador para rechazar cookies, pero esto puede limitar su uso de ciertas funciones.
          </p>

          <h2 className="text-xl font-semibold text-teal-700 mt-6 mb-3">6. Sus Derechos</h2>
          <p className="mb-4">
            Usted tiene derecho a acceder, corregir o eliminar su información personal. Para ejercer estos derechos, póngase en contacto con nosotros a través de los canales de soporte.
          </p>

          <p className="mt-8 text-sm text-gray-500">
            Última actualización: Noviembre 2024
          </p>
        </div>
      </div>
      <div className="h-20 sm:h-24" aria-hidden="true" />
    </div>
  );
};

export default LegalPrivacy;

