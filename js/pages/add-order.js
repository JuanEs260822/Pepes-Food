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

  setTimeout(initializePizzaFeatures, 100);

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

  // Event listener para cerrar modal
  const cerrarModal = document.querySelector('.cerrar-modal');
  if (cerrarModal) {
    cerrarModal.addEventListener('click', limpiarSaboresAlitas);
  }

  // Si tienes otros elementos que cierran el modal, agrégalos aquí
  const modalInstrucciones = document.getElementById('modal-instrucciones');
  if (modalInstrucciones) {
    modalInstrucciones.addEventListener('click', function (e) {
      if (e.target === modalInstrucciones) {
        limpiarSaboresAlitas();
      }
    });
  }
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
    { id: 'papas', nombre: 'Papas', imagen: 'assets/images/subcategorias/papas.webp' }
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
    { id: 'refresco_botella', nombre: 'Refresco Botella', imagen: 'assets/images/subcategorias/refresco_botella.webp' },
    { id: 'refresco_lata', nombre: 'Refresco Lata', imagen: 'assets/images/subcategorias/refresco_lata.webp' },
    { id: 'agua', nombre: 'Agua Botella', imagen: 'assets/images/subcategorias/agua.webp' },
    { id: 'cafe', nombre: 'Café', imagen: 'assets/images/subcategorias/agua_fresca.webp' },
    { id: 'cerveza', nombre: 'Cerveza', imagen: 'assets/images/subcategorias/cerveza.webp' },
    { id: 'micheladas', nombre: 'Micheladas', imagen: 'assets/images/subcategorias/michelada.webp' },
    { id: 'bebidas_alcoholicas', nombre: 'Bebidas Alcoholicas', imagen: 'assets/images/subcategorias/new_mix.webp' },
    { id: 'jugo_vidrio', nombre: 'Jugo Vidrio', imagen: 'assets/images/subcategorias/jugo_botella.webp' },
    { id: 'jugo_lata', nombre: 'Jugo Lata', imagen: 'assets/images/subcategorias/jugo_lata.webp' },
    { id: 'energeticas', nombre: 'Bebidas Energéticas', imagen: 'assets/images/subcategorias/energeticas.webp' },
    { id: 'malteadas', nombre: 'Malteadas', imagen: 'assets/images/subcategorias/malteada.webp' },
    { id: 'esquimos', nombre: 'Esquimos', imagen: 'assets/images/subcategorias/frappe.webp' },
    { id: 'raspados', nombre: 'Raspados', imagen: 'assets/images/subcategorias/raspado.webp' }
  ]
};

// 1. FUNCIÓN PARA LIMPIAR SABORES (agregar al inicio de tu archivo)
function limpiarSaboresAlitas() {
  const flavorContainer = document.querySelector('.multi-flavor-container');
  if (flavorContainer) {
    flavorContainer.remove();
  }
}

// FUNCIÓN MODIFICADA PARA CREAR LA INTERFAZ DE SABORES CON SABORES DINÁMICOS
function crearInterfazSabores(producto, esEdicion = false, saboresGuardados = null) {
  // Limpiar cualquier interfaz previa
  limpiarSaboresAlitas();

  // OBTENER SABORES DINÁMICAMENTE
  const saboresDisponibles = obtenerNombresPorCategoria('alitas');

  const flavorContainer = document.createElement('div');
  flavorContainer.className = 'multi-flavor-container';

  // Si es edición y hay sabores guardados, usar esos datos
  let primerSabor = '';
  let segundoSabor = null;
  let proporcion1 = '100%';
  let proporcion2 = '50%';

  if (esEdicion && saboresGuardados && saboresGuardados.length > 0) {
    primerSabor = saboresGuardados[0].sabor || '';
    proporcion1 = saboresGuardados[0].proporcion || '100%';

    if (saboresGuardados.length > 1) {
      segundoSabor = saboresGuardados[1].sabor || '';
      proporcion2 = saboresGuardados[1].proporcion || '50%';
    }
  }

  // GENERAR OPTIONS DINÁMICAMENTE
  function generarOptions(saborSeleccionado = '') {
    return saboresDisponibles.map(sabor => {
      const selected = sabor === saborSeleccionado ? 'selected' : '';
      return `<option value="${sabor}" ${selected}>${sabor}</option>`;
    }).join('');
  }

  flavorContainer.innerHTML = `
        <div class="instrucciones-title">Sabores:</div>
        <div class="wings-flavors-container">
            <div class="wings-flavor" data-index="0">
                <div class="flavor-header">
                    <span>Sabor 1</span>
                    <span class="proportion">${proporcion1}</span>
                </div>
                <select class="flavor-select" id="flavor-select-0">
                    ${generarOptions(primerSabor)}
                </select>
            </div>
            ${segundoSabor ? `
            <div class="wings-flavor" data-index="1">
                <div class="flavor-header">
                    <span>Sabor 2</span>
                    <span class="proportion">${proporcion2}</span>
                    <button class="remove-flavor"><i class="fas fa-times"></i></button>
                </div>
                <select class="flavor-select" id="flavor-select-1">
                    ${generarOptions(segundoSabor)}
                </select>
            </div>
            ` : ''}
            <button id="add-wings-flavor" class="btn btn-secundario">
                <i class="fas fa-plus"></i> Agregar otro sabor
            </button>
        </div>
    `;

  // Insertar después de la sección de ingredientes
  document.getElementById('ingredientes-seccion').after(flavorContainer);

  // Agregar event listeners
  configurarEventListenersSabores();
}

// FUNCIÓN MODIFICADA PARA CONFIGURAR EVENT LISTENERS CON SABORES DINÁMICOS
function configurarEventListenersSabores() {
  // Obtener sabores disponibles
  const saboresDisponibles = obtenerNombresPorCategoria('alitas');

  // Función para generar options
  function generarOptions() {
    return saboresDisponibles.map(sabor =>
      `<option value="${sabor}">${sabor}</option>`
    ).join('');
  }

  const addButton = document.getElementById('add-wings-flavor');
  if (addButton) {
    addButton.addEventListener('click', function () {
      const flavorCount = document.querySelectorAll('.wings-flavor').length;
      if (flavorCount < 2) {
        const newIndex = flavorCount;
        const newFlavor = document.createElement('div');
        newFlavor.className = 'wings-flavor';
        newFlavor.setAttribute('data-index', newIndex);
        newFlavor.innerHTML = `
                    <div class="flavor-header">
                        <span>Sabor ${newIndex + 1}</span>
                        <span class="proportion">50%</span>
                        <button class="remove-flavor"><i class="fas fa-times"></i></button>
                    </div>
                    <select class="flavor-select" id="flavor-select-${newIndex}">
                        ${generarOptions()}
                    </select>
                `;

        // Actualizar proporciones
        document.querySelectorAll('.wings-flavor').forEach(flavor => {
          flavor.querySelector('.proportion').textContent = '50%';
        });

        // Agregar antes del botón
        this.before(newFlavor);

        // Agregar event listener para remover
        newFlavor.querySelector('.remove-flavor').addEventListener('click', function () {
          newFlavor.remove();
          document.querySelectorAll('.wings-flavor').forEach(flavor => {
            flavor.querySelector('.proportion').textContent = '100%';
          });
        });
      } else {
        mostrarNotificacion('Máximo 2 sabores para alitas/boneless', 'info');
      }
    });
  }

  // Agregar event listeners para botones de remover existentes
  document.querySelectorAll('.remove-flavor').forEach(button => {
    button.addEventListener('click', function () {
      button.closest('.wings-flavor').remove();
      document.querySelectorAll('.wings-flavor').forEach(flavor => {
        flavor.querySelector('.proportion').textContent = '100%';
      });
    });
  });
}



