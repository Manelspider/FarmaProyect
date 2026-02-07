/**
 * Notifications Page - FarmaProject
 */

var notificationsData = [];
var notificationTypesData = [];
var doctorsData = [];
var pharmaciesData = [];
var tableVar = null;
var currentNotificationId = null;
var currentNotifImageBase64 = '';

// Default FarmaProject logo as SVG data URI for notifications without image
var DEFAULT_NOTIFICATION_IMAGE = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect x="5" y="5" width="90" height="90" rx="18" ry="18" fill="#2d7a32"/><g transform="translate(50,50) rotate(-45)"><rect x="-12" y="-30" width="24" height="60" rx="12" ry="12" fill="white"/><line x1="-12" y1="0" x2="12" y2="0" stroke="#2d7a32" stroke-width="2"/></g></svg>');

function getNotifications() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nPharmacyId = objConfig.selectedPharmacyId || null;

	if (!strApiBase || !strToken) {
		console.error('Missing apiBase or token in FarmaConfig');
		FarmaApp.toast('Error de configuración', 'error');
		return false;
	}

	var strUrl = strApiBase + '/notifications';
	if (nPharmacyId) {
		strUrl += '?pharmacy_id=' + nPharmacyId;
	}

	$.ajax({
		type: 'GET',
		url: strUrl,
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast('Error al cargar notificaciones', 'error');
				return false;
			}

			notificationsData = objResponse.data || [];
			renderTable(notificationsData);
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			if (xhr.status === 401) {
				location.replace("logout.php");
			} else {
				FarmaApp.toast('Error del servidor', 'error');
			}
		}
	});
}

function loadNotificationTypes() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'GET',
		url: strApiBase + '/notifications/types',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (objResponse.success) {
				notificationTypesData = objResponse.data || [];
				populateNotificationTypes();
			}
		}
	});
}

function loadDoctors() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'GET',
		url: strApiBase + '/notifications/doctors',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (objResponse.success) {
				doctorsData = objResponse.data || [];
				populateDoctors();
			}
		}
	});
}

function loadPharmacies() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'GET',
		url: strApiBase + '/pharmacies',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (objResponse.success) {
				pharmaciesData = objResponse.data || [];
				populatePharmacies();
			}
		}
	});
}

function populateNotificationTypes() {
	var $select = $('#notification_type_id');
	$select.find('option:not(:first)').remove();
	
	notificationTypesData.forEach(function(type) {
		var $option = $('<option></option>')
			.val(type.id)
			.text(type.name)
			.data('icon', type.icon || 'bell')
			.data('color', type.color || '#6c757d');
		$select.append($option);
	});

	// Initialize Select2 with custom templates
	$select.select2({
		theme: 'bootstrap-5',
		placeholder: 'Seleccionar tipo...',
		allowClear: true,
		dropdownParent: $('#modalNotification'),
		language: 'es',
		templateResult: formatNotificationType,
		templateSelection: formatNotificationTypeSelection
	});
}

function formatNotificationType(state) {
	if (!state.id) return state.text;
	
	var $el = $(state.element);
	var strIcon = $el.data('icon') || 'bell';
	var strColor = $el.data('color') || '#6c757d';
	
	var $result = $(
		'<span class="d-flex align-items-center">' +
		'<span class="badge me-2" style="background-color: ' + strColor + '; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">' +
		'<i class="ti ti-' + strIcon + '"></i></span>' +
		'<span>' + state.text + '</span></span>'
	);
	return $result;
}

function formatNotificationTypeSelection(state) {
	if (!state.id) return state.text;
	
	var $el = $(state.element);
	var strIcon = $el.data('icon') || 'bell';
	var strColor = $el.data('color') || '#6c757d';
	
	var $result = $(
		'<span class="d-flex align-items-center">' +
		'<i class="ti ti-' + strIcon + ' me-2" style="color: ' + strColor + '"></i>' +
		'<span>' + state.text + '</span></span>'
	);
	return $result;
}

function populateDoctors() {
	var $select = $('#notification_assigned_to');
	$select.find('option:not(:first)').remove();
	
	doctorsData.forEach(function(doctor) {
		var strName = doctor.name || doctor.email;
		$select.append('<option value="' + doctor.id + '">' + strName + ' (' + doctor.email + ')</option>');
	});

	// Initialize Select2
	$('.select2-doctor').select2({
		theme: 'bootstrap-5',
		placeholder: 'Buscar doctor...',
		allowClear: true,
		dropdownParent: $('#modalNotification'),
		language: 'es'
	});
}

