<?php
/**
 * Página de Login - FarmaProject
 * Usando Tabler Design System
 */
require_once 'auth.php';
require_once __DIR__ . '/../config/assets.php';

requireGuest(); // Si ya está autenticado, redirige a profile
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>Iniciar Sesión - FarmaProject</title>
    
    <!-- Global Assets (CDN) -->
    <?= AssetsManager::renderCSS() ?>
    
    <!-- Page Specific CSS -->
    <link href="<?= AssetsManager::asset('css/login_page.css') ?>" rel="stylesheet"/>
</head>
<body class="d-flex flex-column">
    <div class="login-page">
        <div class="container py-4">
            <div class="row g-4 align-items-center justify-content-center">
                <div class="col-lg-5">
                    <div class="login-hero shadow-sm">
                        <div class="brand-logo">
                            <i class="ti ti-pill text-white" style="font-size: 2rem;"></i>
                        </div>
                        <h1 class="mb-2">FarmaProject</h1>
                        <p class="text-white-50 mb-4">Gestión Farmacéutica Inteligente</p>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-white text-primary">JWT</span>
                            <span class="badge bg-white text-primary">Seguro</span>
                            <span class="badge bg-white text-primary">Rápido</span>
                        </div>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="card login-card shadow-lg">
                        <div class="card-body">
                            <h2 class="h3 text-center mb-4">Iniciar Sesión</h2>
                            
                            <!-- Alert Container -->
                            <div id="alertContainer"></div>

                            <form id="loginForm" autocomplete="off" novalidate>
                                <div class="mb-3">
                                    <label class="form-label required">Correo Electrónico</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="ti ti-mail"></i>
                                        </span>
                                        <input 
                                            type="email" 
                                            class="form-control" 
                                            id="email" 
                                            name="email"
                                            placeholder="tu@email.com"
                                            autocomplete="username"
                                            required
                                        >
                                    </div>
                                    <div class="invalid-feedback">
                                        Por favor ingrese un correo válido
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label required">Contraseña</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="ti ti-lock"></i>
                                        </span>
                                        <input 
                                            type="password" 
                                            class="form-control" 
                                            id="password" 
                                            name="password"
                                            placeholder="Tu contraseña"
                                            autocomplete="current-password"
                                            required
                                        >
                                        <button class="btn btn-outline-secondary" type="button" onclick="togglePasswordVisibility()">
                                            <i class="ti ti-eye" id="toggleIcon"></i>
                                        </button>
                                    </div>
                                    <div class="invalid-feedback">
                                        Por favor ingrese su contraseña
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-check">
                                        <input type="checkbox" class="form-check-input" id="rememberMe">
                                        <span class="form-check-label">Recordar mi correo</span>
                                    </label>
                                </div>

                                <div class="form-footer">
                                    <button type="submit" class="btn btn-primary w-100" id="loginBtn">
                                        <i class="ti ti-login me-2"></i>
                                        Iniciar Sesión
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="text-center text-muted mt-3 small">
                        <i class="ti ti-lock me-1"></i>
                        Conexión segura con autenticación de tokens
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Global & App Assets -->
    <?= AssetsManager::renderJS() ?>
    
    <!-- Page Specific JS -->
    <script src="<?= AssetsManager::asset('js/login_page.js') ?>"></script>
</body>
</html>
