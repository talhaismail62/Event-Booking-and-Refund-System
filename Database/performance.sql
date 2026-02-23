explain analyze select * from booking where user_id = 1;
-- before indexing full table scan and 0.062 secs and after indexing 0.00 sec

explain analyze select h.id, h.name from hall h join booking b on h.id = b.hall_id
where b.event_date = '2026-03-25' and b.slot = 'morning' and b.status != 'cancelled';

-- before indexing full table scan and 0.031 secs and after indexing 0.00 sec

explain analyze select b.id as booking_id, sum(p.amount) as total_paid, b.status as booking_status
from booking b left join payment p on b.id = p.booking_id left join refunds r on b.id = r.booking_id
group by b.id, b.status;

-- before indexing full table scan and 0.032 secs and after indexing 0.016 sec