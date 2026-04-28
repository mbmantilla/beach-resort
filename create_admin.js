const db = require('./config/db');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        const fullname = 'System Admin';
        const email = 'admin@dangs.com';
        const password = 'admin123';
        const role = 'admin';

        // Check if admin already exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('ℹ️ Admin account already exists with email: ' + email);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query(
            'INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)',
            [fullname, email, hashedPassword, role]
        );

        console.log('✅ Admin account created successfully!');
        console.log('📧 Email: ' + email);
        console.log('🔑 Password: ' + password);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create admin account:', err.message);
        process.exit(1);
    }
};

createAdmin();
