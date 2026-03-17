# Flowly -- Sistema de Gestión de Autorizaciones Médicas

## 📌 Descripción

Flowly es una aplicación fullstack orientada a la gestión interna de
solicitudes de autorizaciones médicas dentro de una aseguradora. Permite
gestionar el ciclo completo de una solicitud desde su creación hasta su
resolución, incluyendo validaciones, revisiones por distintos
departamentos y generación de documentación.

El sistema está diseñado siguiendo un enfoque de flujo de negocio real,
separando responsabilidades entre backend y frontend, y modelando
entidades clave como asegurados y solicitudes.

------------------------------------------------------------------------

## 🧠 Objetivo del proyecto

-   Simular un sistema real de gestión de autorizaciones
-   Aplicar arquitectura backend con Node.js y Express
-   Consumir API desde un frontend en Next.js
-   Gestionar estados y flujo de negocio
-   Trabajar con MongoDB como base de datos

------------------------------------------------------------------------

## 🏗️ Arquitectura

### Backend

-   Node.js
-   Express
-   MongoDB (Mongoose)
-   Estructura por capas:
    -   routes
    -   controllers
    -   services
    -   models
    -   transformers (adaptación de datos para salida de API)

### Frontend

-   Next.js
-   React
-   CSS Modules

------------------------------------------------------------------------

## 📊 Modelo de datos

### Policyholder (Asegurado)

``` js
{
  id: "POL-1000",
  name: "Nombre",
  dni: "12345678A",
  internalNotes: []
}
```

### Solicitud (Request)

``` js
{
  _id,
  numeroSolicitud,
  numeroPoliza,
  nombreCompleto,
  nombrePrueba,
  especialidad,
  centroMedico,
  estadoInterno,
  currentDepartment,
  documentos,
  historial,
  notas,
  createdAt
}
```

Relación:

``` js
Solicitud.numeroPoliza === Policyholder.id
```

------------------------------------------------------------------------

## 🔄 Flujo de negocio

### Estados principales

-   PENDIENTE_INICIO_GESTION\
-   DOCUMENTACION_SOLICITADA\
-   EN_REVISION\
-   AUTORIZADA\
-   RECHAZADA

### Roles del sistema

-   admin\
-   prestaciones\
-   direccionmedica\
-   asesoriajuridica

### Flujo

1.  Creación de solicitud\
2.  Solicitud de documentación (si aplica)\
3.  Envío a revisión (dirección médica o asesoría jurídica)\
4.  Resolución (autorización o rechazo)

------------------------------------------------------------------------

## ⚙️ Funcionalidades principales

-   Gestión de asegurados\
-   Creación y consulta de solicitudes\
-   Cambio de estado con historial (auditoría)\
-   Notas internas\
-   Simulación de envío de emails\
-   Generación de PDF de autorización\
-   Sistema de comunicaciones (chat por canales)

------------------------------------------------------------------------

## 🚀 Puesta en marcha

### 1. Clonar repositorio

``` bash
git clone <repo>
cd proyecto
```

------------------------------------------------------------------------

### 2. Backend

``` bash
cd back
npm install
npm run start
```

Variables de entorno (.env):

``` env
MONGO_URI=tu_uri
JWT_SECRET=tu_secret
PORT=4000
```

Servidor disponible en:

``` bash
http://localhost:4000
```

------------------------------------------------------------------------

### 3. Frontend

``` bash
cd front
npm install
npm run dev
```

Aplicación disponible en:

``` bash
http://localhost:3000
```

------------------------------------------------------------------------

## 🔌 Endpoints principales

### Auth

-   POST /api/auth/login\
-   POST /api/auth/register

### Autenticación

El sistema utiliza JWT para la autenticación.\
Tras el login, el token debe incluirse en las peticiones protegidas
mediante:

Authorization: Bearer `<token>`{=html}

------------------------------------------------------------------------

### Policyholders

-   GET /api/policyholders\
-   GET /api/policyholders/:id

------------------------------------------------------------------------

### Solicitudes

-   GET /api/solicitudes\
-   GET /api/solicitudes/:id\
-   POST /api/solicitudes/:id/autorizar\
-   POST /api/solicitudes/:id/rechazar\
-   POST /api/solicitudes/:id/solicitar-documentacion

------------------------------------------------------------------------

### Communications

-   GET /api/communications/:channel\
-   POST /api/communications

------------------------------------------------------------------------

## 📄 Generación de documentos

El sistema genera automáticamente un PDF de autorización cuando una
solicitud es aprobada.\
El documento se almacena en el servidor y queda asociado a la solicitud
para su consulta posterior.

------------------------------------------------------------------------

## 📌 Notas técnicas

-   Separación clara entre controllers y services\
-   Uso de async/await con control de errores\
-   Transformación de datos antes de enviarlos al frontend\
-   Relación entre entidades mediante claves de dominio (numeroPoliza)\
-   Modelado orientado a dominio (flujo de autorizaciones médicas)\
-   Control de estados mediante lógica de negocio en servicios\
-   Historial de cambios para trazabilidad\
-   Separación de responsabilidades siguiendo buenas prácticas backend

------------------------------------------------------------------------

## 📷 Capturas

(Añadir aquí capturas de pantalla del login, dashboard, perfil y detalle
de solicitud)

------------------------------------------------------------------------

## 📎 Estado del proyecto

Aplicación funcional con flujo completo de gestión de solicitudes,
diseñada con enfoque en lógica de negocio y separación de
responsabilidades.

------------------------------------------------------------------------

## 👤 Autor

Lidia -- Proyecto final bootcamp fullstack
