/**
 * Dashboard Page - FarmaProject
 */

var pharmaciesData = [];
var notificationsData = [];
var prescriptionsData = [];
var mapInstance = null;
var bPharmaciesLoaded = false;
var bNotificationsLoaded = false;
var nSelectedYear = new Date().getFullYear();
var nSelectedMonth = null; // null = todos los meses

function loadDashboardData() {
    var objConfig = window.FarmaConfig || {},
        strApiBase = objConfig.apiBase || '',
        strToken = objConfig.token || '';

    // Load pharmacies
    $.ajax({
        type: 'GET',
        url: strApiBase + '/pharmacies',
        headers: { 'Authorization': 'Bearer ' + strToken },
        success: function(response) {
            if (response.success) {
                pharmaciesData = response.data || [];
                // Update pharmacy stat
                var $statPharmacies = document.getElementById('statPharmacies');
                if ($statPharmacies) {
                    $statPharmacies.textContent = pharmaciesData.length;
                }
            }
            bPharmaciesLoaded = true;
            tryInitMap();
        },
        error: function() {
            pharmaciesData = [];
            bPharmaciesLoaded = true;
            tryInitMap();
        }
    });

    // Load notifications for stats
    $.ajax({
        type: 'GET',
        url: strApiBase + '/notifications',
        headers: { 'Authorization': 'Bearer ' + strToken },
        success: function(response) {
            if (response.success) {
                notificationsData = response.data || [];
                
                // Update notification stats
                var $statNotif = document.getElementById('statNotifications');
                var $statNotifPending = document.getElementById('statNotificationsPending');
                
                if ($statNotif) {
                    $statNotif.textContent = notificationsData.length;
                }
                
                if ($statNotifPending) {
                    var nPending = notificationsData.filter(function(n) { 
                        return n.ticket_status === 'pending'; 
                    }).length;
                    
                    if (nPending > 0) {
                        $statNotifPending.innerHTML = '<i class="ti ti-arrow-down"></i> ' + nPending + ' pendientes';
                        $statNotifPending.classList.add('down');
                    } else {
                        $statNotifPending.innerHTML = '<i class="ti ti-check"></i> Sin pendientes';
                        $statNotifPending.classList.add('up');
                    }
                }
                
                initYearSelector();
                initCharts();
            }
            bNotificationsLoaded = true;
            tryInitMap();
        },
        error: function() {
            notificationsData = [];
            var $statNotif = document.getElementById('statNotifications');
            var $statNotifPending = document.getElementById('statNotificationsPending');
            if ($statNotif) $statNotif.textContent = '0';
            if ($statNotifPending) $statNotifPending.textContent = 'Sin datos';
            initCharts();
            bNotificationsLoaded = true;
            tryInitMap();
        }
    });

    // Load prescriptions for stats
    $.ajax({
        type: 'GET',
        url: strApiBase + '/prescriptions',
        headers: { 'Authorization': 'Bearer ' + strToken },
        success: function(response) {
            if (response.success) {
                prescriptionsData = response.data || [];
                
                // Update prescription stats
                var $statPrescriptions = document.getElementById('statPrescriptions');
                var $statPrescriptionsToday = document.getElementById('statPrescriptionsToday');
                
                if ($statPrescriptions) {
                    $statPrescriptions.textContent = prescriptionsData.length;
                }
                
                if ($statPrescriptionsToday) {
                    var today = new Date().toISOString().split('T')[0];
                    var nToday = prescriptionsData.filter(function(p) { 
                        return (p.created_at || '').startsWith(today); 
                    }).length;
                    
                    if (nToday > 0) {
                        $statPrescriptionsToday.innerHTML = '<i class="ti ti-arrow-up"></i> ' + nToday + ' hoy';
                        $statPrescriptionsToday.classList.add('up');
                    } else {
                        $statPrescriptionsToday.innerHTML = 'Ninguna hoy';
                        $statPrescriptionsToday.classList.remove('up', 'down');
                    }
                }
            }
        },
        error: function() {
            var $statPrescriptions = document.getElementById('statPrescriptions');
            var $statPrescriptionsToday = document.getElementById('statPrescriptionsToday');
            if ($statPrescriptions) $statPrescriptions.textContent = '0';
            if ($statPrescriptionsToday) $statPrescriptionsToday.textContent = 'Sin datos';
        }
    });
}

