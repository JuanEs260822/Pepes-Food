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
    { id: 'tortas', nombre: 'Tortas', imagen: 'assets/images/subcategorias/torta.webp' },
    { id: 'hamburguesas', nombre: 'Hamburguesas', imagen: 'assets/images/subcategorias/hamburguesa.webp' },
    { id: 'pizzas', nombre: 'Pizzas', imagen: 'assets/images/subcategorias/pizza.webp' },
    { id: 'alitas', nombre: 'Alitas', imagen: 'assets/images/subcategorias/alitas.webp' },
    { id: 'boneless', nombre: 'Boneless', imagen: 'assets/images/subcategorias/boneless.webp' },
    { id: 'hotdogs', nombre: 'Hot Dogs', imagen: 'assets/images/subcategorias/hotdog.jpg' },
    { id: 'sincronizadas', nombre: 'Sincronizadas', imagen: 'assets/images/subcategorias/sincronizada.jpg' },
    { id: 'papasfritas', nombre: 'Papas Fritas', imagen: 'assets/images/subcategorias/papas.jpg' },
    { id: 'salchipapas', nombre: 'Salchipapas', imagen: 'assets/images/subcategorias/salchipapas.jpg' },
    { id: 'papotas', nombre: 'Papotas', imagen: 'assets/images/subcategorias/papotas.jpg' }
  ],
  'snacks': [
    { id: 'dorilocos', nombre: 'Dorilocos', imagen: 'assets/images/subcategorias/dorilocos.webp' },
    { id: 'doriesquites', nombre: 'Doriesquites', imagen: 'assets/images/subcategorias/doriesquites.jpg' },
    { id: 'esquites', nombre: 'Esquites', imagen: 'assets/images/subcategorias/esquites.jpg' },
    { id: 'frituras', nombre: 'Sabritas', imagen: 'assets/images/subcategorias/sabritas.jpg' },
    { id: 'pringles', nombre: 'Pringles', imagen: 'assets/images/subcategorias/pringles.jpg' },
    { id: 'barras', nombre: 'Barras', imagen: 'assets/images/subcategorias/barras.jpg' },
    { id: 'galletas', nombre: 'Galletas', imagen: 'assets/images/subcategorias/galletas.jpg' },
    { id: 'gomitas', nombre: 'Gomitas', imagen: 'assets/images/subcategorias/gomitas.jpg' }
  ],
  'bebidas': [
    { id: 'refresco_botella', nombre: 'Sodas-Botella', imagen: 'assets/images/subcategorias/refresco_botella.webp' },
    { id: 'refresco_lata', nombre: 'Sodas-Lata', imagen: 'assets/images/subcategorias/refresco_lata.jpg' },
    { id: 'agua', nombre: 'Agua-Botella', imagen: 'assets/images/subcategorias/agua.jpg' },
    { id: 'agua_sabor', nombre: 'Aguas-Frescas', imagen: 'assets/images/subcategorias/agua_fresca.jpg' },
    { id: 'cerveza', nombre: 'Cerveza', imagen: 'assets/images/subcategorias/cerveza.jpg' },
    { id: 'michelada', nombre: 'Michelada', imagen: 'assets/images/subcategorias/michelada.jpg' },
    { id: 'new_mix', nombre: 'New Mix', imagen: 'assets/images/subcategorias/new_mix.jpg' },
    { id: 'jugo_botella', nombre: 'Jugo-Botella', imagen: 'assets/images/subcategorias/jugo_botella.jpg' },
    { id: 'jugo_lata', nombre: 'Jugo-Lata', imagen: 'assets/images/subcategorias/jugo_lata.jpg' },
    { id: 'energeticas', nombre: 'Bebidas energéticas', imagen: 'assets/images/subcategorias/energeticas.jpg' },
    { id: 'malteadas', nombre: 'Malteadas', imagen: 'assets/images/subcategorias/malteada.jpg' },
    { id: 'frappe', nombre: 'Frappe', imagen: 'assets/images/subcategorias/frappe.jpg' },
    { id: 'raspados', nombre: 'Raspados', imagen: 'assets/images/subcategorias/raspado.jpg' }
  ]
};

// List of products with special instructions (ingredientes)
const productosConInstrucciones = [
  'hamburguesa_sencilla', 'hamburguesa_doble', 'hamburguesa_hawaiana', 
  'torta_jamon', 'torta_milanesa', 'pizza_pepperoni', 'pizza_hawaiana',
  'hotdog_sencillo', 'sincronizada_jamon', 'Qvypwj48HTUEBn1hbcxI'
];

