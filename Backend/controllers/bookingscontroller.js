const db = require('../config/db');

exports.createBooking = async (req, res) => {
    const user_id = req.user.id;
    
    const { hall_id, event_date, slot, num_of_ppl, rule_id, services, food_items } = req.body;

    const client = await db.connect(); 

    try {
        const checkQuery = `
            SELECT id, status, expires_at 
            FROM bookings 
            WHERE hall_id = $1 AND event_date = $2 AND slot = $3
        `;
        const existing = await client.query(checkQuery, [hall_id, event_date, slot]);

        if (existing.rows.length > 0) {
            const currentBooking = existing.rows[0];
            const now = new Date();

            if (currentBooking.status === 'pending' && currentBooking.expires_at > now) {
                return res.status(400).json({ error: 'This hall is currently reserved and awaiting payment.' });
            }
            
            if (currentBooking.status === 'confirmed') {
                return res.status(400).json({ error: 'This hall is already booked for this date and slot.' });
            }

            await client.query('DELETE FROM bookings WHERE id = $1', [currentBooking.id]);
        }

        await client.query('BEGIN'); 

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const insertBookingQuery = `
            INSERT INTO bookings (user_id, hall_id, event_date, slot, num_of_ppl, rule_id, status, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
            RETURNING id;
        `;
        const bookingResult = await client.query(insertBookingQuery, [
            user_id, hall_id, event_date, slot, num_of_ppl, rule_id, expiresAt
        ]);
        
        const newBookingId = bookingResult.rows[0].id;

        if (services && services.length > 0) {
            for (let service_id of services) {
                await client.query(
                    'INSERT INTO booking_services (booking_id, service_id) VALUES ($1, $2)',
                    [newBookingId, service_id]
                );
            }
        }

        if (food_items && food_items.length > 0) {
            for (let item of food_items) {
                await client.query(
                    'INSERT INTO booking_food_items (booking_id, food_item_id, quantity) VALUES ($1, $2, $3)',
                    [newBookingId, item.id, item.quantity]
                );
            }
        }

        await client.query('COMMIT'); 

        res.status(201).json({ 
            message: 'Booking drafted successfully! You have 24 hours to pay the advance.',
            booking_id: newBookingId,
            expires_at: expiresAt
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Transaction Error:', error);
        res.status(500).json({ error: 'An error occurred while creating the booking.' });
    } finally {
        client.release(); 
    }
};

exports.getMyBookings = async (req, res) => {
    const user_id = req.user.id;

    try {
        // SQL WIZARD FIX: Automatically calculating total_amount based on the slot!
        const query = `
            SELECT 
                b.id AS booking_id, 
                h.name AS hall_name, 
                b.event_date, 
                b.slot, 
                b.status, 
                b.expires_at,
                CASE 
                    WHEN b.slot = 'morning' THEN h.morningprice
                    WHEN b.slot = 'evening' THEN h.eveningprice
                    ELSE 0
                END AS total_amount
            FROM bookings b
            JOIN halls h ON b.hall_id = h.id
            WHERE b.user_id = $1
            ORDER BY b.event_date DESC;
        `;
        
        const result = await db.query(query, [user_id]);
        
        res.status(200).json({
            count: result.rowCount,
            bookings: result.rows
        });

    } catch (error) {
        console.error('Fetch Bookings Error:', error);
        res.status(500).json({ error: 'Failed to fetch your bookings.' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const query = 'SELECT * FROM booking_overview ORDER BY event_date DESC;';
        const result = await db.query(query);

        res.status(200).json({
            count: result.rowCount,
            bookings: result.rows
        });
    } catch (error) {
        console.error('Fetch All Bookings Error:', error);
        res.status(500).json({ error: 'Failed to fetch system bookings.' });
    }
};

exports.payForBooking = async (req, res) => {
    const user_id = req.user.id;
    const { id: booking_id } = req.params; 
    const { amount, payment_type, payment_method } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const checkQuery = `SELECT status FROM bookings WHERE id = $1 AND user_id = $2 FOR UPDATE;`;
        const bookingResult = await client.query(checkQuery, [booking_id, user_id]);

        if (bookingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Booking not found/access denied' });
        }

        if (bookingResult.rows[0].status !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Either confirmed or cancelled' });
        }

        const insertPaymentQuery = `
            INSERT INTO payments (booking_id, user_id, amount, payment_type, payment_method, status)
            VALUES ($1, $2, $3, $4, $5, 'completed') RETURNING id;
        `;
        await client.query(insertPaymentQuery, [
            booking_id, user_id, amount, payment_type || 'advance', payment_method || 'card'
        ]);

        await client.query(`UPDATE bookings SET status = 'confirmed' WHERE id = $1;`, [booking_id]);

        await client.query('COMMIT');
        
        res.status(200).json({ message: 'Payment successful' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Payment Transaction Error:', error);
        res.status(500).json({ error: 'Payment failed' });
    } finally {
        client.release();
    }
};

exports.cancelBooking = async (req, res) => {
    const user_id = req.user.id;
    const { id: booking_id } = req.params;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const bookingQuery = `
            SELECT b.status, b.event_date, COALESCE(SUM(p.amount), 0) as total_paid
            FROM bookings b
            LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
            WHERE b.id = $1 AND b.user_id = $2
            GROUP BY b.id;
        `;
        const result = await client.query(bookingQuery, [booking_id, user_id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = result.rows[0];
        if (booking.status === 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }

        const eventDate = new Date(booking.event_date);
        const today = new Date();
        const diffTime = eventDate - today;
        const daysBefore = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let refundPercent = 0;
        if (daysBefore >= 7) {
            refundPercent = 100;
        } else if (daysBefore >= 3) {
            refundPercent = 50;
        }

        const refundAmount = (booking.total_paid * refundPercent) / 100;

        await client.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [booking_id]);

        if (refundAmount > 0) {
            const refundQuery = `
                INSERT INTO refunds (booking_id, days_before_event, refund_percent, refund_amount, status)
                VALUES ($1, $2, $3, $4, 'pending')
            `;
            await client.query(refundQuery, [booking_id, daysBefore, refundPercent, refundAmount]);
        }

        await client.query('COMMIT');
        
        res.status(200).json({ 
            message: 'Booking cancelled', 
            days_before_event: daysBefore,
            refund_percent: refundPercent,
            refund_amount: refundAmount
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Cancellation Error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    } finally {
        client.release();
    }
};