/**
 * Try to initialize map only when both pharmacies and notifications are loaded
 */
function tryInitMap() {
    if (bPharmaciesLoaded && bNotificationsLoaded) {
        initMap();
    }
}

/**
 * Initialize year and month selectors for the chart
 */
function initYearSelector() {
    var $container = document.getElementById('yearSelectorContainer');
    if (!$container) return;
    
    // Get available years from notifications
    var aYears = [];
    notificationsData.forEach(function(notif) {
        var strDate = notif.created_at || '';
        if (strDate) {
            var nYear = new Date(strDate).getFullYear();
            if (aYears.indexOf(nYear) === -1) {
                aYears.push(nYear);
            }
        }
    });
    
    // Add current year if not present
    var nCurrentYear = new Date().getFullYear();
    if (aYears.indexOf(nCurrentYear) === -1) {
        aYears.push(nCurrentYear);
    }
    
    // Sort years descending
    aYears.sort(function(a, b) { return b - a; });
    
    // Set selected year to most recent with data
    nSelectedYear = aYears[0] || nCurrentYear;
    
    // Month names
    var aMonthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Create selectors HTML
    var strHTML = '<div class="d-flex gap-2 align-items-center">';
    
    // Month selector
    strHTML += '<select id="monthSelector" class="form-select form-select-sm" style="width: auto; min-width: 130px;">';
    strHTML += '<option value="">Todos los meses</option>';
    aMonthNames.forEach(function(month, index) {
        strHTML += '<option value="' + index + '">' + month + '</option>';
    });
    strHTML += '</select>';
    
    // Year selector
    strHTML += '<select id="yearSelector" class="form-select form-select-sm" style="width: auto; min-width: 80px;">';
    aYears.forEach(function(year) {
        var strSelected = year === nSelectedYear ? ' selected' : '';
        strHTML += '<option value="' + year + '"' + strSelected + '>' + year + '</option>';
    });
    strHTML += '</select>';
    
    strHTML += '</div>';
    
    $container.innerHTML = strHTML;
    
    // Add change events
    document.getElementById('yearSelector').addEventListener('change', function() {
        nSelectedYear = parseInt(this.value);
        updateMonthlyChart();
    });
    
    document.getElementById('monthSelector').addEventListener('change', function() {
        nSelectedMonth = this.value === '' ? null : parseInt(this.value);
        updateMonthlyChart();
    });
}

