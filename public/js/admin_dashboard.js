// ===================== STATE =====================
let allBookings = [];
let allCustomers = [];
let allRooms = [];
let currentTab = 'dashboard';
let currentMonth = new Date();
let revenueChartInst = null;
let statusChartInst = null;
let reportChartInst = null;

// ===================== INIT =====================
async function init() {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { window.location.href = '/login'; return; }
    const user = await res.json();
    if (user.role !== 'admin') { window.location.href = '/login'; return; }

    setupSidebar();
    setupTabs();
    setupSearch();
    loadDashboard();
}

// ===================== SIDEBAR =====================
function setupSidebar() {
    const toggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}

// ===================== TABS =====================
function setupTabs() {
    document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            switchTab(tab);
            document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active-link'));
            link.classList.add('active-link');
            document.getElementById('admin-sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('active');
        });
    });
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');

    const titles = {
        dashboard: 'Dashboard Overview',
        reservations: 'Reservations Management',
        customers: 'Customer Directory',
        rooms: 'Room Management',
        calendar: 'Booking Calendar',
        reports: 'Reports & Analytics',
        settings: 'Admin Settings'
    };
    document.getElementById('page-title').innerText = titles[tab] || 'Dashboard';

    if (tab === 'dashboard') loadDashboard();
    if (tab === 'reservations') loadAllBookings();
    if (tab === 'customers') loadCustomers();
    if (tab === 'rooms') loadRooms();
    if (tab === 'calendar') renderCalendar();
    if (tab === 'reports') loadReports();
}

// ===================== TOASTS =====================
function showToast(message, type, title) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = '<i class="fas ' + icons[type] + ' toast-icon"></i>' +
        '<div class="toast-content"><strong>' + (title || type.charAt(0).toUpperCase() + type.slice(1)) + '</strong><span>' + message + '</span></div>' +
        '<button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>';
    container.appendChild(toast);
    setTimeout(function() {
        toast.classList.add('hiding');
        setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
}

// ===================== MODALS =====================
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ===================== DASHBOARD =====================
async function loadDashboard() {
    try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();

        const statsGrid = document.getElementById('stats-grid');
        statsGrid.innerHTML =
            '<div class="stat-card-v2"><div class="stat-icon blue"><i class="fas fa-calendar-check"></i></div><div class="stat-info"><h4>Total Bookings</h4><div class="value">' + data.totalBookings.toLocaleString() + '</div><div class="trend up"><i class="fas fa-arrow-up"></i> All time</div></div>' +
            '<div class="stat-card-v2"><div class="stat-icon green"><i class="fas fa-peso-sign"></i></div><div class="stat-info"><h4>Total Revenue</h4><div class="value">P' + data.totalRevenue.toLocaleString() + '</div><div class="trend up"><i class="fas fa-arrow-up"></i> Lifetime</div></div>' +
            '<div class="stat-card-v2"><div class="stat-icon orange"><i class="fas fa-clock"></i></div><div class="stat-info"><h4>Pending</h4><div class="value">' + data.pending + '</div><div class="trend ' + (data.pending > 5 ? 'down' : 'up') + '"><i class="fas fa-' + (data.pending > 5 ? 'exclamation' : 'check') + '"></i> Needs attention</div></div>' +
            '<div class="stat-card-v2"><div class="stat-icon purple"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h4>Confirmed</h4><div class="value">' + data.confirmed + '</div><div class="trend up"><i class="fas fa-arrow-up"></i> Approved</div></div>';

        const recentTbody = document.getElementById('recent-bookings-list');
        if (data.recent && data.recent.length) {
            recentTbody.innerHTML = data.recent.map(function(b) {
                return '<tr><td><div class="cell-user"><div class="avatar-sm">' + (b.guest_fullname || b.fullname || 'G').charAt(0) + '</div><div class="u-info"><div>' + (b.guest_fullname || b.fullname) + '</div><small>' + (b.guest_email || '') + '</small></div></td>' +
                    '<td>' + b.item_name + '</td>' +
                    '<td class="cell-strong">P' + parseFloat(b.total_price).toLocaleString() + '</td>' +
                    '<td><span class="badge badge-' + b.status + '">' + b.status + '</span></td></tr>';
            }).join('');
        } else {
            recentTbody.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i><h4>No recent bookings</h4></td></tr>';
        }

        const actList = document.getElementById('activity-list');
        if (data.recent && data.recent.length) {
            actList.innerHTML = data.recent.map(function(b) {
                return '<li class="activity-item"><div class="activity-dot ' + b.status + '"></div><div class="activity-content"><p><strong>' + (b.guest_fullname || b.fullname) + '</strong> booked <strong>' + b.item_name + '</strong></p><small>' + new Date(b.created_at || b.check_in).toLocaleDateString() + ' &middot; ' + b.status + '</small></div></li>';
            }).join('');
        } else {
            actList.innerHTML = '<li class="activity-item"><div class="activity-content"><p>No recent activity</p></div></li>';
        }

        renderCharts(data);
    } catch (err) {
        showToast('Failed to load dashboard data', 'error');
    }
}

