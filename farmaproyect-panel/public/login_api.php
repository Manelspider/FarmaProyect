<?php
/**
 * API Endpoint: Login con JWT
 */
header('Content-Type: application/json');
require_once 'api_config.php';
require_once 'auth.php';

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

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// Validar campos
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email y contraseña son requeridos'
    ]);
    exit;
}

// Llamar a la API para autenticar con JWT
$loginData = [
    'email' => $email,
    'password' => $password
];

$result = callAPI('auth/login', 'POST', $loginData);

if ($result['success'] && isset($result['data']['access_token'])) {
    $user = $result['data']['user'];
    $accessToken = $result['data']['access_token'];
    $refreshToken = $result['data']['refresh_token'];
    
    // Establecer sesión con JWT tokens
    setAuthSession($user, $accessToken, $refreshToken);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'user' => $user
    ]);
} else {
    http_response_code($result['http_code'] ?: 401);
    echo json_encode([
        'success' => false,
        'message' => $result['message'] ?? 'Credenciales incorrectas'
    ]);
}
