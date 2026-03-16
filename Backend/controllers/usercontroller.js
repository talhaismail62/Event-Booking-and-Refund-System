const db = require('../config/db');

exports.getProfile = async (req, res) => {
    const userId = req.user.id; 

    try {
        const query = `
            SELECT id, name, email, contact, role 
            FROM users 
            WHERE id = $1;
        `;
        const result = await db.query(query, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ profile: result.rows[0] });
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, contact } = req.body;

    try {
        const query = `
            UPDATE users 
            SET name = COALESCE($1, name), 
                contact = COALESCE($2, contact)
            WHERE id = $3 
            RETURNING id, name, email, contact, role;
        `;
        const result = await db.query(query, [name, contact, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ 
            message: 'Profile updated successfully!', 
            profile: result.rows[0] 
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
};