// Catálogo de ingredientes por tipo de producto
const ingredientesPorProducto = {
  // Hamburguesas
  'hamburguesa_sencilla': [
    { id: 'lechuga', nombre: 'Lechuga', precio: 0, default: true },
    { id: 'tomate', nombre: 'Tomate', precio: 0, default: true },
    { id: 'cebolla', nombre: 'Cebolla', precio: 0, default: true },
    { id: 'pepinillos', nombre: 'Pepinillos', precio: 0, default: true },
    { id: 'queso', nombre: 'Queso extra', precio: 10, default: false },
    { id: 'tocino', nombre: 'Tocino', precio: 15, default: false },
    { id: 'champinones', nombre: 'Champiñones', precio: 12, default: false },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 8, default: false },
    { id: 'guacamole', nombre: 'Guacamole', precio: 15, default: false }
  ],
  'hamburguesa_doble': [
    { id: 'lechuga', nombre: 'Lechuga', precio: 0, default: true },
    { id: 'tomate', nombre: 'Tomate', precio: 0, default: true },
    { id: 'cebolla', nombre: 'Cebolla', precio: 0, default: true },
    { id: 'pepinillos', nombre: 'Pepinillos', precio: 0, default: true },
    { id: 'queso', nombre: 'Queso extra', precio: 10, default: false },
    { id: 'tocino', nombre: 'Tocino', precio: 15, default: true },
    { id: 'champinones', nombre: 'Champiñones', precio: 12, default: false },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 8, default: false },
    { id: 'guacamole', nombre: 'Guacamole', precio: 15, default: false }
  ],
  'hamburguesa_hawaiana': [
    { id: 'lechuga', nombre: 'Lechuga', precio: 0, default: true },
    { id: 'tomate', nombre: 'Tomate', precio: 0, default: true },
    { id: 'cebolla', nombre: 'Cebolla', precio: 0, default: true },
    { id: 'piña', nombre: 'Piña', precio: 0, default: true },
    { id: 'queso', nombre: 'Queso extra', precio: 10, default: false },
    { id: 'tocino', nombre: 'Tocino', precio: 15, default: false },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 8, default: false }
  ],
  
  // Tortas
  'torta_jamon': [
    { id: 'lechuga', nombre: 'Lechuga', precio: 0, default: true },
    { id: 'tomate', nombre: 'Tomate', precio: 0, default: true },
    { id: 'cebolla', nombre: 'Cebolla', precio: 0, default: true },
    { id: 'aguacate', nombre: 'Aguacate', precio: 10, default: true },
    { id: 'queso', nombre: 'Queso', precio: 10, default: true },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 5, default: false }
  ],
  'torta_milanesa': [
    { id: 'lechuga', nombre: 'Lechuga', precio: 0, default: true },
    { id: 'tomate', nombre: 'Tomate', precio: 0, default: true },
    { id: 'cebolla', nombre: 'Cebolla', precio: 0, default: true },
    { id: 'aguacate', nombre: 'Aguacate', precio: 10, default: true },
    { id: 'queso', nombre: 'Queso', precio: 10, default: true },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 5, default: false }
  ],
  
  // Pizzas
  'pizza_pepperoni': [
    { id: 'queso_extra', nombre: 'Queso extra', precio: 15, default: false },
    { id: 'champiñones', nombre: 'Champiñones', precio: 10, default: false },
    { id: 'pimiento', nombre: 'Pimiento', precio: 10, default: false },
    { id: 'cebolla', nombre: 'Cebolla', precio: 10, default: false },
    { id: 'aceitunas', nombre: 'Aceitunas', precio: 10, default: false },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 8, default: false }
  ],
  'pizza_hawaiana': [
    { id: 'queso_extra', nombre: 'Queso extra', precio: 15, default: false },
    { id: 'piña_extra', nombre: 'Piña extra', precio: 10, default: false },
    { id: 'jamón_extra', nombre: 'Jamón extra', precio: 15, default: false },
    { id: 'champiñones', nombre: 'Champiñones', precio: 10, default: false },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 8, default: false }
  ],
  
  // Hot Dogs
  'hotdog_sencillo': [
    { id: 'cebolla', nombre: 'Cebolla', precio: 0, default: true },
    { id: 'tomate', nombre: 'Tomate', precio: 0, default: true },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 5, default: false },
    { id: 'tocino', nombre: 'Tocino', precio: 15, default: false },
    { id: 'queso', nombre: 'Queso cheddar', precio: 10, default: false }
  ],
  
  // Sincronizadas
  'sincronizada_jamon': [
    { id: 'queso_extra', nombre: 'Queso extra', precio: 10, default: false },
    { id: 'champiñones', nombre: 'Champiñones', precio: 10, default: false },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 5, default: false }
  ],

  //ejemplo con dorilocos
  'Qvypwj48HTUEBn1hbcxI': [
    { id: 'lechuga', nombre: 'Lechuga', precio: 0, default: true },
    { id: 'tomate', nombre: 'Tomate', precio: 0, default: true },
    { id: 'cebolla', nombre: 'Cebolla', precio: 0, default: true },
    { id: 'pepinillos', nombre: 'Pepinillos', precio: 0, default: true },
    { id: 'queso', nombre: 'Queso extra', precio: 10, default: false },
    { id: 'tocino', nombre: 'Tocino', precio: 15, default: false },
    { id: 'champinones', nombre: 'Champiñones', precio: 12, default: false },
    { id: 'jalapeño', nombre: 'Jalapeño', precio: 8, default: false },
    { id: 'guacamole', nombre: 'Guacamole', precio: 15, default: false }
  ]
};

