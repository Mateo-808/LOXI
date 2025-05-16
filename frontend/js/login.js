document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const togglePassword = document.getElementById('togglePassword');

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.querySelector('.eye-icon').textContent = type === 'password' ? '👁' : '🔒';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    emailError.textContent = '';
    passwordError.textContent = '';

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    if (!email) {
      emailError.textContent = 'El correo electrónico es obligatorio';
      isValid = false;
    } else if (!isValidEmail(email)) {
      emailError.textContent = 'Por favor, introduce un correo electrónico válido';
      isValid = false;
    }

    if (!password) {
      passwordError.textContent = 'La contraseña es obligatoria';
      isValid = false;
    } else if (password.length < 6) {
      passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (isValid) {
      try {
        const loginButton = loginForm.querySelector('.login-btn');
        const originalText = loginButton.textContent;
        loginButton.textContent = 'Iniciando sesión...';
        loginButton.disabled = true;

        // Consultar la tabla usuarios en Supabase
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('correo', email)
          .eq('contrasena', password) 
          .single();

        if (error || !data) {
          passwordError.textContent = 'Correo electrónico o contraseña incorrectos';
          loginButton.textContent = originalText;
          loginButton.disabled = false;
        } else {
          // Usuario válido
          console.log('Usuario autenticado:', data);

          const rememberMe = document.getElementById('remember').checked;
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          // Redirigir
          window.location.href = '../pages/index.html';
        }
      } catch (err) {
        console.error('Error inesperado:', err);
        passwordError.textContent = 'Ha ocurrido un error. Inténtalo más tarde.';
        loginButton.textContent = originalText;
        loginButton.disabled = false;
      }
    }
  });

  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    document.getElementById('remember').checked = true;
  }

  // Si no estás usando login con Google/GitHub, puedes omitir esta parte
  setupSocialLogin();
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function setupSocialLogin() {
  const googleBtn = document.querySelector('.social-btn.google');
  const githubBtn = document.querySelector('.social-btn.github');

  googleBtn.addEventListener('click', () => alert('Login con Google no está habilitado'));
  githubBtn.addEventListener('click', () => alert('Login con GitHub no está habilitado'));
}
