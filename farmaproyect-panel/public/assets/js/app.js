/**
 * FarmaProject - Application JavaScript
 * Main application logic
 */

// Application namespace
const FarmaApp = {
    // Configuration
    config: {
        apiBaseUrl: '/api',
        alertTimeout: 5000
    },

    // Initialize application
    init() {
        console.log('FarmaProject initialized');
        this.initTooltips();
        this.initPopovers();
    },

    // Initialize Bootstrap tooltips
    initTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    },

    // Initialize Bootstrap popovers
    initPopovers() {
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
        [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    },

    // Show alert message
    showAlert(container, message, type = 'danger') {
        const iconMap = {
            success: 'ti-check',
            danger: 'ti-alert-circle',
            info: 'ti-info-circle',
            warning: 'ti-alert-triangle'
        };

        container.innerHTML = \`
            <div class="alert alert-\${type} alert-dismissible fade show" role="alert">
                <div class="d-flex">
                    <div>
                        <i class="ti \${iconMap[type]} me-2"></i>
                    </div>
                    <div>\${message}</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        \`;

        // Auto-hide after timeout
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, this.config.alertTimeout);
    },

    // Toggle password visibility
    togglePassword(inputId, iconElement) {
        const input = document.getElementById(inputId);
        if (!input) return;

        if (input.type === 'password') {
            input.type = 'text';
            iconElement.classList.remove('ti-eye');
            iconElement.classList.add('ti-eye-off');
        } else {
            input.type = 'password';
            iconElement.classList.remove('ti-eye-off');
            iconElement.classList.add('ti-eye');
        }
    },

    // Set loading state on button
    setButtonLoading(button, loading, originalText = '') {
        if (loading) {
            button.dataset.originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Cargando...';
        } else {
            button.disabled = false;
            button.innerHTML = originalText || button.dataset.originalText || 'Enviar';
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    FarmaApp.init();
});
