<?php
/**
 * API Endpoint: Cambiar Contraseña
 * Permite al usuario cambiar su contraseña actual
 */
header('Content-Type: application/json');
require_once 'auth.php';
require_once 'api_config.php';

// Verificar que esté autenticado
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No autenticado'
    ]);
    exit;
}

// Solo acepta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Leer datos JSON
$input = json_decode(file_get_contents('php://input'), true);

$currentPassword = $input['current_password'] ?? '';
$newPassword = $input['new_password'] ?? '';

// Validar campos
if (empty($currentPassword) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Contraseña actual y nueva son requeridas'
    ]);
    exit;
}

// Validar longitud de nueva contraseña
if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'La nueva contraseña debe tener al menos 8 caracteres'
    ]);
    exit;
}

// Obtener token de la sesión
$accessToken = getAccessToken();

if (empty($accessToken)) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Token no encontrado en sesión'
    ]);
    exit;
}

// Llamar a la API para cambiar contraseña con JWT
$result = callAPI('auth/change-password', 'POST', [
    'current_password' => $currentPassword,
    'new_password' => $newPassword
], $accessToken);

if ($result['success'] && $result['http_code'] === 200) {
    // Actualizar tokens en sesión si se devuelven nuevos
    if (isset($result['data']['access_token']) && isset($result['data']['refresh_token'])) {
        updateAccessToken(
            $result['data']['access_token'],
            $result['data']['refresh_token']
        );
    }
    
    echo json_encode([
        'success' => true,
        'message' => $result['data']['message'] ?? 'Contraseña cambiada exitosamente'
    ]);
} else {
    http_response_code($result['http_code'] ?: 400);
    echo json_encode([
        'success' => false,
        'message' => $result['data']['message'] ?? $result['message'] ?? 'Error al cambiar contraseña'
    ]);
}
