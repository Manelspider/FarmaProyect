<?php
/**
 * Logout
 */

require_once 'auth.php';

clearAuthSession();

header('Location: ' . getPanelBasePath() . 'login.php');
exit();
?>
