// Inicializar Firebase con la configuración compartida
// La configuración debe estar correctamente exportada en firebase_config.js
// y cargada en el HTML antes de este script

// Referencias a elementos del DOM
const emailInput = document.getElementById('correo');
const passwordInput = document.getElementById('password1');
const loginButton = document.querySelector('.boton');
const togglePassword = document.querySelector('.visibilidad');

// Función para mostrar/ocultar contraseña
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

// Función para mostrar mensajes al usuario
function showMessage(message, isError = false) {
  // Verificar si ya existe un mensaje
  let messageElement = document.querySelector('.message');
  
  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.className = 'message';
    document.querySelector('.caja').appendChild(messageElement);
  }
  
  messageElement.textContent = message;
  messageElement.style.color = isError ? 'red' : 'green';
  messageElement.style.marginTop = '20px';
  messageElement.style.textAlign = 'center';
  messageElement.style.fontWeight = 'bold';
  
  // Eliminar el mensaje después de 3 segundos
  setTimeout(() => {
    messageElement.textContent = '';
  }, 3000);
}

// Función para validar campos
function validateFields() {
  if (!emailInput.value.trim()) {
    showMessage('Por favor, ingresa tu correo', true);
    return false;
  }
  
  if (!passwordInput.value.trim()) {
    showMessage('Por favor, ingresa tu contraseña', true);
    return false;
  }
  
  // Validación básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    showMessage('Formato de correo inválido', true);
    return false;
  }
  
  return true;
}

// Agregar indicadores de carga
function showLoading(isLoading) {
  loginButton.disabled = isLoading;
  
  if (isLoading) {
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
  } else {
    loginButton.innerHTML = 'Entrar';
  }
}

// Función para iniciar sesión con Firebase
function signInWithFirebase() {
  if (!validateFields()) return;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  showLoading(true);
  
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Inicio de sesión exitoso
      showMessage('¡Inicio de sesión exitoso!');
      
      // Almacenar información del usuario en sessionStorage (NO localStorage para mayor seguridad)
      sessionStorage.setItem('userEmail', email);
      
      // Redirigir al usuario después de 1 segundo
      setTimeout(() => {
        window.location.href = 'panel_admin.html'; // Cambia esto a tu página principal
      }, 1000);
    })
    .catch((error) => {
      // Manejar errores específicos de Firebase
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
        default:
          errorMessage = 'Error de autenticación: ' + error.message;
      }
      
      showMessage(errorMessage, true);
    })
    .finally(() => {
      showLoading(false);
    });
}

// Evento click para el botón de inicio de sesión
loginButton.addEventListener('click', signInWithFirebase);

// También permitir el inicio de sesión al presionar Enter
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    signInWithFirebase();
  }
});

// Verificar si el usuario ya está autenticado al cargar la página
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // El usuario ya está autenticado, redirigir a la página principal
    window.location.href = 'panel_admin.html'; // Cambia esto a tu página principal
  }
});