// Variables para la navegación entre categorías y subcategorías
let vistaActual = 'categorias'; // puede ser 'categorias', 'subcategorias', 'productos'
let categoriaActual = '';
let subcategoriaActual = '';
let ingredientesSeleccionados = [];

// Helper function to check if a product exists in static list or has ingredients in Firestore
async function checkProductoConIngredientes(productoId) {
  // Check static list first
  if (productosConInstrucciones.includes(productoId)) {
    return true;
  }
  
  // Then check in Firestore
  try {
    const productoDoc = await db.collection('productos').doc(productoId).get();
    if (productoDoc.exists) {
      const productoData = productoDoc.data();
      return productoData.tieneIngredientes === true;
    }
    return false;
  } catch (error) {
    console.error("Error checking if product has ingredients:", error);
    return false;
  }
}

// Función para verificar múltiples productos con ingredientes en una sola operación
async function verificarProductosConIngredientes(productosIds) {
  try {
    // Consulta por lotes para optimizar
    const productos = await db.collection('productos')
      .where(firebase.firestore.FieldPath.documentId(), 'in', productosIds)
      .where('tieneIngredientes', '==', true)
      .get();
    
    // Crear mapa de resultados
    const productosConIngs = {};
    productos.forEach(doc => {
      productosConIngs[doc.id] = true;
    });
    
    return productosConIngs;
  } catch (error) {
    console.error("Error verificando productos con ingredientes:", error);
    return {};
  }
}

// Función para verificar si un producto tiene ingredientes personalizables
async function tieneIngredientes(productoId) {
  // Verificar primero en la lista estática (para compatibilidad)
  if (ingredientesPorProducto.hasOwnProperty(productoId)) {
    return true;
  }
  
  // Verificar en Firebase si tiene ingredientes
  try {
    const productoRef = await db.collection('productos').doc(productoId).get();
    const producto = productoRef.data();
    return producto && producto.tieneIngredientes === true;
  } catch (error) {
    console.error("Error al verificar ingredientes del producto:", error);
    return false;
  }
}

