<?php
/**
 * Sidebar compartido con selector de farmacia
 */
$currentPage = basename($_SERVER['SCRIPT_NAME'], '.php');
$userRole = $_SESSION['user']['role_name'] ?? '';
$canSwitchPharmacy = in_array($userRole, ['Administrador', 'Médico']);
$selectedPharmacy = $_SESSION['selected_pharmacy'] ?? null;
?>
<aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
        <a href="index.php" class="sidebar-brand-link">
            <i class="ti ti-pill sidebar-brand-icon" style="font-size: 1.6rem;"></i>
            <span class="sidebar-brand-text">FarmaProject</span>
        </a>
    </div>

    <!-- Pharmacy Selector -->
    <div class="pharmacy-selector">
        <?php if ($canSwitchPharmacy): ?>
        <label class="pharmacy-selector-label">
            <i class="ti ti-building-store"></i> Farmacia
        </label>
        <select id="pharmacySelect" class="pharmacy-select">
            <!-- Options loaded via JS -->
        </select>
        <?php else: ?>
        <div class="pharmacy-badge" id="pharmacyBadge">
            <div class="pharmacy-badge-icon">
                <i class="ti ti-building-store"></i>
            </div>
            <div class="pharmacy-badge-info">
                <span class="pharmacy-badge-label">Tu farmacia</span>
                <span class="pharmacy-badge-name" id="pharmacyName">Cargando...</span>
            </div>
        </div>
        <?php endif; ?>
    </div>

    <nav class="sidebar-nav">
        <ul class="sidebar-menu">
            <li class="sidebar-item <?= $currentPage === 'index' ? 'active' : '' ?>">
                <a href="index.php" class="sidebar-link">
                    <i class="ti ti-dashboard"></i>
                    <span>Dashboard</span>
                </a>
            </li>
            <?php if ($canSwitchPharmacy): ?>
            <li class="sidebar-item <?= $currentPage === 'pharmacies' ? 'active' : '' ?>">
                <a href="pharmacies.php" class="sidebar-link">
                    <i class="ti ti-building-store"></i>
                    <span>Farmacias</span>
                </a>
            </li>
            <?php endif; ?>
            <?php if ($userRole === 'Administrador'): ?>
            <li class="sidebar-item <?= $currentPage === 'pharmaceuticals' ? 'active' : '' ?>">
                <a href="pharmaceuticals.php" class="sidebar-link" id="menu_pharmaceuticals">
                    <i class="ti ti-users"></i>
                    <span>Farmacéuticos</span>
                </a>
            </li>
            <li class="sidebar-item <?= $currentPage === 'doctors' ? 'active' : '' ?>">
                <a href="doctors.php" class="sidebar-link" id="menu_doctors">
                    <i class="ti ti-stethoscope"></i>
                    <span>Médicos</span>
                </a>
            </li>
            <li class="sidebar-item <?= $currentPage === 'administrators' ? 'active' : '' ?>">
                <a href="administrators.php" class="sidebar-link" id="menu_administrators">
                    <i class="ti ti-shield-check"></i>
                    <span>Administradores</span>
                </a>
            </li>
            <li class="sidebar-item <?= $currentPage === 'activity' ? 'active' : '' ?>">
                <a href="activity.php" class="sidebar-link">
                    <i class="ti ti-activity"></i>
                    <span>Actividad</span>
                </a>
            </li>
            <?php endif; ?>
            <li class="sidebar-item <?= $currentPage === 'notifications' ? 'active' : '' ?>">
                <a href="notifications.php" class="sidebar-link" id="menu_notifications">
                    <i class="ti ti-bell"></i>
                    <span>Notificaciones</span>
                </a>
            </li>
            <li class="sidebar-item <?= $currentPage === 'prescriptions' ? 'active' : '' ?>">
                <a href="prescriptions.php" class="sidebar-link">
                    <i class="ti ti-file-certificate"></i>
                    <span>Recetas</span>
                </a>
            </li>
        </ul>

        <div class="sidebar-divider"></div>

        <ul class="sidebar-menu">
            <li class="sidebar-item <?= $currentPage === 'profile' ? 'active' : '' ?>">
                <a href="profile.php" class="sidebar-link">
                    <i class="ti ti-user"></i>
                    <span>Mi Perfil</span>
                </a>
            </li>
            <li class="sidebar-item">
                <a href="logout.php" class="sidebar-link text-danger-link">
                    <i class="ti ti-logout"></i>
                    <span>Cerrar Sesión</span>
                </a>
            </li>
        </ul>
    </nav>
</aside>
<div class="sidebar-overlay" id="sidebarOverlay"></div>
