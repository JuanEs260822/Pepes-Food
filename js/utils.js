// Utilidades comunes para todas las páginas de Pepe's Food

function esModoMovil() {
  return window.innerWidth <= 1100;
}

// Formatear moneda en Pesos Mexicanos
function formatearMoneda(cantidad) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(cantidad);
}

// Formatear fecha y hora en formato español
function formatearFechaHora(fecha) {
  if (!(fecha instanceof Date)) {
    // Si es un timestamp de Firestore, convertirlo a Date
    if (fecha && typeof fecha.toDate === 'function') {
      fecha = fecha.toDate();
    } else if (typeof fecha === 'string' || typeof fecha === 'number') {
      fecha = new Date(fecha);
    } else {
      return 'Fecha inválida';
    }
  }
  
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(fecha);
}

// Formatear solo fecha en formato español
function formatearFecha(fecha) {
  if (!(fecha instanceof Date)) {
    // Si es un timestamp de Firestore, convertirlo a Date
    if (fecha && typeof fecha.toDate === 'function') {
      fecha = fecha.toDate();
    } else if (typeof fecha === 'string' || typeof fecha === 'number') {
      fecha = new Date(fecha);
    } else {
      return 'Fecha inválida';
    }
  }
  
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(fecha);
}

// Obtener la fecha actual al inicio del día (00:00:00)
function obtenerFechaInicioDia() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
}

// Obtener la fecha actual al final del día (23:59:59)
function obtenerFechaFinDia() {
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  return hoy;
}

// Mostrar mensaje de notificación temporal
function mostrarNotificacion(mensaje, tipo = 'success', duracion = 3000) {
  // Crear elemento de notificación si no existe
  let notificacion = document.getElementById('notificacion-sistema');
  
  if (!notificacion) {
    notificacion = document.createElement('div');
    notificacion.id = 'notificacion-sistema';
    document.body.appendChild(notificacion);
  }
  
  // Establecer clase según tipo
  notificacion.className = `notificacion ${tipo}`;
  notificacion.textContent = mensaje;
  notificacion.style.display = 'block';
  
  // Ocultar después de la duración especificada
  setTimeout(() => {
    notificacion.style.display = 'none';
  }, duracion);
}

// Mostrar indicador de carga
function mostrarCargando(mostrar = true) {
  let cargando = document.getElementById('indicador-cargando');
  
  if (!cargando && mostrar) {
    cargando = document.createElement('div');
    cargando.id = 'indicador-cargando';
    cargando.className = 'cargando-contenedor';
    cargando.innerHTML = '<div class="cargando-spinner"></div>';
    document.body.appendChild(cargando);
  } else if (cargando) {
    if (mostrar) {
      cargando.style.display = 'flex';
    } else {
      cargando.style.display = 'none';
    }
  }
}

// Verificar permisos de usuario para una función específica
// Requiere que exista una colección 'usuarios' con campo 'permisos' en Firestore
async function verificarPermiso(permiso) {
  try {
    const usuario = firebase.auth().currentUser;
    if (!usuario) return false;
    
    const docUsuario = await db.collection('usuarios').doc(usuario.uid).get();
    if (!docUsuario.exists) return false;
    
    const permisos = docUsuario.data().permisos || [];
    return permisos.includes(permiso) || permisos.includes('admin');
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
}

// Generar ID único para documentos
function generarId(longitud = 8) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultado = '';
  for (let i = 0; i < longitud; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return resultado;
}

// Obtener parámetros de URL
function obtenerParametroUrl(nombre) {
  const params = new URLSearchParams(window.location.search);
  return params.get(nombre);
}

// Validar campos obligatorios de un formulario
function validarCamposObligatorios(campos) {
  for (const campo of campos) {
    const elemento = document.getElementById(campo);
    if (!elemento) continue;
    
    const valor = elemento.value.trim();
    if (!valor) {
      mostrarNotificacion(`El campo ${elemento.placeholder || campo} es obligatorio`, 'error');
      elemento.focus();
      return false;
    }
  }
  return true;
}