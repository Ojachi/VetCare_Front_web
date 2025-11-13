# 🩺 VetCare Front — Documento de Contexto

## 📘 Descripción general

**VetCare Front** es la interfaz web del sistema de gestión para una **clínica veterinaria**, desarrollada como parte de un proyecto académico universitario.  
El propósito de este front-end es permitir a los diferentes roles de usuario (dueños, empleados, veterinarios y administradores) interactuar con la **API REST del backend**, ya implementada en **Java Spring Boot**.

El backend proporciona toda la lógica de negocio, seguridad mediante JWT, validaciones, y acceso a la base de datos.  
El front debe consumir dichos endpoints REST, gestionar sesiones seguras, mostrar información dinámica y brindar una experiencia de usuario moderna y fluida.

---

## 🧩 Tecnologías previstas

- **Framework base:** React.js (o equivalente)
- **Estilos:** Tailwind CSS
- **Comunicación con el backend:** Axios o Fetch API
- **Gestión de estado:** React Context / Redux (opcional)
- **Control de sesión:** JWT (JSON Web Token)
- **Herramientas de soporte:** Modelos de IA (gpt-4.1, gpt-4.0, gpt-5-mini, Claude Haiku 4.5)

---

## 🧾 Objetivos del Front-End

- Crear una **interfaz adaptada a cada rol de usuario** (Dueño, Empleado, Veterinario, Administrador).
- Consumir y representar los datos de la API REST del backend.
- Implementar **autenticación JWT** (login, logout y persistencia de sesión).
- Mostrar **listados** de mascotas, servicios, citas y diagnósticos.
- Diseñar **formularios interactivos y validados** para registros y ediciones.
- Ofrecer una experiencia moderna y responsiva mediante **Tailwind CSS**.
- Manejar errores y respuestas del servidor (400, 401, 403, 404).

---

## 🧍 Roles y funcionalidades principales

### 👤 Dueño
- Registrarse en el sistema.
- Iniciar sesión.
- Registrar, editar y eliminar sus mascotas.
- Agendar citas (para sus mascotas).
- Consultar historial médico (citas + diagnósticos).
- Cancelar citas pendientes.

### 👩‍💼 Empleado
- Iniciar sesión.
- Registrar y editar mascotas en nombre de un dueño.
- Agendar citas para dueños.
- Consultar todas las citas.
- Reprogramar o cancelar citas (a solicitud del cliente).

### 🧑‍⚕️ Veterinario
- Iniciar sesión.
- Ver citas asignadas.
- Marcar citas como atendidas.
- Registrar diagnóstico con observaciones, tratamientos y medicamentos.
- Consultar historial de mascotas.

### 🧑‍💻 Administrador
- Iniciar sesión.
- Cambiar roles o desactivar usuarios.
- Ver todas las mascotas y citas registradas.
- Administrar catálogo de servicios (crear, editar, eliminar, desactivar).
- Revisar diagnósticos con fines de auditoría.
- Restablecer contraseñas de usuarios.

---

## 🏗️ Estructura general del backend

El backend fue desarrollado en **Spring Boot**, con la siguiente estructura de carpetas:

```
vetcare_back/
 └── src/main/java/com/vetcare_back/
     ├── config/         -> Configuración general (CORS, Security, Beans)
     ├── controller/     -> API REST (entrada/salida)
     ├── dto/            -> Data Transfer Objects (request/response)
     ├── entity/         -> Modelos JPA (User, Pet, Appointment, Service, Diagnosis)
     ├── exception/      -> Manejo centralizado de errores
     ├── repository/     -> Interfaces JpaRepository
     ├── service/        -> Interfaces de negocio
     ├── service/impl/   -> Implementaciones de lógica
     ├── mapper/         -> MapStruct (Entity ↔ DTO)
     └── security/       -> JWT, roles y permisos
```

---

## 🧠 Entidades principales

