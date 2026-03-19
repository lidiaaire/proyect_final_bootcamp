# Flowly - Sistema de Gestión de Autorizaciones

## 📌 Descripción

Flowly es una aplicación fullstack diseñada para gestionar solicitudes de autorización médica con un flujo de estados bien definido, roles diferenciados y trazabilidad completa.

---

## 🧱 Arquitectura

### Backend

- Node.js + Express
- MongoDB (base de datos: **flowly**)
- Estructura:

```
src/
 ├── configuration/
 ├── controllers/
 ├── services/
 ├── routes/
 ├── models/
 ├── middlewares/
 ├── utils/
```

### Frontend

- Next.js
- Consumo de API REST
- Estilos en carpeta `/styles`

---

## ⚙️ Instalación

### 1. Clonar repositorio

```
git clone <repo>
cd proyect_final_bootcamp
```

### 2. Backend

```
cd back
npm install
```

Crear `.env`:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/flowly
JWT_SECRET=secret
```

Arrancar:

```
npm start
```

---

### 3. Frontend

```
cd front
npm install
npm run dev
```

---

## 🌐 API - Endpoints

Todos los endpoints usan prefijo:

```
/api
```

### Auth

```
POST /api/auth/login
POST /api/auth/register
```

### Solicitudes

```
GET /api/solicitudes
GET /api/solicitudes/:id
GET /api/solicitudes/policyholder/:numeroPoliza

POST /api/solicitudes/:id/autorizar
POST /api/solicitudes/:id/rechazar
POST /api/solicitudes/:id/solicitar-documentacion
POST /api/solicitudes/:id/enviar-direccion-medica
POST /api/solicitudes/:id/enviar-asesoria-juridica
```

### Policyholders

```
GET /api/policyholders
GET /api/policyholders/:id
```

### Communications

```
GET /api/communications/:channel
POST /api/communications
```

---

## 🧾 Modelo de Datos

### Policyholder

```
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
```

### Solicitud

```
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
```

---

## 🔄 Flujo de Estados

Estados del sistema:

```
PENDIENTE_INICIO_GESTION
DOCUMENTACION_SOLICITADA
EN_REVISION
AUTORIZADA
RECHAZADA
```

Estados adicionales (mapeados en frontend):

```
PENDIENTE_DOCUMENTACION_DEL_ASEGURADO → DOCUMENTACION_SOLICITADA
PENDIENTE_ASESORIA_JURIDICA → EN_REVISION
```

---

## 📊 Timeline

El timeline del frontend usa estados normalizados mediante un mapper para evitar inconsistencias visuales.

---

## 🌱 Seeds

El proyecto incluye un sistema automatizado para generar datos de prueba con relaciones reales entre entidades.

### 🚀 Ejecución automática

Desde la carpeta backend:

```
npm run seed
```

### 🧠 Orden interno (automatizado)

1. Users
2. Policyholders
3. Solicitudes
4. Communications

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

- Requiere base de datos `flowly`
- Si no existen policyholders, el seed de solicitudes fallará
- Puede tardar unos segundos en ejecutarse

---

## 📂 Documentos

Los documentos se sirven desde:

```
/back/public/docs
```

Acceso:

```
http://localhost:4000/docs/<archivo.pdf>
```

---

## 🔐 Autenticación

- JWT
- Middleware `verifyToken`
- Roles:

```
PRESTACIONES
DIRECCION_MEDICA
ASESORIA_JURIDICA
ADMIN
```

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

---

## 🧠 Decisiones técnicas

- Separación controller/service
- Uso consistente de async/await
- Normalización de estados en frontend
- Prefijo global `/api`
- Datos desacoplados entre frontend y backend

---

## 🚀 Ejecución final

1. Levantar backend
2. Ejecutar seeds
3. Levantar frontend
4. Acceder a:

```
http://localhost:3000
```

---

## 📌 Notas

El sistema está diseñado para simular un flujo real de negocio, priorizando coherencia de datos, trazabilidad y claridad visual.

## Autora

Lidia Garcia Torregrosa

Proyecto Final del Bootcamp FullStack CodeSpace
