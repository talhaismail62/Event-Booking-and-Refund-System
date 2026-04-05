# Event Hall Booking System

## Project Overview

The **Event Hall Booking System** is a full-stack web application
designed to simplify the reservation and management of event venues. The
platform allows customers to book event halls, staff members to monitor
bookings, and administrators to manage system resources and business
rules.


**Team Member:**\
Talha Ismail (BSCS24118)

------------------------------------------------------------------------

# Features

### Customer

-   Create event hall bookings
-   Cancel existing bookings
-   View current and past reservations
-   Access personal booking dashboard

### Staff

-   View all system bookings
-   Monitor hall schedules

### Admin

-   Manage halls
-   Manage food services and additional services
-   View all bookings
-   Cancel bookings if required
-   Control system business rules

------------------------------------------------------------------------

# Tech Stack

### Frontend

-   React

### Backend

-   Node.js
-   Express.js

### Database

-   PostgreSQL
-   Supabase

### Authentication

-   JWT

------------------------------------------------------------------------

# System Architecture

The system follows a **client-server architecture**.

1.  The **React frontend** provides the user interface and communicates
    with the backend through REST APIs.
2.  The **Express.js backend** processes requests, handles
    authentication, and enforces Role-Based Access Control (RBAC).
3.  The **PostgreSQL database** stores user information, hall data,
    bookings, and other system records.
4.  **JWT authentication** ensures secure access to protected routes.

Frontend (React)\
↓ REST API\
Backend (Node.js + Express)\
↓\
Database (PostgreSQL)

------------------------------------------------------------------------

# UI Examples

### Customer Dashboard

![Customer Dashboard](./media/customer-dashboard.png)

**Purpose:**\
The customer dashboard allows users to:

-   Create new bookings
-   View active bookings
-   Cancel bookings if needed

------------------------------------------------------------------------

# Installation & Setup

## Prerequisites

Before running the project, ensure you have:

-   Node.js
-   Supabase
-   npm

------------------------------------------------------------------------

# Database Setup

1.  Open Supabase terminal.

2.  Run the schema file:

3.  Seed the database:

------------------------------------------------------------------------

# Backend Setup

Navigate to backend folder:

``` bash
cd backend
```

Install dependencies:

``` bash
npm install
```

Create `.env` file:

DATABASE_URL=postgres://user:password@localhost:5432/your_db_name\
JWT_SECRET=your_secret_key\
PORT=3000

Start the server:

``` bash
npm run start
```

Backend runs at:

http://localhost:3000

------------------------------------------------------------------------

# Frontend Setup

Navigate to frontend folder:

``` bash
cd frontend
```

Install dependencies:

``` bash
npm install
```

Create `.env` file:

VITE_API_URL=http://localhost:3000/api

Run development server:

``` bash
npm run dev
```

Frontend runs at:

http://localhost:5173

------------------------------------------------------------------------

# User Roles

  -----------------------------------------------------------------------
  Role                Permissions
  ------------------- ---------------------------------------------------
  **Admin**           View all bookings, manage halls, services, and food
                      items

  **Staff**           View all bookings across the system

  **User**            Create bookings, cancel bookings, view booking
                      history
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Database Transaction Scenarios

### Scenario 1: Concurrent Bookings

Two users attempt to book the **same hall at the same time slot
simultaneously**.

-   Only **one booking succeeds**.
-   The other transaction is **rolled back**.

This prevents double bookings.

------------------------------------------------------------------------

### Scenario 2: User Cancellation

A user cancels an existing booking.

-   The system processes the cancellation inside a **database
    transaction**.
-   If any step fails, the **entire transaction is rolled back**.
-   If successful, the booking is removed and the hall becomes
    **available again**.

------------------------------------------------------------------------

# ACID Compliance

The system maintains **ACID properties** through PostgreSQL
transactions.

### Atomicity

All booking operations succeed completely or fail completely.

### Consistency

Database rules and constraints remain valid after every transaction.

### Isolation

Simultaneous transactions do not interfere with each other.

### Durability

Once a transaction is committed, the data remains permanently stored.

------------------------------------------------------------------------

# Security

The system includes the following security mechanisms:

-   JWT Authentication
-   Role-Based Access Control
-   Protected API Routes
-   Environment Variables for sensitive data

------------------------------------------------------------------------