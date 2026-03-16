const db = require('../config/db');

// 1. View All Refunds (Admin Dashboard)
exports.getAllRefunds = async (req, res) => {
    try {
        // We JOIN with bookings and users so the admin sees the actual customer's name and contact!
        const query = `
            SELECT r.id AS refund_id, r.refund_amount, r.status, r.cancellation_date, 
                   b.event_date, u.name AS customer_name, u.contact
            FROM refunds r
            JOIN bookings b ON r.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            ORDER BY r.status DESC, r.created_at DESC; 
        `;
        
        const result = await db.query(query);
        res.status(200).json({ count: result.rowCount, refunds: result.rows });
    } catch (error) {
        console.error('Fetch Refunds Error:', error);
        res.status(500).json({ error: 'Failed to fetch refunds.' });
    }
};

// 2. Process a Refund (Mark as Completed)
exports.processRefund = async (req, res) => {
    const { id: refund_id } = req.params;

    try {
        // Update the status ONLY if it is currently pending
        const updateQuery = `
            UPDATE refunds 
            SET status = 'completed' 
            WHERE id = $1 AND status = 'pending'
            RETURNING *;
        `;
        const result = await db.query(updateQuery, [refund_id]);

        if (result.rowCount === 0) {
            return res.status(400).json({ error: 'Refund not found or already processed.' });
        }

        res.status(200).json({ 
            message: 'Refund successfully marked as completed!', 
            refund: result.rows[0] 
        });
    } catch (error) {
        console.error('Process Refund Error:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
};