/**
 * Profile Page - JavaScript
 * Gestiona la lógica de la página de perfil
 */

// Toggle password visibility
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

// Handle password change form
document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const alertDiv = document.getElementById('passwordAlert');
    const submitBtn = document.getElementById('changePasswordBtn');

    // Clear previous alerts
    alertDiv.innerHTML = '';

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alertDiv.innerHTML = `
            <div class="alert alert-danger alert-dismissible" role="alert">
                <div class="d-flex">
                    <div><i class="ti ti-alert-circle me-2"></i></div>
                    <div>Las contraseñas nuevas no coinciden</div>
                </div>
                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
            </div>`;
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cambiando...';

    try {
        const response = await fetch('change_password_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            alertDiv.innerHTML = `
                <div class="alert alert-success alert-dismissible" role="alert">
                    <div class="d-flex">
                        <div><i class="ti ti-check me-2"></i></div>
                        <div>${result.message || 'Contraseña cambiada exitosamente'}</div>
                    </div>
                    <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                </div>`;
            
            // Reset form
            this.reset();
            
            // Close modal after 2 seconds
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
            }, 2000);
        } else {
            alertDiv.innerHTML = `
                <div class="alert alert-danger alert-dismissible" role="alert">
                    <div class="d-flex">
                        <div><i class="ti ti-alert-circle me-2"></i></div>
                        <div>${result.message || 'Error al cambiar la contraseña'}</div>
                    </div>
                    <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
                </div>`;
        }
    } catch (error) {
        alertDiv.innerHTML = `
            <div class="alert alert-danger alert-dismissible" role="alert">
                <div class="d-flex">
                    <div><i class="ti ti-alert-circle me-2"></i></div>
                    <div>Error de conexión. Intente nuevamente.</div>
                </div>
                <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
            </div>`;
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ti ti-check me-2"></i>Cambiar Contraseña';
    }
});