function renderCharts(data) {
    const months = Object.keys(data.monthlyRevenue || {}).sort();
    const revData = months.map(function(m) { return data.monthlyRevenue[m]; });

    const revCtx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInst) revenueChartInst.destroy();
    revenueChartInst = new Chart(revCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenue (P)',
                data: revData,
                borderColor: '#1a5f7a',
                backgroundColor: 'rgba(26, 95, 122, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#1a5f7a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });

    const statusCtx = document.getElementById('statusChart').getContext('2d');
    if (statusChartInst) statusChartInst.destroy();
    statusChartInst = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Confirmed', 'Cancelled'],
            datasets: [{
                data: [data.pending, data.confirmed, data.cancelled],
                backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
        }
    });
}

// ===================== RESERVATIONS =====================
async function loadAllBookings() {
    const tbody = document.getElementById('all-bookings-list');
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="spinner"></div><p>Loading reservations...</p></td></tr>';
    try {
        const res = await fetch('/api/admin/reservations');
        allBookings = await res.json();
        renderBookingsTable(allBookings);
    } catch (err) {
        showToast('Failed to load reservations', 'error');
    }
}

function renderBookingsTable(bookings, page, perPage) {
    page = page || 1;
    perPage = perPage || 10;
    const tbody = document.getElementById('all-bookings-list');
    const start = (page - 1) * perPage;
    const paginated = bookings.slice(start, start + perPage);

    if (paginated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-inbox"></i><h4>No reservations found</h4></td></tr>';
        renderPagination('res-pagination', bookings.length, page, perPage, function(p) { renderBookingsTable(bookings, p, perPage); });
        return;
    }

    tbody.innerHTML = paginated.map(function(b) {
        return '<tr>' +
            '<td><div class="cell-user"><div class="avatar-sm">' + (b.guest_fullname || b.fullname || 'G').charAt(0) + '</div><div class="u-info"><div>' + (b.guest_fullname || b.fullname) + '</div><small>' + (b.guest_email || b.user_email || '') + '</small></div></td>' +
            '<td><div class="cell-strong">' + b.item_name + '</div><div class="cell-muted">' + (b.room_type || 'Standard') + '</div></td>' +
            '<td><div>' + new Date(b.check_in).toLocaleDateString() + '</div><div class="cell-muted">to ' + new Date(b.check_out).toLocaleDateString() + '</div></td>' +
            '<td>' + b.total_guests + '</td>' +
            '<td class="cell-strong">P' + parseFloat(b.total_price).toLocaleString() + '</td>' +
            '<td><span class="badge badge-' + b.status + '">' + b.status + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn btn-outline btn-icon btn-sm" onclick="viewReservation(' + b.id + ')" title="View"><i class="fas fa-eye"></i></button>' +
                '<select onchange="updateStatus(' + b.id + ', this.value)" class="form-control" style="width:110px;padding:0.3rem;font-size:0.8rem;" title="Change status">' +
                    '<option value="pending"' + (b.status === 'pending' ? ' selected' : '') + '>Pending</option>' +
                    '<option value="confirmed"' + (b.status === 'confirmed' ? ' selected' : '') + '>Confirm</option>' +
                    '<option value="cancelled"' + (b.status === 'cancelled' ? ' selected' : '') + '>Cancel</option>' +
                '</select>' +
                '<button class="btn btn-danger btn-icon btn-sm" onclick="deleteReservation(' + b.id + ')" title="Delete"><i class="fas fa-trash"></i></button>' +
            '</td></tr>';
    }).join('');

    renderPagination('res-pagination', bookings.length, page, perPage, function(p) { renderBookingsTable(bookings, p, perPage); });
}

