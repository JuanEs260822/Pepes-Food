const visibilidad = document.querySelector('.visibilidad');
const tipo_input = document.getElementById('password1');
visibilidad.addEventListener("click", () => {
  if (visibilidad.classList.contains('fa-eye-slash')) {
    visibilidad.classList.remove('fa-eye-slash');
    visibilidad.classList.add('fa-eye');
    tipo_input.type = "password";
  } else {
    visibilidad.classList.remove('fa-eye');
    visibilidad.classList.add('fa-eye-slash');
    tipo_input.type = "text";
  }
});