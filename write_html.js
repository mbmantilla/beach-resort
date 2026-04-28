const fs = require('fs');

const html = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'    <meta charset="UTF-8">' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'    <title>Admin Dashboard | Dang\'s Beach Resort</title>' +
'    <link rel="stylesheet" href="/css/style.css">' +
'    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' +
'    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>' +
'</head>' +
'<body class="admin-body">' +
'    <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">' +
'        <i class="fas fa-bars"></i>' +
'    </button>' +
'    <div class="sidebar-overlay" id="sidebar-overlay"></div>' +

'    <aside class="admin-sidebar" id="admin-sidebar">' +
'        <div class="sidebar-header">' +
'            <h2>Dang\'s Resort</h2>' +
'            <small>Administration Panel</small>' +
'        </div>' +
'        <nav class="sidebar-nav">' +
'            <ul>' +
'                <li><a href="#" class="active-link" data-tab="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>' +
'                <li><a href="#" data-tab="reservations"><i class="fas fa-calendar-check"></i> Reservations</a></li>' +
'                <li><a href="#" data-tab="customers"><i class="fas fa-users"></i> Customers</a></li>' +
'                <li><a href="#" data-tab="rooms"><i class="fas fa-bed"></i> Rooms</a></li>' +
'                <li><a href="#" data-tab="calendar"><i class="fas fa-calendar-alt"></i> Calendar</a></li>' +
'                <li><a href="#" data-tab="reports"><i class="fas fa-chart-line"></i> Reports</a></li>' +
'                <li><a href="#" data-tab="settings"><i class="fas fa-cog"></i> Settings</a></li>' +
'                <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>' +
'            </ul>' +
'        </nav>' +
'        <div class="sidebar-footer">v2.0 &middot; Dang\'s Beach Resort</div>' +
'    </aside>' +

'    <main class="admin-main">' +
'        <div class="toast-container" id="toast-container"></div>' +

'        <header class="admin-header">' +
'            <div>' +
'                <h2 id="page-title">Dashboard Overview</h2>' +
'                <p>Welcome back, Admin! Here\'s what\'s happening today.</p>' +
'            </div>' +
'            <div class="header-right">' +
'                <div class="header-search">' +
'                    <i class="fas fa-search"></i>' +
'                    <input type="text" id="global-search" placeholder="Search reservations...">' +
'                </div>' +
'                <div class="user-pill">' +
'                    <div class="avatar">A</div>' +
'                    <div class="info">' +
'                        <span>System Admin</span>' +
'                        <small>admin@dangs.com</small>' +
'                    </div>' +
'                </div>' +
'            </div>' +
'        </header>' +

'        <!-- DASHBOARD -->' +
'        <div class="tab-content active" id="tab-dashboard">' +
'            <div class="stats-grid-v2" id="stats-grid">' +
'                <div class="stat-card-v2"><div class="stat-icon blue"><i class="fas fa-calendar-check"></i></div><div class="stat-info"><h4>Total Bookings</h4><div class="value">--</div></div>' +
'                <div class="stat-card-v2"><div class="stat-icon green"><i class="fas fa-peso-sign"></i></div><div class="stat-info"><h4>Total Revenue</h4><div class="value">--</div></div>' +
'                <div class="stat-card-v2"><div class="stat-icon orange"><i class="fas fa-clock"></i></div><div class="stat-info"><h4>Pending</h4><div class="value">--</div></div>' +
'                <div class="stat-card-v2"><div class="stat-icon purple"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h4>Confirmed</h4><div class="value">--</div></div>' +
'            </div>' +

'            <div class="charts-grid">' +
'                <div class="chart-card">' +
'                    <h4>Revenue Trend</h4>' +
'                    <div class="chart-container"><canvas id="revenueChart"></canvas></div>' +
'                </div>' +
'                <div class="chart-card">' +
'                    <h4>Booking Status</h4>' +
'                    <div class="chart-container sm"><canvas id="statusChart"></canvas></div>' +
'                </div>' +
'            </div>' +

'            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">' +
'                <div class="section-card">' +
'                    <div class="section-card-header">' +
'                        <h3>Recent Reservations</h3>' +
'                        <button class="btn btn-primary btn-sm" onclick="switchTab(\'reservations\')">View All</button>' +
'                    </div>' +
'                    <div class="section-card-body">' +
'                        <div class="table-scroll">' +
'                            <table class="table-v2" id="recent-table">' +
'                                <thead><tr><th>Guest</th><th>Accommodation</th><th>Amount</th><th>Status</th></tr></thead>' +
'                                <tbody id="recent-bookings-list"><tr><td colspan="4"><div class="skeleton skeleton-text lg"></div></td></tr></tbody>' +
'                            </table>' +
'                        </div>' +
'                    </div>' +
'                </div>' +
'                <div class="section-card">' +
'                    <div class="section-card-header"><h3>Recent Activity</h3></div>' +
'                    <div class="section-card-body">' +
'                        <ul class="activity-list" id="activity-list"><li class="activity-item"><div class="skeleton skeleton-text lg"></div></li></ul>' +
'                    </div>' +
'                </div>' +
'            </div>' +
'        </div>' +

