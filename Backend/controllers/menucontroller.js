const db = require('../config/db');

exports.getAllServices = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM services ORDER BY id ASC;');
        res.status(200).json({ count: result.rowCount, services: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
};

exports.createService = async (req, res) => {
    const { name, price } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO services (name, price) VALUES ($1, $2) RETURNING *;',
            [name, price]
        );
        res.status(201).json({ message: 'Service added!', service: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create service' });
    }
};

exports.updateService = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    try {
        const result = await db.query(
            'UPDATE services SET name = COALESCE($1, name), price = COALESCE($2, price) WHERE id = $3 RETURNING *;',
            [name, price, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Service not found.' });
        res.status(200).json({ message: 'Service updated!', service: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update service' });
    }
};

exports.getAllFoodItems = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM food_items ORDER BY id ASC;');
        res.status(200).json({ count: result.rowCount, food: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch food items' });
    }
};

exports.createFoodItem = async (req, res) => {
    const { name, unit_price } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO food_items (name, unit_price) VALUES ($1, $2) RETURNING *;',
            [name, unit_price]
        );
        res.status(201).json({ message: 'Food item added!', food: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create food item' });
    }
};

exports.updateFoodItem = async (req, res) => {
    const { id } = req.params;
    const { name, unit_price } = req.body;
    try {
        const result = await db.query(
            'UPDATE food_items SET name = COALESCE($1, name), unit_price = COALESCE($2, unit_price) WHERE id = $3 RETURNING *;',
            [name, unit_price, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Food item not found.' });
        res.status(200).json({ message: 'Food item updated!', food: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update food item' });
    }
};