function populatePharmacies() {
	var $select = $('#notification_pharmacy_id');
	$select.find('option:not(:first)').remove();
	
	pharmaciesData.forEach(function(pharmacy) {
		$select.append('<option value="' + pharmacy.id + '">' + pharmacy.name + '</option>');
	});

	// Initialize Select2
	$('.select2-pharmacy').select2({
		theme: 'bootstrap-5',
		placeholder: 'Buscar farmacia...',
		allowClear: true,
		dropdownParent: $('#modalNotification'),
		language: 'es'
	});

	// If user has selected pharmacy, pre-select it
	var objConfig = window.FarmaConfig || {};
	if (objConfig.selectedPharmacyId) {
		$select.val(objConfig.selectedPharmacyId).trigger('change');
	}
}

function renderTable(aData) {
	var $domDatatable = $('#notificationsTable');

	if (tableVar) {
		tableVar.destroy();
		tableVar = null;
	}

	var aDatatableColumns = [
		{
			data: 'image_base64',
			render: function(objData, strType, objRow, objMeta) {
				var strSrc = objData || DEFAULT_NOTIFICATION_IMAGE;
				return '<img src="' + strSrc + '" ' +
					   'class="img-thumbnail notification-img-thumb" ' +
					   'style="width: 100px; height: 100px; object-fit: cover; cursor: pointer;" ' +
					   'onclick="openImageUpload(event, ' + objRow.id + ')" ' +
					   'onerror="this.src=\'' + DEFAULT_NOTIFICATION_IMAGE + '\';" ' +
					   'title="Click para cambiar imagen" />';
			}
		},
		{ 
			data: 'notification_type_name',
			render: function(objData, strType, objRow, objMeta) {
				var strColor = objRow.notification_type_color || '#6c757d';
				var strIcon = objRow.notification_type_icon || 'ti-bell';
				return '<span class="badge" style="background-color: ' + strColor + '">' +
					   '<i class="ti ' + strIcon + ' me-1"></i>' + objData + '</span>';
			}
		},
		{ 
			data: 'title',
			render: function(objData, strType, objRow, objMeta) {
				return '<span class="fw-semibold">' + objData + '</span>';
			}
		},
		{ 
			data: 'pharmacy_name',
			render: function(objData, strType, objRow, objMeta) {
				return objData || '<span class="text-muted">-</span>';
			}
		},
		{ 
			data: 'assigned_to_name',
			render: function(objData, strType, objRow, objMeta) {
				return objData || '<span class="text-muted">Sin asignar</span>';
			}
		},
		{
			data: 'priority',
			render: function(objData, strType, objRow, objMeta) {
				var objPriorityBadges = {
					'low': '<span class="badge bg-secondary">Baja</span>',
					'normal': '<span class="badge bg-info">Normal</span>',
					'high': '<span class="badge bg-warning">Alta</span>',
					'urgent': '<span class="badge bg-danger">Urgente</span>'
				};
				return objPriorityBadges[objData] || objData;
			}
		},
		{
			data: 'ticket_status',
			render: function(objData, strType, objRow, objMeta) {
				var objStatusBadges = {
					'pending': '<span class="badge bg-secondary">Pendiente</span>',
					'in_progress': '<span class="badge bg-primary">En Proceso</span>',
					'resolved': '<span class="badge bg-success">Resuelto</span>',
					'closed': '<span class="badge bg-dark">Cerrado</span>',
					'cancelled': '<span class="badge bg-danger">Cancelado</span>'
				};
				return objStatusBadges[objData] || objData;
			}
		},
		{
			data: 'created_at',
			render: function(objData, strType, objRow, objMeta) {
				if (!objData) return '<span class="text-muted">-</span>';
				var dtDate = new Date(objData);
				return dtDate.toLocaleDateString('es-ES') + ' ' + dtDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
			}
		},
		{
			data: null,
			render: function(objData, strType, objRow, objMeta) {
				var strStatus = objRow.ticket_status;
				var strHTML = '';
				
				// Quick status buttons
				strHTML += '<div class="d-flex align-items-center justify-content-center gap-1">';
				
				// Status indicator buttons
				if (strStatus === 'pending' || strStatus === 'in_progress') {
					// Show complete button
					strHTML += '<button type="button" class="btn btn-sm btn-outline-success" ';
					strHTML += 'onclick="quickUpdateStatus(event, ' + objRow.id + ', \'resolved\')" ';
					strHTML += 'title="Marcar como Resuelto" data-bs-toggle="tooltip">';
					strHTML += '<i class="ti ti-check"></i></button>';
					
					// Show cancel button
					strHTML += '<button type="button" class="btn btn-sm btn-outline-danger" ';
					strHTML += 'onclick="quickUpdateStatus(event, ' + objRow.id + ', \'cancelled\')" ';
					strHTML += 'title="Cancelar" data-bs-toggle="tooltip">';
					strHTML += '<i class="ti ti-x"></i></button>';
				} else if (strStatus === 'resolved') {
					// Show closed button
					strHTML += '<button type="button" class="btn btn-sm btn-outline-dark" ';
					strHTML += 'onclick="quickUpdateStatus(event, ' + objRow.id + ', \'closed\')" ';
					strHTML += 'title="Cerrar" data-bs-toggle="tooltip">';
					strHTML += '<i class="ti ti-archive"></i></button>';
					
					// Reopen button
					strHTML += '<button type="button" class="btn btn-sm btn-outline-warning" ';
					strHTML += 'onclick="quickUpdateStatus(event, ' + objRow.id + ', \'pending\')" ';
					strHTML += 'title="Reabrir" data-bs-toggle="tooltip">';
					strHTML += '<i class="ti ti-refresh"></i></button>';
				} else if (strStatus === 'cancelled' || strStatus === 'closed') {
					// Reopen button only
					strHTML += '<button type="button" class="btn btn-sm btn-outline-warning" ';
					strHTML += 'onclick="quickUpdateStatus(event, ' + objRow.id + ', \'pending\')" ';
					strHTML += 'title="Reabrir" data-bs-toggle="tooltip">';
					strHTML += '<i class="ti ti-refresh"></i></button>';
				}
				
				// Dropdown menu
				strHTML += '<div class="dropdown">';
				strHTML += '    <a href="#" class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">';
				strHTML += '        <i class="ti ti-dots-vertical"></i>';
				strHTML += '    </a>';
				strHTML += '    <div class="dropdown-menu dropdown-menu-end">';
				strHTML += '        <a href="#" onclick="showNotification(event, ' + objRow.id + ')" class="dropdown-item">';
				strHTML += '            <i class="ti ti-eye me-2"></i> Ver detalle';
				strHTML += '        </a>';
				strHTML += '        <div class="dropdown-divider"></div>';
				strHTML += '        <h6 class="dropdown-header">Cambiar estado</h6>';
				strHTML += '        <a href="#" onclick="quickUpdateStatus(event, ' + objRow.id + ', \'pending\')" class="dropdown-item ' + (strStatus === 'pending' ? 'active' : '') + '">';
				strHTML += '            <i class="ti ti-clock me-2"></i> Pendiente';
				strHTML += '        </a>';
				strHTML += '        <a href="#" onclick="quickUpdateStatus(event, ' + objRow.id + ', \'in_progress\')" class="dropdown-item ' + (strStatus === 'in_progress' ? 'active' : '') + '">';
				strHTML += '            <i class="ti ti-loader me-2"></i> En Proceso';
				strHTML += '        </a>';
				strHTML += '        <a href="#" onclick="quickUpdateStatus(event, ' + objRow.id + ', \'resolved\')" class="dropdown-item ' + (strStatus === 'resolved' ? 'active' : '') + '">';
				strHTML += '            <i class="ti ti-check me-2"></i> Resuelto';
				strHTML += '        </a>';
				strHTML += '        <a href="#" onclick="quickUpdateStatus(event, ' + objRow.id + ', \'closed\')" class="dropdown-item ' + (strStatus === 'closed' ? 'active' : '') + '">';
				strHTML += '            <i class="ti ti-archive me-2"></i> Cerrado';
				strHTML += '        </a>';
				strHTML += '        <a href="#" onclick="quickUpdateStatus(event, ' + objRow.id + ', \'cancelled\')" class="dropdown-item text-danger ' + (strStatus === 'cancelled' ? 'active' : '') + '">';
				strHTML += '            <i class="ti ti-x me-2"></i> Cancelado';
				strHTML += '        </a>';
				strHTML += '        <div class="dropdown-divider"></div>';
				strHTML += '        <a href="#" onclick="deleteNotification(event, ' + objRow.id + ', \'' + objRow.title.replace(/'/g, "\\'") + '\')" class="dropdown-item text-danger">';
				strHTML += '            <i class="ti ti-trash me-2"></i> Eliminar';
				strHTML += '        </a>';
				strHTML += '    </div>';
				strHTML += '</div>';
				
				strHTML += '</div>';

				return strHTML;
			}
		}
	];

	tableVar = $domDatatable.DataTable({
		autoWidth: false,
		paging: true,
		lengthChange: true,
		pageLength: 10,
		responsive: true,
		dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"ip>',
		language: {
			search: '<span class="me-2">Filtrar:</span> _INPUT_',
			searchPlaceholder: 'Escribe un filtro...',
			lengthMenu: '<span class="me-2">Mostrar:</span> _MENU_',
			paginate: { 'first': 'Primero', 'last': 'Ultimo', 'next': '&rarr;', 'previous': '&larr;' },
			zeroRecords: "No se ha encontrado nada",
			info: "Resultados totales: _MAX_",
			infoEmpty: "Sin resultados",
			infoFiltered: "( Resultados del filtro: _TOTAL_ )"
		},
		data: aData,
		columns: aDatatableColumns,
		order: [[7, 'desc']],
		columnDefs: [
			{ "width": "220px", "targets": 0, "orderable": false, "className": "text-center" },
			{ "width": "120px", "targets": -1, "orderable": false, "className": "text-center" },
			{ "width": "auto", "targets": "_all" }
		]
	});
}


// ============================================
// Modal Callbacks
// ============================================

var _componentModalCallbacks = function() {

	var $modalNotification = document.getElementById('modalNotification');
	if ($modalNotification) {
		$modalNotification.addEventListener('hidden.bs.modal', function(e) {
			resetForm();
		});
	}

	var $formNotification = document.getElementById('formNotification');
	if ($formNotification) {
		$formNotification.addEventListener('submit', function(e) {
			e.preventDefault();
			submitNotification();
		});
	}

	var $btnConfirmDelete = document.getElementById('btnConfirmDelete');
	if ($btnConfirmDelete) {
		$btnConfirmDelete.addEventListener('click', function(e) {
			confirmDelete();
		});
	}

	// Toggle external doctor checkbox
	var $externalDoctorCheckbox = document.getElementById('notification_external_doctor');
	if ($externalDoctorCheckbox) {
		$externalDoctorCheckbox.addEventListener('change', function(e) {
			toggleExternalDoctor(this.checked);
		});
	}

	// Image input handler
	$('#notification_image').on('change', function(e) {
		var file = e.target.files[0];
		if (!file) {
			currentNotifImageBase64 = '';
			$('#notifImagePreviewContainer').addClass('d-none');
			$('#notifImagePreview').attr('src', '');
			return;
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			FarmaApp.toast('El archivo debe ser una imagen', 'error');
			$(this).val('');
			return;
		}

		// Validate file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			FarmaApp.toast('La imagen no puede superar los 2MB', 'error');
			$(this).val('');
			return;
		}

		var reader = new FileReader();
		reader.onload = function(readerEvent) {
			currentNotifImageBase64 = readerEvent.target.result;
			$('#notifImagePreview').attr('src', currentNotifImageBase64);
			$('#notifImagePreviewContainer').removeClass('d-none');
		};
		reader.readAsDataURL(file);
	});

	// Clear image button
	$('#btnClearNotifImage').on('click', function() {
		currentNotifImageBase64 = '';
		$('#notification_image').val('');
		$('#notifImagePreviewContainer').addClass('d-none');
		$('#notifImagePreview').attr('src', '');
	});
};


