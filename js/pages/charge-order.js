// charge-order.js - Lógica para la página de cobrar órdenes

// Variables globales
let ordenesData = [];
let ordenSeleccionada = null;
let actualizarAutomaticamente = true;
let intervalActualizacion = null;

document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  verificarAutenticacion()
    .then(usuario => {
      // Inicializar página
      inicializarPagina();
    })
    .catch(error => {
      console.error('Error de autenticación:', error);
      // La redirección al login se maneja en verificarAutenticacion()
    });
});

function inicializarPagina() {
  // Filtro de fecha (por defecto hoy)
  const hoy = new Date();
  const fechaHoy = hoy.toISOString().split('T')[0];
  document.getElementById('filtro-fecha').value = fechaHoy;
  
  // Eventos para filtros
  document.getElementById('filtro-fecha').addEventListener('change', cargarOrdenes);
  document.getElementById('filtro-estado').addEventListener('change', cargarOrdenes);
  
  document.getElementById('busqueda').addEventListener('input', function() {
    // Debounce para no hacer muchas búsquedas seguidas
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      filtrarOrdenes();
    }, 300);
  });
  
  // Botón de refrescar
  document.getElementById('btn-refrescar').addEventListener('click', cargarOrdenes);
  
  // Configurar eventos para el modal de pago
  document.querySelectorAll('.cerrar-modal').forEach(elem => {
    elem.addEventListener('click', cerrarModales);
  });
  
  document.getElementById('btn-cancelar-pago').addEventListener('click', cerrarModales);
  document.getElementById('btn-confirmar-pago').addEventListener('click', procesarPago);
  
  // Evento para cambiar método de pago
  document.getElementById('pago-metodo').addEventListener('change', function() {
    const metodo = this.value;
    const efectivoContainer = document.getElementById('pago-efectivo-container');
    
    if (metodo === 'efectivo') {
      efectivoContainer.style.display = 'block';
    } else {
      efectivoContainer.style.display = 'none';
    }
  });
  
  // Calcular cambio
  document.getElementById('pago-recibido').addEventListener('input', calcularCambio);
  
  // Verificar si hay una orden en la URL
  const params = new URLSearchParams(window.location.search);
  const ordenId = params.get('id');
  
  if (ordenId) {
    // Si hay una orden en la URL, cargarla directamente
    cargarOrdenEspecifica(ordenId);
  } else {
    // Sino, cargar todas las órdenes
    cargarOrdenes();
  }
  
  // Configurar actualización automática cada minuto
  if (actualizarAutomaticamente) {
    intervalActualizacion = setInterval(cargarOrdenes, 60000);
  }
}

async function cargarOrdenEspecifica(ordenId) {
  mostrarCargando(true);
  
  try {
    // Cargar la orden específica desde Firestore
    const ordenDoc = await db.collection('ordenes').doc(ordenId).get();
    
    if (!ordenDoc.exists) {
      mostrarNotificacion('No se encontró la orden especificada', 'error');
      cargarOrdenes(); // Cargar todas las órdenes si no se encuentra la específica
      return;
    }
    
    // Guardar datos de la orden
    ordenesData = [{
      id: ordenDoc.id,
      ...ordenDoc.data()
    }];
    
    // Renderizar la lista de órdenes
    renderizarOrdenes(ordenesData);
    
    // Seleccionar la orden automáticamente
    seleccionarOrden(ordenId);
    
  } catch (error) {
    console.error('Error al cargar orden específica:', error);
    mostrarNotificacion('Error al cargar la orden', 'error');
    cargarOrdenes(); // Cargar todas las órdenes en caso de error
  } finally {
    mostrarCargando(false);
  }
}

