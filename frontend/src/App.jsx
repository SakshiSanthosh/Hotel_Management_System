import React, { useState, useEffect } from 'react';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Database Data States
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [bookingServices, setBookingServices] = useState([]);

  // Form Input States
  // 1. Guest Form
  const [guestForm, setGuestForm] = useState({ id: null, name: '', phone: '', address: '', id_proof: '' });
  const [isEditingGuest, setIsEditingGuest] = useState(false);

  // 2. Room Form
  const [roomForm, setRoomForm] = useState({ id: null, room_type: 'Standard', price_per_day: '', status: 'Available' });
  const [isEditingRoom, setIsEditingRoom] = useState(false);

  // 3. Booking Form
  const [bookingForm, setBookingForm] = useState({ guest_id: '', room_id: '', check_in_date: '', check_out_date: '' });

  // 4. Payment Form
  const [paymentForm, setPaymentForm] = useState({ booking_id: '', amount: '', payment_date: '', payment_method: 'Credit Card' });

  // 5. Staff Form
  const [staffForm, setStaffForm] = useState({ id: null, name: '', role: 'Receptionist', phone: '' });
  const [isEditingStaff, setIsEditingStaff] = useState(false);

  // Search Filters
  const [searchGuest, setSearchGuest] = useState('');

  // 6. Predefined Query execution states
  const [selectedQuery, setSelectedQuery] = useState(1);
  const [queryOutput, setQueryOutput] = useState(null);

  // 7. Stored Procedure 1: Room Availability check
  const [availCheckForm, setAvailCheckForm] = useState({ room_type: 'Standard', check_in: '', check_out: '' });
  const [availableRoomsResult, setAvailableRoomsResult] = useState([]);

  // 8. Stored Procedure 2: Generate Final Bill
  const [selectedGuestForBill, setSelectedGuestForBill] = useState('');
  const [guestBillResult, setGuestBillResult] = useState(null);

  // Trigger Demo Forms
  const [triggerBookingForm, setTriggerBookingForm] = useState({
    guest_id: '',
    room_id: '',
    check_in_date: '2026-06-12',
    check_out_date: '2026-06-15'
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [guestsData, roomsData, bookingsData, staffData, paymentsData, servicesData, bookingServicesData] = await Promise.all([
        api.guests.getAll(),
        api.rooms.getAll(),
        api.bookings.getAll(),
        api.staff.getAll(),
        api.payments.getAll(),
        api.services.getAll(),
        api.bookingServices.getAll()
      ]);

      setGuests(guestsData);
      setRooms(roomsData);
      setBookings(bookingsData);
      setStaff(staffData);
      setPayments(paymentsData);
      setServices(servicesData);
      setBookingServices(bookingServicesData);
    } catch (err) {
      showAlert('danger', 'Error loading database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show status alerts
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 7000);
  };

  // --- CRUD ACTIONS ---

  // 1. Guest CRUD
  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingGuest) {
        await api.guests.update(guestForm.id, guestForm);
        showAlert('success', 'Guest updated successfully.');
      } else {
        await api.guests.create(guestForm);
        showAlert('success', 'Guest registered successfully.');
      }
      setGuestForm({ id: null, name: '', phone: '', address: '', id_proof: '' });
      setIsEditingGuest(false);
      fetchData();
    } catch (err) {
      showAlert('danger', err.message);
    }
  };

  const handleEditGuest = (g) => {
    setGuestForm({ id: g.guest_id, name: g.name, phone: g.phone, address: g.address || '', id_proof: g.id_proof });
    setIsEditingGuest(true);
  };

  const handleDeleteGuest = async (id) => {
    if (window.confirm('Are you sure you want to delete this guest? All their bookings will be cascaded.')) {
      try {
        await api.guests.delete(id);
        showAlert('success', 'Guest deleted successfully.');
        fetchData();
      } catch (err) {
        showAlert('danger', err.message);
      }
    }
  };

  // 2. Room CRUD
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingRoom) {
        await api.rooms.update(roomForm.id, roomForm);
        showAlert('success', 'Room updated successfully.');
      } else {
        await api.rooms.create(roomForm);
        showAlert('success', 'Room added successfully.');
      }
      setRoomForm({ id: null, room_type: 'Standard', price_per_day: '', status: 'Available' });
      setIsEditingRoom(false);
      fetchData();
    } catch (err) {
      showAlert('danger', err.message);
    }
  };

  const handleEditRoom = (r) => {
    setRoomForm({ id: r.room_id, room_type: r.room_type, price_per_day: r.price_per_day, status: r.status });
    setIsEditingRoom(true);
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Delete this room?')) {
      try {
        await api.rooms.delete(id);
        showAlert('success', 'Room deleted.');
        fetchData();
      } catch (err) {
        showAlert('danger', err.message);
      }
    }
  };

  // 3. Staff CRUD
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingStaff) {
        await api.staff.update(staffForm.id, staffForm);
        showAlert('success', 'Staff information updated.');
      } else {
        await api.staff.create(staffForm);
        showAlert('success', 'Staff member registered.');
      }
      setStaffForm({ id: null, name: '', role: 'Receptionist', phone: '' });
      setIsEditingStaff(false);
      fetchData();
    } catch (err) {
      showAlert('danger', err.message);
    }
  };

  const handleEditStaff = (s) => {
    setStaffForm({ id: s.staff_id, name: s.name, role: s.role, phone: s.phone });
    setIsEditingStaff(true);
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Delete this staff member?')) {
      try {
        await api.staff.delete(id);
        showAlert('success', 'Staff member deleted.');
        fetchData();
      } catch (err) {
        showAlert('danger', err.message);
      }
    }
  };

  // 4. Booking CRUD
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.bookings.create(bookingForm);
      showAlert('success', 'Booking created! Room status automatically set to Booked via Trigger.');
      setBookingForm({ guest_id: '', room_id: '', check_in_date: '', check_out_date: '' });
      fetchData();
    } catch (err) {
      // Handles overlap error from MySQL Trigger
      showAlert('danger', err.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Cancel this booking? Room status will revert to Available.')) {
      try {
        await api.bookings.delete(id);
        showAlert('success', 'Booking canceled and Room marked Available.');
        fetchData();
      } catch (err) {
        showAlert('danger', err.message);
      }
    }
  };

  // 5. Payment Insertion
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.payments.create(paymentForm);
      showAlert('success', 'Payment recorded successfully.');
      setPaymentForm({ booking_id: '', amount: '', payment_date: '', payment_method: 'Credit Card' });
      fetchData();
    } catch (err) {
      showAlert('danger', err.message);
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('Delete this payment transaction?')) {
      try {
        await api.payments.delete(id);
        showAlert('success', 'Payment transaction deleted.');
        fetchData();
      } catch (err) {
        showAlert('danger', err.message);
      }
    }
  };

  // --- RUN 10 QUERIES ---
  const runPredefinedQuery = async (queryId) => {
    setLoading(true);
    try {
      setSelectedQuery(queryId);
      const res = await api.queries.run(queryId);
      setQueryOutput(res);
    } catch (err) {
      showAlert('danger', 'Query failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queries') {
      runPredefinedQuery(selectedQuery);
    }
  }, [activeTab]);

  // --- RUN STORED PROCEDURES ---
  // Procedure 1: Room Availability Check
  const handleAvailabilityCheckSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await api.procedures.checkAvailability(availCheckForm);
      setAvailableRoomsResult(result);
      if (result.length === 0) {
        showAlert('warning', 'No available rooms found for the selected type and dates.');
      } else {
        showAlert('success', `Found ${result.length} available room(s).`);
      }
    } catch (err) {
      showAlert('danger', err.message);
    }
  };

  // Procedure 2: Generate Final Bill
  const handleGenerateBillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuestForBill) return;
    try {
      const result = await api.procedures.generateBill(selectedGuestForBill);
      setGuestBillResult(result);
      showAlert('success', 'Bill generated using Stored Procedure GenerateFinalBill.');
    } catch (err) {
      showAlert('danger', err.message);
    }
  };

  // --- TRIGGER DEMONSTRATION ACTIONS ---
  const handleTriggerBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.bookings.create(triggerBookingForm);
      showAlert('success', 'SUCCESS: Booking created successfully. Watch the Room card color update to Booked (Trigger 1 Demo).');
      fetchData();
    } catch (err) {
      showAlert('danger', 'TRIGGER DETECTED: ' + err.message);
    }
  };

  // Filtered Guests list
  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchGuest.toLowerCase()) ||
    g.phone.includes(searchGuest) ||
    g.id_proof.toLowerCase().includes(searchGuest.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">🏨</span>
          <div className="brand-text">
            <h1>INNKEEP</h1>
            <span>HOTEL MANAGEMENT SYSTEM</span>
          </div>
        </div>
        
        <nav className="app-nav">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={`nav-btn ${activeTab === 'guests' ? 'active' : ''}`} onClick={() => setActiveTab('guests')}>
            👥 Guests
          </button>
          <button className={`nav-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            🛏️ Rooms & Staff
          </button>
          <button className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            📅 Bookings
          </button>
          <button className={`nav-btn ${activeTab === 'queries' ? 'active' : ''}`} onClick={() => { setActiveTab('queries'); runPredefinedQuery(selectedQuery); }}>
            🔍 10 Queries
          </button>
          <button className={`nav-btn ${activeTab === 'demos' ? 'active' : ''}`} onClick={() => setActiveTab('demos')}>
            ⚙️ Procedures & Triggers
          </button>
        </nav>
      </header>

      {/* Main App Workspace */}
      <main className="app-main">
        {/* Status Notification Alert */}
        {alert && (
          <div className={`alert-box ${alert.type === 'danger' ? 'danger' : 'success'}`}>
            <span>{alert.type === 'danger' ? '❌' : 'ℹ️'}</span>
            <div>{alert.message}</div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Overview Dashboard</h2>
                <p className="panel-description">Hotel live state metrics and active room layout.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchData}>🔄 Refresh</button>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-title">Total Rooms</div>
                <div className="metric-value">{rooms.length}</div>
                <div className="metric-icon">🏨</div>
              </div>
              <div className="metric-card purple">
                <div className="metric-title">Booked Rooms</div>
                <div className="metric-value">{rooms.filter(r => r.status === 'Booked').length}</div>
                <div className="metric-icon">🔑</div>
              </div>
              <div className="metric-card success">
                <div className="metric-title">Total Guests</div>
                <div className="metric-value">{guests.length}</div>
                <div className="metric-icon">👥</div>
              </div>
              <div className="metric-card warning">
                <div className="metric-title">Active Bookings</div>
                <div className="metric-value">{bookings.length}</div>
                <div className="metric-icon">📅</div>
              </div>
            </div>

            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Real-Time Room Status Layout</h3>
            <p className="panel-description" style={{ marginBottom: '1.5rem' }}>
              Green indicates Available. Blue indicates Booked. Hover over a room to view details.
            </p>
            <div className="room-grid">
              {rooms.map(room => (
                <div key={room.room_id} className={`room-card ${room.status.toLowerCase()}`}>
                  <div className="room-card-number">Room {room.room_id}</div>
                  <div className="room-card-type">{room.room_type}</div>
                  <span className={`badge ${room.status === 'Available' ? 'badge-available' : 'badge-booked'}`}>
                    {room.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Guest Register</h2>
                <p className="panel-description">Manage customer registry data (Insert, Update, and Delete operations).</p>
              </div>
            </div>

            <div className="content-layout split">
              {/* Add / Edit Form */}
              <div>
                <div className="form-container">
                  <h3 className="form-title">
                    {isEditingGuest ? '✏️ Edit Guest Details' : '👤 Add New Guest'}
                  </h3>
                  <form onSubmit={handleGuestSubmit}>
                    <div className="form-group">
                      <label>Guest Full Name *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="John Doe"
                        value={guestForm.name} 
                        onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        required 
                        placeholder="9876543210"
                        value={guestForm.phone} 
                        onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="123 Street, City"
                        value={guestForm.address} 
                        onChange={e => setGuestForm({ ...guestForm, address: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>ID Proof Type & No *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="AADHAAR1234 / PASSPORT"
                        value={guestForm.id_proof} 
                        onChange={e => setGuestForm({ ...guestForm, id_proof: e.target.value })}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        {isEditingGuest ? 'Update Guest' : 'Register Guest'}
                      </button>
                      {isEditingGuest && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setIsEditingGuest(false);
                            setGuestForm({ id: null, name: '', phone: '', address: '', id_proof: '' });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Guests Table */}
              <div>
                <div className="search-box">
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="🔍 Search guests by name, phone or ID proof..." 
                    value={searchGuest}
                    onChange={e => setSearchGuest(e.target.value)}
                  />
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>ID Proof</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>
                            No guests found.
                          </td>
                        </tr>
                      ) : (
                        filteredGuests.map(g => (
                          <tr key={g.guest_id}>
                            <td><strong>#{g.guest_id}</strong></td>
                            <td>{g.name}</td>
                            <td>{g.phone}</td>
                            <td>{g.address || '-'}</td>
                            <td><code>{g.id_proof}</code></td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => handleEditGuest(g)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteGuest(g.guest_id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms & Staff Tab */}
        {activeTab === 'rooms' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Rooms & Hotel Staff</h2>
                <p className="panel-description">Configure the rooms catalogue and internal staff roster.</p>
              </div>
            </div>

            <div className="grid-2">
              {/* Rooms Management Section */}
              <div className="form-container">
                <h3 className="form-title">🛏️ Add / Edit Room</h3>
                <form onSubmit={handleRoomSubmit} style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select 
                      className="form-select"
                      value={roomForm.room_type}
                      onChange={e => setRoomForm({ ...roomForm, room_type: e.target.value })}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price Per Day (INR)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      required
                      placeholder="e.g. 2000"
                      value={roomForm.price_per_day}
                      onChange={e => setRoomForm({ ...roomForm, price_per_day: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Status</label>
                    <select 
                      className="form-select"
                      value={roomForm.status}
                      onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="Booked">Booked</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {isEditingRoom ? 'Update Room' : 'Add Room'}
                    </button>
                    {isEditingRoom && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setIsEditingRoom(false);
                          setRoomForm({ id: null, room_type: 'Standard', price_per_day: '', status: 'Available' });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Price/Day</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(r => (
                        <tr key={r.room_id}>
                          <td>#{r.room_id}</td>
                          <td>{r.room_type}</td>
                          <td>₹{r.price_per_day}</td>
                          <td>
                            <span className={`badge ${r.status === 'Available' ? 'badge-available' : r.status === 'Booked' ? 'badge-booked' : 'badge-maintenance'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleEditRoom(r)}>✏️</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRoom(r.room_id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Staff Management Section */}
              <div className="form-container">
                <h3 className="form-title">💼 Staff Directory</h3>
                <form onSubmit={handleStaffSubmit} style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Staff Member Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      placeholder="Jane Smith"
                      value={staffForm.name}
                      onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select 
                      className="form-select"
                      value={staffForm.role}
                      onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                    >
                      <option value="Manager">Manager</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Chef">Chef</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      required
                      placeholder="9090909090"
                      value={staffForm.phone}
                      onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {isEditingStaff ? 'Update Staff' : 'Register Staff'}
                    </button>
                    {isEditingStaff && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setIsEditingStaff(false);
                          setStaffForm({ id: null, name: '', role: 'Receptionist', phone: '' });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s.staff_id}>
                          <td>{s.name}</td>
                          <td><strong>{s.role}</strong></td>
                          <td>{s.phone}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleEditStaff(s)}>✏️</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStaff(s.staff_id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings & Payments Tab */}
        {activeTab === 'bookings' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Bookings & Financials</h2>
                <p className="panel-description">Handle room reservation bookings and record transactions.</p>
              </div>
            </div>

            <div className="content-layout split">
              {/* Insert Reservation Booking Form */}
              <div>
                <div className="form-container">
                  <h3 className="form-title">📅 New Booking</h3>
                  <form onSubmit={handleBookingSubmit}>
                    <div className="form-group">
                      <label>Select Guest *</label>
                      <select 
                        className="form-select"
                        required
                        value={bookingForm.guest_id}
                        onChange={e => setBookingForm({ ...bookingForm, guest_id: e.target.value })}
                      >
                        <option value="">-- Choose Guest --</option>
                        {guests.map(g => (
                          <option key={g.guest_id} value={g.guest_id}>{g.name} (ID: #{g.guest_id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Select Room *</label>
                      <select 
                        className="form-select"
                        required
                        value={bookingForm.room_id}
                        onChange={e => setBookingForm({ ...bookingForm, room_id: e.target.value })}
                      >
                        <option value="">-- Choose Room --</option>
                        {rooms.map(r => (
                          <option key={r.room_id} value={r.room_id}>
                            Room {r.room_id} - {r.room_type} (₹{r.price_per_day}/day) [{r.status}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Check-in Date *</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        required
                        value={bookingForm.check_in_date}
                        onChange={e => setBookingForm({ ...bookingForm, check_in_date: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Check-out Date *</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        required
                        value={bookingForm.check_out_date}
                        onChange={e => setBookingForm({ ...bookingForm, check_out_date: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                      Complete Reservation Booking
                    </button>
                  </form>
                </div>

                <div className="form-container" style={{ marginTop: '1.5rem' }}>
                  <h3 className="form-title">💳 Record Payment</h3>
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="form-group">
                      <label>Select Active Booking *</label>
                      <select 
                        className="form-select"
                        required
                        value={paymentForm.booking_id}
                        onChange={e => setPaymentForm({ ...paymentForm, booking_id: e.target.value })}
                      >
                        <option value="">-- Choose Booking --</option>
                        {bookings.map(b => (
                          <option key={b.booking_id} value={b.booking_id}>
                            Booking #{b.booking_id} - {b.guest_name} (Room {b.room_id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Payment Amount (₹) *</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        required
                        placeholder="Amount"
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Date *</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        required
                        value={paymentForm.payment_date}
                        onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Method</label>
                      <select 
                        className="form-select"
                        value={paymentForm.payment_method}
                        onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                      Log Payment Transaction
                    </button>
                  </form>
                </div>
              </div>

              {/* Bookings & Payments Tables */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Active Reservation List</h4>
                  <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Guest</th>
                          <th>Room</th>
                          <th>Dates</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem' }}>No bookings found</td>
                          </tr>
                        ) : (
                          bookings.map(b => (
                            <tr key={b.booking_id}>
                              <td><strong>#{b.booking_id}</strong></td>
                              <td>{b.guest_name}</td>
                              <td>Room {b.room_id} ({b.room_type})</td>
                              <td>
                                <span style={{ fontSize: '0.85rem' }}>
                                  {b.check_in_date.split('T')[0]} to {b.check_out_date.split('T')[0]}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBooking(b.booking_id)}>Cancel</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Recorded Transaction Ledger</h4>
                  <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Transaction</th>
                          <th>Booking</th>
                          <th>Guest</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem' }}>No payments logged yet</td>
                          </tr>
                        ) : (
                          payments.map(p => (
                            <tr key={p.payment_id}>
                              <td><strong>#{p.payment_id}</strong></td>
                              <td>Booking #{p.booking_id}</td>
                              <td>{p.guest_name}</td>
                              <td>₹{p.amount}</td>
                              <td><span className="badge badge-available">{p.payment_method}</span></td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeletePayment(p.payment_id)}>Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10 Predefined Queries Tab */}
        {activeTab === 'queries' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">SQL Query Sandbox</h2>
                <p className="panel-description">Execute and view the results of the 10 core query requirements.</p>
              </div>
            </div>

            <div className="queries-layout">
              {/* Queries Selection List */}
              <div className="queries-list">
                {[
                  { id: 1, label: '1. Retrieve all guests' },
                  { id: 2, label: '2. Rooms of specific type (Deluxe)' },
                  { id: 3, label: '3. Booking & Guest details (2-table Join)' },
                  { id: 4, label: '4. Booking, Guest, Room details (3-table Join)' },
                  { id: 5, label: '5. Room count per type (Group By)' },
                  { id: 6, label: '6. Room types count > 20 (Having)' },
                  { id: 7, label: '7. Guest total payment > average (Subquery)' },
                  { id: 8, label: '8. Guest bookings > specific guest (Correlated)' },
                  { id: 9, label: '9. All rooms including unbooked (Left Join)' },
                  { id: 10, label: '10. Services never used (Not Exists)' }
                ].map(q => (
                  <button 
                    key={q.id} 
                    className={`query-item-btn ${selectedQuery === q.id ? 'active' : ''}`}
                    onClick={() => runPredefinedQuery(q.id)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Query Output Area */}
              <div className="query-result-wrapper">
                {queryOutput && (
                  <>
                    <div>
                      <h4 style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>Description:</h4>
                      <p className="panel-description" style={{ color: 'var(--accent-cyan)' }}>{queryOutput.description}</p>
                    </div>

                    <div className="sql-block">
                      <pre>{queryOutput.sql}</pre>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>Result Set Output ({queryOutput.results.length} rows):</h4>
                      <div className="table-container" style={{ maxHeight: '350px' }}>
                        {queryOutput.results.length === 0 ? (
                          <div className="empty-placeholder">Empty dataset returned.</div>
                        ) : (
                          <table className="data-table">
                            <thead>
                              <tr>
                                {Object.keys(queryOutput.results[0]).map(key => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryOutput.results.map((row, idx) => (
                                <tr key={idx}>
                                  {Object.values(row).map((val, cellIdx) => (
                                    <td key={cellIdx}>
                                      {typeof val === 'object' && val !== null
                                        ? JSON.stringify(val)
                                        : val === null ? 'NULL' : String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Procedures & Triggers Tab */}
        {activeTab === 'demos' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Stored Procedures & Database Triggers</h2>
                <p className="panel-description">Interactive demonstration controls for custom procedures and integrity constraints.</p>
              </div>
            </div>

            <div className="grid-2">
              {/* STORED PROCEDURES DEMO */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #2d3748', paddingBottom: '0.5rem' }}>
                  Stored Procedures
                </h2>

                {/* Stored Procedure 1 Form */}
                <div className="demo-card">
                  <h3>Procedure 1: CheckRoomAvailability</h3>
                  <p>Check room availability by selecting type and check-in/out dates. Calls the stored procedure to find empty rooms.</p>
                  
                  <form onSubmit={handleAvailabilityCheckSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room Type</label>
                        <select 
                          className="form-select"
                          value={availCheckForm.room_type}
                          onChange={e => setAvailCheckForm({ ...availCheckForm, room_type: e.target.value })}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Deluxe">Deluxe</option>
                          <option value="Suite">Suite</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check-in</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          required
                          value={availCheckForm.check_in}
                          onChange={e => setAvailCheckForm({ ...availCheckForm, check_in: e.target.value })}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check-out</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          required
                          value={availCheckForm.check_out}
                          onChange={e => setAvailCheckForm({ ...availCheckForm, check_out: e.target.value })}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Check Available Rooms</button>
                  </form>

                  {/* Available room procedure result */}
                  {availableRoomsResult.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Results from Stored Procedure:</h4>
                      <div className="table-container" style={{ maxHeight: '180px' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Room ID</th>
                              <th>Type</th>
                              <th>Price/Day</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availableRoomsResult.map(r => (
                              <tr key={r.room_id}>
                                <td>Room #{r.room_id}</td>
                                <td>{r.room_type}</td>
                                <td>₹{r.price_per_day}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stored Procedure 2 Form */}
                <div className="demo-card">
                  <h3>Procedure 2: GenerateFinalBill</h3>
                  <p>Execute GenerateFinalBill Stored Procedure to calculate aggregated room stay and service charge costs.</p>
                  
                  <form onSubmit={handleGenerateBillSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <select 
                      className="form-select"
                      required
                      value={selectedGuestForBill}
                      onChange={e => setSelectedGuestForBill(e.target.value)}
                    >
                      <option value="">-- Select Guest --</option>
                      {guests.map(g => (
                        <option key={g.guest_id} value={g.guest_id}>{g.name} (ID: #{g.guest_id})</option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary" disabled={!selectedGuestForBill}>Run Bill Proc</button>
                  </form>

                  {guestBillResult && (
                    <div className="receipt">
                      <div className="receipt-header">
                        <h4>InnKeep Invoice</h4>
                        <span style={{ fontSize: '0.75rem' }}>BILLING SYSTEM REPORT</span>
                      </div>
                      <div className="receipt-info">
                        <div>Guest ID: #{guestBillResult.guest_id}</div>
                        <div>Date: {new Date().toLocaleDateString()}</div>
                      </div>
                      
                      <div className="receipt-divider"></div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Room Charges</div>
                      {guestBillResult.breakdown.rooms.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No booked rooms recorded</div>
                      ) : (
                        guestBillResult.breakdown.rooms.map(room => (
                          <div key={room.booking_id} className="receipt-item">
                            <span>Room {room.room_id} ({room.room_type}) x {room.days} days</span>
                            <span>₹{room.cost}</span>
                          </div>
                        ))
                      )}

                      <div className="receipt-divider"></div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Service Usages</div>
                      {guestBillResult.breakdown.services.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No services used</div>
                      ) : (
                        guestBillResult.breakdown.services.map((srv, index) => (
                          <div key={index} className="receipt-item">
                            <span>{srv.service_name} (x{srv.quantity})</span>
                            <span>₹{srv.cost}</span>
                          </div>
                        ))
                      )}

                      <div className="receipt-total">
                        <span>TOTAL PAYABLE</span>
                        <span>₹{guestBillResult.total_bill}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TRIGGERS DEMO */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #2d3748', paddingBottom: '0.5rem' }}>
                  Database Triggers
                </h2>

                {/* Trigger 1 Demo */}
                <div className="demo-card">
                  <h3>Trigger 1: Update Room Status after Booking</h3>
                  <p>
                    When a new booking is inserted, the database trigger <code>after_booking_insert</code> automatically changes the Room status from <b>Available</b> to <b>Booked</b>.
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    <strong>Verify behavior:</strong> Create a booking in the "Bookings" tab, and observe that room status immediately switches to <b>Booked</b> on the Dashboard.
                  </div>
                </div>

                {/* Trigger 2 Demo */}
                <div className="demo-card">
                  <h3>Trigger 2: Prevent Double Booking</h3>
                  <p>
                    The trigger <code>before_booking_insert</code> checks if the selected room is already booked for overlapping dates.
                    If it is, the database raises an exception and aborts the insert statement.
                  </p>
                  
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent-pink)' }}>
                    Trigger Test Sandbox
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Try creating a booking for Room 23 from 2026-06-12 to 2026-06-15. This room is already booked for those dates. Watch the trigger intercept it!
                  </p>

                  <form onSubmit={handleTriggerBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1.2 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Guest</label>
                        <select 
                          className="form-select"
                          required
                          value={triggerBookingForm.guest_id}
                          onChange={e => setTriggerBookingForm({ ...triggerBookingForm, guest_id: e.target.value })}
                        >
                          <option value="">-- Choose Guest --</option>
                          {guests.map(g => (
                            <option key={g.guest_id} value={g.guest_id}>{g.name}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room</label>
                        <select 
                          className="form-select"
                          required
                          value={triggerBookingForm.room_id}
                          onChange={e => setTriggerBookingForm({ ...triggerBookingForm, room_id: e.target.value })}
                        >
                          <option value="">-- Room --</option>
                          {rooms.map(r => (
                            <option key={r.room_id} value={r.room_id}>Room {r.room_id} ({r.room_type})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check-in</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          required
                          value={triggerBookingForm.check_in_date}
                          onChange={e => setTriggerBookingForm({ ...triggerBookingForm, check_in_date: e.target.value })}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check-out</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          required
                          value={triggerBookingForm.check_out_date}
                          onChange={e => setTriggerBookingForm({ ...triggerBookingForm, check_out_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-danger">Execute Booking (Trigger Test)</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
