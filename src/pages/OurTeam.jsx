import React from 'react';

const teamMembers = [
  {
    name: 'Dr. Juan Pérez',
    role: 'Veterinario Principal',
    bio: 'Especialista en cirugía con más de 15 años de experiencia. Amante de los perros y gatos.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
  },
  {
    name: 'Dra. María González',
    role: 'Dermatóloga Veterinaria',
    bio: 'Experta en el tratamiento de alergias y problemas de piel en mascotas.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Auxiliar Veterinario',
    bio: 'Encargado del cuidado y bienestar de los animales hospitalizados. Siempre con una sonrisa.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/65/20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg',
  },
  {
    name: 'Ana López',
    role: 'Recepcionista',
    bio: 'La primera cara amable que verás al entrar. Organizada y amante de los animales.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg',
  },
];

const OurTeam = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-teal-800 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Nuestro Equipo
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Conoce a los profesionales dedicados a cuidar de la salud y felicidad de tu mascota.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-4 sm:grid-cols-2">
          {teamMembers.map((member) => (
            <div key={member.name} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6 text-center">
                <img
                  className="mx-auto h-32 w-32 rounded-full object-cover mb-4 border-4 border-teal-100"
                  src={member.image}
                  alt={member.name}
                />
                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-teal-600 font-semibold uppercase tracking-wide mb-2">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTeam;

