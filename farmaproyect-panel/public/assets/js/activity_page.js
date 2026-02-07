/**
 * Activity Page - FarmaProject
 */

var activityData = [
    { date: '2026-02-07 03:15:22', type: 'user', desc: 'Nuevo usuario registrado: Juan Pérez', user: 'Sistema', pharmacy: '-', pharmacyId: null, ip: '192.168.1.100' },
    { date: '2026-02-07 02:45:10', type: 'notification', desc: 'Receta caducada notificada - CIP: 12345678', user: 'admin@farmaproject.es', pharmacy: 'Farmacia Central', pharmacyId: 1, ip: '192.168.1.50' },
    { date: '2026-02-07 01:30:00', type: 'pharmacy', desc: 'Farmacia San Juan agregada al sistema', user: 'admin@farmaproject.es', pharmacy: '-', pharmacyId: null, ip: '192.168.1.50' },
    { date: '2026-02-06 18:30:45', type: 'notification', desc: 'Mensaje de urgencia enviado a 15 usuarios', user: 'medico@farmaproject.es', pharmacy: 'Farmacia Weyler', pharmacyId: 2, ip: '192.168.1.75' },
    { date: '2026-02-06 14:20:33', type: 'prescription', desc: 'Incidencia sobre medicamento prescrito reportada', user: 'farmacia@farmaproject.es', pharmacy: 'Farmacia Las Canteras', pharmacyId: 3, ip: '192.168.1.80' },
    { date: '2026-02-06 12:00:00', type: 'system', desc: 'Backup automático completado', user: 'Sistema', pharmacy: '-', pharmacyId: null, ip: '-' },
    { date: '2026-02-06 10:15:22', type: 'user', desc: 'Cambio de contraseña: María García', user: 'maria@farmaproject.es', pharmacy: 'Farmacia Central', pharmacyId: 1, ip: '192.168.1.90' },
    { date: '2026-02-05 16:45:00', type: 'notification', desc: 'Notificación masiva enviada: Alerta sanitaria', user: 'admin@farmaproject.es', pharmacy: '-', pharmacyId: null, ip: '192.168.1.50' },
    { date: '2026-02-05 14:30:18', type: 'prescription', desc: 'Nueva receta registrada #RX-2026-0145', user: 'medico@farmaproject.es', pharmacy: 'Farmacia Weyler', pharmacyId: 2, ip: '192.168.1.75' },
    { date: '2026-02-05 11:00:00', type: 'system', desc: 'Actualización del sistema completada v1.0.1', user: 'Sistema', pharmacy: '-', pharmacyId: null, ip: '-' },
    { date: '2026-02-05 09:30:00', type: 'pharmacy', desc: 'Datos actualizados: Farmacia Las Canteras', user: 'admin@farmaproject.es', pharmacy: 'Farmacia Las Canteras', pharmacyId: 3, ip: '192.168.1.50' },
    { date: '2026-02-04 17:00:00', type: 'user', desc: 'Usuario desactivado: Pedro López', user: 'admin@farmaproject.es', pharmacy: '-', pharmacyId: null, ip: '192.168.1.50' }
];

var tableVar = null;

function getActivity() {
    var objConfig = window.FarmaConfig || {},
        nSelectedPharmacyId = objConfig.selectedPharmacyId,
        bIsFiltered = objConfig.isFiltered;

    // Filter data if a pharmacy is selected in session
    var aDataToShow = activityData;

    if (bIsFiltered && nSelectedPharmacyId) {
        aDataToShow = activityData.filter(function(item) {
            return item.pharmacyId === nSelectedPharmacyId || item.pharmacyId === null;
        });
    }

    var objTypeIcons = {
        'user': function() { return '<span class="badge bg-primary"><i class="ti ti-user me-1"></i>Usuario</span>'; },
        'pharmacy': function() { return '<span class="badge bg-success"><i class="ti ti-building-store me-1"></i>Farmacia</span>'; },
        'notification': function() { return '<span class="badge bg-warning text-dark"><i class="ti ti-bell me-1"></i>Notificación</span>'; },
        'prescription': function() { return '<span class="badge bg-info"><i class="ti ti-file-text me-1"></i>Receta</span>'; },
        'system': function() { return '<span class="badge bg-secondary"><i class="ti ti-settings me-1"></i>Sistema</span>'; }
    };

    var $domDatatable = $('#activityTable');

    if (tableVar) {
        tableVar.destroy();
        tableVar = null;
    }

    var aDatatableColumns = [
        {
            data: 'date',
            render: function(objData, strType, objRow, objMeta) {
                var d = new Date(objData);
                return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            }
        },
        {
            data: 'type',
            render: function(objData, strType, objRow, objMeta) {
                return typeof objTypeIcons[objData] !== 'undefined' ? objTypeIcons[objData]() : objData;
            }
        },
        { data: 'desc' },
        { data: 'user' },
        { data: 'pharmacy' },
        {
            data: 'ip',
            className: 'text-muted'
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
        data: aDataToShow,
        columns: aDatatableColumns,
        order: [[0, 'desc']],
        columnDefs: [
            { "width": "auto", "targets": "_all" }
        ]
    });
}

function initFilters() {
    // Type filter
    $('#filterType').on('change', function() {
        var strVal = this.value;
        tableVar.column(1).search(strVal).draw();
    });

    // Pharmacy filter
    $('#filterPharmacy').on('change', function() {
        var strVal = this.value,
            objNames = {
                '1': 'Farmacia Central',
                '2': 'Farmacia Weyler',
                '3': 'Farmacia Las Canteras'
            };

        if (strVal) {
            tableVar.column(4).search(objNames[strVal] || '').draw();
        } else {
            tableVar.column(4).search('').draw();
        }
    });

    // Date filters
    $('#filterFrom, #filterTo').on('change', function() {
        tableVar.draw();
    });

    // Custom date filter
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        var strFrom = $('#filterFrom').val(),
            strTo = $('#filterTo').val(),
            strDateStr = data[0];

        if (!strFrom && !strTo) return true;

        var aParts = strDateStr.split(' '),
            aDateParts = aParts[0].split('/'),
            dRowDate = new Date(aDateParts[2], aDateParts[1] - 1, aDateParts[0]);

        if (strFrom && dRowDate < new Date(strFrom)) return false;
        if (strTo && dRowDate > new Date(strTo)) return false;

        return true;
    });

    // Refresh button
    $('#btnRefresh').on('click', function() {
        getActivity();
        FarmaApp.toast('Datos actualizados', 'success');
    });

    // Export button
    $('#btnExport').on('click', function() {
        FarmaApp.toast('Exportación no disponible en demo', 'info');
    });
}


(function () {
    $("#menu_activity").addClass("active");
})();

$(document).ready(function () {

    getActivity();
    initFilters();

});
