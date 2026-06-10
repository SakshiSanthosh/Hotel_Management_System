const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Guests
  guests: {
    getAll: () => fetch(`${API_BASE_URL}/guests`).then(handleResponse),
    create: (data) => fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/guests/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Rooms
  rooms: {
    getAll: () => fetch(`${API_BASE_URL}/rooms`).then(handleResponse),
    create: (data) => fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/rooms/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Bookings
  bookings: {
    getAll: () => fetch(`${API_BASE_URL}/bookings`).then(handleResponse),
    create: (data) => fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/bookings/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Payments
  payments: {
    getAll: () => fetch(`${API_BASE_URL}/payments`).then(handleResponse),
    create: (data) => fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/payments/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Staff
  staff: {
    getAll: () => fetch(`${API_BASE_URL}/staff`).then(handleResponse),
    create: (data) => fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/staff/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Services
  services: {
    getAll: () => fetch(`${API_BASE_URL}/services`).then(handleResponse),
    create: (data) => fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => fetch(`${API_BASE_URL}/services/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Booking Services
  bookingServices: {
    getAll: () => fetch(`${API_BASE_URL}/booking-services`).then(handleResponse),
    create: (data) => fetch(`${API_BASE_URL}/booking-services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (booking_id, service_id, usage_date) => 
      fetch(`${API_BASE_URL}/booking-services?booking_id=${booking_id}&service_id=${service_id}&usage_date=${usage_date}`, {
        method: 'DELETE'
      }).then(handleResponse),
  },

  // Stored Procedures
  procedures: {
    checkAvailability: (data) => fetch(`${API_BASE_URL}/procedures/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
    generateBill: (guestId) => fetch(`${API_BASE_URL}/procedures/generate-bill/${guestId}`).then(handleResponse),
  },

  // Execute Pre-defined SQL Queries
  queries: {
    run: (queryId) => fetch(`${API_BASE_URL}/queries/${queryId}`).then(handleResponse),
  }
};
