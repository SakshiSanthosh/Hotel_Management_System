# Grand Horizon - Hotel Management System (DBMS Project)

This repository contains the complete codebase and database design for a **Hotel Management System** DBMS project. It includes database schema design, triggers, stored procedures, 10 advanced queries, and a modern React frontend dashboard with an Express API backend.

## Project Structure

```
DBMS-ad044-project/
├── database/
│   ├── schema.sql         # Database tables, triggers, stored procedures, and mock data
│   └── queries.sql        # The 10 required SQL queries with detailed commentary
├── backend/
│   ├── package.json       # Express backend dependencies
│   ├── server.js          # API server exposing CRUD routes, procedures & triggers
│   └── .env               # Database credentials configurations
└── frontend/
    ├── package.json       # React / Vite project dependencies
    ├── index.html         # Web app entry point
    ├── vite.config.js     # Dev server configuration
    └── src/
        ├── App.jsx        # Dashboard UI (CRUD, Stored Procedures, Triggers Sandbox)
        ├── App.css        # Premium glassmorphic Vanilla CSS stylesheet
        └── api.js         # Axios-like Fetch wrapper for backend API
```

---

## 🛠️ Step-by-Step CMD Setup & Run Instructions

Follow these exact commands inside your Command Prompt (CMD) to configure and run the project locally.

### Step 1: Initialize Database & Tables
First, import the schema, stored procedures, triggers, and mock data into your local MySQL server.
1. Open your **Command Prompt (CMD)**.
2. Navigate to your project directory:
   ```cmd
   cd C:\Users\Sakshi\.gemini\antigravity-ide\scratch\DBMS-ad044-project
   ```
3. Run the database configuration file (you will be prompted to enter your MySQL root password):
   ```cmd
   mysql -u root -p < database/schema.sql
   ```
4. Verify database creation by logging into MySQL CMD:
   ```cmd
   mysql -u root -p
   ```
   Then run:
   ```sql
   USE hotel_management;
   SHOW TABLES;
   ```

---

### Step 2: Start Express Backend
1. Open a **new Command Prompt window**.
2. Navigate to the `backend` directory:
   ```cmd
   cd C:\Users\Sakshi\.gemini\antigravity-ide\scratch\DBMS-ad044-project\backend
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. **Configure your Database Password**:
   Open the `backend/.env` file in a text editor and update the `DB_PASSWORD` parameter with your local MySQL password:
   ```env
   DB_PASSWORD=your_actual_mysql_password
   ```
5. Start the backend API server:
   ```cmd
   npm run dev
   ```
   *Expected Output: `Backend server listening on http://localhost:5000` & `Successfully connected to MySQL database: hotel_management`*

---

### Step 3: Start React Frontend
1. Open a **third Command Prompt window**.
2. Navigate to the `frontend` directory:
   ```cmd
   cd C:\Users\Sakshi\.gemini\antigravity-ide\scratch\DBMS-ad044-project\frontend
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Start the frontend development server:
   ```cmd
   npm run dev
   ```
   *Vite will compile and automatically open the application in your browser at `http://localhost:3000`.*

---

## 🔍 Database Operations Covered in Frontend UI

- **Insert Operation**: Go to **Guests**, **Rooms**, or **Bookings** tab to add records.
- **Update Operation**: Edit guest, room, or staff details in their respective listings.
- **Delete Operation**: Cancel bookings or delete customer records.
- **Display Records**: The dashboard displays live rooms and registry logs.
- **10 Core Queries**: Click the **10 Queries** tab to run any query and inspect the output grid and SQL code.
- **Stored Procedures**:
  - `CheckRoomAvailability`: Query empty rooms of a specific type within selected check-in/out dates.
  - `GenerateFinalBill`: Dynamically aggregates room rent and service usage prices to output a printable invoice receipt.
- **Integrity Triggers**:
  - `after_booking_insert`: Creating a booking changes room status from `Available` to `Booked`.
  - `before_booking_insert`: Try reserving Room 23 from `2026-06-12` to `2026-06-15` in the **Procedures & Triggers** tab to see the database block it and display a `45000` SQLSTATE warning.

---

## 🚀 Push to GitHub Instructions

To upload this project to your GitHub repository `DBMS-ad044-project`:
1. Open CMD in the main project directory:
   ```cmd
   cd C:\Users\Sakshi\.gemini\antigravity-ide\scratch\DBMS-ad044-project
   ```
2. Initialize Git:
   ```cmd
   git init
   ```
3. Add files:
   ```cmd
   git add .
   ```
4. Commit changes:
   ```cmd
   git commit -m "Initial commit: Hotel Management System complete DBMS project"
   ```
5. Rename the default branch:
   ```cmd
   git branch -M main
   ```
6. Link to your GitHub remote repository:
   ```cmd
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/DBMS-ad044-project.git
   ```
7. Push to GitHub:
   ```cmd
   git push -u origin main
   ```