function initMap() {
    var $mapEl = document.getElementById('pharmacyMap');

    if (!$mapEl || typeof L === 'undefined') return false;

    var objConfig = window.FarmaConfig || {},
        bIsFarmaceutico = objConfig.isFarmaceutico,
        nSelectedPharmacyId = objConfig.selectedPharmacyId,
        bIsFiltered = objConfig.isFiltered;

    var aDefaultCenter = [28.3, -15.8],
        nDefaultZoom = (bIsFarmaceutico || bIsFiltered) ? 14 : 8;

    mapInstance = L.map('pharmacyMap').setView(aDefaultCenter, nDefaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Filter pharmacies based on role and session selection
    var aPharmToShow = pharmaciesData;

    if (bIsFarmaceutico && pharmaciesData.length > 0) {
        aPharmToShow = [pharmaciesData[0]];
    } else if (bIsFiltered && nSelectedPharmacyId) {
        aPharmToShow = pharmaciesData.filter(function(p) { return p.id === nSelectedPharmacyId; });
        if (aPharmToShow.length === 0) aPharmToShow = pharmaciesData;
    }

    // Update pharmacy count badge
    var $countBadge = document.getElementById('pharmacyCount');
    if ($countBadge) {
        if (aPharmToShow.length === 0) {
            $countBadge.textContent = 'Sin farmacias';
        } else {
            $countBadge.textContent = aPharmToShow.length === 1 ? '1 farmacia' : aPharmToShow.length + ' farmacias';
        }
    }

    if (aPharmToShow.length === 0) {
        // Show message on map
        var $noData = document.createElement('div');
        $noData.className = 'position-absolute top-50 start-50 translate-middle text-center text-muted';
        $noData.innerHTML = '<i class="ti ti-map-off fs-1"></i><p>No hay farmacias para mostrar</p>';
        $mapEl.appendChild($noData);
        return;
    }

    var aMarkers = [];

    aPharmToShow.forEach(function(pharmacy) {
        // Count notifications for this pharmacy
        var nNotifCount = notificationsData.filter(function(n) {
            return n.pharmacy_id === pharmacy.id;
        }).length;

        var strHTML = '';
        strHTML += '<div class="marker-pin">';
        strHTML += '    <i class="ti ti-building-store"></i>';
        if (nNotifCount > 0) {
            var strNotifBadge = nNotifCount > 9 ? '9+' : nNotifCount;
            strHTML += '    <span class="marker-badge">' + strNotifBadge + '</span>';
        }
        strHTML += '</div>';

        var objCustomIcon = L.divIcon({
            className: 'pharmacy-marker',
            html: strHTML,
            iconSize: [40, 48],
            iconAnchor: [20, 48],
            popupAnchor: [0, -40]
        });

        // Use pharmacy coordinates, or fallback to default Canary Islands coordinates
        var nLat = pharmacy.lat || pharmacy.latitude || 28.1 + (Math.random() * 0.5);
        var nLng = pharmacy.lng || pharmacy.longitude || -15.4 - (Math.random() * 1.0);

        var strPopupHTML = '';
        strPopupHTML += '<div class="pharmacy-popup">';
        strPopupHTML += '    <strong>' + pharmacy.name + '</strong><br>';
        strPopupHTML += '    <small class="text-muted">' + (pharmacy.city || '') + '</small><br>';
        if (nNotifCount > 0) {
            strPopupHTML += '    <a href="notifications.php?pharmacy_id=' + pharmacy.id + '" class="badge bg-warning mt-2 text-decoration-none">';
            strPopupHTML += '        <i class="ti ti-bell me-1"></i>' + nNotifCount + ' notificaciones';
            strPopupHTML += '    </a>';
        } else {
            strPopupHTML += '    <span class="badge bg-success mt-2">Sin notificaciones</span>';
        }
        strPopupHTML += '</div>';

        var marker = L.marker([nLat, nLng], { icon: objCustomIcon })
            .addTo(mapInstance)
            .bindPopup(strPopupHTML);

        aMarkers.push(marker);
    });

    // Fit bounds to show all markers
    if (aMarkers.length > 0) {
        var group = L.featureGroup(aMarkers);
        mapInstance.fitBounds(group.getBounds().pad(0.2));
    }
}

function initCharts() {
    var $chartTypesEl = document.querySelector('#chartTypes');

    var bHasData = notificationsData.length > 0;

    // Group notifications by type (for donut chart - all time)
    var objTypeData = {};
    
    notificationsData.forEach(function(notif) {
        var strTypeName = notif.notification_type_name || 'Otros';
        var strTypeColor = notif.notification_type_color || '#6c757d';
        
        if (!objTypeData[strTypeName]) {
            objTypeData[strTypeName] = {
                color: strTypeColor,
                total: 0
            };
        }
        objTypeData[strTypeName].total++;
    });

    // Convert to arrays for donut chart
    var aTypeNames = Object.keys(objTypeData);
    var aTypeTotals = aTypeNames.map(function(name) { return objTypeData[name].total; });
    var aTypeColors = aTypeNames.map(function(name) { return objTypeData[name].color; });

    // Initialize monthly chart (filtered by year)
    updateMonthlyChart();

    // Notification types - donut chart (all time)
    if ($chartTypesEl && typeof ApexCharts !== 'undefined') {
        if (!bHasData) {
            $chartTypesEl.innerHTML = '<div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-5">' +
                '<i class="ti ti-chart-donut fs-1 mb-2"></i>' +
                '<p class="mb-0">No hay datos por el momento</p></div>';
        } else {
            var objOptionsDonut = {
                chart: {
                    type: 'donut',
                    height: 300,
                    fontFamily: 'Inter, sans-serif'
                },
                series: aTypeTotals,
                labels: aTypeNames,
                colors: aTypeColors.length > 0 ? aTypeColors : ['#005F02', '#E5D9B6', '#BFC6C4', '#E8E2D8'],
                stroke: { width: 2, colors: ['#fff'] },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '60%',
                            labels: {
                                show: true,
                                name: { fontSize: '12px', color: '#000' },
                                value: { fontSize: '18px', fontWeight: 700, color: '#000' },
                                total: { show: true, label: 'Total', color: '#555', fontSize: '12px' }
                            }
                        }
                    }
                },
                dataLabels: { enabled: false },
                legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#000' } },
                tooltip: { theme: 'light' }
            };

            new ApexCharts($chartTypesEl, objOptionsDonut).render();
        }
    }
}

