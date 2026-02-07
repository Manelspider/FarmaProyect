<?php
/**
 * Página de Perfil de Usuario
 * Usando Tabler Design System
 */
require_once 'auth.php';
require_once __DIR__ . '/../config/assets.php';

requireAuth();

$user = $_SESSION['user'];
$userData = $user['data'] ?? [];
$userName = trim(($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? '')) ?: 'Usuario';
$userEmail = $user['email'] ?? '';
$userRole = $user['role_name'] ?? 'Usuario';
$initials = strtoupper(substr($userData['first_name'] ?? 'U', 0, 1) . substr($userData['last_name'] ?? 'S', 0, 1));
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>Perfil - FarmaProject</title>
    
    <!-- Global Assets (CDN) -->
    <?= AssetsManager::renderCSS() ?>
    
    <!-- Page Specific CSS -->
    <link href="<?= AssetsManager::asset('css/profile_page.css') ?>" rel="stylesheet"/>
</head>
<body>
    <div class="page">
        <!-- Sidebar -->
        <aside class="navbar navbar-vertical navbar-expand-lg" data-bs-theme="dark">
            <div class="container-fluid">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu" aria-controls="sidebar-menu" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <h1 class="navbar-brand navbar-brand-autodark">
                    <a href="index.php">
                        <i class="ti ti-pill icon text-white" style="font-size: 32px;"></i>
                        <span class="ms-2">FarmaProject</span>
                    </a>
                </h1>
                
                <div class="collapse navbar-collapse" id="sidebar-menu">
                    <ul class="navbar-nav pt-lg-3">
                        <li class="nav-item">
                            <a class="nav-link" href="index.php">
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <i class="ti ti-home icon"></i>
                                </span>
                                <span class="nav-link-title">Dashboard</span>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a class="nav-link" href="#">
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <i class="ti ti-building-store icon"></i>
                                </span>
                                <span class="nav-link-title">Farmacias</span>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a class="nav-link" href="#">
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <i class="ti ti-users icon"></i>
                                </span>
                                <span class="nav-link-title">Usuarios</span>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a class="nav-link" href="#">
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <i class="ti ti-bell icon"></i>
                                </span>
                                <span class="nav-link-title">Notificaciones</span>
                            </a>
                        </li>
                        
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#navbar-extra" data-bs-toggle="dropdown" data-bs-auto-close="false" role="button" aria-expanded="false">
                                <span class="nav-link-icon d-md-none d-lg-inline-block">
                                    <i class="ti ti-settings icon"></i>
                                </span>
                                <span class="nav-link-title">Configuración</span>
                            </a>
                            <div class="dropdown-menu">
                                <a class="dropdown-item" href="#">
                                    <i class="ti ti-adjustments icon me-2"></i>
                                    Preferencias
                                </a>
                                <a class="dropdown-item" href="#">
                                    <i class="ti ti-shield-lock icon me-2"></i>
                                    Seguridad
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
        
        <!-- Header -->
        <header class="navbar navbar-expand-md d-print-none">
            <div class="container-xl">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu" aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="navbar-nav flex-row order-md-last">
                    <div class="nav-item dropdown d-none d-md-flex me-3">
                        <a href="#" class="nav-link px-0" data-bs-toggle="dropdown" tabindex="-1" aria-label="Show notifications">
                            <i class="ti ti-bell icon"></i>
                            <span class="badge bg-red"></span>
                        </a>
                        <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-end dropdown-menu-card">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Últimas notificaciones</h3>
                                </div>
                                <div class="list-group list-group-flush list-group-hoverable">
                                    <div class="list-group-item">
                                        <div class="text-truncate">
                                            <small class="text-muted">No hay notificaciones nuevas</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="nav-item dropdown">
                        <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown" aria-label="Open user menu">
                            <span class="avatar avatar-sm" style="background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNjY3ZWVhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4="><?= $initials ?></text></svg>)"></span>
                            <div class="d-none d-xl-block ps-2">
                                <div><?= htmlspecialchars($userName) ?></div>
                                <div class="mt-1 small text-muted"><?= htmlspecialchars($userRole) ?></div>
                            </div>
                        </a>
                        <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                            <a href="profile.php" class="dropdown-item">
                                <i class="ti ti-user icon me-2"></i>
                                Mi Perfil
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="logout.php" class="dropdown-item text-danger">
                                <i class="ti ti-logout icon me-2"></i>
                                Cerrar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Contenido Principal -->
        <div class="page-wrapper">
            <div class="page-header d-print-none">
                <div class="container-xl">
                    <div class="row g-2 align-items-center">
                        <div class="col">
                            <h2 class="page-title">Mi Perfil</h2>
                            <div class="text-muted mt-1">Gestiona tu información personal</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="page-body">
                <div class="container-xl">
                    <div class="row g-4">
                        <div class="col-lg-4">
                            <div class="card profile-hero shadow-sm">
                                <div class="card-body text-center py-5">
                                    <div class="mb-4">
                                        <div class="avatar avatar-circle avatar-xl">
                                            <?php if (!empty($userData['avatar'])): ?>
                                                <img src="<?= htmlspecialchars($userData['avatar']) ?>" alt="Avatar" class="rounded-circle">
                                            <?php else: ?>
                                                <div class="avatar-circle rounded-circle d-flex align-items-center justify-content-center">
                                                    <span class="text-white" style="font-size: 3rem;">
                                                        <?= $initials ?>
                                                    </span>
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <h2 class="mb-1 text-white">
                                        <?= htmlspecialchars($userName) ?>
                                    </h2>
                                    <div class="text-white-50 mb-3">
                                        <i class="ti ti-shield-check me-1"></i>
                                        <?= htmlspecialchars($userRole) ?>
                                    </div>
                                    <div class="text-white-50">
                                        <i class="ti ti-mail me-1"></i>
                                        <?= htmlspecialchars($userEmail) ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-8">
                            <div class="card shadow-sm">
                                <div class="card-header">
                                    <h3 class="card-title">
                                        <i class="ti ti-id-badge-2 me-2"></i>
                                        Información Personal
                                    </h3>
                                </div>
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="small text-muted">Nombre</div>
                                            <div><?= htmlspecialchars($userData['first_name'] ?? 'No definido') ?></div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="small text-muted">Apellido</div>
                                            <div><?= htmlspecialchars($userData['last_name'] ?? 'No definido') ?></div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="small text-muted">Teléfono</div>
                                            <div><?= htmlspecialchars($userData['phone'] ?? 'No definido') ?></div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="small text-muted">Ciudad</div>
                                            <div><?= htmlspecialchars($userData['city'] ?? 'No definido') ?></div>
                                        </div>
                                    </div>
                                    <hr class="my-4">
                                    <div class="d-flex flex-column flex-md-row gap-2">
                                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
                                            <i class="ti ti-lock me-2"></i>
                                            Cambiar Contraseña
                                        </button>
                                        <a href="logout.php" class="btn btn-outline-danger">
                                            <i class="ti ti-logout me-2"></i>
                                            Cerrar Sesión
                                        </a>
                                    </div>
                                </div>
                                <div class="card-footer text-muted small">
                                    <i class="ti ti-calendar me-1"></i>
                                    Miembro desde <?= date('d/m/Y', strtotime($user['created_at'])) ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Cambio de Contraseña -->
    <div class="modal modal-blur fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="ti ti-lock me-2"></i>
                        Cambiar Contraseña
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="changePasswordForm">
                    <div class="modal-body">
                        <div id="passwordAlert"></div>

                        <div class="mb-3">
                            <label class="form-label required">Contraseña Actual</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="currentPassword" name="current_password" required>
                                <button class="btn btn-outline-secondary" type="button" onclick="togglePassword('currentPassword')">
                                    <i class="ti ti-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label required">Nueva Contraseña</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="newPassword" name="new_password" required minlength="8">
                                <button class="btn btn-outline-secondary" type="button" onclick="togglePassword('newPassword')">
                                    <i class="ti ti-eye"></i>
                                </button>
                            </div>
                            <small class="form-hint">Mínimo 8 caracteres</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label required">Confirmar Nueva Contraseña</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="confirmPassword" name="confirm_password" required minlength="8">
                                <button class="btn btn-outline-secondary" type="button" onclick="togglePassword('confirmPassword')">
                                    <i class="ti ti-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary" id="changePasswordBtn">
                            <i class="ti ti-check me-2"></i>
                            Cambiar Contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Global & App Assets -->
    <?= AssetsManager::renderJS() ?>
    
    <!-- Page Specific JS -->
    <script src="<?= AssetsManager::asset('js/profile_page.js') ?>"></script>
</body>
</html>
