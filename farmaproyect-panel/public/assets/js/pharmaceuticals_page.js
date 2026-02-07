/**
 * Pharmaceuticals Page - FarmaProject
 */

var pharmaceuticalsData = [];
var tableVar = null;
var currentPharmaceuticalId = null;

function getPharmaceuticals() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nRoleId = objConfig.roleId || 3;

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
				FarmaApp.toast('Error al cargar farmacéuticos', 'error');
				return false;
			}

			pharmaceuticalsData = objResponse.data || [];
			renderTable(pharmaceuticalsData);
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
	var $domDatatable = $('#pharmaceuticalsTable');

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

				strShowLink = '<a href="#" onclick="showPharmaceutical(event, ' + objRow.id + ')" class="dropdown-item">';
				strShowLink += '    <i class="ti ti-eye me-2"></i> Ver detalle';
				strShowLink += '</a>';

				strEditLink = '<a href="#" onclick="editPharmaceutical(event, ' + objRow.id + ')" class="dropdown-item">';
				strEditLink += '    <i class="ti ti-edit me-2"></i> Editar';
				strEditLink += '</a>';

				strDeleteLink = '<a href="#" onclick="deletePharmaceutical(event, ' + objRow.id + ', \'' + (objRow.full_name || objRow.email).replace(/'/g, "\\'") + '\')" class="dropdown-item text-danger">';
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

	var $modalPharmaceutical = document.getElementById('modalPharmaceutical');
	if ($modalPharmaceutical) {
		$modalPharmaceutical.addEventListener('hidden.bs.modal', function(e) {
			resetForm();
		});
	}

	var $formPharmaceutical = document.getElementById('formPharmaceutical');
	if ($formPharmaceutical) {
		$formPharmaceutical.addEventListener('submit', function(e) {
			e.preventDefault();
			submitPharmaceutical();
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

function createPharmaceutical() {
	resetForm();
	$('#modalPharmaceuticalTitle').text('Nuevo Farmacéutico');
	$('#pwd_required').removeClass('d-none');
	var $modalEl = document.getElementById('modalPharmaceutical');
	$modalEl.dataset.action = 'CREATE';
	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function showPharmaceutical(e, nId) {
	e.preventDefault();

	var objPharmaceutical = pharmaceuticalsData.find(function(p) { return p.id === nId; });
	if (!objPharmaceutical) {
		FarmaApp.toast('Farmacéutico no encontrado', 'error');
		return false;
	}

	$('#show_email').text(objPharmaceutical.email || '-');
	$('#show_full_name').text(objPharmaceutical.full_name || '-');
	$('#show_phone').text(objPharmaceutical.phone || '-');
	$('#show_city').text(objPharmaceutical.city || '-');
	$('#show_address').text(objPharmaceutical.address || '-');
	
	var strLastLogin = 'Nunca';
	if (objPharmaceutical.last_login) {
		var dtDate = new Date(objPharmaceutical.last_login);
		strLastLogin = dtDate.toLocaleDateString('es-ES') + ' ' + dtDate.toLocaleTimeString('es-ES');
	}
	$('#show_last_login').text(strLastLogin);

	$('#modalShowTitle').text(objPharmaceutical.full_name || objPharmaceutical.email);

	var $modal = new bootstrap.Modal(document.getElementById('modalShowPharmaceutical'));
	$modal.show();
}

function editPharmaceutical(e, nId) {
	e.preventDefault();

	var objPharmaceutical = pharmaceuticalsData.find(function(p) { return p.id === nId; });
	if (!objPharmaceutical) {
		FarmaApp.toast('Farmacéutico no encontrado', 'error');
		return false;
	}

	currentPharmaceuticalId = nId;

	$('#modalPharmaceuticalTitle').text('Editar Farmacéutico');
	$('#pwd_required').addClass('d-none');
	$('#pharmaceutical_email').val(objPharmaceutical.email || '');
	$('#pharmaceutical_first_name').val(objPharmaceutical.first_name || '');
	$('#pharmaceutical_last_name').val(objPharmaceutical.last_name || '');
	$('#pharmaceutical_phone').val(objPharmaceutical.phone || '');
	$('#pharmaceutical_city').val(objPharmaceutical.city || '');
	$('#pharmaceutical_address').val(objPharmaceutical.address || '');
	$('#pharmaceutical_password').val('');

	var $modalEl = document.getElementById('modalPharmaceutical');
	$modalEl.dataset.action = 'EDIT';
	$modalEl.dataset.pharmaceuticalId = nId;

	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function deletePharmaceutical(e, nId, strName) {
	e.preventDefault();

	currentPharmaceuticalId = nId;
	$('#delete_pharmaceutical_name').text(strName);

	var $modal = new bootstrap.Modal(document.getElementById('modalDeletePharmaceutical'));
	$modal.show();
}

function confirmDelete() {
	if (!currentPharmaceuticalId) return false;

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'DELETE',
		url: strApiBase + '/users/' + currentPharmaceuticalId + '/delete',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function(objResponse) {
			var $modal = bootstrap.Modal.getInstance(document.getElementById('modalDeletePharmaceutical'));
			if ($modal) $modal.hide();

			if (objResponse.success) {
				FarmaApp.toast('Farmacéutico eliminado correctamente', 'success');
				getPharmaceuticals();
			} else {
				FarmaApp.toast(objResponse.message || 'Error al eliminar', 'error');
			}
		},
		error: function(xhr) {
			FarmaApp.toast('Error del servidor', 'error');
		}
	});
}

function submitPharmaceutical() {
	var $modalEl = document.getElementById('modalPharmaceutical'),
		strAction = $modalEl.dataset.action || 'CREATE',
		$errorBox = $('#pharmaceutical_error_message');

	$errorBox.addClass('d-none').html('');

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nRoleId = objConfig.roleId || 3;

	var objData = {
		email: $('#pharmaceutical_email').val(),
		first_name: $('#pharmaceutical_first_name').val(),
		last_name: $('#pharmaceutical_last_name').val(),
		phone: $('#pharmaceutical_phone').val(),
		city: $('#pharmaceutical_city').val(),
		address: $('#pharmaceutical_address').val(),
		role_id: nRoleId
	};

	var strPassword = $('#pharmaceutical_password').val();
	if (strAction === 'CREATE' || strPassword) {
		objData.password = strPassword;
	}

	var strMethod = 'POST',
		strUrl = strApiBase + '/users/create';

	if (strAction === 'EDIT' && currentPharmaceuticalId) {
		strMethod = 'PUT';
		strUrl = strApiBase + '/users/' + currentPharmaceuticalId + '/update';
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
					strAction === 'EDIT' ? 'Farmacéutico actualizado' : 'Farmacéutico creado',
					'success'
				);
				getPharmaceuticals();
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
	currentPharmaceuticalId = null;

	$('#formPharmaceutical')[0].reset();
	$('#pharmaceutical_error_message').addClass('d-none').html('');
	$('#modalPharmaceuticalTitle').text('Nuevo Farmacéutico');

	var $modalEl = document.getElementById('modalPharmaceutical');
	$modalEl.dataset.action = 'CREATE';
	$modalEl.dataset.pharmaceuticalId = '';
}


// ============================================
// Init
// ============================================

(function () {
	$("#menu_pharmaceuticals").addClass("active");
})();

$(document).ready(function () {

	_componentModalCallbacks();
	getPharmaceuticals();

});
