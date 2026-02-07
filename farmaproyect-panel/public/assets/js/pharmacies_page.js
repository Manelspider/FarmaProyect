/**
 * Pharmacies Page - FarmaProject
 */

var pharmaciesData = [];
var tableVar = null;
var mapFormInstance = null;
var mapShowInstance = null;
var formMarker = null;
var showMarker = null;
var currentPharmacyId = null;

function getPharmacies() {
	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '',
		nSelectedPharmacyId = objConfig.selectedPharmacyId,
		bIsFiltered = objConfig.isFiltered;

	console.log('FarmaConfig:', objConfig);
	console.log('API URL:', strApiBase + '/pharmacies');
	console.log('Token:', strToken ? 'Token exists (length: ' + strToken.length + ')' : 'NO TOKEN');

	if (!strApiBase || !strToken) {
		console.error('Missing apiBase or token in FarmaConfig');
		FarmaApp.toast('Error de configuración', 'error');
		return false;
	}

	$.ajax({
		type: 'GET',
		url: strApiBase + '/pharmacies',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function (objResponse) {
			if (!objResponse.success) {
				FarmaApp.toast('Error al cargar farmacias', 'error');
				return false;
			}

			pharmaciesData = objResponse.data || [];

			// Filter if pharmacy selected
			var aDataToShow = pharmaciesData;
			if (bIsFiltered && nSelectedPharmacyId) {
				aDataToShow = pharmaciesData.filter(function(p) {
					return p.id === nSelectedPharmacyId;
				});
			}

			renderTable(aDataToShow);
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
	var $domDatatable = $('#pharmaciesTable'),
		bIsAdmin = window.FarmaConfig?.isAdmin || false;

	if (tableVar) {
		tableVar.destroy();
		tableVar = null;
	}

	var aStatusBadges = {
		'active': function(strText) { return '<span class="badge bg-success"><b>' + strText + '</b></span>'; },
		'inactive': function(strText) { return '<span class="badge bg-secondary"><b>' + strText + '</b></span>'; },
		'default': function(strText) { return '<span class="badge bg-info"><b>' + strText + '</b></span>'; }
	};

	var aDatatableColumns = [
		{ 
			data: 'code',
			render: function(objData, strType, objRow, objMeta) {
				return '<span class="fw-semibold">' + objData + '</span>';
			}
		},
		{ data: 'name' },
		{ data: 'address' },
		{ data: 'city' },
		{ 
			data: 'phone',
			render: function(objData, strType, objRow, objMeta) {
				return objData || '<span class="text-muted">-</span>';
			}
		},
		{
			data: null,
			render: function(objData, strType, objRow, objMeta) {
				var strStatusCode = objRow.status?.code || 'active',
					strStatusName = objRow.status?.name || 'Activo';

				if (typeof aStatusBadges[strStatusCode] !== 'undefined') {
					return aStatusBadges[strStatusCode](strStatusName);
				}
				return aStatusBadges['default'](strStatusName);
			}
		},
		{
			data: null,
			render: function(objData, strType, objRow, objMeta) {
				var strShowLink = '',
					strEditLink = '',
					strDeleteLink = '';

				// Show - always visible
				strShowLink = '<a href="#" onclick="showPharmacy(event, ' + objRow.id + ')" class="dropdown-item">';
				strShowLink += '    <i class="ti ti-eye me-2"></i> Ver detalle';
				strShowLink += '</a>';

				// Edit - only admin
				if (bIsAdmin) {
					strEditLink = '<a href="#" onclick="editPharmacy(event, ' + objRow.id + ')" class="dropdown-item">';
					strEditLink += '    <i class="ti ti-edit me-2"></i> Editar';
					strEditLink += '</a>';

					strDeleteLink = '<a href="#" onclick="deletePharmacy(event, ' + objRow.id + ', \'' + objRow.name.replace(/'/g, "\\'") + '\')" class="dropdown-item text-danger">';
					strDeleteLink += '    <i class="ti ti-trash me-2"></i> Eliminar';
					strDeleteLink += '</a>';
				}

				var strHTML = '';
				strHTML += '<div class="d-flex justify-content-center">';
				strHTML += '    <div class="dropdown">';
				strHTML += '        <a href="#" class="text-body" data-bs-toggle="dropdown">';
				strHTML += '            <i class="ti ti-dots-vertical"></i>';
				strHTML += '        </a>';
				strHTML += '        <div class="dropdown-menu dropdown-menu-end">';
				strHTML += '            ' + strShowLink;
				strHTML += '            ' + strEditLink;
				if (bIsAdmin) {
					strHTML += '            <div class="dropdown-divider"></div>';
					strHTML += '            ' + strDeleteLink;
				}
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
		order: [[0, 'asc']],
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

	// Create/Edit Modal - onShown
	var $modalPharmacy = document.getElementById('modalPharmacy');
	if ($modalPharmacy) {
		$modalPharmacy.addEventListener('shown.bs.modal', function(e) {
			initFormMap();
		});

		$modalPharmacy.addEventListener('hidden.bs.modal', function(e) {
			resetForm();
		});
	}

	// Show Modal - onShown
	var $modalShowPharmacy = document.getElementById('modalShowPharmacy');
	if ($modalShowPharmacy) {
		$modalShowPharmacy.addEventListener('shown.bs.modal', function(e) {
			if (mapShowInstance) {
				mapShowInstance.invalidateSize();
			}
		});

		$modalShowPharmacy.addEventListener('hidden.bs.modal', function(e) {
			if (mapShowInstance) {
				mapShowInstance.remove();
				mapShowInstance = null;
			}
		});
	}

	// Form submit
	var $formPharmacy = document.getElementById('formPharmacy');
	if ($formPharmacy) {
		$formPharmacy.addEventListener('submit', function(e) {
			e.preventDefault();
			submitPharmacy();
		});
	}

	// Delete confirm
	var $btnConfirmDelete = document.getElementById('btnConfirmDelete');
	if ($btnConfirmDelete) {
		$btnConfirmDelete.addEventListener('click', function(e) {
			confirmDelete();
		});
	}
};


// ============================================
// Map Functions
// ============================================

function initFormMap() {
	var $mapEl = document.getElementById('mapFormPharmacy');
	if (!$mapEl || typeof L === 'undefined') return false;

	// Destroy existing map
	if (mapFormInstance) {
		mapFormInstance.remove();
		mapFormInstance = null;
	}

	var nDefaultLat = parseFloat($('#pharmacy_lat').val()) || 28.4682025,
		nDefaultLng = parseFloat($('#pharmacy_lng').val()) || -16.2546063;

	mapFormInstance = L.map('mapFormPharmacy').setView([nDefaultLat, nDefaultLng], 13);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors'
	}).addTo(mapFormInstance);

	// Add marker if coords exist
	if ($('#pharmacy_lat').val() && $('#pharmacy_lng').val()) {
		formMarker = L.marker([nDefaultLat, nDefaultLng]).addTo(mapFormInstance);
	}

	// Click handler to set coords
	mapFormInstance.on('click', function(e) {
		var nLat = e.latlng.lat.toFixed(7),
			nLng = e.latlng.lng.toFixed(7);

		$('#pharmacy_lat').val(nLat);
		$('#pharmacy_lng').val(nLng);

		if (formMarker) {
			formMarker.setLatLng(e.latlng);
		} else {
			formMarker = L.marker(e.latlng).addTo(mapFormInstance);
		}
	});

	setTimeout(function() {
		mapFormInstance.invalidateSize();
	}, 100);
}

function initShowMap(nLat, nLng) {
	var $mapEl = document.getElementById('mapShowPharmacy');
	if (!$mapEl || typeof L === 'undefined') return false;

	if (mapShowInstance) {
		mapShowInstance.remove();
		mapShowInstance = null;
	}

	mapShowInstance = L.map('mapShowPharmacy').setView([nLat, nLng], 15);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors'
	}).addTo(mapShowInstance);

	var objIcon = L.divIcon({
		className: 'pharmacy-marker',
		html: '<div class="marker-pin"><i class="ti ti-building-store"></i></div>',
		iconSize: [40, 48],
		iconAnchor: [20, 48]
	});

	showMarker = L.marker([nLat, nLng], { icon: objIcon }).addTo(mapShowInstance);

	setTimeout(function() {
		mapShowInstance.invalidateSize();
	}, 100);
}


// ============================================
// CRUD Functions
// ============================================

function showPharmacy(e, nId) {
	e.preventDefault();

	var objPharmacy = pharmaciesData.find(function(p) { return p.id === nId; });
	if (!objPharmacy) {
		FarmaApp.toast('Farmacia no encontrada', 'error');
		return false;
	}

	$('#show_code').text(objPharmacy.code || '-');
	$('#show_name').text(objPharmacy.name || '-');
	$('#show_address').text(objPharmacy.address || '-');
	$('#show_city').text(objPharmacy.city || '-');
	$('#show_postal_code').text(objPharmacy.postal_code || '-');
	$('#show_phone').text(objPharmacy.phone || '-');
	$('#show_email').text(objPharmacy.email || '-');
	$('#show_coords').text(objPharmacy.latitude && objPharmacy.longitude 
		? objPharmacy.latitude + ', ' + objPharmacy.longitude 
		: 'No definidas');

	$('#modalShowTitle').text(objPharmacy.name);

	var $modal = new bootstrap.Modal(document.getElementById('modalShowPharmacy'));
	$modal.show();

	if (objPharmacy.latitude && objPharmacy.longitude) {
		setTimeout(function() {
			initShowMap(parseFloat(objPharmacy.latitude), parseFloat(objPharmacy.longitude));
		}, 300);
	}
}

function editPharmacy(e, nId) {
	e.preventDefault();

	var objPharmacy = pharmaciesData.find(function(p) { return p.id === nId; });
	if (!objPharmacy) {
		FarmaApp.toast('Farmacia no encontrada', 'error');
		return false;
	}

	currentPharmacyId = nId;

	$('#modalPharmacyTitle').text('Editar Farmacia');
	$('#pharmacy_code').val(objPharmacy.code || '');
	$('#pharmacy_name').val(objPharmacy.name || '');
	$('#pharmacy_address').val(objPharmacy.address || '');
	$('#pharmacy_city').val(objPharmacy.city || '');
	$('#pharmacy_postal_code').val(objPharmacy.postal_code || '');
	$('#pharmacy_phone').val(objPharmacy.phone || '');
	$('#pharmacy_email').val(objPharmacy.email || '');
	$('#pharmacy_lat').val(objPharmacy.latitude || '');
	$('#pharmacy_lng').val(objPharmacy.longitude || '');

	var $modalEl = document.getElementById('modalPharmacy');
	$modalEl.dataset.action = 'EDIT';
	$modalEl.dataset.pharmacyId = nId;

	var $modal = new bootstrap.Modal($modalEl);
	$modal.show();
}

function deletePharmacy(e, nId, strName) {
	e.preventDefault();

	currentPharmacyId = nId;
	$('#delete_pharmacy_name').text(strName);

	var $modal = new bootstrap.Modal(document.getElementById('modalDeletePharmacy'));
	$modal.show();
}

function confirmDelete() {
	if (!currentPharmacyId) return false;

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	$.ajax({
		type: 'DELETE',
		url: strApiBase + '/pharmacies/' + currentPharmacyId + '/delete',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + strToken
		},
		success: function(objResponse) {
			var $modal = bootstrap.Modal.getInstance(document.getElementById('modalDeletePharmacy'));
			if ($modal) $modal.hide();

			if (objResponse.success) {
				FarmaApp.toast('Farmacia eliminada correctamente', 'success');
				getPharmacies();
			} else {
				FarmaApp.toast(objResponse.message || 'Error al eliminar', 'error');
			}
		},
		error: function(xhr) {
			FarmaApp.toast('Error del servidor', 'error');
		}
	});
}

function submitPharmacy() {
	var $modalEl = document.getElementById('modalPharmacy'),
		strAction = $modalEl.dataset.action || 'CREATE',
		$errorBox = $('#pharmacy_error_message');

	$errorBox.addClass('d-none').html('');

	var objConfig = window.FarmaConfig || {},
		strApiBase = objConfig.apiBase || '',
		strToken = objConfig.token || '';

	var objData = {
		code: $('#pharmacy_code').val(),
		name: $('#pharmacy_name').val(),
		address: $('#pharmacy_address').val(),
		city: $('#pharmacy_city').val(),
		postal_code: $('#pharmacy_postal_code').val(),
		phone: $('#pharmacy_phone').val(),
		email: $('#pharmacy_email').val(),
		latitude: $('#pharmacy_lat').val(),
		longitude: $('#pharmacy_lng').val()
	};

	var strMethod = 'POST',
		strUrl = strApiBase + '/pharmacies/create';

	if (strAction === 'EDIT' && currentPharmacyId) {
		strMethod = 'PUT';
		strUrl = strApiBase + '/pharmacies/' + currentPharmacyId + '/update';
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
					strAction === 'EDIT' ? 'Farmacia actualizada' : 'Farmacia creada',
					'success'
				);
				getPharmacies();
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
	currentPharmacyId = null;

	$('#formPharmacy')[0].reset();
	$('#pharmacy_lat').val('');
	$('#pharmacy_lng').val('');
	$('#pharmacy_error_message').addClass('d-none').html('');
	$('#modalPharmacyTitle').text('Nueva Farmacia');

	var $modalEl = document.getElementById('modalPharmacy');
	$modalEl.dataset.action = 'CREATE';
	$modalEl.dataset.pharmacyId = '';

	if (mapFormInstance) {
		mapFormInstance.remove();
		mapFormInstance = null;
	}
	formMarker = null;
}


// ============================================
// Init
// ============================================

(function () {
	$("#menu_pharmacies").addClass("active");
})();

$(document).ready(function () {

	_componentModalCallbacks();
	getPharmacies();

});
