/**
 * Login Page - JavaScript
 * Gestiona la lógica de la página de login
 */

// Load remembered email
document.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('farma_email');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// Toggle password visibility
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

// Show alert
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alertContainer');
    const iconMap = {
        success: 'ti-check',
        danger: 'ti-alert-circle',
        info: 'ti-info-circle'
    };

    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <div class="d-flex">
                <div>
                    <i class="ti ${iconMap[type]} me-2"></i>
                </div>
                <div>${message}</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// Set loading state
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

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous validation
    this.classList.remove('was-validated');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validate
    if (!email || !password) {
        this.classList.add('was-validated');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email').classList.add('is-invalid');
        showAlert('Por favor ingrese un correo electrónico válido', 'danger');
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('login_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            // Remember email if checkbox is checked
            if (rememberMe) {
                localStorage.setItem('farma_email', email);
            } else {
                localStorage.removeItem('farma_email');
            }

            showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            
            // Redirect to profile
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 1000);
        } else {
            showAlert(result.message || 'Credenciales incorrectas. Verifique su email y contraseña.', 'danger');
            setLoading(false);
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión. Por favor intente nuevamente.', 'danger');
        setLoading(false);
    }
});

// Clear invalid state on input
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
});
