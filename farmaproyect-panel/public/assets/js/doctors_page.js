/**
 * Doctors Page - FarmaProject
 */

var doctorsData = [];
var tableVar = null;
var currentDoctorId = null;

function getDoctors() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nRoleId = objConfig.roleId || 2;

	if (!strApiBase || !strToken) {
		console.error('Missing apiBase or token in FarmaConfig');
		FarmaApp.toast('Error de configuración', 'error');
		return false;
	}

	$.ajax({
		type: 'GET',
		url: strApiBase + '/users?role_id=' + nRoleId,
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast('Error al cargar médicos', 'error');
				return false;
			}

			doctorsData = objResponse.data || [];
			renderTable(doctorsData);
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

function renderTable(aData) {
	var $domDatatable = $('#doctorsTable');

	if (tableVar) {
		tableVar.destroy();
		tableVar = null;
	}

	var aDatatableColumns = [
		{ 
			data: 'email',
			render: function(objData, strType, objRow, objMeta) {
				return '<span class="fw-semibold">' + objData + '</span>';
			}
		},
		{ 
			data: 'full_name',
			render: function(objData, strType, objRow, objMeta) {
				return objData || '<span class="text-muted">-</span>';
			}
		},
		{ 
			data: 'phone',
			render: function(objData, strType, objRow, objMeta) {
				return objData || '<span class="text-muted">-</span>';
			}
		},
		{ 
			data: 'city',
			render: function(objData, strType, objRow, objMeta) {
				return objData || '<span class="text-muted">-</span>';
			}
		},
		{
			data: 'last_login',
			render: function(objData, strType, objRow, objMeta) {
				if (!objData) return '<span class="text-muted">Nunca</span>';
				var dtDate = new Date(objData);
				return dtDate.toLocaleDateString('es-ES') + ' ' + dtDate.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});
			}
		},
		{
			data: null,
			render: function(objData, strType, objRow, objMeta) {
				var strShowLink = '',
					strEditLink = '',
					strDeleteLink = '';

				strShowLink = '<a href="#" onclick="showDoctor(event, ' + objRow.id + ')" class="dropdown-item">';
				strShowLink += '    <i class="ti ti-eye me-2"></i> Ver detalle';
				strShowLink += '</a>';

				strEditLink = '<a href="#" onclick="editDoctor(event, ' + objRow.id + ')" class="dropdown-item">';
				strEditLink += '    <i class="ti ti-edit me-2"></i> Editar';
				strEditLink += '</a>';

				strDeleteLink = '<a href="#" onclick="deleteDoctor(event, ' + objRow.id + ', \'' + (objRow.full_name || objRow.email).replace(/'/g, "\\'") + '\')" class="dropdown-item text-danger">';
				strDeleteLink += '    <i class="ti ti-trash me-2"></i> Eliminar';
				strDeleteLink += '</a>';

				var strHTML = '';
				strHTML += '<div class="d-flex justify-content-center">';
				strHTML += '    <div class="dropdown">';
				strHTML += '        <a href="#" class="text-body" data-bs-toggle="dropdown">';
				strHTML += '            <i class="ti ti-dots-vertical"></i>';
				strHTML += '        </a>';
				strHTML += '        <div class="dropdown-menu dropdown-menu-end">';
				strHTML += '            ' + strShowLink;
				strHTML += '            ' + strEditLink;
				strHTML += '            <div class="dropdown-divider"></div>';
				strHTML += '            ' + strDeleteLink;
				strHTML += '        </div>';
				strHTML += '    </div>';
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
		order: [[1, 'asc']],
		columnDefs: [
			{ "width": "1%", "targets": -1, "orderable": false },
			{ "width": "auto", "targets": "_all" }
		]
	});
}


// ============================================
// Modal Callbacks
// ============================================

var _componentModalCallbacks = function() {

	var $modalDoctor = document.getElementById('modalDoctor');
	if ($modalDoctor) {
		$modalDoctor.addEventListener('hidden.bs.modal', function(e) {
			resetForm();
		});
	}

	var $formDoctor = document.getElementById('formDoctor');
	if ($formDoctor) {
		$formDoctor.addEventListener('submit', function(e) {
			e.preventDefault();
			submitDoctor();
		});
	}

	var $btnConfirmDelete = document.getElementById('btnConfirmDelete');
	if ($btnConfirmDelete) {
		$btnConfirmDelete.addEventListener('click', function(e) {
			confirmDelete();
		});
	}
};


// ============================================
// CRUD Functions
// ============================================

function createDoctor() {
	resetForm();
	$('#modalDoctorTitle').text('Nuevo Médico');
	$('#pwd_required').removeClass('d-none');
	var $modalEl = document.getElementById('modalDoctor');
	$modalEl.dataset.action = 'CREATE';
	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function showDoctor(e, nId) {
	e.preventDefault();

	var objDoctor = doctorsData.find(function(p) { return p.id === nId; });
	if (!objDoctor) {
		FarmaApp.toast('Médico no encontrado', 'error');
		return false;
	}

	$('#show_email').text(objDoctor.email || '-');
	$('#show_full_name').text(objDoctor.full_name || '-');
	$('#show_phone').text(objDoctor.phone || '-');
	$('#show_city').text(objDoctor.city || '-');
	$('#show_address').text(objDoctor.address || '-');
	
	var strLastLogin = 'Nunca';
	if (objDoctor.last_login) {
		var dtDate = new Date(objDoctor.last_login);
		strLastLogin = dtDate.toLocaleDateString('es-ES') + ' ' + dtDate.toLocaleTimeString('es-ES');
	}
	$('#show_last_login').text(strLastLogin);

	$('#modalShowTitle').text(objDoctor.full_name || objDoctor.email);

	var $modal = new bootstrap.Modal(document.getElementById('modalShowDoctor'));
	$modal.show();
}

function editDoctor(e, nId) {
	e.preventDefault();

	var objDoctor = doctorsData.find(function(p) { return p.id === nId; });
	if (!objDoctor) {
		FarmaApp.toast('Médico no encontrado', 'error');
		return false;
	}

	currentDoctorId = nId;

	$('#modalDoctorTitle').text('Editar Médico');
	$('#pwd_required').addClass('d-none');
	$('#doctor_email').val(objDoctor.email || '');
	$('#doctor_first_name').val(objDoctor.first_name || '');
	$('#doctor_last_name').val(objDoctor.last_name || '');
	$('#doctor_phone').val(objDoctor.phone || '');
	$('#doctor_city').val(objDoctor.city || '');
	$('#doctor_address').val(objDoctor.address || '');
	$('#doctor_password').val('');

	var $modalEl = document.getElementById('modalDoctor');
	$modalEl.dataset.action = 'EDIT';
	$modalEl.dataset.doctorId = nId;

	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function deleteDoctor(e, nId, strName) {
	e.preventDefault();

	currentDoctorId = nId;
	$('#delete_doctor_name').text(strName);

	var $modal = new bootstrap.Modal(document.getElementById('modalDeleteDoctor'));
	$modal.show();
}

function confirmDelete() {
	if (!currentDoctorId) return false;

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'DELETE',
		url: strApiBase + '/users/' + currentDoctorId + '/delete',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function(objResponse) {
			var $modal = bootstrap.Modal.getInstance(document.getElementById('modalDeleteDoctor'));
			if ($modal) $modal.hide();

			if (objResponse.success) {
				FarmaApp.toast('Médico eliminado correctamente', 'success');
				getDoctors();
			} else {
				FarmaApp.toast(objResponse.message || 'Error al eliminar', 'error');
			}
		},
		error: function(xhr) {
			FarmaApp.toast('Error del servidor', 'error');
		}
	});
}

function submitDoctor() {
	var $modalEl = document.getElementById('modalDoctor'),
		strAction = $modalEl.dataset.action || 'CREATE',
		$errorBox = $('#doctor_error_message');

	$errorBox.addClass('d-none').html('');

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nRoleId = objConfig.roleId || 2;

	var objData = {
		email: $('#doctor_email').val(),
		first_name: $('#doctor_first_name').val(),
		last_name: $('#doctor_last_name').val(),
		phone: $('#doctor_phone').val(),
		city: $('#doctor_city').val(),
		address: $('#doctor_address').val(),
		role_id: nRoleId
	};

	var strPassword = $('#doctor_password').val();
	if (strAction === 'CREATE' || strPassword) {
		objData.password = strPassword;
	}

	var strMethod = 'POST',
		strUrl = strApiBase + '/users/create';

	if (strAction === 'EDIT' && currentDoctorId) {
		strMethod = 'PUT';
		strUrl = strApiBase + '/users/' + currentDoctorId + '/update';
	}

	$.ajax({
		type: strMethod,
		url: strUrl,
		dataType: 'json',
		contentType: 'application/json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		data: JSON.stringify(objData),
		success: function(objResponse) {
			if (objResponse.success) {
				var $modal = bootstrap.Modal.getInstance($modalEl);
				if ($modal) $modal.hide();

				FarmaApp.toast(
					strAction === 'EDIT' ? 'Médico actualizado' : 'Médico creado',
					'success'
				);
				getDoctors();
			} else {
				$errorBox.html(objResponse.message || 'Error al guardar').removeClass('d-none');
			}
		},
		error: function(xhr) {
			var strMsg = 'Error del servidor';
			if (xhr.responseJSON && xhr.responseJSON.message) {
				strMsg = xhr.responseJSON.message;
			}
			$errorBox.html(strMsg).removeClass('d-none');
		}
	});
}

function resetForm() {
	currentDoctorId = null;

	$('#formDoctor')[0].reset();
	$('#doctor_error_message').addClass('d-none').html('');
	$('#modalDoctorTitle').text('Nuevo Médico');

	var $modalEl = document.getElementById('modalDoctor');
	$modalEl.dataset.action = 'CREATE';
	$modalEl.dataset.doctorId = '';
}


// ============================================
// Init
// ============================================

(function () {
	$("#menu_doctors").addClass("active");
})();

$(document).ready(function () {

	_componentModalCallbacks();
	getDoctors();

});