// Función para obtener ingredientes de un producto
async function obtenerIngredientesProducto(productoId) {
  // Si existe en la lista estática, usar esos (para compatibilidad)
  if (ingredientesPorProducto.hasOwnProperty(productoId)) {
    return ingredientesPorProducto[productoId];
  }
  
  // Si no, buscar en Firebase
  try {
    const ingredientesRef = await db.collection('productos')
      .doc(productoId)
      .collection('ingredientes')
      .orderBy('nombre')
      .get();
    
    const ingredientes = [];
    ingredientesRef.forEach(doc => {
      ingredientes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return ingredientes;
  } catch (error) {
    console.error("Error al obtener ingredientes del producto:", error);
    return [];
  }
}

// Función modificada para abrir modal de edición de item
async function abrirModalEdicionItem(item, index) {
  productoSeleccionadoInstr = item;
  indexItemEditarInstr = index;
  
  // Actualizar título del modal
  document.getElementById('modal-producto-nombre-instr').textContent = item.nombre;
  
  // Verificar si el producto tiene ingredientes
  const tieneIngs = await tieneIngredientes(item.id);
  const seccionIngredientes = document.getElementById('ingredientes-seccion');
  const listaIngredientes = document.getElementById('ingredientes-lista');
  
  if (tieneIngs) {
    // Limpiar lista de ingredientes
    listaIngredientes.innerHTML = '';
    
    // Mostrar sección de ingredientes
    seccionIngredientes.style.display = 'block';
    
    // Reiniciar ingredientes seleccionados
    ingredientesSeleccionados = item.ingredientes || [];
    
    // Cargar ingredientes específicos del producto
    const ingredientesDisponibles = await obtenerIngredientesProducto(item.id);
    
    ingredientesDisponibles.forEach(ingrediente => {
      // Verificar si está seleccionado
      const estaSeleccionado = ingredientesSeleccionados.some(i => i.id === ingrediente.id);
      
      // Crear elemento para cada ingrediente
      const ingredienteItem = document.createElement('div');
      ingredienteItem.className = 'ingrediente-item';
      
      // Crear checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'ingrediente-checkbox';
      checkbox.id = 'ingrediente-' + ingrediente.id;
      checkbox.checked = estaSeleccionado;
      
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          // Agregar a seleccionados si no existe
          const yaExiste = ingredientesSeleccionados.some(i => i.id === ingrediente.id);
          if (!yaExiste) {
            ingredientesSeleccionados.push({
              id: ingrediente.id,
              nombre: ingrediente.nombre,
              precio: ingrediente.precio || 0
            });
          }
        } else {
          // Quitar de seleccionados
          const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
          if (index >= 0) {
            ingredientesSeleccionados.splice(index, 1);
          }
        }
        
        // Actualizar precio si hay ingredientes con costo adicional
        actualizarPrecioModal();
      });
      
      // Crear label para el nombre
      const nombre = document.createElement('label');
      nombre.htmlFor = 'ingrediente-' + ingrediente.id;
      nombre.className = 'ingrediente-nombre';
      nombre.textContent = ingrediente.nombre;
      
      // Elemento para el precio si tiene
      let precioElement = null;
      if (ingrediente.precio > 0) {
        precioElement = document.createElement('span');
        precioElement.className = 'ingrediente-precio';
        precioElement.textContent = '+ ' + formatearMoneda(ingrediente.precio || 0);
      }
      
      // Agregar elementos al item
      ingredienteItem.appendChild(checkbox);
      ingredienteItem.appendChild(nombre);
      if (precioElement) {
        ingredienteItem.appendChild(precioElement);
      }
      
      // Agregar a la lista
      listaIngredientes.appendChild(ingredienteItem);
    });
  } else {
    // Ocultar sección de ingredientes
    seccionIngredientes.style.display = 'none';
  }
  
  // Establecer instrucciones actuales
  document.getElementById('producto-instrucciones').value = item.instrucciones || '';
  
  // Cambiar texto del botón
  document.getElementById('btn-guardar-instrucciones').textContent = 'Actualizar';
  
  // Mostrar modal
  document.getElementById('modal-instrucciones').style.display = 'flex';
}

// Updated function to show subcategories as a grid
function mostrarSubcategoriasGrid() {
  const container = document.getElementById('productos-grid');
  const subcategorias = subcategoriasPorCategoria[categoriaActual] || [];
  
  // Ocultar el contenedor de subcategorías horizontal
  document.getElementById('subcategorias-container').style.display = 'none';
  
  // Limpiar el contenedor de productos
  container.innerHTML = '';
  
  // Crear tarjetas para cada subcategoría
  subcategorias.forEach(subcategoria => {
    // Verificar si hay una imagen, si no, usar placeholder
    let imagenHTML = '';
    if (subcategoria.imagen) {
      imagenHTML = `<img src="${subcategoria.imagen}" alt="${subcategoria.nombre}" loading="lazy">`;
    } else {
      imagenHTML = `<i class="fas fa-folder" style="font-size: 2rem; color: #ddd;"></i>`;
    }
    
    // Crear tarjeta de subcategoría
    const subcategoriaCard = document.createElement('div');
    subcategoriaCard.className = 'producto-card subcategoria-card';
    subcategoriaCard.setAttribute('data-subcategoria', subcategoria.id);
    subcategoriaCard.innerHTML = `
      <div class="producto-imagen">
        ${imagenHTML}
      </div>
      <div class="producto-info">
        <div class="producto-nombre">${subcategoria.nombre}</div>
      </div>
    `;
    
    // Evento al hacer clic en la subcategoría
    subcategoriaCard.addEventListener('click', function() {
      filtroSubcategoria = subcategoria.id;
      subcategoriaActual = subcategoria.id;
      vistaActual = 'productos';
      
      // Mostrar productos de esta subcategoría
      mostrarProductosDeSubcategoria();
    });
    
    container.appendChild(subcategoriaCard);
  });
}

// Nueva función para mostrar productos de una subcategoría específica
function mostrarProductosDeSubcategoria() {
  // Habilitar botón para volver a subcategorías
  mostrarBotonVolver();
  
  // Filtrar y mostrar productos
  filtrarProductos();
}

