/**
 * Profile Page - JavaScript
 */

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.currentTarget.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('ti-eye');
        icon.classList.add('ti-eye-off');
    } else {
        input.type = 'password';
        icon.classList.remove('ti-eye-off');
        icon.classList.add('ti-eye');
    }
}

document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('changePasswordBtn');

    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Las contraseñas nuevas no coinciden',
            confirmButtonColor: '#005F02'
        });
        return;
    }

    if (newPassword.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña débil',
            text: 'La contraseña debe tener al menos 8 caracteres',
            confirmButtonColor: '#005F02'
        });
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cambiando...';

    try {
        const response = await fetch('change_password_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: result.message || 'Contraseña cambiada exitosamente',
                confirmButtonColor: '#005F02'
            }).then(() => {
                bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
                this.reset();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'Error al cambiar la contraseña',
                confirmButtonColor: '#005F02'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            confirmButtonColor: '#005F02'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ti ti-check me-2"></i>Cambiar Contraseña';
    }
});
