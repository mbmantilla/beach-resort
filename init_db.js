const db = require('./config/db');

const createTables = async () => {
    try {
        console.log('🚀 Starting Database Initialization...');

        // Drop tables in correct order for foreign keys
        await db.query('DROP TABLE IF EXISTS reservations');
        await db.query('DROP TABLE IF EXISTS items');
        await db.query('DROP TABLE IF EXISTS users');

        // 1. Users Table
        await db.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                mobile VARCHAR(20),
                address TEXT,
                role ENUM('customer', 'admin') DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table ready');

        // 2. Items (Accommodations) Table
        await db.query(`
            CREATE TABLE items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100),
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Items table ready');

        // 3. Reservations Table
        await db.query('DROP TABLE IF EXISTS reservations');
        await db.query(`
            CREATE TABLE reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                item_id INT,
                guest_fullname VARCHAR(255),
                guest_email VARCHAR(255),
                guest_mobile VARCHAR(20),
                guest_address TEXT,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                num_nights INT,
                adults INT DEFAULT 1,
                children INT DEFAULT 0,
                total_guests INT,
                num_rooms INT DEFAULT 1,
                room_type VARCHAR(100),
                bed_preference ENUM('Single', 'Double', 'Queen', 'King') DEFAULT 'Double',
                extra_bed BOOLEAN DEFAULT FALSE,
                early_check_in BOOLEAN DEFAULT FALSE,
                late_check_out BOOLEAN DEFAULT FALSE,
                food_package BOOLEAN DEFAULT FALSE,
                special_requests TEXT,
                total_price DECIMAL(10, 2) NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Reservations table updated');

        // 4. Seed Admin User (Optional - check if exists)
        const [admins] = await db.query("SELECT * FROM users WHERE role = 'admin'");
        if (admins.length === 0) {
            console.log('ℹ️ No admin found. You should register an account and manually set its role to "admin" in the database.');
        }

        // 5. Seed Sample Items (Optional - check if empty)
        const [items] = await db.query('SELECT * FROM items');
        if (items.length === 0) {
            await db.query(`
                INSERT INTO items (name, type, description, price, status) VALUES 
                ('Beachfront Villa', 'Luxury', 'Private villa with a stunning view of the ocean.', 5000.00, 'available'),
                ('Family Suite', 'Standard', 'Spacious room perfect for families of four.', 3500.00, 'available'),
                ('Sunset Cabin', 'Cozy', 'A romantic getaway spot for couples.', 2500.00, 'available')
            `);
            console.log('🌱 Seeded sample items');
        }

        console.log('✨ Database Initialization Complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Initialization Failed:', err.message);
        process.exit(1);
    }
};

createTables();
