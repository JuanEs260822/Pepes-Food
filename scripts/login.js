document.querySelector('.visibilidad').addEventListener('click', function() {
  const passwordInput = document.getElementById('password1');
  const icon = this;
  
  if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
  } else {
      passwordInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
  }
});