// Función para mostrar el botón de volver
function mostrarBotonVolver() {
  // Crear botón volver si no existe
  if (!document.getElementById('btn-volver')) {
    const volverBtn = document.createElement('button');
    volverBtn.id = 'btn-volver';
    volverBtn.className = 'btn-volver';
    volverBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a ' + 
      (categoriaActual === 'todos' ? 'categorías' : getCategoriaName(categoriaActual));
    
    volverBtn.addEventListener('click', function() {
      if (vistaActual === 'productos' && subcategoriaActual) {
        // Volver a la vista de subcategorías
        vistaActual = 'subcategorias';
        subcategoriaActual = '';
        filtroSubcategoria = '';
        mostrarSubcategoriasGrid();
        this.remove();
      }
    });
    
    // Insertar antes del grid de productos
    const productoContainer = document.querySelector('.productos-container');
    productoContainer.insertBefore(volverBtn, productoContainer.firstChild);
  }
}

// Función para obtener el nombre de la categoría
function getCategoriaName(categoria) {
  const categorias = {
    'comida': 'Comida',
    'snacks': 'Snacks',
    'bebidas': 'Bebidas'
  };
  return categorias[categoria] || 'Categorías';
}

// Función modificada para abrir modal de instrucciones
async function abrirModalProductoInstrucciones(producto) {
  productoSeleccionadoInstr = producto;
  indexItemEditarInstr = -1; // -1 indica que es un nuevo producto, no una edición
  
  // Actualizar título del modal
  document.getElementById('modal-producto-nombre-instr').textContent = producto.nombre;
  
  // Reiniciar ingredientes
  ingredientesSeleccionados = [];
  
  // Verificar si el producto tiene ingredientes
  const tieneIngs = await tieneIngredientes(producto.id);
  const seccionIngredientes = document.getElementById('ingredientes-seccion');
  const listaIngredientes = document.getElementById('ingredientes-lista');
  
  if (tieneIngs) {
    // Limpiar lista de ingredientes
    listaIngredientes.innerHTML = '';
    
    // Mostrar sección de ingredientes
    seccionIngredientes.style.display = 'block';
    
    // Cargar ingredientes específicos del producto
    const ingredientes = await obtenerIngredientesProducto(producto.id);
    
    ingredientes.forEach(ingrediente => {
      // Crear elemento para cada ingrediente
      const ingredienteItem = document.createElement('div');
      ingredienteItem.className = 'ingrediente-item';
      
      // Crear checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'ingrediente-checkbox';
      checkbox.id = 'ingrediente-' + ingrediente.id;
      checkbox.checked = ingrediente.default;
      
      // Si está marcado por defecto, agregarlo a la lista
      if (ingrediente.default) {
        ingredientesSeleccionados.push({
          id: ingrediente.id,
          nombre: ingrediente.nombre,
          precio: ingrediente.precio || 0
        });
      }
      
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          // Agregar a seleccionados
          ingredientesSeleccionados.push({
            id: ingrediente.id,
            nombre: ingrediente.nombre,
            precio: ingrediente.precio || 0
          });
        } else {
          // Quitar de seleccionados
          const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
          if (index >= 0) {
            ingredientesSeleccionados.splice(index, 1);
          }
        }
        
        // Actualizar precio si hay ingredientes con costo adicional
        actualizarPrecioModal();
      });
      
      // Crear label para el nombre
      const nombre = document.createElement('label');
      nombre.htmlFor = 'ingrediente-' + ingrediente.id;
      nombre.className = 'ingrediente-nombre';
      nombre.textContent = ingrediente.nombre;
      
      // Elemento para el precio si tiene
      let precioElement = null;
      if (ingrediente.precio > 0) {
        precioElement = document.createElement('span');
        precioElement.className = 'ingrediente-precio';
        precioElement.textContent = '+ ' + formatearMoneda(ingrediente.precio || 0);
      }
      
      // Agregar elementos al item
      ingredienteItem.appendChild(checkbox);
      ingredienteItem.appendChild(nombre);
      if (precioElement) {
        ingredienteItem.appendChild(precioElement);
      }
      
      // Agregar a la lista
      listaIngredientes.appendChild(ingredienteItem);
    });
  } else {
    // Ocultar sección de ingredientes
    seccionIngredientes.style.display = 'none';
  }
  
  // Limpiar instrucciones anteriores
  document.getElementById('producto-instrucciones').value = '';
  
  // Mostrar modal
  document.getElementById('modal-instrucciones').style.display = 'flex';
  
  // Cambiar el texto del botón
  document.getElementById('btn-guardar-instrucciones').textContent = 'Agregar a la orden';
}

