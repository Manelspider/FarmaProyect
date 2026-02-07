<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/assets.php';
requireAuth();

$pageTitle = 'Notificaciones';
$user = $_SESSION['user'];
$userRole = $user['role_name'] ?? '';
$token = $_SESSION['access_token'] ?? '';

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
		<title>Notificaciones - FarmaProject</title>
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
							<i class="ti ti-bell me-2"></i>
							Gestión de Notificaciones
						</h1>
						<p class="page-description">Envío de notificaciones a médicos sobre incidencias de medicamentos</p>
					</div>
				</div>
				<!-- /Page Header -->

				<!-- Notifications Table Card -->
				<div class="card">
					<div class="card-header">
						<div class="card-header-content">
							<h5 class="card-title">
								<i class="ti ti-list me-2"></i>Listado de Notificaciones
								<?php if ($isFiltered): ?>
									<span class="badge bg-info ms-2"><?= htmlspecialchars($selectedPharmacyName) ?></span>
								<?php endif; ?>
							</h5>
						</div>
						<div class="card-header-actions">
							<button type="button" class="btn btn-primary" onclick="createNotification()">
								<i class="ti ti-plus me-2"></i>Nueva Notificación
							</button>
						</div>
					</div>
					<div class="card-body">
						<table id="notificationsTable" class="table table-striped table-hover" style="width:100%">
							<thead>
								<tr>
									<th style="width: 220px;">Imagen</th>
									<th>Tipo</th>
									<th>Título</th>
									<th>Farmacia Origen</th>
									<th>Asignado a</th>
									<th>Prioridad</th>
									<th>Estado</th>
									<th>Fecha</th>
									<th class="text-center">Acciones</th>
								</tr>
							</thead>
							<tbody></tbody>
						</table>
					</div>
				</div>
				<!-- /Notifications Table Card -->

			</div>
			<!-- /Content -->

			<?php require_once __DIR__ . '/../shared/footer.php'; ?>
		</div>
		<!-- /Main Content -->

		<!-- Create/Edit Modal -->
		<div class="modal fade" id="modalNotification" tabindex="-1" aria-hidden="true" data-action="CREATE">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modalNotificationTitle">Nueva Notificación</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form id="formNotification" novalidate>
						<div class="modal-body">
							<div class="alert alert-danger d-none" id="notification_error_message"></div>

							<div class="row g-3">
								<!-- Notification Type -->
								<div class="col-md-6">
									<label for="notification_type_id" class="form-label">Tipo de Notificación <span class="text-danger">*</span></label>
									<select class="form-select" id="notification_type_id" required>
										<option value="">Seleccionar...</option>
									</select>
								</div>

								<!-- Priority -->
								<div class="col-md-6">
									<label for="notification_priority" class="form-label">Prioridad <span class="text-danger">*</span></label>
									<select class="form-select" id="notification_priority" required>
										<option value="low">Baja</option>
										<option value="normal" selected>Normal</option>
										<option value="high">Alta</option>
										<option value="urgent">Urgente</option>
									</select>
								</div>

								<!-- Pharmacy -->
								<div class="col-md-6">
									<label for="notification_pharmacy_id" class="form-label">Farmacia Origen <span class="text-danger">*</span></label>
									<select class="form-select select2-pharmacy" id="notification_pharmacy_id" required>
										<option value="">Seleccionar farmacia...</option>
									</select>
								</div>

								<!-- Patient CIP -->
								<div class="col-md-6">
									<label for="notification_patient_cip" class="form-label">CIP Paciente</label>
									<input type="text" class="form-control" id="notification_patient_cip" placeholder="Opcional" />
								</div>

								<!-- Title -->
								<div class="col-12">
									<label for="notification_title" class="form-label">Título <span class="text-danger">*</span></label>
									<input type="text" class="form-control" id="notification_title" required />
								</div>

								<!-- Message -->
								<div class="col-12">
									<label for="notification_message" class="form-label">Mensaje <span class="text-danger">*</span></label>
									<textarea class="form-control" id="notification_message" rows="4" required></textarea>
								</div>

								<!-- Separator: Doctor Assignment -->
								<div class="col-12">
									<hr class="my-2">
									<h6 class="text-muted mb-3"><i class="ti ti-user-plus me-2"></i>Asignar Doctor</h6>
								</div>

								<!-- External Doctor Toggle -->
								<div class="col-12">
									<div class="form-check">
										<input class="form-check-input" type="checkbox" id="notification_external_doctor" />
										<label class="form-check-label" for="notification_external_doctor">
											El doctor no está registrado en el sistema (enviar por email)
										</label>
									</div>
								</div>

								<!-- Doctor Select (Panel Doctors) -->
								<div class="col-12" id="doctor_select_container">
									<label for="notification_assigned_to" class="form-label">Seleccionar Doctor</label>
									<select class="form-select select2-doctor" id="notification_assigned_to">
										<option value="">Opcional - Seleccionar doctor...</option>
									</select>
									<small class="text-muted">Si no selecciona ninguno, la notificación quedará sin asignar</small>
								</div>

								<!-- External Email (Hidden by default) -->
								<div class="col-12 d-none" id="external_email_container">
									<label for="notification_external_email" class="form-label">Email del Doctor Externo <span class="text-danger">*</span></label>
									<input type="email" class="form-control" id="notification_external_email" placeholder="doctor@ejemplo.com" />
									<small class="text-muted">Se enviará un email con la notificación a esta dirección</small>
								</div>

								<!-- Image -->
								<div class="col-12">
									<hr class="my-2">
									<label for="notification_image" class="form-label">Imagen Adjunta (opcional)</label>
									<div class="input-group">
										<input type="file" class="form-control" id="notification_image" accept="image/*" />
										<button class="btn btn-outline-secondary" type="button" id="btnClearNotifImage" title="Quitar imagen">
											<i class="ti ti-x"></i>
										</button>
									</div>
									<small class="text-muted">Formatos permitidos: JPG, PNG, GIF. Máximo 2MB.</small>
									<div class="mt-2 d-none" id="notifImagePreviewContainer">
										<img id="notifImagePreview" src="" alt="Vista previa" class="img-thumbnail" style="max-height: 200px;" />
									</div>
								</div>

							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
							<button type="submit" class="btn btn-primary">Enviar Notificación</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<!-- /Create/Edit Modal -->

		<!-- Show Modal -->
		<div class="modal fade" id="modalShowNotification" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-xl">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modalShowTitle">Detalle de la Notificación</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="row">
							<!-- Columna izquierda: Imagen -->
							<div class="col-md-4">
								<div id="show_image_container" class="text-start">
									<label class="form-label fw-bold">Imagen Adjunta</label>
									<div class="p-2 border rounded bg-light">
										<img id="show_notif_image" src="" alt="Imagen de notificación" 
											class="img-fluid rounded" style="max-height: 350px; cursor: pointer;" onclick="window.open(this.src, '_blank')">
									</div>
								</div>
							</div>
							<!-- Columna derecha: Información -->
							<div class="col-md-8">
								<div class="row g-3">
									<div class="col-md-6">
										<label class="form-label fw-bold">Tipo</label>
										<p class="form-control-static" id="show_type">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Prioridad</label>
										<p class="form-control-static" id="show_priority">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Farmacia Origen</label>
										<p class="form-control-static" id="show_pharmacy">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">CIP Paciente</label>
										<p class="form-control-static" id="show_cip">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Creado por</label>
										<p class="form-control-static" id="show_created_by">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Asignado a</label>
										<p class="form-control-static" id="show_assigned_to">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Estado</label>
										<p class="form-control-static" id="show_status">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Fecha Creación</label>
										<p class="form-control-static" id="show_created_at">-</p>
									</div>
									<div class="col-12">
										<label class="form-label fw-bold">Título</label>
										<p class="form-control-static" id="show_title">-</p>
									</div>
									<div class="col-12">
										<label class="form-label fw-bold">Mensaje</label>
										<p class="form-control-static" id="show_message" style="white-space: pre-wrap;">-</p>
									</div>
								</div>
							</div>
						</div>

						<!-- Conversación y cambio de estado - Ocupa todo el ancho -->
						<hr class="my-3">
						<div class="row">
							<div class="col-12">
								<h6 class="mb-3"><i class="ti ti-messages me-2"></i>Conversación</h6>
								<div id="messages_container" class="border rounded p-3" style="max-height: 300px; overflow-y: auto; background: #f8f9fa;">
									<p class="text-muted text-center">No hay mensajes adicionales</p>
								</div>

								<!-- Add Message Form -->
								<div class="mt-3" id="add_message_form_container">
									<label class="form-label">Añadir mensaje</label>
									<div class="input-group">
										<textarea class="form-control" id="new_message" rows="2" placeholder="Escribe tu respuesta..."></textarea>
										<button class="btn btn-primary" type="button" onclick="sendMessage()">
											<i class="ti ti-send"></i>
										</button>
									</div>
								</div>

								<!-- Estado -->
								<div class="mt-3 d-flex align-items-center gap-3">
									<label class="form-label mb-0 fw-bold">Cambiar estado:</label>
									<select class="form-select form-select-sm" id="change_status" style="width: auto;">
										<option value="pending">Pendiente</option>
										<option value="in_progress">En Proceso</option>
										<option value="resolved">Resuelto</option>
										<option value="closed">Cerrado</option>
										<option value="cancelled">Cancelado</option>
									</select>
									<button type="button" class="btn btn-success btn-sm" onclick="updateStatus()">
										<i class="ti ti-check me-1"></i>Actualizar
									</button>
								</div>
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
		<div class="modal fade" id="modalDeleteNotification" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header bg-danger text-white">
						<h5 class="modal-title">Confirmar Eliminación</h5>
						<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>¿Estás seguro de que deseas eliminar la notificación <strong id="delete_notification_name"></strong>?</p>
						<p class="text-muted small">Esta acción no se puede deshacer.</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
						<button type="button" class="btn btn-danger" id="btnConfirmDelete">
							<i class="ti ti-trash me-2"></i>Eliminar
						</button>
					</div>
				</div>
			</div>
		</div>
		<!-- /Delete Confirm Modal -->

		<!-- Hidden file input for table image upload -->
		<input type="file" id="tableImageInput" accept="image/*" style="display: none;" onchange="handleTableImageChange(event)" />

		<?= AssetsManager::renderJS(['jquery', 'bootstrap', 'datatables', 'datatables-responsive', 'datatables-bs5', 'select2', 'select2-es', 'sweetalert2', 'app', 'notifications_page']) ?>

		<script>
			window.FarmaConfig = window.FarmaConfig || {};
			FarmaConfig.apiBase = '<?= API_BASE_URL ?>';
			FarmaConfig.token = '<?= $token ?>';
			FarmaConfig.userRole = '<?= $userRole ?>';
			FarmaConfig.selectedPharmacyId = <?= $selectedPharmacyId ? $selectedPharmacyId : 'null' ?>;
			FarmaConfig.selectedPharmacyName = <?= $selectedPharmacyName ? "'" . addslashes($selectedPharmacyName) . "'" : 'null' ?>;
		</script>

	</body>

</html>