| Entidad | Descripción |
|----------|--------------|
| **User** | Representa a los distintos usuarios del sistema (Dueño, Empleado, Veterinario, Admin). |
| **Pet** | Información de cada mascota registrada, asociada a un dueño. |
| **Service** | Catálogo de servicios veterinarios (vacunación, baño, consulta, etc.). |
| **Appointment** | Citas programadas entre mascotas y veterinarios. |
| **Diagnosis** | Registro médico con observaciones y tratamiento posterior a la cita. |

---

## 🌐 Endpoints principales del backend

### 🔑 Autenticación y usuarios
- `POST /api/users/register` → Registro de usuarios.
- `POST /api/auth/login` → Inicio de sesión (devuelve token JWT).
- `GET /api/users/me` → Perfil del usuario autenticado.
- `PUT /api/users/{id}` → Actualización de perfil.

### 🐾 Mascotas
- `GET /api/pets` → Lista mascotas del usuario (o todas si tiene rol superior).
- `POST /api/pets` → Registro de mascota.
- `PUT /api/pets/{id}` → Edición de mascota.
- `DELETE /api/pets/{id}` → Eliminación de mascota.

### 📅 Citas
- `POST /api/appointments` → Crear cita.
- `PUT /api/appointments/{id}/cancel` → Cancelar cita.
- `PUT /api/appointments/{id}/status` → Cambiar estado (aceptar, completar, cancelar).
- `GET /api/appointments` → Listar citas.
- `GET /api/appointments/admin` → Listar citas con filtros (solo admin).

### 💊 Servicios
- `GET /api/services` → Listar servicios activos.
- `POST /api/admin/services` → Crear nuevo servicio (admin).
- `PUT /api/admin/services/{id}` → Actualizar servicio.
- `PUT /api/admin/services/{id}/deactivate` → Desactivar servicio.
- `DELETE /api/admin/services/{id}` → Eliminar servicio.

### 🩺 Diagnósticos
- `POST /api/diagnosis` → Registrar diagnóstico (si implementado).
- `GET /api/diagnosis/{id}` → Consultar diagnóstico por cita.

---

## 🔄 Ejemplo de flujo de usuario

### Dueño — Agendar una cita

1. Inicia sesión → obtiene token JWT.  
2. Consulta sus mascotas (`GET /api/pets`).  
3. Consulta servicios disponibles (`GET /api/services`).  
4. Crea una cita (`POST /api/appointments`).  
5. Visualiza sus citas (`GET /api/appointments`).

---

## 🎯 Recomendaciones para desarrollo asistido por IA

- Guardar este archivo como **`CONTEXT.md`** en la raíz del proyecto front.
- Mantenerlo actualizado si se modifican endpoints o roles.
- La IA puede usar esta información para:
  - Crear componentes y rutas según los roles.
  - Generar formularios basados en los DTOs del backend.
  - Configurar autenticación y manejo de tokens JWT.
  - Construir dashboards y vistas según las funcionalidades descritas.
- Evitar modificar endpoints del backend; el front debe adaptarse a ellos.

---

## 📁 Estructura sugerida para el front

```
vetcare_front/
├── src/
│   ├── api/              -> Servicios de conexión (axios)
│   ├── components/       -> Componentes reutilizables
│   ├── pages/            -> Páginas por rol (Dueño, Empleado, Veterinario, Admin)
│   ├── context/          -> Autenticación y estado global
│   ├── routes/           -> Sistema de rutas protegidas
│   ├── styles/           -> Configuración Tailwind
│   └── App.jsx
├── public/
│   └── index.html
└── CONTEXT.md
```

---

## 🧭 Resumen

El **frontend VetCare** tiene como objetivo principal servir de capa visual y de interacción para el backend veterinario ya implementado.  
Debe permitir la gestión integral de usuarios, mascotas, servicios, citas y diagnósticos, garantizando autenticación, roles y usabilidad óptima.  
Este documento de contexto permite a las IAs asistentes en Visual Studio comprender el alcance del proyecto y generar código alineado con la API y su modelo de datos.

---

© Proyecto académico — Universidad Surcolombiana  
**Materia:** Ingeniería de Software Orientada a Objetos  
**Integrantes:** *(agregar nombres del equipo aquí)*
