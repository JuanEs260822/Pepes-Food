// products.js - Lógica para la página de gestión de productos

// Variables globales
let productosData = [];
let productoActual = null;
const productosPerPage = 10;
let paginaActual = 1;
let totalPaginas = 1;
let filtroCategoria = '';
let busquedaTexto = '';
let ordenActual = 'nombre';
let ordenDireccion = 'asc';

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
  ],
  'suministros': [
    { id: 'harina', nombre: 'Harina' },
    { id: 'huevo', nombre: 'Huevo' },
    { id: 'aceite', nombre: 'Aceite' },
    { id: 'platos', nombre: 'Platos' },
    { id: 'cucharas', nombre: 'Cucharas' },
    { id: 'para_llevar', nombre: 'Contenedores Para Llevar' }
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
    // ---
    agregarEstilosSelector();
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

  // --- sorting controls to the page
  //agregarControlesDeSorting();

  // --- reemplazar la input de imagen con un boton para abrir el seleccionador de imagenes (CHECAR SI ESTA OPCION SE PUEDE AÑADIR EN HTML DIRECTAMENTE)
  const imagenInput = document.getElementById('producto-imagen');
  const imagenContainer = imagenInput.parentElement;
  
  // Create a new button
  const selectorBtn = document.createElement('button');
  selectorBtn.type = 'button';
  selectorBtn.id = 'btn-seleccionar-imagen';
  selectorBtn.className = 'btn btn-secundario';
  selectorBtn.innerHTML = '<i class="fas fa-images"></i> Seleccionar Imagen';
  
  // Replace the file input with the button
  imagenContainer.replaceChild(selectorBtn, imagenInput);
  
  // Add event listener
  selectorBtn.addEventListener('click', abrirSelectorImagenes);
  //---
  
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
  //document.getElementById('producto-imagen').addEventListener('change', mostrarVistaPrevia);
  
  // Eventos para modal de confirmación
  document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModales);
  document.getElementById('btn-confirmar-eliminar').addEventListener('click', eliminarProductoConfirmado);
  
  // Cargar productos iniciales
  cargarProductos();
}

// --- AÑADIR ESTILOS AL SELECCIONADOR DE IMAGENES. CAMBIAR A CSS Y QUITAR DEL DOM ESTA FUNCION
function agregarEstilosSelector() {
  const style = document.createElement('style');
  style.textContent = `
    .imagenes-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    
    .imagen-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 5px;
      cursor: pointer;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .imagen-item:hover {
      transform: scale(1.03);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .imagen-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 3px;
    }
    
    .imagen-nombre {
      margin-top: 5px;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .upload-new {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 120px;
      background-color: #f7f7f7;
    }
    
    .upload-icon {
      font-size: 24px;
      color: #555;
      margin-bottom: 10px;
    }
  `;
  
  document.head.appendChild(style);
}

// --- Function to add sorting controls
/*function agregarControlesDeSorting() {
  // Create the sorting controls container
  const sortControls = document.createElement('div');
  sortControls.className = 'sorting-controls';
  sortControls.innerHTML = `
    <div class="sorting-label">Ordenar por:</div>
    <div class="sorting-options">
      <button class="sort-btn active" data-field="nombre">
        Nombre
        <i class="fas fa-sort-up sort-icon"></i>
      </button>
      <button class="sort-btn" data-field="precio">
        Precio
        <i class="fas fa-sort sort-icon"></i>
      </button>
      <button class="sort-btn" data-field="cantidad">
        Cantidad
        <i class="fas fa-sort sort-icon"></i>
      </button>
    </div>
  `;
  
  // Insert after filters but before products container
  const filtrosContainer = document.querySelector('.filtros-container');
  filtrosContainer.parentNode.insertBefore(sortControls, filtrosContainer.nextSibling);
  
  // Add event listeners to sorting buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const field = this.getAttribute('data-field');
      
      // Toggle direction if same field is clicked
      if (field === ordenActual) {
        ordenDireccion = ordenDireccion === 'asc' ? 'desc' : 'asc';
      } else {
        ordenActual = field;
        ordenDireccion = 'asc';
      }
      
      // Update active state and icons
      actualizarBotonesSorting();
      
      // Sort and render products
      ordenarProductos();
      renderizarProductos();
    });
  });
  
  // --- Add CSS for sorting controls ---AÑADIR A CSS 
  const style = document.createElement('style');
  style.textContent = `
    .sorting-controls {
      display: flex;
      align-items: center;
      margin: 20px 0;
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .sorting-label {
      font-weight: 500;
      margin-right: 15px;
    }
    
    .sorting-options {
      display: flex;
      gap: 10px;
    }
    
    .sort-btn {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .sort-btn:hover {
      background-color: #f0f0f0;
    }
    
    .sort-btn.active {
      background-color: #e7f3ff;
      border-color: #90caf9;
      font-weight: 500;
    }
    
    .sort-icon {
      margin-left: 6px;
      font-size: 12px;
    }
  `;
  document.head.appendChild(style);
} */

