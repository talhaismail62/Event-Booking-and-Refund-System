
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    dob DATE,
    contact VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'staff', 'admin')) 
);

CREATE TABLE halls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    capacity INT CHECK (capacity > 0),
    morningprice INT CHECK (morningprice > 0),
    eveningprice INT CHECK (eveningprice > 0)
);

CREATE TABLE pricing_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    multiplier FLOAT NOT NULL
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    hall_id INT NOT NULL REFERENCES halls(id),
    event_date DATE NOT NULL,
    slot VARCHAR(10) NOT NULL CHECK (slot IN ('morning', 'evening')),
    num_of_ppl INT CHECK (num_of_ppl > 0),
    status VARCHAR(50) DEFAULT 'pending',
    rule_id INT NOT NULL REFERENCES pricing_rules(id),
    UNIQUE (hall_id, event_date, slot)
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    price INT NOT NULL
);

CREATE TABLE booking_services (
    booking_id INT NOT NULL REFERENCES bookings(id),
    service_id INT NOT NULL REFERENCES services(id),
    PRIMARY KEY (booking_id, service_id)
);

CREATE TABLE food_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    unit_price INT NOT NULL
);

CREATE TABLE booking_food_items (
    booking_id INT NOT NULL REFERENCES bookings(id),
    food_item_id INT NOT NULL REFERENCES food_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (booking_id, food_item_id)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id),
    user_id INT NOT NULL REFERENCES users(id),
    amount INT NOT NULL CHECK (amount > 0),
    payment_type VARCHAR(50) DEFAULT 'full',
    payment_method VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(50) DEFAULT 'pending',
    payment_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE REFERENCES bookings(id),
    invoice_date DATE DEFAULT CURRENT_DATE,
    subtotal INT NOT NULL,
    tax_amount INT DEFAULT 0,
    total_amount INT NOT NULL,
    paid_amount INT DEFAULT 0,
    balance_due INT NOT NULL
);

CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE REFERENCES bookings(id),
    cancellation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    days_before_event INT,
    refund_percent INT CHECK (refund_percent >= 0 AND refund_percent <= 100),
    refund_amount INT,
    status VARCHAR(100) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW booking_overview AS
SELECT b.id AS booking_id,
       u.name AS user_name,
       h.name AS hall_name,
       b.event_date AS event_date,
       b.slot AS time_slot,
       b.num_of_ppl AS number_of_people,
       b.status AS booking_status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN halls h ON b.hall_id = h.id;

CREATE OR REPLACE VIEW pending_payments AS
SELECT p.id AS payment_id,
       u.name AS user_name,
       h.name AS hall_name,
       b.event_date AS event_date,
       p.amount AS payment_amount,
       p.status AS payment_status
FROM payments p
JOIN users u ON p.user_id = u.id
JOIN bookings b ON p.booking_id = b.id
JOIN halls h ON b.hall_id = h.id
WHERE p.status = 'pending';

CREATE OR REPLACE FUNCTION set_payment_date_func()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_date IS NULL THEN
        NEW.payment_date = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_date
BEFORE INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION set_payment_date_func();

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date_slot ON bookings(event_date, slot);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_refunds_booking ON refunds(booking_id);