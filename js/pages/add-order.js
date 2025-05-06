// add-order.js - Lógica para la página de crear orden (versión mejorada)

// Variables globales
let productosData = [];
let ordenActual = {
  items: [],
  subtotal: 0,
  descuento: 0,
  total: 0,
  cliente: '',
  mesa: 'llevar',
  nota: ''
};

// Filtros
let filtroCategoria = 'todos';
let filtroSubcategoria = '';
let filtroBusqueda = '';

// Mapeo de subcategorías por categoría
const subcategoriasPorCategoria = {
  'comida': [
    { id: 'tortas', nombre: 'Tortas' },
    { id: 'hamburguesas', nombre: 'Hamburguesas' },
    { id: 'pizzas', nombre: 'Pizzas' },
    { id: 'alitas', nombre: 'Alitas' },
    { id: 'hotdogs', nombre: 'Hot Dogs' },
    { id: 'sincronizadas', nombre: 'Sincronizadas' },
    { id: 'papasfritas', nombre: 'Papas Fritas' },
    { id: 'salchipapas', nombre: 'Salchipapas' },
    { id: 'papotas', nombre: 'Papotas' }
  ],
  'snacks': [
    { id: 'dorilocos', nombre: 'Dorilocos' },
    { id: 'doriesquites', nombre: 'Doriesquites' },
    { id: 'esquites', nombre: 'Esquites' },
    { id: 'frituras', nombre: 'Sabritas' },
    { id: 'pringles', nombre: 'Pringles' },
    { id: 'barras', nombre: 'Barras' },
    { id: 'galletas', nombre: 'Galletas' },
    { id: 'gomitas', nombre: 'Gomitas' }
  ],
  'bebidas': [
    { id: 'refresco_botella', nombre: 'Sodas-Botella' },
    { id: 'refresco_lata', nombre: 'Sodas-Lata' },
    { id: 'agua', nombre: 'Agua-Botella' },
    { id: 'agua_sabor', nombre: 'Aguas-Frescas' },
    { id: 'cerveza', nombre: 'Cerveza' },
    { id: 'michelada', nombre: 'Michelada' },
    { id: 'new_mix', nombre: 'New Mix' },
    { id: 'jugo_botella', nombre: 'Jugo-Botella' },
    { id: 'jugo_lata', nombre: 'Jugo-Lata' },
    { id: 'energeticas', nombre: 'Bebidas energéticas' },
    { id: 'malteadas', nombre: 'Malteadas' },
    { id: 'frappe', nombre: 'Frappe' },
    { id: 'raspados', nombre: 'Raspados' }
  ]
};

