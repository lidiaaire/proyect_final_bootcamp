# Flowly -- Mapa de Flujo del Sistema (Backend + Frontend)

## 1. Estados del dominio

Estados utilizados en el backend:

-   PENDIENTE_INICIO_GESTION
-   DOCUMENTACION_SOLICITADA
-   EN_REVISION
-   AUTORIZADA
-   RECHAZADA

Significado:

  Estado                     Significado
  -------------------------- -----------------------------------------
  PENDIENTE_INICIO_GESTION   Solicitud recién creada
  DOCUMENTACION_SOLICITADA   Se ha pedido documentación al asegurado
  EN_REVISION                Caso en revisión médica o jurídica
  AUTORIZADA                 Autorización concedida
  RECHAZADA                  Autorización denegada

------------------------------------------------------------------------

# 2. Roles del sistema

Roles definidos en Flowly:

-   admin
-   prestaciones
-   direccionmedica
-   asesoriajuridica

Responsabilidades:

  Rol                Función
  ------------------ ------------------------
  admin              gestión global
  prestaciones       gestión de solicitudes
  direccionmedica    revisión médica
  asesoriajuridica   revisión legal

------------------------------------------------------------------------

# 3. Flujo funcional del negocio

APP ASEGURADO\
↓\
PENDIENTE_INICIO_GESTION\
↓\
PRESTACIONES analiza caso

Posibles acciones:

-   Solicitar documentación → DOCUMENTACION_SOLICITADA
-   Enviar a dirección médica → EN_REVISION (direccionmedica)
-   Enviar a asesoría jurídica → EN_REVISION (asesoriajuridica)
-   Autorizar → AUTORIZADA
-   Rechazar → RECHAZADA

------------------------------------------------------------------------

# 4. Endpoints Backend

  ---------------------------------------------------------------------------------
  Endpoint                                        Acción
  ----------------------------------------------- ---------------------------------
  GET /api/solicitudes                            Listar solicitudes

  GET /api/solicitudes/:id                        Ver solicitud

  POST                                            Solicitar documentación
  /api/solicitudes/:id/solicitar-documentacion    

  POST                                            Enviar a dirección médica
  /api/solicitudes/:id/enviar-direccion-medica    

  POST                                            Enviar a asesoría jurídica
  /api/solicitudes/:id/enviar-asesoria-juridica   

  POST /api/solicitudes/:id/autorizar             Autorizar solicitud

  POST /api/solicitudes/:id/rechazar              Rechazar solicitud
  ---------------------------------------------------------------------------------

------------------------------------------------------------------------

# 5. API Frontend

Archivo:

src/api/solicitudes.js

Funciones principales:

-   getSolicitudes()
-   getRequest()
-   requestMoreDocs()
-   sendToMedicalDirection()
-   authorizeRequest()
-   rejectRequest()

------------------------------------------------------------------------

# 6. Pantallas del Frontend

Dashboard

pages/index.js

Muestra:

-   KPIs
-   Últimas solicitudes
-   Actividad reciente

Lista de solicitudes

pages/solicitudes/index.js

Componentes:

-   SolicitudesList
-   SolicitudPreview

Detalle de solicitud

pages/solicitudes/\[id\].js

Acciones disponibles:

-   solicitar documentación
-   enviar a dirección médica
-   autorizar
-   rechazar

------------------------------------------------------------------------

# 7. Historial del caso

Cada acción genera un evento en:

solicitud.historial

Estructura:

{ tipo, estadoAnterior, estadoNuevo, changedBy, fecha }

Ejemplo:

PRESTACIONES solicitó documentación\
PRESTACIONES envió a dirección médica\
DIRECCION_MEDICA revisó caso\
PRESTACIONES autorizó solicitud

------------------------------------------------------------------------

# 8. Documentos

Campo:

solicitud.documentos

Ejemplo:

{ nombre, tipo, url, subidoPor, fecha }

Tipos habituales:

-   informe_medico
-   documentacion_adicional
-   AUTORIZACION

------------------------------------------------------------------------

# 9. Notas internas

Campo:

solicitud.notas

Estructura:

{ text, author, date }

Se muestran en:

-   detalle de solicitud
-   perfil del asegurado

------------------------------------------------------------------------

# 10. Relación con asegurado

Modelo:

Policyholder.id

Relacionado con:

Solicitud.numeroPoliza

Esto permite mostrar el historial de solicitudes dentro del perfil del
asegurado.

------------------------------------------------------------------------

# 11. Checklist de estabilidad del sistema

El sistema está correctamente conectado si funcionan:

-   login
-   dashboard carga solicitudes
-   listado de solicitudes
-   detalle de solicitud
-   solicitar documentación
-   enviar a dirección médica
-   autorizar solicitud
-   rechazar solicitud
-   historial se registra
-   documento de autorización se genera
-   perfil de asegurado muestra sus solicitudes

------------------------------------------------------------------------

# 12. Conclusión

Flowly cuenta con:

-   Backend estructurado (Node + Express + Mongo)
-   Flujo de negocio definido
-   Frontend conectado (Next.js)
-   Historial auditable de cada caso
-   Modelo de datos consistente

Arquitectura orientada a sistemas reales de gestión de autorizaciones
médicas.
