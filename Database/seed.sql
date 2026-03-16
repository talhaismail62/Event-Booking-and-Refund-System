-- 1. Insert Users
INSERT INTO users (id, name, email, password_hash, dob, contact, role) VALUES
(1, 'ali ahmed', 'ali@example.com', 'hashed_pw_1', '1985-07-25', '03001234567', 'customer'),
(2, 'mahmood khan', 'mahmood@example.com', 'hashed_pw_2', '1990-05-15', '03007654321', 'staff'),
(3, 'sarah iqbal', 'sarah@example.com', 'hashed_pw_3', '1992-09-10', '03103456789', 'customer'),
(4, 'hassan tariq', 'hassan@example.com', 'hashed_pw_4', '1987-02-02', '03209876543', 'admin'),
(5, 'zubair malik', 'zubair@example.com', 'hashed_pw_5', '1989-11-12', '03014455667', 'customer'),
(6, 'aisha akhtar', 'aisha@example.com', 'hashed_pw_6', '1993-04-01', '03119876543', 'staff'),
(7, 'umar raza', 'umar@example.com', 'hashed_pw_7', '1991-08-20', '03212233445', 'admin'),
(8, 'nashit khan', 'nashit@example.com', 'hashed_pw_8', '1988-03-18', '03017788999', 'customer'),
(9, 'sana javed', 'sana@example.com', 'hashed_pw_9', '1995-12-05', '03127778899', 'customer'),
(10, 'faizan ali', 'faizan@example.com', 'hashed_pw_10', '1994-06-17', '03018889977', 'staff');

-- 2. Insert Halls
INSERT INTO halls (id, name, capacity, morningprice, eveningprice) VALUES
(1, 'royal hall', 250, 5000, 7000),
(2, 'sunset hall', 180, 4000, 6000),
(3, 'grand banquet', 500, 8000, 10000),
(4, 'city view hall', 150, 3500, 5500),
(5, 'luxury ballroom', 300, 7500, 9500);

-- 3. Insert Pricing Rules
INSERT INTO pricing_rules (id, name, multiplier) VALUES
(1, 'weekend', 1.2),
(2, 'holiday', 1.5),
(3, 'regular', 1.0),
(4, 'festival', 1.3),
(5, 'off-season', 0.8);

-- 4. Insert Bookings
INSERT INTO bookings (id, user_id, hall_id, event_date, slot, num_of_ppl, status, rule_id) VALUES
(1, 1, 1, '2026-03-25', 'morning', 200, 'pending', 1),
(2, 2, 2, '2026-04-10', 'evening', 150, 'pending', 3),
(3, 3, 3, '2026-05-05', 'morning', 300, 'pending', 2),
(4, 4, 4, '2026-06-15', 'evening', 180, 'pending', 1),
(5, 5, 5, '2026-07-20', 'morning', 250, 'pending', 4);

-- 5. Insert Services & Junctions
INSERT INTO services (id, name, price) VALUES
(1, 'photography', 5000),
(2, 'dj', 7000),
(3, 'stage decoration', 10000);

INSERT INTO booking_services (booking_id, service_id) VALUES
(1, 1), (1, 3), (2, 2), (3, 1), (4, 3);

-- 6. Insert Food Items (Master List)
INSERT INTO food_items (id, name, unit_price) VALUES
(1, 'chicken curry', 800),
(2, 'mutton kebab', 1200),
(3, 'veggie platter', 500),
(4, 'beef steak', 1500),
(5, 'pasta', 700);

-- 7. Insert Booking Food Items (Junction)
INSERT INTO booking_food_items (booking_id, food_item_id, quantity) VALUES
(1, 1, 5), (1, 2, 4), 
(2, 3, 6), (2, 4, 3), 
(3, 5, 8), (3, 1, 6);

-- 8. Insert Payments
INSERT INTO payments (id, booking_id, user_id, amount, payment_type, payment_method, status, payment_date) VALUES
(1, 1, 1, 10000, 'advance', 'card', 'completed', '2026-03-20'),
(2, 2, 2, 9000, 'full', 'cash', 'pending', '2026-04-08'),
(3, 3, 3, 15000, 'installment', 'bank_transfer', 'completed', '2026-05-03');

-- 9. Insert Invoices
INSERT INTO invoices (id, booking_id, invoice_date, subtotal, tax_amount, total_amount, paid_amount, balance_due) VALUES
(1, 1, '2026-03-21', 10000, 500, 10500, 10000, 500),
(2, 2, '2026-04-09', 9000, 450, 9450, 0, 9450),
(3, 3, '2026-05-04', 15000, 750, 15750, 15000, 750);

-- 10. Insert Refunds (Example data for cancelled bookings)
INSERT INTO refunds (id, booking_id, cancellation_date, days_before_event, refund_percent, refund_amount, status) VALUES
(1, 4, '2026-06-01', 14, 50, 6500, 'pending'),
(2, 5, '2026-06-20', 30, 90, 12600, 'processed');