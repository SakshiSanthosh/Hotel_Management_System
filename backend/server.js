import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Create database pool configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'hotel_management',
  multipleStatements: true // Required for executing multiple statements (e.g. procedures with output variables)
};

let pool;

// Helper to initialize database connection
async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    // Test connection
    const conn = await pool.getConnection();
    console.log('Successfully connected to MySQL database: ' + dbConfig.database);
    conn.release();
  } catch (error) {
    console.error('MySQL Connection Error:', error.message);
    console.log('Please make sure MySQL is running and your .env credentials are correct.');
    console.log('Exiting server due to database connection failure.');
    process.exit(1);
  }
}

await initDB();

// -------------------------------------------------------------
// CRUD ROUTING
// -------------------------------------------------------------

// --- GUESTS ---
app.get('/api/guests', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Guest ORDER BY guest_id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/guests', async (req, res) => {
  const { name, phone, address, id_proof } = req.body;
  if (!name || !phone || !id_proof) {
    return res.status(400).json({ error: 'Name, Phone and ID Proof are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Guest (name, phone, address, id_proof) VALUES (?, ?, ?, ?)',
      [name, phone, address, id_proof]
    );
    res.status(201).json({ guest_id: result.insertId, name, phone, address, id_proof });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/guests/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, id_proof } = req.body;
  try {
    await pool.query(
      'UPDATE Guest SET name = ?, phone = ?, address = ?, id_proof = ? WHERE guest_id = ?',
      [name, phone, address, id_proof, id]
    );
    res.json({ message: 'Guest updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/guests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Guest WHERE guest_id = ?', [id]);
    res.json({ message: 'Guest deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROOMS ---
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Room ORDER BY room_id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  const { room_type, price_per_day, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Room (room_type, price_per_day, status) VALUES (?, ?, ?)',
      [room_type, price_per_day, status || 'Available']
    );
    res.status(201).json({ room_id: result.insertId, room_type, price_per_day, status: status || 'Available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { room_type, price_per_day, status } = req.body;
  try {
    await pool.query(
      'UPDATE Room SET room_type = ?, price_per_day = ?, status = ? WHERE room_id = ?',
      [room_type, price_per_day, status, id]
    );
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Room WHERE room_id = ?', [id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOOKINGS ---
app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, g.name AS guest_name, r.room_type, r.price_per_day
      FROM Booking b
      INNER JOIN Guest g ON b.guest_id = g.guest_id
      INNER JOIN Room r ON b.room_id = r.room_id
      ORDER BY b.booking_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Booking (Demonstrates Triggers: updates room status, checks double booking)
app.post('/api/bookings', async (req, res) => {
  const { guest_id, room_id, check_in_date, check_out_date } = req.body;
  if (!guest_id || !room_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Booking (guest_id, room_id, check_in_date, check_out_date) VALUES (?, ?, ?, ?)',
      [guest_id, room_id, check_in_date, check_out_date]
    );
    res.status(201).json({ booking_id: result.insertId, guest_id, room_id, check_in_date, check_out_date });
  } catch (err) {
    // If the trigger 'before_booking_insert' fails, it returns a 45000 SQLSTATE error.
    console.error('Booking insertion failed:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Revert room status to Available before deleting booking
    const [[booking]] = await pool.query('SELECT room_id FROM Booking WHERE booking_id = ?', [id]);
    if (booking) {
      await pool.query('UPDATE Room SET status = "Available" WHERE room_id = ?', [booking.room_id]);
    }
    await pool.query('DELETE FROM Booking WHERE booking_id = ?', [id]);
    res.json({ message: 'Booking deleted and room status reverted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- STAFF ---
app.get('/api/staff', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Staff ORDER BY staff_id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  const { name, role, phone } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO Staff (name, role, phone) VALUES (?, ?, ?)', [name, role, phone]);
    res.status(201).json({ staff_id: result.insertId, name, role, phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, phone } = req.body;
  try {
    await pool.query('UPDATE Staff SET name = ?, role = ?, phone = ? WHERE staff_id = ?', [name, role, phone, id]);
    res.json({ message: 'Staff member updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Staff WHERE staff_id = ?', [id]);
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PAYMENTS ---
app.get('/api/payments', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, g.name AS guest_name, b.room_id
      FROM Payment p
      INNER JOIN Booking b ON p.booking_id = b.booking_id
      INNER JOIN Guest g ON b.guest_id = g.guest_id
      ORDER BY p.payment_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  const { booking_id, amount, payment_date, payment_method } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Payment (booking_id, amount, payment_date, payment_method) VALUES (?, ?, ?, ?)',
      [booking_id, amount, payment_date, payment_method]
    );
    res.status(201).json({ payment_id: result.insertId, booking_id, amount, payment_date, payment_method });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/payments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Payment WHERE payment_id = ?', [id]);
    res.json({ message: 'Payment record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVICES ---
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Service ORDER BY service_id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  const { service_name, service_charge } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Service (service_name, service_charge) VALUES (?, ?)',
      [service_name, service_charge]
    );
    res.status(201).json({ service_id: result.insertId, service_name, service_charge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { service_name, service_charge } = req.body;
  try {
    await pool.query('UPDATE Service SET service_name = ?, service_charge = ? WHERE service_id = ?', [service_name, service_charge, id]);
    res.json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Service WHERE service_id = ?', [id]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOOKING SERVICE USAGES ---
app.get('/api/booking-services', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bs.*, s.service_name, s.service_charge, g.name AS guest_name
      FROM Booking_Service bs
      INNER JOIN Service s ON bs.service_id = s.service_id
      INNER JOIN Booking b ON bs.booking_id = b.booking_id
      INNER JOIN Guest g ON b.guest_id = g.guest_id
      ORDER BY bs.usage_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/booking-services', async (req, res) => {
  const { booking_id, service_id, usage_date, quantity } = req.body;
  try {
    await pool.query(
      'INSERT INTO Booking_Service (booking_id, service_id, usage_date, quantity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
      [booking_id, service_id, usage_date, quantity || 1]
    );
    res.status(201).json({ message: 'Service usage recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/booking-services', async (req, res) => {
  const { booking_id, service_id, usage_date } = req.query;
  try {
    await pool.query(
      'DELETE FROM Booking_Service WHERE booking_id = ? AND service_id = ? AND usage_date = ?',
      [booking_id, service_id, usage_date]
    );
    res.json({ message: 'Service usage record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STORED PROCEDURE CALLS
// -------------------------------------------------------------

// Stored Procedure 1: Check Availability
app.post('/api/procedures/check-availability', async (req, res) => {
  const { room_type, check_in_date, check_out_date } = req.body;
  if (!room_type || !check_in_date || !check_out_date) {
    return res.status(400).json({ error: 'Room type, check in and check out dates are required.' });
  }
  try {
    // Call procedure CheckRoomAvailability
    const [results] = await pool.query('CALL CheckRoomAvailability(?, ?, ?)', [room_type, check_in_date, check_out_date]);
    // MySQL returns results as nested arrays: first element contains row results of SELECT inside procedure
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stored Procedure 2: Generate Final Bill with itemized details
app.get('/api/procedures/generate-bill/:guest_id', async (req, res) => {
  const { guest_id } = req.params;
  try {
    // 1. Call GenerateFinalBill procedure to compute output variable
    // We execute multiple statements: call the procedure, then select the out parameter value
    const [results] = await pool.query(`
      CALL GenerateFinalBill(?, @total_bill);
      SELECT @total_bill AS total_bill;
    `, [guest_id]);
    
    const totalBillVal = results[1][0].total_bill;

    // 2. Fetch breakdown details to make the bill demonstration look extremely professional
    // Fetch room stay breakdowns
    const [roomStays] = await pool.query(`
      SELECT b.booking_id, r.room_id, r.room_type, r.price_per_day,
             b.check_in_date, b.check_out_date,
             DATEDIFF(b.check_out_date, b.check_in_date) AS days,
             (r.price_per_day * DATEDIFF(b.check_out_date, b.check_in_date)) AS cost
      FROM Booking b
      JOIN Room r ON b.room_id = r.room_id
      WHERE b.guest_id = ?
    `, [guest_id]);

    // Fetch service breakdowns
    const [serviceUsages] = await pool.query(`
      SELECT bs.booking_id, s.service_name, s.service_charge, bs.quantity,
             (s.service_charge * bs.quantity) AS cost, bs.usage_date
      FROM Booking b
      JOIN Booking_Service bs ON b.booking_id = bs.booking_id
      JOIN Service s ON bs.service_id = s.service_id
      WHERE b.guest_id = ?
    `, [guest_id]);

    res.json({
      guest_id,
      total_bill: parseFloat(totalBillVal || 0).toFixed(2),
      breakdown: {
        rooms: roomStays,
        services: serviceUsages
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// EXECUTING THE 10 PRE-DEFINED QUERIES
// -------------------------------------------------------------
app.get('/api/queries/:queryId', async (req, res) => {
  const queryId = parseInt(req.params.queryId);
  let sql = '';
  let description = '';

  switch (queryId) {
    case 1:
      sql = 'SELECT * FROM Guest';
      description = 'Retrieve all guests.';
      break;
    case 2:
      sql = "SELECT * FROM Room WHERE room_type = 'Deluxe'";
      description = "Display rooms of a specific room type (e.g. 'Deluxe').";
      break;
    case 3:
      sql = `
        SELECT b.booking_id, g.guest_id, g.name AS guest_name, g.phone, b.room_id, b.check_in_date, b.check_out_date
        FROM Booking b
        INNER JOIN Guest g ON b.guest_id = g.guest_id
      `;
      description = 'Display booking and guest details (2-table INNER JOIN).';
      break;
    case 4:
      sql = `
        SELECT b.booking_id, g.name AS guest_name, r.room_id, r.room_type, r.price_per_day, b.check_in_date, b.check_out_date
        FROM Booking b
        INNER JOIN Guest g ON b.guest_id = g.guest_id
        INNER JOIN Room r ON b.room_id = r.room_id
      `;
      description = 'Display booking, guest, and room details (3-table JOIN).';
      break;
    case 5:
      sql = `
        SELECT room_type, COUNT(*) AS number_of_rooms
        FROM Room
        GROUP BY room_type
      `;
      description = 'Count number of rooms per room type (GROUP BY).';
      break;
    case 6:
      sql = `
        SELECT room_type, COUNT(*) AS number_of_rooms
        FROM Room
        GROUP BY room_type
        HAVING COUNT(*) > 20
      `;
      description = 'Display room types having more than 20 rooms (HAVING).';
      break;
    case 7:
      sql = `
        SELECT g.guest_id, g.name, SUM(p.amount) AS total_payment
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
        )
      `;
      description = 'Retrieve guests whose total payment amount is greater than the average payment amount (Subquery).';
      break;
    case 8:
      sql = `
        SELECT g.guest_id, g.name, 
               (SELECT COUNT(*) FROM Booking b1 WHERE b1.guest_id = g.guest_id) AS total_bookings
        FROM Guest g
        WHERE 
            (SELECT COUNT(*) FROM Booking b1 WHERE b1.guest_id = g.guest_id) > 
            (SELECT COUNT(*) FROM Booking b2 WHERE b2.guest_id = 2)
      `;
      description = 'Retrieve guests who made more bookings than a specific guest (Aditya Patel with guest_id = 2) (Correlated Subquery).';
      break;
    case 9:
      sql = `
        SELECT r.room_id, r.room_type, r.price_per_day, r.status, b.booking_id, b.check_in_date, b.check_out_date
        FROM Room r
        LEFT JOIN Booking b ON r.room_id = b.room_id
      `;
      description = 'Display all rooms including those not booked (LEFT JOIN).';
      break;
    case 10:
      sql = `
        SELECT s.service_id, s.service_name, s.service_charge
        FROM Service s
        WHERE NOT EXISTS (
            SELECT 1 
            FROM Booking_Service bs 
            WHERE bs.service_id = s.service_id
        )
      `;
      description = 'Retrieve services that were never used in any booking (NOT EXISTS).';
      break;
    default:
      return res.status(400).json({ error: 'Invalid Query ID. Please specify a value from 1 to 10.' });
  }

  try {
    const [rows] = await pool.query(sql);
    res.json({
      queryId,
      description,
      sql,
      results: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message, sql });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
