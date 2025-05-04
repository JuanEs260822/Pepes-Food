// products.js - Lógica para la página de gestión de productos

// Variables globales
let productosData = [];
let productoActual = null;
const productosPerPage = 10;
let paginaActual = 1;
let totalPaginas = 1;
let filtroCategoria = '';
let busquedaTexto = '';

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
  // Configurar eventos de filtros
  document.getElementById('filtro-categoria').addEventListener('change', function() {
    filtroCategoria = this.value;
    paginaActual = 1;
    cargarProductos();
  });
  
  document.getElementById('busqueda').addEventListener('input', function() {
    busquedaTexto = this.value.toLowerCase().trim();
    paginaActual = 1;
    cargarProductos();
  });
  
  // Botón para agregar nuevo producto
  document.getElementById('btn-agregar-producto').addEventListener('click', abrirModalAgregarProducto);
  
  // Eventos para el modal
  document.querySelectorAll('.cerrar-modal').forEach(elem => {
    elem.addEventListener('click', cerrarModales);
  });
  
  document.getElementById('btn-cancelar').addEventListener('click', cerrarModales);
  
  // Evento para categoría que actualiza subcategorías
  document.getElementById('producto-categoria').addEventListener('change', actualizarSubcategorias);
  
  // Formulario para guardar producto
  document.getElementById('form-producto').addEventListener('submit', guardarProducto);
  
  // Vista previa de imagen
  document.getElementById('producto-imagen').addEventListener('change', mostrarVistaPrevia);
  
  // Eventos para modal de confirmación
  document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModales);
  document.getElementById('btn-confirmar-eliminar').addEventListener('click', eliminarProductoConfirmado);
  
  // Cargar productos iniciales
  cargarProductos();
}

async function cargarProductos() {
  mostrarCargando(true);
  
  try {
    let productosRef = db.collection('productos');
    let productosSnap;
    
    // Aplicar filtros si los hay
    if (filtroCategoria) {
      productosRef = productosRef.where('categoria', '==', filtroCategoria);
    }
    
    // Ordenar por nombre y obtener
    productosSnap = await productosRef.orderBy('nombre').get();
    
    // Convertir datos
    productosData = [];
    productosSnap.forEach(doc => {
      const producto = {
        id: doc.id,
        ...doc.data()
      };
      
      // Filtrar por texto de búsqueda si existe
      if (busquedaTexto) {
        const nombreMatch = producto.nombre && producto.nombre.toLowerCase().includes(busquedaTexto);
        const descripcionMatch = producto.descripcion && producto.descripcion.toLowerCase().includes(busquedaTexto);
        
        if (nombreMatch || descripcionMatch) {
          productosData.push(producto);
        }
      } else {
        productosData.push(producto);
      }
    });
    
    // Calcular paginación
    totalPaginas = Math.ceil(productosData.length / productosPerPage);
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      paginaActual = totalPaginas;
    }
    
    renderizarProductos();
    renderizarPaginacion();
    
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarNotificacion('Error al cargar los productos. Por favor, intenta de nuevo.', 'error');
  } finally {
    mostrarCargando(false);
  }
}