// --- Function to update sorting button states
/* function actualizarBotonesSorting() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    const field = btn.getAttribute('data-field');
    const icon = btn.querySelector('.sort-icon');
    
    // Update active state
    if (field === ordenActual) {
      btn.classList.add('active');
      // Update icon
      icon.className = ordenDireccion === 'asc' 
        ? 'fas fa-sort-up sort-icon' 
        : 'fas fa-sort-down sort-icon';
    } else {
      btn.classList.remove('active');
      icon.className = 'fas fa-sort sort-icon';
    }
  });
} */

// --- Function to sort products based on current sort settings
function ordenarProductos() {
  productosData.sort((a, b) => {
    let valorA, valorB;
    
    // Get values based on the field
    switch (ordenActual) {
      case 'nombre':
        valorA = a.nombre || '';
        valorB = b.nombre || '';
        break;
      case 'precio':
        valorA = parseFloat(a.precio || 0);
        valorB = parseFloat(b.precio || 0);
        break;
      case 'cantidad':
        valorA = parseInt(a.cantidad || 0, 10);
        valorB = parseInt(b.cantidad || 0, 10);
        break;
      default:
        valorA = a.nombre || '';
        valorB = b.nombre || '';
    }
    
    // Compare based on type
    let resultado;
    
    if (typeof valorA === 'string' && typeof valorB === 'string') {
      resultado = valorA.localeCompare(valorB, 'es', { sensitivity: 'base' });
    } else {
      resultado = valorA - valorB;
    }
    
    // Apply direction
    return ordenDireccion === 'asc' ? resultado : -resultado;
  });
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

    // --- Apply client-side sorting
    ordenarProductos();

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
        <th class="columna-ordenable ${ordenActual === 'nombre' ? 'ordenado-' + ordenDireccion : ''}" 
            data-campo="nombre">
          Nombre 
          ${ordenActual === 'nombre' ? 
            `<i class="fas fa-sort-${ordenDireccion === 'asc' ? 'up' : 'down'}"></i>` : 
            '<i class="fas fa-sort"></i>'}
        </th>
        <th>Categoría</th>
        <th class="columna-ordenable ${ordenActual === 'precio' ? 'ordenado-' + ordenDireccion : ''}" 
            data-campo="precio">
          Precio
          ${ordenActual === 'precio' ? 
            `<i class="fas fa-sort-${ordenDireccion === 'asc' ? 'up' : 'down'}"></i>` : 
            '<i class="fas fa-sort"></i>'}
        </th>
        <th>Disponible</th>
        <th class="columna-ordenable ${ordenActual === 'cantidad' ? 'ordenado-' + ordenDireccion : ''}" 
            data-campo="cantidad">
          Cantidad
          ${ordenActual === 'cantidad' ? 
            `<i class="fas fa-sort-${ordenDireccion === 'asc' ? 'up' : 'down'}"></i>` : 
            '<i class="fas fa-sort"></i>'}
        </th>
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
      case 'suministros':
        categoriaTexto = 'Suministros';
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
        <td>${producto.cantidad || 0}</td>
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

  // --- cambiar esto a css --- Add CSS for sortable columns
  if (!document.getElementById('sorting-table-styles')) {
    const style = document.createElement('style');
    style.id = 'sorting-table-styles';
    style.textContent = `
      .columna-ordenable {
        cursor: pointer;
        position: relative;
        padding-right: 20px !important;
      }
      
      .columna-ordenable i {
        position: absolute;
        right: 5px;
        font-size: 12px;
      }
      
      .columna-ordenable:hover {
        background-color: #f5f5f5;
      }
      
      .ordenado-asc, .ordenado-desc {
        background-color: #e7f3ff;
      }
    `;
    document.head.appendChild(style);
  }
  
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

  // --- Add events to sortable column headers
  document.querySelectorAll('.columna-ordenable').forEach(col => {
    col.addEventListener('click', function() {
      const campo = this.getAttribute('data-campo');
      
      // --- Toggle direction if same field
      if (campo === ordenActual) {
        ordenDireccion = ordenDireccion === 'asc' ? 'desc' : 'asc';
      } else {
        ordenActual = campo;
        ordenDireccion = 'asc';
      }
      
      // --- Update sorting buttons state
      //actualizarBotonesSorting();
      
      // --- Sort and re-render
      ordenarProductos();
      renderizarProductos();
      renderizarPaginacion();
    });
  });
}