async function updateStatus(id, status) {
    try {
        await fetch('/api/admin/reservations/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });
        showToast('Reservation ' + status + ' successfully', 'success');
        loadAllBookings();
        if (currentTab === 'dashboard') loadDashboard();
    } catch (err) {
        showToast('Failed to update status', 'error');
    }
}

async function deleteReservation(id) {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    try {
        await fetch('/api/admin/reservations/' + id, { method: 'DELETE' });
        showToast('Reservation deleted', 'success');
        loadAllBookings();
        if (currentTab === 'dashboard') loadDashboard();
    } catch (err) {
        showToast('Failed to delete reservation', 'error');
    }
}

async function viewReservation(id) {
    try {
        const res = await fetch('/api/admin/reservations/' + id);
        const b = await res.json();
        const body = document.getElementById('res-modal-body');
        body.innerHTML =
            '<div class="detail-row"><dt>Guest Name</dt><dd>' + (b.guest_fullname || b.fullname) + '</dd></div>' +
            '<div class="detail-row"><dt>Email</dt><dd>' + (b.guest_email || b.user_email || '-') + '</dd></div>' +
            '<div class="detail-row"><dt>Mobile</dt><dd>' + (b.guest_mobile || '-') + '</dd></div>' +
            '<div class="detail-row"><dt>Address</dt><dd>' + (b.guest_address || '-') + '</dd></div>' +
            '<div class="detail-row"><dt>Accommodation</dt><dd>' + b.item_name + '</dd></div>' +
            '<div class="detail-row"><dt>Room Type</dt><dd>' + (b.room_type || 'Standard') + '</dd></div>' +
            '<div class="detail-row"><dt>Check In</dt><dd>' + new Date(b.check_in).toLocaleDateString() + '</dd></div>' +
            '<div class="detail-row"><dt>Check Out</dt><dd>' + new Date(b.check_out).toLocaleDateString() + '</dd></div>' +
            '<div class="detail-row"><dt>Nights</dt><dd>' + b.num_nights + '</dd></div>' +
            '<div class="detail-row"><dt>Guests</dt><dd>' + b.total_guests + ' (Adults: ' + b.adults + ', Children: ' + (b.children || 0) + ')</dd></div>' +
            '<div class="detail-row"><dt>Rooms</dt><dd>' + (b.num_rooms || 1) + '</dd></div>' +
            '<div class="detail-row"><dt>Bed Preference</dt><dd>' + (b.bed_preference || '-') + '</dd></div>' +
            '<div class="detail-row"><dt>Extra Bed</dt><dd>' + (b.extra_bed ? 'Yes' : 'No') + '</dd></div>' +
            '<div class="detail-row"><dt>Food Package</dt><dd>' + (b.food_package ? 'Yes' : 'No') + '</dd></div>' +
            '<div class="detail-row"><dt>Special Requests</dt><dd>' + (b.special_requests || '-') + '</dd></div>' +
            '<div class="detail-row"><dt>Total Price</dt><dd style="color:#1a5f7a;font-size:1.1rem;">P' + parseFloat(b.total_price).toLocaleString() + '</dd></div>' +
            '<div class="detail-row"><dt>Status</dt><dd><span class="badge badge-' + b.status + '">' + b.status + '</span></dd></div>';
        openModal('res-modal');
    } catch (err) {
        showToast('Failed to load reservation details', 'error');
    }
}

// ===================== CUSTOMERS =====================
async function loadCustomers() {
    const tbody = document.getElementById('customers-list');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="spinner"></div><p>Loading customers...</p></td></tr>';
    try {
        const res = await fetch('/api/admin/customers');
        allCustomers = await res.json();
        renderCustomersTable(allCustomers);
    } catch (err) {
        showToast('Failed to load customers', 'error');
    }
}

function renderCustomersTable(customers, page, perPage) {
    page = page || 1;
    perPage = perPage || 10;
    const tbody = document.getElementById('customers-list');
    const start = (page - 1) * perPage;
    const paginated = customers.slice(start, start + perPage);

    if (paginated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><h4>No customers found</h4></td></tr>';
        renderPagination('cust-pagination', customers.length, page, perPage, function(p) { renderCustomersTable(customers, p, perPage); });
        return;
    }

    tbody.innerHTML = paginated.map(function(c) {
        return '<tr>' +
            '<td><div class="cell-user"><div class="avatar-sm">' + (c.fullname || 'U').charAt(0) + '</div><div class="u-info"><div>' + c.fullname + '</div><small>' + c.email + '</small></div></td>' +
            '<td><div>' + (c.mobile || '-') + '</div><div class="cell-muted">' + (c.address || '-') + '</div></td>' +
            '<td>' + (c.total_bookings || 0) + '</td>' +
            '<td class="cell-strong">P' + parseFloat(c.total_spent || 0).toLocaleString() + '</td>' +
            '<td>' + new Date(c.created_at).toLocaleDateString() + '</td>' +
            '<td class="actions"><button class="btn btn-outline btn-icon btn-sm" onclick="viewCustomer(' + c.id + ')" title="View"><i class="fas fa-eye"></i></button></td>' +
            '</tr>';
    }).join('');

    renderPagination('cust-pagination', customers.length, page, perPage, function(p) { renderCustomersTable(customers, p, perPage); });
}

async function viewCustomer(id) {
    try {
        const res = await fetch('/api/admin/customers/' + id);
        const c = await res.json();
        const body = document.getElementById('res-modal-body');
        body.innerHTML =
            '<div class="detail-row"><dt>Name</dt><dd>' + c.fullname + '</dd></div>' +
            '<div class="detail-row"><dt>Email</dt><dd>' + c.email + '</dd></div>' +
            '<div class="detail-row"><dt>Mobile</dt><dd>' + (c.mobile || '-') + '</dd></div>' +
            '<div class="detail-row"><dt>Address</dt><dd>' + (c.address || '-') + '</dd></div>' +
            '<div class="detail-row"><dt>Joined</dt><dd>' + new Date(c.created_at).toLocaleDateString() + '</dd></div>' +
            '<div class="detail-row"><dt>Total Bookings</dt><dd>' + (c.bookings ? c.bookings.length : 0) + '</dd></div>' +
            '<div style="margin-top:1rem;"><h4 style="margin-bottom:0.5rem;">Booking History</h4>' +
            (c.bookings && c.bookings.length ? '<div class="table-scroll"><table class="table-v2"><thead><tr><th>Item</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>' +
            c.bookings.map(function(b) {
                return '<tr><td>' + b.item_name + '</td><td>' + new Date(b.check_in).toLocaleDateString() + '</td><td>P' + parseFloat(b.total_price).toLocaleString() + '</td><td><span class="badge badge-' + b.status + '">' + b.status + '</span></td></tr>';
            }).join('') + '</tbody></table></div>' : '<p class="cell-muted">No bookings yet.</p>') + '</div>';
        document.querySelector('#res-modal .modal-v2-header h3').innerText = 'Customer Details';
        openModal('res-modal');
    } catch (err) {
        showToast('Failed to load customer details', 'error');
    }
}

// ===================== ROOMS =====================
async function loadRooms() {
    const tbody = document.getElementById('rooms-list');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="spinner"></div><p>Loading rooms...</p></td></tr>';
    try {
        const res = await fetch('/api/admin/items');
        allRooms = await res.json();
        renderRoomsTable(allRooms);
    } catch (err) {
        showToast('Failed to load rooms', 'error');
    }
}

function renderRoomsTable(rooms) {
    const tbody = document.getElementById('rooms-list');
    if (rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><h4>No rooms found</h4></td></tr>';
        return;
    }
    tbody.innerHTML = rooms.map(function(r) {
        return '<tr>' +
            '<td>' + r.id + '</td>' +
            '<td class="cell-strong">' + r.name + '</td>' +
            '<td>' + (r.description ? r.description.substring(0, 60) + (r.description.length > 60 ? '...' : '') : '-') + '</td>' +
            '<td class="cell-strong">P' + parseFloat(r.price).toLocaleString() + '</td>' +
            '<td><span class="badge badge-' + (r.status === 'available' ? 'confirmed' : 'cancelled') + '">' + r.status + '</span></td>' +
            '<td class="actions">' +
                '<button class="btn btn-outline btn-icon btn-sm" onclick="editRoom(' + r.id + ')" title="Edit"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-danger btn-icon btn-sm" onclick="deleteRoom(' + r.id + ')" title="Delete"><i class="fas fa-trash"></i></button>' +
            '</td></tr>';
    }).join('');
}

function openRoomModal() {
    document.getElementById('room-form').reset();
    document.getElementById('room-id').value = '';
    document.getElementById('room-modal-title').innerText = 'Add Room';
    openModal('room-modal');
}

async function editRoom(id) {
    try {
        const res = await fetch('/api/admin/items/' + id);
        const r = await res.json();
        document.getElementById('room-id').value = r.id;
        document.getElementById('room-name').value = r.name;
        document.getElementById('room-desc').value = r.description || '';
        document.getElementById('room-price').value = r.price;
        document.getElementById('room-status').value = r.status;
        document.getElementById('room-image').value = r.image_url || '';
        document.getElementById('room-modal-title').innerText = 'Edit Room';
        openModal('room-modal');
    } catch (err) {
        showToast('Failed to load room details', 'error');
    }
}

async function saveRoom(e) {
    e.preventDefault();
    const id = document.getElementById('room-id').value;
    const payload = {
        name: document.getElementById('room-name').value,
        description: document.getElementById('room-desc').value,
        price: document.getElementById('room-price').value,
        status: document.getElementById('room-status').value,
        image_url: document.getElementById('room-image').value
    };
    try {
        const url = id ? '/api/admin/items/' + id : '/api/admin/items';
        const method = id ? 'PUT' : 'POST';
        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showToast('Room ' + (id ? 'updated' : 'created') + ' successfully', 'success');
        closeModal('room-modal');
        loadRooms();
    } catch (err) {
        showToast('Failed to save room', 'error');
    }
}

async function deleteRoom(id) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
        await fetch('/api/admin/items/' + id, { method: 'DELETE' });
        showToast('Room deleted', 'success');
        loadRooms();
    } catch (err) {
        showToast('Failed to delete room', 'error');
    }
}