'        <!-- RESERVATIONS -->' +
'        <div class="tab-content" id="tab-reservations">' +
'            <div class="section-card">' +
'                <div class="section-card-header">' +
'                    <h3>All Reservations</h3>' +
'                    <div class="toolbar">' +
'                        <input type="text" id="res-search" placeholder="Search guest, room..." title="Search reservations">' +
'                        <select id="res-filter-status" title="Filter by status">' +
'                            <option value="">All Status</option>' +
'                            <option value="pending">Pending</option>' +
'                            <option value="confirmed">Confirmed</option>' +
'                            <option value="cancelled">Cancelled</option>' +
'                        </select>' +
'                        <button class="btn btn-primary btn-sm" onclick="loadAllBookings()"><i class="fas fa-sync-alt"></i> Refresh</button>' +
'                    </div>' +
'                </div>' +
'                <div class="section-card-body">' +
'                    <div class="table-scroll">' +
'                        <table class="table-v2">' +
'                            <thead><tr><th>Guest</th><th>Accommodation</th><th>Stay Period</th><th>Guests</th><th>Amount</th><th>Status</th><th class="actions">Actions</th></tr></thead>' +
'                            <tbody id="all-bookings-list"><tr><td colspan="7" class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading reservations...</p></td></tr></tbody>' +
'                        </table>' +
'                    </div>' +
'                    <div class="pagination" id="res-pagination"></div>' +
'                </div>' +
'            </div>' +
'        </div>' +

'        <!-- CUSTOMERS -->' +
'        <div class="tab-content" id="tab-customers">' +
'            <div class="section-card">' +
'                <div class="section-card-header">' +
'                    <h3>Customer Directory</h3>' +
'                    <div class="toolbar">' +
'                        <input type="text" id="cust-search" placeholder="Search customers..." title="Search customers">' +
'                        <button class="btn btn-primary btn-sm" onclick="loadCustomers()"><i class="fas fa-sync-alt"></i> Refresh</button>' +
'                    </div>' +
'                </div>' +
'                <div class="section-card-body">' +
'                    <div class="table-scroll">' +
'                        <table class="table-v2">' +
'                            <thead><tr><th>Customer</th><th>Contact</th><th>Total Bookings</th><th>Total Spent</th><th>Joined</th><th class="actions">Actions</th></tr></thead>' +
'                            <tbody id="customers-list"><tr><td colspan="6" class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading customers...</p></td></tr></tbody>' +
'                        </table>' +
'                    </div>' +
'                    <div class="pagination" id="cust-pagination"></div>' +
'                </div>' +
'            </div>' +
'        </div>' +

'        <!-- ROOMS -->' +
'        <div class="tab-content" id="tab-rooms">' +
'            <div class="section-card">' +
'                <div class="section-card-header">' +
'                    <h3>Accommodations</h3>' +
'                    <div class="toolbar">' +
'                        <button class="btn btn-success btn-sm" onclick="openRoomModal()"><i class="fas fa-plus"></i> Add Room</button>' +
'                        <button class="btn btn-primary btn-sm" onclick="loadRooms()"><i class="fas fa-sync-alt"></i> Refresh</button>' +
'                    </div>' +
'                </div>' +
'                <div class="section-card-body">' +
'                    <div class="table-scroll">' +
'                        <table class="table-v2">' +
'                            <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Price/Night</th><th>Status</th><th class="actions">Actions</th></tr></thead>' +
'                            <tbody id="rooms-list"><tr><td colspan="6" class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading rooms...</p></td></tr></tbody>' +
'                        </table>' +
'                    </div>' +
'                </div>' +
'            </div>' +
'        </div>' +

'        <!-- CALENDAR -->' +
'        <div class="tab-content" id="tab-calendar">' +
'            <div class="section-card">' +
'                <div class="section-card-header">' +
'                    <h3 id="cal-month-year">Booking Calendar</h3>' +
'                    <div class="toolbar">' +
'                        <button class="btn btn-outline btn-sm" onclick="changeMonth(-1)" title="Previous month"><i class="fas fa-chevron-left"></i></button>' +
'                        <button class="btn btn-outline btn-sm" onclick="changeMonth(1)" title="Next month"><i class="fas fa-chevron-right"></i></button>' +
'                        <button class="btn btn-primary btn-sm" onclick="renderCalendar()">Today</button>' +
'                    </div>' +
'                </div>' +
'                <div class="section-card-body">' +
'                    <div class="calendar-grid" id="calendar-grid"></div>' +
'                </div>' +
'            </div>' +
'        </div>' +

