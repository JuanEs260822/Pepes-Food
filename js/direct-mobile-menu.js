// direct-mobile-menu.js - Updated to be more robust

(function() {
  // Function to initialize the mobile menu
  function initializeMobileMenu() {
    // Check if the menu already exists to avoid duplicates
    if (document.querySelector('.direct-menu-toggle')) {
      console.log('Mobile menu already initialized');
      return;
    }
    
    // Create menu button
    const menuButton = document.createElement('button');
    menuButton.className = 'direct-menu-toggle';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    menuButton.setAttribute('aria-label', 'Menú móvil');
    
    // Apply styles
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
    
    // Create menu container
    const menu = document.createElement('div');
    menu.className = 'direct-menu';
    
    // Apply styles
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
    
    // Define menu links - can be customized
    const enlaces = [
      { text: 'Panel', href: 'dashboard.html', icon: 'fa-home' },
      { text: 'Crear Orden', href: 'add-order.html', icon: 'fa-plus-circle' },
      { text: 'Órdenes', href: 'construccion.html', icon: 'fa-clipboard-list' },
      { text: 'Cobrar', href: 'charge-order.html', icon: 'fa-cash-register' },
      { text: 'Productos', href: 'products.html', icon: 'fa-hamburger' },
      { text: 'Historial', href: 'construccion.html', icon: 'fa-history' },
      { text: 'Gastos', href: 'construccion.html', icon: 'fa-receipt' },
      { text: 'Finanzas', href: 'construccion.html', icon: 'fa-chart-line' },
      { text: 'Usuarios', href: 'construccion.html', icon: 'fa-users' },
      { text: 'VIP', href: 'construccion.html', icon: 'fa-star' }
    ];
    
    // Create menu links
    const currentPage = window.location.pathname.split('/').pop();
    
    enlaces.forEach((enlace, index) => {
      const link = document.createElement('a');
      link.href = enlace.href;
      link.className = 'direct-menu-link';
      
      // Check if current page
      const isActive = currentPage === enlace.href;
      if (isActive) {
        link.classList.add('active');
      }
      
      // Apply styles
      link.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px 15px;
        color: #333;
        text-decoration: none;
        font-weight: ${isActive ? 'bold' : 'normal'};
        border-radius: 4px;
        margin-bottom: 5px;
        transition: background-color 0.3s ease;
        background-color: ${isActive ? '#ff8800' : 'transparent'};
        color: ${isActive ? 'white' : '#333'};
        animation-delay: ${0.1 + (index * 0.05)}s;
      `;
      
      // Add icon and text
      link.innerHTML = `<i class="fas ${enlace.icon}" style="width: 25px; margin-right: 10px;"></i> ${enlace.text}`;
      
      // Add hover effects
      link.addEventListener('mouseenter', function() {
        if (!isActive) {
          this.style.backgroundColor = 'rgba(255, 136, 0, 0.1)';
        }
      });
      
      link.addEventListener('mouseleave', function() {
        if (!isActive) {
          this.style.backgroundColor = 'transparent';
        }
      });
      
      menu.appendChild(link);
    });
    
    // Create logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i> Cerrar Sesión';
    logoutBtn.className = 'direct-logout-btn';
    
    // Apply styles
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
      animation-delay: 0.6s;
    `;
    
    // Add hover effects
    logoutBtn.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#c82333';
    });
    
    logoutBtn.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#dc3545';
    });
    
    // Add logout functionality
    logoutBtn.addEventListener('click', function() {
      // Check if cerrarSesion function exists
      if (typeof cerrarSesion === 'function') {
        cerrarSesion();
      } else if (typeof firebase !== 'undefined' && firebase.auth) {
        // Fallback to direct Firebase signout
        firebase.auth().signOut()
          .then(() => {
            window.location.href = 'index.html';
          })
          .catch(error => {
            console.error('Error signing out:', error);
          });
      } else {
        // Last resort
        console.warn('Firebase signout function not available, redirecting to login');
        window.location.href = 'index.html';
      }
    });
    
    menu.appendChild(logoutBtn);
    
    // Create background overlay
    const overlay = document.createElement('div');
    overlay.className = 'direct-menu-overlay';
    
    // Apply styles
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
    
    // Add elements to DOM
    document.body.appendChild(menuButton);
    document.body.appendChild(menu);
    document.body.appendChild(overlay);
    
    // Toggle menu state
    let menuOpen = false;
    
    // Function to open menu
    function openMenu() {
      menu.style.right = '0';
      overlay.style.display = 'block';
      
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
      
      menuButton.innerHTML = '<i class="fas fa-times"></i>';
      document.body.style.overflow = 'hidden';
      menuOpen = true;
    }
    
    // Function to close menu
    function closeMenu() {
      menu.style.right = '-280px';
      overlay.style.opacity = '0';
      
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
      
      menuButton.innerHTML = '<i class="fas fa-bars"></i>';
      document.body.style.overflow = '';
      menuOpen = false;
    }
    
    // Add event listeners
    menuButton.addEventListener('click', function() {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    
    overlay.addEventListener('click', closeMenu);
    
    // Close with Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && menuOpen) {
        closeMenu();
      }
    });
    
    // Add animation styles
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
        
        .direct-logout-btn {
          animation: fadeInRight 0.3s ease forwards;
          animation-delay: 0.6s;
          opacity: 0;
          transform: translateX(20px);
        }
      }
    `;
    
    document.head.appendChild(style);
    
    console.log('Mobile menu successfully initialized');
  }
  
  // Check if document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMobileMenu);
  } else {
    // Document already ready, call directly
    initializeMobileMenu();
  }
  
  // Also initialize on window load as a fallback
  window.addEventListener('load', function() {
    // Check if menu exists before initializing
    if (!document.querySelector('.direct-menu-toggle')) {
      console.log('Initializing mobile menu on window load');
      initializeMobileMenu();
    }
  });
})();