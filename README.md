# Event Booking and Refund System - Backend

A robust Node.js and Express.js backend system designed for managing hall bookings, services, food menus, and financial transactions. This system is built with a focus on data integrity, security, and scalable architecture.

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Distinct permissions for `Admin`, `Staff`, and `Customer` roles.
* **ACID Compliant Transactions:** Critical flows (like Booking and Payments) use `BEGIN`, `COMMIT`, and `ROLLBACK` to ensure data consistency.
* **Double-Booking Protection:** Advanced SQL constraints and logic prevent overlapping reservations for the same hall, date, and slot.
* **Financial Engine:** Automated invoice calculation and a logic-based refund system that adjusts based on the cancellation timeline.
* **Security:** Password hashing using `bcrypt` and stateless session management via `jsonwebtoken` (JWT).

## 🛠 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL (Hosted on Supabase)
* **Authentication:** JWT (JSON Web Tokens)
* **Documentation:** OpenAPI 3.0 (Swagger)

## 📋 Prerequisites

* Node.js (v18.x or later)
* npm (v9.x or later)
* PostgreSQL Database instance

## ⚙️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd Backend
