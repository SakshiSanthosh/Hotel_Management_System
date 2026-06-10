-- ==========================================
-- Hotel Management System Database Schema
-- DBMS Project Setup Script
-- ==========================================

-- 1. Create and Use Database
DROP DATABASE IF EXISTS hotel_management;
CREATE DATABASE hotel_management;
USE hotel_management;

-- 2. Create Tables

-- Guest Table
CREATE TABLE Guest (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address VARCHAR(255),
    id_proof VARCHAR(50) NOT NULL
);

-- Room Table
CREATE TABLE Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_type VARCHAR(50) NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available'
);

-- Booking Table
CREATE TABLE Booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    FOREIGN KEY (guest_id) REFERENCES Guest(guest_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE
);

-- Staff Table
CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL
);

-- Payment Table
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE
);

-- Service Table
CREATE TABLE Service (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    service_charge DECIMAL(10,2) NOT NULL
);

-- Booking_Service Table (Associative Entity for Services used during Bookings)
CREATE TABLE Booking_Service (
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    usage_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (booking_id, service_id, usage_date),
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Service(service_id) ON DELETE CASCADE
);


-- 3. Create Triggers

DELIMITER //

-- Trigger 1: Update Room Status after Booking is inserted
CREATE TRIGGER after_booking_insert
AFTER INSERT ON Booking
FOR EACH ROW
BEGIN
    UPDATE Room
    SET status = 'Booked'
    WHERE room_id = NEW.room_id;
END//

-- Trigger 2: Prevent Double Booking of the same room
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON Booking
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT DEFAULT 0;

    SELECT COUNT(*) INTO overlap_count
    FROM Booking
    WHERE room_id = NEW.room_id
      AND NOT (NEW.check_out_date <= check_in_date OR NEW.check_in_date >= check_out_date);

    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Double booking detected! Room is already booked for these dates.';
    END IF;
END//

DELIMITER ;


-- 4. Create Stored Procedures

DELIMITER //

-- Stored Procedure 1: Check room availability for given dates & room type
CREATE PROCEDURE CheckRoomAvailability(
    IN p_room_type VARCHAR(50),
    IN p_check_in DATE,
    IN p_check_out DATE
)
BEGIN
    SELECT room_id, room_type, price_per_day, status
    FROM Room
    WHERE room_type = p_room_type
      AND status != 'Maintenance'
      AND room_id NOT IN (
          SELECT room_id
          FROM Booking
          WHERE NOT (p_check_out <= check_in_date OR p_check_in >= check_out_date)
      );
END//

-- Stored Procedure 2: Generate final bill for a guest (aggregates room stay cost and service charges)
CREATE PROCEDURE GenerateFinalBill(
    IN p_guest_id INT,
    OUT p_total_bill DECIMAL(10,2)
)
BEGIN
    DECLARE v_room_charge DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_service_charge DECIMAL(10,2) DEFAULT 0.00;
    
    -- Calculate total charges for all rooms booked by this guest
    SELECT COALESCE(SUM(r.price_per_day * DATEDIFF(b.check_out_date, b.check_in_date)), 0)
    INTO v_room_charge
    FROM Booking b
    JOIN Room r ON b.room_id = r.room_id
    WHERE b.guest_id = p_guest_id;
    
    -- Calculate total service usage charges for this guest's bookings
    SELECT COALESCE(SUM(s.service_charge * bs.quantity), 0)
    INTO v_service_charge
    FROM Booking b
    JOIN Booking_Service bs ON b.booking_id = bs.booking_id
    JOIN Service s ON bs.service_id = s.service_id
    WHERE b.guest_id = p_guest_id;
    
    SET p_total_bill = v_room_charge + v_service_charge;
END//

DELIMITER ;


-- 5. Insert Sample Values

