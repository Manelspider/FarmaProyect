/**
 * FarmaProject - Prescriptions Page JavaScript
 * Handles prescriptions DataTable and CRUD operations
 */

let prescriptionsTable;
let currentPrescriptionId = null;
let currentImageBase64 = '';
let imageUploadPrescriptionId = null;

// Default prescription image (FarmaProject logo with document icon)
const DEFAULT_PRESCRIPTION_IMAGE = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect x="5" y="5" width="90" height="90" rx="18" ry="18" fill="#2d7a32"/><g transform="translate(50,50)"><rect x="-20" y="-28" width="40" height="56" rx="4" ry="4" fill="white"/><line x1="-12" y1="-16" x2="12" y2="-16" stroke="#2d7a32" stroke-width="3"/><line x1="-12" y1="-6" x2="12" y2="-6" stroke="#2d7a32" stroke-width="3"/><line x1="-12" y1="4" x2="8" y2="4" stroke="#2d7a32" stroke-width="3"/><line x1="-12" y1="14" x2="5" y2="14" stroke="#2d7a32" stroke-width="3"/></g></svg>');

$(document).ready(function() {
    initPrescriptionsTable();
    initPharmacySelect();
    initFormHandlers();
    initImageHandlers();
    
    // Set default issue date to today
    const today = new Date().toISOString().split('T')[0];
    $('#prescription_issue_date').val(today);
});

/**
 * Initialize DataTable for prescriptions
 */
function initPrescriptionsTable() {
    prescriptionsTable = $('#prescriptionsTable').DataTable({
        ajax: {
            url: `${FarmaConfig.apiBase}/prescriptions`,
            headers: {
                'Authorization': `Bearer ${FarmaConfig.token}`
            },
            dataSrc: function(response) {
                if (response.success) {
                    return response.data;
                }
                return [];
            },
            error: function(xhr) {
                console.error('Error loading prescriptions:', xhr);
                if (xhr.status === 401) {
                    window.location.href = 'login.php';
                }
            }
        },
        columns: [
            {
                data: 'image_base64',
                className: 'text-center',
                orderable: false,
                render: function(data, type, row) {
                    const src = data || DEFAULT_PRESCRIPTION_IMAGE;
                    return `<img src="${src}" 
                               class="img-thumbnail prescription-img-thumb" 
                               style="width: 100px; height: 100px; object-fit: cover; cursor: pointer;" 
                               onclick="openPrescriptionImageUpload(event, ${row.id})" 
                               onerror="this.src='${DEFAULT_PRESCRIPTION_IMAGE}';" 
                               title="Click para cambiar imagen" />`;
                }
            },
            { data: 'patient_cip' },
            { 
                data: 'medication',
                render: function(data) {
                    // Truncar si es muy largo
                    if (data && data.length > 40) {
                        return data.substring(0, 40) + '...';
                    }
                    return data || '-';
                }
            },
            { data: 'doctor_name' },
            { 
                data: 'pharmacy_name',
                render: function(data) {
                    return data || '<span class="text-muted">Sin asignar</span>';
                }
            },
            { 
                data: 'prescription_status',
                render: function(data, type, row) {
                    const statusClasses = {
                        'draft': 'bg-secondary',
                        'active': 'bg-primary',
                        'dispensed': 'bg-success',
                        'expired': 'bg-warning text-dark',
                        'cancelled': 'bg-danger'
                    };
                    const statusClass = statusClasses[data] || 'bg-secondary';
                    return `<span class="badge ${statusClass}">${row.prescription_status_display}</span>`;
                }
            },
            { 
                data: 'issue_date',
                render: function(data) {
                    if (!data) return '-';
                    return new Date(data).toLocaleDateString('es-ES');
                }
            },
            { 
                data: 'expiry_date',
                render: function(data) {
                    if (!data) return '<span class="text-muted">-</span>';
                    const expiryDate = new Date(data);
                    const today = new Date();
                    const isExpired = expiryDate < today;
                    const dateStr = expiryDate.toLocaleDateString('es-ES');
                    return isExpired 
                        ? `<span class="text-danger">${dateStr}</span>` 
                        : dateStr;
                }
            },
            { 
                data: null,
                className: 'text-center',
                orderable: false,
                render: function(data, type, row) {
                    let html = '<div class="btn-group btn-group-sm">';
                    
                    // View button - always visible
                    html += `<button class="btn btn-outline-info" onclick="showPrescription(${row.id})" title="Ver">
                        <i class="ti ti-eye"></i>
                    </button>`;
                    
                    // Edit button - only for doctors/admins
                    if (FarmaConfig.canEdit) {
                        html += `<button class="btn btn-outline-primary" onclick="editPrescription(${row.id})" title="Editar">
                            <i class="ti ti-edit"></i>
                        </button>`;
                    }
                    
                    // Send to pharmacy - only for doctors/admins and if not already assigned
                    if (FarmaConfig.canEdit && !row.pharmacy_id) {
                        html += `<button class="btn btn-outline-success" onclick="sendToPharmacy(${row.id})" title="Enviar a Farmacia">
                            <i class="ti ti-send"></i>
                        </button>`;
                    }
                    
                    // Dispense button - only for pharmacists and if active
                    if (FarmaConfig.canDispense && row.prescription_status === 'active') {
                        html += `<button class="btn btn-outline-success" onclick="quickDispense(${row.id})" title="Dispensar">
                            <i class="ti ti-check"></i>
                        </button>`;
                    }
                    
                    // Delete button - only for doctors/admins
                    if (FarmaConfig.canEdit) {
                        html += `<button class="btn btn-outline-danger" onclick="confirmDelete(${row.id}, '${escapeHtml(row.patient_cip + ' - ' + row.medication)}')" title="Eliminar">
                            <i class="ti ti-trash"></i>
                        </button>`;
                    }
                    
                    html += '</div>';
                    return html;
                }
            }
        ],
        order: [[7, 'desc']],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        responsive: true,
        pageLength: 25,
        columnDefs: [
            { "width": "220px", "targets": 0 }
        ]
    });
}

