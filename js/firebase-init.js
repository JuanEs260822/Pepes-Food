// Configuración de Firebase para Pepe's Food
// Este archivo debe ser incluido en todas las páginas que necesiten acceder a Firebase

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxTJlYJLLtBS_fs8uB6xJ3ZHegRmeebhc",
  authDomain: "pepesfood-353c2.firebaseapp.com",
  projectId: "pepesfood-353c2",
  storageBucket: "pepesfood-353c2.firebasestorage.app",
  messagingSenderId: "1046402267675",
  appId: "1:1046402267675:web:c9471ecff5d9c3e1c0d6be"
};

// Inicializar Firebase (versión compat para compatibilidad)
firebase.initializeApp(firebaseConfig);

// Exportar objetos de Firebase para uso en otros archivos
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage && firebase.storage(); // Verificar si storage está disponible

// Persistence setup with error handling
try {
  db.enablePersistence({ synchronizeTabs: true })
    .catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
      }
    });
} catch (error) {
  console.error("Error with persistence setup:", error);
}

// Configuración global para Firestore (opcional)
/* db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code == 'failed-precondition') {
      console.warn('La persistencia de datos falló porque múltiples pestañas están abiertas');
    } else if (err.code == 'unimplemented') {
      console.warn('Tu navegador no soporta persistencia de datos offline');
    }
  });*/

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
  return new Promise((resolve, reject) => {
    // Add a timeout to prevent hanging indefinitely
    const timeout = setTimeout(() => {
      mostrarCargando(false); // Hide loading screen if it gets stuck
      reject(new Error('Authentication timeout'));
    }, 10000); // 10 second timeout
    
    const unsubscribe = auth.onAuthStateChanged(user => {
      clearTimeout(timeout);
      unsubscribe();
      if (user) {
        mostrarCargando(false);
        resolve(user);
      } else {
        mostrarCargando(false);
        window.location.href = 'index.html';
        reject(new Error('User not authenticated'));
      }
    }, error => {
      clearTimeout(timeout);
      mostrarCargando(false);
      console.error("Auth state error:", error);
      reject(error);
    });
  });
}

function mostrarCargando(show) {
  const loader = document.getElementById('loading-overlay');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  mostrarCargando(true);
  return auth.signOut()
    .then(() => {
      sessionStorage.clear();
      localStorage.clear(); // Clear any localStorage data as well
      window.location.href = 'index.html';
    })
    .catch(error => {
      mostrarCargando(false);
      console.error('Error signing out:', error);
      alert('Error al cerrar sesión. Intente de nuevo.');
    });
}