<?php
require_once 'auth.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/assets.php';
requireAuth();

$pageTitle = 'Recetas';
$user = $_SESSION['user'];
$userRole = $user['role_name'] ?? '';
$token = $_SESSION['access_token'] ?? '';

// Get selected pharmacy from session
$selectedPharmacy = $_SESSION['selected_pharmacy'] ?? null;
$selectedPharmacyId = $selectedPharmacy['id'] ?? null;
$selectedPharmacyName = $selectedPharmacy['name'] ?? null;
$isFiltered = $selectedPharmacyId !== null;

// Determinar si el usuario puede editar
$canEdit = in_array($userRole, ['Administrador', 'Médico']);
$canCreate = in_array($userRole, ['Administrador', 'Médico']);
$canDispense = in_array($userRole, ['Administrador', 'Farmacéutico']);
?>
<!DOCTYPE html>
<html lang="es" dir="ltr">

	<head>
		<meta charset="utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>Recetas - FarmaProject</title>
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
							<i class="ti ti-file-certificate me-2"></i>
							<?php if ($userRole === 'Médico'): ?>
								Mis Recetas
							<?php elseif ($userRole === 'Farmacéutico'): ?>
								Recetas Recibidas
							<?php else: ?>
								Gestión de Recetas
							<?php endif; ?>
						</h1>
						<p class="page-description">
							<?php if ($userRole === 'Médico'): ?>
								Crea y gestiona recetas médicas para tus pacientes
							<?php elseif ($userRole === 'Farmacéutico'): ?>
								Consulta las recetas enviadas a tu farmacia
							<?php else: ?>
								Administración de recetas del sistema
							<?php endif; ?>
						</p>
					</div>
				</div>
				<!-- /Page Header -->

				<!-- Prescriptions Table Card -->
				<div class="card">
					<div class="card-header">
						<div class="card-header-content">
							<h5 class="card-title">
								<i class="ti ti-list me-2"></i>Listado de Recetas
								<?php if ($isFiltered && $userRole === 'Farmacéutico'): ?>
									<span class="badge bg-info ms-2"><?= htmlspecialchars($selectedPharmacyName) ?></span>
								<?php endif; ?>
							</h5>
						</div>
						<?php if ($canCreate): ?>
						<div class="card-header-actions">
							<button type="button" class="btn btn-primary" onclick="createPrescription()">
								<i class="ti ti-plus me-2"></i>Nueva Receta
							</button>
						</div>
						<?php endif; ?>
					</div>
					<div class="card-body">
						<table id="prescriptionsTable" class="table table-striped table-hover" style="width:100%">
							<thead>
								<tr>
									<th style="width: 220px;">Imagen</th>
									<th>CIP Paciente</th>
									<th>Medicamento/s</th>
									<th>Doctor</th>
									<th>Farmacia</th>
									<th>Estado</th>
									<th>F. Emisión</th>
									<th>F. Caducidad</th>
									<th class="text-center">Acciones</th>
								</tr>
							</thead>
							<tbody></tbody>
						</table>
					</div>
				</div>
				<!-- /Prescriptions Table Card -->

			</div>
			<!-- /Content -->

			<?php require_once __DIR__ . '/../shared/footer.php'; ?>
		</div>
		<!-- /Main Content -->

		<!-- Create/Edit Modal -->
		<div class="modal fade" id="modalPrescription" tabindex="-1" aria-hidden="true" data-action="CREATE">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modalPrescriptionTitle">Nueva Receta</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<form id="formPrescription" novalidate>
						<div class="modal-body">
							<div class="alert alert-danger d-none" id="prescription_error_message"></div>

							<div class="row g-3">
								<!-- Patient CIP -->
								<div class="col-md-6">
									<label for="prescription_patient_cip" class="form-label">CIP Paciente <span class="text-danger">*</span></label>
									<input type="text" class="form-control" id="prescription_patient_cip" required />
								</div>

								<!-- Status -->
								<div class="col-md-6">
									<label for="prescription_status" class="form-label">Estado</label>
									<select class="form-select" id="prescription_status">
										<option value="draft">Borrador</option>
										<option value="active" selected>Activa</option>
										<option value="dispensed">Dispensada</option>
										<option value="expired">Caducada</option>
										<option value="cancelled">Cancelada</option>
									</select>
								</div>

								<!-- Issue Date -->
								<div class="col-md-6">
									<label for="prescription_issue_date" class="form-label">Fecha de Emisión <span class="text-danger">*</span></label>
									<input type="date" class="form-control" id="prescription_issue_date" required />
								</div>

								<!-- Expiry Date -->
								<div class="col-md-6">
									<label for="prescription_expiry_date" class="form-label">Fecha de Caducidad</label>
									<input type="date" class="form-control" id="prescription_expiry_date" />
								</div>

								<!-- Medication -->
								<div class="col-12">
									<label for="prescription_medication" class="form-label">Medicamento/s <span class="text-danger">*</span></label>
									<textarea class="form-control" id="prescription_medication" rows="3" placeholder="Lista de medicamentos recetados..." required></textarea>
								</div>

								<!-- Dosage -->
								<div class="col-12">
									<label for="prescription_dosage" class="form-label">Posología (orientativa)</label>
									<textarea class="form-control" id="prescription_dosage" rows="2" placeholder="Indicaciones de posología orientativa..."></textarea>
								</div>

								<!-- Pharmacy (optional) -->
								<div class="col-12">
									<label for="prescription_pharmacy_id" class="form-label">Enviar a Farmacia</label>
									<select class="form-select select2-pharmacy" id="prescription_pharmacy_id">
										<option value="">Sin asignar - Seleccionar farmacia...</option>
									</select>
									<small class="text-muted">Opcional. Puedes enviarla después a una farmacia específica.</small>
								</div>

								<!-- Instructions -->
								<div class="col-12">
									<label for="prescription_instructions" class="form-label">Instrucciones</label>
									<textarea class="form-control" id="prescription_instructions" rows="3" placeholder="Instrucciones de uso..."></textarea>
								</div>

								<!-- Notes -->
								<div class="col-12">
									<label for="prescription_notes" class="form-label">Notas</label>
									<textarea class="form-control" id="prescription_notes" rows="2" placeholder="Notas adicionales..."></textarea>
								</div>

								<!-- Image -->
								<div class="col-12">
									<label for="prescription_image" class="form-label">Imagen de la Receta (opcional)</label>
									<div class="input-group">
										<input type="file" class="form-control" id="prescription_image" accept="image/*" />
										<button class="btn btn-outline-secondary" type="button" id="btnClearImage" title="Quitar imagen">
											<i class="ti ti-x"></i>
										</button>
									</div>
									<small class="text-muted">Formatos permitidos: JPG, PNG, GIF. Máximo 2MB.</small>
									<div class="mt-2 d-none" id="imagePreviewContainer">
										<img id="imagePreview" src="" alt="Vista previa" class="img-thumbnail" style="max-height: 200px;" />
									</div>
								</div>

							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
							<button type="submit" class="btn btn-primary">Guardar Receta</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<!-- /Create/Edit Modal -->

		<!-- Show Modal -->
		<div class="modal fade" id="modalShowPrescription" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-xl">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modalShowPrescriptionTitle">Detalle de la Receta</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<div class="row">
							<!-- Columna izquierda: Imagen -->
							<div class="col-md-4" id="show_image_column">
								<label class="form-label fw-bold">Imagen de la Receta</label>
								<div class="p-2 border rounded bg-light">
									<img id="show_image" src="" alt="Imagen de la receta" class="img-fluid rounded" style="max-height: 350px; cursor: pointer;" onclick="window.open(this.src, '_blank')" />
								</div>
							</div>
							<!-- Columna derecha: Información -->
							<div class="col-md-8">
								<div class="row g-3">
									<div class="col-md-6">
										<label class="form-label fw-bold">CIP Paciente</label>
										<p class="form-control-static" id="show_patient_cip">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Estado</label>
										<p class="form-control-static" id="show_prescription_status">-</p>
									</div>

									<div class="col-12">
										<label class="form-label fw-bold">Medicamento/s</label>
										<p class="form-control-static" id="show_medication" style="white-space: pre-wrap;">-</p>
									</div>
									<div class="col-12">
										<label class="form-label fw-bold">Posología (orientativa)</label>
										<p class="form-control-static" id="show_dosage" style="white-space: pre-wrap;">-</p>
									</div>

									<div class="col-12">
										<label class="form-label fw-bold">Instrucciones</label>
										<p class="form-control-static" id="show_instructions" style="white-space: pre-wrap;">-</p>
									</div>

									<div class="col-md-6">
										<label class="form-label fw-bold">Médico</label>
										<p class="form-control-static" id="show_doctor">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Farmacia Destino</label>
										<p class="form-control-static" id="show_pharmacy">-</p>
									</div>

									<div class="col-md-6">
										<label class="form-label fw-bold">Fecha de Emisión</label>
										<p class="form-control-static" id="show_issue_date">-</p>
									</div>
									<div class="col-md-6">
										<label class="form-label fw-bold">Fecha de Caducidad</label>
										<p class="form-control-static" id="show_expiry_date">-</p>
									</div>

									<!-- Dispensed info -->
									<div class="col-md-6 d-none" id="show_dispensed_container">
										<label class="form-label fw-bold">Dispensado por</label>
										<p class="form-control-static" id="show_dispensed_by">-</p>
									</div>
									<div class="col-md-6 d-none" id="show_dispensed_at_container">
										<label class="form-label fw-bold">Fecha de Dispensación</label>
										<p class="form-control-static" id="show_dispensed_at">-</p>
									</div>

									<div class="col-12">
										<label class="form-label fw-bold">Notas</label>
										<p class="form-control-static" id="show_notes" style="white-space: pre-wrap;">-</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<?php if ($canDispense): ?>
						<button type="button" class="btn btn-success" id="btnDispense" onclick="dispensePrescription()">
							<i class="ti ti-check me-1"></i>Marcar como Dispensada
						</button>
						<?php endif; ?>
						<?php if ($userRole === 'Farmacéutico'): ?>
						<button type="button" class="btn btn-warning" id="btnCreateNotification" onclick="createNotificationFromPrescription()">
							<i class="ti ti-bell me-1"></i>Crear Notificación
						</button>
						<?php endif; ?>
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
					</div>
				</div>
			</div>
		</div>
		<!-- /Show Modal -->

		<!-- Send to Pharmacy Modal -->
		<div class="modal fade" id="modalSendToPharmacy" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Enviar a Farmacia</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>Selecciona la farmacia a la que deseas enviar esta receta:</p>
						<select class="form-select select2-pharmacy" id="send_pharmacy_id" style="width: 100%;">
							<option value="">Seleccionar farmacia...</option>
						</select>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
						<button type="button" class="btn btn-primary" onclick="confirmSendToPharmacy()">
							<i class="ti ti-send me-1"></i>Enviar
						</button>
					</div>
				</div>
			</div>
		</div>
		<!-- /Send to Pharmacy Modal -->

		<!-- Delete Confirm Modal -->
		<div class="modal fade" id="modalDeletePrescription" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header bg-danger text-white">
						<h5 class="modal-title">Confirmar Eliminación</h5>
						<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<p>¿Estás seguro de que deseas eliminar la receta para <strong id="delete_prescription_name"></strong>?</p>
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
		<input type="file" id="tablePrescriptionImageInput" accept="image/*" style="display: none;" onchange="handleTablePrescriptionImageChange(event)" />

		<?= AssetsManager::renderJS(['jquery', 'bootstrap', 'datatables', 'datatables-responsive', 'datatables-bs5', 'select2', 'select2-es', 'sweetalert2', 'app', 'prescriptions_page']) ?>

		<script>
			window.FarmaConfig = window.FarmaConfig || {};
			FarmaConfig.apiBase = '<?= API_BASE_URL ?>';
			FarmaConfig.token = '<?= $token ?>';
			FarmaConfig.userRole = '<?= $userRole ?>';
			FarmaConfig.canEdit = <?= $canEdit ? 'true' : 'false' ?>;
			FarmaConfig.canCreate = <?= $canCreate ? 'true' : 'false' ?>;
			FarmaConfig.canDispense = <?= $canDispense ? 'true' : 'false' ?>;
			FarmaConfig.selectedPharmacyId = <?= $selectedPharmacyId ? $selectedPharmacyId : 'null' ?>;
			FarmaConfig.selectedPharmacyName = <?= $selectedPharmacyName ? "'" . addslashes($selectedPharmacyName) . "'" : 'null' ?>;
		</script>

	</body>

</html>