function renderizarProductos() {
  const container = document.getElementById('productos-container');
  
  // Si no hay productos
  if (productosData.length === 0) {
    container.innerHTML = `
      <div class="no-resultados">
        <i class="fas fa-search fa-2x"></i>
        <p>No se encontraron productos. Intenta con otros filtros o agrega un nuevo producto.</p>
      </div>
    `;
    return;
  }
  
  // Calcular productos de la página actual
  const inicio = (paginaActual - 1) * productosPerPage;
  const fin = Math.min(inicio + productosPerPage, productosData.length);
  const productosActuales = productosData.slice(inicio, fin);
  
  // Crear tabla
  let html = `
    <table class="tabla productos-tabla">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Disponible</th>
          <th>Cantidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Generar filas
  productosActuales.forEach(producto => {
    // Formatear categoría para mostrar
    let categoriaTexto = '';
    switch (producto.categoria) {
      case 'comida':
        categoriaTexto = 'Comida';
        break;
      case 'snacks':
        categoriaTexto = 'Snacks';
        break;
      case 'bebidas':
        categoriaTexto = 'Bebidas';
        break;
      default:
        categoriaTexto = producto.categoria || 'Sin categoría';
    }
    
    // Formatear precio
    const precioFormateado = formatearMoneda(producto.precio || 0);
    
    // Crear elemento de disponibilidad
    const disponibleHTML = producto.disponible !== false ? 
      `<span class="disponibilidad"><span class="indicador disponible"></span> Sí</span>` :
      `<span class="disponibilidad"><span class="indicador no-disponible"></span> No</span>`;
    
    // Imagen o placeholder
    let imagenHTML = '';
    if (producto.imagenURL) {
      imagenHTML = `<img src="${producto.imagenURL}" alt="${producto.nombre}" class="producto-imagen">`;
    } else {
      imagenHTML = `<div class="imagen-placeholder"><i class="fas fa-image"></i></div>`;
    }
    
    // Agregar fila
    html += `
      <tr data-id="${producto.id}">
        <td>${imagenHTML}</td>
        <td class="texto-truncado">${producto.nombre}</td>
        <td>${categoriaTexto}${producto.subcategoria ? ' - ' + obtenerNombreSubcategoria(producto.categoria, producto.subcategoria) : ''}</td>
        <td>${precioFormateado}</td>
        <td>${disponibleHTML}</td>
        <td>${producto.cantidad}</td>
        <td class="acciones">
          <button class="btn-accion editar" data-id="${producto.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-accion eliminar" data-id="${producto.id}" title="Eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  // Insertar en el contenedor
  container.innerHTML = html;
  
  // Agregar eventos a los botones
  document.querySelectorAll('.btn-accion.editar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      abrirModalEditarProducto(id);
    });
  });
  
  document.querySelectorAll('.btn-accion.eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      confirmarEliminarProducto(id);
    });
  });
}

