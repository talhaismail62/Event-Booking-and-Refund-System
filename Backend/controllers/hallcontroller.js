const db = require('../config/db');

exports.getAllHalls = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM halls ORDER BY id ASC;');
        res.status(200).json({ count: result.rowCount, halls: result.rows });
    } catch (error) {
        console.error('Fetch Halls Error:', error);
        res.status(500).json({ error: 'Failed to fetch halls' });
    }
};

exports.createHall = async (req, res) => {
    const { name, capacity, morningprice, eveningprice } = req.body;

    try {
        const query = `
            INSERT INTO halls (name, capacity, morningprice, eveningprice)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const result = await db.query(query, [name, capacity, morningprice, eveningprice]);
        
        res.status(201).json({ message: 'Hall created', hall: result.rows[0] });
    } catch (error) {
        console.error('Create Hall Error:', error);
        res.status(500).json({ error: 'Failed to create hall' });
    }
};

exports.updateHall = async (req, res) => {
    const { id } = req.params;
    const { name, capacity, morningprice, eveningprice } = req.body;

    try {
        const query = `
            UPDATE halls 
            SET name = COALESCE($1, name), 
                capacity = COALESCE($2, capacity), 
                morningprice = COALESCE($3, morningprice), 
                eveningprice = COALESCE($4, eveningprice)
            WHERE id = $5 RETURNING *;
        `;
        const result = await db.query(query, [name, capacity, morningprice, eveningprice, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Hall not found' });
        }

        res.status(200).json({ message: 'Hall updated', hall: result.rows[0] });
    } catch (error) {
        console.error('Update Hall Error:', error);
        res.status(500).json({ error: 'Failed to update hall' });
    }
};