// ============================================
// External Doctor Toggle
// ============================================

function toggleExternalDoctor(bIsExternal) {
	var $doctorSelectContainer = $('#doctor_select_container');
	var $externalEmailContainer = $('#external_email_container');

	if (bIsExternal) {
		$doctorSelectContainer.addClass('d-none');
		$externalEmailContainer.removeClass('d-none');
		$('#notification_assigned_to').val('').trigger('change');
	} else {
		$doctorSelectContainer.removeClass('d-none');
		$externalEmailContainer.addClass('d-none');
		$('#notification_external_email').val('');
	}
}


// ============================================
// CRUD Functions
// ============================================

function createNotification() {
	resetForm();
	$('#modalNotificationTitle').text('Nueva Notificación');
	
	// Pre-select pharmacy if filtered
	var objConfig = window.FarmaConfig || {};
	if (objConfig.selectedPharmacyId) {
		$('#notification_pharmacy_id').val(objConfig.selectedPharmacyId).trigger('change');
	}
	
	// Clear image
	currentNotifImageBase64 = '';
	$('#notification_image').val('');
	$('#notifImagePreviewContainer').addClass('d-none');
	$('#notifImagePreview').attr('src', '');

	var $modalEl = document.getElementById('modalNotification');
	$modalEl.dataset.action = 'CREATE';
	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function showNotification(e, nId) {
	e.preventDefault();

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	// Fetch full notification details with messages
	$.ajax({
		type: 'GET',
		url: strApiBase + '/notifications/' + nId,
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast('Error al cargar notificación', 'error');
				return false;
			}

			var objNotification = objResponse.data;
			currentNotificationId = objNotification.id;

			// Populate fields
			$('#show_type').html('<span class="badge" style="background-color: ' + (objNotification.notification_type_color || '#6c757d') + '">' + 
				objNotification.notification_type_name + '</span>');
			$('#show_priority').html(getPriorityBadge(objNotification.priority));
			$('#show_pharmacy').text(objNotification.pharmacy_name || '-');
			$('#show_cip').text(objNotification.patient_cip || '-');
			$('#show_created_by').text(objNotification.created_by_name || '-');
			$('#show_assigned_to').text(objNotification.assigned_to_name || 'Sin asignar');
			$('#show_status').html(getStatusBadge(objNotification.ticket_status));
			$('#show_title').text(objNotification.title || '-');
			$('#show_message').text(objNotification.message || '-');
			
			var strCreatedAt = '-';
			if (objNotification.created_at) {
				var dtDate = new Date(objNotification.created_at);
				strCreatedAt = dtDate.toLocaleDateString('es-ES') + ' ' + dtDate.toLocaleTimeString('es-ES');
			}
			$('#show_created_at').text(strCreatedAt);

			// Set current status in dropdown
			$('#change_status').val(objNotification.ticket_status);

			// Show image (use default if no image)
			var strImageSrc = objNotification.image_base64 || DEFAULT_NOTIFICATION_IMAGE;
			$('#show_notif_image').attr('src', strImageSrc);

			// Render messages
			renderMessages(objNotification.messages || [], objNotification.message, objNotification.created_by_name, objNotification.created_at);

			$('#modalShowTitle').text(objNotification.title);

			var $modal = new bootstrap.Modal(document.getElementById('modalShowNotification'));
			$modal.show();
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			FarmaApp.toast('Error al cargar notificación', 'error');
		}
	});
}