-- Populate Guests
INSERT INTO Guest (name, phone, address, id_proof) VALUES
('Sakshi Sharma', '9876543210', '123 Park Avenue, Delhi', 'PASSPORT12345'),
('Aditya Patel', '8765432109', '456 MG Road, Bangalore', 'AADHAAR9876'),
('Rohan Sen', '7654321098', '789 Marine Drive, Mumbai', 'PAN34567'),
('Priya Nair', '6543210987', '321 Gachibowli, Hyderabad', 'VOTER8765'),
('Karan Johar', '5432109876', '555 Film City, Mumbai', 'AADHAAR1122');

-- Populate Rooms
-- To fulfill HAVING clause query (count > 20 for a room type), we insert 22 Standard rooms.
INSERT INTO Room (room_type, price_per_day, status) VALUES
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'),
('Standard', 1500.00, 'Available'); -- 22 Standard Rooms

-- Insert some Deluxe and Suite Rooms
INSERT INTO Room (room_type, price_per_day, status) VALUES
('Deluxe', 3000.00, 'Available'),
('Deluxe', 3000.00, 'Available'),
('Deluxe', 3000.00, 'Available'),
('Deluxe', 3000.00, 'Available'),
('Deluxe', 3000.00, 'Available'),
('Suite', 6000.00, 'Available'),
('Suite', 6000.00, 'Available'),
('Suite', 6000.00, 'Available');

-- Populate Staff
INSERT INTO Staff (name, role, phone) VALUES
('Amit Kumar', 'Manager', '9090909090'),
('Neha Verma', 'Receptionist', '8080808080'),
('Ramesh Singh', 'Housekeeping', '7070707070'),
('Suresh Raina', 'Chef', '6060606060'),
('Pooja Hedge', 'Receptionist', '5050505050');

-- Populate Services
INSERT INTO Service (service_name, service_charge) VALUES
('Room Service (Food)', 500.00),
('Laundry', 200.00),
('Spa & Wellness', 1500.00),
('Airport Shuttle', 800.00),
('Gym Access', 300.00); -- Gym Access will remain unused for subquery demonstration

-- Populate Bookings
-- Trigger 'after_booking_insert' will automatically set these room statuses to 'Booked'.
INSERT INTO Booking (guest_id, room_id, check_in_date, check_out_date) VALUES
(1, 23, '2026-06-12', '2026-06-15'), -- Deluxe Room 23 booked by Sakshi
(2, 24, '2026-06-10', '2026-06-12'), -- Deluxe Room 24 booked by Aditya
(3, 1, '2026-06-11', '2026-06-14'),  -- Standard Room 1 booked by Rohan
(4, 28, '2026-06-13', '2026-06-18'), -- Suite Room 28 booked by Priya
(1, 2, '2026-06-20', '2026-06-22');  -- Standard Room 2 booked by Sakshi (Sakshi has 2 bookings)

-- Populate Payments
INSERT INTO Payment (booking_id, amount, payment_date, payment_method) VALUES
(1, 9000.00, '2026-06-12', 'Credit Card'), -- (3 days * 3000)
(2, 6000.00, '2026-06-10', 'UPI'),         -- (2 days * 3000)
(3, 4500.00, '2026-06-11', 'Cash'),        -- (3 days * 1500)
(4, 30000.00, '2026-06-13', 'Net Banking'), -- (5 days * 6000)
(5, 3000.00, '2026-06-20', 'UPI');         -- (2 days * 1500)

-- Populate Booking Service usages
INSERT INTO Booking_Service (booking_id, service_id, usage_date, quantity) VALUES
(1, 1, '2026-06-13', 2), -- Sakshi ordered Room Service twice
(1, 2, '2026-06-14', 1), -- Sakshi used Laundry once
(2, 3, '2026-06-11', 1), -- Aditya used Spa
(3, 2, '2026-06-12', 3), -- Rohan used Laundry 3 times
(4, 4, '2026-06-13', 1); -- Priya used Airport Shuttle

-- Note: Service_id = 5 (Gym Access) was never used. Room_id = 3, 4, 5... are not booked.
