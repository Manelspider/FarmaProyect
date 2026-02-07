<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/assets.php';
requireGuest();
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Iniciar Sesión - FarmaProject</title>
    <?= AssetsManager::renderCSS() ?>
    <link href="<?= AssetsManager::asset('css/login_page.css') ?>" rel="stylesheet"/>
</head>
<body>
    <div class="login-container">
        <!-- Left Side - Branding -->
        <div class="login-branding">
            <div class="branding-content">
                <div class="branding-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
                        <rect x="5" y="5" width="90" height="90" rx="18" ry="18" fill="#2d7a32"/>
                        <g transform="translate(50,50) rotate(-45)">
                            <rect x="-12" y="-30" width="24" height="60" rx="12" ry="12" fill="white"/>
                            <line x1="-12" y1="0" x2="12" y2="0" stroke="#2d7a32" stroke-width="2"/>
                        </g>
                    </svg>
                </div>
                <h1 class="branding-title">FarmaProject</h1>
                <p class="branding-subtitle">Gestión Farmacéutica Inteligente</p>
                
                <div class="branding-features">
                    <div class="branding-feature">
                        <i class="ti ti-shield-check"></i>
                        <span>Seguro</span>
                    </div>
                    <div class="branding-feature">
                        <i class="ti ti-bolt"></i>
                        <span>Rápido</span>
                    </div>
                    <div class="branding-feature">
                        <i class="ti ti-key"></i>
                        <span>JWT Auth</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right Side - Login Form -->
        <div class="login-form-side">
            <div class="login-card">
                <div class="login-card-header">
                    <h2>Bienvenido</h2>
                    <p>Inicia sesión para continuar</p>
                </div>

                <div id="alertContainer"></div>

                <form id="loginForm" autocomplete="off" novalidate>
                    <div class="mb-3">
                        <label class="form-label">Correo Electrónico</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="ti ti-mail"></i></span>
                            <input type="email" class="form-control" id="email" name="email" placeholder="tu@email.com" autocomplete="username" required>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label">Contraseña</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="ti ti-lock"></i></span>
                            <input type="password" class="form-control" id="password" name="password" placeholder="Tu contraseña" autocomplete="current-password" required>
                            <button class="btn btn-outline-secondary" type="button" onclick="togglePasswordVisibility()">
                                <i class="ti ti-eye" id="toggleIcon"></i>
                            </button>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-check">
                            <input type="checkbox" class="form-check-input" id="rememberMe">
                            <span class="form-check-label">Recordar mi correo</span>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-primary w-100" id="loginBtn">
                        <i class="ti ti-login me-2"></i>Iniciar Sesión
                    </button>
                </form>

                <div class="login-footer">
                    <i class="ti ti-lock me-1"></i>Conexión segura con autenticación JWT
                </div>
            </div>
        </div>
    </div>

    <?= AssetsManager::renderJS(['bootstrap', 'sweetalert2']) ?>
    <script src="<?= AssetsManager::asset('js/login_page.js') ?>"></script>
</body>
</html>
