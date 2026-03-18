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
MONGO_URI=<tu_uri_mongo>
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

Orden de ejecución:
```
node scripts/seedUsers.js
node scripts/seedPolicyholders.js
node scripts/seedSolicitudes.js
node scripts/seedCommunicationsAdvanced.js
```

Incluyen:
- datos realistas
- relaciones correctas
- notas coherentes
- documentos enlazados

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
- Datos desacoplados (frontend no depende de nombres internos)

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

