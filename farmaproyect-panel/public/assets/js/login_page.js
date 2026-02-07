/**
 * Login Page - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('farma_email');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('ti-eye');
        toggleIcon.classList.add('ti-eye-off');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('ti-eye-off');
        toggleIcon.classList.add('ti-eye');
    }
}

function setLoading(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const form = document.getElementById('loginForm');
    
    if (loading) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
        form.querySelectorAll('input').forEach(input => input.disabled = true);
    } else {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="ti ti-login me-2"></i>Iniciar Sesión';
        form.querySelectorAll('input').forEach(input => input.disabled = false);
    }
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    this.classList.remove('was-validated');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!email || !password) {
        this.classList.add('was-validated');
        Swal.fire({
            icon: 'warning',
            title: 'Campos requeridos',
            text: 'Por favor complete todos los campos',
            confirmButtonColor: '#005F02'
        });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email').classList.add('is-invalid');
        Swal.fire({
            icon: 'error',
            title: 'Email inválido',
            text: 'Por favor ingrese un correo electrónico válido',
            confirmButtonColor: '#005F02'
        });
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('login_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            if (rememberMe) {
                localStorage.setItem('farma_email', email);
            } else {
                localStorage.removeItem('farma_email');
            }

            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Inicio de sesión exitoso',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            }).then(() => {
                window.location.href = 'index.php';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error de autenticación',
                text: result.message || 'Credenciales incorrectas',
                confirmButtonColor: '#005F02'
            });
            setLoading(false);
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Intente nuevamente.',
            confirmButtonColor: '#005F02'
        });
        setLoading(false);
    }
});

document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
});
