// ══════════════════════════════════════════════════════════════════
//  Viandas Leno — Sincronizador Google Forms → Firestore
//  Estructura: una fila por empleado por semana
//  Columnas: Marca temporal | Nombre | Lunes X de Mes | Martes... | ...
//
//  SETUP (una sola vez):
//  1. Pegá este código en Apps Script de la hoja de respuestas
//  2. Ejecutá detectarColumnas() para verificar
//  3. Ajustá CAMPO_NOMBRE si el título es distinto
//  4. Ejecutá crearTrigger() una sola vez
//  5. Ejecutá sincronizarTodo() para cargar el historial
// ══════════════════════════════════════════════════════════════════

var FIREBASE_PROJECT = 'vianda-leno';
var API_KEY          = 'AIzaSyDLH1Lye1MqA35SVE1y26kEo5IqHbx0vwM';
var FIRESTORE_BASE   = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT + '/databases/(default)/documents/eleccionesForm';

// Título exacto de la columna de nombre (copiar del diagnóstico)
var CAMPO_NOMBRE = 'Nombre y Apellido completo ';

// Email al que llegan alertas de error
var ADMIN_EMAIL = 'luisybarra86@gmail.com';

// Título exacto de la columna sucursal en el formulario.
// Si el form NO tiene esa columna, dejá el valor vacío: var CAMPO_SUCURSAL = '';
var CAMPO_SUCURSAL = 'Sucursal';

// ── Mapeo de meses en español ──────────────────────────────────
var MESES = {
  'enero':1,'febrero':2,'marzo':3,'abril':4,'mayo':5,'junio':6,
  'julio':7,'agosto':8,'septiembre':9,'octubre':10,'noviembre':11,'diciembre':12
};

// ══════════════════════════════════════════════════════════════════
//  MAPEO DINÁMICO DE EMPLEADOS DESDE FIRESTORE
//  Lee la colección "empleados" y construye un mapa nombre→sucursal
//  Se cachea en memoria durante la ejecución del script.
// ══════════════════════════════════════════════════════════════════
var _empMapCache = null;

function getEmpMap() {
  if (_empMapCache !== null) return _empMapCache;

  var url = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT +
            '/databases/(default)/documents/empleados?key=' + API_KEY + '&pageSize=300';
  try {
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      console.error('getEmpMap HTTP ' + res.getResponseCode());
      _empMapCache = {};
      return _empMapCache;
    }
    var data = JSON.parse(res.getContentText());
    var map = {};
    if (data.documents) {
      data.documents.forEach(function(d) {
        if (!d.fields) return;
        var nombre   = d.fields.nombre   && d.fields.nombre.stringValue;
        var sucursal = d.fields.sucursal && d.fields.sucursal.stringValue;
        var activo   = d.fields.activo   ? d.fields.activo.booleanValue !== false : true;
        if (nombre && sucursal && activo) {
          map[normalizarNombre(nombre)] = sucursal;
        }
      });
    }
    _empMapCache = map;
    console.log('getEmpMap: ' + Object.keys(map).length + ' empleados cargados');
  } catch(e) {
    console.error('getEmpMap error: ' + e.message);
    _empMapCache = {};
  }
  return _empMapCache;
}

// Normaliza un nombre para comparación: minúsculas y sin tildes
function normalizarNombre(s) {
  return String(s).toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/\s+/g, ' ').trim();
}