/**
 * Initialize Select2 for pharmacy selection
 */
function initPharmacySelect() {
    $('.select2-pharmacy').select2({
        theme: 'bootstrap-5',
        placeholder: 'Seleccionar farmacia...',
        allowClear: true,
        ajax: {
            url: `${FarmaConfig.apiBase}/pharmacies`,
            headers: {
                'Authorization': `Bearer ${FarmaConfig.token}`
            },
            dataType: 'json',
            delay: 250,
            data: function(params) {
                return {
                    search: params.term
                };
            },
            processResults: function(response) {
                if (response.success) {
                    return {
                        results: response.data.map(p => ({
                            id: p.id,
                            text: p.name
                        }))
                    };
                }
                return { results: [] };
            },
            cache: true
        },
        dropdownParent: $('.modal.show').length ? $('.modal.show') : $('body')
    });
}

/**
 * Initialize form handlers
 */
function initFormHandlers() {
    $('#formPrescription').on('submit', function(e) {
        e.preventDefault();
        savePrescription();
    });
    
    // Reinitialize Select2 when modal opens
    $('#modalPrescription').on('shown.bs.modal', function() {
        $('#prescription_pharmacy_id').select2({
            theme: 'bootstrap-5',
            placeholder: 'Seleccionar farmacia...',
            allowClear: true,
            ajax: {
                url: `${FarmaConfig.apiBase}/pharmacies`,
                headers: {
                    'Authorization': `Bearer ${FarmaConfig.token}`
                },
                dataType: 'json',
                delay: 250,
                processResults: function(response) {
                    if (response.success) {
                        return {
                            results: response.data.map(p => ({
                                id: p.id,
                                text: p.name
                            }))
                        };
                    }
                    return { results: [] };
                }
            },
            dropdownParent: $('#modalPrescription')
        });
    });
    
    $('#modalSendToPharmacy').on('shown.bs.modal', function() {
        $('#send_pharmacy_id').select2({
            theme: 'bootstrap-5',
            placeholder: 'Seleccionar farmacia...',
            allowClear: true,
            ajax: {
                url: `${FarmaConfig.apiBase}/pharmacies`,
                headers: {
                    'Authorization': `Bearer ${FarmaConfig.token}`
                },
                dataType: 'json',
                delay: 250,
                processResults: function(response) {
                    if (response.success) {
                        return {
                            results: response.data.map(p => ({
                                id: p.id,
                                text: p.name
                            }))
                        };
                    }
                    return { results: [] };
                }
            },
            dropdownParent: $('#modalSendToPharmacy')
        });
    });
}

/**
 * Initialize image upload handlers
 */