function getPriorityBadge(strPriority) {
	var objPriorityBadges = {
		'low': '<span class="badge bg-secondary">Baja</span>',
		'normal': '<span class="badge bg-info">Normal</span>',
		'high': '<span class="badge bg-warning">Alta</span>',
		'urgent': '<span class="badge bg-danger">Urgente</span>'
	};
	return objPriorityBadges[strPriority] || strPriority;
}

function getStatusBadge(strStatus) {
	var objStatusBadges = {
		'pending': '<span class="badge bg-secondary">Pendiente</span>',
		'in_progress': '<span class="badge bg-primary">En Proceso</span>',
		'resolved': '<span class="badge bg-success">Resuelto</span>',
		'closed': '<span class="badge bg-dark">Cerrado</span>',
		'cancelled': '<span class="badge bg-danger">Cancelado</span>'
	};
	return objStatusBadges[strStatus] || strStatus;
}

function renderMessages(aMessages, strOriginalMessage, strCreatorName, strCreatedAt) {
	var $container = $('#messages_container');
	$container.empty();

	// Add original message first
	var strDateHtml = '';
	if (strCreatedAt) {
		var dtDate = new Date(strCreatedAt);
		strDateHtml = dtDate.toLocaleDateString('es-ES') + ' ' + dtDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
	}

	var strHtml = '<div class="mb-3 p-2 bg-white rounded border">';
	strHtml += '    <div class="d-flex justify-content-between mb-1">';
	strHtml += '        <strong class="text-primary">' + (strCreatorName || 'Usuario') + '</strong>';
	strHtml += '        <small class="text-muted">' + strDateHtml + '</small>';
	strHtml += '    </div>';
	strHtml += '    <p class="mb-0" style="white-space: pre-wrap;">' + (strOriginalMessage || '') + '</p>';
	strHtml += '</div>';
	$container.append(strHtml);

	// Add additional messages
	if (aMessages && aMessages.length > 0) {
		aMessages.forEach(function(msg) {
			var strMsgDate = '';
			if (msg.created_at) {
				var dtMsgDate = new Date(msg.created_at);
				strMsgDate = dtMsgDate.toLocaleDateString('es-ES') + ' ' + dtMsgDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
			}

			var strMsgHtml = '<div class="mb-3 p-2 bg-white rounded border">';
			strMsgHtml += '    <div class="d-flex justify-content-between mb-1">';
			strMsgHtml += '        <strong class="text-success">' + (msg.user_name || 'Usuario') + '</strong>';
			strMsgHtml += '        <small class="text-muted">' + strMsgDate + '</small>';
			strMsgHtml += '    </div>';
			strMsgHtml += '    <p class="mb-0" style="white-space: pre-wrap;">' + (msg.message || '') + '</p>';
			strMsgHtml += '</div>';
			$container.append(strMsgHtml);
		});
	}
}