function renderizarPaginacion() {
  const paginacion = document.getElementById('paginacion');
  
  if (totalPaginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Botón de página anterior
  if (paginaActual > 1) {
    html += `<button class="pagina-btn" data-page="${paginaActual - 1}">Anterior</button>`;
  }
  
  // Números de página
  const paginasMostrar = 5; // Cantidad de páginas a mostrar
  let inicio = Math.max(1, paginaActual - Math.floor(paginasMostrar / 2));
  let fin = Math.min(totalPaginas, inicio + paginasMostrar - 1);
  
  // Ajustar inicio si estamos cerca del final
  if (fin === totalPaginas) {
    inicio = Math.max(1, fin - paginasMostrar + 1);
  }
  
  // Primera página
  if (inicio > 1) {
    html += `<button class="pagina-btn" data-page="1">1</button>`;
    if (inicio > 2) {
      html += `<span class="pagina-ellipsis">...</span>`;
    }
  }
  
  // Páginas numeradas
  for (let i = inicio; i <= fin; i++) {
    const claseActiva = i === paginaActual ? 'active' : '';
    html += `<button class="pagina-btn ${claseActiva}" data-page="${i}">${i}</button>`;
  }
  
  // Última página
  if (fin < totalPaginas) {
    if (fin < totalPaginas - 1) {
      html += `<span class="pagina-ellipsis">...</span>`;
    }
    html += `<button class="pagina-btn" data-page="${totalPaginas}">${totalPaginas}</button>`;
  }
  
  // Botón de página siguiente
  if (paginaActual < totalPaginas) {
    html += `<button class="pagina-btn" data-page="${paginaActual + 1}">Siguiente</button>`;
  }
  
  paginacion.innerHTML = html;
  
  // Agregar eventos a los botones de paginación
  document.querySelectorAll('.pagina-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const page = parseInt(this.getAttribute('data-page'));
      paginaActual = page;
      renderizarProductos();
      renderizarPaginacion();
      
      // Scroll al inicio de la tabla
      document.getElementById('productos-container').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Funciones para el modal de producto
function abrirModalAgregarProducto() {
  // Resetear formulario
  document.getElementById('form-producto').reset();
  document.getElementById('modal-titulo').textContent = 'Nuevo Producto';
  
  // Limpiar vista previa de imagen
  const previewContainer = document.getElementById('imagen-preview');
  previewContainer.innerHTML = '<div class="imagen-preview-placeholder">Vista previa de imagen</div>';
  
  // Resetear subcategorías
  document.getElementById('producto-subcategoria').innerHTML = '<option value="">Seleccionar subcategoría</option>';
  
  // Mostrar modal
  document.getElementById('modal-producto').style.display = 'block';
  
  // Reiniciar productoActual
  productoActual = null;
}

async function abrirModalEditarProducto(id) {
  // Buscar producto
  const producto = productosData.find(p => p.id === id);
  if (!producto) {
    mostrarNotificacion('No se encontró el producto', 'error');
    return;
  }
  
  // Guardar referencia
  productoActual = producto;
  
  // Actualizar título
  document.getElementById('modal-titulo').textContent = 'Editar Producto';
  
  // Rellenar formulario
  document.getElementById('producto-nombre').value = producto.nombre || '';
  document.getElementById('producto-categoria').value = producto.categoria || '';
  actualizarSubcategorias();
  document.getElementById('producto-subcategoria').value = producto.subcategoria || '';
  document.getElementById('producto-precio').value = producto.precio || '';
  document.getElementById('producto-cantidad').value = producto.cantidad || '';
  document.getElementById('producto-descripcion').value = producto.descripcion || '';
  document.getElementById('producto-disponible').value = producto.disponible === false ? 'false' : 'true';
  
  // Vista previa de imagen
  const previewContainer = document.getElementById('imagen-preview');
  if (producto.imagenURL) {
    previewContainer.innerHTML = `<img src="${producto.imagenURL}" alt="${producto.nombre}">`;
  } else {
    previewContainer.innerHTML = '<div class="imagen-preview-placeholder">No hay imagen</div>';
  }
  
  // Mostrar modal
  document.getElementById('modal-producto').style.display = 'block';
}

function cerrarModales() {
  // Cerrar todos los modales
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

function actualizarSubcategorias() {
  const categoriaSelect = document.getElementById('producto-categoria');
  const subcategoriaSelect = document.getElementById('producto-subcategoria');
  const categoriaSeleccionada = categoriaSelect.value;
  
  // Limpiar opciones actuales
  subcategoriaSelect.innerHTML = '<option value="">Seleccionar subcategoría</option>';
  
  // Si no hay categoría seleccionada, ocultar el contenedor
  const subcategoriaContainer = document.getElementById('subcategoria-container');
  
  if (!categoriaSeleccionada) {
    subcategoriaContainer.style.display = 'none';
    return;
  }
  
  // Mostrar contenedor
  subcategoriaContainer.style.display = 'block';
  
  // Obtener subcategorías correspondientes
  const subcategorias = subcategoriasPorCategoria[categoriaSeleccionada] || [];
  
  // Agregar opciones
  subcategorias.forEach(subcategoria => {
    const option = document.createElement('option');
    option.value = subcategoria.id;
    option.textContent = subcategoria.nombre;
    subcategoriaSelect.appendChild(option);
  });
}

function mostrarVistaPrevia(event) {
  const file = event.target.files[0];
  const previewContainer = document.getElementById('imagen-preview');
  
  if (!file) {
    previewContainer.innerHTML = '<div class="imagen-preview-placeholder">Vista previa de imagen</div>';
    return;
  }
  
  // Verificar tipo de archivo
  if (!file.type.match('image.*')) {
    mostrarNotificacion('El archivo seleccionado no es una imagen', 'error');
    previewContainer.innerHTML = '<div class="imagen-preview-placeholder">Vista previa de imagen</div>';
    event.target.value = '';
    return;
  }
  
  // Mostrar vista previa
  const reader = new FileReader();
  reader.onload = function(e) {
    previewContainer.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
  };
  reader.readAsDataURL(file);
}

async function guardarProducto(event) {
  event.preventDefault();
  
  // Validar campos
  if (!validarCamposObligatorios(['producto-nombre', 'producto-categoria', 'producto-precio'])) {
    return;
  }
  
  mostrarCargando(true);
  
  try {
    // Recopilar datos del formulario
    const form = document.getElementById('form-producto');
    const nombre = document.getElementById('producto-nombre').value.trim();
    const categoria = document.getElementById('producto-categoria').value;
    const subcategoria = document.getElementById('producto-subcategoria').value;
    const precio = parseFloat(document.getElementById('producto-precio').value);
    const cantidad = document.getElementById('producto-cantidad').value;
    const descripcion = document.getElementById('producto-descripcion').value.trim();
    const disponible = document.getElementById('producto-disponible').value === 'true';
    
    // Comprobar si hay una nueva imagen
    const imagenInput = document.getElementById('producto-imagen');
    const tieneImagenNueva = imagenInput.files.length > 0;
    
    // Datos para guardar
    const productoData = {
      nombre,
      categoria,
      subcategoria: subcategoria || null,
      precio,
      cantidad,
      descripcion,
      disponible,
      fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    let imagenURL = null;
    
    // Si hay imagen nueva, subirla
    if (tieneImagenNueva) {
      const file = imagenInput.files[0];
      const storageRef = firebase.storage().ref();
      
      // Crear referencia única para la imagen
      const nombreArchivo = `productos/${Date.now()}_${file.name}`;
      const fileRef = storageRef.child(nombreArchivo);
      
      // Subir archivo
      await fileRef.put(file);
      
      // Obtener URL
      imagenURL = await fileRef.getDownloadURL();
      productoData.imagenURL = imagenURL;
    }
    
    // Guardar en Firestore
    if (productoActual) {
      // Actualizar producto existente
      await db.collection('productos').doc(productoActual.id).update(productoData);
      mostrarNotificacion('Producto actualizado correctamente');
    } else {
      // Agregar nuevo producto
      productoData.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('productos').add(productoData);
      mostrarNotificacion('Producto agregado correctamente');
    }
    
    // Cerrar modal y recargar productos
    cerrarModales();
    cargarProductos();
    
  } catch (error) {
    console.error('Error al guardar producto:', error);
    mostrarNotificacion('Error al guardar el producto. Inténtalo de nuevo.', 'error');
  } finally {
    mostrarCargando(false);
  }
}

function confirmarEliminarProducto(id) {
  // Guardar ID del producto a eliminar
  productoActual = productosData.find(p => p.id === id);
  
  // Abrir modal de confirmación
  document.getElementById('modal-confirmar').style.display = 'block';
}

async function eliminarProductoConfirmado() {
  if (!productoActual) {
    mostrarNotificacion('No se encontró el producto a eliminar', 'error');
    cerrarModales();
    return;
  }
  
  mostrarCargando(true);
  
  try {
    // Eliminar imagen si existe
    if (productoActual.imagenURL) {
      try {
        // Extraer ruta de la URL de la imagen
        const url = new URL(productoActual.imagenURL);
        const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
        
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(path);
        
        await fileRef.delete();
      } catch (imageError) {
        console.warn('No se pudo eliminar la imagen:', imageError);
        // Continuar incluso si no se puede eliminar la imagen
      }
    }
    
    // Eliminar documento
    await db.collection('productos').doc(productoActual.id).delete();
    
    mostrarNotificacion('Producto eliminado correctamente');
    
    // Actualizar lista
    productosData = productosData.filter(p => p.id !== productoActual.id);
    
    // Recalcular paginación
    totalPaginas = Math.ceil(productosData.length / productosPerPage);
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      paginaActual = totalPaginas;
    }
    
    renderizarProductos();
    renderizarPaginacion();
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    mostrarNotificacion('Error al eliminar el producto. Inténtalo de nuevo.', 'error');
  } finally {
    cerrarModales();
    mostrarCargando(false);
  }
}

// Función auxiliar para obtener el nombre legible de una subcategoría
function obtenerNombreSubcategoria(categoria, subcategoriaId) {
  const subcategorias = subcategoriasPorCategoria[categoria] || [];
  const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
  return subcategoria ? subcategoria.nombre : subcategoriaId;
}