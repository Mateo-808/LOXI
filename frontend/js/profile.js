document.getElementById('cerrarSesion').addEventListener('click', () => {
  localStorage.removeItem('usuario');

  window.location.href = 'index.html';
});
