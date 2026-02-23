create database eventbooking;
use eventbooking;

create table user (
    id int primary key not null,
    name varchar(100),
    dob date,
    contact varchar(100),
    position varchar(50) not null
);

create table hall (
    id int primary key not null,
    name varchar(50),
    capacity int,
    morningprice int check (morningprice > 0),
    eveningprice int check (eveningprice > 0),
    morningstatus boolean default false,
    eveningstatus boolean default false
);

create table pricing_rule (
    id int primary key not null,
    name varchar(50),
    multiplier float not null
);

create table booking (
    id int primary key not null,
    user_id int not null,
    hall_id int not null,
    event_date date not null,
    slot varchar(10) not null,
    num_of_ppl int check (num_of_ppl > 0),
    status varchar(50) default 'pending',
    rule int not null,
    foreign key (user_id) references user(id),
    foreign key (hall_id) references hall(id),
    foreign key (rule) references pricing_rule(id)
);

create table food_items (
    id int primary key not null,
    item_name varchar(100),
    cost int,
    quantity int,
    booking_id int not null,
    foreign key (booking_id) references booking(id)
);

create table payment (
    id int primary key not null,
    name varchar(50),
    amount int not null,
    status varchar(50) default 'pending',
    payment_date date,
    user_id int not null,
    booking_id int not null,
    foreign key (user_id) references user(id),
    foreign key (booking_id) references booking(id)
);

create table service (
    id int primary key not null,
    name varchar(100) unique,
    price int not null
);

create table invoice (
    id int primary key not null,
    name varchar(50),
    amount int not null,
    invoice_date date,
    booking_id int not null,
    foreign key (booking_id) references booking(id)
);

create table refunds (
    id int primary key not null,
    status varchar(100) default 'pending',
    booking_date date not null,
    created_at timestamp default current_timestamp,
    booking_id int not null,
    foreign key (booking_id) references booking(id)
);

create view booking_overview as
select b.id as booking_id, u.name as user_name, h.name as hall_name, b.event_date as event_date, b.slot as time_slot, b.num_of_ppl as number_of_people, b.status as booking_status
from booking b join user u on b.user_id = u.id join hall h on b.hall_id = h.id;

create view pending_payments as select p.id as payment_id, u.name as user_name, h.name as hall_name, b.event_date as event_date, p.amount as payment_amount, p.status as payment_status
from payment p join user u on p.user_id = u.id join booking b on p.booking_id = b.id join hall h on b.hall_id = h.id
where p.status = 'pending';

delimiter $$

create trigger set_payment_date before insert on payment for each row begin
if new.payment_date is null then set new.payment_date = current_date;
end if;
end $$

delimiter ;

delimiter $$

create trigger update_availability after update on booking for each row begin
if old.status != 'cancelled' and new.status = 'cancelled' then
if new.slot = 'morning' then update hall set morningstatus = true where id = new.hall_id;
elseif new.slot = 'evening' then update hall set eveningstatus = true where id = new.hall_id;
end if;
end if;
end $$

delimiter ;

create index bookingusers on booking(user_id);
create index bookingslots on booking(event_date, slot);
create index bookingpayments on payment(booking_id);
create index bookingrefunds on refunds(booking_id);