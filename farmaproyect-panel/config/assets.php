<?php
/**
 * Assets Manager - FarmaProject
 */

class AssetsManager {

    private static $globalCSS = [
        'bootstrap' => 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
        'tabler-icons' => 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css',
        'datatables' => 'https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css',
        'datatables-responsive' => 'https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css',
        'fullcalendar' => 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css',
        'sweetalert2' => 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css',
        'select2' => 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
        'select2-bs5' => 'https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css',
        'leaflet' => 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    ];

    private static $globalJS = [
        'bootstrap' => 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
        'apexcharts' => 'https://cdn.jsdelivr.net/npm/apexcharts@3.44.0/dist/apexcharts.min.js',
        'jquery' => 'https://code.jquery.com/jquery-3.7.1.min.js',
        'datatables' => 'https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js',
        'datatables-bs5' => 'https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js',
        'datatables-responsive' => 'https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js',
        'datatables-responsive-bs5' => 'https://cdn.datatables.net/responsive/2.5.0/js/responsive.bootstrap5.min.js',
        'fullcalendar' => 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js',
        'sweetalert2' => 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js',
        'select2' => 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js',
        'select2-es' => 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/i18n/es.js',
        'leaflet' => 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    ];

    private static $localCSS = [
        'main' => 'assets/css/main.css',
        'login_page' => 'assets/css/login_page.css',
        'profile_page' => 'assets/css/profile_page.css',
        'index_page' => 'assets/css/index_page.css',
        'activity_page' => 'assets/css/activity_page.css',
        'pharmacies_page' => 'assets/css/pharmacies_page.css',
    ];

    private static $localJS = [
        'app' => 'assets/js/app.js',
        'login_page' => 'assets/js/login_page.js',
        'profile_page' => 'assets/js/profile_page.js',
        'index_page' => 'assets/js/index_page.js',
        'activity_page' => 'assets/js/activity_page.js',
        'pharmacies_page' => 'assets/js/pharmacies_page.js',
        'pharmaceuticals_page' => 'assets/js/pharmaceuticals_page.js',
        'doctors_page' => 'assets/js/doctors_page.js',
        'administrators_page' => 'assets/js/administrators_page.js',
        'notifications_page' => 'assets/js/notifications_page.js',
        'prescriptions_page' => 'assets/js/prescriptions_page.js',
    ];

    public static function renderCSS($includes = ['bootstrap', 'tabler-icons', 'main']) {
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

    public static function renderJS($includes = ['bootstrap', 'app']) {
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

    public static function asset($path) {
        return 'assets/' . ltrim($path, '/');
    }

    public static function globalAsset($path) {
        return 'global_assets/' . ltrim($path, '/');
    }
}
