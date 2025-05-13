// add-order.js - Lógica para la página de crear orden (versión mejorada)

// la funcion verificar autenticacion esta funcionando???
document.addEventListener('DOMContentLoaded', function () {
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

// Variables para modales e instrucciones especiales
let productoSeleccionadoInstr = null;
let indexItemEditarInstr = -1;

// Variables para la navegación entre categorías y subcategorías
let vistaActual = 'categorias';
let categoriaActual = '';
let subcategoriaActual = '';
let ingredientesSeleccionados = [];

let pizzaPartIngredients = {};

// Mapeo de subcategorías por categoría
const subcategoriasPorCategoria = {
  'comida': [
    { id: 'tortas', nombre: 'Tortas', imagen: 'assets/images/subcategorias/torta.webp' },
    { id: 'hamburguesas', nombre: 'Hamburguesas', imagen: 'assets/images/subcategorias/hamburguesa.webp' },
    { id: 'pizzas', nombre: 'Pizzas', imagen: 'assets/images/subcategorias/pizza.webp' },
    { id: 'alitas', nombre: 'Alitas', imagen: 'assets/images/subcategorias/alitas.webp' },
    { id: 'boneless', nombre: 'Boneless', imagen: 'assets/images/subcategorias/boneless.webp' },
    { id: 'hotdogs', nombre: 'Hot Dogs', imagen: 'assets/images/subcategorias/hotdog.webp' },
    { id: 'sincronizadas', nombre: 'Sincronizadas', imagen: 'assets/images/subcategorias/sincronizada.webp' },
    { id: 'papasfritas', nombre: 'Papas Fritas', imagen: 'assets/images/subcategorias/papas.webp' },
    { id: 'salchipapas', nombre: 'Salchipapas', imagen: 'assets/images/subcategorias/salchipapas.webp' },
    { id: 'papotas', nombre: 'Papotas', imagen: 'assets/images/subcategorias/papotas.webp' }
  ],
  'snacks': [
    { id: 'dorilocos', nombre: 'Dorilocos', imagen: 'assets/images/subcategorias/dorilocos.webp' },
    { id: 'doriesquites', nombre: 'Doriesquites', imagen: 'assets/images/subcategorias/doriesquites.webp' },
    { id: 'esquites', nombre: 'Esquites', imagen: 'assets/images/subcategorias/esquites.webp' },
    { id: 'frituras', nombre: 'Sabritas', imagen: 'assets/images/subcategorias/sabritas.webp' },
    { id: 'pringles', nombre: 'Pringles', imagen: 'assets/images/subcategorias/pringles.webp' },
    { id: 'barras', nombre: 'Barras', imagen: 'assets/images/subcategorias/barras.webp' },
    { id: 'galletas', nombre: 'Galletas', imagen: 'assets/images/subcategorias/galletas.webp' },
    { id: 'gomitas', nombre: 'Gomitas', imagen: 'assets/images/subcategorias/gomitas.webp' }
  ],
  'bebidas': [
    { id: 'refresco_botella', nombre: 'Sodas-Botella', imagen: 'assets/images/subcategorias/refresco_botella.webp' },
    { id: 'refresco_lata', nombre: 'Sodas-Lata', imagen: 'assets/images/subcategorias/refresco_lata.webp' },
    { id: 'agua', nombre: 'Agua-Botella', imagen: 'assets/images/subcategorias/agua.webp' },
    { id: 'agua_sabor', nombre: 'Aguas-Frescas', imagen: 'assets/images/subcategorias/agua_fresca.webp' },
    { id: 'cerveza', nombre: 'Cerveza', imagen: 'assets/images/subcategorias/cerveza.webp' },
    { id: 'michelada', nombre: 'Michelada', imagen: 'assets/images/subcategorias/michelada.webp' },
    { id: 'new_mix', nombre: 'New Mix', imagen: 'assets/images/subcategorias/new_mix.webp' },
    { id: 'jugo_botella', nombre: 'Jugo-Botella', imagen: 'assets/images/subcategorias/jugo_botella.webp' },
    { id: 'jugo_lata', nombre: 'Jugo-Lata', imagen: 'assets/images/subcategorias/jugo_lata.webp' },
    { id: 'energeticas', nombre: 'Bebidas energéticas', imagen: 'assets/images/subcategorias/energeticas.webp' },
    { id: 'malteadas', nombre: 'Malteadas', imagen: 'assets/images/subcategorias/malteada.webp' },
    { id: 'frappe', nombre: 'Frappe', imagen: 'assets/images/subcategorias/frappe.webp' },
    { id: 'raspados', nombre: 'Raspados', imagen: 'assets/images/subcategorias/raspado.webp' }
  ]
};

// Function to get pizza sizes
function getPizzaSizes() {
  return [
    { id: 'gigante', nombre: 'Gigante (24pz)', precio: 0 },
    { id: 'grande', nombre: 'Grande (12pz)', precio: 0 },
    { id: 'mediana', nombre: 'Mediana (8pz)', precio: 0 },
    { id: 'personal', nombre: 'Personal (4pz)', precio: 0 },
    { id: 'rebanada', nombre: 'Rebanada', precio: 0 }
  ];
}

// Function to compare default and selected ingredients
function getIngredientChanges(defaultIngredients, selectedIngredients) {
  const added = [];
  const removed = [];

  // Find added ingredients
  selectedIngredients.forEach(ing => {
    const isDefault = defaultIngredients.some(d => d.id === ing.id && d.default);
    if (!isDefault) {
      added.push(ing);
    }
  });

  // Find removed ingredients
  defaultIngredients.forEach(ing => {
    if (ing.default) {
      const stillSelected = selectedIngredients.some(s => s.id === ing.id);
      if (!stillSelected) {
        removed.push(ing);
      }
    }
  });

  return { added, removed };
}

// Add this function to check if a product is in a specific subcategory
function isProductInSubcategory(producto, subcategoria) {
  return producto.subcategoria === subcategoria;
}

function isPizza(producto) {
  return isProductInSubcategory(producto, 'pizzas');
}

// Función para verificar múltiples productos con ingredientes en una sola operación
async function verificarProductosConIngredientes(productosIds) {

  mostrarCargando(true);
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
  } finally {
    mostrarCargando(false);
  }
}

// Función para verificar si un producto tiene ingredientes personalizables
async function tieneIngredientes(productoId) {
  mostrarCargando(true);
  // Verificar en Firebase si tiene ingredientes
  try {
    const productoRef = await db.collection('productos').doc(productoId).get();
    const producto = productoRef.data();
    return producto && producto.tieneIngredientes === true;
  } catch (error) {
    console.error("Error al verificar ingredientes del producto:", error);
    return false;
  } finally {
    mostrarCargando(false);
  }
}

// Función para obtener ingredientes de un producto
async function obtenerIngredientesProducto(productoId) {
  mostrarCargando(true);

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
  } finally {
    mostrarCargando(false);
  }
}

