// Mapeo de dominio (Solicitud + Policyholder) a los campos que pinta el
// bloque "Datos del paciente" -- IDÉNTICO en las 5 familias A4
// (INFORME_CLINICO, INFORME_RESULTADOS, PROPUESTA_QUIRURGICA,
// INFORME_URGENCIAS, INFORME_ALTA_HOSPITALARIA). Se extrae aquí una vez
// en vez de duplicarlo en cada plantilla porque las 5 lo necesitan con
// el mismo criterio exacto.
//
// GAP DE DOMINIO (mismo ya señalado en el Paso 4 para VOLANTE_MEDICO):
// la entidad aseguradora (p. ej. "Asisa") no existe en el dominio, solo
// `Policyholder.policyType`. Se usa ese campo bajo la etiqueta honesta
// "Tipo de póliza" en vez de inventar una aseguradora.

const { formatearFecha, formatearSexo } = require("../layout");

function construirCamposDatosPaciente({ solicitud, policyholder }) {
  return [
    { label: "Nombre y apellidos", value: solicitud.nombreCompleto },
    { label: "DNI", value: solicitud.dni || policyholder?.dni || null },
    { label: "Fecha de nacimiento", value: formatearFecha(policyholder?.fechaNacimiento) },
    { label: "Sexo", value: formatearSexo(policyholder?.sexo) },
    { label: "Nº de póliza", value: solicitud.numeroPoliza },
    { label: "Tipo de póliza", value: policyholder?.policyType || null },
    { label: "Nº de solicitud", value: solicitud.numeroSolicitud },
  ];
}

module.exports = { construirCamposDatosPaciente };