var monthlyChartInstance = null;

function updateMonthlyChart() {
    var $chartNotifEl = document.querySelector('#chartNotifications');
    if (!$chartNotifEl || typeof ApexCharts === 'undefined') return;
    
    var aMonthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    var aMonthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Filter notifications by selected year and optionally by month
    var aFilteredNotifs = notificationsData.filter(function(notif) {
        var strDate = notif.created_at || '';
        if (!strDate) return false;
        var objDate = new Date(strDate);
        var nYear = objDate.getFullYear();
        var nMonth = objDate.getMonth();
        
        if (nYear !== nSelectedYear) return false;
        if (nSelectedMonth !== null && nMonth !== nSelectedMonth) return false;
        return true;
    });
    
    var bHasData = aFilteredNotifs.length > 0;
    
    // Destroy previous chart if exists
    if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
        monthlyChartInstance = null;
    }
    
    // Build period text for no-data message
    var strPeriod = nSelectedYear;
    if (nSelectedMonth !== null) {
        strPeriod = aMonthNames[nSelectedMonth] + ' ' + nSelectedYear;
    }
    
    if (!bHasData) {
        $chartNotifEl.innerHTML = '<div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-5">' +
            '<i class="ti ti-chart-area-line fs-1 mb-2"></i>' +
            '<p class="mb-0">No hay notificaciones en ' + strPeriod + '</p></div>';
        return;
    }
    
    // Clear container
    $chartNotifEl.innerHTML = '';
    
    // Determine chart type based on filter
    if (nSelectedMonth !== null) {
        // When a specific month is selected, show by day of month
        renderDailyChart($chartNotifEl, aFilteredNotifs, nSelectedMonth, nSelectedYear);
    } else {
        // Show by month (original behavior)
        renderMonthlyChart($chartNotifEl, aFilteredNotifs, aMonthLabels);
    }
}

