const db = require('../config/db');

exports.getAllItems = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM items WHERE status = 'available'");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching items', error: err.message });
    }
};

exports.getAllItemsAdmin = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM items ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching items', error: err.message });
    }
};

exports.getItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching item', error: err.message });
    }
};

exports.createItem = async (req, res) => {
    const { name, description, price, status, image_url } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO items (name, description, price, status, image_url) VALUES (?, ?, ?, ?, ?)",
            [name, description, price, status || 'available', image_url || null]
        );
        res.status(201).json({ message: 'Item created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Error creating item', error: err.message });
    }
};

exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, status, image_url } = req.body;
    try {
        await db.query(
            "UPDATE items SET name = ?, description = ?, price = ?, status = ?, image_url = ? WHERE id = ?",
            [name, description, price, status, image_url, id]
        );
        res.json({ message: 'Item updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating item', error: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM items WHERE id = ?", [id]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting item', error: err.message });
    }
};
