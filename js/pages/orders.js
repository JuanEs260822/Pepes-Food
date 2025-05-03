// orders.js - Lógica para la página de órdenes

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
  
  // Eventos para el modal de detalles
  document.querySelectorAll('.cerrar-modal').forEach(elem => {
    elem.addEventListener('click', cerrarModales);
  });
  
  document.getElementById('btn-guardar-estado').addEventListener('click', guardarCambiosOrden);
  document.getElementById('btn-ir-cobrar').addEventListener('click', irACobrarOrden);
  
  // Configurar actualización automática cada minuto
  if (actualizarAutomaticamente) {
    intervalActualizacion = setInterval(cargarOrdenes, 60000);
  }
  
  // Cargar órdenes iniciales
  cargarOrdenes();
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
      fechaInicio = new Date(fechaFiltro);
      fechaInicio.setHours(0, 0, 0, 0);
      
      fechaFin = new Date(fechaFiltro);
      fechaFin.setHours(23, 59, 59, 999);
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
    if (estadoFiltro) {
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
  const container = document.getElementById('ordenes-container');
  
  // Si no hay órdenes, mostrar mensaje
  if (ordenes.length === 0) {
    container.innerHTML = `
      <div class="no-resultados">
        <i class="fas fa-receipt"></i>
        <p>No se encontraron órdenes</p>
        <p>Prueba cambiando los filtros o crea una nueva orden</p>
      </div>
    `;
    return;
  }
  
  // Crear grid de órdenes
  let html = '<div class="ordenes-grid">';
  
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
    const estadoTexto = formatearEstado(orden.estado);
    const estadoClase = orden.estado || 'activo';
    
    // Productos (mostrar máximo 3)
    let productosHTML = '';
    let mostrarMas = '';
    
    if (orden.productos && orden.productos.length > 0) {
      const maxProductos = 3;
      const productosVisibles = orden.productos.slice(0, maxProductos);
      
      productosVisibles.forEach(producto => {
        productosHTML += `
          <div class="producto-resumen">
            <span>${producto.cantidad}x ${producto.nombre}</span>
            <span>${formatearMoneda(producto.subtotal || 0)}</span>
          </div>
        `;
      });
      
      // Si hay más productos, mostrar indicador
      if (orden.productos.length > maxProductos) {
        const adicionales = orden.productos.length - maxProductos;
        mostrarMas = `<div class="producto-resumen mostrar-mas">Y ${adicionales} producto(s) más...</div>`;
      }
    } else {
      productosHTML = '<div class="producto-resumen">No hay productos en esta orden</div>';
    }
    
    // Formato total
    const total = formatearMoneda(orden.total || 0);
    
    // Crear tarjeta
    html += `
      <div class="orden-card" data-id="${orden.id}">
        <div class="orden-header ${estadoClase}">
          <div class="orden-numero">#${numeroOrden}</div>
          <div class="orden-hora">${fechaHora}</div>
        </div>
        
        <div class="orden-cuerpo">
          <div class="orden-cliente">${cliente}</div>
          <div class="orden-mesa">${mesa}</div>
          
          <div class="orden-estado ${estadoClase}">${estadoTexto}</div>
          
          <div class="orden-productos">
            ${productosHTML}
            ${mostrarMas}
          </div>
          
          <div class="orden-total">Total: ${total}</div>
        </div>
        
        <div class="orden-acciones">
          <button class="btn-accion btn-detalles" data-id="${orden.id}">
            <i class="fas fa-eye"></i> Detalles
          </button>
          
          <button class="btn-accion btn-cambiar-estado" data-id="${orden.id}">
            <i class="fas fa-arrow-right"></i> Siguiente Estado
          </button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Insertar en container
  container.innerHTML = html;
  
  // Agregar eventos a los botones
  document.querySelectorAll('.btn-detalles').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      mostrarDetallesOrden(id);
    });
  });
  
  document.querySelectorAll('.btn-cambiar-estado').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      cambiarSiguienteEstado(id);
    });
  });
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

async function mostrarDetallesOrden(ordenId) {
  mostrarCargando(true);
  
  try {
    // Buscar orden en datos cargados
    const orden = ordenesData.find(o => o.id === ordenId);
    
    if (!orden) {
      // Si no se encuentra en los datos cargados, intentar cargar de Firestore
      const ordenDoc = await db.collection('ordenes').doc(ordenId).get();
      
      if (!ordenDoc.exists) {
        mostrarNotificacion('No se encontró la orden', 'error');
        mostrarCargando(false);
        return;
      }
      
      ordenSeleccionada = {
        id: ordenDoc.id,
        ...ordenDoc.data()
      };
    } else {
      ordenSeleccionada = orden;
    }
    
    // Llenar datos en el modal
    document.getElementById('detalle-numero-orden').textContent = `#${ordenSeleccionada.numeroOrden || 'Sin número'}`;
    document.getElementById('detalle-estado').value = ordenSeleccionada.estado || 'activo';
    document.getElementById('detalle-cliente').textContent = ordenSeleccionada.cliente || 'Cliente sin nombre';
    document.getElementById('detalle-mesa').textContent = formatearMesa(ordenSeleccionada.mesa);
    
    // Formatear fecha
    let fechaTexto = 'Fecha desconocida';
    if (ordenSeleccionada.fechaCreacion) {
      const fecha = ordenSeleccionada.fechaCreacion.toDate();
      fechaTexto = formatearFechaHora(fecha);
    }
    document.getElementById('detalle-fecha').textContent = fechaTexto;
    
    // Nota
    document.getElementById('detalle-nota').textContent = ordenSeleccionada.nota || 'Sin notas';
    
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
    
    document.getElementById('detalle-productos').innerHTML = productosHTML;
    
    // Resumen
    document.getElementById('detalle-subtotal').textContent = formatearMoneda(ordenSeleccionada.subtotal || 0);
    
    // Descuento
    let descuentoTexto = 'Sin descuento';
    if (ordenSeleccionada.descuento && ordenSeleccionada.descuento > 0) {
      descuentoTexto = `${ordenSeleccionada.descuento}% (${formatearMoneda(ordenSeleccionada.descuentoMonto || 0)})`;
    }
    document.getElementById('detalle-descuento').textContent = descuentoTexto;
    
    // Total
    document.getElementById('detalle-total').textContent = formatearMoneda(ordenSeleccionada.total || 0);
    
    // Mostrar modal
    document.getElementById('modal-detalles').style.display = 'block';
    
  } catch (error) {
    console.error('Error al mostrar detalles de orden:', error);
    mostrarNotificacion('Error al cargar los detalles de la orden', 'error');
  } finally {
    mostrarCargando(false);
  }
}

