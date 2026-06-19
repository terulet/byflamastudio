/* =====================================================================
   ATLAS SANDBOX · Datos 100% simulados
   ---------------------------------------------------------------------
   Este archivo NO conecta con ninguna API real. No hay email real,
   ni WhatsApp real, ni documentos reales. Todo el contenido es ficticio
   y sirve para validar el flujo de Atlas antes de conectar canales
   reales con permisos, seguridad y cumplimiento RGPD.
   ===================================================================== */
(function () {
  'use strict';

  /* --- Canales simulados (badges) --- */
  var CHANNELS = {
    email: {
      id: 'email', label: 'Email',
      icon: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/><path d="m4 7 8 6 8-6"/>'
    },
    whatsapp: {
      id: 'whatsapp', label: 'WhatsApp',
      icon: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 8.8c0-.3.2-.5.5-.5h.8c.2 0 .4.1.5.4l.5 1.3c.1.2 0 .4-.1.6l-.5.5a6 6 0 0 0 2.4 2.4l.5-.5c.2-.2.4-.2.6-.1l1.3.5c.3.1.4.3.4.5v.8c0 .3-.2.5-.5.5a7 7 0 0 1-6.4-6.4Z"/>'
    },
    call: {
      id: 'call', label: 'Llamada',
      icon: '<path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L19 16l4 1.5V20a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>'
    },
    web: {
      id: 'web', label: 'Web',
      icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>'
    },
    document: {
      id: 'document', label: 'Documento',
      icon: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 16h6"/>'
    }
  };

  /* --- Badges de riesgo / sensibilidad --- */
  var TAGS = {
    riesgo:     { id: 'riesgo', label: 'Riesgo', tone: 'risk' },
    sensible:   { id: 'sensible', label: 'Sensible', tone: 'sensible' },
    confidencial: { id: 'confidencial', label: 'Confidencial', tone: 'sensible' },
    plazo:      { id: 'plazo', label: 'Plazo', tone: 'deadline' },
    revision:   { id: 'revision', label: 'Revisión obligatoria', tone: 'review' }
  };

  /* Conjuntos de estados personalizados por vertical */
  var STATUS_SETS = {
    gestoria: [
      { id: 'nuevo', label: 'Nuevo', tone: 'new' },
      { id: 'urgente', label: 'Urgente', tone: 'urgent' },
      { id: 'pendiente-docs', label: 'Pendiente documentos', tone: 'wait' },
      { id: 'revision', label: 'En revisión', tone: 'review' },
      { id: 'respondido', label: 'Respondido', tone: 'done' },
      { id: 'archivado', label: 'Archivado', tone: 'archived' }
    ],
    abogados: [
      { id: 'nuevo', label: 'Nuevo', tone: 'new' },
      { id: 'urgente', label: 'Urgente', tone: 'urgent' },
      { id: 'plazo', label: 'Con plazo', tone: 'wait' },
      { id: 'revision', label: 'Revisión obligatoria', tone: 'review' },
      { id: 'respondido', label: 'Respondido', tone: 'done' },
      { id: 'archivado', label: 'Archivado', tone: 'archived' }
    ],
    restaurante: [
      { id: 'nueva-reserva', label: 'Nueva reserva', tone: 'new' },
      { id: 'confirmar', label: 'Confirmar', tone: 'urgent' },
      { id: 'confirmada', label: 'Confirmada', tone: 'done' },
      { id: 'cambio', label: 'Cambio pendiente', tone: 'wait' },
      { id: 'cancelada', label: 'Cancelada', tone: 'archived' },
      { id: 'archivada', label: 'Archivada', tone: 'archived' }
    ],
    peluqueria: [
      { id: 'nueva-cita', label: 'Nueva cita', tone: 'new' },
      { id: 'confirmar', label: 'Confirmar', tone: 'urgent' },
      { id: 'confirmada', label: 'Confirmada', tone: 'done' },
      { id: 'cambio', label: 'Cambio pendiente', tone: 'wait' },
      { id: 'respondido', label: 'Respondido', tone: 'done' },
      { id: 'archivado', label: 'Archivado', tone: 'archived' }
    ],
    estetica: [
      { id: 'nueva-consulta', label: 'Nueva consulta', tone: 'new' },
      { id: 'confirmar', label: 'Confirmar', tone: 'urgent' },
      { id: 'confirmada', label: 'Confirmada', tone: 'done' },
      { id: 'seguimiento', label: 'Seguimiento', tone: 'review' },
      { id: 'respondido', label: 'Respondido', tone: 'done' },
      { id: 'archivado', label: 'Archivado', tone: 'archived' }
    ]
  };

  /* ------------------------------------------------------------------
     NEGOCIOS VIRTUALES
     ------------------------------------------------------------------ */
  var BUSINESSES = [

    /* 1. GESTORÍA ---------------------------------------------------- */
    {
      id: 'gestoria',
      name: 'Gestoría Demo Vallseca',
      short: 'Gestoría',
      sector: 'Asesoría fiscal, contable y laboral',
      initials: 'GV',
      accent: '#e4cfaa',
      pain: 'Mensajes de clientes mezclados con plazos fiscales: lo urgente se entierra entre facturas y dudas.',
      statuses: STATUS_SETS.gestoria,
      defaultStatus: 'nuevo',
      avgMinutesSaved: 9,
      seeds: [
        {
          channel: 'whatsapp', person: 'Marta Ferrer', area: 'Fiscal',
          subject: 'Carta de Hacienda recibida', urgency: 'alta',
          status: 'urgente', time: '08:54', tags: ['riesgo', 'sensible'],
          snippet: 'Me ha llegado una carta de Hacienda, ¿me puedes decir qué hago?',
          body: 'Hola, esta mañana me ha llegado una carta de Hacienda con un membrete que pone "requerimiento". No la entiendo y me pone nerviosa. ¿Me puedes decir qué hago y si tengo que contestar a algo?',
          history: [
            { time: '08:54', label: 'Mensaje recibido por WhatsApp (simulado)' },
            { time: '08:55', label: 'Atlas detecta posible plazo de Hacienda' }
          ],
          documents: [{ name: 'requerimiento-aeat.pdf', type: 'Documento adjunto' }],
          suggestions: {
            draft: 'Hola Marta, gracias por avisar. Para ayudarte necesito ver la carta completa: ¿puedes enviarme una foto nítida de todas las páginas? En cuanto la revise te confirmo si hay plazo y los pasos. No respondas tú a Hacienda hasta que lo veamos juntos.',
            documents: ['Carta / requerimiento AEAT', 'Último modelo presentado del periodo afectado'],
            checklist: ['Confirmar fecha de notificación', 'Identificar plazo de respuesta', 'Revisar si requiere alegaciones'],
            risks: ['Posible plazo perentorio', 'Dato personal sensible: tratar con confidencialidad']
          }
        },
        {
          channel: 'email', person: 'Construcciones Roca SL', area: 'Contable',
          subject: 'Facturas del trimestre', urgency: 'media',
          status: 'pendiente-docs', time: '09:30', tags: [],
          snippet: 'Te adjunto facturas del trimestre.',
          body: 'Buenos días, os adjunto las facturas emitidas y recibidas del trimestre para que vayáis preparando el IVA. Faltan un par de tickets que os paso la semana que viene.',
          history: [
            { time: '09:30', label: 'Email recibido (simulado)' },
            { time: '09:31', label: 'Atlas clasifica como documentación trimestral' }
          ],
          documents: [
            { name: 'facturas-emitidas-Q.zip', type: 'Adjunto' },
            { name: 'facturas-recibidas-Q.zip', type: 'Adjunto' }
          ],
          suggestions: {
            draft: 'Recibidas las facturas del trimestre, gracias. Las dejamos en revisión y te avisamos si falta algo. Recuerda enviarnos los tickets pendientes antes del día 15 para cerrar el IVA con tiempo.',
            documents: ['Facturas emitidas', 'Facturas recibidas', 'Tickets pendientes'],
            checklist: ['Cotejar numeración de facturas', 'Cuadrar IVA soportado/repercutido', 'Avisar de tickets pendientes'],
            risks: ['Documentación incompleta hasta recibir tickets']
          }
        },
        {
          channel: 'call', person: 'Jordi Pla', area: 'Laboral',
          subject: 'Consulta: contratar a un trabajador', urgency: 'media',
          status: 'nuevo', time: '10:12', tags: [],
          snippet: 'Cliente pregunta si puede contratar a un trabajador este mes.',
          body: 'Llamada apuntada: el cliente quiere saber si puede contratar a un trabajador este mes, qué tipo de contrato le conviene y cuánto le costaría aproximadamente con la cuota de la Seguridad Social.',
          history: [
            { time: '10:12', label: 'Llamada registrada (simulada)' },
            { time: '10:13', label: 'Atlas crea caso laboral a partir de la nota' }
          ],
          documents: [],
          suggestions: {
            draft: 'Hola Jordi, sobre la contratación: para darte una cifra cerrada necesito el puesto, jornada y salario bruto que tienes en mente. Con eso te preparo una simulación de coste y las opciones de contrato. ¿Te llamo mañana por la mañana?',
            documents: ['Convenio aplicable', 'Tablas salariales del sector'],
            checklist: ['Definir tipo de contrato', 'Calcular coste empresa', 'Comprobar bonificaciones disponibles'],
            risks: ['Decisión del cliente: Atlas solo prepara opciones']
          }
        },
        {
          channel: 'document', person: 'Talleres Bonet', area: 'Fiscal',
          subject: 'Modelo 303 pendiente de revisar', urgency: 'media',
          status: 'revision', time: '11:05', tags: ['revision'],
          snippet: 'Modelo 303 pendiente de revisar antes de presentar.',
          body: 'Borrador del modelo 303 del trimestre generado a partir de la contabilidad. Pendiente de revisión profesional antes de presentar.',
          history: [
            { time: '11:05', label: 'Documento generado (simulado)' }
          ],
          documents: [{ name: 'modelo-303-borrador.pdf', type: 'Borrador' }],
          suggestions: {
            draft: '',
            documents: ['Modelo 303 (borrador)', 'Libro registro de IVA'],
            checklist: ['Verificar casillas de IVA', 'Comprobar prorrata si aplica', 'Confirmar resultado a ingresar/compensar'],
            risks: ['Plazo de presentación trimestral', 'Requiere revisión profesional antes de presentar']
          }
        },
        {
          channel: 'web', person: 'Nuevo contacto web', area: 'Captación',
          subject: 'Autónomo solicita información', urgency: 'baja',
          status: 'nuevo', time: '11:48', tags: [],
          snippet: 'Nuevo autónomo solicita información para darse de alta.',
          body: 'Formulario web (simulado): "Quiero darme de alta como autónomo el mes que viene y me gustaría saber precios de vuestra cuota mensual y qué incluye."',
          history: [
            { time: '11:48', label: 'Formulario web recibido (simulado)' }
          ],
          documents: [],
          suggestions: {
            draft: '¡Hola! Gracias por tu interés. Para el alta de autónomo te acompañamos en todo el proceso. ¿Te va bien una llamada de 15 minutos esta semana para contarte qué incluye nuestra cuota y resolver tus dudas?',
            documents: ['Tarifa de servicios para autónomos'],
            checklist: ['Responder en menos de 24 h', 'Ofrecer llamada de bienvenida'],
            risks: []
          }
        }
      ],
      pool: [
        { channel: 'whatsapp', person: 'Cliente nuevo', area: 'Fiscal', subject: 'Duda urgente con un pago a Hacienda', urgency: 'alta', tags: ['riesgo'], snippet: 'Me han avisado de que tengo un recibo de Hacienda que no me cuadra, ¿lo veis?' },
        { channel: 'email', person: 'Asesorados varios', area: 'Contable', subject: 'Nóminas del mes adjuntas', urgency: 'media', tags: [], snippet: 'Os paso las novedades de nóminas de este mes.' },
        { channel: 'call', person: 'Cliente habitual', area: 'Laboral', subject: 'Baja de un trabajador', urgency: 'media', tags: [], snippet: 'Llamada: pregunta cómo tramitar la baja voluntaria de un empleado.' },
        { channel: 'document', person: 'Cartera fiscal', area: 'Fiscal', subject: 'Modelo 130 pendiente', urgency: 'media', tags: ['revision'], snippet: 'Borrador del modelo 130 listo para revisión.' },
        { channel: 'web', person: 'Lead web', area: 'Captación', subject: 'Solicitud de presupuesto', urgency: 'baja', tags: [], snippet: 'Una pequeña SL pide presupuesto de contabilidad mensual.' }
      ]
    },

    /* 2. ABOGADOS ---------------------------------------------------- */
    {
      id: 'abogados',
      name: 'Despacho Abogados Demo Aribau',
      short: 'Abogados',
      sector: 'Despacho jurídico · civil, laboral y mercantil',
      initials: 'AA',
      accent: '#c9b58e',
      pain: 'Notificaciones con plazo perdidas entre consultas informales. Un día de retraso puede costar el caso.',
      statuses: STATUS_SETS.abogados,
      defaultStatus: 'nuevo',
      avgMinutesSaved: 14,
      seeds: [
        {
          channel: 'whatsapp', person: 'Cliente · L. M.', area: 'Procesal',
          subject: 'Demanda notificada, plazo corto', urgency: 'alta',
          status: 'urgente', time: '08:20', tags: ['plazo', 'confidencial', 'revision'],
          snippet: 'Me han notificado una demanda, creo que tengo pocos días.',
          body: 'Buenos días, esta mañana me han entregado una demanda. Creo que tengo pocos días para contestar y estoy preocupado. ¿Qué necesitáis de mí para empezar?',
          history: [
            { time: '08:20', label: 'Mensaje recibido (simulado)' },
            { time: '08:21', label: 'Atlas marca posible plazo procesal' }
          ],
          documents: [{ name: 'demanda-notificada.pdf', type: 'Documento sensible' }],
          suggestions: {
            draft: 'Buenos días. Lo prioritario es la fecha exacta de notificación: por favor, envíame una foto de la primera página y de la diligencia de notificación. Con eso calculamos el plazo y te confirmo hoy mismo los siguientes pasos. No firmes ni respondas nada por tu cuenta.',
            documents: ['Demanda completa', 'Diligencia de notificación', 'Documentación contractual relacionada'],
            checklist: ['Confirmar fecha de notificación', 'Calcular plazo de contestación', 'Valorar allanamiento / oposición'],
            risks: ['Plazo perentorio: prioridad máxima', 'Materia confidencial', 'Requiere revisión profesional']
          }
        },
        {
          channel: 'email', person: 'Inmobiliaria Costa SL', area: 'Civil',
          subject: 'Contrato de alquiler para revisar', urgency: 'media',
          status: 'revision', time: '09:15', tags: ['confidencial'],
          snippet: 'Adjunto contrato de alquiler para revisar.',
          body: 'Os adjuntamos un contrato de arrendamiento que vamos a firmar la semana que viene. ¿Podéis revisar las cláusulas de duración y fianza antes de la firma?',
          history: [
            { time: '09:15', label: 'Email recibido (simulado)' }
          ],
          documents: [{ name: 'contrato-alquiler.docx', type: 'Documento confidencial' }],
          suggestions: {
            draft: 'Recibido el contrato, lo revisamos. Antes del viernes os enviamos comentarios sobre duración, fianza y cláusulas de resolución. Si hay prisa para la firma, avisadnos y lo priorizamos.',
            documents: ['Contrato de arrendamiento', 'Cédula de habitabilidad'],
            checklist: ['Revisar duración y prórrogas', 'Comprobar fianza legal', 'Verificar cláusula de resolución'],
            risks: ['Documento confidencial entre partes']
          }
        },
        {
          channel: 'call', person: 'Cliente · R. S.', area: 'Laboral',
          subject: 'Consulta por despido', urgency: 'media',
          status: 'nuevo', time: '10:40', tags: ['sensible'],
          snippet: 'Cliente pregunta por un despido que le han comunicado.',
          body: 'Nota de llamada: le han comunicado un despido y quiere saber si es procedente, qué indemnización le corresponde y los plazos para reclamar.',
          history: [
            { time: '10:40', label: 'Llamada registrada (simulada)' }
          ],
          documents: [],
          suggestions: {
            draft: 'Hola, para valorar tu despido necesito ver la carta de despido y tus últimas nóminas. Con eso te confirmo si hay margen de reclamación y el plazo (recuerda que en despido suele ser corto). ¿Puedes enviarme la carta hoy?',
            documents: ['Carta de despido', 'Últimas 3 nóminas', 'Contrato de trabajo'],
            checklist: ['Revisar causa del despido', 'Calcular indemnización', 'Anotar plazo de 20 días hábiles'],
            risks: ['Plazo de caducidad de la acción', 'Dato laboral sensible']
          }
        },
        {
          channel: 'document', person: 'Juzgado (entrada)', area: 'Procesal',
          subject: 'Notificación judicial recibida', urgency: 'alta',
          status: 'plazo', time: '11:25', tags: ['plazo', 'revision'],
          snippet: 'Notificación judicial recibida pendiente de señalar plazo.',
          body: 'Entrada de notificación judicial (simulada). Pendiente de leer, identificar el procedimiento y señalar plazo en la agenda.',
          history: [
            { time: '11:25', label: 'Notificación recibida (simulada)' }
          ],
          documents: [{ name: 'notificacion-judicial.pdf', type: 'Documento procesal' }],
          suggestions: {
            draft: '',
            documents: ['Notificación judicial', 'Expediente del procedimiento'],
            checklist: ['Identificar tipo de resolución', 'Anotar plazo en agenda', 'Asignar a abogado responsable'],
            risks: ['Plazo procesal en curso', 'Requiere revisión profesional inmediata']
          }
        },
        {
          channel: 'web', person: 'Nuevo contacto web', area: 'Mercantil',
          subject: 'Consulta legal por impago', urgency: 'media',
          status: 'nuevo', time: '12:02', tags: [],
          snippet: 'Consulta legal por impago de un cliente.',
          body: 'Formulario web (simulado): "Un cliente me debe 6.000 € de varias facturas y no responde. ¿Qué puedo hacer para reclamar?"',
          history: [
            { time: '12:02', label: 'Formulario web recibido (simulado)' }
          ],
          documents: [],
          suggestions: {
            draft: 'Gracias por su consulta. Para reclamar el impago lo primero es reunir las facturas y cualquier comunicación con el deudor. Podemos empezar con un requerimiento y, si no responde, valorar la vía monitoria. ¿Le llamamos para concretar?',
            documents: ['Facturas impagadas', 'Comunicaciones con el deudor', 'Contrato o pedido'],
            checklist: ['Cuantificar la deuda', 'Valorar requerimiento previo', 'Estudiar proceso monitorio'],
            risks: ['Posible prescripción según antigüedad de la deuda']
          }
        }
      ],
      pool: [
        { channel: 'whatsapp', person: 'Cliente · J. T.', area: 'Procesal', subject: 'Me citan a juicio', urgency: 'alta', tags: ['plazo', 'confidencial'], snippet: 'Me ha llegado una citación para un juicio, ¿qué hago?' },
        { channel: 'email', person: 'Sociedad mercantil', area: 'Mercantil', subject: 'Revisión de estatutos', urgency: 'media', tags: ['confidencial'], snippet: 'Adjuntamos estatutos para una modificación societaria.' },
        { channel: 'call', person: 'Cliente · A. G.', area: 'Familia', subject: 'Consulta de divorcio', urgency: 'media', tags: ['sensible'], snippet: 'Llamada: consulta confidencial sobre proceso de divorcio.' },
        { channel: 'document', person: 'Juzgado (entrada)', area: 'Procesal', subject: 'Auto judicial recibido', urgency: 'alta', tags: ['plazo', 'revision'], snippet: 'Auto recibido pendiente de calcular plazo de recurso.' },
        { channel: 'web', person: 'Lead web', area: 'Civil', subject: 'Reclamación de cantidad', urgency: 'baja', tags: [], snippet: 'Consulta web sobre reclamar una fianza no devuelta.' }
      ]
    },

    /* 3. RESTAURANTE ------------------------------------------------- */
    {
      id: 'restaurante',
      name: 'Restaurante Demo La Marina',
      short: 'Restaurante',
      sector: 'Restauración · sala y reservas',
      initials: 'LM',
      accent: '#d8a25a',
      pain: 'Reservas y cambios entran por WhatsApp, teléfono y web a la vez. En plena hora punta, algo se pierde.',
      statuses: STATUS_SETS.restaurante,
      defaultStatus: 'nueva-reserva',
      avgMinutesSaved: 4,
      seeds: [
        {
          channel: 'whatsapp', person: 'Núria (cliente)', area: 'Sala',
          subject: 'Mesa para 8 esta noche', urgency: 'alta',
          status: 'confirmar', time: '18:40', tags: [],
          snippet: 'Mesa para 8 esta noche a las 21:30, ¿tenéis sitio?',
          body: 'Hola, ¿tendríais mesa para 8 personas esta noche a las 21:30? Es una cena de cumpleaños, si puede ser en una mesa tranquila mejor. ¡Gracias!',
          history: [
            { time: '18:40', label: 'WhatsApp recibido (simulado)' },
            { time: '18:41', label: 'Atlas detecta petición de reserva grande para hoy' }
          ],
          documents: [],
          suggestions: {
            draft: '¡Hola Núria! Para 8 a las 21:30 podemos ofreceros mesa en la sala interior. ¿Lo confirmo? Si es por un cumpleaños, decidme si traéis tarta y os la guardamos. ¡Gracias!',
            documents: [],
            checklist: ['Comprobar disponibilidad 21:30', 'Asignar mesa tranquila', 'Anotar cumpleaños'],
            risks: ['Reserva para hoy: confirmar pronto']
          }
        },
        {
          channel: 'email', person: 'Groupe Lefèvre', area: 'Eventos',
          subject: 'Menú para grupo de 14', urgency: 'media',
          status: 'nueva-reserva', time: '17:10', tags: [],
          snippet: 'Grupo francés pregunta menú para 14 personas.',
          body: 'Bonjour, somos un grupo de 14 personas y nos gustaría reservar para el próximo sábado. ¿Tenéis menú de grupo y alguna opción vegetariana? Merci!',
          history: [
            { time: '17:10', label: 'Email recibido (simulado)' }
          ],
          documents: [{ name: 'menu-grupos.pdf', type: 'Documento del local' }],
          suggestions: {
            draft: 'Bonjour! Gracias por escribirnos. Para 14 personas tenemos menú de grupo (os adjunto opciones) con alternativa vegetariana. Para el sábado os reservamos con un menú cerrado. ¿Me confirmáis el número final y alguna alergia?',
            documents: ['Menú de grupos', 'Carta de alérgenos'],
            checklist: ['Confirmar fecha y nº final', 'Preguntar por alergias', 'Cerrar menú de grupo'],
            risks: ['Grupo grande en sábado: confirmar disponibilidad de sala']
          }
        },
        {
          channel: 'call', person: 'Sr. Camps', area: 'Sala',
          subject: 'Cambio de hora de reserva', urgency: 'media',
          status: 'cambio', time: '19:05', tags: [],
          snippet: 'Cambio de reserva de 20:30 a 21:00.',
          body: 'Nota de llamada: el cliente con reserva a las 20:30 pide pasarla a las 21:00, mismo número de comensales (4).',
          history: [
            { time: '19:05', label: 'Llamada registrada (simulada)' }
          ],
          documents: [],
          suggestions: {
            draft: 'Hola Sr. Camps, su reserva queda actualizada a las 21:00 para 4 personas. ¡Le esperamos!',
            documents: [],
            checklist: ['Mover reserva a 21:00', 'Liberar la franja anterior'],
            risks: []
          }
        },
        {
          channel: 'web', person: 'Reserva online', area: 'Sala',
          subject: 'Reserva de terraza para el sábado', urgency: 'baja',
          status: 'nueva-reserva', time: '16:22', tags: [],
          snippet: 'Reserva terraza para sábado, 2 personas.',
          body: 'Reserva web (simulada): terraza, sábado 21:00, 2 personas. Comentario: "si es posible, mesa con vistas".',
          history: [
            { time: '16:22', label: 'Reserva web recibida (simulada)' }
          ],
          documents: [],
          suggestions: {
            draft: '¡Reserva recibida! Sábado 21:00, terraza para 2. Intentaremos daros una mesa con vistas. ¿Os confirmamos por aquí?',
            documents: [],
            checklist: ['Confirmar terraza sábado', 'Anotar preferencia de vistas'],
            risks: ['Terraza sujeta a meteorología']
          }
        },
        {
          channel: 'whatsapp', person: 'Familia Sàez', area: 'Sala',
          subject: 'Cancelación de mesa de 4', urgency: 'baja',
          status: 'cancelada', time: '15:48', tags: [],
          snippet: 'Cancelamos la mesa de 4.',
          body: 'Hola, al final no podemos ir esta noche, cancelamos la mesa de 4. ¡Perdón por el aviso y gracias!',
          history: [
            { time: '15:48', label: 'WhatsApp recibido (simulado)' },
            { time: '15:49', label: 'Atlas marca la mesa como liberada' }
          ],
          documents: [],
          suggestions: {
            draft: 'Sin problema, queda cancelada. ¡Gracias por avisar y os esperamos en otra ocasión!',
            documents: [],
            checklist: ['Liberar mesa de 4', 'Ofrecer la franja a lista de espera'],
            risks: []
          }
        }
      ],
      pool: [
        { channel: 'whatsapp', person: 'Cliente nuevo', area: 'Sala', subject: 'Mesa para 2 esta noche', urgency: 'alta', tags: [], snippet: '¿Tenéis mesa para 2 esta noche sobre las 21:00?' },
        { channel: 'web', person: 'Reserva online', area: 'Sala', subject: 'Reserva para 6 el domingo', urgency: 'media', tags: [], snippet: 'Reserva web: domingo 14:00, 6 personas, una trona.' },
        { channel: 'call', person: 'Cliente habitual', area: 'Sala', subject: 'Cambio de día de reserva', urgency: 'media', tags: [], snippet: 'Llamada: quiere pasar la reserva del viernes al sábado.' },
        { channel: 'email', person: 'Empresa local', area: 'Eventos', subject: 'Comida de empresa para 20', urgency: 'media', tags: [], snippet: 'Solicitan presupuesto de menú para comida de empresa.' },
        { channel: 'whatsapp', person: 'Cliente', area: 'Sala', subject: 'Pregunta por alérgenos', urgency: 'baja', tags: [], snippet: '¿El menú del día tiene opciones sin gluten?' }
      ]
    },

    /* 4. PELUQUERÍA -------------------------------------------------- */
    {
      id: 'peluqueria',
      name: 'Peluquería Demo Estudi Nou',
      short: 'Peluquería',
      sector: 'Peluquería · agenda de citas',
      initials: 'EN',
      accent: '#caa6c4',
      pain: 'Citas, cambios de hora y "llego tarde" entran por WhatsApp mientras se atiende. La agenda se descuadra.',
      statuses: STATUS_SETS.peluqueria,
      defaultStatus: 'nueva-cita',
      avgMinutesSaved: 3,
      seeds: [
        {
          channel: 'whatsapp', person: 'Laia', area: 'Agenda',
          subject: 'Cita para tinte y puntas', urgency: 'media',
          status: 'confirmar', time: '10:05', tags: [],
          snippet: 'Quiero cita para tinte y cortar puntas.',
          body: 'Hola! Quería pedir cita para tinte y cortar las puntas. Esta semana por la tarde me iría genial. ¿Qué huecos tenéis?',
          history: [
            { time: '10:05', label: 'WhatsApp recibido (simulado)' },
            { time: '10:06', label: 'Atlas detecta dos servicios: tinte + corte' }
          ],
          documents: [],
          suggestions: {
            draft: '¡Hola Laia! Para tinte + puntas necesitamos algo más de tiempo. Esta semana tengo jueves a las 17:00 o viernes a las 18:30. ¿Cuál te va mejor?',
            documents: [],
            checklist: ['Reservar tiempo doble (tinte+corte)', 'Confirmar día y hora'],
            risks: []
          }
        },
        {
          channel: 'call', person: 'Carme', area: 'Agenda',
          subject: 'Cambio de hora de cita', urgency: 'media',
          status: 'cambio', time: '11:20', tags: [],
          snippet: 'Cliente cambia su hora de cita.',
          body: 'Nota de llamada: la clienta con cita el jueves a las 17:00 pide pasarla a las 18:00 del mismo día.',
          history: [
            { time: '11:20', label: 'Llamada registrada (simulada)' }
          ],
          documents: [],
          suggestions: {
            draft: 'Hola Carme, te cambio la cita del jueves a las 18:00. ¡Nos vemos!',
            documents: [],
            checklist: ['Mover cita a las 18:00', 'Liberar las 17:00'],
            risks: []
          }
        },
        {
          channel: 'web', person: 'Reserva online', area: 'Agenda',
          subject: 'Cita para peinado de boda', urgency: 'media',
          status: 'nueva-cita', time: '12:10', tags: [],
          snippet: 'Nueva cita para peinado de boda.',
          body: 'Reserva web (simulada): peinado para boda, sábado por la mañana. Comentario: "es para un evento, necesito que dure todo el día".',
          history: [
            { time: '12:10', label: 'Reserva web recibida (simulada)' }
          ],
          documents: [],
          suggestions: {
            draft: '¡Enhorabuena por la boda! Para un peinado de evento te recomiendo cita temprano el sábado. ¿Te reservo a las 9:30? Si quieres, hacemos una prueba antes del día.',
            documents: [],
            checklist: ['Reservar franja amplia', 'Ofrecer prueba previa'],
            risks: ['Servicio para evento: confirmar con margen']
          }
        },
        {
          channel: 'email', person: 'Cliente nueva', area: 'Información',
          subject: 'Precio de mechas', urgency: 'baja',
          status: 'respondido', time: '09:35', tags: [],
          snippet: 'Pregunta precio de mechas.',
          body: 'Buenos días, me gustaría saber el precio de las mechas y cuánto suele durar la sesión. Gracias.',
          history: [
            { time: '09:35', label: 'Email recibido (simulado)' },
            { time: '09:50', label: 'Respuesta enviada (simulada)' }
          ],
          documents: [{ name: 'tarifa-servicios.pdf', type: 'Documento del salón' }],
          suggestions: {
            draft: '¡Hola! El precio de las mechas depende del largo, pero parte desde X €. La sesión suele durar unas 2 horas. Si quieres te doy cita para valorarlo en persona sin compromiso.',
            documents: ['Tarifa de servicios'],
            checklist: ['Enviar tarifa', 'Ofrecer cita de valoración'],
            risks: []
          }
        },
        {
          channel: 'whatsapp', person: 'Pol', area: 'Agenda',
          subject: 'Aviso: llego 15 minutos tarde', urgency: 'alta',
          status: 'confirmar', time: '16:50', tags: [],
          snippet: 'Llego 15 minutos tarde.',
          body: 'Hola, voy de camino pero llego unos 15 minutos tarde a mi cita de las 17:00, ¿no pasa nada?',
          history: [
            { time: '16:50', label: 'WhatsApp recibido (simulado)' },
            { time: '16:50', label: 'Atlas avisa: cita inminente afectada' }
          ],
          documents: [],
          suggestions: {
            draft: 'Sin problema, Pol, te esperamos. Intenta no tardar más para no solaparte con la siguiente cita. ¡Nos vemos!',
            documents: [],
            checklist: ['Avisar a la profesional', 'Revisar solape con cita siguiente'],
            risks: ['Posible retraso en cadena de citas']
          }
        }
      ],
      pool: [
        { channel: 'whatsapp', person: 'Clienta nueva', area: 'Agenda', subject: 'Cita para corte hoy', urgency: 'alta', tags: [], snippet: '¿Tenéis hueco para cortar hoy por la tarde?' },
        { channel: 'web', person: 'Reserva online', area: 'Agenda', subject: 'Cita para coloración', urgency: 'media', tags: [], snippet: 'Reserva web: coloración completa, miércoles tarde.' },
        { channel: 'call', person: 'Cliente habitual', area: 'Agenda', subject: 'Anular cita', urgency: 'media', tags: [], snippet: 'Llamada: necesita anular la cita de mañana.' },
        { channel: 'whatsapp', person: 'Cliente', area: 'Agenda', subject: 'Cambio de hora', urgency: 'media', tags: [], snippet: '¿Puedo adelantar mi cita una hora?' },
        { channel: 'email', person: 'Cliente nueva', area: 'Información', subject: 'Precio de alisado', urgency: 'baja', tags: [], snippet: 'Pregunta por el precio y duración del alisado.' }
      ]
    },

    /* 5. CENTRO DE ESTÉTICA ------------------------------------------ */
    {
      id: 'estetica',
      name: 'Centro Estética Demo Aura',
      short: 'Estética',
      sector: 'Centro de estética · tratamientos y bonos',
      initials: 'AU',
      accent: '#9fc7c2',
      pain: 'Consultas de tratamientos, bonos y cancelaciones se mezclan. Algunas requieren cuidado especial (salud).',
      statuses: STATUS_SETS.estetica,
      defaultStatus: 'nueva-consulta',
      avgMinutesSaved: 4,
      seeds: [
        {
          channel: 'whatsapp', person: 'Sara', area: 'Tratamientos',
          subject: 'Información sobre láser', urgency: 'media',
          status: 'confirmar', time: '10:30', tags: [],
          snippet: 'Quiero información sobre láser.',
          body: 'Hola! Me gustaría información sobre la depilación láser: precios, cuántas sesiones suelen hacer falta y si va por zonas. Gracias.',
          history: [
            { time: '10:30', label: 'WhatsApp recibido (simulado)' }
          ],
          documents: [{ name: 'tarifa-laser.pdf', type: 'Documento del centro' }],
          suggestions: {
            draft: '¡Hola Sara! El láser va por zonas y el número de sesiones depende de cada piel y pelo. Lo ideal es una primera visita gratuita para valorarlo y darte un plan con precios. ¿Te reservo una valoración esta semana?',
            documents: ['Tarifa de láser por zonas'],
            checklist: ['Enviar info de zonas y precios', 'Ofrecer valoración gratuita'],
            risks: []
          }
        },
        {
          channel: 'web', person: 'Reserva online', area: 'Tratamientos',
          subject: 'Reserva de tratamiento facial', urgency: 'media',
          status: 'nueva-consulta', time: '11:15', tags: [],
          snippet: 'Reserva tratamiento facial.',
          body: 'Reserva web (simulada): tratamiento facial hidratante, jueves por la tarde. Primera vez en el centro.',
          history: [
            { time: '11:15', label: 'Reserva web recibida (simulada)' }
          ],
          documents: [],
          suggestions: {
            draft: '¡Bienvenida! Te confirmo el facial hidratante para el jueves por la tarde. Como es tu primera visita, llegaremos 5 min antes para una breve consulta de tu tipo de piel. ¿Te va bien a las 17:00?',
            documents: ['Ficha de cliente nueva'],
            checklist: ['Confirmar día y hora', 'Preparar ficha de primera visita'],
            risks: []
          }
        },
        {
          channel: 'call', person: 'Montse', area: 'Agenda',
          subject: 'Cancelación de cita', urgency: 'media',
          status: 'cancelada', time: '09:50', tags: [],
          snippet: 'Cancelación de cita de hoy.',
          body: 'Nota de llamada: la clienta cancela su cita de tratamiento corporal de hoy a las 18:00. Preguntar si quiere reprogramar.',
          history: [
            { time: '09:50', label: 'Llamada registrada (simulada)' }
          ],
          documents: [],
          suggestions: {
            draft: 'Hola Montse, queda cancelada tu cita de hoy. ¿Quieres que te la reprograme para la próxima semana? Tengo martes o jueves por la tarde.',
            documents: [],
            checklist: ['Liberar franja de las 18:00', 'Ofrecer reprogramar'],
            risks: []
          }
        },
        {
          channel: 'email', person: 'Cliente', area: 'Información',
          subject: 'Consulta sobre bono regalo', urgency: 'baja',
          status: 'respondido', time: '12:40', tags: [],
          snippet: 'Consulta sobre bono regalo.',
          body: 'Buenas, quería regalar un bono para mi madre. ¿Qué importes tenéis y cómo se compra? ¿Caduca?',
          history: [
            { time: '12:40', label: 'Email recibido (simulado)' },
            { time: '12:55', label: 'Respuesta enviada (simulada)' }
          ],
          documents: [{ name: 'bonos-regalo.pdf', type: 'Documento del centro' }],
          suggestions: {
            draft: '¡Qué buena idea! Tenemos bonos regalo desde X €, personalizables por tratamiento o importe. Se pueden comprar en el centro o te lo enviamos en digital. La validez es de 12 meses. ¿Te preparo uno?',
            documents: ['Catálogo de bonos regalo'],
            checklist: ['Enviar importes de bonos', 'Ofrecer compra digital'],
            risks: []
          }
        },
        {
          channel: 'whatsapp', person: 'Aina', area: 'Tratamientos',
          subject: 'Tratamiento durante el embarazo', urgency: 'alta',
          status: 'seguimiento', time: '13:10', tags: ['sensible', 'revision'],
          snippet: '¿Puedo hacerme tratamiento si estoy embarazada?',
          body: 'Hola, estoy embarazada de 5 meses y me gustaría saber si puedo hacerme un tratamiento corporal o si está contraindicado. No quiero arriesgar nada.',
          history: [
            { time: '13:10', label: 'WhatsApp recibido (simulado)' },
            { time: '13:11', label: 'Atlas marca consulta de salud: requiere criterio profesional' }
          ],
          documents: [],
          suggestions: {
            draft: '¡Felicidades, Aina! Durante el embarazo algunos tratamientos no están recomendados y otros sí se pueden adaptar. Prefiero que lo valore nuestra profesional antes de reservar nada. ¿Te llamamos para ver opciones seguras para ti?',
            documents: ['Protocolo de contraindicaciones'],
            checklist: ['Derivar a profesional', 'Revisar tratamientos contraindicados', 'No confirmar sin valoración'],
            risks: ['Consulta relacionada con la salud: requiere criterio profesional', 'No automatizar la respuesta']
          }
        }
      ],
      pool: [
        { channel: 'whatsapp', person: 'Clienta nueva', area: 'Tratamientos', subject: 'Info sobre presoterapia', urgency: 'media', tags: [], snippet: 'Quería saber precios de presoterapia y bonos.' },
        { channel: 'web', person: 'Reserva online', area: 'Tratamientos', subject: 'Reserva de masaje', urgency: 'media', tags: [], snippet: 'Reserva web: masaje relajante, viernes tarde.' },
        { channel: 'call', person: 'Cliente habitual', area: 'Agenda', subject: 'Cambiar cita de tratamiento', urgency: 'media', tags: [], snippet: 'Llamada: quiere mover su cita de tratamiento facial.' },
        { channel: 'whatsapp', person: 'Clienta', area: 'Tratamientos', subject: 'Consulta de piel sensible', urgency: 'alta', tags: ['sensible', 'revision'], snippet: 'Tengo la piel muy reactiva, ¿qué tratamiento me recomendáis?' },
        { channel: 'email', person: 'Cliente', area: 'Información', subject: 'Renovar bono', urgency: 'baja', tags: [], snippet: 'Pregunta cómo renovar su bono de tratamientos.' }
      ]
    }
  ];

  window.ATLAS_SANDBOX = {
    version: 1,
    channels: CHANNELS,
    tags: TAGS,
    businesses: BUSINESSES
  };
})();