function initImageHandlers() {
    // Image file input change
    $('#prescription_image').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'La imagen no puede superar los 2MB', 'error');
                $(this).val('');
                return;
            }
            
            // Validate type
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error', 'Solo se permiten archivos de imagen', 'error');
                $(this).val('');
                return;
            }
            
            // Convert to base64
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImageBase64 = e.target.result;
                $('#imagePreview').attr('src', currentImageBase64);
                $('#imagePreviewContainer').removeClass('d-none');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Clear image button
    $('#btnClearImage').on('click', function() {
        $('#prescription_image').val('');
        currentImageBase64 = '';
        $('#imagePreviewContainer').addClass('d-none');
        $('#imagePreview').attr('src', '');
    });
}

/**
 * Open create prescription modal
 */
function createPrescription() {
    currentPrescriptionId = null;
    currentImageBase64 = '';
    $('#modalPrescription').attr('data-action', 'CREATE');
    $('#modalPrescriptionTitle').text('Nueva Receta');
    $('#formPrescription')[0].reset();
    $('#prescription_error_message').addClass('d-none');
    
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    $('#prescription_issue_date').val(today);
    $('#prescription_status').val('active');
    
    // Clear select2
    $('#prescription_pharmacy_id').val(null).trigger('change');
    
    // Clear image
    $('#prescription_image').val('');
    $('#imagePreviewContainer').addClass('d-none');
    $('#imagePreview').attr('src', '');
    
    $('#modalPrescription').modal('show');
}

/**
 * Edit prescription
 */
function editPrescription(id) {
    currentPrescriptionId = id;
    
    $.ajax({
        url: `${FarmaConfig.apiBase}/prescriptions/${id}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${FarmaConfig.token}`
        },
        success: function(response) {
            if (response.success) {
                const data = response.data;
                
                $('#modalPrescription').attr('data-action', 'EDIT');
                $('#modalPrescriptionTitle').text('Editar Receta');
                $('#prescription_error_message').addClass('d-none');
                
                $('#prescription_patient_cip').val(data.patient_cip);
                $('#prescription_medication').val(data.medication);
                $('#prescription_dosage').val(data.dosage);
                $('#prescription_status').val(data.prescription_status);
                $('#prescription_issue_date').val(data.issue_date || '');
                $('#prescription_expiry_date').val(data.expiry_date || '');
                $('#prescription_instructions').val(data.instructions);
                $('#prescription_notes').val(data.notes);
                
                // Set pharmacy select
                if (data.pharmacy_id) {
                    const option = new Option(data.pharmacy_name, data.pharmacy_id, true, true);
                    $('#prescription_pharmacy_id').append(option).trigger('change');
                } else {
                    $('#prescription_pharmacy_id').val(null).trigger('change');
                }
                
                // Set image if exists
                if (data.image_base64) {
                    currentImageBase64 = data.image_base64;
                    $('#imagePreview').attr('src', data.image_base64);
                    $('#imagePreviewContainer').removeClass('d-none');
                } else {
                    currentImageBase64 = '';
                    $('#prescription_image').val('');
                    $('#imagePreviewContainer').addClass('d-none');
                }
                
                $('#modalPrescription').modal('show');
            } else {
                Swal.fire('Error', response.message || 'Error al cargar la receta', 'error');
            }
        },
        error: function(xhr) {
            Swal.fire('Error', 'Error al cargar la receta', 'error');
        }
    });
}

/**
 * Save prescription (create or update)
 */
