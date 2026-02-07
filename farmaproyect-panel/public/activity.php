<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/assets.php';
requireAuth();

$pageTitle = 'Actividad';
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
		<title>Actividad - FarmaProject</title>
		<?= AssetsManager::renderCSS(['bootstrap', 'tabler-icons', 'select2', 'select2-bs5', 'datatables', 'datatables-responsive', 'main']) ?>
		<link href="<?= AssetsManager::asset('css/activity_page.css') ?>" rel="stylesheet"/>
	</head>

	<body>

		<div class="layout">
			<?php include __DIR__ . '/../shared/sidebar.php'; ?>

			<!-- Main content -->
			<div class="main-content">
				<?php include __DIR__ . '/../shared/header.php'; ?>

				<!-- Page body -->
				<div class="page-body">
					<div class="container-fluid">

						<!-- Page header -->
						<div class="d-flex align-items-center justify-content-between mb-4">
							<div>
								<h2 class="mb-1">Registro de Actividad</h2>
								<p class="text-muted mb-0">
									<?php if ($isFiltered): ?>
									<span class="badge badge-success me-2"><i class="ti ti-filter"></i> <?= htmlspecialchars($selectedPharmacyName) ?></span>
									Historial filtrado por farmacia
									<?php else: ?>
									Historial de eventos del sistema
									<?php endif; ?>
								</p>
							</div>
							<div class="d-flex gap-2">
								<button class="btn btn-outline-secondary" id="btnRefresh">
									<i class="ti ti-refresh me-1"></i> Actualizar
								</button>
								<button class="btn btn-primary" id="btnExport">
									<i class="ti ti-download me-1"></i> Exportar
								</button>
							</div>
						</div>
						<!-- /page header -->

						<!-- Filters -->
						<div class="card mb-4">
							<div class="card-body">
								<div class="row g-3">
									<div class="col-md-3">
										<label class="form-label">Tipo de evento</label>
										<select class="form-select" id="filterType">
											<option value="">Todos</option>
											<option value="user">Usuarios</option>
											<option value="pharmacy">Farmacias</option>
											<option value="notification">Notificaciones</option>
											<option value="prescription">Recetas</option>
											<option value="system">Sistema</option>
										</select>
									</div>
									<div class="col-md-3">
										<label class="form-label">Farmacia</label>
										<select class="form-select" id="filterPharmacy">
											<option value="">Todas</option>
											<option value="1">Farmacia Central Santa Cruz</option>
											<option value="2">Farmacia Plaza Weyler</option>
											<option value="3">Farmacia Las Canteras</option>
										</select>
									</div>
									<div class="col-md-3">
										<label class="form-label">Desde</label>
										<input type="date" class="form-control" id="filterFrom">
									</div>
									<div class="col-md-3">
										<label class="form-label">Hasta</label>
										<input type="date" class="form-control" id="filterTo">
									</div>
								</div>
							</div>
						</div>
						<!-- /filters -->

						<!-- Activity Table -->
						<div class="card">
							<div class="card-header">
								<h5 class="mb-0">Listado de actividad</h5>
							</div>
							<div class="card-body">
								<table id="activityTable" class="table table-hover" style="width:100%">
									<thead>
										<tr>
											<th>Fecha/Hora</th>
											<th>Tipo</th>
											<th>Descripción</th>
											<th>Usuario</th>
											<th>Farmacia</th>
											<th>IP</th>
										</tr>
									</thead>
									<tbody>
									</tbody>
								</table>
							</div>
						</div>
						<!-- /activity table -->

					</div>
				</div>
				<!-- /page body -->

				<?php include __DIR__ . '/../shared/footer.php'; ?>
			</div>
			<!-- /main content -->
		</div>

		<script>
			window.FarmaConfig = window.FarmaConfig || {};
			window.FarmaConfig.apiBase = '<?= API_BASE_URL ?>';
			window.FarmaConfig.token = '<?= $token ?>';
			window.FarmaConfig.selectedPharmacyId = <?= $selectedPharmacyId ? $selectedPharmacyId : 'null' ?>;
			window.FarmaConfig.isFiltered = <?= $isFiltered ? 'true' : 'false' ?>;
		</script>
		<?= AssetsManager::renderJS(['jquery', 'bootstrap', 'sweetalert2', 'select2', 'datatables', 'datatables-bs5', 'datatables-responsive', 'datatables-responsive-bs5', 'app']) ?>
		<script src="<?= AssetsManager::asset('js/activity_page.js') ?>?v=<?= time() ?>"></script>

	</body>
</html>
