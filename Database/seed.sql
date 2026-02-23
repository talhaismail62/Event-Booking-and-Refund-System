insert into user (id, name, dob, contact, position) values
(1, 'ali ahmed', '1985-07-25', '03001234567', 'customer'),
(2, 'mahmood khan', '1990-05-15', '03007654321', 'staff'),
(3, 'sarah iqbal', '1992-09-10', '03103456789', 'customer'),
(4, 'hassan tariq', '1987-02-02', '03209876543', 'admin'),
(5, 'zubair malik', '1989-11-12', '03014455667', 'customer'),
(6, 'aisha akhtar', '1993-04-01', '03119876543', 'staff'),
(7, 'umar raza', '1991-08-20', '03212233445', 'admin'),
(8, 'nashit khan', '1988-03-18', '03017788999', 'customer'),
(9, 'sana javed', '1995-12-05', '03127778899', 'customer'),
(10, 'faizan ali', '1994-06-17', '03018889977', 'staff');

insert into hall (id, name, capacity, morningprice, eveningprice, morningstatus, eveningstatus) values
(1, 'royal hall', 250, 5000, 7000, false, false),
(2, 'sunset hall', 180, 4000, 6000, false, false),
(3, 'grand banquet', 500, 8000, 10000, false, false),
(4, 'city view hall', 150, 3500, 5500, false, false),
(5, 'luxury ballroom', 300, 7500, 9500, false, false);

insert into pricing_rule (id, name, multiplier) values
(1, 'weekend', 1.2),
(2, 'holiday', 1.5),
(3, 'regular', 1.0),
(4, 'festival', 1.3),
(5, 'off-season', 0.8);

insert into booking (id, user_id, hall_id, event_date, slot, num_of_ppl, status, rule) values
(1, 1, 1, '2026-03-25', 'morning', 200, 'pending', 1),
(2, 2, 2, '2026-04-10', 'evening', 150, 'pending', 3),
(3, 3, 3, '2026-05-05', 'morning', 300, 'pending', 2),
(4, 4, 4, '2026-06-15', 'evening', 180, 'pending', 1),
(5, 5, 5, '2026-07-20', 'morning', 250, 'pending', 4),
(6, 6, 1, '2026-08-05', 'evening', 220, 'pending', 3),
(7, 7, 2, '2026-09-12', 'morning', 160, 'pending', 5),
(8, 8, 3, '2026-10-25', 'evening', 190, 'pending', 2),
(9, 9, 4, '2026-11-18', 'morning', 210, 'pending', 1),
(10, 10, 5, '2026-12-15', 'evening', 230, 'pending', 3);

insert into food_items (id, item_name, cost, quantity, booking_id) values
(1, 'chicken curry', 800, 5, 1),
(2, 'mutton kebab', 1200, 4, 1),
(3, 'veggie platter', 500, 6, 2),
(4, 'beef steak', 1500, 3, 2),
(5, 'pasta', 700, 8, 3),
(6, 'spring rolls', 400, 6, 3),
(7, 'chicken biryani', 1000, 4, 4),
(8, 'fish fry', 1200, 3, 4),
(9, 'fruit salad', 500, 10, 5),
(10, 'samosa', 200, 12, 5),
(11, 'fried rice', 600, 5, 6),
(12, 'vegetable soup', 300, 7, 6),
(13, 'kebabs', 1100, 4, 7),
(14, 'mash potatoes', 600, 6, 7),
(15, 'rogan josh', 1500, 3, 8),
(16, 'naan', 100, 12, 8),
(17, 'chicken shawarma', 1300, 5, 9),
(18, 'hummus', 350, 10, 9),
(19, 'pulao', 700, 6, 10),
(20, 'lamb chops', 1800, 4, 10);

insert into payment (id, name, amount, status, payment_date, user_id, booking_id) values
(1, 'payment_1', 10000, 'completed', '2026-03-20', 1, 1),
(2, 'payment_2', 9000, 'pending', '2026-04-08', 2, 2),
(3, 'payment_3', 15000, 'completed', '2026-05-03', 3, 3),
(4, 'payment_4', 11000, 'pending', '2026-06-12', 4, 4),
(5, 'payment_5', 12000, 'completed', '2026-07-15', 5, 5),
(6, 'payment_6', 13000, 'completed', '2026-08-01', 6, 6),
(7, 'payment_7', 8000, 'pending', '2026-09-10', 7, 7),
(8, 'payment_8', 9500, 'completed', '2026-10-20', 8, 8),
(9, 'payment_9', 10500, 'pending', '2026-11-10', 9, 9),
(10, 'payment_10', 11500, 'completed', '2026-12-12', 10, 10);

insert into service (id, name, price) values
(1, 'photography', 5000),
(2, 'dj', 7000);

insert into invoice (id, name, amount, invoice_date, booking_id) values
(1, 'invoice_1', 12000, '2026-03-21', 1),
(2, 'invoice_2', 11000, '2026-04-09', 2),
(3, 'invoice_3', 17000, '2026-05-04', 3),
(4, 'invoice_4', 13000, '2026-06-13', 4),
(5, 'invoice_5', 14000, '2026-07-16', 5);

insert into refunds (id, status, booking_date, created_at, booking_id) values
(1, 'pending', '2026-03-25', '2026-03-20', 1),
(2, 'pending', '2026-04-10', '2026-04-08', 2),
(3, 'pending', '2026-05-05', '2026-05-03', 3),
(4, 'pending', '2026-06-15', '2026-06-12', 4),
(5, 'pending', '2026-07-20', '2026-07-15', 5);