<?php
/**
 * Dashboard Principal - FarmaProject
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

// Iniciales para avatar
$initials = strtoupper(substr($userData['first_name'] ?? 'U', 0, 1) . substr($userData['last_name'] ?? 'S', 0, 1));
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>Dashboard - FarmaProject</title>
    
    <!-- Global Assets (CDN) -->
    <?= AssetsManager::renderCSS() ?>
    
    <!-- Page Specific CSS -->
    <link href="<?= AssetsManager::asset('css/index_page.css') ?>" rel="stylesheet"/>
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
                        <li class="nav-item active">
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
                    <!-- Notificaciones -->
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
                    
                    <!-- Menú de Usuario -->
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
            <!-- Page header -->
            <div class="page-header d-print-none">
                <div class="container-xl">
                    <div class="row g-2 align-items-center">
                        <div class="col">
                            <h2 class="page-title">
                                Dashboard
                            </h2>
                            <div class="text-muted mt-1">Bienvenido de nuevo, <?= htmlspecialchars($userName) ?></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Page body -->
            <div class="page-body">
                <div class="container-xl">
                    <!-- Tarjetas de Estadísticas -->
                    <div class="row row-deck row-cards">
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="subheader">Farmacias</div>
                                        <div class="ms-auto lh-1">
                                            <div class="dropdown">
                                                <a class="dropdown-toggle text-muted" href="#" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Últimos 7 días</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="h1 mb-3">12</div>
                                    <div class="d-flex mb-2">
                                        <div>Total de farmacias registradas</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="subheader">Usuarios</div>
                                    </div>
                                    <div class="h1 mb-3">45</div>
                                    <div class="d-flex mb-2">
                                        <div>Usuarios activos en el sistema</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="subheader">Notificaciones</div>
                                    </div>
                                    <div class="h1 mb-3">8</div>
                                    <div class="d-flex mb-2">
                                        <div>Notificaciones pendientes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-sm-6 col-lg-3">
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="subheader">Conexiones</div>
                                    </div>
                                    <div class="h1 mb-3">23</div>
                                    <div class="d-flex mb-2">
                                        <div>Usuarios conectados ahora</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actividad Reciente -->
                    <div class="row row-cards mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Actividad Reciente</h3>
                                </div>
                                <div class="card-body">
                                    <div class="divide-y">
                                        <div>
                                            <div class="row">
                                                <div class="col-auto">
                                                    <span class="avatar">
                                                        <i class="ti ti-user-plus icon"></i>
                                                    </span>
                                                </div>
                                                <div class="col">
                                                    <div class="text-truncate">
                                                        <strong>Nuevo usuario registrado</strong>
                                                    </div>
                                                    <div class="text-muted">Juan Pérez se ha registrado en el sistema</div>
                                                </div>
                                                <div class="col-auto align-self-center">
                                                    <div class="badge bg-primary"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div class="row">
                                                <div class="col-auto">
                                                    <span class="avatar">
                                                        <i class="ti ti-building-store icon"></i>
                                                    </span>
                                                </div>
                                                <div class="col">
                                                    <div class="text-truncate">
                                                        <strong>Nueva farmacia agregada</strong>
                                                    </div>
                                                    <div class="text-muted">Farmacia San Juan fue agregada al sistema</div>
                                                </div>
                                                <div class="col-auto align-self-center">
                                                    <div class="badge bg-primary"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div class="row">
                                                <div class="col-auto">
                                                    <span class="avatar">
                                                        <i class="ti ti-bell icon"></i>
                                                    </span>
                                                </div>
                                                <div class="col">
                                                    <div class="text-truncate">
                                                        <strong>Notificación enviada</strong>
                                                    </div>
                                                    <div class="text-muted">Se envió notificación a 15 usuarios</div>
                                                </div>
                                                <div class="col-auto align-self-center">
                                                    <div class="badge bg-primary"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Información del Sistema -->
                    <div class="row row-cards mt-4">
                        <div class="col-lg-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Información del Sistema</h3>
                                </div>
                                <div class="card-body">
                                    <dl class="row">
                                        <dt class="col-5">Versión:</dt>
                                        <dd class="col-7">FarmaProject v1.0.0</dd>
                                        
                                        <dt class="col-5">Estado:</dt>
                                        <dd class="col-7"><span class="badge bg-success">Operativo</span></dd>
                                        
                                        <dt class="col-5">Última actualización:</dt>
                                        <dd class="col-7"><?= date('d/m/Y H:i') ?></dd>
                                        
                                        <dt class="col-5">Autenticación:</dt>
                                        <dd class="col-7"><span class="badge bg-info">JWT</span></dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Accesos Rápidos</h3>
                                </div>
                                <div class="card-body">
                                    <div class="list-group list-group-flush">
                                        <a href="profile.php" class="list-group-item list-group-item-action">
                                            <div class="row align-items-center">
                                                <div class="col-auto">
                                                    <i class="ti ti-user icon"></i>
                                                </div>
                                                <div class="col">
                                                    <strong>Mi Perfil</strong>
                                                    <div class="text-muted">Ver y editar información personal</div>
                                                </div>
                                            </div>
                                        </a>
                                        <a href="#" class="list-group-item list-group-item-action">
                                            <div class="row align-items-center">
                                                <div class="col-auto">
                                                    <i class="ti ti-settings icon"></i>
                                                </div>
                                                <div class="col">
                                                    <strong>Configuración</strong>
                                                    <div class="text-muted">Ajustes del sistema</div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <footer class="footer footer-transparent d-print-none">
                <div class="container-xl">
                    <div class="row text-center align-items-center flex-row-reverse">
                        <div class="col-lg-auto ms-lg-auto">
                            <ul class="list-inline list-inline-dots mb-0">
                                <li class="list-inline-item"><a href="#" class="link-secondary">Documentación</a></li>
                                <li class="list-inline-item"><a href="#" class="link-secondary">Soporte</a></li>
                            </ul>
                        </div>
                        <div class="col-12 col-lg-auto mt-3 mt-lg-0">
                            <ul class="list-inline list-inline-dots mb-0">
                                <li class="list-inline-item">
                                    FarmaProject &copy; <?= date('Y') ?>
                                </li>
                                <li class="list-inline-item">
                                    Versión 1.0.0
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    
    <!-- Global & App Assets -->
    <?= AssetsManager::renderJS() ?>
</body>
</html>
