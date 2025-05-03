// direct-mobile-menu.js - Implementación directa del menú móvil
// Este script crea directamente un menú móvil sin depender de componentes cargados dinámicamente

(function() {
  // Detectar si estamos en móvil
  //const isMobile = window.matchMedia('(max-width: 1100px)').matches;
  
  // Solo proceder si estamos en móvil
  //if (!isMobile) return;
  
  // Crear botón de menú móvil directo
  const menuButton = document.createElement('button');
  menuButton.className = 'direct-menu-toggle';
  menuButton.innerHTML = '<i class="fas fa-bars"></i>';
  menuButton.setAttribute('aria-label', 'Menú móvil');
  
  // Aplicar estilos al botón
  menuButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background-color: #ff8800;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  `;
  
  // Crear menú desplegable
  const menu = document.createElement('div');
  menu.className = 'direct-menu';
  
  // Aplicar estilos al menú
  menu.style.cssText = `
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    height: 100vh;
    background-color: #fffcdb;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 9998;
    transition: right 0.3s ease;
    overflow-y: auto;
    padding: 80px 20px 20px;
  `;
  
  // Definir enlaces del menú
  const enlaces = [
    { text: 'Panel', href: 'dashboard.html', icon: 'fa-home' },
    { text: 'Crear Orden', href: 'add-order.html', icon: 'fa-plus-circle' },
    { text: 'Órdenes', href: 'orders.html', icon: 'fa-clipboard-list' },
    { text: 'Cobrar', href: 'charge-order.html', icon: 'fa-cash-register' },
    { text: 'Productos', href: 'products.html', icon: 'fa-hamburger' },
    { text: 'Historial', href: 'past-orders.html', icon: 'fa-history' },
    { text: 'Gastos', href: 'expenses.html', icon: 'fa-receipt' },
    { text: 'Finanzas', href: 'finances.html', icon: 'fa-chart-line' },
    { text: 'Usuarios', href: 'users.html', icon: 'fa-users' },
    { text: 'VIP', href: 'vip.html', icon: 'fa-star' }
  ];
  
  // Crear elementos de menú
  enlaces.forEach(enlace => {
    const link = document.createElement('a');
    link.href = enlace.href;
    link.className = 'direct-menu-link';
    
    // Determinar si el enlace está activo
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === enlace.href) {
      link.classList.add('active');
    }
    
    // Aplicar estilos al enlace
    link.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 15px;
      color: #333;
      text-decoration: none;
      font-weight: ${currentPage === enlace.href ? 'bold' : 'normal'};
      border-radius: 4px;
      margin-bottom: 5px;
      transition: background-color 0.3s ease;
      background-color: ${currentPage === enlace.href ? '#ff8800' : 'transparent'};
      color: ${currentPage === enlace.href ? 'white' : '#333'};
    `;
    
    // Agregar ícono
    link.innerHTML = `<i class="fas ${enlace.icon}" style="width: 25px; margin-right: 10px;"></i> ${enlace.text}`;
    
    // Agregar hover effect
    link.addEventListener('mouseenter', function() {
      if (currentPage !== enlace.href) {
        this.style.backgroundColor = 'rgba(255, 136, 0, 0.1)';
      }
    });
    
    link.addEventListener('mouseleave', function() {
      if (currentPage !== enlace.href) {
        this.style.backgroundColor = 'transparent';
      }
    });
    
    menu.appendChild(link);
  });
  
  // Agregar botón de cerrar sesión
  const logoutBtn = document.createElement('button');
  logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i> Cerrar Sesión';
  logoutBtn.className = 'direct-logout-btn';
  
  // Aplicar estilos al botón de cerrar sesión
  logoutBtn.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 12px 15px;
    margin-top: 20px;
    border: none;
    border-radius: 4px;
    background-color: #dc3545;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  `;
  
  // Evento de hover para el botón de cerrar sesión
  logoutBtn.addEventListener('mouseenter', function() {
    this.style.backgroundColor = '#c82333';
  });
  
  logoutBtn.addEventListener('mouseleave', function() {
    this.style.backgroundColor = '#dc3545';
  });
  
  // Funcionalidad de cerrar sesión
  logoutBtn.addEventListener('click', function() {
    if (typeof cerrarSesion === 'function') {
      cerrarSesion();
    } else {
      console.warn('La función cerrarSesion no está disponible');
      window.location.href = 'index.html';
    }
  });
  
  menu.appendChild(logoutBtn);
  
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.className = 'direct-menu-overlay';
  
  // Aplicar estilos al overlay
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9997;
    opacity: 0;
    display: none;
    transition: opacity 0.3s ease;
  `;
  
  // Añadir elementos al DOM
  document.body.appendChild(menuButton);
  document.body.appendChild(menu);
  document.body.appendChild(overlay);
  
  // Variable para controlar el estado del menú
  let menuAbierto = false;
  
  // Función para abrir el menú
  function abrirMenu() {
    menu.style.right = '0';
    overlay.style.display = 'block';
    
    // Usar setTimeout para permitir la transición CSS
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
    
    // Cambiar el ícono del botón
    menuButton.innerHTML = '<i class="fas fa-times"></i>';
    
    // Bloquear scroll en el body
    document.body.style.overflow = 'hidden';
    
    menuAbierto = true;
  }
  
  // Función para cerrar el menú
  function cerrarMenu() {
    menu.style.right = '-280px';
    overlay.style.opacity = '0';
    
    // Esperar a que termine la transición para ocultar
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
    
    // Restaurar el ícono del botón
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Restaurar scroll
    document.body.style.overflow = '';
    
    menuAbierto = false;
  }
  
  // Evento para el botón del menú
  menuButton.addEventListener('click', function() {
    if (menuAbierto) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });
  
  // Evento para el overlay
  overlay.addEventListener('click', cerrarMenu);
  
  // Evento para cerrar con ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && menuAbierto) {
      cerrarMenu();
    }
  });
  
  // Agregar estilos globales
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 1100px) {
      .direct-menu-link {
        animation: fadeInRight 0.3s ease forwards;
        opacity: 0;
        transform: translateX(20px);
      }
      
      @keyframes fadeInRight {
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .direct-menu-link:nth-child(1) { animation-delay: 0.1s; }
      .direct-menu-link:nth-child(2) { animation-delay: 0.15s; }
      .direct-menu-link:nth-child(3) { animation-delay: 0.2s; }
      .direct-menu-link:nth-child(4) { animation-delay: 0.25s; }
      .direct-menu-link:nth-child(5) { animation-delay: 0.3s; }
      .direct-menu-link:nth-child(6) { animation-delay: 0.35s; }
      .direct-menu-link:nth-child(7) { animation-delay: 0.4s; }
      .direct-menu-link:nth-child(8) { animation-delay: 0.45s; }
      .direct-menu-link:nth-child(9) { animation-delay: 0.5s; }
      .direct-menu-link:nth-child(10) { animation-delay: 0.55s; }
      
      .direct-logout-btn {
        animation: fadeInRight 0.3s ease forwards;
        animation-delay: 0.6s;
        opacity: 0;
        transform: translateX(20px);
      }
    }
  `;
  
  document.head.appendChild(style);
  
  console.log('Menú móvil directo inicializado correctamente');
})();