async function cargarOrdenes() {
  mostrarCargando(true);
  
  try {
    // Obtener filtros
    const fechaFiltro = document.getElementById('filtro-fecha').value;
    const estadoFiltro = document.getElementById('filtro-estado').value;
    
    // Calcular rango de fechas
    let fechaInicio, fechaFin;
    
    if (fechaFiltro) {
      // Si hay fecha seleccionada, usarla
      //fechaInicio = new Date(fechaFiltro);
      fechaInicio = new Date(fechaFiltro + 'T00:00:00');
      //fechaInicio.setHours(0, 0, 0, 0);
      
      //fechaFin = new Date(fechaFiltro);
      fechaFin = new Date(fechaFiltro + 'T23:59:59.999');
      //fechaFin.setHours(23, 59, 59, 999);
      console.log(fechaInicio);
      console.log(fechaFin);
    } else {
      // Si no hay fecha, usar hoy
      fechaInicio = obtenerFechaInicioDia();
      fechaFin = obtenerFechaFinDia();
    }
    
    // Construir consulta base
    let ordenesRef = db.collection('ordenes')
      .where('fechaCreacion', '>=', fechaInicio)
      .where('fechaCreacion', '<=', fechaFin);
    
    // Filtrar por estado si está seleccionado
    if (estadoFiltro && estadoFiltro !== 'todos') {
      ordenesRef = ordenesRef.where('estado', '==', estadoFiltro);
    }
    
    // Ordenar por fecha de creación (más reciente primero)
    ordenesRef = ordenesRef.orderBy('fechaCreacion', 'desc');
    
    // Ejecutar consulta
    const ordenesSnapshot = await ordenesRef.get();
    
    // Convertir documentos a objetos
    ordenesData = [];
    ordenesSnapshot.forEach(doc => {
      ordenesData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Mostrar órdenes
    renderizarOrdenes(ordenesData);
    
    // Si había una orden seleccionada, intentar seleccionarla de nuevo
    if (ordenSeleccionada) {
      const ordenId = ordenSeleccionada.id;
      const orden = ordenesData.find(o => o.id === ordenId);
      if (orden) {
        seleccionarOrden(ordenId);
      } else {
        ordenSeleccionada = null;
        actualizarPanelCobro();
      }
    }
    
  } catch (error) {
    console.error('Error al cargar órdenes:', error);
    mostrarNotificacion('Error al cargar las órdenes', 'error');
  } finally {
    mostrarCargando(false);
  }
}

function filtrarOrdenes() {
  const textoBusqueda = document.getElementById('busqueda').value.toLowerCase().trim();
  
  // Si no hay texto, mostrar todas las órdenes
  if (!textoBusqueda) {
    renderizarOrdenes(ordenesData);
    return;
  }
  
  // Filtrar órdenes
  const ordenesFiltradas = ordenesData.filter(orden => {
    // Filtrar por número de orden
    const numeroOrden = orden.numeroOrden ? orden.numeroOrden.toString() : '';
    if (numeroOrden.includes(textoBusqueda)) {
      return true;
    }
    
    // Filtrar por cliente
    const cliente = orden.cliente ? orden.cliente.toLowerCase() : '';
    if (cliente.includes(textoBusqueda)) {
      return true;
    }
    
    // Filtrar por mesa
    const mesa = orden.mesa ? orden.mesa.toLowerCase() : '';
    if (mesa.includes(textoBusqueda)) {
      return true;
    }
    
    return false;
  });
  
  renderizarOrdenes(ordenesFiltradas);
}

function renderizarOrdenes(ordenes) {
  const container = document.getElementById('ordenes-lista');
  
  // Si no hay órdenes, mostrar mensaje
  if (ordenes.length === 0) {
    container.innerHTML = `
      <div class="no-resultados">
        <i class="fas fa-receipt"></i>
        <p>No se encontraron órdenes</p>
        <p>Prueba cambiando los filtros</p>
      </div>
    `;
    return;
  }
  
  // Crear lista de órdenes
  let html = '';
  
  ordenes.forEach(orden => {
    // Información básica
    const numeroOrden = orden.numeroOrden || 'Sin número';
    const cliente = orden.cliente || 'Cliente sin nombre';
    const mesa = formatearMesa(orden.mesa);
    
    // Formatear fecha y hora
    let fechaHora = 'Fecha desconocida';
    if (orden.fechaCreacion) {
      const fecha = orden.fechaCreacion.toDate();
      fechaHora = fecha.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Estado de la orden
    const estadoClase = orden.estado || 'activo';
    
    // Contar productos
    const cantidadProductos = orden.productos ? orden.productos.length : 0;
    
    // Formato total
    const total = formatearMoneda(orden.total || 0);
    
    // Clase seleccionada
    const selectedClass = ordenSeleccionada && orden.id === ordenSeleccionada.id ? 'selected' : '';
    
    // Crear ítem
    html += `
      <div class="orden-item ${selectedClass}" data-id="${orden.id}">
        <div class="orden-header ${estadoClase}">
          <div class="orden-numero">#${numeroOrden}</div>
          <div class="orden-hora">${fechaHora}</div>
        </div>
        
        <div class="orden-body">
          <div class="orden-cliente">${cliente}</div>
          <div class="orden-mesa">${mesa}</div>
          <div class="orden-cantidad">${cantidadProductos} productos</div>
          <div class="orden-total">Total: ${total}</div>
        </div>
      </div>
    `;
  });
  
  // Insertar en container
  container.innerHTML = html;
  
  // Agregar eventos a los ítems de orden
  document.querySelectorAll('.orden-item').forEach(item => {
    item.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      seleccionarOrden(id);
    });
  });
}

function seleccionarOrden(ordenId) {
  // Remover selección actual en UI
  document.querySelectorAll('.orden-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Buscar el item actual y agregarlo
  const item = document.querySelector(`.orden-item[data-id="${ordenId}"]`);
  if (item) {
    item.classList.add('selected');
    
    // Hacer scroll hacia el item
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // Buscar la orden en datos
  const orden = ordenesData.find(o => o.id === ordenId);
  
  if (orden) {
    ordenSeleccionada = orden;
  } else {
    ordenSeleccionada = null;
  }
  
  // Actualizar panel de cobro
  actualizarPanelCobro();
}

function actualizarPanelCobro() {
  const container = document.getElementById('cobro-detalles');
  
  // Si no hay orden seleccionada
  if (!ordenSeleccionada) {
    container.innerHTML = `
      <div class="cobro-vacio">
        <i class="fas fa-cash-register"></i>
        <p>Selecciona una orden para cobrar</p>
      </div>
    `;
    return;
  }
  
  // Información básica
  const numeroOrden = ordenSeleccionada.numeroOrden || 'Sin número';
  const cliente = ordenSeleccionada.cliente || 'Cliente sin nombre';
  const mesa = formatearMesa(ordenSeleccionada.mesa);
  
  // Formatear fecha
  let fechaTexto = 'Fecha desconocida';
  if (ordenSeleccionada.fechaCreacion) {
    const fecha = ordenSeleccionada.fechaCreacion.toDate();
    fechaTexto = formatearFechaHora(fecha);
  }
  
  // Estado
  const estadoTexto = formatearEstado(ordenSeleccionada.estado);
  const estadoClase = ordenSeleccionada.estado || 'activo';
  
  // Productos
  let productosHTML = '';
  
  if (ordenSeleccionada.productos && ordenSeleccionada.productos.length > 0) {
    ordenSeleccionada.productos.forEach(producto => {
      productosHTML += `
        <div class="producto-item">
          <div class="producto-info">
            <div class="producto-nombre">${producto.nombre}</div>
            <div class="producto-cantidad-precio">
              <span>${producto.cantidad}x</span>
              <span>${formatearMoneda(producto.precio || 0)} c/u</span>
            </div>
          </div>
          <div class="producto-subtotal">${formatearMoneda(producto.subtotal || 0)}</div>
        </div>
      `;
    });
  } else {
    productosHTML = '<div class="no-productos">No hay productos en esta orden</div>';
  }
  
  // Nota
  const nota = ordenSeleccionada.nota || 'Sin notas';
  
  // HTML del panel de cobro
  let html = `
    <div class="cobro-info-orden">
      <div>
        <div class="info-label">Orden:</div>
        <div class="info-valor">#${numeroOrden}</div>
      </div>
      <div>
        <div class="info-label">Estado:</div>
        <div class="info-valor estado ${estadoClase}">${estadoTexto}</div>
      </div>
    </div>
    
    <div class="cobro-info-cliente">
      <div class="info-label">Cliente:</div>
      <div class="info-valor">${cliente}</div>
      <div class="info-label">Mesa:</div>
      <div class="info-valor">${mesa}</div>
      <div class="info-label">Fecha:</div>
      <div class="info-valor">${fechaTexto}</div>
    </div>
    
    <div class="cobro-productos">
      <div class="cobro-productos-titulo">Productos</div>
      ${productosHTML}
    </div>
    
    <div class="cobro-resumen">
      <div class="resumen-fila">
        <span class="resumen-etiqueta">Subtotal:</span>
        <span>${formatearMoneda(ordenSeleccionada.subtotal || 0)}</span>
      </div>
  `;
  
  // Descuento
  if (ordenSeleccionada.descuento && ordenSeleccionada.descuento > 0) {
    html += `
      <div class="resumen-fila">
        <span class="resumen-etiqueta">Descuento (${ordenSeleccionada.descuento}%):</span>
        <span>-${formatearMoneda(ordenSeleccionada.descuentoMonto || 0)}</span>
      </div>
    `;
  }
  
  // Total
  html += `
      <div class="resumen-fila total">
        <span class="resumen-etiqueta">Total:</span>
        <span>${formatearMoneda(ordenSeleccionada.total || 0)}</span>
      </div>
    </div>
  `;
  
  // Notas
  html += `
    <div class="cobro-notas">
      <div class="info-label">Notas:</div>
      <div class="info-valor">${nota}</div>
    </div>
  `;
  
  // Acciones
  html += `
    <div class="cobro-acciones">
  `;
  
  // Botón de pago (sólo disponible si no está pagada ni entregada)
  if (ordenSeleccionada.estado !== 'pagado' && ordenSeleccionada.estado !== 'entregado') {
    html += `
      <button id="btn-procesar-pago" class="btn btn-primario">
        <i class="fas fa-money-bill-wave"></i> Procesar Pago
      </button>
    `;
  }
  
  // Botón de cambiar estado
  /*if (ordenSeleccionada.estado !== 'entregado') {
    html += `
      <button id="btn-cambiar-estado" class="btn btn-secundario">
        <i class="fas fa-arrow-right"></i> Cambiar a ${formatearEstado(obtenerSiguienteEstado(ordenSeleccionada.estado))}
      </button>
    `;
  }*/
  
  html += `
    </div>
  `;
  
  // Insertar en container
  container.innerHTML = html;
  
  // Agregar eventos a los botones
  const btnProcesarPago = document.getElementById('btn-procesar-pago');
  if (btnProcesarPago) {
    btnProcesarPago.addEventListener('click', abrirModalPago);
  }
  
  const btnCambiarEstado = document.getElementById('btn-cambiar-estado');
  if (btnCambiarEstado) {
    btnCambiarEstado.addEventListener('click', cambiarSiguienteEstado);
  }
}

function formatearEstado(estado) {
  switch (estado) {
    case 'activo':
      return 'Activo';
    case 'ordenado':
      return 'Ordenado';
    case 'cocinado':
      return 'Cocinado';
    case 'pagado':
      return 'Pagado';
    case 'entregado':
      return 'Entregado';
    default:
      return 'Desconocido';
  }
}

function formatearMesa(mesa) {
  if (!mesa) return 'Para llevar';
  
  if (mesa === 'llevar') {
    return 'Para llevar';
  }
  
  // Si contiene 'mesa', devolver tal cual
  if (mesa.toLowerCase().includes('mesa')) {
    return mesa.charAt(0).toUpperCase() + mesa.slice(1);
  }
  
  // Sino, agregar 'Mesa' al inicio
  return 'Mesa ' + mesa;
}

function obtenerSiguienteEstado(estadoActual) {
  switch (estadoActual) {
    case 'activo':
      return 'ordenado';
    case 'ordenado':
      return 'cocinado';
    case 'cocinado':
      return 'pagado';
    case 'pagado':
      return 'entregado';
    default:
      return 'activo';
  }
}

async function cambiarSiguienteEstado() {
  if (!ordenSeleccionada) return;
  
  mostrarCargando(true);
  
  try {
    // Obtener siguiente estado
    const estadoActual = ordenSeleccionada.estado || 'activo';
    const siguienteEstado = obtenerSiguienteEstado(estadoActual);
    
    // Actualizar en Firestore
    await db.collection('ordenes').doc(ordenSeleccionada.id).update({
      estado: siguienteEstado,
      fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Actualizar datos locales
    ordenSeleccionada.estado = siguienteEstado;
    
    // Actualizar UI
    actualizarPanelCobro();
    
    // Actualizar lista de órdenes
    renderizarOrdenes(ordenesData);
    
    // Notificación
    mostrarNotificacion(`Orden actualizada a estado: ${formatearEstado(siguienteEstado)}`, 'success');
    
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    mostrarNotificacion('Error al cambiar el estado de la orden', 'error');
  } finally {
    mostrarCargando(false);
  }
}

function abrirModalPago() {
  if (!ordenSeleccionada) return;
  
  // Actualizar datos en el modal
  document.getElementById('pago-numero-orden').textContent = `#${ordenSeleccionada.numeroOrden || 'Sin número'}`;
  document.getElementById('pago-total').textContent = formatearMoneda(ordenSeleccionada.total || 0);
  
  // Reiniciar campos
  document.getElementById('pago-metodo').value = 'efectivo';
  document.getElementById('pago-recibido').value = '';
  document.getElementById('pago-cambio').textContent = '$0.00';
  document.getElementById('pago-notas').value = '';
  
  // Mostrar container de efectivo
  document.getElementById('pago-efectivo-container').style.display = 'block';
  
  // Mostrar modal
  //document.getElementById('modal-pago').style.display = 'block';

  const modal = document.getElementById('modal-pago');
  modal.style.display = 'flex';
}

function calcularCambio() {
  if (!ordenSeleccionada) return;
  
  // Obtener valores
  const total = ordenSeleccionada.total || 0;
  const recibido = parseFloat(document.getElementById('pago-recibido').value) || 0;
  
  // Calcular cambio
  const cambio = recibido > total ? recibido - total : 0;
  
  // Actualizar UI
  document.getElementById('pago-cambio').textContent = formatearMoneda(cambio);
}

async function procesarPago() {
  if (!ordenSeleccionada) return;
  
  // Validar campos
  const metodoPago = document.getElementById('pago-metodo').value;
  const notas = document.getElementById('pago-notas').value.trim();
  
  // Si es efectivo, validar monto recibido
  if (metodoPago === 'efectivo') {
    const recibido = parseFloat(document.getElementById('pago-recibido').value) || 0;
    const total = ordenSeleccionada.total || 0;
    
    if (recibido < total) {
      mostrarNotificacion('El monto recibido debe ser mayor o igual al total', 'error');
      return;
    }
  }
  
  mostrarCargando(true);
  
  try {
    // Datos del pago
    const datosPago = {
      metodo: metodoPago,
      notas: notas,
      fechaPago: firebase.firestore.FieldValue.serverTimestamp(),
      usuarioPago: firebase.auth().currentUser ? firebase.auth().currentUser.uid : null,
      nombreUsuario: firebase.auth().currentUser ? firebase.auth().currentUser.email : 'Desconocido'
    };
    
    // Si es efectivo, agregar datos adicionales
    if (metodoPago === 'efectivo') {
      const recibido = parseFloat(document.getElementById('pago-recibido').value) || 0;
      const cambio = recibido - (ordenSeleccionada.total || 0);
      
      datosPago.recibido = recibido;
      datosPago.cambio = cambio;
    }
    
    // Actualizar orden en Firestore
    await db.collection('ordenes').doc(ordenSeleccionada.id).update({
      estado: 'pagado',
      fechaModificacion: firebase.firestore.FieldValue.serverTimestamp(),
      pago: datosPago
    });
    
    // Actualizar datos locales
    ordenSeleccionada.estado = 'pagado';
    ordenSeleccionada.pago = datosPago;
    
    // Cerrar modal
    cerrarModales();
    
    // Actualizar UI
    actualizarPanelCobro();
    renderizarOrdenes(ordenesData);
    
    // Notificación
    mostrarNotificacion('Pago procesado correctamente', 'success');
    
  } catch (error) {
    console.error('Error al procesar pago:', error);
    mostrarNotificacion('Error al procesar el pago', 'error');
  } finally {
    mostrarCargando(false);
  }
}

function cerrarModales() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

// Limpiar intervalo al salir de la página
window.addEventListener('beforeunload', function() {
  if (intervalActualizacion) {
    clearInterval(intervalActualizacion);
  }
});

// event listener para cerrar modal cuando demos click afuera del modal
window.addEventListener('click', function(event) {
  const modalPago = document.getElementById('modal-pago');
 
    if (event.target === modalPago) {
      console.log('clicked outside function')
      modalPago.style.display = 'none';
    }
});