// ===================== CALENDAR =====================
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('cal-month-year');
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    monthYear.innerText = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = dayNames.map(function(d) { return '<div class="cal-header">' + d + '</div>'; }).join('');

    for (let i = firstDay - 1; i >= 0; i--) {
        html += '<div class="cal-day other-month">' + (daysInPrevMonth - i) + '</div>';
    }

    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = (year === today.getFullYear() && month === today.getMonth() && d === today.getDate());
        const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const dayBookings = allBookings.filter(function(b) {
            const ci = new Date(b.check_in);
            const co = new Date(b.check_out);
            const cd = new Date(dateStr);
            return cd >= ci && cd <= co;
        });
        let dotClass = '';
        if (dayBookings.length > 3) dotClass = 'busy';
        else if (dayBookings.length > 1) dotClass = 'medium';
        else if (dayBookings.length > 0) dotClass = 'light';
        html += '<div class="cal-day' + (isToday ? ' today' : '') + '" title="' + dayBookings.length + ' bookings">' + d + (dotClass ? '<div class="dot ' + dotClass + '"></div>' : '') + '</div>';
    }

    const totalCells = firstDay + daysInMonth;
    const nextPadding = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= nextPadding; d++) {
        html += '<div class="cal-day other-month">' + d + '</div>';
    }

    grid.innerHTML = html;
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

