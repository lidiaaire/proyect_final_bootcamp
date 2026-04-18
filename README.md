# Flowly - Sistema de Gestión de Autorizaciones

> Proyecto orientado a simular un flujo real de gestión de autorizaciones médicas con control de roles, estados y trazabilidad.

---

## 📌 Descripción

Flowly es una aplicación fullstack diseñada para gestionar solicitudes
de autorización médica con un flujo de estados bien definido, roles
diferenciados y trazabilidad completa.

---

## 🧱 Arquitectura

### Backend

- Node.js + Express
- MongoDB (base de datos: **flowly**)
- Estructura:

  src/
  ├── configuration/
  ├── controllers/
  ├── services/
  ├── routes/
  ├── models/
  ├── middlewares/
  ├── utils/

### Frontend

- Next.js
- Consumo de API REST
- Estilos en carpeta `/styles`

---

## ⚙️ Instalación

### 1. Clonar repositorio

    git clone <repo>
    cd proyect_final_bootcamp-main

---

## 🚀 Ejecución paso a paso

### 1. Backend

    cd back
    npm install

Configurar `.env`:

    PORT=4000
    MONGO_URI=mongodb+srv://flowly_user:Flowly1234@cluster0.d3tputi.mongodb.net/flowly?retryWrites=true&w=majority
    JWT_SECRET=your_secret_key

Ejecutar seeds:

    node scripts/seedAll.cjs

Arrancar backend:

    npm start

---

### 2. Frontend

    cd front
    npm install

Crear `.env.local`:

    NEXT_PUBLIC_API_URL=http://localhost:4000

Arrancar:

    npm run dev

---

### 3. Acceso

Abrir en navegador:

    http://localhost:3000

---

## 🔑 Acceso de prueba

    Email: prestaciones@empresa.com
    Password: 123456

---

## 🔐 Restricción de acceso

El sistema solo permite el registro y login con emails corporativos:

    *@empresa.com

Ejemplo válido:

    prestaciones@empresa.com

Esta validación se aplica tanto en frontend como en backend.

---

## 🌐 API - Endpoints

Todos los endpoints usan prefijo:

    /api

> 🔒 Los endpoints (excepto login y register) requieren autenticación mediante JWT:

    Authorization: Bearer <token>

---

### Auth

    POST /api/auth/login
    POST /api/auth/register

#### Respuesta login

    {
      token,
      user
    }

---

### Users

    PUT /api/users/:id
    DELETE /api/users/:id

---

### Solicitudes

    GET /api/solicitudes
    GET /api/solicitudes/:id
    GET /api/solicitudes/policyholder/:numeroPoliza

    POST /api/solicitudes/:id/autorizar
    POST /api/solicitudes/:id/rechazar
    POST /api/solicitudes/:id/solicitar-documentacion
    POST /api/solicitudes/:id/enviar-direccion-medica
    POST /api/solicitudes/:id/enviar-asesoria-juridica

---

### Policyholders

    GET /api/policyholders
    GET /api/policyholders/:id

---

### Communications

    GET /api/communications/:channel
    POST /api/communications

---

## 🧾 Modelo de Datos

### Policyholder

    {
     id,
     name,
     dni,
     telefono,
     email,
     direccion,
     policyType,
     policyStartDate,
     internalNotes
    }

### Solicitud

    {
     numeroSolicitud,
     numeroPoliza,
     estadoInterno,
     currentDepartment,
     documentos,
     historial,
     notas,
     autorizacionPdf
    }

---

## 🔄 Flujo de Estados

Estados del sistema:

    PENDIENTE_INICIO_GESTION
    DOCUMENTACION_SOLICITADA
    EN_REVISION
    AUTORIZADA
    RECHAZADA

Estados adicionales (mapeados en frontend):

    PENDIENTE_DOCUMENTACION_DEL_ASEGURADO → DOCUMENTACION_SOLICITADA
    PENDIENTE_ASESORIA_JURIDICA → EN_REVISION

---

## 📊 Timeline

El timeline del frontend usa estados normalizados mediante un mapper
para evitar inconsistencias visuales.

---

## 🌱 Seeds

Sistema automatizado para generar datos de prueba con relaciones reales.

### Ejecución

    node scripts/seedAll.cjs

### Orden interno

1. Users
2. Policyholders
3. Solicitudes
4. Communications

### Genera

- Usuarios con roles:
  - PRESTACIONES
  - DIRECCION_MEDICA
  - ASESORIA_JURIDICA
  - ADMIN
- 100 policyholders
- 300 solicitudes
- Comunicaciones por canal

---

## 📂 Documentos

Ruta:

    /back/public/docs

Acceso:

    http://localhost:4000/docs/<archivo.pdf>

---

## 🔐 Autenticación

- JWT
- Middleware `verifyToken`
- Roles:

  PRESTACIONES  
   DIRECCION_MEDICA  
   ASESORIA_JURIDICA  
   ADMIN

---

## 🧪 Validación del sistema

- Login funcional ✔
- Registro con validación de dominio ✔
- Listado de solicitudes ✔
- Detalle con documentos ✔
- Timeline coherente ✔
- Policyholders completos ✔
- Historial y notas ✔
- Generación de PDF ✔
- Edición de usuario ✔
- Eliminación de usuario con logout ✔

---

## 🧠 Decisiones técnicas

- Separación controller/service
- Uso consistente de async/await
- Validación en frontend + backend
- Restricción de dominio corporativo
- Normalización de estados en frontend
- Prefijo global `/api`
- Persistencia de sesión con localStorage
- Arquitectura orientada a flujo de negocio

---

## 👤 Gestión de Usuario

- Edición de datos (nombreCompleto y email)
- Eliminación de cuenta con logout automático
- Persistencia de sesión
- Sincronización frontend/backend

---

## 📌 Notas

El sistema está diseñado para simular un flujo real de negocio,
priorizando coherencia de datos, trazabilidad y experiencia de usuario.

---

## 👩‍💻 Autora

Lidia Garcia Torregrosa  
Proyecto Final Bootcamp FullStack CodeSpace