function renderMonthlyChart($chartEl, aNotifs, aMonthLabels) {
    // Group by type and month
    var objTypeData = {};
    
    aNotifs.forEach(function(notif) {
        var strTypeName = notif.notification_type_name || 'Otros';
        var strTypeColor = notif.notification_type_color || '#6c757d';
        
        if (!objTypeData[strTypeName]) {
            objTypeData[strTypeName] = {
                color: strTypeColor,
                monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                total: 0
            };
        }
        
        var objDate = new Date(notif.created_at);
        var nMonth = objDate.getMonth();
        objTypeData[strTypeName].monthly[nMonth]++;
        objTypeData[strTypeName].total++;
    });
    
    var aTypeNames = Object.keys(objTypeData);
    
    // Create series for top 3 types
    var aSortedTypes = aTypeNames.sort(function(a, b) { 
        return objTypeData[b].total - objTypeData[a].total; 
    }).slice(0, 3);
    
    var aSeries = aSortedTypes.map(function(name) {
        return { name: name, data: objTypeData[name].monthly };
    });
    
    var aColors = aSortedTypes.map(function(name) { return objTypeData[name].color; });

    var objOptionsLine = {
        chart: {
            type: 'area',
            height: 250,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        series: aSeries,
        xaxis: {
            categories: aMonthLabels,
            labels: { style: { colors: '#555', fontSize: '11px' } }
        },
        yaxis: { 
            labels: { style: { colors: '#555', fontSize: '11px' } },
            min: 0,
            forceNiceScale: true
        },
        colors: aColors.length > 0 ? aColors : ['#005F02', '#E5D9B6', '#BFC6C4'],
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        grid: { borderColor: '#E8E2D8', strokeDashArray: 4 },
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', labels: { colors: '#000' } },
        tooltip: { theme: 'light' }
    };

    monthlyChartInstance = new ApexCharts($chartEl, objOptionsLine);
    monthlyChartInstance.render();
}

function renderDailyChart($chartEl, aNotifs, nMonth, nYear) {
    // Get number of days in the selected month
    var nDaysInMonth = new Date(nYear, nMonth + 1, 0).getDate();
    
    // Create day labels (1-31)
    var aDayLabels = [];
    for (var i = 1; i <= nDaysInMonth; i++) {
        aDayLabels.push(i.toString());
    }
    
    // Group by type and day
    var objTypeData = {};
    
    aNotifs.forEach(function(notif) {
        var strTypeName = notif.notification_type_name || 'Otros';
        var strTypeColor = notif.notification_type_color || '#6c757d';
        
        if (!objTypeData[strTypeName]) {
            objTypeData[strTypeName] = {
                color: strTypeColor,
                daily: new Array(nDaysInMonth).fill(0),
                total: 0
            };
        }
        
        var objDate = new Date(notif.created_at);
        var nDay = objDate.getDate() - 1; // 0-indexed
        objTypeData[strTypeName].daily[nDay]++;
        objTypeData[strTypeName].total++;
    });
    
    var aTypeNames = Object.keys(objTypeData);
    
    // Create series for top 3 types
    var aSortedTypes = aTypeNames.sort(function(a, b) { 
        return objTypeData[b].total - objTypeData[a].total; 
    }).slice(0, 3);
    
    var aSeries = aSortedTypes.map(function(name) {
        return { name: name, data: objTypeData[name].daily };
    });
    
    var aColors = aSortedTypes.map(function(name) { return objTypeData[name].color; });

    var objOptionsBar = {
        chart: {
            type: 'bar',
            height: 250,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        series: aSeries,
        xaxis: {
            categories: aDayLabels,
            labels: { style: { colors: '#555', fontSize: '10px' } },
            title: { text: 'Día del mes', style: { fontSize: '11px', color: '#777' } }
        },
        yaxis: { 
            labels: { style: { colors: '#555', fontSize: '11px' } },
            min: 0,
            forceNiceScale: true
        },
        colors: aColors.length > 0 ? aColors : ['#005F02', '#E5D9B6', '#BFC6C4'],
        plotOptions: {
            bar: {
                borderRadius: 2,
                columnWidth: '60%'
            }
        },
        dataLabels: { enabled: false },
        grid: { borderColor: '#E8E2D8', strokeDashArray: 4 },
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', labels: { colors: '#000' } },
        tooltip: { theme: 'light' }
    };

    monthlyChartInstance = new ApexCharts($chartEl, objOptionsBar);
    monthlyChartInstance.render();
}


(function () {
    $("#menu_dashboard").addClass("active");
})();

$(document).ready(function () {
    loadDashboardData();
});