// Variables para modales e instrucciones especiales
let productoSeleccionadoInstr = null;
let indexItemEditarInstr = -1;

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
  // Cargar productos
  cargarProductos();
  
  // Configurar eventos de filtros de categoría
  document.querySelectorAll('.categoria-principal').forEach(btn => {
    btn.addEventListener('click', function() {
      // Actualizar UI
      document.querySelectorAll('.categoria-principal').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Actualizar filtro
      filtroCategoria = this.getAttribute('data-categoria');
      
      // Reiniciar subcategoría si cambiamos de categoría
      filtroSubcategoria = '';
      
      // Actualizar subcategorías
      actualizarSubcategorias();
      
      // Filtrar productos
      filtrarProductos();
    });
  });
  
  // Configurar búsqueda
  document.getElementById('buscar-producto').addEventListener('input', function() {
    filtroBusqueda = this.value.toLowerCase().trim();
    filtrarProductos();
  });
  
  // Eventos para la orden
  document.getElementById('orden-descuento').addEventListener('input', calcularTotal);
  document.getElementById('cliente-nombre').addEventListener('input', function() {
    ordenActual.cliente = this.value.trim();
  });
  
  document.getElementById('cliente-mesa').addEventListener('change', function() {
    ordenActual.mesa = this.value;
  });
  
  // Botón para mostrar/ocultar notas
  document.getElementById('toggle-nota').addEventListener('click', function() {
    const notaContainer = document.querySelector('.nota-input-container');
    if (notaContainer.style.display === 'none') {
      notaContainer.style.display = 'block';
      this.innerHTML = '<i class="fas fa-sticky-note"></i> Ocultar instrucciones';
    } else {
      notaContainer.style.display = 'none';
      this.innerHTML = '<i class="fas fa-sticky-note"></i> Instrucciones especiales';
    }
  });
  
  document.getElementById('orden-nota').addEventListener('input', function() {
    ordenActual.nota = this.value.trim();
  });
  
  // Botón para limpiar orden
  document.getElementById('btn-limpiar-orden').addEventListener('click', confirmarLimpiarOrden);
  
  // Botón para crear orden
  document.getElementById('btn-crear-orden').addEventListener('click', crearOrden);
  
  // Configurar tabs para modo móvil
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');

      // Activar tab
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Mostrar contenido
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
      });
      
      const tabContent = document.getElementById(tabId);
      tabContent.style.display = 'block';
      tabContent.classList.add('active');

       // --- quitar panel de categorias en la tab orden
      const panelCategorias = document.querySelector('.panel-categorias');
      if (tabId === 'orden-tab') {
        panelCategorias.style.display = 'none';
      } else {
        panelCategorias.style.display = 'flex';
      };

    });
  });
  
  // Eventos para el modal de instrucciones
  document.querySelectorAll('.cerrar-modal').forEach(btn => {
    btn.addEventListener('click', function() {
      document.getElementById('modal-instrucciones').style.display = 'none';
    });
  });
  
  document.getElementById('btn-guardar-instrucciones').addEventListener('click', guardarInstrucciones);
  
  // Inicializar estado de la orden
  actualizarOrdenUI();
}

