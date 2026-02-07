<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/assets.php';
requireAuth();

$user = $_SESSION['user'];
$userData = $user['data'] ?? [];
$userName = trim(($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? '')) ?: 'Usuario';
$userEmail = $user['email'] ?? '';
$userRole = $user['role_name'] ?? 'Usuario';
$initials = strtoupper(substr($userData['first_name'] ?? 'U', 0, 1) . substr($userData['last_name'] ?? 'S', 0, 1));
$pageTitle = 'Mi Perfil';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Perfil - FarmaProject</title>
    <?= AssetsManager::renderCSS(['bootstrap', 'tabler-icons', 'select2', 'select2-bs5', 'main']) ?>
    <link href="<?= AssetsManager::asset('css/profile_page.css') ?>" rel="stylesheet"/>
</head>
<body>
    <div class="layout">
        <?php include __DIR__ . '/../shared/sidebar.php'; ?>

        <div class="main-content">
            <?php include __DIR__ . '/../shared/header.php'; ?>

            <div class="page-body">
                <div class="container-fluid">
                    <div class="row g-4">
                        <div class="col-lg-4">
                            <div class="card profile-hero">
                                <div class="card-body text-center py-5">
                                    <div class="mb-3">
                                        <div class="avatar-circle">
                                            <span class="text-white" style="font-size:2.2rem;font-weight:700;">
                                                <?= $initials ?>
                                            </span>
                                        </div>
                                    </div>
                                    <h3 class="mb-1 text-white"><?= htmlspecialchars($userName) ?></h3>
                                    <div style="color:rgba(255,255,255,0.7);" class="mb-2">
                                        <i class="ti ti-shield-check me-1"></i><?= htmlspecialchars($userRole) ?>
                                    </div>
                                    <div style="color:rgba(255,255,255,0.6);font-size:0.88rem;">
                                        <i class="ti ti-mail me-1"></i><?= htmlspecialchars($userEmail) ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="mb-0" style="font-size:0.95rem;">
                                        <i class="ti ti-id-badge-2 me-2"></i>Información Personal
                                    </h3>
                                </div>
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="small text-muted mb-1">Nombre</div>
                                            <div class="fw-semibold"><?= htmlspecialchars($userData['first_name'] ?? 'No definido') ?></div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="small text-muted mb-1">Apellido</div>
                                            <div class="fw-semibold"><?= htmlspecialchars($userData['last_name'] ?? 'No definido') ?></div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="small text-muted mb-1">Teléfono</div>
                                            <div class="fw-semibold"><?= htmlspecialchars($userData['phone'] ?? 'No definido') ?></div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="small text-muted mb-1">Ciudad</div>
                                            <div class="fw-semibold"><?= htmlspecialchars($userData['city'] ?? 'No definido') ?></div>
                                        </div>
                                    </div>
                                    <hr class="my-4" style="border-color:var(--beige);">
                                    <div class="d-flex flex-column flex-md-row gap-2">
                                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
                                            <i class="ti ti-lock me-2"></i>Cambiar Contraseña
                                        </button>
                                        <a href="logout.php" class="btn btn-outline-danger">
                                            <i class="ti ti-logout me-2"></i>Cerrar Sesión
                                        </a>
                                    </div>
                                </div>
                                <div class="card-footer text-muted small" style="border-top:1px solid var(--beige);background:transparent;">
                                    <i class="ti ti-calendar me-1"></i>
                                    Miembro desde <?= date('d/m/Y', strtotime($user['created_at'] ?? 'now')) ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <?php include __DIR__ . '/../shared/footer.php'; ?>
        </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="ti ti-lock me-2"></i>Cambiar Contraseña</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="changePasswordForm">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Contraseña Actual</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="currentPassword" name="current_password" required>
                                <button class="btn btn-outline-secondary" type="button" onclick="togglePassword('currentPassword')">
                                    <i class="ti ti-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Nueva Contraseña</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="newPassword" name="new_password" required minlength="8">
                                <button class="btn btn-outline-secondary" type="button" onclick="togglePassword('newPassword')">
                                    <i class="ti ti-eye"></i>
                                </button>
                            </div>
                            <small class="text-muted">Mínimo 8 caracteres</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Confirmar Nueva Contraseña</label>
                            <div class="input-group">
                                <input type="password" class="form-control" id="confirmPassword" name="confirm_password" required minlength="8">
                                <button class="btn btn-outline-secondary" type="button" onclick="togglePassword('confirmPassword')">
                                    <i class="ti ti-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary" id="changePasswordBtn">
                            <i class="ti ti-check me-2"></i>Cambiar Contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <?= AssetsManager::renderJS(['jquery', 'bootstrap', 'sweetalert2', 'select2', 'app']) ?>
    <script src="<?= AssetsManager::asset('js/profile_page.js') ?>"></script>
</body>
</html>
