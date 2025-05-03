// Configuración de Firebase para Pepe's Food
// Este archivo debe ser incluido en todas las páginas que necesiten acceder a Firebase

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Reemplazar con tu API key real
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Reemplazar con tu dominio
  projectId: "YOUR_PROJECT_ID", // Reemplazar con tu ID de proyecto
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Reemplazar con tu bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Reemplazar con tu ID de mensajería
  appId: "YOUR_APP_ID" // Reemplazar con tu App ID
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