// ===================== REPORTS =====================
async function loadReports() {
    try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();

        const statsGrid = document.getElementById('report-stats');
        statsGrid.innerHTML =
            '<div class="stat-card-v2"><div class="stat-icon blue"><i class="fas fa-calendar-check"></i></div><div class="stat-info"><h4>Total Bookings</h4><div class="value">' + data.totalBookings.toLocaleString() + '</div></div></div>' +
            '<div class="stat-card-v2"><div class="stat-icon green"><i class="fas fa-peso-sign"></i></div><div class="stat-info"><h4>Total Revenue</h4><div class="value">P' + data.totalRevenue.toLocaleString() + '</div></div></div>' +
            '<div class="stat-card-v2"><div class="stat-icon orange"><i class="fas fa-clock"></i></div><div class="stat-info"><h4>Pending</h4><div class="value">' + data.pending + '</div></div></div>' +
            '<div class="stat-card-v2"><div class="stat-icon red"><i class="fas fa-times-circle"></i></div><div class="stat-info"><h4>Cancelled</h4><div class="value">' + data.cancelled + '</div></div></div>';

        const months = Object.keys(data.monthlyRevenue || {}).sort();
        const revData = months.map(function(m) { return data.monthlyRevenue[m]; });
        const bookData = months.map(function(m) { return data.monthlyBookings[m]; });

        const ctx = document.getElementById('reportChart').getContext('2d');
        if (reportChartInst) reportChartInst.destroy();
        reportChartInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Revenue (P)',
                        data: revData,
                        backgroundColor: 'rgba(26, 95, 122, 0.8)',
                        borderRadius: 6
                    },
                    {
                        label: 'Bookings',
                        data: bookData,
                        backgroundColor: 'rgba(21, 152, 149, 0.8)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch (err) {
        showToast('Failed to load reports', 'error');
    }
}

