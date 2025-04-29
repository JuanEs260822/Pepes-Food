const visibilidad = document.querySelector('.visibilidad');
visibilidad.addEventListener("click", () => {
  if (visibilidad.classList.contains('fa-eye-slash')) {
    visibilidad.classList.remove('fa-eye-slash');
    visibilidad.classList.add('fa-eye');
  } else {
    visibilidad.classList.remove('fa-eye');
    visibilidad.classList.add('fa-eye-slash');
  }
});