// En la función abrirModalEdicionItem, asegúrate de restaurar correctamente la configuración de la pizza
async function abrirModalEdicionItem(item, index) {
  // Find the original product from productosData to get the correct base price
  const productoOriginal = productosData.find(p => p.id === item.id);
  
  if (!productoOriginal) {
    console.error("Producto original no encontrado");
    return;
  }
  
  // Create a properly initialized object with the BASE price from the original product
  productoSeleccionadoInstr = {
    id: item.id,
    nombre: item.nombre,
    precio: productoOriginal.precio || 0, // Always use the ORIGINAL base price
    instrucciones: item.instrucciones || ''
  };
  
  indexItemEditarInstr = index;

  // Update modal title
  document.getElementById('modal-producto-nombre-instr').textContent = item.nombre;

  // Get the modal content
  const modalContent = document.querySelector('.modal-content');
  const medidaContainer = document.querySelector('.medida');

  // Check if this is a pizza
  const esPizza = isPizza(productoOriginal);
  let pizzaManager = null;

  // Clear any previous pizza UI
  const previousPizzaContainer = document.querySelector('.pizza-size-container');
  if (previousPizzaContainer) {
    previousPizzaContainer.parentNode.removeChild(previousPizzaContainer);
  }
  
  const previousPartsContainer = document.querySelector('.pizza-parts-container');
  if (previousPartsContainer) {
    previousPartsContainer.parentNode.removeChild(previousPartsContainer);
  }
  
  const previousSpecialtyContainer = document.querySelector('.pizza-specialty-container');
  if (previousSpecialtyContainer) {
    previousSpecialtyContainer.parentNode.removeChild(previousSpecialtyContainer);
  }
  
  const previousCircleContainer = document.querySelector('.circle-container');
  if (previousCircleContainer) {
    previousCircleContainer.parentNode.removeChild(previousCircleContainer);
  }

  // Reset global variables for pizza customization
  window.pizzaPartIngredients = {};
  window.partSpecialties = {};
  window.currentSelectedPart = null;
  window.previousSelectedPart = null;
  
  // Set up pizza UI if it's a pizza
  if (esPizza) {
    medidaContainer.style.display = 'block';
    pizzaManager = await setupPizzaCustomizationUI(medidaContainer, item.id);
    
    // Restore pizza configuration from saved item
    if (item.pizzaConfig) {
      // Set size
      const sizeSelect = document.getElementById('pizza-size-select');
      if (sizeSelect && item.pizzaConfig.size) {
        sizeSelect.value = item.pizzaConfig.size;
      }
      
      // Set parts
      const partsSelect = document.getElementById('pizza-parts-select');
      if (partsSelect && item.pizzaConfig.parts) {
        partsSelect.value = item.pizzaConfig.parts;
        pizzaManager.pizzaCircleManager.drawSegments(item.pizzaConfig.parts);
      }
      
      // Restore ingredients for each part
      if (item.pizzaConfig.partIngredients) {
        window.pizzaPartIngredients = JSON.parse(JSON.stringify(item.pizzaConfig.partIngredients));
      }
      
      // Restore specialties for each part
      if (item.pizzaConfig.partSpecialties) {
        window.partSpecialties = JSON.parse(JSON.stringify(item.pizzaConfig.partSpecialties));
      }
      
      // Select first part after a short delay
      setTimeout(() => {
        pizzaManager.pizzaCircleManager.selectPart(1);
        
        // Mark parts with ingredients
        for (const partNum in window.pizzaPartIngredients) {
          const hasIngredients = window.pizzaPartIngredients[partNum] && 
                                window.pizzaPartIngredients[partNum].length > 0;
          pizzaManager.pizzaCircleManager.markPartWithIngredients(parseInt(partNum), hasIngredients);
        }
        
        // Load ingredients for the first part
        const especialidadId = window.partSpecialties["1"] || "";
        loadIngredientsForPart(item.id, 1, especialidadId);
        
        // Update specialty select for first part
        const specialtySelect = document.getElementById('pizza-specialty-select');
        if (specialtySelect && window.partSpecialties["1"]) {
          specialtySelect.value = window.partSpecialties["1"];
        }
      }, 100);
    }
  } else {
    // Hide for non-pizza products
    medidaContainer.style.display = 'none';
  }

  // For non-pizza products, handle ingredients normally
  if (!esPizza) {
    // Check if the product has ingredients
    const tieneIngs = await tieneIngredientes(item.id);
    const seccionIngredientes = document.getElementById('ingredientes-seccion');
    const listaIngredientes = document.getElementById('ingredientes-lista');
    
    if (tieneIngs) {
      // Clear ingredients list
      listaIngredientes.innerHTML = '';

      // Show ingredients section
      seccionIngredientes.style.display = 'block';

      // Set selected ingredients - create a fresh copy to avoid reference issues
      ingredientesSeleccionados = item.ingredientes ? JSON.parse(JSON.stringify(item.ingredientes)) : [];

      // Load product ingredients
      const ingredientesDisponibles = await obtenerIngredientesProducto(item.id);

      // Create UI for each ingredient
      ingredientesDisponibles.forEach(ingrediente => {
        // Check if selected
        const estaSeleccionado = ingredientesSeleccionados.some(i => i.id === ingrediente.id);

        // Create ingredient item
        const ingredienteItem = document.createElement('div');
        ingredienteItem.className = 'ingrediente-item';

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ingrediente-checkbox';
        checkbox.id = 'ingrediente-' + ingrediente.id;
        checkbox.checked = estaSeleccionado;

        // Handle checkbox change
        checkbox.addEventListener('change', function() {
          if (this.checked) {
            // Add to selected if not exists
            const yaExiste = ingredientesSeleccionados.some(i => i.id === ingrediente.id);
            if (!yaExiste) {
              ingredientesSeleccionados.push({
                id: ingrediente.id,
                nombre: ingrediente.nombre,
                precio: ingrediente.precio || 0
              });
            }
          } else {
            // Remove from selected
            const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
            if (index >= 0) {
              ingredientesSeleccionados.splice(index, 1);
            }
          }

          // Update price immediately
          actualizarPrecioModal();
        });

        // Create label for name
        const nombre = document.createElement('label');
        nombre.htmlFor = 'ingrediente-' + ingrediente.id;
        nombre.className = 'ingrediente-nombre';
        nombre.textContent = ingrediente.nombre;

        // Create price element if needed
        let precioElement = null;
        if (ingrediente.precio > 0) {
          precioElement = document.createElement('span');
          precioElement.className = 'ingrediente-precio';
          precioElement.textContent = '+ ' + formatearMoneda(ingrediente.precio || 0);
        }

        // Add elements to item
        ingredienteItem.appendChild(checkbox);
        ingredienteItem.appendChild(nombre);
        if (precioElement) {
          ingredienteItem.appendChild(precioElement);
        }

        // Add to list
        listaIngredientes.appendChild(ingredienteItem);
      });
    } else {
      // Hide ingredients section for non-pizza products without ingredients
      seccionIngredientes.style.display = 'none';
    }
  }

  // Set current instructions
  document.getElementById('producto-instrucciones').value = item.instrucciones || '';

  // Change button text
  document.getElementById('btn-guardar-instrucciones').textContent = 'Actualizar';

  // Show modal
  document.getElementById('modal-instrucciones').style.display = 'flex';
  
  // Save references for the save function
  window.currentPizzaManager = pizzaManager;
  
  // Update price display
  actualizarPrecioModal();
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
    subcategoriaCard.addEventListener('click', function () {
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

    volverBtn.addEventListener('click', function () {
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

const modalContent = document.querySelector('.modal-content');

// function to retrieve pizza specialties from Firestore
async function obtenerEspecialidadesPizza() {
  mostrarCargando(true);
  
  try {
    // Get all products that are in the "comida" category and "pizzas" subcategory
    const especialidadesRef = db.collection('productos')
      .where("categoria", "==", "comida")
      .where("subcategoria", "==", "pizzas");
      
    const querySnapshot = await especialidadesRef.get();
    
    if (querySnapshot.empty) {
      console.log("No se encontraron especialidades de pizza");
      mostrarCargando(false);
      return [];
    }
    
    const especialidadesPizza = [];
    querySnapshot.forEach((doc) => {
      especialidadesPizza.push({
        id: doc.id,
        nombre: doc.data().nombre
      });
    });
    
    console.log("Especialidades de pizza encontradas:", especialidadesPizza);
    return especialidadesPizza;
    
  } catch (error) {
    console.error("Error al obtener especialidades de las pizzas:", error);
    return [];
  } finally {
    mostrarCargando(false);
  }
}

// Function to get ingredients for a specific pizza specialty
async function obtenerIngredientesPorEspecialidad(especialidadId) {
  mostrarCargando(true);
  
  try {
    if (!especialidadId) {
      return [];
    }
    
    const ingredientesRef = db.collection('productos')
      .doc(especialidadId)
      .collection('ingredientes');
      
    const ingredientesSnapshot = await ingredientesRef.get();
    
    if (ingredientesSnapshot.empty) {
      console.log("No se encontraron ingredientes para esta especialidad");
      return [];
    }
    
    const ingredientesList = [];
    ingredientesSnapshot.forEach((doc) => {
      ingredientesList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log("Ingredientes encontrados para especialidad:", ingredientesList);
    return ingredientesList;
    
  } catch (error) {
    console.error("Error al obtener ingredientes de la especialidad:", error);
    return [];
  } finally {
    mostrarCargando(false);
  }
}

// Actualización de la función setupPizzaDivision para guardar cambios automáticamente
function setupPizzaDivision(container, onPartSelect) {
  // Get or create the circle container
  let circleContainer = container.querySelector('.circle-container');
  if (!circleContainer) {
    circleContainer = document.createElement('div');
    circleContainer.className = 'circle-container';
    circleContainer.innerHTML = `
      <div class="circle-header">
        <h3>Selecciona una parte para personalizar</h3>
      </div>
      <div class="circle-wrapper">
        <svg id="pizza-circle" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Circle segments will be added here -->
        </svg>
      </div>
      <div id="pizza-part-output" class="selected-part">Selecciona una parte</div>
    `;
    
    container.appendChild(circleContainer);
  }
  
  const svg = circleContainer.querySelector('#pizza-circle');
  const output = circleContainer.querySelector('#pizza-part-output');
  
  return {
    drawSegments: function(parts) {
      function polarToCartesian(cx, cy, r, angle) {
        const radians = (angle - 90) * (Math.PI / 180);
        return {
          x: cx + r * Math.cos(radians),
          y: cy + r * Math.sin(radians)
        };
      }
  
      function describeArc(cx, cy, r, startAngle, endAngle) {
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
        return [
          `M ${cx} ${cy}`,
          `L ${start.x} ${start.y}`,
          `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
          'Z'
        ].join(' ');
      }
      
      svg.innerHTML = '';
  
      if (parts === 1) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '100');
        circle.setAttribute('cy', '100');
        circle.setAttribute('r', '100');
        circle.classList.add('segment');
        circle.setAttribute('data-part', '1');
        
        // Add click event to select this part
        circle.addEventListener('click', () => {
          this.selectPart(1);
        });
        
        svg.appendChild(circle);
        return;
      }
  
      const angleStep = 360 / parts;
      for (let i = 0; i < parts; i++) {
        const startAngle = i * angleStep;
        const endAngle = startAngle + angleStep;
        const partNumber = i + 1;
  
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', describeArc(100, 100, 100, startAngle, endAngle));
        path.classList.add('segment');
        path.setAttribute('data-part', partNumber);
  
        // Add click event to select this part
        path.addEventListener('click', () => {
          // Guardar cambios de la parte actual antes de cambiar
          if (window.currentSelectedPart !== null && window.currentSelectedPart !== partNumber) {
            saveCurrentPartChanges();
          }
          
          // Seleccionar la nueva parte
          this.selectPart(partNumber);
        });
  
        svg.appendChild(path);
      }
    },
    
    selectPart: function(partNumber) {
      // Reset previously selected parts
      svg.querySelectorAll('.segment.selected').forEach(seg => {
        seg.classList.remove('selected');
      });
  
      // Select the new part
      const selectedSegment = svg.querySelector(`.segment[data-part="${partNumber}"]`);
      if (selectedSegment) {
        selectedSegment.classList.add('selected');
      }
  
      // Update the output text
      output.textContent = `Parte ${partNumber} seleccionada`;
      
      // Call the callback function
      if (onPartSelect) {
        onPartSelect(partNumber);
      }
    },
    
    // Method to mark a part as having ingredients
    markPartWithIngredients: function(partNumber, hasIngredients) {
      const segment = svg.querySelector(`.segment[data-part="${partNumber}"]`);
      if (segment) {
        if (hasIngredients) {
          segment.classList.add('has-ingredients');
        } else {
          segment.classList.remove('has-ingredients');
        }
      }
    }
  };
}

// Función para guardar los cambios de la parte actual antes de cambiar a otra
function saveCurrentPartChanges() {
  // Guardar los ingredientes seleccionados para la parte actual
  if (window.currentSelectedPart !== null) {
    window.pizzaPartIngredients[window.currentSelectedPart] = [...ingredientesSeleccionados];
    
    // Actualizar visualmente la parte para indicar que tiene ingredientes
    if (window.currentPizzaManager && window.currentPizzaManager.pizzaCircleManager) {
      const hasIngredients = ingredientesSeleccionados.length > 0;
      window.currentPizzaManager.pizzaCircleManager.markPartWithIngredients(
        window.currentSelectedPart, 
        hasIngredients
      );
    }
  }
}

// Actualiza la función setupPizzaCustomizationUI para manejar mejor el cambio entre partes
async function setupPizzaCustomizationUI(container, productoId) {
  // Create size selection
  const sizeContainer = document.createElement('div');
  sizeContainer.className = 'pizza-size-container modal-section';
  sizeContainer.innerHTML = `
    <div class="size-title">Tamaño:</div>
    <select id="pizza-size-select">
      ${getPizzaSizes().map(size => 
        `<option value="${size.id}" data-precio="${size.precio}">${size.nombre}</option>`
      ).join('')}
    </select>
  `;
  
  // Create parts selection
  const partsContainer = document.createElement('div');
  partsContainer.className = 'pizza-parts-container modal-section';
  partsContainer.innerHTML = `
    <div class="parts-title">Número de Partes:</div>
    <select id="pizza-parts-select">
      <option value="1">Pizza Entera</option>
      <option value="2">Dividida en 2</option>
      <option value="4">Dividida en 4</option>
      <option value="3">Dividida en 3</option>
    </select>
  `;
  
  // Create specialty selection
  const specialtyContainer = document.createElement('div');
  specialtyContainer.className = 'pizza-specialty-container modal-section';
  specialtyContainer.innerHTML = `
    <div class="specialty-title">Especialidad:</div>
    <select id="pizza-specialty-select">
      <option value="">Cargando especialidades...</option>
    </select>
  `;
  
  // Add all containers to the main container
  container.appendChild(sizeContainer);
  container.appendChild(partsContainer);
  container.appendChild(specialtyContainer);
  
  // Set up pizza division visualization
  const pizzaCircleManager = setupPizzaDivision(container, (partNumber) => {
    // Esta función se llama cuando se selecciona una parte
    
    // Guardar ingredientes para la parte anterior si existe
    if (window.previousSelectedPart !== null && window.previousSelectedPart !== partNumber) {
      // Guardar ingredientes actuales para la parte anterior
      window.pizzaPartIngredients[window.previousSelectedPart] = [...ingredientesSeleccionados];
    }
    
    // Actualizar la parte seleccionada
    window.currentSelectedPart = partNumber;
    
    // Cargar ingredientes para la parte seleccionada
    ingredientesSeleccionados = window.pizzaPartIngredients[partNumber] || [];
    window.previousSelectedPart = partNumber;
    
    // Actualizar el selector de especialidades para esta parte
    const specialtySelect = document.getElementById('pizza-specialty-select');
    const currentSpecialty = window.partSpecialties[partNumber] || '';
    if (specialtySelect) {
      specialtySelect.value = currentSpecialty;
    }
    
    // Cargar ingredientes para esta parte
    loadIngredientsForPart(productoId, partNumber, currentSpecialty);
  });
  
  // Load pizza specialties
  const especialidades = await obtenerEspecialidadesPizza();
  const specialtySelect = document.getElementById('pizza-specialty-select');
  
  // Clear and populate the specialty select
  specialtySelect.innerHTML = `
    <option value="">Seleccione una especialidad</option>
    ${especialidades.map(esp => 
      `<option value="${esp.id}">${esp.nombre}</option>`
    ).join('')}
  `;
  
  // Set up event listeners
  const partsSelect = document.getElementById('pizza-parts-select');
  partsSelect.addEventListener('change', () => {
    const parts = parseInt(partsSelect.value);
    pizzaCircleManager.drawSegments(parts);
    
    // Reset ingredients for new division
    window.pizzaPartIngredients = {};
    window.partSpecialties = {};
    window.previousSelectedPart = null;
    window.currentSelectedPart = null;
    ingredientesSeleccionados = [];
    
    // Hide ingredients section until a part is selected
    const ingredientesSeccion = document.getElementById('ingredientes-seccion');
    if (ingredientesSeccion) {
      ingredientesSeccion.style.display = 'none';
    }
    
    // Select first part automatically
    setTimeout(() => {
      pizzaCircleManager.selectPart(1);
    }, 100);
  });
  
  specialtySelect.addEventListener('change', async function() {
    if (!window.currentSelectedPart) return;
    
    const especialidadId = this.value;
    window.partSpecialties[window.currentSelectedPart] = especialidadId;
    
    // Load ingredients for the selected specialty
    await loadIngredientsForPart(productoId, window.currentSelectedPart, especialidadId);
  });
  
  // Initialize with pizza divided in 1 part
  pizzaCircleManager.drawSegments(1);
  
  // Initialize global variables if not yet set
  if (!window.pizzaPartIngredients) window.pizzaPartIngredients = {};
  if (!window.partSpecialties) window.partSpecialties = {};
  window.previousSelectedPart = null;
  window.currentSelectedPart = null;
  
  // Select the whole pizza initially after a short delay
  setTimeout(() => {
    pizzaCircleManager.selectPart(1);
  }, 100);
  
  // Return the pizza manager and helper functions
  return {
    pizzaCircleManager,
    
    // Method to get all pizza configuration
    getPizzaConfig: function() {
      // Guardar la configuración actual antes de devolver el resultado
      saveCurrentPartChanges();
      
      return {
        size: document.getElementById('pizza-size-select').value,
        parts: parseInt(document.getElementById('pizza-parts-select').value),
        partIngredients: window.pizzaPartIngredients,
        partSpecialties: window.partSpecialties
      };
    },
    
    // Method to mark parts with ingredients
    updatePartStatus: function() {
      for (const partNum in window.pizzaPartIngredients) {
        const hasIngredients = window.pizzaPartIngredients[partNum] && 
                              window.pizzaPartIngredients[partNum].length > 0;
        pizzaCircleManager.markPartWithIngredients(parseInt(partNum), hasIngredients);
      }
    }
  };
}

// Actualización de la función loadIngredientsForPart para usar variables globales
async function loadIngredientsForPart(productoId, partNumber, especialidadId) {
  const seccionIngredientes = document.getElementById('ingredientes-seccion');
  const listaIngredientes = document.getElementById('ingredientes-lista');
  
  // Show ingredients section
  seccionIngredientes.style.display = 'block';
  
  // Clear ingredients list
  listaIngredientes.innerHTML = '';
  
  let ingredientes = [];
  
  // Get current selected ingredients for this part
  const currentPartIngredients = window.pizzaPartIngredients[partNumber] || [];
  
  // If a specialty is selected, get its ingredients
  if (especialidadId) {
    ingredientes = await obtenerIngredientesPorEspecialidad(especialidadId);
  } else {
    // Otherwise, get the default ingredients for this pizza
    ingredientes = await obtenerIngredientesProducto(productoId);
  }
  
  // Initialize selected ingredients from current part or with empty array
  ingredientesSeleccionados = [...currentPartIngredients];
  
  // No ingredients found
  if (ingredientes.length === 0) {
    listaIngredientes.innerHTML = '<div class="no-ingredientes">No hay ingredientes disponibles</div>';
    return;
  }
  
  // Create UI for each ingredient
  ingredientes.forEach(ingrediente => {
    // Check if this ingredient is already selected for this part
    const estaSeleccionado = ingredientesSeleccionados.some(i => i.id === ingrediente.id);
    
    // Create ingredient item
    const ingredienteItem = document.createElement('div');
    ingredienteItem.className = 'ingrediente-item';
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'ingrediente-checkbox';
    checkbox.id = `ingrediente-${ingrediente.id}`;
    checkbox.checked = estaSeleccionado || ingrediente.default;
    
    // Add to selected ingredients if checked by default and not already selected
    if (checkbox.checked && !estaSeleccionado) {
      ingredientesSeleccionados.push({
        id: ingrediente.id,
        nombre: ingrediente.nombre,
        precio: ingrediente.precio || 0,
        part: partNumber
      });
    }
    
    // Handle checkbox change
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        // Add to selected ingredients
        ingredientesSeleccionados.push({
          id: ingrediente.id,
          nombre: ingrediente.nombre,
          precio: ingrediente.precio || 0,
          part: partNumber
        });
      } else {
        // Remove from selected ingredients
        const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
        if (index >= 0) {
          ingredientesSeleccionados.splice(index, 1);
        }
      }
      
      // Guardar inmediatamente los cambios en la variable global
      window.pizzaPartIngredients[partNumber] = [...ingredientesSeleccionados];
      
      // Actualizar el estado visual de la parte
      if (window.currentPizzaManager && window.currentPizzaManager.pizzaCircleManager) {
        const hasIngredients = ingredientesSeleccionados.length > 0;
        window.currentPizzaManager.pizzaCircleManager.markPartWithIngredients(partNumber, hasIngredients);
      }
      
      // Update price immediately
      actualizarPrecioModal();
    });
    
    // Create label for name
    const nombre = document.createElement('label');
    nombre.htmlFor = `ingrediente-${ingrediente.id}`;
    nombre.className = 'ingrediente-nombre';
    nombre.textContent = ingrediente.nombre;
    
    // Create price element if needed
    let precioElement = null;
    if (ingrediente.precio > 0) {
      precioElement = document.createElement('span');
      precioElement.className = 'ingrediente-precio';
      precioElement.textContent = '+ ' + formatearMoneda(ingrediente.precio || 0);
    }
    
    // Add elements to item
    ingredienteItem.appendChild(checkbox);
    ingredienteItem.appendChild(nombre);
    if (precioElement) {
      ingredienteItem.appendChild(precioElement);
    }
    
    // Add to list
    listaIngredientes.appendChild(ingredienteItem);
  });
  
  // Update part ingredients in global variable
  window.pizzaPartIngredients[partNumber] = [...ingredientesSeleccionados];
  
  // Update price display after loading ingredients
  actualizarPrecioModal();
}

// Modified function to open the product instructions modal
async function abrirModalProductoInstrucciones(producto) {
  productoSeleccionadoInstr = producto;
  indexItemEditarInstr = -1; // -1 indicates a new product, not an edit

  // Update modal title
  document.getElementById('modal-producto-nombre-instr').textContent = producto.nombre;

  // Reset ingredients
  ingredientesSeleccionados = [];
  let pizzaManager = null;

  // Get the modal content
  const modalContent = document.querySelector('.modal-content');
  const medidaContainer = document.querySelector('.medida');

  // Check if this is a pizza
  const esPizza = isPizza(producto);

  // Clear any previous pizza UI
  const previousPizzaContainer = document.querySelector('.pizza-size-container');
  if (previousPizzaContainer) {
    previousPizzaContainer.parentNode.removeChild(previousPizzaContainer);
  }
  
  const previousPartsContainer = document.querySelector('.pizza-parts-container');
  if (previousPartsContainer) {
    previousPartsContainer.parentNode.removeChild(previousPartsContainer);
  }
  
  const previousSpecialtyContainer = document.querySelector('.pizza-specialty-container');
  if (previousSpecialtyContainer) {
    previousSpecialtyContainer.parentNode.removeChild(previousSpecialtyContainer);
  }
  
  const previousCircleContainer = document.querySelector('.circle-container');
  if (previousCircleContainer) {
    previousCircleContainer.parentNode.removeChild(previousCircleContainer);
  }

  // Set up pizza UI for all pizzas
  if (esPizza) {
    medidaContainer.style.display = 'block';
    pizzaManager = await setupPizzaCustomizationUI(medidaContainer, producto.id);
  } else {
    // Hide for non-pizza products
    medidaContainer.style.display = 'none';
  }

  // Check if the product has ingredients
  const tieneIngs = await tieneIngredientes(producto.id);
  const seccionIngredientes = document.getElementById('ingredientes-seccion');
  const listaIngredientes = document.getElementById('ingredientes-lista');

  // For non-pizza products or single-part pizzas, handle ingredients normally
  if (!esPizza && tieneIngs) {
    // Clear ingredients list
    listaIngredientes.innerHTML = '';

    // Show ingredients section
    seccionIngredientes.style.display = 'block';

    // Load product ingredients
    const ingredientes = await obtenerIngredientesProducto(producto.id);

    // Create UI for each ingredient
    ingredientes.forEach(ingrediente => {
      // Create ingredient item
      const ingredienteItem = document.createElement('div');
      ingredienteItem.className = 'ingrediente-item';

      // Create checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'ingrediente-checkbox';
      checkbox.id = 'ingrediente-' + ingrediente.id;
      checkbox.checked = ingrediente.default;

      // Add to selected ingredients if checked by default
      if (ingrediente.default) {
        ingredientesSeleccionados.push({
          id: ingrediente.id,
          nombre: ingrediente.nombre,
          precio: ingrediente.precio || 0
        });
      }

      // Handle checkbox change
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          // Add to selected ingredients
          ingredientesSeleccionados.push({
            id: ingrediente.id,
            nombre: ingrediente.nombre,
            precio: ingrediente.precio || 0
          });
        } else {
          // Remove from selected ingredients
          const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
          if (index >= 0) {
            ingredientesSeleccionados.splice(index, 1);
          }
        }

        // Update price
        actualizarPrecioModal();
      });

      // Create label for name
      const nombre = document.createElement('label');
      nombre.htmlFor = 'ingrediente-' + ingrediente.id;
      nombre.className = 'ingrediente-nombre';
      nombre.textContent = ingrediente.nombre;

      // Create price element if needed
      let precioElement = null;
      if (ingrediente.precio > 0) {
        precioElement = document.createElement('span');
        precioElement.className = 'ingrediente-precio';
        precioElement.textContent = '+ ' + formatearMoneda(ingrediente.precio || 0);
      }

      // Add elements to item
      ingredienteItem.appendChild(checkbox);
      ingredienteItem.appendChild(nombre);
      if (precioElement) {
        ingredienteItem.appendChild(precioElement);
      }

      // Add to list
      listaIngredientes.appendChild(ingredienteItem);
    });
  } else if (!esPizza) {
    // Hide ingredients section for non-pizza products without ingredients
    seccionIngredientes.style.display = 'none';
  }

  // Clear previous instructions
  document.getElementById('producto-instrucciones').value = '';

  // Show modal
  document.getElementById('modal-instrucciones').style.display = 'flex';

  // Change button text
  document.getElementById('btn-guardar-instrucciones').textContent = 'Agregar a la orden';
  
  // Save references for the save function
  window.currentPizzaManager = pizzaManager;
}

// Función para actualizar el precio en el modal basado en los ingredientes seleccionados
async function actualizarPrecioModal() {
  if (!productoSeleccionadoInstr) return;

  // Find the original product to get the BASE price
  const productoOriginal = productosData.find(p => p.id === productoSeleccionadoInstr.id);
  if (!productoOriginal) {
    console.error("Producto original no encontrado para calcular precio");
    return;
  }
  
  // ALWAYS start with the original base product price
  let precioFinal = productoOriginal.precio || 0;
  
  // For pizzas, calculate based on all parts
  if (isPizza(productoOriginal) && window.currentPizzaManager) {
    // Save current part's ingredients first
    if (window.currentSelectedPart !== null) {
      saveCurrentPartChanges();
    }
    
    // Calculate price from all parts' ingredients
    let precioIngredientes = 0;
    for (const parte in window.pizzaPartIngredients) {
      const ingredientesParte = window.pizzaPartIngredients[parte] || [];
      for (const ing of ingredientesParte) {
        if (ing.precio) {
          precioIngredientes += ing.precio;
        }
      }
    }
    
    precioFinal += precioIngredientes;
  } else {
    // For regular products with ingredients
    let precioIngredientes = 0;
    for (const ing of ingredientesSeleccionados) {
      if (ing.precio) {
        precioIngredientes += ing.precio;
      }
    }
    precioFinal += precioIngredientes;
  }

  // Update button text
  const botonGuardar = document.getElementById('btn-guardar-instrucciones');
  
  // Always show the price for clarity
  if (indexItemEditarInstr >= 0) {
    botonGuardar.textContent = `Actualizar (${formatearMoneda(precioFinal)})`;
  } else {
    botonGuardar.textContent = `Agregar (${formatearMoneda(precioFinal)})`;
  }
  
  // Log the price calculation for debugging
  console.log("Precio base:", productoOriginal.precio);
  console.log("Precio final con ingredientes:", precioFinal);
}

// Función modificada para mostrar todos los productos
function mostrarProductos() {
  document.getElementById('subcategorias-container').style.display = 'none';

  // Quitar botón volver si existe
  const btnVolver = document.getElementById('btn-volver');
  if (btnVolver) btnVolver.remove();

  filtrarProductos();
}

function inicializarPagina() {

  // Set global variables for pizza parts
  window.pizzaPartIngredients = {};
  window.currentSelectedPart = null;
  window.previousSelectedPart = null;
  window.partSpecialties = {};
  // Cargar productos
  cargarProductos();
  //habilitar la barra de busqueda
  const barraBusqueda = document.querySelector('.busqueda-container');
  barraBusqueda.classList.remove('busqueda-display')

  // Configurar eventos de filtros de categoría
  document.querySelectorAll('.categoria-principal').forEach(btn => {
    btn.addEventListener('click', function () {
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
        //habilitar la barra de busqueda solo en todos
        barraBusqueda.classList.remove('busqueda-display')

      } else {
        // Mostrar subcategorías como grid
        vistaActual = 'subcategorias';
        mostrarSubcategoriasGrid();
        //deshabilitar la barra de busqueda solo en las demas categorias
        barraBusqueda.classList.add('busqueda-display')
      }
    });
  });

  // Configurar búsqueda
  document.getElementById('buscar-producto').addEventListener('input', function () {
    filtroBusqueda = this.value.toLowerCase().trim();
    filtrarProductos();
  });

  // Eventos para la orden
  document.getElementById('orden-descuento').addEventListener('input', calcularTotal);
  document.getElementById('cliente-nombre').addEventListener('input', function () {
    ordenActual.cliente = this.value.trim();
  });

  document.getElementById('cliente-mesa').addEventListener('change', function () {
    ordenActual.mesa = this.value;
  });

  // Botón para mostrar/ocultar notas
  document.getElementById('toggle-nota').addEventListener('click', function () {
    const notaContainer = document.querySelector('.nota-input-container');
    if (notaContainer.style.display === 'none') {
      notaContainer.style.display = 'block';
      this.innerHTML = '<i class="fas fa-sticky-note"></i> Ocultar instrucciones';
    } else {
      notaContainer.style.display = 'none';
      this.innerHTML = '<i class="fas fa-sticky-note"></i> Instrucciones especiales';
    }
  });

  document.getElementById('orden-nota').addEventListener('input', function () {
    ordenActual.nota = this.value.trim();
  });

  // Botón para limpiar orden
  document.getElementById('btn-limpiar-orden').addEventListener('click', confirmarLimpiarOrden);

  // Botón para crear orden
  document.getElementById('btn-crear-orden').addEventListener('click', crearOrden);

  // Configurar tabs para modo móvil
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', function () {
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
    btn.addEventListener('click', function () {
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

  // Verificar productos con ingredientes en lote (si hay IDs para verificar)
  let productosConIngs = {};

  if (productosConIngs.length > 0) {
    // Dividir en lotes de 10 para evitar limitaciones de Firestore
    const lotes = [];
    /*for (let i = 0; i < productosIds.length; i += 10) {
      lotes.push(productosIds.slice(i, i + 10));
    }*/

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
    const conInstrucciones = productosConIngs[producto.id] === true || producto.tieneIngredientes === true;

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
    productoCard.addEventListener('click', function () {
      // Obtener ID del producto
      const productoId = this.getAttribute('data-id');

      // Buscar producto completo
      const producto = productosData.find(p => p.id === productoId);

      // Verificar disponibilidad
      if (producto && producto.disponible !== false) {
        // Verificar si tiene ingredientes o está en la lista estática
        if // ---(productosConInstrucciones.includes(producto.id) || 
          (productosConIngs[producto.id] === true ||
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

// Modify the agregarProductoDirecto function to handle unique ingredients
function agregarProductoDirecto(producto) {
  // If the product has ingredients, always add as new item
  if (producto.tieneIngredientes) {
    // Add new item
    const item = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio || 0,
      cantidad: 1,
      subtotal: producto.precio || 0,
      instrucciones: '',
      uniqueId: Date.now() // Add a unique identifier
    };

    ordenActual.items.push(item);
  } else {
    // Check if the product already exists in the order (for products without ingredients)
    const itemExistente = ordenActual.items.findIndex(i => i.id === producto.id);

    if (itemExistente >= 0) {
      // Increase quantity and subtotal
      ordenActual.items[itemExistente].cantidad += 1;
      ordenActual.items[itemExistente].subtotal =
        ordenActual.items[itemExistente].precio * ordenActual.items[itemExistente].cantidad;
    } else {
      // Add new item
      const item = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio || 0,
        cantidad: 1,
        subtotal: producto.precio || 0,
        instrucciones: '',
        uniqueId: Date.now() // Add a unique identifier
      };

      ordenActual.items.push(item);
    }
  }

  // Update UI
  actualizarOrdenUI();

  // Notification
  mostrarNotificacion(`${producto.nombre} agregado a la orden`, 'success');
}

function actualizarOrdenUI() {
  const container = document.getElementById('orden-items');
  
  // Update item counter for mobile tab
  document.querySelector('.orden-contador').textContent = ordenActual.items.length;
  
  // If no items, show empty message
  if (ordenActual.items.length === 0) {
    container.innerHTML = `
      <div class="orden-vacia">
        <i class="fas fa-shopping-cart"></i>
        <p>La orden está vacía</p>
        <p class="orden-vacia-texto">Agrega productos haciendo clic en ellos</p>
      </div>
    `;
    
    // Calculate total
    calcularTotal();
    return;
  }
  
  // Generate HTML for items
  let html = '';
  
  ordenActual.items.forEach((item, index) => {
    const tieneInstruccionesTexto = item.instrucciones && item.instrucciones.trim() !== '';
    
    // Create name display with pizza details if applicable
    let nombreDisplay = item.nombre;
    if (item.descripcionPizza) {
      nombreDisplay = `${item.nombre} - ${item.descripcionPizza}`;
    }
    
    // Handle ingredients display
    let ingredientesHTML = '';
    
    if (item.esPizzaDividida && item.ingredientes && item.ingredientes.length > 0) {
      // Group ingredients by part
      const ingredientesPorParte = {};
      item.ingredientes.forEach(ing => {
        const parte = ing.part || 1;
        if (!ingredientesPorParte[parte]) {
          ingredientesPorParte[parte] = [];
        }
        ingredientesPorParte[parte].push(ing);
      });
      
      // Create HTML for each part
      ingredientesHTML = `<div class="orden-item-ingredientes pizza-dividida">`;
      
      // Add specialties if available
      if (item.pizzaConfig && item.pizzaConfig.partSpecialties) {
        for (const parte in item.pizzaConfig.partSpecialties) {
          const especialidadId = item.pizzaConfig.partSpecialties[parte];
          if (especialidadId) {
            // Find the specialty name (you may need to fetch this from somewhere)
            let especialidadNombre = "Especialidad";
            
            ingredientesHTML += `
              <div class="parte-pizza">
                <div class="parte-pizza-header">Parte ${parte}: ${especialidadNombre}</div>
              </div>
            `;
          }
        }
      }
      
      // Add ingredients by part
      for (const parte in ingredientesPorParte) {
        ingredientesHTML += `
          <div class="parte-pizza">
            <div class="parte-pizza-header">Parte ${parte}:</div>
            <div class="parte-pizza-ingredientes">
              ${ingredientesPorParte[parte].map(ing => `
                <span class="orden-item-ingrediente">${ing.nombre}</span>
              `).join('')}
            </div>
          </div>
        `;
      }
      
      ingredientesHTML += `</div>`;
    } else if (item.ingredientes && item.ingredientes.length > 0) {
      // Regular ingredients display
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
          <div class="orden-item-nombre">${nombreDisplay}</div>
          <div class="orden-item-precio">${formatearMoneda(item.precio)} c/u</div>
          ${ingredientesHTML}
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
  
  // Add events to buttons
  document.querySelectorAll('.btn-instrucciones').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        const item = ordenActual.items[index];
        abrirModalEdicionItem(item, index);
      }
    });
  });
  
  document.querySelectorAll('.btn-reducir').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        if (ordenActual.items[index].cantidad > 1) {
          // Reduce quantity
          ordenActual.items[index].cantidad -= 1;
          ordenActual.items[index].subtotal =
            ordenActual.items[index].precio * ordenActual.items[index].cantidad;
          
          // Update UI
          actualizarOrdenUI();
        }
      }
    });
  });
  
  document.querySelectorAll('.btn-aumentar').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        // Increase quantity
        ordenActual.items[index].cantidad += 1;
        ordenActual.items[index].subtotal =
          ordenActual.items[index].precio * ordenActual.items[index].cantidad;
        
        // Update UI
        actualizarOrdenUI();
      }
    });
  });
  
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      
      if (index >= 0 && index < ordenActual.items.length) {
        // Remove item
        ordenActual.items.splice(index, 1);
        
        // Update UI
        actualizarOrdenUI();
        
        // Notification
        mostrarNotificacion('Producto eliminado de la orden', 'info');
      }
    });
  });
  
  // Calculate total
  calcularTotal();
}

// Actualización de la función guardarInstrucciones para manejar correctamente la configuración de pizza
function guardarInstrucciones() {
  if (!productoSeleccionadoInstr) return;
  
  // Find the original product to get the base price
  const productoOriginal = productosData.find(p => p.id === productoSeleccionadoInstr.id);
  if (!productoOriginal) {
    console.error("Producto original no encontrado para guardar");
    return;
  }
  
  const precioBase = productoOriginal.precio || 0;

  // Guardar cambios de la parte actual si es pizza antes de procesar
  if (isPizza(productoOriginal) && window.currentSelectedPart !== null) {
    saveCurrentPartChanges();
  }

  // Get instructions
  const instrucciones = document.getElementById('producto-instrucciones').value.trim();

  // Prepare item object with the base product price
  const item = {
    id: productoSeleccionadoInstr.id,
    nombre: productoSeleccionadoInstr.nombre,
    precio: precioBase,  // Start with base price
    cantidad: 1,
    instrucciones: instrucciones
  };

  // For pizza products, get the configuration
  if (isPizza(productoOriginal) && window.currentPizzaManager) {
    item.pizzaConfig = window.currentPizzaManager.getPizzaConfig();
    
    // Create description for split pizzas
    if (item.pizzaConfig.parts > 1) {
      let especialidades = [];
      for (const parte in item.pizzaConfig.partSpecialties) {
        const especialidadId = item.pizzaConfig.partSpecialties[parte];
        if (especialidadId) {
          // Find specialty product
          const especialidad = productosData.find(p => p.id === especialidadId);
          if (especialidad) {
            especialidades.push(especialidad.nombre);
          }
        }
      }
      
      if (especialidades.length > 0) {
        item.descripcionPizza = `${item.pizzaConfig.parts} partes: ${especialidades.join(', ')}`;
      } else {
        item.descripcionPizza = `${item.pizzaConfig.parts} partes`;
      }
    }
    
    // Save ingredients from all parts
    let allIngredients = [];
    for (const part in item.pizzaConfig.partIngredients) {
      if (item.pizzaConfig.partIngredients[part] && item.pizzaConfig.partIngredients[part].length > 0) {
        allIngredients = [...allIngredients, ...item.pizzaConfig.partIngredients[part]];
      }
    }
    item.ingredientes = allIngredients;
    item.esPizzaDividida = item.pizzaConfig.parts > 1;
  } else if (ingredientesSeleccionados.length > 0) {
    // For other products with ingredients
    item.ingredientes = [...ingredientesSeleccionados];
  }

  // Calculate final price based on ingredients
  let precioExtra = 0;
  if (item.ingredientes && item.ingredientes.length > 0) {
    precioExtra = item.ingredientes.reduce((total, ing) => total + (ing.precio || 0), 0);
  }
  
  // Set the final price with ingredients
  item.precio = precioBase + precioExtra;
  item.subtotal = item.precio; // Set initial subtotal
  
  // Add or update item
  if (indexItemEditarInstr >= 0) {
    // Update existing item's properties but keep the quantity
    const cantidadActual = ordenActual.items[indexItemEditarInstr].cantidad;
    item.cantidad = cantidadActual;
    item.subtotal = item.precio * cantidadActual;
    ordenActual.items[indexItemEditarInstr] = item;
  } else {
    // Add new item
    ordenActual.items.push(item);
  }

  // Close modal
  document.getElementById('modal-instrucciones').style.display = 'none';

  // Update order UI
  actualizarOrdenUI();
  calcularTotal();

  // Clear references
  productoSeleccionadoInstr = null;
  indexItemEditarInstr = -1;
  ingredientesSeleccionados = [];
  
  // Reset global pizza variables
  window.pizzaPartIngredients = {};
  window.partSpecialties = {};
  window.previousSelectedPart = null;
  window.currentSelectedPart = null;
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
        instrucciones: item.instrucciones || '',
        ingredientes: item.ingredientes || [], // Save ingredients
        ingredientChanges: item.ingredientChanges || { added: [], removed: [] } // Save changes
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
window.addEventListener('resize', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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