function deleteNotification(e, nId, strName) {
	e.preventDefault();

	currentNotificationId = nId;
	$('#delete_notification_name').text(strName);

	var $modal = new bootstrap.Modal(document.getElementById('modalDeleteNotification'));
	$modal.show();
}

function submitNotification() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	// Validate required fields
	var nTypeId = $('#notification_type_id').val();
	var nPharmacyId = $('#notification_pharmacy_id').val();
	var strTitle = $('#notification_title').val().trim();
	var strMessage = $('#notification_message').val().trim();

	if (!nTypeId || !nPharmacyId || !strTitle || !strMessage) {
		$('#notification_error_message')
			.removeClass('d-none')
			.text('Por favor completa todos los campos requeridos');
		return false;
	}

	// Check external doctor
	var bIsExternal = $('#notification_external_doctor').is(':checked');
	var strExternalEmail = $('#notification_external_email').val().trim();

	if (bIsExternal && !strExternalEmail) {
		$('#notification_error_message')
			.removeClass('d-none')
			.text('Por favor ingresa el email del doctor externo');
		return false;
	}

	// Validate email format if external
	if (bIsExternal && strExternalEmail) {
		var regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!regEmail.test(strExternalEmail)) {
			$('#notification_error_message')
				.removeClass('d-none')
				.text('El email del doctor externo no es válido');
			return false;
		}
	}

	var objPayload = {
		notification_type_id: parseInt(nTypeId),
		pharmacy_id: parseInt(nPharmacyId),
		title: strTitle,
		message: strMessage,
		patient_cip: $('#notification_patient_cip').val().trim(),
		priority: $('#notification_priority').val()
	};

	// Add image if present
	if (currentNotifImageBase64) {
		objPayload.image_base64 = currentNotifImageBase64;
	}

	// Add assigned doctor or external email
	if (bIsExternal) {
		objPayload.external_email = strExternalEmail;
	} else {
		var nAssignedTo = $('#notification_assigned_to').val();
		if (nAssignedTo) {
			objPayload.assigned_to_id = parseInt(nAssignedTo);
		}
	}

	$.ajax({
		type: 'POST',
		url: strApiBase + '/notifications/create',
		dataType: 'json',
		contentType: 'application/json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		data: JSON.stringify(objPayload),
		success: function (objResponse) {
			if (!objResponse.success) {
				$('#notification_error_message')
					.removeClass('d-none')
					.text(objResponse.message || 'Error al crear notificación');
				return false;
			}

			FarmaApp.toast(objResponse.message || 'Notificación creada correctamente', 'success');

			// Close modal
			var $modalEl = document.getElementById('modalNotification');
			var $modal = bootstrap.Modal.getInstance($modalEl);
			if ($modal) {
				$modal.hide();
			}

			// Reload table
			getNotifications();
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			var strError = 'Error del servidor';
			if (xhr.responseJSON && xhr.responseJSON.message) {
				strError = xhr.responseJSON.message;
			}
			$('#notification_error_message')
				.removeClass('d-none')
				.text(strError);
		}
	});
}