// Función para actualizar el precio en el modal basado en los ingredientes seleccionados
function actualizarPrecioModal() {
  if (!productoSeleccionadoInstr) return;
  
  // Calcular precio adicional
  const precioAdicional = ingredientesSeleccionados.reduce((total, ingrediente) => {
    return total + (ingrediente.precio || 0);
  }, 0);
  
  // Actualizar texto del botón si hay precio adicional
  const botonGuardar = document.getElementById('btn-guardar-instrucciones');
  
  if (precioAdicional > 0) {
    const precioTotal = (productoSeleccionadoInstr.precio || 0) + precioAdicional;
    botonGuardar.textContent = indexItemEditarInstr >= 0 ? 
      `Actualizar (${formatearMoneda(precioTotal)})` : 
      `Agregar (${formatearMoneda(precioTotal)})`;
  } else {
    botonGuardar.textContent = indexItemEditarInstr >= 0 ? 
      'Actualizar' : 
      'Agregar a la orden';
  }
}

// Modal mejorado para editar instrucciones de productos ya en la orden
function abrirModalEdicionItem(item, index) {
  productoSeleccionadoInstr = item;
  indexItemEditarInstr = index;
  
  // Actualizar título del modal
  document.getElementById('modal-producto-nombre-instr').textContent = item.nombre;
  
  // Verificar si el producto tiene ingredientes
  const seccionIngredientes = document.getElementById('ingredientes-seccion');
  const listaIngredientes = document.getElementById('ingredientes-lista');
  
  if (tieneIngredientes(item.id)) {
    // Limpiar lista de ingredientes
    listaIngredientes.innerHTML = '';
    
    // Mostrar sección de ingredientes
    seccionIngredientes.style.display = 'block';
    
    // Reiniciar ingredientes seleccionados
    ingredientesSeleccionados = item.ingredientes || [];
    
    // Cargar ingredientes específicos del producto
    const ingredientesDisponibles = ingredientesPorProducto[item.id] || [];
    
    ingredientesDisponibles.forEach(ingrediente => {
      // Verificar si está seleccionado
      const estaSeleccionado = ingredientesSeleccionados.some(i => i.id === ingrediente.id);
      
      // Crear elemento para cada ingrediente
      const ingredienteItem = document.createElement('div');
      ingredienteItem.className = 'ingrediente-item';
      
      // Crear checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'ingrediente-checkbox';
      checkbox.id = 'ingrediente-' + ingrediente.id;
      checkbox.checked = estaSeleccionado;
      
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          // Agregar a seleccionados si no existe
          const yaExiste = ingredientesSeleccionados.some(i => i.id === ingrediente.id);
          if (!yaExiste) {
            ingredientesSeleccionados.push({
              id: ingrediente.id,
              nombre: ingrediente.nombre,
              precio: ingrediente.precio
            });
          }
        } else {
          // Quitar de seleccionados
          const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
          if (index >= 0) {
            ingredientesSeleccionados.splice(index, 1);
          }
        }
        
        // Actualizar precio si hay ingredientes con costo adicional
        actualizarPrecioModal();
      });
      
      // Crear label para el nombre
      const nombre = document.createElement('label');
      nombre.htmlFor = 'ingrediente-' + ingrediente.id;
      nombre.className = 'ingrediente-nombre';
      nombre.textContent = ingrediente.nombre;
      
      // Elemento para el precio si tiene
      let precioElement = null;
      if (ingrediente.precio > 0) {
        precioElement = document.createElement('span');
        precioElement.className = 'ingrediente-precio';
        precioElement.textContent = '+ ' + formatearMoneda(ingrediente.precio);
      }
      
      // Agregar elementos al item
      ingredienteItem.appendChild(checkbox);
      ingredienteItem.appendChild(nombre);
      if (precioElement) {
        ingredienteItem.appendChild(precioElement);
      }
      
      // Agregar a la lista
      listaIngredientes.appendChild(ingredienteItem);
    });
  } else {
    // Ocultar sección de ingredientes
    seccionIngredientes.style.display = 'none';
  }
  
  // Establecer instrucciones actuales
  document.getElementById('producto-instrucciones').value = item.instrucciones || '';
  
  // Cambiar texto del botón
  document.getElementById('btn-guardar-instrucciones').textContent = 'Actualizar';
  
  // Mostrar modal
  document.getElementById('modal-instrucciones').style.display = 'flex';
}

// Función modificada para mostrar todos los productos
function mostrarProductos() {
  document.getElementById('subcategorias-container').style.display = 'none';
  
  // Quitar botón volver si existe
  const btnVolver = document.getElementById('btn-volver');
  if (btnVolver) btnVolver.remove();
  
  filtrarProductos();
}

