<?php
/**
 * API Endpoint: Get Pharmacies List
 */
header('Content-Type: application/json');
require_once 'api_config.php';
require_once 'auth.php';

requireAuth();

$token = $_SESSION['access_token'] ?? null;

if (!$token) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No autenticado'
    ]);
    exit;
}

$result = callAPI('pharmacies', 'GET', null, $token);

if ($result['success']) {
    echo json_encode([
        'success' => true,
        'data' => $result['data']['data'] ?? [],
        'can_switch' => $result['data']['can_switch'] ?? false,
        'total' => $result['data']['total'] ?? 0
    ]);
} else {
    http_response_code($result['http_code'] ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $result['data']['message'] ?? 'Error al obtener farmacias'
    ]);
}
