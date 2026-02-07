<?php
/**
 * Configuración de API
 */

// Configurar la URL de la API según el entorno
// En Docker usa el hostname del servicio API
define('API_URL', getenv('API_URL') ?: 'http://api:18000/api/');
define('API_TIMEOUT', 10);

// Función para hacer peticiones a la API
function callAPI($endpoint, $method = 'GET', $data = null, $token = null) {
    $url = API_URL . $endpoint;
    
    $curl = curl_init();
    
    $headers = [
        'Content-Type: application/json',
    ];
    
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => API_TIMEOUT,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    
    curl_close($curl);
    
    if ($error) {
        return [
            'success' => false,
            'message' => 'Error de conexión: ' . $error,
            'http_code' => 0
        ];
    }
    
    $decoded = json_decode($response, true);
    
    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'data' => $decoded,
        'http_code' => $httpCode,
        'message' => $decoded['message'] ?? 'Error desconocido'
    ];
}
?>
