/**
 * FarmaProject - App JS
 */

var FarmaApp = {

    config: {
        apiBaseUrl: '/api',
        alertTimeout: 5000,
        swalColors: {
            primary: '#005F02',
            secondary: '#BFC6C4',
            sand: '#E5D9B6'
        }
    },

    selectedPharmacy: null,

    init: function() {
        this.initSidebar();
        this.initTooltips();
        this.initPharmacySelector();
        this.initNotificationBell();
        this.initShowAllPharmaciesBtn();
    },

    initShowAllPharmaciesBtn: function() {
        var $btn = document.getElementById('btnShowAllPharmacies');

        if (!$btn) return false;

        $btn.addEventListener('click', function() {
            fetch('set_pharmacy.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pharmacy_id: null })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) {
                    window.location.reload();
                }
            });
        });
    },

    initSidebar: function() {
        var $btn = document.getElementById('hamburgerBtn'),
            $sidebar = document.getElementById('sidebar'),
            $overlay = document.getElementById('sidebarOverlay');

        if (!$btn || !$sidebar) return false;

        $btn.addEventListener('click', function () {
            $sidebar.classList.toggle('open');
            if ($overlay) $overlay.classList.toggle('active');
        });

        if ($overlay) {
            $overlay.addEventListener('click', function () {
                $sidebar.classList.remove('open');
                $overlay.classList.remove('active');
            });
        }
    },

    initPharmacySelector: function() {
        var self = this,
            $select = document.getElementById('pharmacySelect'),
            $badge = document.getElementById('pharmacyBadge'),
            $badgeName = document.getElementById('pharmacyName'),
            objConfig = window.FarmaConfig || {},
            strApiBase = objConfig.apiBase || '',
            strToken = objConfig.token || '';

        if (!$select && !$badge) return false;

        // Load pharmacies
        fetch(strApiBase + '/pharmacies', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + strToken,
                'Content-Type': 'application/json'
            }
        })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (!data.success) return false;

                var aPharmacies = data.data || [],
                    nSessionPharmacy = window.FarmaConfig?.selectedPharmacyId || null;

                if ($select) {
                    // Admin/Médico: Show select
                    // Add placeholder option first (only if no pharmacy selected)
                    if (!nSessionPharmacy) {
                        var optPlaceholder = document.createElement('option');
                        optPlaceholder.value = '';
                        optPlaceholder.textContent = 'Seleccionar farmacia...';
                        optPlaceholder.disabled = true;
                        optPlaceholder.selected = true;
                        $select.appendChild(optPlaceholder);
                    }
                    
                    aPharmacies.forEach(function(p) {
                        var opt = document.createElement('option');
                        opt.value = p.id;
                        opt.textContent = p.name + ' - ' + p.city;
                        opt.dataset.name = p.name;
                        if (nSessionPharmacy && nSessionPharmacy == p.id) opt.selected = true;
                        $select.appendChild(opt);
                    });

                    self.selectedPharmacy = nSessionPharmacy ? parseInt(nSessionPharmacy) : null;

                    // Init Select2 if available
                    if (typeof $ !== 'undefined' && $.fn.select2) {
                        $($select).select2({
                            theme: 'bootstrap-5',
                            width: '100%',
                            placeholder: 'Seleccionar farmacia...'
                        });

                        // Handle change with Select2
                        $($select).on('select2:select', function() {
                            self.handlePharmacyChange($select);
                        });
                    } else {
                        $select.addEventListener('change', function() {
                            self.handlePharmacyChange($select);
                        });
                    }

                } else if ($badge && $badgeName && aPharmacies.length > 0) {
                    // Farmacéutico: Show badge
                    var pharmacy = aPharmacies[0];
                    $badgeName.textContent = pharmacy.name;
                    self.selectedPharmacy = pharmacy.id;
                }
            })
            .catch(function(err) {
                console.error('Error loading pharmacies:', err);
                if ($badgeName) $badgeName.textContent = 'Error al cargar';
            });
    },

    handlePharmacyChange: function($select) {
        var strVal = $select.value,
            $selectedOption = $select.options[$select.selectedIndex],
            strPharmacyName = $selectedOption?.dataset?.name || '';

        // Send to PHP session
        fetch('set_pharmacy.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pharmacy_id: strVal || null,
                pharmacy_name: strPharmacyName
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success) {
                window.location.reload();
            }
        })
        .catch(function(err) {
            console.error('Error setting pharmacy:', err);
        });
    },

    getSelectedPharmacy: function() {
        return this.selectedPharmacy;
    },

    initTooltips: function() {
        var aList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [].slice.call(aList).map(function (el) { return new bootstrap.Tooltip(el); });
    },

    initNotificationBell: function() {
        var self = this,
            $bellContainer = document.getElementById('notificationBellContainer'),
            $bellBtn = document.getElementById('notificationBellBtn'),
            $notificationList = document.getElementById('notificationList'),
            $notificationDot = document.getElementById('notificationDot'),
            $notificationBadge = document.getElementById('notificationBadge'),
            objConfig = window.FarmaConfig || {},
            strApiBase = objConfig.apiBase || '',
            strToken = objConfig.token || '';

        if (!$bellContainer || !strApiBase || !strToken) return false;

        // Load notifications when dropdown opens
        if ($bellBtn) {
            $bellBtn.addEventListener('click', function() {
                self.loadNotifications();
            });
        }

        // Initial load to get pending count
        self.loadNotificationCount();

        // Refresh every 60 seconds
        setInterval(function() {
            self.loadNotificationCount();
        }, 60000);
    },

    loadNotificationCount: function() {
        var $notificationDot = document.getElementById('notificationDot'),
            $notificationBadge = document.getElementById('notificationBadge'),
            objConfig = window.FarmaConfig || {},
            strApiBase = objConfig.apiBase || '',
            strToken = objConfig.token || '';

        if (!strApiBase || !strToken) return false;

        fetch(strApiBase + '/notifications/my?limit=5', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + strToken,
                'Content-Type': 'application/json'
            }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.success) return false;

            var nPendingCount = data.pending_count || 0;

            if (nPendingCount > 0) {
                if ($notificationDot) $notificationDot.classList.remove('d-none');
                if ($notificationBadge) {
                    $notificationBadge.classList.remove('d-none');
                    $notificationBadge.textContent = nPendingCount > 99 ? '99+' : nPendingCount;
                }
            } else {
                if ($notificationDot) $notificationDot.classList.add('d-none');
                if ($notificationBadge) $notificationBadge.classList.add('d-none');
            }
        })
        .catch(function(err) {
            console.error('Error loading notification count:', err);
        });
    },

    loadNotifications: function() {
        var $notificationList = document.getElementById('notificationList'),
            objConfig = window.FarmaConfig || {},
            strApiBase = objConfig.apiBase || '',
            strToken = objConfig.token || '';

        if (!$notificationList || !strApiBase || !strToken) return false;

        // Show loading
        $notificationList.innerHTML = '<div class="dropdown-item text-muted small text-center py-3"><i class="ti ti-loader ti-spin me-1"></i> Cargando...</div>';

        fetch(strApiBase + '/notifications/my?limit=10', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + strToken,
                'Content-Type': 'application/json'
            }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (!data.success) {
                $notificationList.innerHTML = '<div class="dropdown-item text-muted small text-center py-3">Error al cargar</div>';
                return false;
            }

            var aNotifications = data.data || [];
            
            // Filter out dismissed notifications (only if updated_at matches)
            var oDismissed = FarmaApp.getDismissedNotifications();
            aNotifications = aNotifications.filter(function(notif) {
                var strDismissedAt = oDismissed[notif.id];
                // If not dismissed, show it
                if (!strDismissedAt) return true;
                // If updated_at changed (notification was modified), show it again
                if (notif.updated_at !== strDismissedAt) {
                    // Remove from dismissed list since it was updated
                    FarmaApp.removeDismissedNotification(notif.id);
                    return true;
                }
                // Still dismissed
                return false;
            });

            if (aNotifications.length === 0) {
                $notificationList.innerHTML = '<div class="dropdown-item text-muted small text-center py-3"><i class="ti ti-bell-off me-1"></i> Sin notificaciones</div>';
                return false;
            }

            var strHTML = '';
            aNotifications.forEach(function(notif) {
                var strStatusClass = '';
                var strStatusIcon = '';
                switch (notif.ticket_status) {
                    case 'pending':
                        strStatusClass = 'text-secondary';
                        strStatusIcon = 'ti-clock';
                        break;
                    case 'in_progress':
                        strStatusClass = 'text-primary';
                        strStatusIcon = 'ti-loader';
                        break;
                    case 'resolved':
                        strStatusClass = 'text-success';
                        strStatusIcon = 'ti-check';
                        break;
                    case 'closed':
                        strStatusClass = 'text-dark';
                        strStatusIcon = 'ti-archive';
                        break;
                    case 'cancelled':
                        strStatusClass = 'text-danger';
                        strStatusIcon = 'ti-x';
                        break;
                }

                var strTimeAgo = '';
                if (notif.updated_at) {
                    var dtDate = new Date(notif.updated_at);
                    var dtNow = new Date();
                    var nDiff = Math.floor((dtNow - dtDate) / 1000 / 60); // minutes
                    if (nDiff < 60) {
                        strTimeAgo = nDiff + ' min';
                    } else if (nDiff < 1440) {
                        strTimeAgo = Math.floor(nDiff / 60) + ' h';
                    } else {
                        strTimeAgo = Math.floor(nDiff / 1440) + ' d';
                    }
                }

                strHTML += '<div class="dropdown-item notification-item py-2 border-bottom position-relative" data-notification-id="' + notif.id + '" data-updated-at="' + (notif.updated_at || '') + '">';
                strHTML += '  <div class="d-flex align-items-start">';
                strHTML += '    <span class="notification-icon me-2" style="background-color: ' + (notif.notification_type_color || '#6c757d') + '; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">';
                strHTML += '      <i class="ti ti-' + (notif.notification_type_icon || 'bell') + ' text-white" style="font-size: 14px;"></i>';
                strHTML += '    </span>';
                strHTML += '    <a href="notifications.php?id=' + notif.id + '" class="flex-grow-1 overflow-hidden text-decoration-none" style="min-width: 0;">';
                strHTML += '      <div class="d-flex justify-content-between align-items-center">';
                strHTML += '        <span class="fw-semibold text-truncate text-dark">' + notif.title + '</span>';
                strHTML += '        <small class="text-muted ms-1 flex-shrink-0">' + strTimeAgo + '</small>';
                strHTML += '      </div>';
                strHTML += '      <div class="small text-muted text-truncate">' + notif.pharmacy_name + '</div>';
                strHTML += '      <div class="small d-flex align-items-center mt-1">';
                strHTML += '        <i class="ti ' + strStatusIcon + ' ' + strStatusClass + ' me-1"></i>';
                strHTML += '        <span class="' + strStatusClass + '">' + notif.ticket_status_display + '</span>';
                strHTML += '      </div>';
                strHTML += '    </a>';
                strHTML += '    <button type="button" class="btn btn-sm btn-light notification-dismiss-btn ms-2 flex-shrink-0" onclick="FarmaApp.dismissNotification(event, ' + notif.id + ')" title="Ocultar">';
                strHTML += '      <i class="ti ti-x"></i>';
                strHTML += '    </button>';
                strHTML += '  </div>';
                strHTML += '</div>';
            });

            $notificationList.innerHTML = strHTML;
        })
        .catch(function(err) {
            console.error('Error loading notifications:', err);
            $notificationList.innerHTML = '<div class="dropdown-item text-muted small text-center py-3">Error al cargar</div>';
        });
    },

    dismissNotification: function(e, nNotificationId) {
        e.preventDefault();
        e.stopPropagation();
        
        var self = this,
            $item = document.querySelector('[data-notification-id="' + nNotificationId + '"]');
        
        // Hide the notification item immediately (visual feedback)
        if ($item) {
            $item.style.transition = 'opacity 0.3s, height 0.3s, padding 0.3s, margin 0.3s';
            $item.style.opacity = '0';
            $item.style.height = '0';
            $item.style.padding = '0';
            $item.style.margin = '0';
            $item.style.overflow = 'hidden';
            
            setTimeout(function() {
                $item.remove();
                
                // Check if list is empty
                var $notificationList = document.getElementById('notificationList');
                if ($notificationList && $notificationList.children.length === 0) {
                    $notificationList.innerHTML = '<div class="dropdown-item text-muted small text-center py-3"><i class="ti ti-bell-off me-1"></i> Sin notificaciones</div>';
                }
            }, 300);
        }
        
        // Get the notification's updated_at from the data attribute
        var strUpdatedAt = $item ? ($item.dataset.updatedAt || new Date().toISOString()) : new Date().toISOString();
        
        // Store dismissed notifications in localStorage with their updated_at timestamp
        // We need to store as object: { id: updated_at, ... }
        var oDismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
        
        // Convert old array format to object format if needed
        if (Array.isArray(oDismissed)) {
            var oNew = {};
            oDismissed.forEach(function(id) { oNew[id] = ''; });
            oDismissed = oNew;
        }
        
        // Store the notification ID with its updated_at timestamp
        oDismissed[nNotificationId] = strUpdatedAt;
        
        // Keep only last 100 dismissed (convert to array, slice, convert back)
        var aKeys = Object.keys(oDismissed);
        if (aKeys.length > 100) {
            var aKeysToRemove = aKeys.slice(0, aKeys.length - 100);
            aKeysToRemove.forEach(function(key) { delete oDismissed[key]; });
        }
        
        localStorage.setItem('dismissedNotifications', JSON.stringify(oDismissed));
        
        // Update badge count
        self.loadNotificationCount();
    },

    removeDismissedNotification: function(nNotificationId) {
        var oDismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
        
        // Handle old array format
        if (Array.isArray(oDismissed)) {
            var oNew = {};
            oDismissed.forEach(function(id) { oNew[id] = ''; });
            oDismissed = oNew;
        }
        
        if (oDismissed[nNotificationId]) {
            delete oDismissed[nNotificationId];
            localStorage.setItem('dismissedNotifications', JSON.stringify(oDismissed));
        }
    },

    getDismissedNotifications: function() {
        var oDismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '{}');
        
        // Handle old array format - convert to object
        if (Array.isArray(oDismissed)) {
            var oNew = {};
            oDismissed.forEach(function(id) { oNew[id] = ''; });
            localStorage.setItem('dismissedNotifications', JSON.stringify(oNew));
            return oNew;
        }
        
        return oDismissed;
    },

    // SweetAlert2 helpers
    toast: function(strMessage, strIcon) {
        strIcon = strIcon || 'success';
        if (typeof Swal === 'undefined') return false;

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: strIcon,
            title: strMessage,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },

    confirm: function(strTitle, strText, funcCallback) {
        var self = this;
        if (typeof Swal === 'undefined') return false;

        Swal.fire({
            title: strTitle,
            text: strText,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: self.config.swalColors.primary,
            cancelButtonColor: self.config.swalColors.secondary,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(function(result) {
            if (result.isConfirmed && funcCallback) funcCallback();
        });
    },

    alert: function(strTitle, strText, strIcon) {
        strIcon = strIcon || 'info';
        if (typeof Swal === 'undefined') return false;

        Swal.fire({
            title: strTitle,
            text: strText,
            icon: strIcon,
            confirmButtonColor: this.config.swalColors.primary
        });
    },

    setButtonLoading: function($button, bLoading, strOriginalText) {
        if (bLoading) {
            $button.dataset.originalText = $button.innerHTML;
            $button.disabled = true;
            $button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cargando...';
        } else {
            $button.disabled = false;
            $button.innerHTML = strOriginalText || $button.dataset.originalText || 'Enviar';
        }
    }

};


$(document).ready(function () {

    FarmaApp.init();

});
