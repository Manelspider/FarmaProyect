<?php
/**
 * Sesión y Autenticación con JWT
 */

session_start();

require_once 'api_config.php';

// Obtener base path del panel (ej: /panel/)
function getPanelBasePath() {
    $forcedBase = getenv('PANEL_BASE_PATH') ?: '';
    $forwardedPrefix = $_SERVER['HTTP_X_FORWARDED_PREFIX'] ?? '';

    $base = $forcedBase !== '' ? $forcedBase : $forwardedPrefix;

    if ($base !== '') {
        $base = '/' . trim(str_replace('\\', '/', $base), '/') . '/';
        return $base === '//' ? '/' : $base;
    }

    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $base = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');

    return $base === '' ? '/' : $base . '/';
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
    return isset($_SESSION['user']) && isset($_SESSION['access_token']);
}

// Obtener usuario actual
function getCurrentUser() {
    return $_SESSION['user'] ?? null;
}

// Obtener access token
function getAccessToken() {
    return $_SESSION['access_token'] ?? null;
}

// Obtener refresh token
function getRefreshToken() {
    return $_SESSION['refresh_token'] ?? null;
}

// Establecer sesión después del login exitoso con JWT
function setAuthSession($user, $accessToken, $refreshToken) {
    $_SESSION['user'] = $user;
    $_SESSION['access_token'] = $accessToken;
    $_SESSION['refresh_token'] = $refreshToken;
    $_SESSION['login_time'] = time();
}

// Actualizar access token después de refresh
function updateAccessToken($accessToken, $refreshToken = null) {
    $_SESSION['access_token'] = $accessToken;
    if ($refreshToken) {
        $_SESSION['refresh_token'] = $refreshToken;
    }
}

// Limpiar sesión (logout)
function clearAuthSession() {
    // Intentar invalidar el refresh token en el servidor
    $refreshToken = getRefreshToken();
    if ($refreshToken) {
        try {
            callAPI('auth/logout', 'POST', ['refresh_token' => $refreshToken], getAccessToken());
        } catch (Exception $e) {
            // Ignorar errores en logout
        }
    }
    
    session_destroy();
    unset($_SESSION['user']);
    unset($_SESSION['access_token']);
    unset($_SESSION['refresh_token']);
}

// Validar y refrescar token si es necesario
function ensureValidToken() {
    if (!isAuthenticated()) {
        return false;
    }
    
    // Verificar si el token es válido
    $result = callAPI('auth/verify', 'POST', ['token' => getAccessToken()]);
    
    if ($result['success']) {
        return true; // Token válido
    }
    
    // Token expirado, intentar refrescar
    $refreshToken = getRefreshToken();
    if (!$refreshToken) {
        clearAuthSession();
        return false;
    }
    
    $refreshResult = callAPI('auth/refresh', 'POST', ['refresh_token' => $refreshToken]);
    
    if ($refreshResult['success']) {
        // Actualizar tokens en sesión
        updateAccessToken(
            $refreshResult['data']['access_token'],
            $refreshResult['data']['refresh_token']
        );
        return true;
    }
    
    // No se pudo refrescar, cerrar sesión
    clearAuthSession();
    return false;
}

// Redirigir a login si no está autenticado
function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: ' . getPanelBasePath() . 'login.php');
        exit();
    }
    
    // Validar y refrescar token si es necesario
    if (!ensureValidToken()) {
        header('Location: ' . getPanelBasePath() . 'login.php');
        exit();
    }
}

// Redirigir a profile si ya está autenticado
function requireGuest() {
    if (isAuthenticated() && ensureValidToken()) {
        header('Location: ' . getPanelBasePath() . 'profile.php');
        exit();
    }
}
