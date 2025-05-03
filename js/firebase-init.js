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

// Configuración global para Firestore (opcional)
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code == 'failed-precondition') {
      console.warn('La persistencia de datos falló porque múltiples pestañas están abiertas');
    } else if (err.code == 'unimplemented') {
      console.warn('Tu navegador no soporta persistencia de datos offline');
    }
  });

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        // Redirigir al login si no hay usuario autenticado
        window.location.href = 'index.html';
        reject(new Error('Usuario no autenticado'));
      }
    }, error => {
      reject(error);
    });
  });
}

// Función para cerrar sesión
function cerrarSesion() {
  return auth.signOut()
    .then(() => {
      // Limpiar cualquier dato de sesión almacenado
      sessionStorage.clear();
      // Redirigir al login
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Error al cerrar sesión:', error);
      throw error;
    });
}