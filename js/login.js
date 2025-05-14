// Updated login script

document.addEventListener('DOMContentLoaded', function() {
  // DOM References
  const emailInput = document.getElementById('correo');
  const passwordInput = document.getElementById('password1');
  const loginButton = document.querySelector('.boton');
  const togglePassword = document.querySelector('.visibilidad');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  // Show/hide password
  if (togglePassword) {
    togglePassword.addEventListener('click', function() {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye');
      }
    });
  }
  
  // Show message function
  function showMessage(message, isError = false) {
    let messageElement = document.querySelector('.message');
    
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.className = 'message';
      const container = document.querySelector('.caja');
      if (container) {
        container.appendChild(messageElement);
      } else {
        document.body.appendChild(messageElement);
      }
    }
    
    messageElement.textContent = message;
    messageElement.style.color = isError ? 'red' : 'green';
    messageElement.style.marginTop = '20px';
    messageElement.style.textAlign = 'center';
    messageElement.style.fontWeight = 'bold';
    
    setTimeout(() => {
      messageElement.textContent = '';
    }, 3000);
  }
  
  // Field validation
  function validateFields() {
    if (!emailInput || !passwordInput) return false;
    
    if (!emailInput.value.trim()) {
      showMessage('Por favor, ingresa tu correo', true);
      return false;
    }
    
    if (!passwordInput.value.trim()) {
      showMessage('Por favor, ingresa tu contraseña', true);
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      showMessage('Formato de correo inválido', true);
      return false;
    }
    
    return true;
  }
  
  // Loading indicator
  function showLoading(isLoading) {
    if (loginButton) {
      loginButton.disabled = isLoading;
      loginButton.innerHTML = isLoading ? 
        '<i class="fas fa-spinner fa-spin"></i> Verificando...' : 
        'Entrar';
    }
    
    if (loadingOverlay) {
      loadingOverlay.style.display = isLoading ? 'flex' : 'none';
    }
  }
  
  // Sign in function with additional Safari handling
  function signInWithFirebase() {
    if (!validateFields()) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    showLoading(true);
    
    // Set a timeout to prevent hanging in Safari
    const authTimeout = setTimeout(() => {
      showLoading(false);
      showMessage('La autenticación está tardando demasiado. Verifica tu conexión e intenta de nuevo.', true);
    }, 15000);
    
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        return firebase.auth().signInWithEmailAndPassword(email, password);
      })
      .then((userCredential) => {
        clearTimeout(authTimeout);
        showMessage('¡Inicio de sesión exitoso!');
        
        // Store minimal user data in sessionStorage
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userId', userCredential.user.uid);
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      })
      .catch((error) => {
        clearTimeout(authTimeout);
        console.error("Login error:", error);
        
        let errorMessage;
        switch(error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Usuario no encontrado';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Formato de correo inválido';
            break;
          case 'auth/invalid-user-credentials':
          case 'auth/invalid-login-credentials':
            errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
            break;
          default:
            errorMessage = 'Error de autenticación: ' + (error.message || 'Desconocido');
        }
        
        showMessage(errorMessage, true);
      })
      .finally(() => {
        showLoading(false);
      });
  }
  
  // Add event listeners
  if (loginButton) {
    loginButton.addEventListener('click', signInWithFirebase);
  }
  
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      signInWithFirebase();
    }
  });
  
  // Check if user is already authenticated
  const initialAuthCheck = setTimeout(() => {
    showLoading(false); // Ensure loading is hidden if auth check fails
  }, 5000);
  
  firebase.auth().onAuthStateChanged((user) => {
    clearTimeout(initialAuthCheck);
    showLoading(false);
    
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });
});