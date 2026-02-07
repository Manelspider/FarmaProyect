<?php
/**
 * Header compartido
 */
$user = $_SESSION['user'] ?? [];
$userData = $user['data'] ?? [];
$userName = trim(($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? '')) ?: 'Usuario';
$userRole = $user['role_name'] ?? 'Usuario';
$initials = strtoupper(substr($userData['first_name'] ?? 'U', 0, 1) . substr($userData['last_name'] ?? 'S', 0, 1));
$showBell = $userRole !== 'Administrador';
?>
<header class="topbar" id="topbar">
    <div class="topbar-left">
        <button class="hamburger-btn" id="hamburgerBtn" type="button" aria-label="Abrir menú">
            <i class="ti ti-menu-2"></i>
        </button>
        <h1 class="topbar-title"><?= $pageTitle ?? 'Dashboard' ?></h1>
    </div>

    <div class="topbar-right">
        <?php 
        $hasFilter = isset($_SESSION['selected_pharmacy']['id']) && $_SESSION['selected_pharmacy']['id'];
        ?>
        <?php if ($hasFilter): ?>
        <button class="topbar-icon-btn" id="btnShowAllPharmacies" aria-label="Ver todas las farmacias" title="Ver todas las farmacias">
            <i class="ti ti-building-store"></i>
        </button>
        <?php endif; ?>

        <?php if ($showBell): ?>
        <div class="topbar-notifications dropdown" id="notificationBellContainer">
            <button class="topbar-icon-btn" data-bs-toggle="dropdown" aria-label="Notificaciones" id="notificationBellBtn">
                <i class="ti ti-bell"></i>
                <span class="notification-dot d-none" id="notificationDot"></span>
                <span class="notification-badge d-none" id="notificationBadge">0</span>
            </button>
            <div class="dropdown-menu dropdown-menu-end notification-dropdown" id="notificationDropdown">
                <div class="dropdown-header d-flex justify-content-between align-items-center">
                    <span><i class="ti ti-bell me-2"></i>Notificaciones</span>
                    <a href="notifications.php" class="small text-decoration-none">Ver todas</a>
                </div>
                <div id="notificationList">
                    <div class="dropdown-item text-muted small text-center py-3">
                        <i class="ti ti-loader ti-spin me-1"></i> Cargando...
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <div class="topbar-user dropdown">
            <button class="topbar-user-btn" data-bs-toggle="dropdown" aria-label="Menú de usuario">
                <span class="topbar-avatar"><?= $initials ?></span>
                <div class="topbar-user-info d-none d-md-block">
                    <span class="topbar-user-name"><?= htmlspecialchars($userName) ?></span>
                    <span class="topbar-user-role"><?= htmlspecialchars($userRole) ?></span>
                </div>
                <i class="ti ti-chevron-down d-none d-md-block"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
                <a href="profile.php" class="dropdown-item">
                    <i class="ti ti-user me-2"></i>Mi Perfil
                </a>
                <div class="dropdown-divider"></div>
                <a href="logout.php" class="dropdown-item text-danger">
                    <i class="ti ti-logout me-2"></i>Cerrar Sesión
                </a>
            </div>
        </div>
    </div>
</header>
