<?php
/**
 * Assets Manager - FarmaProject
 * Gestiona los recursos CSS y JS de la aplicación
 */

class AssetsManager {
    private static $basePath = '';
    
    // Global assets (CDN o librerías compartidas)
    private static $globalCSS = [
        'bootstrap' => 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
        'tabler' => 'https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/css/tabler.min.css',
        'tabler-icons' => 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css',
    ];
    
    private static $globalJS = [
        'bootstrap' => 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
        'tabler' => 'https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta20/dist/js/tabler.min.js',
    ];
    
    // Local assets
    private static $localCSS = [
        'main' => 'assets/css/main.css',
        'login_page' => 'assets/css/login_page.css',
        'profile_page' => 'assets/css/profile_page.css',
        'index_page' => 'assets/css/index_page.css',
    ];
    
    private static $localJS = [
        'app' => 'assets/js/app.js',
        'login_page' => 'assets/js/login_page.js',
        'profile_page' => 'assets/js/profile_page.js',
        'index_page' => 'assets/js/index_page.js',
    ];
    
    /**
     * Renderizar CSS tags
     */
    public static function renderCSS($includes = ['bootstrap', 'tabler', 'tabler-icons', 'main']) {
        $output = "\n";
        
        foreach ($includes as $key) {
            if (isset(self::$globalCSS[$key])) {
                $output .= '    <link href="' . self::$globalCSS[$key] . '" rel="stylesheet"/>' . "\n";
            } elseif (isset(self::$localCSS[$key])) {
                $output .= '    <link href="' . self::$localCSS[$key] . '" rel="stylesheet"/>' . "\n";
            }
        }
        
        return $output;
    }
    
    /**
     * Renderizar JS tags
     */
    public static function renderJS($includes = ['bootstrap', 'tabler', 'app']) {
        $output = "\n";
        
        foreach ($includes as $key) {
            if (isset(self::$globalJS[$key])) {
                $output .= '    <script src="' . self::$globalJS[$key] . '"></script>' . "\n";
            } elseif (isset(self::$localJS[$key])) {
                $output .= '    <script src="' . self::$localJS[$key] . '"></script>' . "\n";
            }
        }
        
        return $output;
    }
    
    /**
     * Get asset path
     */
    public static function asset($path) {
        return 'assets/' . ltrim($path, '/');
    }
    
    /**
     * Get global asset path
     */
    public static function globalAsset($path) {
        return 'global_assets/' . ltrim($path, '/');
    }
}