function savePrescription() {
    const action = $('#modalPrescription').attr('data-action');
    const isEdit = action === 'EDIT';
    
    const data = {
        patient_cip: $('#prescription_patient_cip').val().trim(),
        medication: $('#prescription_medication').val().trim(),
        dosage: $('#prescription_dosage').val().trim(),
        prescription_status: $('#prescription_status').val(),
        issue_date: $('#prescription_issue_date').val(),
        expiry_date: $('#prescription_expiry_date').val() || null,
        instructions: $('#prescription_instructions').val().trim(),
        notes: $('#prescription_notes').val().trim(),
        pharmacy_id: $('#prescription_pharmacy_id').val() || null,
        image_base64: currentImageBase64 || null
    };
    
    // Validate required fields
    if (!data.patient_cip || !data.medication || !data.issue_date) {
        $('#prescription_error_message').text('Por favor completa todos los campos requeridos').removeClass('d-none');
        return;
    }
    
    const url = isEdit 
        ? `${FarmaConfig.apiBase}/prescriptions/${currentPrescriptionId}/update`
        : `${FarmaConfig.apiBase}/prescriptions/create`;
    
    $.ajax({
        url: url,
        method: isEdit ? 'PUT' : 'POST',
        headers: {
            'Authorization': `Bearer ${FarmaConfig.token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data),
        success: function(response) {
            if (response.success) {
                $('#modalPrescription').modal('hide');
                prescriptionsTable.ajax.reload();
                Swal.fire({
                    icon: 'success',
                    title: isEdit ? 'Receta actualizada' : 'Receta creada',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                $('#prescription_error_message').text(response.message || 'Error al guardar').removeClass('d-none');
            }
        },
        error: function(xhr) {
            const message = xhr.responseJSON?.message || 'Error al guardar la receta';
            $('#prescription_error_message').text(message).removeClass('d-none');
        }
    });
}

/**
 * Show prescription details
 */
function showPrescription(id) {
    currentPrescriptionId = id;
    
    $.ajax({
        url: `${FarmaConfig.apiBase}/prescriptions/${id}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${FarmaConfig.token}`
        },
        success: function(response) {
            if (response.success) {
                const data = response.data;
                
                $('#show_patient_cip').text(data.patient_cip);
                $('#show_medication').text(data.medication);
                $('#show_dosage').text(data.dosage || '-');
                $('#show_instructions').text(data.instructions || '-');
                $('#show_doctor').text(data.doctor_name);
                $('#show_pharmacy').text(data.pharmacy_name || 'Sin asignar');
                $('#show_issue_date').text(data.issue_date ? new Date(data.issue_date).toLocaleDateString('es-ES') : '-');
                $('#show_expiry_date').text(data.expiry_date ? new Date(data.expiry_date).toLocaleDateString('es-ES') : '-');
                $('#show_notes').text(data.notes || '-');
                
                // Image - always show, use default if no image
                const imageSrc = data.image_base64 || DEFAULT_PRESCRIPTION_IMAGE;
                $('#show_image').attr('src', imageSrc);
                
                // Status badge
                const statusClasses = {
                    'draft': 'bg-secondary',
                    'active': 'bg-primary',
                    'dispensed': 'bg-success',
                    'expired': 'bg-warning text-dark',
                    'cancelled': 'bg-danger'
                };
                const statusClass = statusClasses[data.prescription_status] || 'bg-secondary';
                $('#show_prescription_status').html(`<span class="badge ${statusClass}">${data.prescription_status_display}</span>`);
                
                // Dispensed info
                if (data.dispensed_by_name) {
                    $('#show_dispensed_container, #show_dispensed_at_container').removeClass('d-none');
                    $('#show_dispensed_by').text(data.dispensed_by_name);
                    $('#show_dispensed_at').text(data.dispensed_at ? new Date(data.dispensed_at).toLocaleString('es-ES') : '-');
                } else {
                    $('#show_dispensed_container, #show_dispensed_at_container').addClass('d-none');
                }
                
                // Show/hide dispense button based on status
                if (data.prescription_status === 'active' && FarmaConfig.canDispense) {
                    $('#btnDispense').show();
                } else {
                    $('#btnDispense').hide();
                }
                
                $('#modalShowPrescription').modal('show');
            } else {
                Swal.fire('Error', response.message || 'Error al cargar la receta', 'error');
            }
        },
        error: function(xhr) {
            Swal.fire('Error', 'Error al cargar la receta', 'error');
        }
    });
}

/**
 * Dispense prescription
 */
function dispensePrescription() {
    Swal.fire({
        title: '¿Dispensar receta?',
        text: 'Esta acción marcará la receta como dispensada',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, dispensar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${FarmaConfig.apiBase}/prescriptions/${currentPrescriptionId}/dispense`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${FarmaConfig.token}`
                },
                success: function(response) {
                    if (response.success) {
                        $('#modalShowPrescription').modal('hide');
                        prescriptionsTable.ajax.reload();
                        Swal.fire({
                            icon: 'success',
                            title: 'Receta dispensada',
                            text: response.message,
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire('Error', response.message || 'Error al dispensar', 'error');
                    }
                },
                error: function(xhr) {
                    Swal.fire('Error', xhr.responseJSON?.message || 'Error al dispensar', 'error');
                }
            });
        }
    });
}

/**
 * Quick dispense from table
 */
function quickDispense(id) {
    currentPrescriptionId = id;
    dispensePrescription();
}

/**
 * Send prescription to pharmacy
 */
function sendToPharmacy(id) {
    currentPrescriptionId = id;
    $('#send_pharmacy_id').val(null).trigger('change');
    $('#modalSendToPharmacy').modal('show');
}

/**
 * Confirm send to pharmacy
 */
function confirmSendToPharmacy() {
    const pharmacyId = $('#send_pharmacy_id').val();
    
    if (!pharmacyId) {
        Swal.fire('Error', 'Debes seleccionar una farmacia', 'error');
        return;
    }
    
    $.ajax({
        url: `${FarmaConfig.apiBase}/prescriptions/${currentPrescriptionId}/send`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FarmaConfig.token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ pharmacy_id: pharmacyId }),
        success: function(response) {
            if (response.success) {
                $('#modalSendToPharmacy').modal('hide');
                prescriptionsTable.ajax.reload();
                Swal.fire({
                    icon: 'success',
                    title: 'Receta enviada',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire('Error', response.message || 'Error al enviar', 'error');
            }
        },
        error: function(xhr) {
            Swal.fire('Error', xhr.responseJSON?.message || 'Error al enviar', 'error');
        }
    });
}

/**
 * Create notification from prescription (for pharmacists)
 */
function createNotificationFromPrescription() {
    // Store prescription data and redirect to notifications
    sessionStorage.setItem('prescriptionForNotification', JSON.stringify({
        id: currentPrescriptionId,
        patient_cip: $('#show_patient_cip').text(),
        medication: $('#show_medication').text()
    }));
    
    $('#modalShowPrescription').modal('hide');
    
    // Redirect to notifications page
    window.location.href = 'notifications.php?from_prescription=' + currentPrescriptionId;
}

/**
 * Confirm delete
 */
function confirmDelete(id, name) {
    currentPrescriptionId = id;
    $('#delete_prescription_name').text(name);
    
    $('#btnConfirmDelete').off('click').on('click', function() {
        deletePrescription();
    });
    
    $('#modalDeletePrescription').modal('show');
}

/**
 * Delete prescription
 */
function deletePrescription() {
    $.ajax({
        url: `${FarmaConfig.apiBase}/prescriptions/${currentPrescriptionId}/delete`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${FarmaConfig.token}`
        },
        success: function(response) {
            if (response.success) {
                $('#modalDeletePrescription').modal('hide');
                prescriptionsTable.ajax.reload();
                Swal.fire({
                    icon: 'success',
                    title: 'Receta eliminada',
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire('Error', response.message || 'Error al eliminar', 'error');
            }
        },
        error: function(xhr) {
            Swal.fire('Error', xhr.responseJSON?.message || 'Error al eliminar', 'error');
        }
    });
}

/**
 * Open file picker for prescription image from table
 */
function openPrescriptionImageUpload(e, nId) {
    e.preventDefault();
    e.stopPropagation();
    
    imageUploadPrescriptionId = nId;
    
    // Trigger the hidden file input
    $('#tablePrescriptionImageInput').val('').trigger('click');
}

/**
 * Handle image file selection from table
 */
function handleTablePrescriptionImageChange(e) {
    const file = e.target.files[0];
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

    const reader = new FileReader();
    reader.onload = function(readerEvent) {
        const strBase64 = readerEvent.target.result;
        updatePrescriptionImageFromTable(imageUploadPrescriptionId, strBase64);
    };
    reader.readAsDataURL(file);
}

/**
 * Update prescription image via API
 */
function updatePrescriptionImageFromTable(nId, strImageBase64) {
    $.ajax({
        type: 'PUT',
        url: `${FarmaConfig.apiBase}/prescriptions/${nId}/update`,
        dataType: 'json',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${FarmaConfig.token}`
        },
        data: JSON.stringify({ image_base64: strImageBase64 }),
        success: function(response) {
            if (!response.success) {
                FarmaApp.toast(response.message || 'Error al actualizar imagen', 'error');
                return;
            }

            FarmaApp.toast('Imagen actualizada correctamente', 'success');

            // Reload table
            prescriptionsTable.ajax.reload(null, false);
        },
        error: function(xhr) {
            console.error('AJAX Error:', xhr.status, xhr.responseJSON);
            FarmaApp.toast('Error al actualizar imagen', 'error');
        }
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
