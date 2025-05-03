// add-order.js - Lógica para la página de crear orden

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

// Mapeo de subcategorías por categoría (el mismo que en products.js)
const subcategoriasPorCategoria = {
  'comida': [
    { id: 'tortas', nombre: 'Tortas' },
    { id: 'hamburguesas', nombre: 'Hamburguesas' },
    { id: 'pizzas', nombre: 'Pizzas' },
    { id: 'alitas', nombre: 'Alitas (boneless y tradicionales)' },
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
    { id: 'frituras', nombre: 'Sabritas y Cheetos' },
    { id: 'pringles', nombre: 'Pringles (chicas y grandes)' },
    { id: 'barras', nombre: 'Barras de arroz inflado (varios sabores)' },
    { id: 'galletas', nombre: 'Galletas grandes y chicas (gran variedad)' },
    { id: 'gomitas', nombre: 'Gomitas (variedad de sabores)' }
  ],
  'bebidas': [
    { id: 'refresco_botella', nombre: 'Refrescos embotellados (varios tamaños)' },
    { id: 'refresco_lata', nombre: 'Refrescos en lata' },
    { id: 'agua', nombre: 'Agua embotellada' },
    { id: 'agua_sabor', nombre: 'Aguas saborizadas' },
    { id: 'cerveza', nombre: 'Cervezas (lata, botella de vidrio y caguamas)' },
    { id: 'micheladas', nombre: 'New Mix, micheladas grandes y chicas con sabor "azulito"' },
    { id: 'jugos', nombre: 'Jugos en lata y botella de vidrio' },
    { id: 'energeticas', nombre: 'Bebidas energéticas' },
    { id: 'malteadas', nombre: 'Malteadas (grandes y chicas)' },
    { id: 'frappe', nombre: 'Bebidas frías' },
    { id: 'raspados', nombre: 'Raspados (grandes y chicos)' }
  ]
};

// Variables para el modal de cantidad
let productoSeleccionado = null;
let indexItemEditar = -1;

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
  document.querySelectorAll('.categoria-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Actualizar UI
      document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('active'));
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
  
  document.getElementById('orden-nota').addEventListener('input', function() {
    ordenActual.nota = this.value.trim();
  });
  
  // Botón para limpiar orden
  document.getElementById('btn-limpiar-orden').addEventListener('click', confirmarLimpiarOrden);
  
  // Botón para crear orden
  document.getElementById('btn-crear-orden').addEventListener('click', crearOrden);
  
  // Eventos para el modal de cantidad
  document.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
  
  document.getElementById('btn-reducir').addEventListener('click', function() {
    const input = document.getElementById('producto-cantidad');
    const valor = parseInt(input.value) - 1;
    if (valor >= 1) {
      input.value = valor;
    }
  });
  
  document.getElementById('btn-aumentar').addEventListener('click', function() {
    const input = document.getElementById('producto-cantidad');
    const valor = parseInt(input.value) + 1;
    if (valor <= 99) {
      input.value = valor;
    }
  });
  
  document.getElementById('btn-agregar-producto').addEventListener('click', agregarProductoAOrden);
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
  if (filtroCategoria === 'todos') {
    container.style.display = 'none';
    return;
  }
  
  // Mostrar container
  container.style.display = 'flex';
  
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
        abrirModalCantidad(producto);
      }
    });
  });
}

function abrirModalCantidad(producto, editar = false, index = -1) {
  // Guardar referencia al producto
  productoSeleccionado = producto;
  indexItemEditar = editar ? index : -1;
  
  // Actualizar título del modal
  document.getElementById('modal-producto-nombre').textContent = producto.nombre;
  
  // Establecer cantidad por defecto
  let cantidad = 1;
  
  // Si estamos editando, usar la cantidad existente
  if (editar && index >= 0 && index < ordenActual.items.length) {
    cantidad = ordenActual.items[index].cantidad;
  }
  
  document.getElementById('producto-cantidad').value = cantidad;
  
  // Actualizar texto del botón
  document.getElementById('btn-agregar-producto').textContent = editar ? 'Actualizar' : 'Agregar';
  
  // Mostrar modal
  document.getElementById('modal-cantidad').style.display = 'block';
}

function cerrarModal() {
  document.getElementById('modal-cantidad').style.display = 'none';
}

function agregarProductoAOrden() {
  if (!productoSeleccionado) return;
  
  // Obtener cantidad
  const cantidadInput = document.getElementById('producto-cantidad');
  const cantidad = parseInt(cantidadInput.value) || 1;
  
  // Validar cantidad
  if (cantidad < 1 || cantidad > 99) {
    mostrarNotificacion('La cantidad debe estar entre 1 y 99', 'error');
    return;
  }
  
  // Preparar item
  const item = {
    id: productoSeleccionado.id,
    nombre: productoSeleccionado.nombre,
    precio: productoSeleccionado.precio || 0,
    cantidad: cantidad,
    subtotal: (productoSeleccionado.precio || 0) * cantidad
  };
  
  // Si estamos editando, actualizar item existente
  if (indexItemEditar >= 0 && indexItemEditar < ordenActual.items.length) {
    ordenActual.items[indexItemEditar] = item;
  } else {
    // Verificar si el producto ya está en la orden
    const itemExistente = ordenActual.items.findIndex(i => i.id === item.id);
    
    if (itemExistente >= 0) {
      // Actualizar cantidad y subtotal
      ordenActual.items[itemExistente].cantidad += cantidad;
      ordenActual.items[itemExistente].subtotal = 
        ordenActual.items[itemExistente].precio * ordenActual.items[itemExistente].cantidad;
    } else {
      // Agregar nuevo item
      ordenActual.items.push(item);
    }
  }
  
  // Actualizar UI
  actualizarOrdenUI();
  
  // Cerrar modal
  cerrarModal();
  
  // Notificación
  mostrarNotificacion('Producto agregado a la orden', 'success');
}

function actualizarOrdenUI() {
  const container = document.getElementById('orden-items');
  
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
    html += `
      <div class="orden-item">
        <div class="orden-item-cantidad">${item.cantidad}x</div>
        <div class="orden-item-info">
          <div class="orden-item-nombre">${item.nombre}</div>
          <div class="orden-item-precio">${formatearMoneda(item.precio)} c/u</div>
        </div>
        <div class="orden-item-total">${formatearMoneda(item.subtotal)}</div>
        <div class="orden-item-acciones">
          <button class="orden-item-btn btn-editar" data-index="${index}" title="Editar">
            <i class="fas fa-edit"></i>
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
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        const item = ordenActual.items[index];
        
        // Buscar producto completo
        const producto = productosData.find(p => p.id === item.id);
        
        if (producto) {
          abrirModalCantidad(producto, true, index);
        }
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
        subtotal: item.subtotal
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