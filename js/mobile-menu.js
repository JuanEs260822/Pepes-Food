// mobile-menu.js - Script independiente para el menú móvil
// Este script debe cargarse después de que el componente de navegación esté en el DOM

document.addEventListener('DOMContentLoaded', function() {
  // Intentar inicializar de inmediato
  initMobileMenu();
  
  // Y también escuchar el evento personalizado que indica que la navegación se ha cargado
  document.addEventListener('navLoaded', function() {
    console.log('Evento navLoaded detectado');
    // Reintentar inicialización después de cargar la navegación
    initMobileMenu();
  });
  
  // Intentar inicializar nuevamente después de un breve retraso
  setTimeout(initMobileMenu, 500);
  setTimeout(initMobileMenu, 1000);
  setTimeout(initMobileMenu, 2000);
});

// Función para inicializar el menú móvil
function initMobileMenu() {
  console.log('Inicializando menú móvil desde mobile-menu.js');
  
  // Verificar si ya está inicializado
  if (window.mobileMenuInitialized) {
    console.log('El menú móvil ya está inicializado');
    return;
  }
  
  // Seleccionar elementos
  const menuToggle = document.querySelector('#menu-toggle, .menu-toggle');
  const navContainer = document.querySelector('.nav-container');
  let menuOverlay = document.querySelector('.menu-overlay');
  
  // Verificar si los elementos existen
  if (!menuToggle) {
    console.error('Botón de menú no encontrado');
    return;
  }
  
  if (!navContainer) {
    console.error('Contenedor de navegación no encontrado');
    return;
  }
  
  if (!menuOverlay) {
    console.log('Overlay de menú no encontrado, creando uno nuevo');
    // Crear overlay si no existe
    const newOverlay = document.createElement('div');
    newOverlay.className = 'menu-overlay';
    newOverlay.id = 'menu-overlay';
    document.body.appendChild(newOverlay);
    menuOverlay = newOverlay;
  }
  
  console.log('Elementos de menú encontrados:', {
    menuToggle: menuToggle,
    navContainer: navContainer,
    menuOverlay: menuOverlay
  });
  
  // Función para abrir el menú
  function abrirMenu() {
    console.log('Abriendo menú');
    navContainer.classList.add('active');
    
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    }
    
    // Mostrar overlay
    menuOverlay.style.display = 'block';
    setTimeout(() => {
      menuOverlay.style.opacity = '1';
    }, 10);
    
    // Evitar scroll en el body
    document.body.style.overflow = 'hidden';
    
    // Cambiar aria-label del botón
    menuToggle.setAttribute('aria-label', 'Cerrar menú');
  }
  
  // Función para cerrar el menú
  function cerrarMenu() {
    console.log('Cerrando menú');
    navContainer.classList.remove('active');
    
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
    
    // Ocultar overlay
    menuOverlay.style.opacity = '0';
    setTimeout(() => {
      menuOverlay.style.display = 'none';
    }, 300);
    
    // Restaurar scroll en el body
    document.body.style.overflow = '';
    
    // Cambiar aria-label del botón
    menuToggle.setAttribute('aria-label', 'Abrir menú');
  }
  
  // Eliminar eventos existentes (clonar y reemplazar)
  const nuevoToggle = menuToggle.cloneNode(true);
  menuToggle.parentNode.replaceChild(nuevoToggle, menuToggle);
  
  // Actualizar referencia
  const toggleActualizado = document.querySelector('#menu-toggle, .menu-toggle');
  
  // Agregar evento de clic al botón
  toggleActualizado.addEventListener('click', function(event) {
    console.log('Click en menú toggle');
    event.preventDefault();
    event.stopPropagation();
    
    if (navContainer.classList.contains('active')) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });
  
  // Cerrar menú al hacer clic en un enlace (en móvil)
  document.querySelectorAll('.nav-link').forEach(link => {
    // Clonar y reemplazar para eliminar eventos previos
    const nuevoLink = link.cloneNode(true);
    link.parentNode.replaceChild(nuevoLink, link);
    
    // Agregar nuevo evento
    nuevoLink.addEventListener('click', function() {
      if (window.innerWidth <= 1100) {
        cerrarMenu();
      }
    });
  });
  
  // Cerrar menú al hacer clic en el overlay
  menuOverlay.addEventListener('click', cerrarMenu);
  
  // Cerrar menú al presionar Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && navContainer.classList.contains('active')) {
      cerrarMenu();
    }
  });
  
  // Eventos de resize para manejar cambios de tamaño de ventana
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1100 && navContainer.classList.contains('active')) {
      cerrarMenu();
    }
  });
  
  // Marcar como inicializado
  window.mobileMenuInitialized = true;
  
  // Agregar debug info
  console.log('Menú móvil inicializado correctamente');
  
  // Botón adicional de menú fijo para asegurarnos que siempre funciona
  const menuFijo = document.createElement('button');
  menuFijo.innerHTML = '<i class="fas fa-bars"></i>';
  menuFijo.className = 'menu-fijo';
  menuFijo.setAttribute('aria-label', 'Menú móvil auxiliar');
  menuFijo.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: var(--color-secundario);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1003;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  `;
  
  // Solo mostrar en móvil cuando el otro botón falla
  const mediaQuery = window.matchMedia('(max-width: 1100px)');
  if (mediaQuery.matches) {
    setTimeout(() => {
      if (!window.mobileMenuWorking) {
        menuFijo.style.display = 'flex';
      }
    }, 3000);
  }
  
  menuFijo.addEventListener('click', function() {
    if (navContainer.classList.contains('active')) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });
  
  document.body.appendChild(menuFijo);
}

// Ejecutar también cuando la ventana ha cargado por completo
window.addEventListener('load', function() {
  // Intentar inicializar nuevamente después de que todo haya cargado
  initMobileMenu();
});