async function guardarCambiosOrden() {
  if (!ordenSeleccionada) return;
  
  mostrarCargando(true);
  
  try {
    // Obtener nuevo estado
    const nuevoEstado = document.getElementById('detalle-estado').value;
    
    // Actualizar en Firestore
    await db.collection('ordenes').doc(ordenSeleccionada.id).update({
      estado: nuevoEstado,
      fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Actualizar datos locales
    const index = ordenesData.findIndex(o => o.id === ordenSeleccionada.id);
    if (index >= 0) {
      ordenesData[index].estado = nuevoEstado;
    }
    
    // Cerrar modal
    cerrarModales();
    
    // Actualizar UI
    renderizarOrdenes(ordenesData);
    
    // Notificación
    mostrarNotificacion('Estado de la orden actualizado correctamente', 'success');
    
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    mostrarNotificacion('Error al guardar los cambios', 'error');
  } finally {
    mostrarCargando(false);
  }
}

async function cambiarSiguienteEstado(ordenId) {
  mostrarCargando(true);
  
  try {
    // Buscar orden
    const orden = ordenesData.find(o => o.id === ordenId);
    
    if (!orden) {
      mostrarNotificacion('No se encontró la orden', 'error');
      mostrarCargando(false);
      return;
    }
    
    // Obtener siguiente estado
    const estadoActual = orden.estado || 'activo';
    const siguienteEstado = obtenerSiguienteEstado(estadoActual);
    
    // Actualizar en Firestore
    await db.collection('ordenes').doc(ordenId).update({
      estado: siguienteEstado,
      fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Actualizar datos locales
    const index = ordenesData.findIndex(o => o.id === ordenId);
    if (index >= 0) {
      ordenesData[index].estado = siguienteEstado;
    }
    
    // Actualizar UI
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

function irACobrarOrden() {
  if (!ordenSeleccionada) return;
  
  // Redirigir a la página de cobro con el ID de la orden
  window.location.href = `charge-order.html?id=${ordenSeleccionada.id}`;
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