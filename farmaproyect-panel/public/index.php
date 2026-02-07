<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/assets.php';
requireAuth();

$pageTitle = 'Dashboard';
$user = $_SESSION['user'];
$userData = $user['data'] ?? [];
$userName = trim(($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? '')) ?: 'Usuario';
$userRole = $user['role_name'] ?? '';
$token = $_SESSION['access_token'] ?? '';

$isAdmin = $userRole === 'Administrador';
$isDoctor = $userRole === 'Médico';
$isFarmaceutico = $userRole === 'Farmacéutico';
$canViewAllPharmacies = $isAdmin || $isDoctor;
$canViewUsers = $isAdmin;

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
		<title>Dashboard - FarmaProject</title>
		<?= AssetsManager::renderCSS(['bootstrap', 'tabler-icons', 'select2', 'select2-bs5', 'leaflet', 'main']) ?>
		<link href="<?= AssetsManager::asset('css/index_page.css') ?>" rel="stylesheet"/>
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
						<div class="mb-4">
							<h2 class="mb-1">Bienvenido, <?= htmlspecialchars($userName) ?></h2>
							<p class="text-muted mb-0">
								<?php if ($isFiltered && $canViewAllPharmacies): ?>
									<span class="badge badge-success me-2"><i class="ti ti-filter"></i> <?= htmlspecialchars($selectedPharmacyName) ?></span>
									Mostrando datos de la farmacia seleccionada
								<?php elseif ($isFarmaceutico): ?>
									Panel de gestión de tu farmacia
								<?php elseif ($isDoctor): ?>
									Panel de gestión médica
								<?php else: ?>
									Resumen general del sistema
								<?php endif; ?>
							</p>
						</div>
						<!-- /page header -->

						<!-- Stat Cards -->
						<div class="row g-3 mb-4">
							<?php if ($canViewAllPharmacies && !$isFiltered): ?>
							<div class="col-6 col-lg-3">
								<div class="stat-card">
									<div class="stat-icon green"><i class="ti ti-building-store"></i></div>
									<div class="stat-info">
										<div class="stat-label">Farmacias</div>
										<div class="stat-value" id="statPharmacies">3</div>
										<div class="stat-change neutral">Registradas</div>
									</div>
								</div>
							</div>
							<?php endif; ?>
							
							<?php if ($canViewUsers && !$isFiltered): ?>
							<div class="col-6 col-lg-3">
								<div class="stat-card">
									<div class="stat-icon sand"><i class="ti ti-users"></i></div>
									<div class="stat-info">
										<div class="stat-label">Usuarios</div>
										<div class="stat-value">3</div>
										<div class="stat-change neutral">Activos</div>
									</div>
							</div>
						</div>
						<?php endif; ?>
						
						<div class="col-6 col-lg-3">
							<div class="stat-card">
								<div class="stat-icon gray"><i class="ti ti-bell"></i></div>
								<div class="stat-info">
									<div class="stat-label">Notificaciones</div>
									<div class="stat-value" id="statNotifications">-</div>
									<div class="stat-change" id="statNotificationsPending">Cargando...</div>
								</div>
							</div>
						</div>

						<div class="col-6 col-lg-3">
							<div class="stat-card">
								<div class="stat-icon beige"><i class="ti ti-file-text"></i></div>
								<div class="stat-info">
									<div class="stat-label">Recetas</div>
									<div class="stat-value" id="statPrescriptions">-</div>
									<div class="stat-change" id="statPrescriptionsToday">Cargando...</div>
								</div>
							</div>
						</div>
					</div>
					<!-- /stat cards -->

						<!-- Map + Chart Row -->
						<div class="row g-3 mb-4">
							<div class="col-lg-7">
								<div class="card h-100">
									<div class="card-header d-flex align-items-center justify-content-between">
										<h3 class="mb-0" style="font-size:0.95rem;">
											<i class="ti ti-map-pin me-1"></i>
											<?= ($isFarmaceutico || $isFiltered) ? 'Ubicación de la farmacia' : 'Mapa de farmacias' ?>
										</h3>
										<?php if ($canViewAllPharmacies && !$isFiltered): ?>
										<span class="badge badge-success" id="pharmacyCount">3 farmacias</span>
										<?php endif; ?>
									</div>
									<div class="card-body p-0">
										<div id="pharmacyMap" style="height: 350px; border-radius: 0 0 10px 10px;"></div>
									</div>
								</div>
							</div>
							<div class="col-lg-5">
								<div class="card h-100">
									<div class="card-header">
										<h3 class="mb-0" style="font-size:0.95rem;">Notificaciones por tipo</h3>
									</div>
									<div class="card-body">
										<div id="chartTypes" style="height: 300px;"></div>
									</div>
								</div>
							</div>
						</div>
						<!-- /map + chart row -->

						<!-- Chart Full + Quick Access -->
						<div class="row g-3">
							<div class="col-lg-8">
								<div class="card">
									<div class="card-header d-flex align-items-center justify-content-between">
										<h3 class="mb-0" style="font-size:0.95rem;">Notificaciones por mes</h3>
										<div id="yearSelectorContainer"></div>
									</div>
									<div class="card-body">
										<div id="chartNotifications" style="height: 250px;"></div>
									</div>
								</div>
							</div>
							<div class="col-lg-4">
								<div class="card mb-3">
									<div class="card-header">
										<h3 class="mb-0" style="font-size:0.95rem;">Sistema</h3>
									</div>
									<div class="card-body">
										<table class="table table-sm mb-0">
											<tbody>
												<tr><td class="text-muted">Versión</td><td class="text-end fw-semibold">v1.0.0</td></tr>
												<tr><td class="text-muted">Estado</td><td class="text-end"><span class="badge badge-success">Operativo</span></td></tr>
												<tr><td class="text-muted">Rol</td><td class="text-end"><span class="badge badge-secondary"><?= htmlspecialchars($userRole) ?></span></td></tr>
											</tbody>
										</table>
									</div>
								</div>
								<div class="card">
									<div class="card-header d-flex align-items-center justify-content-between">
										<h3 class="mb-0" style="font-size:0.95rem;">Accesos rápidos</h3>
									</div>
									<div class="card-body p-0">
										<a href="profile.php" class="d-flex align-items-center gap-3 px-3 py-3 border-bottom" style="border-color:var(--beige)!important;">
											<i class="ti ti-user" style="font-size:1.2rem;color:var(--primary);"></i>
											<div>
												<div class="fw-semibold" style="font-size:0.9rem;">Mi Perfil</div>
												<div class="text-muted" style="font-size:0.78rem;">Información personal</div>
											</div>
										</a>
										<?php if ($isAdmin): ?>
										<a href="activity.php" class="d-flex align-items-center gap-3 px-3 py-3">
											<i class="ti ti-activity" style="font-size:1.2rem;color:var(--primary);"></i>
											<div>
												<div class="fw-semibold" style="font-size:0.9rem;">Actividad</div>
												<div class="text-muted" style="font-size:0.78rem;">Registro de actividad</div>
											</div>
										</a>
										<?php endif; ?>
									</div>
								</div>
							</div>
						</div>
						<!-- /chart full + quick access -->

					</div>
				</div>
				<!-- /page body -->

				<?php include __DIR__ . '/../shared/footer.php'; ?>
			</div>
			<!-- /main content -->
		</div>

		<script>
			window.FarmaConfig = {
				apiBase: '<?= API_BASE_URL ?>',
				token: '<?= $token ?>',
				userRole: '<?= $userRole ?>',
				isAdmin: <?= $isAdmin ? 'true' : 'false' ?>,
				isDoctor: <?= $isDoctor ? 'true' : 'false' ?>,
				isFarmaceutico: <?= $isFarmaceutico ? 'true' : 'false' ?>,
				canViewAllPharmacies: <?= $canViewAllPharmacies ? 'true' : 'false' ?>,
				selectedPharmacyId: <?= $selectedPharmacyId ? $selectedPharmacyId : 'null' ?>,
				selectedPharmacyName: <?= $selectedPharmacyName ? "'" . addslashes($selectedPharmacyName) . "'" : 'null' ?>,
				isFiltered: <?= $isFiltered ? 'true' : 'false' ?>
			};
		</script>
		<?= AssetsManager::renderJS(['jquery', 'bootstrap', 'apexcharts', 'sweetalert2', 'select2', 'leaflet', 'app']) ?>
		<script src="<?= AssetsManager::asset('js/index_page.js') ?>?v=<?= time() ?>"></script>

	</body>
</html>
