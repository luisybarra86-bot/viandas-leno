// ══════════════════════════════════════════════════════════════════
//  Viandas Leno — Creador y Actualizador de Formulario Semanal
//
//  INSTRUCCIONES (primera vez):
//  1. Ir a script.google.com → Nuevo proyecto
//  2. Pegar TODO este código (reemplazando lo que hay)
//  3. Ejecutar crearFormularioSemanal() para crear el form
//  4. Guardar el ID del form en FORM_ID (abajo)
//  5. Ejecutar crearTriggerActualizacion() UNA SOLA VEZ
//     → A partir de ahí, cada vez que publiques desde el sistema web
//       el form se actualiza solo en minutos
// ══════════════════════════════════════════════════════════════════

// ── ID del formulario fijo (no cambia semana a semana) ────────────
var FORM_ID          = '10bqkR5-hQDOCRX3Z5xyVc67hnAl6sW-1cvJOexV5n7Q';
var FIREBASE_PROJECT = 'vianda-leno';
var API_KEY          = 'AIzaSyDLH1Lye1MqA35SVE1y26kEo5IqHbx0vwM';

// ── SUCURSALES (no cambia) ─────────────────────────────────────────
var SUCURSALES = [
  'Aconquija',
  'Barrio Norte',
  'Tafi Viejo',
  'Administración',
  'Centro de Producción (CDP)',
  'Pizzería',
];

// ── OPCIONES DE ENTREGA (no cambia) ───────────────────────────────
var ENTREGAS = [
  'Enviar a Sucursal Aconquija',
  'Enviar a Sucursal Barrio Norte',
  'Enviar a Sucursal Tafi Viejo',
  'Enviar a Administración',
  'Enviar a Centro de Producción',
  'Enviar a Pizzería',
];

// ── DÍAS DE LA SEMANA ─────────────────────────────────────────────
var DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ── MESES EN ESPAÑOL ──────────────────────────────────────────────
var MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
];

