# 🏥 Flowly -- Sistema de Gestión de Autorizaciones Médicas

## 📌 Visión general

Flowly es una aplicación fullstack diseñada para digitalizar y
estructurar el flujo interno de gestión de autorizaciones médicas dentro
de una aseguradora.

El proyecto no se limita a mostrar datos: modela un **proceso de negocio
real**, con estados, decisiones, actores y trazabilidad completa.

------------------------------------------------------------------------

## 🎯 Problema que resuelve

En entornos reales, la gestión de autorizaciones médicas suele implicar:

-   Procesos manuales o poco estructurados
-   Falta de trazabilidad sobre decisiones
-   Comunicación fragmentada entre departamentos
-   Dificultad para auditar el estado de una solicitud

Flowly introduce:

-   Un **flujo controlado de estados**
-   **Historial completo de acciones**
-   **Separación por roles**
-   **Centralización de información y documentos**

------------------------------------------------------------------------

## 🧠 Enfoque del proyecto

Este proyecto está construido con mentalidad de producto:

-   No se centra en pantallas → se centra en **flujos**
-   No se centra en datos → se centra en **dominio**
-   No se centra en features → se centra en **coherencia del sistema**

------------------------------------------------------------------------

## 🚀 Funcionalidades principales

### 👤 Gestión de asegurados

-   Alta y consulta de asegurados
-   Visualización de información relevante
-   Relación directa con solicitudes

------------------------------------------------------------------------

### 📄 Gestión de solicitudes médicas

-   Creación de solicitudes
-   Asociación a asegurado (numeroPoliza)
-   Datos médicos estructurados

------------------------------------------------------------------------

### 🔄 Flujo de estados (núcleo del sistema)

    PENDIENTE_INICIO_GESTION
        ↓
    DOCUMENTACION_SOLICITADA
        ↓
    EN_REVISION
        ↓
    AUTORIZADA / RECHAZADA

Cada transición: - Está controlada - Registra historial - Puede implicar
cambio de departamento

------------------------------------------------------------------------

### 🧑‍⚕️ Sistema de roles

  Rol                Responsabilidad
  ------------------ -------------------
  admin              Control global
  prestaciones       Gestión inicial
  direccionmedica    Validación médica
  asesoriajuridica   Validación legal

------------------------------------------------------------------------

### 🧾 Gestión documental

-   Visualización de documentos aportados por el asegurado
-   Integración dentro del flujo de la solicitud
-   Asociados a estados concretos

------------------------------------------------------------------------

### 📊 Historial (trazabilidad)

Cada solicitud mantiene:

-   Cambios de estado
-   Usuario que ejecuta la acción
-   Comentarios
-   Timestamp

Esto permite: - Auditoría completa - Debug funcional - Transparencia del
proceso

------------------------------------------------------------------------

### 🧭 Visualización del flujo (Frontend)

-   Timeline de estados
-   Información contextual de la solicitud
-   Acciones disponibles según estado y rol
-   Separación clara entre:
    -   Información
    -   Documentación
    -   Acciones

------------------------------------------------------------------------

## 🏗️ Arquitectura

### Backend -- Node.js + Express

Principio clave: **Separación de responsabilidades**

    controllers → entrada/salida HTTP
    services    → lógica de negocio
    models      → estructura de datos
    routes      → definición de endpoints
    middlewares → auth / errores

Ejemplo real: - Controller → recibe request - Service → decide lógica
(cambio de estado) - Model → persiste en MongoDB

------------------------------------------------------------------------

### Frontend -- Next.js

Principios aplicados:

-   Estado explícito (`useState` por campo)
-   Separación de estilos (`/styles`)
-   Navegación simple (sin sobreingeniería)
-   Consumo de API desacoplado

------------------------------------------------------------------------

## 🔗 Contrato de datos (crítico)

### Policyholder

    id
    name
    dni
    internalNotes

------------------------------------------------------------------------

### Request

    _id
    numeroSolicitud
    numeroPoliza
    nombreCompleto
    dni
    nombrePrueba
    especialidad
    centroMedico
    estadoInterno
    currentDepartment
    documentos
    historial
    notas
    createdAt

✔️ Este contrato se ha mantenido estable para evitar roturas entre
frontend y backend.

------------------------------------------------------------------------

## ⚙️ Decisiones técnicas clave

### 1. Separación controller / service

Evita mezclar: - HTTP - lógica de negocio

------------------------------------------------------------------------

### 2. Naming orientado a dominio

Ejemplo: - `numeroPoliza` en lugar de `policyholderId` - `estadoInterno`
en lugar de `status`

------------------------------------------------------------------------

### 3. Flujo controlado

No se permite: - Cambiar a cualquier estado libremente - Saltarse pasos
del proceso

------------------------------------------------------------------------

### 4. Historial como fuente de verdad

El sistema no solo muestra estado actual: → guarda cómo se llegó ahí

------------------------------------------------------------------------

### 5. Backend-first approach

Primero: - API estable - Lógica validada

Después: - Frontend conectado

------------------------------------------------------------------------

## 🧪 Datos de prueba

Incluye seeds para:

-   Policyholders
-   Requests

Permiten: - Simular escenarios reales - Probar flujo completo

------------------------------------------------------------------------

## 🧩 Retos técnicos enfrentados

-   Sincronización frontend-backend
-   Consistencia del modelo de datos
-   Control de estados sin romper flujo
-   Gestión de errores (`undefined.role`, etc.)
-   Visualización coherente del historial
-   Escalabilidad sin sobrecomplicar

------------------------------------------------------------------------

## 📈 Evolución del proyecto

El proyecto ha pasado por:

1.  CRUD básico
2.  Introducción de estados
3.  Separación de lógica
4.  Sistema de roles
5.  Historial
6.  Visualización avanzada (timeline + documentos)
7.  Refinamiento de arquitectura

------------------------------------------------------------------------

## 🔮 Mejoras futuras (arquitectura preparada)

-   Normalizador de datos en frontend
-   Autenticación real con JWT
-   Sistema de permisos granular
-   Subida real de documentos
-   Dashboard por rol
-   Tests automatizados

------------------------------------------------------------------------

## 🎯 Qué demuestra este proyecto

-   Modelado de dominio real
-   Pensamiento orientado a negocio
-   Arquitectura limpia
-   Capacidad de depuración
-   Integración fullstack completa
-   Evolución progresiva sin romper sistema

------------------------------------------------------------------------

## 📅 Fecha

18/03/2026

------------------------------------------------------------------------

## 👩‍💻 Autora 

Lidia Garcia Torregrosa

Proyecto desarrollado como entrega final de bootcamp con enfoque
profesional y orientado a entorno real.