function confirmDelete() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	if (!currentNotificationId) {
		FarmaApp.toast('ID de notificación no válido', 'error');
		return false;
	}

	$.ajax({
		type: 'DELETE',
		url: strApiBase + '/notifications/' + currentNotificationId + '/delete',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast(objResponse.message || 'Error al eliminar', 'error');
				return false;
			}

			FarmaApp.toast('Notificación eliminada correctamente', 'success');

			// Close modal
			var $modalEl = document.getElementById('modalDeleteNotification');
			var $modal = bootstrap.Modal.getInstance($modalEl);
			if ($modal) {
				$modal.hide();
			}

			// Reload table
			getNotifications();
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			FarmaApp.toast('Error del servidor', 'error');
		}
	});
}

function quickUpdateStatus(e, nId, strNewStatus) {
	e.preventDefault();
	e.stopPropagation();

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	var objStatusLabels = {
		'pending': 'Pendiente',
		'in_progress': 'En Proceso',
		'resolved': 'Resuelto',
		'closed': 'Cerrado',
		'cancelled': 'Cancelado'
	};

	$.ajax({
		type: 'PUT',
		url: strApiBase + '/notifications/' + nId + '/update',
		dataType: 'json',
		contentType: 'application/json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		data: JSON.stringify({ ticket_status: strNewStatus }),
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast(objResponse.message || 'Error al actualizar estado', 'error');
				return false;
			}

			FarmaApp.toast('Estado cambiado a: ' + objStatusLabels[strNewStatus], 'success');

			// Reload table
			getNotifications();
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			FarmaApp.toast('Error al actualizar estado', 'error');
		}
	});
}