// ══════════════════════════════════════════════════════════════════
//  FUNCIÓN PRINCIPAL — ejecutar esta
// ══════════════════════════════════════════════════════════════════
function crearFormularioSemanal() {

  // ── Calcular fechas de la próxima semana ──────────────────────
  var hoy      = new Date();
  var dw       = hoy.getDay();                     // 0=Dom … 6=Sab
  var diasHasta = (dw === 0) ? 1 : (8 - dw);      // días hasta el lunes próximo
  var lunes    = new Date(hoy);
  lunes.setDate(hoy.getDate() + diasHasta);
  lunes.setHours(0,0,0,0);

  var domingo  = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  var mesNombre = capitalizar(MESES[domingo.getMonth()]);

  // ── Título del formulario ──────────────────────────────────────
  var titulo = 'Viandas Leno — Semana del ' +
    lunes.getDate() + ' al ' + domingo.getDate() + ' de ' + mesNombre;

  // ── Crear el formulario ────────────────────────────────────────
  var form = FormApp.create(titulo);
  form.setDescription(
    'Elegí tu vianda para cada día de la semana (Lunes a Domingo).\n' +
    'Para cada día: marcá el plato que querés Y la sucursal a donde te lo enviamos.\n' +
    'Si un día no querés vianda, dejá ese día sin marcar.'
  );
  form.setAllowResponseEdits(true);   // el empleado puede editar su respuesta
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);

  // ── Pregunta 1: Nombre ─────────────────────────────────────────
  form.addTextItem()
    .setTitle('Nombre y Apellido completo ')   // espacio al final: requerido por el sync script
    .setHelpText('Escribí tu nombre completo exactamente como figura en el sistema.')
    .setRequired(true);

  // ── Pregunta 2: Sucursal ───────────────────────────────────────
  form.addListItem()
    .setTitle('Sucursal')
    .setHelpText('Elegí tu sucursal.')
    .setRequired(true)
    .setChoiceValues(SUCURSALES);

  // ── Una pregunta por cada día laborable ───────────────────────
  DIAS.forEach(function(dia, idx) {
    var fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + idx);

    // Título con formato que el Apps Script puede parsear: "Lunes 25 de Mayo"
    var tituloDia = dia + ' ' + fecha.getDate() + ' de ' + capitalizar(MESES[fecha.getMonth()]);

    // Opciones: primero los menús del día (placeholders), luego las entregas
    var opciones = [
      '⟶ EDITÁ ESTE TEXTO con el menú principal del ' + dia,
      '⟶ EDITÁ ESTE TEXTO con la opción vegetariana del ' + dia,
    ].concat(ENTREGAS);

    form.addCheckboxItem()
      .setTitle(tituloDia)
      .setHelpText('Marcá el plato y también la sucursal donde lo recibís.')
      .setRequired(false)
      .setChoiceValues(opciones);
  });

  // ── Vincular a una hoja de cálculo nueva ──────────────────────
  var hoja = SpreadsheetApp.create('Respuestas — ' + titulo);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());

  // ── Mostrar resultados en el Log ──────────────────────────────
  var msg = [
    '══════════════════════════════════════',
    '✅  FORMULARIO CREADO CORRECTAMENTE',
    '══════════════════════════════════════',
    '',
    '📋 Título: ' + titulo,
    '',
    '✏️  Link para EDITAR el formulario (tuyo):',
    form.getEditUrl(),
    '',
    '📨 Link para COMPARTIR con empleados:',
    form.getPublishedUrl(),
    '',
    '📊 Hoja de respuestas:',
    hoja.getUrl(),
    '',
    '══════════════════════════════════════',
    'PRÓXIMOS PASOS:',
    '1. Abrí el link de EDICIÓN',
    '2. Para cada día (Lunes a Viernes):',
    '   - Hacé clic en la opción "⟶ EDITÁ ESTE TEXTO..."',
    '   - Cambiá el texto por el menú real de ese día',
    '   - Si no hay opción vegetariana algún día, borrá esa opción',
    '3. Guardá y compartí el link de empleados',
    '4. En la hoja de respuestas → Extensiones → Apps Script',
    '   → Pegá el código del archivo apps-script-formulario.gs',
    '   → Ejecutá crearTrigger()',
    '   → Ejecutá sincronizarTodo() cuando haya respuestas',
    '══════════════════════════════════════',
  ].join('\n');

  Logger.log(msg);

  // También lo intenta mostrar como alerta si hay UI disponible
  try {
    SpreadsheetApp.getUi().alert('Viandas Leno', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch(e) {
    // Sin UI (script standalone) — ver en Registros (Ver → Registros)
  }
}

// ── Helper: capitaliza primera letra ──────────────────────────────
function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ══════════════════════════════════════════════════════════════════
//  ACTUALIZACIÓN AUTOMÁTICA DEL FORMULARIO DESDE FIRESTORE
//  El sistema web guarda en la colección "publicaciones" cuando Luis
//  hace clic en "Publicar". Este trigger lo detecta y actualiza el form.
// ══════════════════════════════════════════════════════════════════

// Ejecutar UNA SOLA VEZ para activar el trigger automático
function crearTriggerActualizacion() {
  ScriptApp.getProjectTriggers()
    .filter(function(t) { return t.getHandlerFunction() === 'verificarPublicacion'; })
    .forEach(function(t) { ScriptApp.deleteTrigger(t); });

  ScriptApp.newTrigger('verificarPublicacion')
    .timeBased()
    .everyMinutes(10)
    .create();

  Logger.log('✅ Trigger creado. El form se actualizará automáticamente cada vez que publiques desde el sistema.');
}

// Se ejecuta automáticamente cada 10 minutos
function verificarPublicacion() {
  var url = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT +
            '/databases/(default)/documents/publicaciones?key=' + API_KEY + '&pageSize=20';
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return;

  var data = JSON.parse(res.getContentText());
  if (!data.documents) return;

  var pendientes = data.documents.filter(function(d) {
    return d.fields && d.fields.pendiente && d.fields.pendiente.booleanValue === true;
  });
  if (!pendientes.length) return;

  // Procesar el más reciente
  pendientes.sort(function(a, b) {
    var ta = a.fields.creadoEn && a.fields.creadoEn.stringValue || '';
    var tb = b.fields.creadoEn && b.fields.creadoEn.stringValue || '';
    return tb.localeCompare(ta);
  });

  var pub = pendientes[0];
  var inicio = pub.fields.semanaInicio && pub.fields.semanaInicio.stringValue;
  var diasRaw = pub.fields.dias && pub.fields.dias.arrayValue && pub.fields.dias.arrayValue.values || [];

  if (!inicio) return;

  // Parsear días
  var dias = diasRaw.map(function(d) {
    if (!d || d.nullValue !== undefined) return { n: '', v: '' };
    if (d.stringValue !== undefined) return { n: d.stringValue, v: '' };
    if (d.mapValue && d.mapValue.fields) {
      var f = d.mapValue.fields;
      return { n: (f.n && f.n.stringValue) || '', v: (f.v && f.v.stringValue) || '' };
    }
    return { n: '', v: '' };
  });

  actualizarForm(inicio, dias);

  // Marcar como procesado
  var docId = pub.name.split('/').pop();
  var patchUrl = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT +
                 '/databases/(default)/documents/publicaciones/' + docId +
                 '?updateMask.fieldPaths=pendiente&updateMask.fieldPaths=procesadoEn&key=' + API_KEY;
  UrlFetchApp.fetch(patchUrl, {
    method: 'PATCH',
    contentType: 'application/json',
    payload: JSON.stringify({ fields: {
      pendiente:   { booleanValue: false },
      procesadoEn: { stringValue: new Date().toISOString() }
    }}),
    muteHttpExceptions: true
  });
}

// Actualiza las preguntas del formulario con los menús de la semana
function actualizarForm(inicio, dias) {
  var form  = FormApp.openById(FORM_ID);
  var lunes = new Date(inicio + 'T00:00:00');

  // Obtener preguntas tipo checkbox con fecha en el título
  var items = form.getItems(FormApp.ItemType.CHECKBOX).filter(function(item) {
    return /\d+\s+de\s+\w+/i.test(item.getTitle());
  });
  items.sort(function(a, b) { return a.getIndex() - b.getIndex(); });

  var actualizados = 0;
  items.forEach(function(item, idx) {
    if (idx >= 7) return;
    var fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + idx);

    var titulo = DIAS[idx] + ' ' + fecha.getDate() + ' de ' + capitalizar(MESES[fecha.getMonth()]);

    var menuDia = dias[idx] || { n: '', v: '' };
    var opciones = [];
    if (menuDia.n) opciones.push('🍽 ' + menuDia.n);
    if (menuDia.v) opciones.push('🥗 ' + menuDia.v);
    opciones = opciones.concat(ENTREGAS);

    item.setTitle(titulo);
    item.asCheckboxItem().setChoiceValues(opciones);
    actualizados++;
  });

  Logger.log('✅ Formulario actualizado para semana ' + inicio + ' — ' + actualizados + ' días.');
}

// Permite ejecutar manualmente desde el menú de la planilla
function actualizarFormManual() {
  var ui = SpreadsheetApp.getUi ? SpreadsheetApp.getUi() : null;
  try {
    verificarPublicacion();
    if (ui) ui.alert('✅ Formulario actualizado correctamente.');
  } catch(e) {
    Logger.log('Error: ' + e.message);
    if (ui) ui.alert('❌ Error: ' + e.message);
  }
}
