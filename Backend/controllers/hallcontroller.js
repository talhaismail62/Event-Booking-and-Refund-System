const pool = require('../config/db');

// @route   GET /api/v1/halls
exports.getAllHalls = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM halls');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching halls' });
    }
};