-- ==========================================
-- Hotel Management System - 10 Required Queries
-- DBMS Project queries
-- ==========================================

USE hotel_management;

-- ------------------------------------------
-- Query 1: Retrieve all guests.
-- ------------------------------------------
SELECT * FROM Guest;


-- ------------------------------------------
-- Query 2: Display rooms of a specific room type (e.g., 'Deluxe').
-- ------------------------------------------
SELECT * FROM Room 
WHERE room_type = 'Deluxe';


-- ------------------------------------------
-- Query 3: Display booking and guest details (2-table INNER JOIN).
-- ------------------------------------------
SELECT 
    b.booking_id, 
    g.guest_id, 
    g.name AS guest_name, 
    g.phone, 
    b.room_id, 
    b.check_in_date, 
    b.check_out_date
FROM Booking b
INNER JOIN Guest g ON b.guest_id = g.guest_id;


-- ------------------------------------------
-- Query 4: Display booking, guest, and room details (3-table JOIN).
-- ------------------------------------------
SELECT 
    b.booking_id, 
    g.name AS guest_name, 
    r.room_id, 
    r.room_type, 
    r.price_per_day,
    b.check_in_date, 
    b.check_out_date
FROM Booking b
INNER JOIN Guest g ON b.guest_id = g.guest_id
INNER JOIN Room r ON b.room_id = r.room_id;


-- ------------------------------------------
-- Query 5: Count number of rooms per room type (GROUP BY).
-- ------------------------------------------
SELECT 
    room_type, 
    COUNT(*) AS number_of_rooms
FROM Room
GROUP BY room_type;


-- ------------------------------------------
-- Query 6: Display room types having more than 20 rooms (HAVING).
-- ------------------------------------------
SELECT 
    room_type, 
    COUNT(*) AS number_of_rooms
FROM Room
GROUP BY room_type
HAVING COUNT(*) > 20;


-- ------------------------------------------
-- Query 7: Retrieve guests whose total payment amount is greater than the average payment amount (Subquery).
-- Explanation: We find guests whose sum of payments is higher than the average total payment amount of all guests.
-- ------------------------------------------
SELECT 
    g.guest_id, 
    g.name, 
    SUM(p.amount) AS total_payment
FROM Guest g
INNER JOIN Booking b ON g.guest_id = b.guest_id
INNER JOIN Payment p ON b.booking_id = p.booking_id
GROUP BY g.guest_id, g.name
HAVING SUM(p.amount) > (
    SELECT AVG(total_guest_paid)
    FROM (
        SELECT SUM(pay.amount) AS total_guest_paid
        FROM Payment pay
        INNER JOIN Booking bk ON pay.booking_id = bk.booking_id
        GROUP BY bk.guest_id
    ) AS AveragePayments
);


-- ------------------------------------------
-- Query 8: Retrieve guests who made more bookings than a specific guest (Correlated Subquery).
-- Explanation: We use a correlated subquery in the HAVING/WHERE clause to compare each guest's booking count
-- with the booking count of a specific guest (e.g., Guest ID = 2, 'Aditya Patel', who has 1 booking).
-- ------------------------------------------
SELECT 
    g.guest_id, 
    g.name, 
    (SELECT COUNT(*) FROM Booking b1 WHERE b1.guest_id = g.guest_id) AS total_bookings
FROM Guest g
WHERE 
    (SELECT COUNT(*) FROM Booking b1 WHERE b1.guest_id = g.guest_id) > 
    (SELECT COUNT(*) FROM Booking b2 WHERE b2.guest_id = 2); -- specific guest_id = 2


-- ------------------------------------------
-- Query 9: Display all rooms including those not booked (LEFT JOIN).
-- ------------------------------------------
SELECT 
    r.room_id, 
    r.room_type, 
    r.price_per_day, 
    r.status,
    b.booking_id,
    b.check_in_date,
    b.check_out_date
FROM Room r
LEFT JOIN Booking b ON r.room_id = b.room_id;


-- ------------------------------------------
-- Query 10: Retrieve services that were never used in any booking (NOT EXISTS).
-- ------------------------------------------
SELECT 
    s.service_id, 
    s.service_name, 
    s.service_charge
FROM Service s
WHERE NOT EXISTS (
    SELECT 1 
    FROM Booking_Service bs 
    WHERE bs.service_id = s.service_id
);
