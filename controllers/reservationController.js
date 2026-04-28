const db = require('../config/db');

// Helper to calculate stats from rows
function calcStats(rows) {
    const totalBookings = rows.length;
    const totalRevenue = rows.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    const pending = rows.filter(b => b.status === 'pending').length;
    const confirmed = rows.filter(b => b.status === 'confirmed').length;
    const cancelled = rows.filter(b => b.status === 'cancelled').length;
    return { totalBookings, totalRevenue, pending, confirmed, cancelled };
}

exports.createReservation = async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const { 
        itemId, checkIn, checkOut, price, adults, children, 
        numRooms, roomType, bedPreference,
        extraBed, earlyCheckIn, lateCheckOut, foodPackage, specialRequests,
        fullname, email, mobile, address
    } = req.body;

    try {
        // Calculate total nights
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        const numNights = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
        
        // Calculate total price again on server for security
        let totalPrice = parseFloat(price) * numNights * (parseInt(numRooms) || 1);
        
        // Add extra bed cost (500 per night)
        if (extraBed === 'on' || extraBed === true || extraBed === 'true') totalPrice += 500 * numNights;
        
        // Add food package cost (1200 per person per night)
        const totalGuests = (parseInt(adults) || 0) + (parseInt(children) || 0);
        if (foodPackage === 'on' || foodPackage === true || foodPackage === 'true') {
            totalPrice += 1200 * totalGuests * numNights;
        }

        const result = await db.query(`
            INSERT INTO reservations (
                user_id, item_id, guest_fullname, guest_email, guest_mobile, guest_address,
                check_in, check_out, num_nights, 
                adults, children, total_guests, num_rooms, room_type, bed_preference,
                extra_bed, early_check_in, late_check_out, food_package,
                special_requests, total_price, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
            userId, itemId, fullname, email, mobile, address,
            checkIn, checkOut, numNights,
            adults, children || 0, totalGuests, numRooms, roomType, bedPreference,
            extraBed === 'on' || extraBed === true || extraBed === 'true', 
            earlyCheckIn === 'on' || earlyCheckIn === true || earlyCheckIn === 'true', 
            lateCheckOut === 'on' || lateCheckOut === true || lateCheckOut === 'true', 
            foodPackage === 'on' || foodPackage === true || foodPackage === 'true',
            specialRequests, totalPrice
        ]);

        console.log('Reservation created:', result);
        res.status(201).json({ message: 'Reservation created successfully' });
    } catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).json({ message: 'Error creating reservation', error: err.message });
    }
};

exports.getMyReservations = async (req, res) => {
    const userId = req.session.userId;
    try {
        const [rows] = await db.query(`
            SELECT r.*, i.name as item_name 
            FROM reservations r 
            JOIN items i ON r.item_id = i.id 
            WHERE r.user_id = ?`, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reservations' });
    }
};

exports.getAllReservations = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, i.name as item_name, u.fullname 
            FROM reservations r 
            JOIN items i ON r.item_id = i.id 
            JOIN users u ON r.user_id = u.id`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reservations' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating status' });
    }
};

exports.getReservationStats = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, i.name as item_name, u.fullname 
            FROM reservations r 
            JOIN items i ON r.item_id = i.id 
            JOIN users u ON r.user_id = u.id`);
        
        const stats = calcStats(rows);
        
        // Monthly revenue data for chart
        const monthlyRevenue = {};
        const monthlyBookings = {};
        rows.forEach(b => {
            const d = new Date(b.created_at || b.check_in);
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            monthlyRevenue[key] = (monthlyRevenue[key] || 0) + parseFloat(b.total_price || 0);
            monthlyBookings[key] = (monthlyBookings[key] || 0) + 1;
        });
        
        // Status distribution
        const statusDist = {
            pending: stats.pending,
            confirmed: stats.confirmed,
            cancelled: stats.cancelled
        };
        
        res.json({
            ...stats,
            monthlyRevenue,
            monthlyBookings,
            statusDist,
            recent: rows.slice(-5).reverse()
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
};

exports.getReservationById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT r.*, i.name as item_name, i.price as item_price, u.fullname, u.email as user_email 
            FROM reservations r 
            JOIN items i ON r.item_id = i.id 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Reservation not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reservation' });
    }
};

exports.deleteReservation = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM reservations WHERE id = ?', [id]);
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting reservation' });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.fullname, u.email, u.mobile, u.address, u.created_at,
                   COUNT(r.id) as total_bookings,
                   SUM(CASE WHEN r.status = 'confirmed' THEN r.total_price ELSE 0 END) as total_spent
            FROM users u
            LEFT JOIN reservations r ON u.id = r.user_id
            WHERE u.role = 'customer'
            GROUP BY u.id
            ORDER BY u.created_at DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching customers', error: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await db.query('SELECT id, fullname, email, mobile, address, created_at FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const [bookings] = await db.query(`
            SELECT r.*, i.name as item_name 
            FROM reservations r 
            JOIN items i ON r.item_id = i.id 
            WHERE r.user_id = ? ORDER BY r.created_at DESC`, [id]);
        res.json({ ...users[0], bookings });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching customer' });
    }
};
