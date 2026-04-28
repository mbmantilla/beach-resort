CREATE DATABASE IF NOT EXISTS dangs_resort_db;
USE dangs_resort_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms/Cottages Table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('room', 'cottage') NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    status ENUM('available', 'unavailable') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Initial Admin Account (password: admin123)
-- In a real app, use the registration logic to hash this, but for setup:
INSERT INTO users (fullname, email, password, role) 
VALUES ('System Admin', 'admin@dangs.com', '$2y$10$fPyvT6v.K9jK9jK9jK9jK.K9jK9jK9jK9jK9jK9jK9jK9jK9jK9jK', 'admin');

-- Initial Data
INSERT INTO items (name, type, description, price, status) VALUES
('Deluxe Beachfront Room', 'room', 'A luxurious room with a sea view.', 2500.00, 'available'),
('Standard Garden Room', 'room', 'Comfortable room near the garden.', 1500.00, 'available'),
('Large Family Cottage', 'cottage', 'Spacious cottage for families.', 3500.00, 'available'),
('Small Couple Cottage', 'cottage', 'Cozy cottage for two.', 1200.00, 'available');
