<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/assets.php';
requireAuth();

$pageTitle = 'Farmacias';
$user = $_SESSION['user'];
$userRole = $user['role_name'] ?? '';
$token = $_SESSION['access_token'] ?? '';

// Only admin and doctor can access
$canAccess = in_array($userRole, ['Administrador', 'Médico']);
if (!$canAccess) {
	header('Location: index.php');
	exit;
}

$isAdmin = $userRole === 'Administrador';

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
		<title>Farmacias - FarmaProject</title>
		<?= AssetsManager::renderCSS(['bootstrap', 'tabler-icons', 'select2', 'select2-bs5', 'datatables', 'datatables-responsive', 'leaflet', 'main']) ?>
		<link href="<?= AssetsManager::asset('css/pharmacies_page.css') ?>" rel="stylesheet"/>
	</head>

	<body>

		<?php include __DIR__ . '/../shared/sidebar.php'; ?>

		<!-- Main Content -->
		<div class="main-content">
			<?php include __DIR__ . '/../shared/header.php'; ?>

			<!-- Content -->
			<div class="content-wrapper">

				<!-- Page Header -->
				<div class="page-header">
					<div class="page-header-content">
						<h1 class="page-title">
							<i class="ti ti-building-community me-2"></i>
							Gestión de Farmacias
						</h1>
						<p class="page-description">
							<?php if ($isFiltered): ?>
							<span class="badge bg-info me-2"><i class="ti ti-filter"></i> <?= htmlspecialchars($selectedPharmacyName) ?></span>
							Mostrando farmacia seleccionada
							<?php else: ?>
							Administra las farmacias del sistema
							<?php endif; ?>
						</p>
					</div>
				</div>
				<!-- /Page Header -->

				<!-- Pharmacies Table Card -->
				<div class="card">
					<div class="card-header">
						<div class="card-header-content">
							<h5 class="card-title">
								<i class="ti ti-list me-2"></i>Listado de Farmacias
							</h5>
						</div>
						<?php if ($isAdmin): ?>
						<div class="card-header-actions">
							<button class="btn btn-primary" id="btnCreate" data-bs-toggle="modal" data-bs-target="#modalPharmacy">
								<i class="ti ti-plus me-2"></i>Nueva Farmacia
							</button>
						</div>
						<?php endif; ?>
					</div>
					<div class="card-body">
						<table id="pharmaciesTable" class="table table-striped table-hover" style="width:100%">
							<thead>
								<tr>
									<th>Código</th>
									<th>Nombre</th>
									<th>Dirección</th>
									<th>Ciudad</th>
									<th>Teléfono</th>
									<th>Estado</th>
									<th class="text-center">Acciones</th>
								</tr>
							</thead>
							<tbody>
							</tbody>
						</table>
					</div>
				</div>
				<!-- /Pharmacies Table Card -->

			</div>
			<!-- /Content -->

			<?php include __DIR__ . '/../shared/footer.php'; ?>
		</div>
		<!-- /Main Content -->

		<!-- Create/Edit Modal -->
		<div id="modalPharmacy" class="modal fade" tabindex="-1" data-content="" data-action="" data-pharmacy-id="">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header bg-primary text-white border-0">
						<h5 class="modal-title" id="modalPharmacyTitle">Nueva Farmacia</h5>
						<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
					</div>

					<form id="formPharmacy" class="form-pharmacy" action="#">
						<div class="modal-body">
							<div id="pharmacy_error_message" class="alert alert-danger d-none" role="alert"></div>

							<div class="row">
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Código <span class="text-danger">*</span></label>
										<input type="text" id="pharmacy_code" class="form-control" placeholder="FARM-XX-001" required>
									</div>
								</div>
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Nombre <span class="text-danger">*</span></label>
										<input type="text" id="pharmacy_name" class="form-control" placeholder="Nombre de la farmacia" required>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-12">
									<div class="mb-3">
										<label class="form-label">Dirección <span class="text-danger">*</span></label>
										<input type="text" id="pharmacy_address" class="form-control" placeholder="Dirección completa" required>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Ciudad <span class="text-danger">*</span></label>
										<input type="text" id="pharmacy_city" class="form-control" placeholder="Ciudad" required>
									</div>
								</div>
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Código Postal</label>
										<input type="text" id="pharmacy_postal_code" class="form-control" placeholder="38001">
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Teléfono</label>
										<input type="text" id="pharmacy_phone" class="form-control" placeholder="+34 922 000 000">
									</div>
								</div>
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Email</label>
										<input type="email" id="pharmacy_email" class="form-control" placeholder="farmacia@ejemplo.com">
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Latitud</label>
										<input type="text" id="pharmacy_lat" class="form-control" placeholder="28.4682025" readonly>
									</div>
								</div>
								<div class="col-lg-6">
									<div class="mb-3">
										<label class="form-label">Longitud</label>
										<input type="text" id="pharmacy_lng" class="form-control" placeholder="-16.2546063" readonly>
									</div>
								</div>
							</div>

							<div class="mb-3">
								<label class="form-label">Ubicación en mapa <small class="text-muted">(Haz clic para seleccionar)</small></label>
								<div id="mapFormPharmacy" class="map-form-container"></div>
							</div>
						</div>

						<div class="modal-footer">
							<button type="button" class="btn btn-link" data-bs-dismiss="modal">Cancelar</button>
							<button type="submit" class="btn btn-primary" id="btnSubmitPharmacy">Guardar</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<!-- /create-edit modal -->

		<!-- Show Modal -->
		<div id="modalShowPharmacy" class="modal fade" tabindex="-1">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header bg-success text-white border-0">
						<h5 class="modal-title" id="modalShowTitle">Detalle de Farmacia</h5>
						<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
					</div>

					<div class="modal-body">
						<div class="row">
							<div class="col-lg-6">
								<table class="table table-sm">
									<tbody>
										<tr><td class="text-muted" width="40%">Código</td><td id="show_code" class="fw-semibold">-</td></tr>
										<tr><td class="text-muted">Nombre</td><td id="show_name" class="fw-semibold">-</td></tr>
										<tr><td class="text-muted">Dirección</td><td id="show_address">-</td></tr>
										<tr><td class="text-muted">Ciudad</td><td id="show_city">-</td></tr>
										<tr><td class="text-muted">Código Postal</td><td id="show_postal_code">-</td></tr>
										<tr><td class="text-muted">Teléfono</td><td id="show_phone">-</td></tr>
										<tr><td class="text-muted">Email</td><td id="show_email">-</td></tr>
										<tr><td class="text-muted">Coordenadas</td><td id="show_coords">-</td></tr>
									</tbody>
								</table>
							</div>
							<div class="col-lg-6">
								<div id="mapShowPharmacy" class="map-show-container"></div>
							</div>
						</div>
					</div>

					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
					</div>
				</div>
			</div>
		</div>
		<!-- /show modal -->

		<!-- Delete Confirm Modal -->
		<div id="modalDeletePharmacy" class="modal fade" tabindex="-1">
			<div class="modal-dialog modal-sm">
				<div class="modal-content">
					<div class="modal-header bg-danger text-white border-0">
						<h5 class="modal-title">Confirmar Eliminación</h5>
						<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
					</div>
					<div class="modal-body text-center">
						<i class="ti ti-alert-triangle text-danger" style="font-size: 3rem;"></i>
						<p class="mt-3 mb-0">¿Estás seguro de eliminar la farmacia <strong id="delete_pharmacy_name"></strong>?</p>
						<p class="text-muted small">Esta acción no se puede deshacer.</p>
					</div>
					<div class="modal-footer justify-content-center">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
						<button type="button" class="btn btn-danger" id="btnConfirmDelete">Eliminar</button>
					</div>
				</div>
			</div>
		</div>
		<!-- /delete confirm modal -->

		<script>
			window.FarmaConfig = window.FarmaConfig || {};
			window.FarmaConfig.apiBase = '<?= API_BASE_URL ?>';
			window.FarmaConfig.token = '<?= $token ?>';
			window.FarmaConfig.isAdmin = <?= $isAdmin ? 'true' : 'false' ?>;
			window.FarmaConfig.selectedPharmacyId = <?= $selectedPharmacyId ? $selectedPharmacyId : 'null' ?>;
			window.FarmaConfig.isFiltered = <?= $isFiltered ? 'true' : 'false' ?>;
		</script>
		<?= AssetsManager::renderJS(['jquery', 'bootstrap', 'sweetalert2', 'select2', 'datatables', 'datatables-bs5', 'datatables-responsive', 'datatables-responsive-bs5', 'leaflet', 'app']) ?>
		<script src="<?= AssetsManager::asset('js/pharmacies_page.js') ?>?v=<?= time() ?>"></script>

	</body>
</html>