// --- modal para seleccionar imagenes
function abrirSelectorImagenes() {
  // Create a modal for the image selector if it doesn't exist
  let selectorModal = document.getElementById('modal-selector-imagenes');
  if (!selectorModal) {
    selectorModal = document.createElement('div');
    selectorModal.id = 'modal-selector-imagenes';
    selectorModal.className = 'modal';
    
    selectorModal.innerHTML = `
      <div class="modal-contenido">
        <span class="cerrar-modal">&times;</span>
        <h2>Seleccionar Imagen</h2>
        <div id="imagenes-grid" class="imagenes-grid">
          <p class="cargando-mensaje">Cargando imágenes...</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(selectorModal);
    
    // Add closing functionality
    selectorModal.querySelector('.cerrar-modal').addEventListener('click', () => {
      selectorModal.style.display = 'none';
    });
  }
  
  // Show the modal
  selectorModal.style.display = 'block';
  
  // Load available images
  cargarImagenesDisponibles();
}

// --- cargar imagenes disponibles MODIFICAR ESTA FUNCION PARA FUNCIONAMIENTO
function cargarImagenesDisponibles() {
  const imagenesContainer = document.getElementById('imagenes-grid');
  
  // In a real implementation, you would list directory contents
  // Since we can't do this directly in JavaScript, we'll simulate it with a predefined list
  // In a real app, you might use a server-side script or an API endpoint to list files
  
  const imagenesDisponibles = [
    { nombre: 'hamburguesa.jpg', ruta: 'images/productos/hamburguesa.jpg' },
    { nombre: 'pizza.jpg', ruta: 'images/productos/pizza.jpg' },
    { nombre: 'refresco.jpg', ruta: 'images/productos/refresco.jpg' },
    { nombre: 'papas.jpg', ruta: 'images/productos/papas.jpg' },
    { nombre: 'alitas.jpg', ruta: 'images/productos/alitas.jpg' },
    { nombre: 'hotdog.jpg', ruta: 'images/productos/hotdog.jpg' },
    { nombre: 'torta.jpg', ruta: 'images/productos/torta.jpg' },
    { nombre: 'agua.jpg', ruta: 'images/productos/agua.jpg' }
    // Add more images as needed
  ];
  
  // Generate the grid
  let html = '';
  
  imagenesDisponibles.forEach(imagen => {
    html += `
      <div class="imagen-item" data-ruta="${imagen.ruta}">
        <img src="${imagen.ruta}" alt="${imagen.nombre}">
        <div class="imagen-nombre">${imagen.nombre}</div>
      </div>
    `;
  });
  
  // Add option to upload new image
  html += `
    <div class="imagen-item upload-new">
      <div class="upload-icon">
        <i class="fas fa-upload"></i>
      </div>
      <div class="imagen-nombre">Subir nueva</div>
      <input type="file" id="upload-new-image" accept="image/*" style="display:none">
    </div>
  `;
  
  imagenesContainer.innerHTML = html;
  
  // Add click events
  document.querySelectorAll('.imagen-item:not(.upload-new)').forEach(item => {
    item.addEventListener('click', () => {
      const ruta = item.getAttribute('data-ruta');
      seleccionarImagen(ruta);
      document.getElementById('modal-selector-imagenes').style.display = 'none';
    });
  });
  
  // Handle new image upload
  const uploadNew = document.querySelector('.imagen-item.upload-new');
  const fileInput = document.getElementById('upload-new-image');
  
  uploadNew.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const nombreArchivo = file.name.toLowerCase();
    
    // In a real implementation, you would upload this file to your server
    // For this example, we'll simulate that it worked
    mostrarNotificacion(`Imagen ${nombreArchivo} subida correctamente`);
    document.getElementById('modal-selector-imagenes').style.display = 'none';
    
    // Update the preview with the "uploaded" image
    // In a real implementation, you would use the actual path where the file was saved
    const reader = new FileReader();
    reader.onload = function(e) {
      seleccionarImagen(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// --- seleccionar imagen y actualizar vista previa
function seleccionarImagen(rutaImagen) {
  const previewContainer = document.getElementById('imagen-preview');
  previewContainer.innerHTML = `<img src="${rutaImagen}" alt="Vista previa">`;
  
  // Store the selected image path
  let hiddenInput = document.getElementById('producto-imagen-ruta');
  if (!hiddenInput) {
    hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'producto-imagen-ruta';
    document.getElementById('form-producto').appendChild(hiddenInput);
  }
  hiddenInput.value = rutaImagen;
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
    
    // Get image path from hidden input
    const hiddenInput = document.getElementById('producto-imagen-ruta');
    const imagenURL = hiddenInput ? hiddenInput.value : null;
    
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
    
    // Add image URL if available
    if (imagenURL) {
      productoData.imagenURL = imagenURL;
    }
    
    // Si hay imagen nueva, subirla
    /*if (tieneImagenNueva) {
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
    } */
    
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