// Contenido clínico simulado, agrupado por prestación (clinicoKey, ver
// catalogoPrestaciones.js).
//
// DECISIÓN DE DISEÑO (arquitectura documental aprobada): diagnóstico,
// antecedentes, motivo de consulta, hallazgos, técnica, resultados,
// tratamiento, evolución, recomendaciones, procedimiento quirúrgico,
// material protésico y datos de urgencias/ingreso/alta son contenido
// puramente documental de demo. NO son campos de Solicitud ni de
// Policyholder -- viven exclusivamente aquí, en datos de seed, y se
// combinarán en un paso posterior con los datos reales de cada
// solicitud (asegurado, número de solicitud, médico, fechas) para
// generar el PDF correspondiente. Este fichero todavía no genera nada:
// solo prepara el contenido.
//
// Cada entrada usa como claves los mismos strings que
// Solicitud.TIPOS_DOCUMENTO (ver solicitudModel.js), en mayúsculas, para
// que no haga falta ningún mapeo intermedio cuando se conecte con el
// generador de documentos. No todas las prestaciones rellenan las 6
// claves -- solo las familias que tiene sentido que existan para esa
// prestación (orientativo, no una regla rígida).

const CONTENIDO_CLINICO_DEMO = {
  COLONOSCOPIA_DIAGNOSTICA: {
    VOLANTE_MEDICO: {
      impresionDiagnostica:
        "R10.4 - Dolor abdominal, no especificado. Alteración del hábito intestinal en estudio.",
      prioridad: "ORDINARIA",
    },
  },

  RM_LUMBAR: {
    VOLANTE_MEDICO: {
      impresionDiagnostica: "Lumbalgia de varias semanas de evolución con irradiación a MID.",
      prioridad: "PREFERENTE",
    },
    INFORME_RESULTADOS: {
      indicacionClinica:
        "Lumbalgia de varias semanas de evolución con irradiación a miembro inferior derecho. Se solicita RM lumbar para estudio de posible afectación discal.",
      tecnica:
        "Estudio de columna lumbar realizado en equipo de 1.5 Teslas, con secuencias sagitales y axiales en T1, T2 y STIR, sin administración de contraste intravenoso.",
      hallazgos: [
        "Alineación vertebral conservada.",
        "Cambios degenerativos leves en L4-L5 y L5-S1.",
        "Protrusión discal posterior de base ancha en L4-L5 que contacta con el saco tecal, sin signos de compresión radicular significativa.",
        "No se observan lesiones óseas de carácter agresivo.",
      ],
      resultado:
        "Cambios degenerativos leves en L4-L5 y L5-S1, con protrusión discal posterior en L4-L5 sin signos de compresión radicular significativa.",
      conclusion:
        "Hallazgos compatibles con espondilosis lumbar leve. No se identifican signos de estenosis de canal ni afectación radicular significativa.",
    },
  },

  RM_RODILLA: {
    VOLANTE_MEDICO: {
      impresionDiagnostica: "M23.3 - Trastorno meniscal, no especificado. Gonalgia mecánica.",
      prioridad: "ORDINARIA",
    },
    INFORME_RESULTADOS: {
      indicacionClinica: "Dolor mecánico de rodilla de varios meses de evolución, sin traumatismo previo.",
      tecnica: "Estudio de rodilla en equipo de 1.5 Teslas, secuencias DP-FS, T1 y T2 en los tres planos.",
      hallazgos: [
        "Derrame articular leve.",
        "Signos degenerativos condrales en compartimento femorotibial interno grado II.",
        "Menisco interno con señal heterogénea compatible con rotura horizontal del cuerno posterior.",
        "Ligamentos cruzados y colaterales sin hallazgos relevantes.",
      ],
      resultado: "Rotura del cuerno posterior del menisco interno con condropatía interna asociada.",
      conclusion: "Hallazgos compatibles con gonartrosis incipiente y lesión meniscal interna.",
    },
  },

  ECOGRAFIA_ABDOMINAL: {
    VOLANTE_MEDICO: {
      impresionDiagnostica: "R10.1 - Dolor abdominal localizado en epigastrio. Estudio de hepatopatía.",
      prioridad: "ORDINARIA",
    },
    INFORME_RESULTADOS: {
      indicacionClinica: "Dolor en hipocondrio derecho y alteración leve de enzimas hepáticas en analítica reciente.",
      tecnica: "Ecografía abdominal completa con sonda convex, valoración de hígado, vía biliar, páncreas, bazo y riñones.",
      hallazgos: [
        "Hígado de tamaño y ecoestructura normales, sin lesiones focales.",
        "Vesícula biliar sin litiasis ni signos de colecistitis.",
        "Vía biliar no dilatada.",
        "Páncreas, bazo y riñones sin alteraciones significativas.",
      ],
      resultado: "Estudio abdominal dentro de la normalidad.",
      conclusion: "Sin hallazgos ecográficos que justifiquen la sintomatología. Correlacionar con clínica y analítica.",
    },
  },

  ARTROPLASTIA_RODILLA: {
    INFORME_CLINICO: {
      motivoConsulta: "Valoración de hallazgos en prueba de imagen previa. Dolor crónico de rodilla derecha.",
      antecedentes: [
        "Dolor crónico de rodilla derecha de varios años de evolución.",
        "Tratamiento conservador previo (analgesia, fisioterapia e infiltraciones) sin mejoría clínica significativa.",
        "Limitación funcional importante para las actividades de la vida diaria.",
      ],
      exploracionHallazgos:
        "Gonartrosis avanzada de rodilla derecha con pérdida de espacio articular, esclerosis subcondral y osteofitos marginales, Kellgren-Lawrence grado IV.",
      diagnostico: "Gonartrosis avanzada de rodilla derecha (Kellgren-Lawrence grado IV).",
      recomendaciones: [
        "Valorar tratamiento quirúrgico definitivo dada la falta de respuesta al manejo conservador.",
        "Estudio preoperatorio y valoración anestésica.",
      ],
    },
    INFORME_RESULTADOS: {
      indicacionClinica: "Dolor crónico de rodilla derecha con limitación funcional importante.",
      tecnica: "Radiografía de rodilla en carga, proyecciones AP y lateral.",
      hallazgos: [
        "Pinzamiento severo del compartimento femorotibial interno.",
        "Esclerosis subcondral y osteofitos marginales prominentes.",
        "Alineación en varo.",
      ],
      resultado: "Gonartrosis avanzada de rodilla derecha, Kellgren-Lawrence grado IV.",
      conclusion: "Hallazgos compatibles con indicación de artroplastia total de rodilla.",
    },
    PROPUESTA_QUIRURGICA: {
      diagnostico: "Gonartrosis avanzada de rodilla derecha (Kellgren-Lawrence grado IV).",
      antecedentes: [
        "Dolor crónico de rodilla derecha de varios años de evolución.",
        "Tratamiento conservador previo sin mejoría clínica significativa.",
      ],
      justificacion:
        "Dada la evolución clínica, los hallazgos radiológicos y la falta de respuesta al tratamiento conservador, se propone artroplastia total de rodilla derecha como tratamiento definitivo.",
      procedimiento: "Artroplastia total de rodilla derecha. Sustitución de la articulación mediante prótesis total.",
      tecnicaQuirurgica: [
        "Artroplastia total primaria de rodilla derecha.",
        "Abordaje estándar.",
        "Implantación de prótesis total cementada.",
      ],
      materialProtesico: [
        { descripcion: "Prótesis total de rodilla (componente femoral)", lateralidad: "Derecha" },
        { descripcion: "Prótesis total de rodilla (componente tibial)", lateralidad: "Derecha" },
        { descripcion: "Inserto de polietileno", lateralidad: "Derecha" },
        { descripcion: "Componente patelar (si procede)", lateralidad: "Derecha" },
        { descripcion: "Cemento óseo", lateralidad: "Derecha" },
      ],
    },
  },

  HERNIOPLASTIA_INGUINAL: {
    INFORME_CLINICO: {
      motivoConsulta: "Tumoración inguinal derecha reductible, dolorosa con el esfuerzo.",
      antecedentes: [
        "Tumoración inguinal derecha de varios meses de evolución.",
        "Sin antecedentes quirúrgicos abdominales previos.",
      ],
      exploracionHallazgos:
        "Tumoración inguinal derecha reductible, que aumenta con maniobras de Valsalva, sin signos de incarceración.",
      diagnostico: "Hernia inguinal derecha no complicada.",
      recomendaciones: ["Indicación de reparación quirúrgica programada (hernioplastia)."],
    },
    PROPUESTA_QUIRURGICA: {
      diagnostico: "Hernia inguinal derecha no complicada.",
      antecedentes: ["Tumoración inguinal derecha reductible, sintomática con el esfuerzo."],
      justificacion:
        "Se indica reparación quirúrgica programada para evitar el riesgo de complicación (incarceración/estrangulación) y aliviar la sintomatología.",
      procedimiento: "Hernioplastia inguinal derecha con malla.",
      tecnicaQuirurgica: [
        "Abordaje anterior estándar.",
        "Reparación con malla protésica libre de tensión.",
        "No se prevén incidencias específicas.",
      ],
      materialProtesico: [{ descripcion: "Malla quirúrgica de polipropileno", lateralidad: "Derecha" }],
    },
  },

  APENDICECTOMIA_URGENTE: {
    INFORME_URGENCIAS: {
      motivoConsulta:
        "Paciente acude a urgencias por dolor abdominal en fosa ilíaca derecha de 12 horas de evolución, asociado a náuseas y pérdida de apetito.",
      exploracionFisica: [
        "Buen estado general. Consciente y orientado.",
        "Abdomen blando, depresible, doloroso a la palpación en fosa ilíaca derecha, con signos de irritación peritoneal leve.",
      ],
      pruebasComplementarias: [
        "Analítica sanguínea: leucocitosis leve con neutrofilia.",
        "Ecografía abdominal: apéndice no claramente visualizado, sin colecciones.",
        "TAC abdominal con contraste: apendicitis aguda no complicada.",
      ],
      diagnostico: "Apendicitis aguda no complicada",
      cie10: "K35.8",
      tratamiento: [
        "Analgesia intravenosa.",
        "Hidratación con suero fisiológico.",
        "Antibioterapia intravenosa.",
        "Valoración por Cirugía General.",
      ],
      evolucion:
        "Buena tolerancia al tratamiento. Disminución del dolor tras analgesia. Se decide ingreso para tratamiento quirúrgico programado en las próximas 24 horas.",
      destinoAlta: "Ingreso hospitalario en Servicio de Cirugía General.",
    },
    INFORME_ALTA_HOSPITALARIA: {
      motivoIngreso: "Apendicitis aguda",
      diagnosticoPrincipal: "Apendicitis aguda no complicada",
      cie10: "K35.8",
      procedimientoRealizado: "Apendicectomía laparoscópica",
      hallazgosQuirurgicos: [
        "Apendicitis aguda congestiva sin signos de perforación.",
        "Sin colecciones intraabdominales.",
        "Procedimiento sin incidencias.",
      ],
      evolucionIngreso:
        "Buena evolución clínica tras la intervención, con adecuado control del dolor, tolerancia progresiva de la dieta y movilización precoz. Afebril en las últimas 48 horas. Sin signos de complicaciones postoperatorias.",
      tratamientoAlta: [
        { medicamento: "Paracetamol 1 g", pauta: "1 comprimido cada 8 horas (5 días)" },
        { medicamento: "Ibuprofeno 600 mg", pauta: "1 comprimido cada 8 horas (5 días)" },
        { medicamento: "Omeprazol 20 mg", pauta: "1 comprimido al día (10 días)" },
      ],
      recomendacionesAlta: [
        "Reposo relativo durante 7-10 días.",
        "Evitar esfuerzos físicos intensos y levantar peso.",
        "Mantener la herida quirúrgica limpia y seca.",
        "Acudir a revisión en consulta externa de Cirugía General en 2 semanas.",
      ],
    },
  },

  CONSULTA_TRAUMATOLOGIA_LUMBAR: {
    VOLANTE_MEDICO: {
      impresionDiagnostica: "M54.5 - Dolor lumbar. Estudio por dolor lumbar persistente de 6 semanas de evolución.",
      prioridad: "ORDINARIA",
    },
    INFORME_CLINICO: {
      motivoConsulta: "Estudio por dolor lumbar persistente de 6 semanas de evolución.",
      antecedentes: ["Sin antecedentes de interés.", "No antecedentes quirúrgicos previos."],
      exploracionHallazgos:
        "Discopatía degenerativa en L4-L5 con protrusión discal posterior que condiciona leve reducción del espacio subaracnoideo, sin signos de compresión radicular significativa.",
      diagnostico: "Discopatía degenerativa L4-L5 con protrusión discal posterior, sin signos de radiculopatía.",
      recomendaciones: [
        "Tratamiento conservador con fisioterapia.",
        "Control del dolor según pauta analgésica.",
        "Revisión en 3 meses o antes si empeoramiento de síntomas.",
      ],
    },
  },

  INGRESO_NEUMONIA: {
    INFORME_URGENCIAS: {
      motivoConsulta: "Paciente acude a urgencias por fiebre, tos productiva y disnea de 3 días de evolución.",
      exploracionFisica: [
        "Regular estado general, taquipneico.",
        "Auscultación pulmonar con crepitantes en base derecha.",
        "SatO2 basal 91%.",
      ],
      pruebasComplementarias: [
        "Analítica sanguínea: leucocitosis con neutrofilia y PCR elevada.",
        "Radiografía de tórax: consolidación en lóbulo inferior derecho.",
      ],
      diagnostico: "Neumonía adquirida en la comunidad",
      cie10: "J18.9",
      tratamiento: ["Oxigenoterapia.", "Antibioterapia intravenosa.", "Hidratación y control de constantes."],
      evolucion: "Insuficiencia respiratoria leve-moderada que requiere ingreso para tratamiento y monitorización.",
      destinoAlta: "Ingreso hospitalario en Servicio de Medicina Interna.",
    },
    INFORME_ALTA_HOSPITALARIA: {
      motivoIngreso: "Neumonía adquirida en la comunidad",
      diagnosticoPrincipal: "Neumonía adquirida en la comunidad",
      cie10: "J18.9",
      procedimientoRealizado: "Tratamiento médico (antibioterapia intravenosa y oxigenoterapia)",
      evolucionIngreso:
        "Buena evolución clínica y radiológica tras antibioterapia intravenosa. Afebril y sin necesidad de oxígeno suplementario en las últimas 48 horas.",
      tratamientoAlta: [
        { medicamento: "Amoxicilina/Clavulánico 875/125 mg", pauta: "1 comprimido cada 8 horas (7 días)" },
        { medicamento: "Paracetamol 1 g", pauta: "Si fiebre o dolor" },
      ],
      recomendacionesAlta: [
        "Reposo relativo hasta la revisión.",
        "Hidratación abundante.",
        "Acudir a revisión con su médico de atención primaria en 1 semana.",
        "Consultar en caso de fiebre, disnea o empeoramiento del estado general.",
      ],
    },
  },

  REVISION_DIGESTIVO: {
    INFORME_CLINICO: {
      motivoConsulta: "Revisión de seguimiento tras estudio digestivo previo.",
      antecedentes: ["Alteración del hábito intestinal en estudio.", "Sin antecedentes quirúrgicos digestivos."],
      exploracionHallazgos: "Paciente asintomático en el momento de la revisión, buena tolerancia al tratamiento pautado.",
      diagnostico: "Evolución favorable del cuadro digestivo previamente estudiado.",
      recomendaciones: [
        "Mantener las medidas dietéticas recomendadas.",
        "Revisión en 6 meses si persiste la buena evolución.",
      ],
    },
  },
};

module.exports = { CONTENIDO_CLINICO_DEMO };