// Busca la sucursal de un empleado en el mapa (case-insensitive)
function buscarSucursal(nombre) {
  var mapa = getEmpMap();
  var clave = normalizarNombre(nombre);
  if (mapa[clave]) return mapa[clave];
  // Búsqueda parcial: si el nombre del form está contenido en alguna clave del mapa
  var claves = Object.keys(mapa);
  for (var i = 0; i < claves.length; i++) {
    if (claves[i].indexOf(clave) !== -1 || clave.indexOf(claves[i]) !== -1) {
      return mapa[claves[i]];
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
//  DIAGNÓSTICO
// ══════════════════════════════════════════════════════════════════

function detectarColumnas() {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var sheet   = ss.getSheets()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var total   = sheet.getLastRow() - 1;

  var msg = 'Encabezados encontrados:\n\n';
  headers.forEach(function(h, i) {
    var tipo = esDiaHeader(h) ? ' ← DÍA' : '';
    if (h.trim() === CAMPO_NOMBRE.trim()) tipo = ' ← NOMBRE ✅';
    msg += (i + 1) + '. "' + h + '"' + tipo + '\n';
  });
  msg += '\n─────────────────────────────\n';
  msg += 'Total de respuestas: ' + total;

  SpreadsheetApp.getUi().alert('Viandas Leno — Diagnóstico', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ══════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════

// Detecta si un encabezado es una columna de día ("Lunes 4 de Mayo", etc.)
function esDiaHeader(h) {
  return /\d+\s+de\s+\w+/i.test(String(h).trim());
}

// Parsea "Lunes 4 de Mayo " + año → "2026-05-04"
function parsearFecha(header, anio) {
  var h        = String(header).trim();
  var diaMatch = h.match(/(\d+)\s+de/i);
  var mesMatch = h.match(/de\s+([a-záéíóúñ]+)/i);
  if (!diaMatch || !mesMatch) return null;
  var dia = parseInt(diaMatch[1]);
  var mes = MESES[mesMatch[1].toLowerCase().trim()];
  if (!dia || !mes) return null;
  return anio + '-' + String(mes).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
}

function getAnio(ts) {
  if (ts instanceof Date && !isNaN(ts)) return ts.getFullYear();
  var s = String(ts);
  // DD/MM/YYYY HH:MM:SS  →  buscar el año en la tercera posición
  var m = s.match(/\/(\d{4})(?:\s|$|T)/);
  if (m) return parseInt(m[1]);
  // YYYY-MM-DD o YYYY/MM/DD al inicio
  m = s.match(/^(\d{4})[\/\-]/);
  if (m) return parseInt(m[1]);
  // Fallback: año actual
  return new Date().getFullYear();
}

function slugDoc(nombre) {
  return nombre.trim()
    .replace(/\s+/g, '_')
    .replace(/[áàä]/gi, 'a').replace(/[éèë]/gi, 'e')
    .replace(/[íìï]/gi, 'i').replace(/[óòö]/gi, 'o')
    .replace(/[úùü]/gi, 'u').replace(/ñ/gi, 'n')
    .replace(/[^a-zA-Z0-9_()\-]/g, '');
}

// ══════════════════════════════════════════════════════════════════
//  FIRESTORE REST
// ══════════════════════════════════════════════════════════════════

function fsGet(docId) {
  var url = FIRESTORE_BASE + '/' + encodeURIComponent(docId) + '?key=' + API_KEY;
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() === 404) return null;
  return JSON.parse(res.getContentText());
}

function fsPatch(docId, fields) {
  var url = FIRESTORE_BASE + '/' + encodeURIComponent(docId) + '?key=' + API_KEY;
  var res = UrlFetchApp.fetch(url, {
    method:             'PATCH',
    contentType:        'application/json',
    payload:            JSON.stringify({ fields: fields }),
    muteHttpExceptions: true,
  });
  return { code: res.getResponseCode(), body: res.getContentText() };
}

function parseElecciones(fsDoc) {
  if (!fsDoc || !fsDoc.fields) return {};
  var elecMap = fsDoc.fields.elecciones
    && fsDoc.fields.elecciones.mapValue
    && fsDoc.fields.elecciones.mapValue.fields;
  if (!elecMap) return {};
  var result = {};
  Object.keys(elecMap).forEach(function(fecha) {
    var v = elecMap[fecha];
    if (v.mapValue && v.mapValue.fields) {
      result[fecha] = {
        menu:     (v.mapValue.fields.menu     && v.mapValue.fields.menu.stringValue)     || '',
        sucursal: (v.mapValue.fields.sucursal && v.mapValue.fields.sucursal.stringValue) || '',
      };
    }
  });
  return result;
}

function buildFsFields(nombre, elecciones) {
  var elecFields = {};
  Object.keys(elecciones).forEach(function(fecha) {
    var e = elecciones[fecha];
    elecFields[fecha] = {
      mapValue: { fields: {
        menu:     { stringValue: e.menu },
        sucursal: { stringValue: e.sucursal },
      }}
    };
  });
  return {
    nombre:     { stringValue: nombre },
    elecciones: { mapValue: { fields: elecFields } },
  };
}

// ══════════════════════════════════════════════════════════════════
//  GUARDAR UNA FILA (empleado + semana completa)
// ══════════════════════════════════════════════════════════════════

// headers: array de encabezados | row: array de valores | anio: número
// Devuelve cantidad de fechas guardadas
function guardarFila(headers, row, anio) {
  var nombre = String(row[headers.indexOf(CAMPO_NOMBRE)] || '').trim();

  // Buscar ignorando espacios extra al comparar
  if (!nombre) {
    var idxN = -1;
    headers.forEach(function(h, i) {
      if (h.trim() === CAMPO_NOMBRE.trim()) idxN = i;
    });
    if (idxN !== -1) nombre = String(row[idxN] || '').trim();
  }

  if (!nombre) return 0;

  // Intentar leer sucursal desde columna del formulario (si CAMPO_SUCURSAL está configurado)
  var sucursal = '';
  if (CAMPO_SUCURSAL.trim()) {
    var idxSuc = -1;
    headers.forEach(function(h, i) {
      if (String(h).trim().toLowerCase() === CAMPO_SUCURSAL.trim().toLowerCase()) idxSuc = i;
    });
    if (idxSuc !== -1) {
      var rawSuc = String(row[idxSuc] || '').trim().toLowerCase();
      var NOMBRES_A_ID = {
        'aconquija':'acq', 'barrio norte':'bn', 'tafi viejo':'tv',
        'administración':'adm', 'administracion':'adm',
        'pizzería':'piz', 'pizzeria':'piz', 'cdp':'cdp'
      };
      sucursal = NOMBRES_A_ID[rawSuc] || rawSuc;
    }
  }
  // Fallback: mapeo dinámico desde Firestore (case-insensitive)
  if (!sucursal) sucursal = buscarSucursal(nombre) || 'desconocida';
  var docId    = slugDoc(nombre);

  // Leer elecciones existentes para no pisar otros días
  var existing   = fsGet(docId);
  var elecciones = parseElecciones(existing);
  var nuevosDias = 0;

  headers.forEach(function(h, i) {
    if (!esDiaHeader(h)) return;
    var menu = String(row[i] || '').trim();
    if (!menu) return; // sin elección para ese día
    var fecha = parsearFecha(h, anio);
    if (!fecha) return;
    elecciones[fecha] = { menu: menu, sucursal: sucursal };
    nuevosDias++;
  });

  if (nuevosDias === 0) return 0;

  fsPatch(docId, buildFsFields(nombre, elecciones));
  return nuevosDias;
}

// ══════════════════════════════════════════════════════════════════
//  TRIGGER: se dispara al enviar el formulario
// ══════════════════════════════════════════════════════════════════

function onFormSubmit(e) {
  try {
    var values    = e.values;
    var sheet     = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var totalCols = sheet.getLastColumn();
    var headers   = sheet.getRange(1, 1, 1, totalCols).getValues()[0];

    while (values.length < totalCols) values.push('');

    var ts   = values[0];
    var anio = getAnio(ts);

    // Detectar nombre del empleado
    var idxN = -1;
    headers.forEach(function(h, i) { if (h.trim() === CAMPO_NOMBRE.trim()) idxN = i; });
    var nombre = idxN !== -1 ? String(values[idxN] || '').trim() : String(values[1] || '').trim();

    console.log('onFormSubmit — timestamp: "' + ts + '" → año: ' + anio + ' — nombre: "' + nombre + '"');

    if (!nombre) {
      console.warn('onFormSubmit: no se encontró el nombre del empleado. Verificar CAMPO_NOMBRE.');
      return;
    }

    var n = guardarFila(headers, values, anio);
    console.log('onFormSubmit: ' + n + ' días guardados para "' + nombre + '"');

  } catch (err) {
    // IMPORTANTE: NO usar Session.getActiveUser() en triggers — no hay usuario activo
    console.error('Error onFormSubmit: ' + err.message + '\n' + err.stack);
    try {
      if (ADMIN_EMAIL) {
        MailApp.sendEmail(
          ADMIN_EMAIL,
          '❌ Viandas Leno — Error en sync automático',
          'Error al procesar envío del formulario:\n\n' + err.message + '\n\nStack:\n' + err.stack
        );
      }
    } catch (mailErr) {
      console.error('No se pudo enviar email de error: ' + mailErr.message);
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  SINCRONIZACIÓN MASIVA (historial completo)
// ══════════════════════════════════════════════════════════════════

function sincronizarTodo() {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var sheet   = ss.getSheets()[0];
  var data    = sheet.getDataRange().getValues();

  if (data.length < 2) {
    SpreadsheetApp.getUi().alert('Viandas Leno', 'No hay respuestas en la hoja.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var headers   = data[0];
  var idxNombre = -1;
  headers.forEach(function(h, i) {
    if (h.trim() === CAMPO_NOMBRE.trim()) idxNombre = i;
  });

  if (idxNombre === -1) {
    SpreadsheetApp.getUi().alert(
      'Viandas Leno — Error',
      '❌ No se encontró la columna "' + CAMPO_NOMBRE + '".\nEjecutá detectarColumnas() y ajustá CAMPO_NOMBRE.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var diasCols = headers.filter(function(h) { return esDiaHeader(h); }).length;
  if (diasCols === 0) {
    SpreadsheetApp.getUi().alert(
      'Viandas Leno — Error',
      '❌ No se detectaron columnas de días.\nEjecutá detectarColumnas() para verificar la estructura.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var totalElec = 0, filasProcesadas = 0, sinMapeo = {};

  for (var i = 1; i < data.length; i++) {
    var row    = data[i];
    var ts     = row[0];
    var nombre = String(row[idxNombre] || '').trim();
    if (!nombre) continue;

    if (!buscarSucursal(nombre)) sinMapeo[nombre] = true;

    var anio = getAnio(ts instanceof Date ? ts : new Date(ts));

    try {
      var n = guardarFila(headers, row, anio);
      totalElec += n;
      filasProcesadas++;
    } catch (err) {
      console.error('Fila ' + (i + 1) + ': ' + err.message);
    }
  }

  var msg = '✅ Sincronización completada\n'
          + '   • Filas procesadas: ' + filasProcesadas + '\n'
          + '   • Elecciones guardadas: ' + totalElec;

  var sinMapeoList = Object.keys(sinMapeo);
  if (sinMapeoList.length) {
    msg += '\n\n⚠️ Empleados sin sucursal mapeada (' + sinMapeoList.length + '):\n'
         + sinMapeoList.slice(0, 8).join('\n')
         + (sinMapeoList.length > 8 ? '\n...' : '')
         + '\n\n→ Avisale a Luis para agregar estos nombres al script.';
  }

  SpreadsheetApp.getUi().alert('Viandas Leno — Sincronización', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ══════════════════════════════════════════════════════════════════
//  ACTIVAR TRIGGER (ejecutar una sola vez)
// ══════════════════════════════════════════════════════════════════

function crearTrigger() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('no spreadsheet');
  } catch (e) {
    // El script está en el Form, no en la Planilla
    try {
      FormApp.getUi().alert(
        '⚠️ Script en lugar incorrecto',
        'Este script debe estar en la PLANILLA DE RESPUESTAS, no en el formulario.\n\n' +
        'Pasos:\n' +
        '1. Abrí la planilla de respuestas del formulario\n' +
        '2. Menú Extensiones → Apps Script\n' +
        '3. Pegá el código del archivo apps-script-formulario.gs\n' +
        '4. Ejecutá crearTrigger() desde ahí',
        FormApp.getUi().ButtonSet.OK
      );
    } catch (e2) {
      Logger.log('ERROR: El script debe ejecutarse desde la planilla de respuestas, no desde el formulario.');
    }
    return;
  }

  ScriptApp.getProjectTriggers()
    .filter(function(t) { return t.getHandlerFunction() === 'onFormSubmit'; })
    .forEach(function(t) { ScriptApp.deleteTrigger(t); });

  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  SpreadsheetApp.getUi().alert(
    'Viandas Leno',
    '✅ Trigger activado correctamente.\nCada envío del formulario se sincronizará automáticamente con Firestore.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ══════════════════════════════════════════════════════════════════
//  DIAGNÓSTICO DEL TRIGGER
// ══════════════════════════════════════════════════════════════════

function diagnosticarTrigger() {
  var ui  = SpreadsheetApp.getUi();
  var msg = '🔍 DIAGNÓSTICO VIANDAS LENO\n';
  msg    += '─────────────────────────────\n\n';

  // 1. Verificar triggers activos
  var triggers = ScriptApp.getProjectTriggers();
  var triggerForm = triggers.filter(function(t) { return t.getHandlerFunction() === 'onFormSubmit'; });
  if (triggerForm.length === 0) {
    msg += '❌ TRIGGER: No existe. Ejecutá "Activar sync automático".\n\n';
  } else {
    msg += '✅ TRIGGER: Activo (' + triggerForm.length + ' trigger/s)\n';
    triggerForm.forEach(function(t) {
      msg += '   · Fuente: ' + t.getTriggerSource() + '\n';
      msg += '   · Tipo: ' + t.getEventType() + '\n';
    });
    msg += '\n';
  }

  // 2. Verificar estructura de la hoja
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var sheet   = ss.getSheets()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var totalFilas = sheet.getLastRow() - 1;

  msg += '📋 HOJA: "' + sheet.getName() + '" — ' + totalFilas + ' respuestas\n\n';

  // 3. Verificar columna nombre
  var idxN = -1;
  headers.forEach(function(h, i) { if (h.trim() === CAMPO_NOMBRE.trim()) idxN = i; });
  if (idxN === -1) {
    msg += '❌ CAMPO NOMBRE: No se encontró "' + CAMPO_NOMBRE.trim() + '"\n';
    msg += '   Columnas disponibles:\n';
    headers.forEach(function(h, i) { if (h) msg += '   · Col ' + (i+1) + ': "' + h + '"\n'; });
  } else {
    msg += '✅ CAMPO NOMBRE: columna ' + (idxN+1) + '\n\n';
  }

  // 4. Verificar columnas de días detectadas
  var diasCols = headers.filter(function(h) { return esDiaHeader(h); });
  msg += '📅 COLUMNAS DE DÍAS detectadas: ' + diasCols.length + '\n';
  diasCols.slice(0,5).forEach(function(h) { msg += '   · "' + h + '"\n'; });
  if (diasCols.length > 5) msg += '   · ...\n';

  // 5. Verificar última ejecución (logs no accesibles desde código, avisar)
  msg += '\n💡 Para ver errores recientes:\n';
  msg += '   Apps Script → ⏱ Ejecuciones (menú izquierdo)\n';
  msg += '   Buscá ejecuciones de "onFormSubmit" fallidas.\n';

  ui.alert('Viandas Leno — Diagnóstico', msg, ui.ButtonSet.OK);
}

// Simula el procesamiento de la última fila de la hoja (para testear sin enviar el form)
function testUltimaFila() {
  var ui    = SpreadsheetApp.getUi();
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var data  = sheet.getDataRange().getValues();
  if (data.length < 2) { ui.alert('No hay respuestas en la hoja.'); return; }

  var headers = data[0];
  var lastRow = data[data.length - 1];
  var ts      = lastRow[0];
  var anio    = getAnio(ts instanceof Date ? ts : new Date(ts));

  try {
    var n = guardarFila(headers, lastRow, anio);
    ui.alert('✅ Test OK', 'Última fila procesada: ' + n + ' días guardados.\nTimestamp: ' + ts, ui.ButtonSet.OK);
  } catch(err) {
    ui.alert('❌ Error en test', err.message + '\n\n' + err.stack, ui.ButtonSet.OK);
  }
}

// ══════════════════════════════════════════════════════════════════
//  MENÚ EN LA PLANILLA
// ══════════════════════════════════════════════════════════════════

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🍱 Viandas Sync')
    .addItem('Ver encabezados', 'detectarColumnas')
    .addItem('🔍 Diagnosticar trigger', 'diagnosticarTrigger')
    .addSeparator()
    .addItem('Activar sync automático', 'crearTrigger')
    .addSeparator()
    .addItem('Sincronizar todo con Firebase', 'sincronizarTodo')
    .addItem('🧪 Testear última fila', 'testUltimaFila')
    .addToUi();
}