// Variable to store the notification ID for image upload
var imageUploadNotificationId = null;

function openImageUpload(e, nId) {
	e.preventDefault();
	e.stopPropagation();
	
	imageUploadNotificationId = nId;
	
	// Trigger the hidden file input
	$('#tableImageInput').val('').trigger('click');
}

function handleTableImageChange(e) {
	var file = e.target.files[0];
	if (!file) return;

	// Validate file type
	if (!file.type.startsWith('image/')) {
		FarmaApp.toast('El archivo debe ser una imagen', 'error');
		return;
	}

	// Validate file size (max 2MB)
	if (file.size > 2 * 1024 * 1024) {
		FarmaApp.toast('La imagen no puede superar los 2MB', 'error');
		return;
	}

	var reader = new FileReader();
	reader.onload = function(readerEvent) {
		var strBase64 = readerEvent.target.result;
		updateNotificationImage(imageUploadNotificationId, strBase64);
	};
	reader.readAsDataURL(file);
}

function updateNotificationImage(nId, strImageBase64) {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'PUT',
		url: strApiBase + '/notifications/' + nId + '/update',
		dataType: 'json',
		contentType: 'application/json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		data: JSON.stringify({ image_base64: strImageBase64 }),
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast(objResponse.message || 'Error al actualizar imagen', 'error');
				return false;
			}

			FarmaApp.toast('Imagen actualizada correctamente', 'success');

			// Reload table
			getNotifications();
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			FarmaApp.toast('Error al actualizar imagen', 'error');
		}
	});
}

function sendMessage() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	var strMessage = $('#new_message').val().trim();

	if (!strMessage) {
		FarmaApp.toast('Escribe un mensaje', 'warning');
		return false;
	}

	if (!currentNotificationId) {
		FarmaApp.toast('ID de notificación no válido', 'error');
		return false;
	}

	$.ajax({
		type: 'POST',
		url: strApiBase + '/notifications/' + currentNotificationId + '/message',
		dataType: 'json',
		contentType: 'application/json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		data: JSON.stringify({ message: strMessage }),
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast(objResponse.message || 'Error al enviar mensaje', 'error');
				return false;
			}

			// Clear textarea
			$('#new_message').val('');

			// Add message to container
			var msg = objResponse.data;
			var strMsgDate = '';
			if (msg.created_at) {
				var dtMsgDate = new Date(msg.created_at);
				strMsgDate = dtMsgDate.toLocaleDateString('es-ES') + ' ' + dtMsgDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
			}

			var strMsgHtml = '<div class="mb-3 p-2 bg-white rounded border">';
			strMsgHtml += '    <div class="d-flex justify-content-between mb-1">';
			strMsgHtml += '        <strong class="text-success">' + (msg.user_name || 'Usuario') + '</strong>';
			strMsgHtml += '        <small class="text-muted">' + strMsgDate + '</small>';
			strMsgHtml += '    </div>';
			strMsgHtml += '    <p class="mb-0" style="white-space: pre-wrap;">' + (msg.message || '') + '</p>';
			strMsgHtml += '</div>';
			$('#messages_container').append(strMsgHtml);

			// Scroll to bottom
			var $container = document.getElementById('messages_container');
			$container.scrollTop = $container.scrollHeight;

			FarmaApp.toast('Mensaje enviado', 'success');
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			FarmaApp.toast('Error al enviar mensaje', 'error');
		}
	});
}

function updateStatus() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	var strStatus = $('#change_status').val();

	if (!currentNotificationId) {
		FarmaApp.toast('ID de notificación no válido', 'error');
		return false;
	}

	$.ajax({
		type: 'PUT',
		url: strApiBase + '/notifications/' + currentNotificationId + '/update',
		dataType: 'json',
		contentType: 'application/json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		data: JSON.stringify({ ticket_status: strStatus }),
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast(objResponse.message || 'Error al actualizar estado', 'error');
				return false;
			}

			FarmaApp.toast('Estado actualizado correctamente', 'success');

			// Update displayed status
			$('#show_status').html(getStatusBadge(strStatus));

			// Reload table in background
			getNotifications();
		},
		error: function (xhr) {
			console.error('AJAX Error:', xhr.status, xhr.responseJSON);
			FarmaApp.toast('Error al actualizar estado', 'error');
		}
	});
}

