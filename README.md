# Flowly - Sistema de Gestión de Autorizaciones

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

```{=html}
<!-- -->
```

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

### 2. Backend

    cd back
    npm install

Crear `.env`:

    PORT=4000
    MONGO_URI=mongodb+srv://flowly_user:Flowly1234@cluster0.d3tputi.mongodb.net/flowly?retryWrites=true&w=majority
    JWT_SECRET=secret

> ⚠️ Este usuario está creado únicamente para evaluación del proyecto.
> La base de datos ya incluye datos de prueba generados mediante seeds.

---

Arrancar:

    npm start

---

### 3. Frontend

    cd front
    npm install
    npm run dev

---

## 🌐 API - Endpoints

Todos los endpoints usan prefijo:

    /api

### Auth

    POST /api/auth/login
    POST /api/auth/register

### Users

    PUT /api/users/:id
    DELETE /api/users/:id

### Solicitudes

    GET /api/solicitudes
    GET /api/solicitudes/:id
    GET /api/solicitudes/policyholder/:numeroPoliza

    POST /api/solicitudes/:id/autorizar
    POST /api/solicitudes/:id/rechazar
    POST /api/solicitudes/:id/solicitar-documentacion
    POST /api/solicitudes/:id/enviar-direccion-medica
    POST /api/solicitudes/:id/enviar-asesoria-juridica

### Policyholders

    GET /api/policyholders
    GET /api/policyholders/:id

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

El proyecto incluye un sistema automatizado para generar datos de prueba
con relaciones reales entre entidades.

### 🚀 Ejecución

Desde la carpeta backend:

    node scripts/seedAll.cjs

### 🧠 Orden interno

1.  Users
2.  Policyholders
3.  Solicitudes
4.  Communications

### 📊 Qué generan los seeds

- **Users**
  - PRESTACIONES
  - DIRECCION_MEDICA
  - ASESORIA_JURIDICA
  - ADMIN
- **Policyholders**
  - 100 asegurados con datos completos
- **Solicitudes**
  - 300 solicitudes con historial, documentos y notas
- **Communications**
  - Comunicaciones por canal y departamento

### ⚠️ Consideraciones

- Requiere `.env` correctamente configurado
- Si no existen policyholders, el seed de solicitudes fallará

---

## 📂 Documentos

Los documentos se sirven desde:

    /back/public/docs

Acceso:

    http://localhost:4000/docs/<archivo.pdf>

---

## 🔐 Autenticación

- JWT
- Middleware `verifyToken`
- Roles:

```{=html}
<!-- -->
```

    PRESTACIONES
    DIRECCION_MEDICA
    ASESORIA_JURIDICA
    ADMIN

---

## 🧪 Validación del sistema

Checklist:

- Login funcional ✔
- Listado de solicitudes ✔
- Detalle con documentos ✔
- Timeline coherente ✔
- Policyholders completos ✔
- Historial y notas ✔
- Generación de PDF ✔
- Registro de usuario desde frontend ✔
- Edición de usuario ✔
- Eliminación de usuario con logout ✔

---

## 🧠 Decisiones técnicas

- Separación controller/service
- Uso consistente de async/await
- Normalización de estados en frontend
- Prefijo global `/api`
- Datos desacoplados entre frontend y backend
- Implementación de CRUD de usuario (update/delete)
- Sincronización de sesión mediante localStorage (token + user)
- Gestión de estado de usuario en frontend con persistencia

---

## 👤 Gestión de Usuario

El sistema permite la gestión completa del usuario autenticado desde el frontend:

- Edición de datos personales (nombre y email)
- Eliminación de cuenta con invalidación de sesión
- Persistencia de sesión mediante localStorage
- Sincronización entre backend y frontend tras modificaciones

Estas funcionalidades están integradas en el header de la aplicación mediante un dropdown accesible desde el avatar del usuario.

## 🚀 Ejecución final

1.  Ejecutar seeds:

```{=html}
<!-- -->
```

    node scripts/seedAll.cjs

2.  Levantar backend:

```{=html}
<!-- -->
```

    npm start

3.  Levantar frontend:

```{=html}
<!-- -->
```

    npm run dev

4.  Acceder a:

```{=html}
<!-- -->
```

    http://localhost:3000

---

## 📌 Notas

El sistema está diseñado para simular un flujo real de negocio,
priorizando coherencia de datos, trazabilidad y claridad visual.

---

## 👩‍💻 Autora

Lidia Garcia Torregrosa

Proyecto Final del Bootcamp FullStack CodeSpace