// 7. FUNCIÓN PARA OBTENER SABORES SELECCIONADOS (para usar al guardar)
function obtenerSaboresSeleccionados() {
  const sabores = [];
  const flavorsContainers = document.querySelectorAll('.wings-flavor');

  flavorsContainers.forEach((container, index) => {
    const select = container.querySelector('.flavor-select');
    const proportion = container.querySelector('.proportion');

    if (select && proportion) {
      sabores.push({
        sabor: select.value,
        proporcion: proportion.textContent,
        orden: index + 1
      });
    }
  });

  return sabores;
}
// Function to get pizza sizes
function getPizzaSizes() {
  return [
    { id: 'gigante', nombre: 'Gigante (24pz)', precio: 240 },
    { id: 'grande', nombre: 'Grande (12pz)', precio: 189 },
    { id: 'mediana', nombre: 'Mediana (8pz)', precio: 129 },
    { id: 'personal', nombre: 'Personal (4pz)', precio: 60 },
    { id: 'rebanada', nombre: 'Rebanada', precio: 25 }
  ];
}


// Function to get sincronizadas sizes
function getQuesadillaSizes() {
  return [
    { id: '1 Pieza', nombre: '1 Pieza', precio: 20 },
    { id: '2 Piezas', nombre: '2 Piezas', precio: 40 },
    { id: '3 Piezas', nombre: '3 Piezas', precio: 50 }
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

function isAlita(producto) {
  return isProductInSubcategory(producto, 'alitas') || isProductInSubcategory(producto, 'boneless');
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

function renderPizzaIngredientesHTML(item) {
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
      const partesSorted = Object.keys(item.pizzaConfig.partSpecialties).sort((a, b) => parseInt(a) - parseInt(b));

      for (const parte of partesSorted) {
        const especialidadId = item.pizzaConfig.partSpecialties[parte];
        if (especialidadId) {
          // Find the specialty name
          const especialidad = productosData.find(p => p.id === especialidadId);
          const especialidadNombre = especialidad ? especialidad.nombre : "Especialidad";

          // Get the ingredients for this part
          const ingredientesParte = ingredientesPorParte[parte] || [];

          ingredientesHTML += `
            <div class="parte-pizza">
              <div class="parte-pizza-header">Parte ${parte}: ${especialidadNombre}</div>
              <div class="parte-pizza-ingredientes">
                ${ingredientesParte.map(ing => `
                  <span class="orden-item-ingrediente">${ing.nombre}</span>
                `).join('')}
              </div>
            </div>
          `;
        }
      }
    } else {
      // Add ingredients by part without specialty names
      const partesSorted = Object.keys(ingredientesPorParte).sort((a, b) => parseInt(a) - parseInt(b));

      for (const parte of partesSorted) {
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
    }

    ingredientesHTML += `</div>`;
  } else if (item.ingredientes && item.ingredientes.length > 0) {
    // Regular ingredients display (non-split pizza)
    const ingredientesAdicionales = item.ingredientes;

    if (ingredientesAdicionales.length > 0) {
      ingredientesHTML = `
        <div class="orden-item-ingredientes">
          ${ingredientesAdicionales.map(ing => `
            <span class="orden-item-ingrediente">${ing.precio > 0 ? '+' : ''}${ing.nombre}</span>
          `).join('')}
        </div>
      `;
    }
  }

  return ingredientesHTML;
}

function autoAssignSpecialties(parts) {
  const specialtySelect = document.getElementById('pizza-specialty-select');

  // Build a list of available specialties
  const specialties = [];
  for (let i = 0; i < specialtySelect.options.length; i++) {
    if (specialtySelect.options[i].value) {
      specialties.push({
        id: specialtySelect.options[i].value,
        name: specialtySelect.options[i].textContent
      });
    }
  }

  // If we don't have specialties, we can't assign them
  if (specialties.length === 0) return;

  // For each part, assign a specialty if one isn't already assigned
  for (let partNum = 1; partNum <= parts; partNum++) {
    if (!window.partSpecialties[partNum]) {
      // Use modulo to cycle through available specialties
      const specialtyIndex = (partNum - 1) % specialties.length;
      window.partSpecialties[partNum] = specialties[specialtyIndex].id;
    }
  }
}

function initializePizzaFeatures() {

  // Add global event listener to save current part changes before closing modal
  const closeButtons = document.querySelectorAll('.cerrar-modal');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      // Save changes before closing
      if (window.currentSelectedPart !== null) {
        saveCurrentPartChanges();
      }
    });
  });
}