function resetForm() {
	currentNotificationId = null;
	currentNotifImageBase64 = '';

	$('#formNotification')[0].reset();
	$('#notification_error_message').addClass('d-none').text('');
	$('#notification_external_doctor').prop('checked', false);
	toggleExternalDoctor(false);

	// Reset image
	$('#notification_image').val('');
	$('#notifImagePreviewContainer').addClass('d-none');
	$('#notifImagePreview').attr('src', '');

	// Reset Select2
	$('#notification_assigned_to').val('').trigger('change');
	$('#notification_pharmacy_id').val('').trigger('change');

	// Pre-select pharmacy if filtered
	var objConfig = window.FarmaConfig || {};
	if (objConfig.selectedPharmacyId) {
		$('#notification_pharmacy_id').val(objConfig.selectedPharmacyId).trigger('change');
	}
}


// ============================================
// Init
// ============================================

$(document).ready(function () {
	_componentModalCallbacks();
	loadNotificationTypes();
	loadDoctors();
	loadPharmacies();
	getNotifications();
	
	// Check if coming from prescription page
	checkPrescriptionNotification();
	
	// Check for pharmacy_id in URL (from map popup link)
	checkPharmacyFilter();
});

/**
 * Check if URL has pharmacy_id param to filter notifications (from map popup)
 */
function checkPharmacyFilter() {
	var urlParams = new URLSearchParams(window.location.search);
	var nPharmacyId = urlParams.get('pharmacy_id');
	
	if (!nPharmacyId) return;
	
	// Wait for data to load, then filter table
	setTimeout(function() {
		if (tableVar && notificationsData.length > 0) {
			// Find pharmacy name for showing in info message
			var pharmacy = pharmaciesData.find(function(p) { 
				return p.id == nPharmacyId; 
			});
			var strPharmName = pharmacy ? pharmacy.name : 'Farmacia ID ' + nPharmacyId;
			
			// Filter data by pharmacy_id
			var aFiltered = notificationsData.filter(function(n) {
				return n.pharmacy_id == nPharmacyId;
			});
			
			// Show info message
			FarmaApp.toast('Mostrando ' + aFiltered.length + ' notificaciones de ' + strPharmName, 'info');
			
			// Re-render table with filtered data
			tableVar.clear().rows.add(aFiltered).draw();
			
			// Clean URL without reloading page
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, 800);
}

/**
 * Check if we need to create a notification from a prescription
 */
function checkPrescriptionNotification() {
	var urlParams = new URLSearchParams(window.location.search);
	var prescriptionId = urlParams.get('from_prescription');
	
	if (!prescriptionId) return;
	
	// Get stored prescription data
	var prescriptionData = sessionStorage.getItem('prescriptionForNotification');
	if (!prescriptionData) return;
	
	try {
		var prescription = JSON.parse(prescriptionData);
		sessionStorage.removeItem('prescriptionForNotification');
		
		// Wait for page to be ready, then open modal with data
		setTimeout(function() {
			createNotificationFromPrescription(prescription);
		}, 500);
	} catch (e) {
		console.error('Error parsing prescription data', e);
	}
}

/**
 * Create notification prefilled with prescription data
 */
function createNotificationFromPrescription(prescription) {
	resetForm();
	$('#modalNotificationTitle').text('Notificación sobre Receta');
	
	// Pre-fill with prescription data
	$('#notification_patient_cip').val(prescription.patient_cip || '');
	$('#notification_title').val('Consulta sobre receta: ' + (prescription.medication || ''));
	$('#notification_message').val('Consulta referente a la receta del paciente con CIP: ' + 
		(prescription.patient_cip || '') + '\nMedicamento: ' + (prescription.medication || ''));
	
	// Pre-select pharmacy if filtered
	var objConfig = window.FarmaConfig || {};
	if (objConfig.selectedPharmacyId) {
		$('#notification_pharmacy_id').val(objConfig.selectedPharmacyId).trigger('change');
	}
	
	// Try to pre-select "Consulta de Receta" type if exists
	setTimeout(function() {
		var $typeSelect = $('#notification_type_id');
		$typeSelect.find('option').each(function() {
			var text = $(this).text().toLowerCase();
			if (text.includes('receta') || text.includes('consulta')) {
				$typeSelect.val($(this).val()).trigger('change');
				return false;
			}
		});
	}, 200);

	var $modalEl = document.getElementById('modalNotification');
	$modalEl.dataset.action = 'CREATE';
	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