// Función para determinar si un producto tiene instrucciones o ingredientes
async function tieneInstrucciones(productoId) {
  // Verificar primero en la lista estática (para compatibilidad)
  if (productosConInstrucciones.includes(productoId)) {
    return true;
  }
  
  // Verificar si tiene ingredientes en Firebase
  try {
    const productoRef = await db.collection('productos').doc(productoId).get();
    const producto = productoRef.data();
    return producto && producto.tieneIngredientes === true;
  } catch (error) {
    console.error("Error al verificar si el producto tiene instrucciones:", error);
    return false;
  }
}

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
      categoriaActual = filtroCategoria;
      
      // Reiniciar subcategoría si cambiamos de categoría
      filtroSubcategoria = '';
      subcategoriaActual = '';

      if (filtroCategoria === 'todos') {
        // Mostrar todos los productos
        vistaActual = 'productos';
        mostrarProductos();
        // Actualizar subcategorías
        actualizarSubcategorias();
        
        // Filtrar productos
        filtrarProductos();

      } else {
        // Mostrar subcategorías como grid
        vistaActual = 'subcategorias';
        mostrarSubcategoriasGrid();
      }
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

// Función optimizada para filtrar productos
async function filtrarProductos() {
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
  
  // Obtener IDs para verificar
  const productosIds = productosFiltrados.map(p => p.id).filter(id => {
    // Filtrar IDs que ya sabemos que están en la lista estática
    return !productosConInstrucciones.includes(id);
  });
  
  // Verificar productos con ingredientes en lote (si hay IDs para verificar)
  let productosConIngs = {};
  if (productosIds.length > 0) {
    // Dividir en lotes de 10 para evitar limitaciones de Firestore
    const lotes = [];
    for (let i = 0; i < productosIds.length; i += 10) {
      lotes.push(productosIds.slice(i, i + 10));
    }
    
    // Procesar cada lote
    for (const lote of lotes) {
      const resultado = await verificarProductosConIngredientes(lote);
      // Combinar resultados
      productosConIngs = { ...productosConIngs, ...resultado };
    }
  }
  
  // Limpiar el contenedor
  container.innerHTML = '';
  
  // Crear las tarjetas de producto
  productosFiltrados.forEach(producto => {
    // Imagen del producto
    let imagenHTML = '';
    if (producto.imagenURL) {
      imagenHTML = `<img src="${producto.imagenURL}" alt="${producto.nombre}" loading="lazy">`;
    } else {
      imagenHTML = `<i class="fas fa-image" style="font-size: 2rem; color: #ddd;"></i>`;
    }
    
    // Verificar si tiene instrucciones o ingredientes
    const conInstrucciones = productosConInstrucciones.includes(producto.id) || productosConIngs[producto.id] === true || producto.tieneIngredientes === true;
    
    // Crear tarjeta con indicador
    const productoCard = document.createElement('div');
    productoCard.className = 'producto-card';
    productoCard.setAttribute('data-id', producto.id);
    
    productoCard.innerHTML = `
      <div class="producto-imagen">
        ${imagenHTML}
        ${!producto.disponible ? '<div class="producto-no-disponible">No Disponible</div>' : ''}
        ${conInstrucciones ? '<div class="tiene-instrucciones" title="Este producto tiene opciones para personalizar"><i class="fas fa-utensils"></i></div>' : ''}
      </div>
      <div class="producto-info">
        <div class="producto-nombre">${producto.nombre}</div>
        <div class="producto-precio">${formatearMoneda(producto.precio || 0)}</div>
      </div>
    `;
    
    // Evento al hacer clic
    productoCard.addEventListener('click', function() {
      // Obtener ID del producto
      const productoId = this.getAttribute('data-id');
      
      // Buscar producto completo
      const producto = productosData.find(p => p.id === productoId);
      
      // Verificar disponibilidad
      if (producto && producto.disponible !== false) {
        // Verificar si tiene ingredientes o está en la lista estática
        if (productosConInstrucciones.includes(producto.id) || 
            productosConIngs[producto.id] === true || 
            producto.tieneIngredientes === true) {
          abrirModalProductoInstrucciones(producto);
        } else {
          // Añadir directamente a la orden
          agregarProductoDirecto(producto);
        }
      }
    });
    
    container.appendChild(productoCard);
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
    const tieneInstruccionesTexto = item.instrucciones && item.instrucciones.trim() !== '';
    
    // Texto de ingredientes personalizados
    let ingredientesHTML = '';
    if (item.ingredientes && item.ingredientes.length > 0) {
      // Filtrar solo ingredientes con precio adicional para mostrar
      const ingredientesAdicionales = item.ingredientes.filter(ing => ing.precio > 0);
      
      if (ingredientesAdicionales.length > 0) {
        ingredientesHTML = `
          <div class="orden-item-ingredientes">
            ${ingredientesAdicionales.map(ing => `
              <span class="orden-item-ingrediente">+${ing.nombre}</span>
            `).join('')}
          </div>
        `;
      }
    }
    
    html += `
      <div class="orden-item">
        <div class="orden-item-cantidad">${item.cantidad}x</div>
        <div class="orden-item-info">
          <div class="orden-item-nombre">${item.nombre}</div>
          <div class="orden-item-precio">${formatearMoneda(item.precio)} c/u</div>
          ${ingredientesHTML}
          ${tieneInstruccionesTexto ? 
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

// Función modificada para guardar instrucciones
function guardarInstrucciones() {
  if (indexItemEditarInstr >= 0) {
    // Estamos editando un item existente
    if (indexItemEditarInstr < ordenActual.items.length) {
      // Obtener instrucciones
      const instrucciones = document.getElementById('producto-instrucciones').value.trim();
      
      // Actualizar item
      ordenActual.items[indexItemEditarInstr].instrucciones = instrucciones;
      
      // Actualizar ingredientes si hay
      if (ingredientesSeleccionados.length > 0) {
        ordenActual.items[indexItemEditarInstr].ingredientes = ingredientesSeleccionados;
        
        // Calcular precio adicional por ingredientes
        const precioAdicional = ingredientesSeleccionados.reduce((total, ing) => {
          return total + (ing.precio || 0);
        }, 0);
        
        // Actualizar precio si hay adicionales
        if (precioAdicional > 0) {
          const precioBase = productoSeleccionadoInstr.precio || 0;
          ordenActual.items[indexItemEditarInstr].precio = precioBase + precioAdicional;
          ordenActual.items[indexItemEditarInstr].subtotal = 
            ordenActual.items[indexItemEditarInstr].precio * 
            ordenActual.items[indexItemEditarInstr].cantidad;
        }
      }
      
      // Actualizar UI
      actualizarOrdenUI();
      
      // Cerrar modal
      document.getElementById('modal-instrucciones').style.display = 'none';
      
      // Notificación
      mostrarNotificacion('Instrucciones guardadas', 'success');
    }
  } else {
    // Estamos agregando un nuevo producto
    if (productoSeleccionadoInstr) {
      // Obtener instrucciones
      const instrucciones = document.getElementById('producto-instrucciones').value.trim();
      
      // Calcular precio adicional por ingredientes
      const precioAdicional = ingredientesSeleccionados.reduce((total, ing) => {
        return total + (ing.precio || 0);
      }, 0);
      
      // Precio final del producto
      const precioFinal = (productoSeleccionadoInstr.precio || 0) + precioAdicional;
      
      // Crear item para la orden
      const item = {
        id: productoSeleccionadoInstr.id,
        nombre: productoSeleccionadoInstr.nombre,
        precio: precioFinal,
        cantidad: 1,
        subtotal: precioFinal,
        instrucciones: instrucciones,
        ingredientes: ingredientesSeleccionados.length > 0 ? ingredientesSeleccionados : undefined
      };
      
      // Agregar a la orden
      ordenActual.items.push(item);
      
      // Actualizar UI
      actualizarOrdenUI();
      
      // Cerrar modal
      document.getElementById('modal-instrucciones').style.display = 'none';
      
      // Notificación
      mostrarNotificacion(`${productoSeleccionadoInstr.nombre} agregado a la orden`, 'success');
    }
  }
}

function calcularTotal() {
  // Calcular subtotal sumando todos los items
  ordenActual.subtotal = ordenActual.items.reduce((total, item) => total + item.subtotal, 0);
  
  // Obtener porcentaje de descuento
  const descuentoInput = document.getElementById('orden-descuento');
  ordenActual.descuento = parseFloat(descuentoInput.value) || 0;
  
  //Validar descuento (0-100%)
  if (ordenActual.descuento < 0) {
    ordenActual.descuento = 0;
    descuentoInput.value = 0;
  } else if (ordenActual.descuento > ordenActual.subtotal) {
    ordenActual.descuento = ordenActual.subtotal;
    descuentoInput.value = ordenActual.subtotal;
  }
  
  // Calcular total con descuento
  //const descuentoMonto = ordenActual.subtotal * (ordenActual.descuento / 100);
  ordenActual.total = ordenActual.subtotal - ordenActual.descuento;
  
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