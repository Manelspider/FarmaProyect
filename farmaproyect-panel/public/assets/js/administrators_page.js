/**
 * Administrators Page - FarmaProject
 */

var administratorsData = [];
var tableVar = null;
var currentAdministratorId = null;

function getAdministrators() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nRoleId = objConfig.roleId || 1;

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
				FarmaApp.toast('Error al cargar administradores', 'error');
				return false;
			}

			administratorsData = objResponse.data || [];
			renderTable(administratorsData);
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
	var $domDatatable = $('#administratorsTable');

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

				strShowLink = '<a href="#" onclick="showAdministrator(event, ' + objRow.id + ')" class="dropdown-item">';
				strShowLink += '    <i class="ti ti-eye me-2"></i> Ver detalle';
				strShowLink += '</a>';

				strEditLink = '<a href="#" onclick="editAdministrator(event, ' + objRow.id + ')" class="dropdown-item">';
				strEditLink += '    <i class="ti ti-edit me-2"></i> Editar';
				strEditLink += '</a>';

				strDeleteLink = '<a href="#" onclick="deleteAdministrator(event, ' + objRow.id + ', \'' + (objRow.full_name || objRow.email).replace(/'/g, "\\'") + '\')" class="dropdown-item text-danger">';
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

	var $modalAdministrator = document.getElementById('modalAdministrator');
	if ($modalAdministrator) {
		$modalAdministrator.addEventListener('hidden.bs.modal', function(e) {
			resetForm();
		});
	}

	var $formAdministrator = document.getElementById('formAdministrator');
	if ($formAdministrator) {
		$formAdministrator.addEventListener('submit', function(e) {
			e.preventDefault();
			submitAdministrator();
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

function createAdministrator() {
	resetForm();
	$('#modalAdministratorTitle').text('Nuevo Administrador');
	$('#pwd_required').removeClass('d-none');
	var $modalEl = document.getElementById('modalAdministrator');
	$modalEl.dataset.action = 'CREATE';
	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function showAdministrator(e, nId) {
	e.preventDefault();

	var objAdministrator = administratorsData.find(function(p) { return p.id === nId; });
	if (!objAdministrator) {
		FarmaApp.toast('Administrador no encontrado', 'error');
		return false;
	}

	$('#show_email').text(objAdministrator.email || '-');
	$('#show_full_name').text(objAdministrator.full_name || '-');
	$('#show_phone').text(objAdministrator.phone || '-');
	$('#show_city').text(objAdministrator.city || '-');
	$('#show_address').text(objAdministrator.address || '-');
	
	var strLastLogin = 'Nunca';
	if (objAdministrator.last_login) {
		var dtDate = new Date(objAdministrator.last_login);
		strLastLogin = dtDate.toLocaleDateString('es-ES') + ' ' + dtDate.toLocaleTimeString('es-ES');
	}
	$('#show_last_login').text(strLastLogin);

	$('#modalShowTitle').text(objAdministrator.full_name || objAdministrator.email);

	var $modal = new bootstrap.Modal(document.getElementById('modalShowAdministrator'));
	$modal.show();
}

function editAdministrator(e, nId) {
	e.preventDefault();

	var objAdministrator = administratorsData.find(function(p) { return p.id === nId; });
	if (!objAdministrator) {
		FarmaApp.toast('Administrador no encontrado', 'error');
		return false;
	}

	currentAdministratorId = nId;

	$('#modalAdministratorTitle').text('Editar Administrador');
	$('#pwd_required').addClass('d-none');
	$('#administrator_email').val(objAdministrator.email || '');
	$('#administrator_first_name').val(objAdministrator.first_name || '');
	$('#administrator_last_name').val(objAdministrator.last_name || '');
	$('#administrator_phone').val(objAdministrator.phone || '');
	$('#administrator_city').val(objAdministrator.city || '');
	$('#administrator_address').val(objAdministrator.address || '');
	$('#administrator_password').val('');

	var $modalEl = document.getElementById('modalAdministrator');
	$modalEl.dataset.action = 'EDIT';
	$modalEl.dataset.administratorId = nId;

	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function deleteAdministrator(e, nId, strName) {
	e.preventDefault();

	currentAdministratorId = nId;
	$('#delete_administrator_name').text(strName);

	var $modal = new bootstrap.Modal(document.getElementById('modalDeleteAdministrator'));
	$modal.show();
}

function confirmDelete() {
	if (!currentAdministratorId) return false;

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'DELETE',
		url: strApiBase + '/users/' + currentAdministratorId + '/delete',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function(objResponse) {
			var $modal = bootstrap.Modal.getInstance(document.getElementById('modalDeleteAdministrator'));
			if ($modal) $modal.hide();

			if (objResponse.success) {
				FarmaApp.toast('Administrador eliminado correctamente', 'success');
				getAdministrators();
			} else {
				FarmaApp.toast(objResponse.message || 'Error al eliminar', 'error');
			}
		},
		error: function(xhr) {
			FarmaApp.toast('Error del servidor', 'error');
		}
	});
}

function submitAdministrator() {
	var $modalEl = document.getElementById('modalAdministrator'),
		strAction = $modalEl.dataset.action || 'CREATE',
		$errorBox = $('#administrator_error_message');

	$errorBox.addClass('d-none').html('');

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nRoleId = objConfig.roleId || 1;

	var objData = {
		email: $('#administrator_email').val(),
		first_name: $('#administrator_first_name').val(),
		last_name: $('#administrator_last_name').val(),
		phone: $('#administrator_phone').val(),
		city: $('#administrator_city').val(),
		address: $('#administrator_address').val(),
		role_id: nRoleId
	};

	var strPassword = $('#administrator_password').val();
	if (strAction === 'CREATE' || strPassword) {
		objData.password = strPassword;
	}

	var strMethod = 'POST',
		strUrl = strApiBase + '/users/create';

	if (strAction === 'EDIT' && currentAdministratorId) {
		strMethod = 'PUT';
		strUrl = strApiBase + '/users/' + currentAdministratorId + '/update';
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
					strAction === 'EDIT' ? 'Administrador actualizado' : 'Administrador creado',
					'success'
				);
				getAdministrators();
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
	currentAdministratorId = null;

	$('#formAdministrator')[0].reset();
	$('#administrator_error_message').addClass('d-none').html('');
	$('#modalAdministratorTitle').text('Nuevo Administrador');

	var $modalEl = document.getElementById('modalAdministrator');
	$modalEl.dataset.action = 'CREATE';
	$modalEl.dataset.administratorId = '';
}


// ============================================
// Init
// ============================================

(function () {
	$("#menu_administrators").addClass("active");
})();

$(document).ready(function () {

	_componentModalCallbacks();
	getAdministrators();

});
