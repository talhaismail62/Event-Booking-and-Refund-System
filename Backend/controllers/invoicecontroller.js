const db = require('../config/db');

exports.generateInvoice = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const bookingQuery = `
            SELECT b.slot, h.morningprice, h.eveningprice, pr.multiplier
            FROM bookings b
            JOIN halls h ON b.hall_id = h.id
            JOIN pricing_rules pr ON b.rule_id = pr.id
            WHERE b.id = $1;
        `;
        const bookingRes = await db.query(bookingQuery, [bookingId]);
        
        if (bookingRes.rowCount === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const booking = bookingRes.rows[0];

        const basePrice = booking.slot === 'morning' ? booking.morningprice : booking.eveningprice;
        const hallCost = basePrice * booking.multiplier;

        const servicesQuery = `
            SELECT COALESCE(SUM(s.price), 0) AS total_services
            FROM booking_services bs
            JOIN services s ON bs.service_id = s.id
            WHERE bs.booking_id = $1;
        `;
        const servicesRes = await db.query(servicesQuery, [bookingId]);
        const servicesCost = Number(servicesRes.rows[0].total_services);

        const foodQuery = `
            SELECT COALESCE(SUM(f.unit_price * bfi.quantity), 0) AS total_food
            FROM booking_food_items bfi
            JOIN food_items f ON bfi.food_item_id = f.id
            WHERE bfi.booking_id = $1;
        `;
        const foodRes = await db.query(foodQuery, [bookingId]);
        const foodCost = Number(foodRes.rows[0].total_food);

        const paidQuery = `
            SELECT COALESCE(SUM(amount), 0) AS total_paid
            FROM payments
            WHERE booking_id = $1 AND status = 'completed';
        `;
        const paidRes = await db.query(paidQuery, [bookingId]);
        const paidAmount = Number(paidRes.rows[0].total_paid);

        const subtotal = hallCost + servicesCost + foodCost;
        const taxAmount = subtotal * 0.10; 
        const totalAmount = subtotal + taxAmount;
        const balanceDue = totalAmount - paidAmount;

        const invoiceQuery = `
            INSERT INTO invoices (booking_id, subtotal, tax_amount, total_amount, paid_amount, balance_due)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (booking_id) 
            DO UPDATE SET 
                subtotal = EXCLUDED.subtotal,
                tax_amount = EXCLUDED.tax_amount,
                total_amount = EXCLUDED.total_amount,
                paid_amount = EXCLUDED.paid_amount,
                balance_due = EXCLUDED.balance_due
            RETURNING *;
        `;
        const invoiceRes = await db.query(invoiceQuery, [
            bookingId, subtotal, taxAmount, totalAmount, paidAmount, balanceDue
        ]);

        res.status(200).json({ 
            message: 'Invoice generated', 
            invoice: invoiceRes.rows[0] 
        });

    } catch (error) {
        console.error('Invoice Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
};

exports.getInvoice = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const query = 'SELECT * FROM invoices WHERE booking_id = $1;';
        const result = await db.query(query, [bookingId]);
        
        if (result.rowCount === 0) return res.status(404).json({ error: 'Invoice not found' });
        res.status(200).json({ invoice: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const query = `
            SELECT i.id as invoice_id, i.total_amount, i.balance_due, i.created_at,
                   b.event_date, u.name AS customer_name, u.contact
            FROM invoices i
            JOIN bookings b ON i.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            ORDER BY i.created_at DESC;
        `;
        const result = await db.query(query);
        
        res.status(200).json({ 
            count: result.rowCount, 
            invoices: result.rows 
        });
    } catch (error) {
        console.error('Fetch All Invoices Error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};