'        <!-- REPORTS -->' +
'        <div class="tab-content" id="tab-reports">' +
'            <div class="stats-grid-v2" id="report-stats"></div>' +
'            <div class="section-card">' +
'                <div class="section-card-header">' +
'                    <h3>Monthly Revenue Report</h3>' +
'                    <button class="btn btn-outline btn-sm" onclick="window.print()"><i class="fas fa-print"></i> Print</button>' +
'                </div>' +
'                <div class="section-card-body">' +
'                    <div class="chart-container" style="height: 350px;"><canvas id="reportChart"></canvas></div>' +
'                </div>' +
'            </div>' +
'        </div>' +

'        <!-- SETTINGS -->' +
'        <div class="tab-content" id="tab-settings">' +
'            <div class="section-card" style="max-width: 600px;">' +
'                <div class="section-card-header"><h3>Admin Settings</h3></div>' +
'                <div class="section-card-body">' +
'                    <div class="form-group">' +
'                        <label>Admin Name</label>' +
'                        <input type="text" class="form-control" value="System Admin" readonly>' +
'                    </div>' +
'                    <div class="form-group">' +
'                        <label>Email</label>' +
'                        <input type="email" class="form-control" value="admin@dangs.com" readonly>' +
'                    </div>' +
'                    <div class="form-group">' +
'                        <label>Notification Preferences</label>' +
'                        <label class="checkbox-container">Email alerts for new bookings' +
'                            <input type="checkbox" checked title="Enable new booking alerts">' +
'                            <span class="checkmark"></span>' +
'                        </label>' +
'                        <label class="checkbox-container">Email alerts for cancellations' +
'                            <input type="checkbox" checked title="Enable cancellation alerts">' +
'                            <span class="checkmark"></span>' +
'                        </label>' +
'                    </div>' +
'                    <button class="btn btn-primary" onclick="showToast(\'Settings saved successfully!\', \'success\')">Save Changes</button>' +
'                </div>' +
'            </div>' +
'        </div>' +
'    </main>' +

'    <!-- Reservation Modal -->' +
'    <div class="modal-overlay-v2" id="res-modal">' +
'        <div class="modal-v2">' +
'            <div class="modal-v2-header">' +
'                <h3>Reservation Details</h3>' +
'                <button class="modal-close-btn" onclick="closeModal(\'res-modal\')">&times;</button>' +
'            </div>' +
'            <div class="modal-v2-body" id="res-modal-body"></div>' +
'        </div>' +
'    </div>' +

'    <!-- Room Modal -->' +
'    <div class="modal-overlay-v2" id="room-modal">' +
'        <div class="modal-v2">' +
'            <div class="modal-v2-header">' +
'                <h3 id="room-modal-title">Add Room</h3>' +
'                <button class="modal-close-btn" onclick="closeModal(\'room-modal\')">&times;</button>' +
'            </div>' +
'            <div class="modal-v2-body">' +
'                <form id="room-form" onsubmit="saveRoom(event)">' +
'                    <input type="hidden" id="room-id">' +
'                    <div class="form-group">' +
'                        <label for="room-name">Room Name</label>' +
'                        <input type="text" id="room-name" class="form-control" required title="Room name">' +
'                    </div>' +
'                    <div class="form-group">' +
'                        <label for="room-desc">Description</label>' +
'                        <textarea id="room-desc" class="form-control" rows="2" title="Room description"></textarea>' +
'                    </div>' +
'                    <div class="form-group">' +
'                        <label for="room-price">Price per Night (P)</label>' +
'                        <input type="number" id="room-price" class="form-control" required title="Price per night">' +
'                    </div>' +
'                    <div class="form-group">' +
'                        <label for="room-status">Status</label>' +
'                        <select id="room-status" class="form-control" title="Room status">' +
'                            <option value="available">Available</option>' +
'                            <option value="unavailable">Unavailable</option>' +
'                        </select>' +
'                    </div>' +
'                    <div class="form-group">' +
'                        <label for="room-image">Image URL</label>' +
'                        <input type="text" id="room-image" class="form-control" placeholder="https://..." title="Image URL">' +
'                    </div>' +
'                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">' +
'                        <button type="button" class="btn btn-outline" onclick="closeModal(\'room-modal\')">Cancel</button>' +
'                        <button type="submit" class="btn btn-primary">Save Room</button>' +
'                    </div>' +
'                </form>' +
'            </div>' +
'        </div>' +
'    </div>' +

'    <script src="/js/admin_dashboard.js"></script>' +
'</body>' +
'</html>';

fs.writeFileSync('views/admin_dashboard.html', html);
console.log('HTML file written successfully');
