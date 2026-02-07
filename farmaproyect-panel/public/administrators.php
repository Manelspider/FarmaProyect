<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/assets.php';
requireAuth();

$pageTitle = 'Administradores';
$user = $_SESSION['user'];
$userRole = $user['role_name'] ?? '';
$token = $_SESSION['access_token'] ?? '';

// Only admin can access
if ($userRole !== 'Administrador') {
	header('Location: index.php');
	exit;
}

// Get selected pharmacy from session
$selectedPharmacy = $_SESSION['selected_pharmacy'] ?? null;
$selectedPharmacyId = $selectedPharmacy['id'] ?? null;
$selectedPharmacyName = $selectedPharmacy['name'] ?? null;
$isFiltered = $selectedPharmacyId !== null;
?>
<!DOCTYPE html>
<html lang="es" dir="ltr">

	<head>
		<meta charset="utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>Administradores - FarmaProject</title>
		<?= AssetsManager::renderCSS(['bootstrap', 'tabler-icons', 'datatables', 'datatables-responsive', 'select2', 'select2-bs5', 'sweetalert2', 'main']) ?>
	</head>

	<body>

		<?php require_once __DIR__ . '/../shared/sidebar.php'; ?>

		<!-- Main Content -->
		<div class="main-content">
			<?php require_once __DIR__ . '/../shared/header.php'; ?>

			<!-- Content -->
			<div class="content-wrapper">

				<!-- Page Header -->
				<div class="page-header">
					<div class="page-header-content">
						<h1 class="page-title">
							<i class="ti ti-shield-check me-2"></i>
							Gestión de Administradores
						</h1>
						<p class="page-description">Administración de usuarios con permisos de administrador</p>
					</div>
				</div>
				<!-- /Page Header -->

				<!-- Administrators Table Card -->
				<div class="card">
					<div class="card-header">
						<div class="card-header-content">
							<h5 class="card-title">
								<i class="ti ti-list me-2"></i>Listado de Administradores
							</h5>
						</div>
						<div class="card-header-actions">
							<button type="button" class="btn btn-primary" onclick="createAdministrator()">
								<i class="ti ti-plus me-2"></i>Nuevo Administrador
							</button>
						</div>
					</div>
					<div class="card-body">
						<table id="administratorsTable" class="table table-striped table-hover" style="width:100%">
							<thead>
								<tr>
									<th>Email</th>
									<th>Nombre</th>
									<th>Teléfono</th>
									<th>Ciudad</th>
									<th>Último Acceso</th>
									<th class="text-center">Acciones</th>
								</tr>
							</thead>
							<tbody></tbody>
						</table>
					</div>
				</div>
				<!-- /Administrators Table Card -->

			</div>
			<!-- /Content -->

			<?php require_once __DIR__ . '/../shared/footer.php'; ?>
		</div>
		<!-- /Main Content -->

		<!-- Create/Edit Modal -->
		<div class="modal fade" id="modalAdministrator" tabindex="-1" aria-hidden="true" data-action="CREATE">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modalAdministratorTitle">Nuevo Administrador</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form id="formAdministrator" novalidate>
						<div class="modal-body">
							<div class="alert alert-danger d-none" id="administrator_error_message"></div>

							<div class="row g-3">
								<div class="col-md-6">
									<label for="administrator_email" class="form-label">Email <span class="text-danger">*</span></label>
									<input type="email" class="form-control" id="administrator_email" required />
								</div>
								<div class="col-md-6">
									<label for="administrator_password" class="form-label">Contraseña <span class="text-danger" id="pwd_required">*</span></label>
									<input type="password" class="form-control" id="administrator_password" />
									<small class="text-muted">Dejar vacío para mantener la actual (solo edición)</small>
								</div>
								<div class="col-md-6">
									<label for="administrator_first_name" class="form-label">Nombre <span class="text-danger">*</span></label>
									<input type="text" class="form-control" id="administrator_first_name" required />
								</div>
								<div class="col-md-6">
									<label for="administrator_last_name" class="form-label">Apellidos <span class="text-danger">*</span></label>
									<input type="text" class="form-control" id="administrator_last_name" required />
								</div>
								<div class="col-md-6">
									<label for="administrator_phone" class="form-label">Teléfono</label>
									<input type="tel" class="form-control" id="administrator_phone" />
								</div>
								<div class="col-md-6">
									<label for="administrator_city" class="form-label">Ciudad</label>
									<input type="text" class="form-control" id="administrator_city" />
								</div>
								<div class="col-12">
									<label for="administrator_address" class="form-label">Dirección</label>
									<textarea class="form-control" id="administrator_address" rows="2"></textarea>
								</div>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
							<button type="submit" class="btn btn-primary">Guardar</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<!-- /Create/Edit Modal -->

		<!-- Show Modal -->
		<div class="modal fade" id="modalShowAdministrator" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modalShowTitle">Detalle del Administrador</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="row g-3">
							<div class="col-md-6">
								<label class="form-label fw-bold">Email</label>
								<p class="form-control-static" id="show_email">-</p>
							</div>
							<div class="col-md-6">
								<label class="form-label fw-bold">Nombre Completo</label>
								<p class="form-control-static" id="show_full_name">-</p>
							</div>
							<div class="col-md-6">
								<label class="form-label fw-bold">Teléfono</label>
								<p class="form-control-static" id="show_phone">-</p>
							</div>
							<div class="col-md-6">
								<label class="form-label fw-bold">Ciudad</label>
								<p class="form-control-static" id="show_city">-</p>
							</div>
							<div class="col-12">
								<label class="form-label fw-bold">Dirección</label>
								<p class="form-control-static" id="show_address">-</p>
							</div>
							<div class="col-12">
								<label class="form-label fw-bold">Último Acceso</label>
								<p class="form-control-static" id="show_last_login">-</p>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
					</div>
				</div>
			</div>
		</div>
		<!-- /Show Modal -->

		<!-- Delete Confirm Modal -->
		<div class="modal fade" id="modalDeleteAdministrator" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header bg-danger text-white">
						<h5 class="modal-title">Confirmar Eliminación</h5>
						<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>¿Estás seguro de que deseas eliminar al administrador <strong id="delete_administrator_name"></strong>?</p>
						<p class="text-muted mb-0">Esta acción no se puede deshacer.</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
						<button type="button" class="btn btn-danger" id="btnConfirmDelete">Eliminar</button>
					</div>
				</div>
			</div>
		</div>
		<!-- /Delete Confirm Modal -->

		<script>
			window.FarmaConfig = window.FarmaConfig || {};
			window.FarmaConfig.apiBase = '<?= API_BASE_URL ?>';
			window.FarmaConfig.token = '<?= $token ?>';
			window.FarmaConfig.roleId = 1; // Administrador
			window.FarmaConfig.selectedPharmacyId = <?= $selectedPharmacyId ? $selectedPharmacyId : 'null' ?>;
			window.FarmaConfig.isFiltered = <?= $isFiltered ? 'true' : 'false' ?>;
		</script>
		<?= AssetsManager::renderJS(['jquery', 'bootstrap', 'datatables', 'datatables-bs5', 'datatables-responsive', 'datatables-responsive-bs5', 'sweetalert2', 'select2', 'app']) ?>
		<script src="<?= AssetsManager::asset('js/administrators_page.js') ?>?v=<?= time() ?>"></script>

	</body>
</html>
