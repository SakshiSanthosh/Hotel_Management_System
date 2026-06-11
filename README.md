<![CDATA[<div align="center">

# 🏨 InnKeep — Hotel Management System

### _A Full-Stack DBMS Project with Real-Time Dashboard, Stored Procedures, Triggers & 10 Advanced SQL Queries_

[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

**InnKeep** is a production-grade hotel management system built as a comprehensive DBMS project.  
It demonstrates end-to-end database design — from schema normalization and stored procedures to trigger-based integrity enforcement — wrapped in a stunning glassmorphic React dashboard.

</div>

---

## ✨ Feature Highlights

| Category | Features |
|---|---|
| 🗃️ **Database Design** | 7 normalized tables, foreign key constraints, cascade rules |
| ⚡ **Stored Procedures** | `CheckRoomAvailability`, `GenerateFinalBill` with dynamic aggregation |
| 🔒 **Triggers** | `after_booking_insert` (auto status flip), `before_booking_insert` (overlap guard) |
| 🔍 **10 Advanced Queries** | Joins, subqueries, aggregations, GROUP BY, HAVING — all runnable from the UI |
| 🎨 **Premium UI** | Glassmorphic dark theme, micro-animations, responsive layout |
| 📊 **Live Dashboard** | Real-time room status grid, guest/booking/payment metrics |
| 🧾 **Invoice System** | Auto-generated printable receipt via stored procedure |
| 🛡️ **Full CRUD** | Insert, Update, Delete operations on Guests, Rooms, Staff, Bookings, Payments |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Frontend — React + Vite"]
        UI["Dashboard UI<br/>(App.jsx)"]
        CSS["Glassmorphic CSS<br/>(App.css)"]
        API_LAYER["API Layer<br/>(api.js — Fetch Wrapper)"]
    end

    subgraph SERVER["⚙️ Backend — Express.js"]
        ROUTES["REST API Routes<br/>/api/guests, /api/rooms, ..."]
        MIDDLEWARE["CORS + JSON Parser"]
        DB_POOL["MySQL2 Connection Pool"]
    end

    subgraph DATABASE["🗄️ MySQL Database"]
        TABLES["7 Tables"]
        PROCS["2 Stored Procedures"]
        TRIGGERS["2 Triggers"]
        QUERIES["10 Advanced Queries"]
    end

    UI --> API_LAYER
    API_LAYER -->|"HTTP REST"| ROUTES
    ROUTES --> DB_POOL
    DB_POOL -->|"SQL"| TABLES
    DB_POOL -->|"CALL"| PROCS
    TABLES -.->|"Fire"| TRIGGERS
    ROUTES -->|"Execute"| QUERIES

    style CLIENT fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#f3f4f6
    style SERVER fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#f3f4f6
    style DATABASE fill:#1c1917,stroke:#f59e0b,stroke-width:2px,color:#f3f4f6
```

---

## 🗂️ Entity-Relationship Diagram

```mermaid
erDiagram
    GUESTS {
        int guest_id PK
        varchar name
        varchar phone
        varchar address
        varchar id_proof
    }

    ROOMS {
        int room_id PK
        varchar room_type
        decimal price_per_day
        varchar status
    }

    BOOKINGS {
        int booking_id PK
        int guest_id FK
        int room_id FK
        date check_in_date
        date check_out_date
    }

    PAYMENTS {
        int payment_id PK
        int booking_id FK
        decimal amount
        date payment_date
        varchar payment_method
    }

    STAFF {
        int staff_id PK
        varchar name
        varchar role
        varchar phone
    }

    SERVICES {
        int service_id PK
        varchar service_name
        decimal price
    }

    BOOKING_SERVICES {
        int id PK
        int booking_id FK
        int service_id FK
        int quantity
    }

    GUESTS ||--o{ BOOKINGS : "makes"
    ROOMS ||--o{ BOOKINGS : "reserved in"
    BOOKINGS ||--o{ PAYMENTS : "paid via"
    BOOKINGS ||--o{ BOOKING_SERVICES : "includes"
    SERVICES ||--o{ BOOKING_SERVICES : "used in"
```

---

## 🔄 Booking Lifecycle Flowchart

```mermaid
flowchart TD
    A([🧑 Guest Arrives]) --> B{Is Guest Registered?}
    B -->|No| C[Register Guest<br/>INSERT INTO guests]
    B -->|Yes| D[Select Guest]
    C --> D

    D --> E[Choose Room & Dates]
    E --> F{{"🔒 TRIGGER: before_booking_insert<br/>Check Date Overlap"}}

    F -->|Overlap Detected| G["❌ SQLSTATE 45000<br/>Booking Blocked"]
    F -->|No Overlap| H["✅ INSERT INTO bookings"]

    H --> I{{"⚡ TRIGGER: after_booking_insert<br/>Room → Booked"}}
    I --> J[Room Status = Booked]

    J --> K[Guest Uses Services]
    K --> L["INSERT INTO booking_services"]

    L --> M([🧾 Checkout Time])
    M --> N{{"📋 PROCEDURE: GenerateFinalBill<br/>Aggregate room rent + services"}}
    N --> O["💰 Generate Invoice Receipt"]
    O --> P[Record Payment<br/>INSERT INTO payments]
    P --> Q([✅ Booking Complete])

    style F fill:#fef3c7,stroke:#f59e0b,color:#78350f
    style I fill:#d1fae5,stroke:#10b981,color:#065f46
    style N fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style G fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
```

---

## 🔐 Stored Procedures & Triggers

### Stored Procedures

```mermaid
flowchart LR
    subgraph SP1["CheckRoomAvailability"]
        direction TB
        IN1["📥 Input: room_type,<br/>check_in, check_out"] --> Q1["SELECT rooms<br/>WHERE status = Available<br/>AND no date overlap"]
        Q1 --> OUT1["📤 Output: List of<br/>available room_ids"]
    end

    subgraph SP2["GenerateFinalBill"]
        direction TB
        IN2["📥 Input: guest_id"] --> Q2["Calculate room rent<br/>(days × price_per_day)"]
        Q2 --> Q3["Sum service charges<br/>(quantity × price)"]
        Q3 --> OUT2["📤 Output: Itemized<br/>receipt with grand total"]
    end

    style SP1 fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#e0f2fe
    style SP2 fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#ede9fe
```

### Triggers

| Trigger | Event | Action |
|---|---|---|
| `after_booking_insert` | After `INSERT` on `bookings` | Sets the booked room's status to `"Booked"` |
| `before_booking_insert` | Before `INSERT` on `bookings` | Checks for date overlap on the same room; raises `SQLSTATE 45000` if conflict found |

---

## 🔍 The 10 SQL Queries

| # | Query Description | SQL Concepts Used |
|---|---|---|
| 1 | List all guests with their booking details | `INNER JOIN` |
| 2 | Find rooms that have never been booked | `LEFT JOIN`, `IS NULL` |
| 3 | Calculate total revenue per room type | `GROUP BY`, `SUM`, `JOIN` |
| 4 | Find the guest with the most bookings | `COUNT`, `GROUP BY`, `ORDER BY`, `LIMIT` |
| 5 | List bookings with total payment amounts | `LEFT JOIN`, `SUM`, `GROUP BY` |
| 6 | Find rooms booked in a specific date range | `WHERE`, `BETWEEN` |
| 7 | List staff members and the number of rooms they manage | `JOIN`, `COUNT`, `GROUP BY` |
| 8 | Find guests who have used specific services | `INNER JOIN`, multi-table join |
| 9 | Calculate average room price by type | `AVG`, `GROUP BY` |
| 10 | Find bookings where payment exceeds room price | `HAVING`, `Subquery`, `Comparison` |

---

## 📁 Project Structure

```
DBMS-ad044-project/
│
├── 📄 README.md                    ← You are here
├── 📦 package.json                 ← Root project metadata
│
├── 🗄️ database/
│   ├── schema.sql                  ← Tables, triggers, stored procedures, mock data
│   └── queries.sql                 ← The 10 required SQL queries with commentary
│
├── ⚙️ backend/
│   ├── package.json                ← Express dependencies
│   ├── server.js                   ← REST API routes, procedure calls, trigger demos
│   └── .env                        ← MySQL credentials (DB_PASSWORD)
│
└── 🖥️ frontend/
    ├── package.json                ← React / Vite dependencies
    ├── index.html                  ← Entry point
    ├── vite.config.js              ← Dev server config (port 3000 → proxy to 5000)
    └── src/
        ├── App.jsx                 ← Full dashboard UI (CRUD, procedures, triggers)
        ├── App.css                 ← Premium glassmorphic vanilla CSS stylesheet
        └── api.js                  ← Fetch wrapper for backend API calls
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** v18+ and **npm** 
- **MySQL** 8.0+ (with root access)

### Step 1 — Initialize the Database

```bash
cd DBMS-ad044-project
mysql -u root -p < database/schema.sql
```

Verify it worked:
```sql
mysql -u root -p
USE hotel_management;
SHOW TABLES;
-- You should see: bookings, booking_services, guests, payments, rooms, services, staff
```

### Step 2 — Start the Backend

```bash
cd backend
npm install
```

Edit `backend/.env` and set your MySQL password:
```env
DB_PASSWORD=your_actual_mysql_password
```

```bash
npm run dev
```
> ✅ Expected: `Backend server listening on http://localhost:5000`

### Step 3 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```
> ✅ Expected: Vite opens `http://localhost:3000` in your browser

---

## 🖥️ Application Walkthrough

```mermaid
flowchart LR
    A["📊 Dashboard"] --> B["👥 Guests"]
    B --> C["🛏️ Rooms & Staff"]
    C --> D["📅 Bookings"]
    D --> E["🔍 10 Queries"]
    E --> F["⚙️ Procedures<br/>& Triggers"]

    style A fill:#06b6d4,stroke:#0891b2,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style D fill:#ec4899,stroke:#db2777,color:#fff
    style E fill:#f59e0b,stroke:#d97706,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
```

| Tab | What You Can Do |
|---|---|
| **📊 Dashboard** | View live room status grid, occupancy metrics, quick refresh |
| **👥 Guests** | Add / Edit / Delete guests, search by name/phone/ID |
| **🛏️ Rooms & Staff** | Manage room catalogue, register/edit staff members |
| **📅 Bookings** | Create reservations (triggers auto-fire), record payments |
| **🔍 10 Queries** | Execute any of the 10 queries, view SQL code + result grid |
| **⚙️ Procedures & Triggers** | Run `CheckRoomAvailability`, `GenerateFinalBill`, trigger demos |

---

## 🧪 Testing Triggers (Demo)

### Trigger 1 — Auto Room Status Update
1. Go to **📅 Bookings** → create a booking for an *Available* room
2. Watch the room card on **📊 Dashboard** flip from 🟢 Available → 🔵 Booked

### Trigger 2 — Date Overlap Prevention
1. Go to **⚙️ Procedures & Triggers** → Trigger Demo section
2. Try booking **Room 23** from `2026-06-12` to `2026-06-15` (already booked)
3. The database fires `SQLSTATE 45000` and the UI shows the error alert

---

## 📊 Tech Stack Summary

```mermaid
pie title Technology Distribution
    "React (Frontend)" : 40
    "Express.js (API)" : 20
    "MySQL (Database)" : 30
    "Vite (Build Tool)" : 10
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ by InnKeep Team**

_A DBMS Project — Database Systems Course_

</div>
]]>