async function cargarProductos() {
  mostrarCargando(true);
  
  try {
    // Obtener productos disponibles de Firestore
    const productosRef = db.collection('productos')
      .where('disponible', '==', true)
      .orderBy('nombre');
    
    const snapshot = await productosRef.get();
    
    productosData = [];
    snapshot.forEach(doc => {
      productosData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Inicializar subcategorías
    actualizarSubcategorias();
    
    // Mostrar productos
    filtrarProductos();
    
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarNotificacion('Error al cargar los productos', 'error');
  } finally {
    mostrarCargando(false);
  }
}

function actualizarSubcategorias() {
  const container = document.getElementById('subcategorias-container');
  
  // Limpiar container
  container.innerHTML = '';
  
  // Si no es una categoría específica, ocultar container
  // --- habilitar barra de busqueda solo en "todos"
  const barraBusqueda = document.querySelector('.busqueda-container');

  if (filtroCategoria === 'todos') {
    container.innerHTML = '<div class="subcategorias-placeholder"></div>';

    // --- habilitar barra de busqueda solo en "todos"
    barraBusqueda.classList.remove('busqueda-display')
    return;
  } else {

    //--- este else tambien es para habilitar la barra de busqueda solo en "todos"
    barraBusqueda.classList.add('busqueda-display')
  };
  
  // Opción "Todas"
  const btnTodas = document.createElement('button');
  btnTodas.className = 'subcategoria-btn' + (filtroSubcategoria === '' ? ' active' : '');
  btnTodas.textContent = 'Todas';
  btnTodas.addEventListener('click', () => {
    filtroSubcategoria = '';
    actualizarBotonesSubcategoria();
    filtrarProductos();
  });
  container.appendChild(btnTodas);
  
  // Obtener subcategorías de la categoría seleccionada
  const subcategorias = subcategoriasPorCategoria[filtroCategoria] || [];
  
  // Crear botones para cada subcategoría
  subcategorias.forEach(subcategoria => {
    const btn = document.createElement('button');
    btn.className = 'subcategoria-btn' + (filtroSubcategoria === subcategoria.id ? ' active' : '');
    btn.textContent = subcategoria.nombre;
    btn.setAttribute('data-subcategoria', subcategoria.id);
    
    btn.addEventListener('click', () => {
      filtroSubcategoria = subcategoria.id;
      actualizarBotonesSubcategoria();
      filtrarProductos();
    });
    
    container.appendChild(btn);
  });
}

function actualizarBotonesSubcategoria() {
  document.querySelectorAll('.subcategoria-btn').forEach(btn => {
    const subcat = btn.getAttribute('data-subcategoria') || '';
    
    if ((subcat === '' && filtroSubcategoria === '') || 
        (subcat === filtroSubcategoria)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function filtrarProductos() {
  const container = document.getElementById('productos-grid');
  
  // Aplicar filtros
  let productosFiltrados = productosData.filter(producto => {
    // Filtro por categoría
    if (filtroCategoria !== 'todos' && producto.categoria !== filtroCategoria) {
      return false;
    }
    
    // Filtro por subcategoría
    if (filtroSubcategoria && producto.subcategoria !== filtroSubcategoria) {
      return false;
    }
    
    // Filtro por búsqueda
    if (filtroBusqueda) {
      const nombre = producto.nombre ? producto.nombre.toLowerCase() : '';
      const descripcion = producto.descripcion ? producto.descripcion.toLowerCase() : '';
      
      return nombre.includes(filtroBusqueda) || descripcion.includes(filtroBusqueda);
    }
    
    return true;
  });
  
  // Mostrar resultados
  if (productosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="no-resultados">
        <i class="fas fa-search"></i>
        <p>No se encontraron productos</p>
        <p>Prueba con otros filtros</p>
      </div>
    `;
    return;
  }
  
  // Crear las tarjetas de producto
  let html = '';
  
  productosFiltrados.forEach(producto => {
    // Imagen del producto
    let imagenHTML = '';
    if (producto.imagenURL) {
      imagenHTML = `<img src="${producto.imagenURL}" alt="${producto.nombre}" loading="lazy">`;
    } else {
      imagenHTML = `<i class="fas fa-image" style="font-size: 2rem; color: #ddd;"></i>`;
    }
    
    // Crear tarjeta
    html += `
      <div class="producto-card" data-id="${producto.id}">
        <div class="producto-imagen">
          ${imagenHTML}
          ${!producto.disponible ? '<div class="producto-no-disponible">No Disponible</div>' : ''}
        </div>
        <div class="producto-info">
          <div class="producto-nombre">${producto.nombre}</div>
          <div class="producto-precio">${formatearMoneda(producto.precio || 0)}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Agregar eventos a las tarjetas
  document.querySelectorAll('.producto-card').forEach(card => {
    card.addEventListener('click', function() {
      // Obtener ID del producto
      const productoId = this.getAttribute('data-id');
      
      // Buscar producto completo
      const producto = productosData.find(p => p.id === productoId);
      
      // Verificar disponibilidad
      if (producto && producto.disponible !== false) {
        // En lugar de abrir modal, agregar directamente a la orden
        agregarProductoDirecto(producto);
      }
    });
  });
}

function agregarProductoDirecto(producto) {
  // Verificar si el producto ya está en la orden
  const itemExistente = ordenActual.items.findIndex(i => i.id === producto.id);
  
  if (itemExistente >= 0) {
    // Aumentar cantidad y subtotal
    ordenActual.items[itemExistente].cantidad += 1;
    ordenActual.items[itemExistente].subtotal = 
      ordenActual.items[itemExistente].precio * ordenActual.items[itemExistente].cantidad;
  } else {
    // Agregar nuevo item
    const item = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio || 0,
      cantidad: 1,
      subtotal: producto.precio || 0,
      instrucciones: ''
    };
    
    ordenActual.items.push(item);
  }
  
  // Actualizar UI
  actualizarOrdenUI();
  
  // Notificación
  mostrarNotificacion(`${producto.nombre} agregado a la orden`, 'success');
  
  // --- no lo necesitamos
  // Si estamos en modo móvil, cambiar a la tab de orden al darle click a un producto
  /*if (window.innerWidth <= 768) {
    const ordenTab = document.querySelector('.tab-btn[data-tab="orden-tab"]');
    if (ordenTab) {
      ordenTab.click();
    }
  }*/
}

function actualizarOrdenUI() {
  const container = document.getElementById('orden-items');
  
  // Actualizar contador de items para la tab móvil
  document.querySelector('.orden-contador').textContent = ordenActual.items.length;
  
  // Si no hay items, mostrar mensaje vacío
  if (ordenActual.items.length === 0) {
    container.innerHTML = `
      <div class="orden-vacia">
        <i class="fas fa-shopping-cart"></i>
        <p>La orden está vacía</p>
        <p class="orden-vacia-texto">Agrega productos haciendo clic en ellos</p>
      </div>
    `;
    
    // Calcular total
    calcularTotal();
    return;
  }
  
  // Generar HTML para los items
  let html = '';
  
  ordenActual.items.forEach((item, index) => {
    const tieneInstrucciones = item.instrucciones && item.instrucciones.trim() !== '';
    
    html += `
      <div class="orden-item">
        <div class="orden-item-cantidad">${item.cantidad}x</div>
        <div class="orden-item-info">
          <div class="orden-item-nombre">${item.nombre}</div>
          <div class="orden-item-precio">${formatearMoneda(item.precio)} c/u</div>
          ${tieneInstrucciones ? 
            `<div class="orden-item-instrucciones">${item.instrucciones}</div>` : ''}
        </div>
        <div class="orden-item-total">${formatearMoneda(item.subtotal)}</div>
        <div class="orden-item-acciones">
          <button class="orden-item-btn btn-instrucciones" data-index="${index}" title="Instrucciones">
            <i class="fas fa-comment-dots"></i>
          </button>
          <button class="orden-item-btn btn-reducir" data-index="${index}" title="Reducir">
            <i class="fas fa-minus"></i>
          </button>
          <button class="orden-item-btn btn-aumentar" data-index="${index}" title="Aumentar">
            <i class="fas fa-plus"></i>
          </button>
          <button class="orden-item-btn btn-eliminar" data-index="${index}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Agregar eventos a los botones
  document.querySelectorAll('.btn-instrucciones').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        const item = ordenActual.items[index];
        abrirModalInstrucciones(item, index);
      }
    });
  });
  
  document.querySelectorAll('.btn-reducir').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        if (ordenActual.items[index].cantidad > 1) {
          // Reducir cantidad
          ordenActual.items[index].cantidad -= 1;
          ordenActual.items[index].subtotal = 
            ordenActual.items[index].precio * ordenActual.items[index].cantidad;
          
          // Actualizar UI
          actualizarOrdenUI();
        }
      }
    });
  });
  
  document.querySelectorAll('.btn-aumentar').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        // Aumentar cantidad
        ordenActual.items[index].cantidad += 1;
        ordenActual.items[index].subtotal = 
          ordenActual.items[index].precio * ordenActual.items[index].cantidad;
        
        // Actualizar UI
        actualizarOrdenUI();
      }
    });
  });
  
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        // Eliminar item
        ordenActual.items.splice(index, 1);
        
        // Actualizar UI
        actualizarOrdenUI();
        
        // Notificación
        mostrarNotificacion('Producto eliminado de la orden', 'info');
      }
    });
  });
  
  // Calcular total
  calcularTotal();
}

function abrirModalInstrucciones(item, index) {
  // Guardar referencia al ítem
  productoSeleccionadoInstr = item;
  indexItemEditarInstr = index;
  
  // Actualizar título del modal
  document.getElementById('modal-producto-nombre-instr').textContent = item.nombre;
  
  // Establecer instrucciones actuales
  document.getElementById('producto-instrucciones').value = item.instrucciones || '';
  
  // Mostrar modal
  document.getElementById('modal-instrucciones').style.display = 'flex';
}

function guardarInstrucciones() {
  if (indexItemEditarInstr >= 0 && indexItemEditarInstr < ordenActual.items.length) {
    // Obtener instrucciones
    const instrucciones = document.getElementById('producto-instrucciones').value.trim();
    
    // Actualizar item
    ordenActual.items[indexItemEditarInstr].instrucciones = instrucciones;
    
    // Actualizar UI
    actualizarOrdenUI();
    
    // Cerrar modal
    document.getElementById('modal-instrucciones').style.display = 'none';
    
    // Notificación
    mostrarNotificacion('Instrucciones guardadas', 'success');
  }
}

function calcularTotal() {
  // Calcular subtotal sumando todos los items
  ordenActual.subtotal = ordenActual.items.reduce((total, item) => total + item.subtotal, 0);
  
  // Obtener porcentaje de descuento
  const descuentoInput = document.getElementById('orden-descuento');
  ordenActual.descuento = parseFloat(descuentoInput.value) || 0;
  
  // Validar descuento (0-100%)
  if (ordenActual.descuento < 0) {
    ordenActual.descuento = 0;
    descuentoInput.value = 0;
  } else if (ordenActual.descuento > 100) {
    ordenActual.descuento = 100;
    descuentoInput.value = 100;
  }
  
  // Calcular total con descuento
  const descuentoMonto = ordenActual.subtotal * (ordenActual.descuento / 100);
  ordenActual.total = ordenActual.subtotal - descuentoMonto;
  
  // Actualizar UI
  document.getElementById('orden-subtotal').textContent = formatearMoneda(ordenActual.subtotal);
  document.getElementById('orden-total').textContent = formatearMoneda(ordenActual.total);
}

function confirmarLimpiarOrden() {
  if (ordenActual.items.length === 0) {
    return;
  }
  
  // Usar confirm nativo por simplicidad
  if (confirm('¿Estás seguro de que deseas limpiar la orden actual? Esta acción no se puede deshacer.')) {
    limpiarOrden();
  }
}

function limpiarOrden() {
  // Reiniciar orden
  ordenActual = {
    items: [],
    subtotal: 0,
    descuento: 0,
    total: 0,
    cliente: document.getElementById('cliente-nombre').value.trim(),
    mesa: document.getElementById('cliente-mesa').value,
    nota: document.getElementById('orden-nota').value.trim()
  };
  
  // Actualizar UI
  document.getElementById('orden-descuento').value = 0;
  actualizarOrdenUI();
  
  // Notificación
  mostrarNotificacion('Orden limpiada', 'info');
}

// Continuación del archivo add-order.js

async function crearOrden() {
  // Validar que haya productos
  if (ordenActual.items.length === 0) {
    mostrarNotificacion('No puedes crear una orden vacía', 'error');
    return;
  }
  
  // Mostrar cargando
  mostrarCargando(true);
  
  try {
    // Preparar datos de la orden
    const fechaActual = new Date();
    
    // Buscar el número de orden más alto del día
    const fechaInicio = obtenerFechaInicioDia();
    const fechaFin = obtenerFechaFinDia();
    
    let numeroOrden = 1;
    
    try {
      const ordenesHoyRef = await db.collection('ordenes')
        .where('fechaCreacion', '>=', fechaInicio)
        .where('fechaCreacion', '<=', fechaFin)
        .orderBy('fechaCreacion', 'desc')
        .get();
      
      if (!ordenesHoyRef.empty) {
        // Buscar el número de orden más alto
        ordenesHoyRef.forEach(doc => {
          const orden = doc.data();
          if (orden.numeroOrden && orden.numeroOrden >= numeroOrden) {
            numeroOrden = orden.numeroOrden + 1;
          }
        });
      }
    } catch (error) {
      console.error('Error al obtener número de orden:', error);
      // Continuar con número 1
    }
    
    // Datos de la orden
    const ordenData = {
      numeroOrden: numeroOrden,
      fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: firebase.firestore.FieldValue.serverTimestamp(),
      estado: 'activo', // activo, ordenado, cocinado, pagado, entregado
      productos: ordenActual.items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
        instrucciones: item.instrucciones || ''
      })),
      subtotal: ordenActual.subtotal,
      descuento: ordenActual.descuento,
      descuentoMonto: ordenActual.subtotal * (ordenActual.descuento / 100),
      total: ordenActual.total,
      cliente: ordenActual.cliente,
      mesa: ordenActual.mesa,
      nota: ordenActual.nota,
      creadoPor: firebase.auth().currentUser ? firebase.auth().currentUser.uid : null,
      nombreUsuario: firebase.auth().currentUser ? firebase.auth().currentUser.email : 'Desconocido'
    };
    
    // Guardar en Firestore
    const ordenRef = await db.collection('ordenes').add(ordenData);
    
    // Mostrar mensaje de éxito
    mostrarNotificacion(`Orden #${numeroOrden} creada correctamente`, 'success');
    
    // Ofrecer opciones
    if (confirm(`Orden #${numeroOrden} creada correctamente. ¿Deseas ir a la página de órdenes?`)) {
      window.location.href = 'orders.html';
    } else {
      // Limpiar orden para empezar una nueva
      limpiarOrden();
    }
    
  } catch (error) {
    console.error('Error al crear la orden:', error);
    mostrarNotificacion('Error al crear la orden. Por favor, intenta de nuevo.', 'error');
  } finally {
    mostrarCargando(false);
  }
}

// Funciones auxiliares (mantener compatibilidad con el código original)
function obtenerFechaInicioDia() {
  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0);
  return firebase.firestore.Timestamp.fromDate(ahora);
}

function obtenerFechaFinDia() {
  const ahora = new Date();
  ahora.setHours(23, 59, 59, 999);
  return firebase.firestore.Timestamp.fromDate(ahora);
}

// Función para verificar si estamos en modo móvil
function esModoMovil() {
  return window.innerWidth <= 768;
}

// Escuchar cambios en el tamaño de la ventana
window.addEventListener('resize', function() {
  const esMovil = esModoMovil();
  
  // Mostrar/ocultar tabs según corresponda
  const tabsContainer = document.querySelector('.tabs-container');
  tabsContainer.style.display = esMovil ? 'flex' : 'none';

  // --- quitar panel de categorias en la tab orden
  const panelCategorias = document.querySelector('.panel-categorias');
  panelCategorias.style.display = esMovil ? 'flex' : 'none';
  
  // Restablecer layout en modo escritorio
  if (!esMovil) {
    document.getElementById('productos-tab').style.display = 'block';
    document.getElementById('orden-tab').style.display = 'block';

    // --- mostrar panel de categorias en tab orden
    document.querySelector('.panel-categorias').style.display = 'flex';
  } else {
    // En modo móvil, mostrar solo la tab activa
    const tabActiva = document.querySelector('.tab-btn.active').getAttribute('data-tab');

    // --- mostrar panel de categorias en tab orden
    if (tabActiva === 'orden-tab') {
    document.querySelector('.panel-categorias').style.display = 'none'
    } else {
      document.querySelector('.panel-categorias').style.display = 'flex'
    };

    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = content.id === tabActiva ? 'block' : 'none';
    });
  }
});

// Comprobación inicial del modo
document.addEventListener('DOMContentLoaded', function() {
  // Verificar modo móvil al cargar
  const esMovil = esModoMovil();
  
  // Configurar UI según el modo
  const tabsContainer = document.querySelector('.tabs-container');
  tabsContainer.style.display = esMovil ? 'flex' : 'none';

  // --- quitar panel de categorias en la tab orden
  const panelCategorias = document.querySelector('.panel-categorias');
  panelCategorias.style.display = esMovil ? 'flex' : 'none';
  
  if (esMovil) {
    // En modo móvil, mostrar solo la primera tab
    document.getElementById('productos-tab').style.display = 'block';
    document.getElementById('orden-tab').style.display = 'none';
  } else {
    // En modo escritorio, mostrar ambos paneles
    document.getElementById('productos-tab').style.display = 'block';
    document.getElementById('orden-tab').style.display = 'block';
    document.querySelector('.panel-categorias').style.display = 'flex';
  }
});