// En la función abrirModalEdicionItem, asegúrate de restaurar correctamente la configuración de la pizza
async function abrirModalEdicionItem(item, index) {
  const productoOriginal = productosData.find(p => p.id === item.id);

  if (!productoOriginal) {
    console.error("Producto original no encontrado");
    return;
  }

  productoSeleccionadoInstr = {
    id: item.id,
    nombre: item.nombre,
    precio: productoOriginal.precio || 0,
    instrucciones: item.instrucciones || ''
  };

  indexItemEditarInstr = index;

  document.getElementById('modal-producto-nombre-instr').textContent = item.nombre;

  const modalContent = document.querySelector('.modal-content');
  const medidaContainer = document.querySelector('.medida');

  const esPizza = isPizza(productoOriginal);
  let pizzaManager = null;

  // LIMPIAR SABORES AL INICIO DE LA EDICIÓN
  limpiarSaboresAlitas();

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
      const sizeSelect = document.getElementById('pizza-size-select');
      //sizeSelect.addEventListener('change', actualizarPrecioModal);
      if (sizeSelect && item.pizzaConfig.size) {
        sizeSelect.value = item.pizzaConfig.size;
      }

      const partsSelect = document.getElementById('pizza-parts-select');
      if (partsSelect && item.pizzaConfig.parts) {
        partsSelect.value = item.pizzaConfig.parts;
        pizzaManager.pizzaCircleManager.drawSegments(item.pizzaConfig.parts);
      }

      if (item.pizzaConfig.partSpecialties) {
        window.partSpecialties = JSON.parse(JSON.stringify(item.pizzaConfig.partSpecialties));
      }

      if (item.ingredientes && item.ingredientes.length > 0) {
        const ingByPart = {};

        item.ingredientes.forEach(ing => {
          const part = ing.part || 1;
          if (!ingByPart[part]) {
            ingByPart[part] = [];
          }
          ingByPart[part].push(ing);
        });

        for (const part in ingByPart) {
          window.pizzaPartIngredients[part] = [...ingByPart[part]];
        }
      }
      else if (item.pizzaConfig.partIngredients) {
        window.pizzaPartIngredients = JSON.parse(JSON.stringify(item.pizzaConfig.partIngredients));
      }

      setTimeout(() => {
        for (const partNum in window.pizzaPartIngredients) {
          const hasIngredients = window.pizzaPartIngredients[partNum] &&
            window.pizzaPartIngredients[partNum].length > 0;
          pizzaManager.pizzaCircleManager.markPartWithIngredients(parseInt(partNum), hasIngredients);
        }

        const especialidadId = window.partSpecialties["1"] || "";

        const specialtySelect = document.getElementById('pizza-specialty-select');
        if (specialtySelect && window.partSpecialties["1"]) {
          specialtySelect.value = window.partSpecialties["1"];
        }
      }, 100);
    }
  } else if (isProductInSubcategory(productoOriginal, 'sincronizadas')) {
    medidaContainer.style.display = 'block';
    pizzaManager = await setupQuesadillaCustomizationUI(medidaContainer, item.id);
  
    // Restore quesadilla configuration from saved item
    if (item.quesadillaConfig) {
      const sizeSelect = document.getElementById('quesadilla-size-select');
      if (sizeSelect && item.quesadillaConfig.size) {
        sizeSelect.value = item.quesadillaConfig.size;
      }
  
      const partsSelect = document.getElementById('quesadilla-parts-select');
      if (partsSelect && item.quesadillaConfig.parts) {
        partsSelect.value = item.quesadillaConfig.parts;
        pizzaManager.quesadillaCircleManager.drawSegments(item.quesadillaConfig.parts);
      }
  
      if (item.quesadillaConfig.partSpecialties) {
        window.partSpecialties = JSON.parse(JSON.stringify(item.quesadillaConfig.partSpecialties));
      }
  
      if (item.ingredientes && item.ingredientes.length > 0) {
        const ingByPart = {};
  
        item.ingredientes.forEach(ing => {
          const part = ing.part || 1;
          if (!ingByPart[part]) {
            ingByPart[part] = [];
          }
          ingByPart[part].push(ing);
        });
  
        for (const part in ingByPart) {
          window.quesadillaPartIngredients[part] = [...ingByPart[part]];
        }
      }
      else if (item.quesadillaConfig.partIngredients) {
        window.quesadillaPartIngredients = JSON.parse(JSON.stringify(item.quesadillaConfig.partIngredients));
      }
  
      setTimeout(() => {
        for (const partNum in window.quesadillaPartIngredients) {
          const hasIngredients = window.quesadillaPartIngredients[partNum] &&
            window.quesadillaPartIngredients[partNum].length > 0;
          pizzaManager.quesadillaCircleManager.markPartWithIngredients(parseInt(partNum), hasIngredients);
        }
  
        const specialtySelect = document.getElementById('quesadilla-specialty-select');
        if (specialtySelect && window.partSpecialties["1"]) {
          specialtySelect.value = window.partSpecialties["1"];
        }
      }, 100);
    }
  } else {
    medidaContainer.style.display = 'none';
  }



  /*if (isProductInSubcategory(productoOriginal, 'sincronizadas')) {
    medidaContainer.style.display = 'block';
    pizzaManager = await setupQuesadillaCustomizationUI(medidaContainer, item.id);

    // Restore pizza configuration from saved item
    if (item.QuesadillaConfig) {
      const sizeSelect = document.getElementById('quesadilla-size-select');
      //sizeSelect.addEventListener('change', actualizarPrecioModal);
      if (sizeSelect && item.quesadillaConfig.size) {
        sizeSelect.value = item.quesadillaConfig.size;
      }

      const partsSelect = document.getElementById('quesadilla-parts-select');
      if (partsSelect && item.quesadillaConfig.parts) {
        partsSelect.value = item.quesadillaConfig.parts;
        quesadillaManager.quesadillaCircleManager.drawSegments(item.quesadillaConfig.parts);
      }

      if (item.quesadillaConfig.partSpecialties) {
        window.partSpecialties = JSON.parse(JSON.stringify(item.quesadillaConfig.partSpecialties));
      }

      if (item.ingredientes && item.ingredientes.length > 0) {
        const ingByPart = {};

        item.ingredientes.forEach(ing => {
          const part = ing.part || 1;
          if (!ingByPart[part]) {
            ingByPart[part] = [];
          }
          ingByPart[part].push(ing);
        });

        for (const part in ingByPart) {
          window.quesadillaPartIngredients[part] = [...ingByPart[part]];
        }
      }
      else if (item.quesadillaConfig.partIngredients) {
        window.quesadillaPartIngredients = JSON.parse(JSON.stringify(item.quesadillaConfig.partIngredients));
      }

      setTimeout(() => {
        for (const partNum in window.quesadillaPartIngredients) {
          const hasIngredients = window.quesadillaPartIngredients[partNum] &&
            window.quesadillaPartIngredients[partNum].length > 0;
          quesadillaManager.quesadillaCircleManager.markPartWithIngredients(parseInt(partNum), hasIngredients);
        }

        const especialidadId = window.partSpecialties["1"] || "";

        const specialtySelect = document.getElementById('quesadilla-specialty-select');
        if (specialtySelect && window.partSpecialties["1"]) {
          specialtySelect.value = window.partSpecialties["1"];
        }
      }, 100);
    }
  }*/


  // MANEJAR ALITAS Y BONELESS - EDICIÓN (con datos guardados)
  if (isProductInSubcategory(productoOriginal, 'alitas') || isProductInSubcategory(productoOriginal, 'boneless')) {
    medidaContainer.style.display = 'none';
    // Pasar los sabores guardados si existen
    const saboresGuardados = item.sabores || null;
    crearInterfazSabores(productoOriginal, true, saboresGuardados); // true = es edición
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
        checkbox.addEventListener('change', function () {
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
  window.currentQuesadillaManager = pizzaManager;

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


// function to retrieve sincronizadas specialties from Firestore
async function obtenerEspecialidadesQuesadilla() {
  mostrarCargando(true);

  try {
    // Get all products that are in the "comida" category and "pizzas" subcategory
    const especialidadesRef = db.collection('productos')
      .where("categoria", "==", "comida")
      .where("subcategoria", "==", "sincronizadas");

    const querySnapshot = await especialidadesRef.get();

    if (querySnapshot.empty) {
      console.log("No se encontraron especialidades de sincronizadas");
      mostrarCargando(false);
      return [];
    }

    const especialidadesQuesadilla = [];
    querySnapshot.forEach((doc) => {
      especialidadesQuesadilla.push({
        id: doc.id,
        nombre: doc.data().nombre
      });
    });

    console.log("Especialidades de sincronizada encontradas:", especialidadesQuesadilla);
    return especialidadesQuesadilla;

  } catch (error) {
    console.error("Error al obtener especialidades de las sincronizadas:", error);
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
    drawSegments: function (parts) {
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

    selectPart: function (partNumber) {
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
    markPartWithIngredients: function (partNumber, hasIngredients) {
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
  // Save the currently selected ingredients for the current part
  if (window.currentSelectedPart !== null) {
    // Check if we're dealing with pizza or quesadilla
    if (window.currentPizzaManager && window.currentPizzaManager.pizzaCircleManager) {
      window.pizzaPartIngredients[window.currentSelectedPart] = [...ingredientesSeleccionados];
      
      // Update visual indicator for parts with ingredients
      const hasIngredients = ingredientesSeleccionados.length > 0;
      window.currentPizzaManager.pizzaCircleManager.markPartWithIngredients(
        window.currentSelectedPart,
        hasIngredients
      );
    } else if (window.currentQuesadillaManager && window.currentQuesadillaManager.quesadillaCircleManager) {
      window.quesadillaPartIngredients[window.currentSelectedPart] = [...ingredientesSeleccionados];
      
      // Update visual indicator for quesadillas with ingredients
      const hasIngredients = ingredientesSeleccionados.length > 0;
      window.currentQuesadillaManager.quesadillaCircleManager.markPartWithIngredients(
        window.currentSelectedPart,
        hasIngredients
      );
    }
  }
}


async function setupQuesadillaCustomizationUI(container, productoId) {
  // Clear any existing quesadilla UI elements
  const existingSizeContainer = container.querySelector('.quesadilla-size-container');
  if (existingSizeContainer) {
    existingSizeContainer.remove();
  }
  
  const existingPartsContainer = container.querySelector('.quesadilla-parts-container');
  if (existingPartsContainer) {
    existingPartsContainer.remove();
  }
  
  const existingSpecialtyContainer = container.querySelector('.quesadilla-specialty-container');
  if (existingSpecialtyContainer) {
    existingSpecialtyContainer.remove();
  }
  
  const existingQuesadillaContainer = container.querySelector('.quesadilla-container');
  if (existingQuesadillaContainer) {
    existingQuesadillaContainer.remove();
  }

  // Create parts selection
  const partsContainer = document.createElement('div');
  partsContainer.className = 'quesadilla-parts-container modal-section';
  partsContainer.innerHTML = `
    <div class="parts-title">Número de Quesadillas:</div>
    <select id="quesadilla-size-select">
      ${getQuesadillaSizes().map(size =>
    `<option value="${size.id}" data-precio="${size.precio}">${size.nombre}</option>`
  ).join('')}
    </select>
  `;

  // Create specialty selection
  const specialtyContainer = document.createElement('div');
  specialtyContainer.className = 'quesadilla-specialty-container modal-section';
  specialtyContainer.innerHTML = `
    <div class="specialty-title">Especialidad:</div>
    <select id="quesadilla-specialty-select">
      <option value="">Cargando especialidades...</option>
    </select>
  `;

  // Add all containers to the main container
  //container.appendChild(sizeContainer);
  container.appendChild(partsContainer);
  container.appendChild(specialtyContainer);

  // Initialize global variables if not yet set
  if (!window.quesadillaPartIngredients) window.quesadillaPartIngredients = {};
  if (!window.partSpecialties) window.partSpecialties = {};
  window.previousSelectedPart = null;
  window.currentSelectedPart = null;

  // Set up quesadilla division visualization
  const quesadillaCircleManager = setupQuesadillaDivision(container, (partNumber) => {
    // This function is called when a quesadilla is selected

    // Save ingredients for the previous part if it exists
    if (window.previousSelectedPart !== null && window.previousSelectedPart !== partNumber) {
      saveCurrentPartChanges();
    }

    // Update the selected part
    window.currentSelectedPart = partNumber;

    // Load ingredients for the selected quesadilla
    const savedIngredients = window.quesadillaPartIngredients[partNumber] || [];
    ingredientesSeleccionados = [...savedIngredients];
    window.previousSelectedPart = partNumber;

    // Update the specialty select for this quesadilla
    const specialtySelect = document.getElementById('quesadilla-specialty-select');
    const currentSpecialty = window.partSpecialties[partNumber] || '';
    if (specialtySelect) {
      specialtySelect.value = currentSpecialty;
    }

    // Load ingredients for this quesadilla, aqui no es el problema
    loadIngredientsForPart(productoId, partNumber, currentSpecialty);
  });

  // Load quesadilla specialties
  const especialidades = await obtenerEspecialidadesQuesadilla();
  const specialtySelect = document.getElementById('quesadilla-specialty-select');

  // Clear and populate the specialty select
  specialtySelect.innerHTML = `
    <option>Seleccione una especialidad</option>
    ${especialidades.map(esp =>
    `<option value="${esp.id}">${esp.nombre}</option>`
  ).join('')}
  `;

  // Set up event listeners
  const partsSelect = document.getElementById('quesadilla-size-select');
  partsSelect.addEventListener('change', () => {
    const newParts = parseInt(partsSelect.value);
    
    // Save the current part's changes first
    saveCurrentPartChanges();
    
    // Clear existing ingredients for parts that no longer exist
    const existingParts = Object.keys(window.quesadillaPartIngredients).map(k => parseInt(k));
    existingParts.forEach(partNum => {
      if (partNum > newParts) {
        delete window.quesadillaPartIngredients[partNum];
        delete window.partSpecialties[partNum];
      }
    });
  
    // Redraw the quesadillas with the new number
    quesadillaCircleManager.drawSegments(newParts);
  
    // Initialize new parts if increasing
    for (let i = 1; i <= newParts; i++) {
      if (!window.partSpecialties[i]) {
        // Only set default for first part if no specialty exists
        if (i === 1 && specialtySelect.options.length > 1) {
          for (let j = 1; j < specialtySelect.options.length; j++) {
            if (specialtySelect.options[j].value) {
              window.partSpecialties[i] = specialtySelect.options[j].value;
              break;
            }
          }
        }
      }
    }
  
    // Select the first quesadilla automatically
    setTimeout(() => {
      quesadillaCircleManager.selectPart(1);
  
      // Update all quesadilla visuals
      for (const partNum in window.quesadillaPartIngredients) {
        const partNumber = parseInt(partNum);
        if (partNumber <= newParts) {
          const hasIngredients = window.quesadillaPartIngredients[partNum] &&
            window.quesadillaPartIngredients[partNum].length > 0;
          quesadillaCircleManager.markPartWithIngredients(partNumber, hasIngredients);
        }
      }
    }, 100);
  });

  specialtySelect.addEventListener('change', async function () {
    if (!window.currentSelectedPart) return;

    const especialidadId = this.value;
    window.partSpecialties[window.currentSelectedPart] = especialidadId;

    // Load ingredients for the selected specialty
    await loadIngredientsForPart(productoId, window.currentSelectedPart, especialidadId);
  });

  // Initialize with 1 quesadilla
  quesadillaCircleManager.drawSegments(1);

  // Select the first quesadilla initially after a short delay

  //aqui  creo que esta el problema
  setTimeout(() => {
    //quesadillaCircleManager.selectPart(1);

    // Also auto-select first specialty if parts don't have one yet
    if (!window.partSpecialties["1"] && specialtySelect.options.length > 1) {
      // Use the current product ID
      if (productoId) {
        // Look for this product in specialties
        for (let i = 0; i < specialtySelect.options.length; i++) {
          if (specialtySelect.options[i].value === productoId) {
            specialtySelect.selectedIndex = i;
            window.partSpecialties["1"] = productoId;
            break;
          }
        }
      }

      // If no match, use first non-empty option
      if (!window.partSpecialties["1"]) {
        for (let i = 0; i < specialtySelect.options.length; i++) {
          if (specialtySelect.options[i].value) {
            specialtySelect.selectedIndex = i;
            window.partSpecialties["1"] = specialtySelect.options[i].value;
            break;
          }
        }
      }

      // Load ingredients for this specialty
      const specialty = window.partSpecialties["1"] || "";
    }
  }, 100);

  // Return the quesadilla manager and helper functions
  return {
    quesadillaCircleManager,

    // Method to get all quesadilla configuration
    getQuesadillaConfig: function () {
      // Save the current configuration before returning the result
      saveCurrentPartChanges();
      return {
        size: document.getElementById('quesadilla-size-select').value,
        parts: parseInt(document.getElementById('quesadilla-parts-select').value),
        partIngredients: window.quesadillaPartIngredients,
        partSpecialties: window.partSpecialties
      };
    },

    // Method to mark quesadillas with ingredients
    updatePartStatus: function () {
      for (const partNum in window.quesadillaPartIngredients) {
        const hasIngredients = window.quesadillaPartIngredients[partNum] &&
          window.quesadillaPartIngredients[partNum].length > 0;
        quesadillaCircleManager.markPartWithIngredients(parseInt(partNum), hasIngredients);
      }
    }
  };
}

function setupQuesadillaDivision(container, onPartSelect) {
  // Get or create the quesadilla container
  let quesadillaContainer = container.querySelector('.quesadilla-container');
  if (!quesadillaContainer) {
    quesadillaContainer = document.createElement('div');
    quesadillaContainer.className = 'quesadilla-container';
    quesadillaContainer.innerHTML = `
      <div class="quesadilla-header">
        <h3>Selecciona una quesadilla para personalizar</h3>
      </div>
      <div id="quesadillas-wrapper" class="quesadillas-wrapper">
        <!-- Quesadillas will be added here -->
      </div>
      <div id="quesadilla-part-output" class="selected-part">Selecciona una quesadilla</div>
    `;

    container.appendChild(quesadillaContainer);
  }

  const wrapper = quesadillaContainer.querySelector('#quesadillas-wrapper');
  const output = quesadillaContainer.querySelector('#quesadilla-part-output');

  // Colores para las quesadillas
  const quesadillaColors = [
    '#FFE4B5', // Beige claro
    '#DEB887', // Marrón claro  
    '#F4A460'  // Sandy brown
  ];

  // Función para crear path de quesadilla realista
  function createRealisticQuesadillaPath() {
    return "M 15 65 Q 15 15, 60 10 Q 105 15, 105 65 Q 90 45, 75 48 Q 60 52, 45 48 Q 30 45, 15 65 Z";
  }

  return {
    drawSegments: function (parts) {
      wrapper.innerHTML = '';
      wrapper.className = `quesadillas-wrapper count-${parts}`;

      for (let i = 0; i < parts; i++) {
        const quesadillaDiv = document.createElement('div');
        quesadillaDiv.className = 'quesadilla';
        quesadillaDiv.setAttribute('data-part', i + 1);

        // Añadir retraso de animación
        quesadillaDiv.style.animationDelay = (i * 0.2) + 's';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 80');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', createRealisticQuesadillaPath());
        path.setAttribute('fill', quesadillaColors[i % quesadillaColors.length]);
        path.setAttribute('class', 'quesadilla-path');

        // Añadir textura/patrón interior
        const innerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        innerPath.setAttribute('d', 'M 25 55 Q 40 35, 55 38 Q 70 35, 85 38 Q 95 42, 95 55');
        innerPath.setAttribute('fill', 'none');
        innerPath.setAttribute('stroke', '#D2B48C');
        innerPath.setAttribute('stroke-width', '2');
        innerPath.setAttribute('opacity', '0.6');

        // Añadir puntitos de queso
        for (let j = 0; j < 3; j++) {
          const cheese = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          cheese.setAttribute('cx', 35 + j * 15 + Math.random() * 10);
          cheese.setAttribute('cy', 45 + Math.random() * 10);
          cheese.setAttribute('r', '2');
          cheese.setAttribute('fill', '#FFFF99');
          cheese.setAttribute('opacity', '0.8');
          svg.appendChild(cheese);
        }

        svg.appendChild(path);
        svg.appendChild(innerPath);
        quesadillaDiv.appendChild(svg);

        // Add click event to select this quesadilla
        quesadillaDiv.addEventListener('click', () => {
          const partNumber = i + 1;
          // Guardar cambios de la parte actual antes de cambiar
          if (window.currentSelectedPart !== null && window.currentSelectedPart !== partNumber) {
            saveCurrentPartChanges();
          }

          // Seleccionar la nueva quesadilla
          this.selectPart(partNumber);
        });

        wrapper.appendChild(quesadillaDiv);
      }
    },

    selectPart: function (partNumber) {
      // Reset previously selected quesadillas
      wrapper.querySelectorAll('.quesadilla.selected').forEach(q => {
        q.classList.remove('selected');
      });

      // Select the new quesadilla
      const selectedQuesadilla = wrapper.querySelector(`.quesadilla[data-part="${partNumber}"]`);
      if (selectedQuesadilla) {
        selectedQuesadilla.classList.add('selected');
      }

      // Update the output text
      output.textContent = `Quesadilla ${partNumber} seleccionada`;

      // Call the callback function
      if (onPartSelect) {
        onPartSelect(partNumber);
      }
    },

    // Method to mark a quesadilla as having ingredients
    markPartWithIngredients: function (partNumber, hasIngredients) {
      const quesadilla = wrapper.querySelector(`.quesadilla[data-part="${partNumber}"]`);
      if (quesadilla) {
        if (hasIngredients) {
          quesadilla.classList.add('has-ingredients');
        } else {
          quesadilla.classList.remove('has-ingredients');
        }
      }
    }
  };
}


// Actualiza la función setupPizzaCustomizationUI para manejar mejor el cambio entre partes
async function setupPizzaCustomizationUI(container, productoId) {
  // Create size selection
  container.innerHTML = []
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

  // Initialize global variables if not yet set
  if (!window.pizzaPartIngredients) window.pizzaPartIngredients = {};
  if (!window.partSpecialties) window.partSpecialties = {};
  window.previousSelectedPart = null;
  window.currentSelectedPart = null;

  // Set up pizza division visualization
  const pizzaCircleManager = setupPizzaDivision(container, (partNumber) => {
    // This function is called when a part is selected

    // Save ingredients for the previous part if it exists
    if (window.previousSelectedPart !== null && window.previousSelectedPart !== partNumber) {
      saveCurrentPartChanges();
    }

    // Update the selected part
    window.currentSelectedPart = partNumber;

    // Load ingredients for the selected part
    const savedIngredients = window.pizzaPartIngredients[partNumber] || [];
    ingredientesSeleccionados = [...savedIngredients];
    window.previousSelectedPart = partNumber;

    // Update the specialty select for this part
    const specialtySelect = document.getElementById('pizza-specialty-select');
    const currentSpecialty = window.partSpecialties[partNumber] || '';
    if (specialtySelect) {
      specialtySelect.value = currentSpecialty;
    }

    // Load ingredients for this part
    loadIngredientsForPart(productoId, partNumber, currentSpecialty);//Aqui se mandan llamar los ingredientes una vez
  });

  // Load pizza specialties
  const especialidades = await obtenerEspecialidadesPizza();
  const specialtySelect = document.getElementById('pizza-specialty-select');

  // Clear and populate the specialty select
  specialtySelect.innerHTML = `
    <option>Seleccione una especialidad</option>
    ${especialidades.map(esp =>
    `<option value="${esp.id}">${esp.nombre}</option>`
  ).join('')}
  `;

  // Set up event listeners
  const partsSelect = document.getElementById('pizza-parts-select');
  partsSelect.addEventListener('change', () => {
    const oldParts = Object.keys(window.pizzaPartIngredients).length > 0 ?
      parseInt(Object.keys(window.pizzaPartIngredients).sort((a, b) => parseInt(a) - parseInt(b)).pop()) : 0;
    const newParts = parseInt(partsSelect.value);

    // Save the current part's changes first
    saveCurrentPartChanges();

    // Redraw the circle with the new number of parts
    pizzaCircleManager.drawSegments(newParts);

    // If we're increasing parts, initialize new parts with a default specialty
    // Keep data for existing parts
    if (newParts > oldParts) {
      // Get available specialties to assign to new parts
      const specialties = [];
      for (let i = 0; i < specialtySelect.options.length; i++) {
        if (specialtySelect.options[i].value) {
          specialties.push(specialtySelect.options[i].value);
        }
      }

      // Loop through all parts to initialize new ones
      for (let i = 1; i <= newParts; i++) {
        // If this part doesn't have a specialty assigned yet, assign one
        if (!window.partSpecialties[i] && i > oldParts) {
          // Use the first specialty for the first part if not set
          if (i === 1 && specialties.length > 0) {
            window.partSpecialties[i] = specialties[0];
          }
          // For additional parts, use the next specialty in the list
          else if (specialties.length > i - 1) {
            window.partSpecialties[i] = specialties[Math.min(i - 1, specialties.length - 1)];
          }
        }
      }
    }

    // Select the first part automatically
    setTimeout(() => {
      pizzaCircleManager.selectPart(1);

      // Load ingredients for part 1
      const specialty = window.partSpecialties["1"] || "";
      //loadIngredientsForPart(productoId, 1, specialty);//Aqui quizas se manden llamar los ingredientes cuando cambias de parte

      // Update all part visuals
      for (const partNum in window.pizzaPartIngredients) {
        const partNumber = parseInt(partNum);
        if (partNumber <= newParts) { // Only update parts that still exist
          const hasIngredients = window.pizzaPartIngredients[partNum] &&
            window.pizzaPartIngredients[partNum].length > 0;
          pizzaCircleManager.markPartWithIngredients(partNumber, hasIngredients);
        }
      }
    }, 100);
  });

  specialtySelect.addEventListener('change', async function () {
    if (!window.currentSelectedPart) return;

    const especialidadId = this.value;
    window.partSpecialties[window.currentSelectedPart] = especialidadId;

    // Load ingredients for the selected specialty
    await loadIngredientsForPart(productoId, window.currentSelectedPart, especialidadId);
  });

  // Initialize with pizza divided in 1 part
  pizzaCircleManager.drawSegments(1);

  // Select the whole pizza initially after a short delay
  setTimeout(() => {
    pizzaCircleManager.selectPart(1);

    // Also auto-select first specialty if parts don't have one yet
    if (!window.partSpecialties["1"] && specialtySelect.options.length > 1) {
      // Use the current product ID
      if (productoId) {
        // Look for this product in specialties
        for (let i = 0; i < specialtySelect.options.length; i++) {
          if (specialtySelect.options[i].value === productoId) {
            specialtySelect.selectedIndex = i;
            window.partSpecialties["1"] = productoId;
            break;
          }
        }
      }

      // If no match, use first non-empty option
      if (!window.partSpecialties["1"]) {
        for (let i = 0; i < specialtySelect.options.length; i++) {
          if (specialtySelect.options[i].value) {
            specialtySelect.selectedIndex = i;
            window.partSpecialties["1"] = specialtySelect.options[i].value;
            break;
          }
        }
      }

      // Load ingredients for this specialty
      const specialty = window.partSpecialties["1"] || "";
      //loadIngredientsForPart(productoId, 1, specialty);//Aqui se vuelven a llamar los ingredientes
    }
  }, 100);

  // Return the pizza manager and helper functions
  return {
    pizzaCircleManager,

    // Method to get all pizza configuration
    getPizzaConfig: function () {
      // Save the current configuration before returning the result
      saveCurrentPartChanges();
      return {
        size: document.getElementById('pizza-size-select').value,
        parts: parseInt(document.getElementById('pizza-parts-select').value),
        partIngredients: window.pizzaPartIngredients,
        partSpecialties: window.partSpecialties
      };
    },

    // Method to mark parts with ingredients
    updatePartStatus: function () {
      for (const partNum in window.pizzaPartIngredients) {
        const hasIngredients = window.pizzaPartIngredients[partNum] &&
          window.pizzaPartIngredients[partNum].length > 0;
        pizzaCircleManager.markPartWithIngredients(parseInt(partNum), hasIngredients);
      }
    }
  };
}

// Actualización de la función loadIngredientsForPart para usar variables globales
/*async function loadIngredientsForPart(productoId, partNumber, especialidadId) {
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
    checkbox.addEventListener('change', function () {
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
}*/

// Modified function to open the product instructions modal
async function loadIngredientsForPart(productoId, partNumber, especialidadId) {
  const seccionIngredientes = document.getElementById('ingredientes-seccion');
  const listaIngredientes = document.getElementById('ingredientes-lista');

  // Show ingredients section
  seccionIngredientes.style.display = 'block';

  // Clear ingredients list
  listaIngredientes.innerHTML = '';

  // Get current selected ingredients for this part
  const currentPartIngredients = window.pizzaPartIngredients[partNumber] || [];

  // Store previous selections to restore them
  const prevSelectedIngIds = new Set();
  currentPartIngredients.forEach(ing => prevSelectedIngIds.add(ing.id));

  // Initialize selected ingredients list from current part or with empty array
  ingredientesSeleccionados = [...currentPartIngredients];

  // If a specialty is selected, get its ingredients
  let ingredientes = [];
  if (especialidadId) {
    ingredientes = await obtenerIngredientesPorEspecialidad(especialidadId);

    // If this is a new selection and we don't have saved ingredients,
    // use the default selection from the specialty
    const isNewSelection = currentPartIngredients.length === 0;
    
    if (isNewSelection) {
      // Select all default ingredients
      ingredientes.forEach(ing => {
        if (ing.default) {
          ingredientesSeleccionados.push({
            id: ing.id,
            nombre: ing.nombre,
            precio: ing.precio || 0,
            part: partNumber
          });

          // Also add to the set for checkbox state
          prevSelectedIngIds.add(ing.id);
        }
      });

      // Save this initial selection
      window.pizzaPartIngredients[partNumber] = [...ingredientesSeleccionados];
    }
  } else {
    // Otherwise, get the default ingredients for this pizza
    ingredientes = await obtenerIngredientesProducto(productoId);
  }

  // No ingredients found
  if (ingredientes.length === 0) {
    listaIngredientes.innerHTML = '<div class="no-ingredientes">No hay ingredientes disponibles</div>';
    return;
  }

  // Create UI for each ingredient
  ingredientes.forEach(ingrediente => {
    // Check if this ingredient was previously selected
    const estaSeleccionado = prevSelectedIngIds.has(ingrediente.id);

    // Create ingredient item
    const ingredienteItem = document.createElement('div');
    ingredienteItem.className = 'ingrediente-item';

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'ingrediente-checkbox';
    checkbox.id = `ingrediente-${ingrediente.id}`;
    checkbox.checked = estaSeleccionado;

    // Handle checkbox change
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        // Only add if not already in the list
        const exists = ingredientesSeleccionados.some(i => i.id === ingrediente.id);
        if (!exists) {
          // Add to selected ingredients
          ingredientesSeleccionados.push({
            id: ingrediente.id,
            nombre: ingrediente.nombre,
            precio: ingrediente.precio || 0,
            part: partNumber
          });
        }
      } else {
        // Remove from selected ingredients
        const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
        if (index >= 0) {
          ingredientesSeleccionados.splice(index, 1);
        }
      }

      // Save immediately to global variable
      window.pizzaPartIngredients[partNumber] = [...ingredientesSeleccionados];

      // Update the visual state of the part
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

    const select = document.getElementById('pizza-size-select');

    const selectedOption = select.options[select.selectedIndex];
    const precioTamano = parseInt(selectedOption.getAttribute('data-precio'));
    console.log(precioTamano);

    precioFinal = precioTamano + precioIngredientes;
    productoSeleccionadoInstr.precioCalculado = precioFinal;
    select.addEventListener('change', actualizarPrecioModal);


  }

  if (isProductInSubcategory(productoOriginal, 'sincronizadas')) {
    console.log("si esta agarrando bien la subcategoria")
    // Save current part's ingredients first
    if (window.currentSelectedPart !== null) {
      saveCurrentPartChanges();
    }

    // Calculate price from all parts' ingredients
    let precioIngredientes = 0;
    for (const parte in window.quesadillaPartIngredients) {
      const ingredientesParte = window.quesadillaPartIngredients[parte] || [];
      for (const ing of ingredientesParte) {
        if (ing.precio) {
          precioIngredientes += ing.precio;
        }
      }
    }

    const select = document.getElementById('quesadilla-size-select');
    const selectedOption = select.options[select.selectedIndex];
    const precioQuesadilla = selectedOption.getAttribute('value');  
    const precioTamano = parseInt(select.options[0].getAttribute('data-precio'));
    console.log(precioTamano);
    console.log(selectedOption)

    if(precioQuesadilla == "1 Pieza"){
      precioFinal += precioIngredientes;
    }

    if(precioQuesadilla == "2 Piezas"){
      precioFinal = (precioFinal*2) + precioIngredientes;
    }

    if(precioQuesadilla == "3 Piezas"){
      precioFinal = ((precioFinal*2)+10) + precioIngredientes;
    }

    productoSeleccionadoInstr.precioCalculado = precioFinal;

    select.addEventListener('change', actualizarPrecioModal);

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
  window.quesadillaPartIngredients = {};
  window.currentQuesadillaManager = null;

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



function obtenerNombresPorCategoria(subcategoria) {
  return productosData
    .filter(producto => producto.subcategoria === subcategoria)
    .map(producto => producto.nombre);
}
//const nombresComida = obtenerNombresPorCategoria('alitas');



async function abrirModalProductoInstrucciones(producto) {
  productoSeleccionadoInstr = producto;
  indexItemEditarInstr = -1;

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
  const esAlita = isAlita(producto);

  // LIMPIAR SABORES AL INICIO
  limpiarSaboresAlitas();

  // Clear any previous pizza UI

  //Ver si se ocupa lo mismo para las sinc
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

  // Reset global variables for pizza parts
  window.pizzaPartIngredients = {};
  window.partSpecialties = {};
  window.currentSelectedPart = null;
  window.previousSelectedPart = null;

  // Set up pizza UI for all pizzas
  if (esPizza) {
    medidaContainer.style.display = 'block';
    pizzaManager = await setupPizzaCustomizationUI(medidaContainer, producto.id);

    setTimeout(async () => {
      const specialtySelect = document.getElementById('pizza-specialty-select');
      if (specialtySelect) {
        for (let i = 0; i < specialtySelect.options.length; i++) {
          if (specialtySelect.options[i].value === producto.id) {
            specialtySelect.selectedIndex = i;
            window.partSpecialties["1"] = producto.id;

            if (window.currentPizzaManager && window.currentPizzaManager.pizzaCircleManager) {
              window.currentPizzaManager.pizzaCircleManager.markPartWithIngredients(1, true);
            }
            break;
          }
        }
      }
    }, 200);
  } else if (isProductInSubcategory(producto, 'sincronizadas')) {
    medidaContainer.style.display = 'block';
    pizzaManager = await setupQuesadillaCustomizationUI(medidaContainer, producto.id);
  
    setTimeout(async () => {
      const specialtySelect = document.getElementById('quesadilla-specialty-select');
      if (specialtySelect) {
        for (let i = 0; i < specialtySelect.options.length; i++) {
          if (specialtySelect.options[i].value === producto.id) {
            specialtySelect.selectedIndex = i;
            window.partSpecialties["1"] = producto.id;
  
            if (window.currentQuesadillaManager && window.currentQuesadillaManager.quesadillaCircleManager) {
              window.currentQuesadillaManager.quesadillaCircleManager.markPartWithIngredients(1, true);
            }
            break;
          }
        }
      }
    }, 200);
  }
  else {
    medidaContainer.style.display = 'none';
  }

  /* if (isProductInSubcategory(producto, 'sincronizadas')) {
    medidaContainer.style.display = 'block';
    pizzaManager = await setupQuesadillaCustomizationUI(medidaContainer, producto.id);

    setTimeout(async () => {
      const specialtySelect = document.getElementById('pizza-specialty-select');
      if (specialtySelect) {
        for (let i = 0; i < specialtySelect.options.length; i++) {
          if (specialtySelect.options[i].value === producto.id) {
            specialtySelect.selectedIndex = i;
            window.partSpecialties["1"] = producto.id;

            if (window.currentPizzaManager && window.currentPizzaManager.pizzaCircleManager) {
              window.currentPizzaManager.pizzaCircleManager.markPartWithIngredients(1, true);
            }
            break;
          }
        }
      }
    }, 200);
  } */

  // MANEJAR ALITAS Y BONELESS - NUEVO PRODUCTO (sin datos guardados)
  if (isProductInSubcategory(producto, 'alitas') || isProductInSubcategory(producto, 'boneless')) {
    medidaContainer.style.display = 'none';
    crearInterfazSabores(producto, false); // false = no es edición
  }
  // For non-pizza products, handle ingredients normally
  if (!esPizza) {
    const tieneIngs = await tieneIngredientes(producto.id);
    const seccionIngredientes = document.getElementById('ingredientes-seccion');
    const listaIngredientes = document.getElementById('ingredientes-lista');

    if (tieneIngs) {
      listaIngredientes.innerHTML = '';
      seccionIngredientes.style.display = 'block';
      const ingredientes = await obtenerIngredientesProducto(producto.id);

      ingredientes.forEach(ingrediente => {
        const ingredienteItem = document.createElement('div');
        ingredienteItem.className = 'ingrediente-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'ingrediente-checkbox';
        checkbox.id = 'ingrediente-' + ingrediente.id;
        checkbox.checked = ingrediente.default;

        if (ingrediente.default) {
          ingredientesSeleccionados.push({
            id: ingrediente.id,
            nombre: ingrediente.nombre,
            precio: ingrediente.precio || 0
          });
        }

        checkbox.addEventListener('change', function () {
          if (this.checked) {
            ingredientesSeleccionados.push({
              id: ingrediente.id,
              nombre: ingrediente.nombre,
              precio: ingrediente.precio || 0
            });
          } else {
            const index = ingredientesSeleccionados.findIndex(i => i.id === ingrediente.id);
            if (index >= 0) {
              ingredientesSeleccionados.splice(index, 1);
            }
          }
          actualizarPrecioModal();
        });

        const nombre = document.createElement('label');
        nombre.htmlFor = 'ingrediente-' + ingrediente.id;
        nombre.className = 'ingrediente-nombre';
        nombre.textContent = ingrediente.nombre;

        let precioElement = null;
        if (ingrediente.precio > 0) {
          precioElement = document.createElement('span');
          precioElement.className = 'ingrediente-precio';
          precioElement.textContent = '+ ' + formatearMoneda(ingrediente.precio || 0);
        }

        ingredienteItem.appendChild(checkbox);
        ingredienteItem.appendChild(nombre);
        if (precioElement) {
          ingredienteItem.appendChild(precioElement);
        }

        listaIngredientes.appendChild(ingredienteItem);
      });
    } else {
      seccionIngredientes.style.display = 'none';
    }
  }

  document.getElementById('producto-instrucciones').value = '';
  document.getElementById('modal-instrucciones').style.display = 'flex';
  document.getElementById('btn-guardar-instrucciones').textContent = 'Agregar a la orden';

  window.currentPizzaManager = pizzaManager;
  window.currentQuesadillaManager = pizzaManager;

  actualizarPrecioModal();
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
      /*if (item.pizzaConfig && item.pizzaConfig.partSpecialties) {
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
      }*/

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
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));

      if (index >= 0 && index < ordenActual.items.length) {
        const item = ordenActual.items[index];
        abrirModalEdicionItem(item, index);
      }
    });
  });

  document.querySelectorAll('.btn-reducir').forEach(btn => {
    btn.addEventListener('click', function () {
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
    btn.addEventListener('click', function () {
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
    btn.addEventListener('click', function () {
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

const precioBase = productoSeleccionadoInstr.precioCalculado !== undefined 
  ? productoSeleccionadoInstr.precioCalculado 
  : (productoOriginal.precio || 0);

  // Save changes of the current part for pizzas before processing
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
    instrucciones: instrucciones,
    uniqueId: Date.now() // Add a unique ID to prevent merging with similar items
  };

  // For pizza products, get the configuration
  if (isPizza(productoOriginal) && window.currentPizzaManager) {
    // Get the complete pizza configuration
    item.pizzaConfig = window.currentPizzaManager.getPizzaConfig();

    // Create a description for split pizzas
    if (item.pizzaConfig.parts > 1) {
      // Get specialty names for each part
      const especialidadesPorParte = [];

      for (let i = 1; i <= item.pizzaConfig.parts; i++) {
        const especialidadId = item.pizzaConfig.partSpecialties[i];
        if (especialidadId) {
          // Find specialty product
          const especialidad = productosData.find(p => p.id === especialidadId);
          if (especialidad) {
            especialidadesPorParte.push(`Parte ${i}: ${especialidad.nombre}`);
          }
        }
      }

      if (especialidadesPorParte.length > 0) {
        item.descripcionPizza = `${item.pizzaConfig.parts} partes: ${especialidadesPorParte.join(', ')}`;
      } else {
        item.descripcionPizza = `${item.pizzaConfig.parts} partes`;
      }
    }

    // Save ingredients from all parts
    let allIngredients = [];
    for (const part in item.pizzaConfig.partIngredients) {
      if (item.pizzaConfig.partIngredients[part] && item.pizzaConfig.partIngredients[part].length > 0) {
        // Make sure all ingredients have the part number for display in the order
        const ingredientsWithPart = item.pizzaConfig.partIngredients[part].map(ing => ({
          ...ing,
          part: parseInt(part)
        }));
        allIngredients = [...allIngredients, ...ingredientsWithPart];
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
  if (isPizza(productoOriginal) || isProductInSubcategory(productoOriginal, 'sincronizadas')) {
    // Price already includes size and ingredients
    item.precio = precioBase;
  } else {
    // For regular products, calculate final price based on ingredients
    let precioExtra = 0;
    if (item.ingredientes && item.ingredientes.length > 0) {
      precioExtra = item.ingredientes.reduce((total, ing) => total + (ing.precio || 0), 0);
    }
    
    // Set the final price with ingredients
    item.precio = precioBase + precioExtra;
  }

  // Set the final price with ingredients
  //item.precio = precioBase + precioExtra;
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

  if (productoSeleccionadoInstr) {
    delete productoSeleccionadoInstr.precioCalculado;
  }
  
  // Clear references
  productoSeleccionadoInstr = null;
  indexItemEditarInstr = -1;
  ingredientesSeleccionados = [];

  // Reset global pizza variables
  window.pizzaPartIngredients = {};
  window.partSpecialties = {};
  window.previousSelectedPart = null;
  window.currentSelectedPart = null;

  // En tu función de guardar
  const saboresSeleccionados = obtenerSaboresSeleccionados();
  if (saboresSeleccionados.length > 0) {
    item.sabores = saboresSeleccionados;
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
      estado: 'cocinado', // activo, ordenado, cocinado, pagado, entregado Solucion temporal ^ regresar a activo
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
      window.location.href = 'charge-order.html'; //Solucion temporal ^ regresar a orders.html
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
  console.log(ahora);
  return firebase.firestore.Timestamp.fromDate(ahora);
}

function obtenerFechaFinDia() {
  const ahora = new Date();
  ahora.setHours(23, 59, 59, 999);
  console.log(ahora);
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