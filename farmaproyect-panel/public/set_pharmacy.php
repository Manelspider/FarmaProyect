<?php
/**
 * Endpoint para guardar la farmacia seleccionada en sesión
 */
session_start();

header('Content-Type: application/json');

// Verificar que el usuario esté autenticado
if (!isset($_SESSION['access_token'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

// Verificar que sea admin o médico
$userRole = $_SESSION['user']['role_name'] ?? '';
if (!in_array($userRole, ['Administrador', 'Médico'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Sin permisos']);
    exit;
}

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);

if (array_key_exists('pharmacy_id', $input)) {
    $pharmacyId = $input['pharmacy_id'];
    
    if ($pharmacyId === '' || $pharmacyId === null) {
        // "Todas las farmacias" - limpiar selección
        unset($_SESSION['selected_pharmacy']);
        echo json_encode([
            'success' => true, 
            'message' => 'Mostrando todas las farmacias',
            'pharmacy_id' => null
        ]);
    } else {
        // Farmacia específica
        $_SESSION['selected_pharmacy'] = [
            'id' => intval($pharmacyId),
            'name' => $input['pharmacy_name'] ?? 'Farmacia'
        ];
        echo json_encode([
            'success' => true, 
            'message' => 'Farmacia seleccionada',
            'pharmacy_id' => intval($pharmacyId)
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta pharmacy_id']);
}