// ===================== PAGINATION =====================
function renderPagination(containerId, totalItems, currentPage, perPage, callback) {
    const container = document.getElementById(containerId);
    const totalPages = Math.ceil(totalItems / perPage);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '<button ' + (currentPage === 1 ? 'disabled' : '') + ' onclick="(' + callback + ')(' + (currentPage - 1) + ')">Prev</button>';
    for (let i = 1; i <= totalPages; i++) {
        html += '<button class="' + (i === currentPage ? 'active' : '') + '" onclick="(' + callback + ')(' + i + ')">' + i + '</button>';
    }
    html += '<button ' + (currentPage === totalPages ? 'disabled' : '') + ' onclick="(' + callback + ')(' + (currentPage + 1) + ')">Next</button>';
    container.innerHTML = html;
}

// ===================== SEARCH & FILTER =====================
function setupSearch() {
    const resSearch = document.getElementById('res-search');
    const resFilter = document.getElementById('res-filter-status');
    if (resSearch) {
        resSearch.addEventListener('input', function() { filterBookings(); });
    }
    if (resFilter) {
        resFilter.addEventListener('change', function() { filterBookings(); });
    }

    const custSearch = document.getElementById('cust-search');
    if (custSearch) {
        custSearch.addEventListener('input', function() { filterCustomers(); });
    }

    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            if (term.length > 2 && currentTab !== 'reservations') {
                switchTab('reservations');
            }
            if (currentTab === 'reservations') {
                document.getElementById('res-search').value = this.value;
                filterBookings();
            }
        });
    }
}

function filterBookings() {
    const term = (document.getElementById('res-search') ? document.getElementById('res-search').value : '').toLowerCase();
    const status = document.getElementById('res-filter-status') ? document.getElementById('res-filter-status').value : '';
    const filtered = allBookings.filter(function(b) {
        const matchesTerm = !term ||
            (b.guest_fullname || b.fullname || '').toLowerCase().includes(term) ||
            (b.guest_email || '').toLowerCase().includes(term) ||
            (b.item_name || '').toLowerCase().includes(term);
        const matchesStatus = !status || b.status === status;
        return matchesTerm && matchesStatus;
    });
    renderBookingsTable(filtered);
}

function filterCustomers() {
    const term = (document.getElementById('cust-search') ? document.getElementById('cust-search').value : '').toLowerCase();
    const filtered = allCustomers.filter(function(c) {
        return !term ||
            (c.fullname || '').toLowerCase().includes(term) ||
            (c.email || '').toLowerCase().includes(term) ||
            (c.mobile || '').toLowerCase().includes(term);
    });
    renderCustomersTable(filtered);
}

// ===================== LOGOUT =====================
document.getElementById('logout-btn').addEventListener('click', async function() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
});

// ===================== START =====================
init();
