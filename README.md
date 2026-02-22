# Event-Booking-and-Refund-System
Project Overview

This Event Booking & Refund System is a web application designed to help banquet halls and catering businesses manage event bookings, payments, seat availability, and refunds. The system ensures that no event is double-booked and handles bookings and refunds atomically to maintain data integrity.

Key features include:

Booking management: Allows customers to book events and manage reservations.

Refund system: Handles cancellations and refunds automatically.

Concurrency control: Ensures that multiple users cannot book the same seat at the same time.

Role-based access control: Different user roles (admin, event organizer, customer) with appropriate permissions.

The application leverages PostgreSQL for the database, Node.js for the backend API, and React for the frontend.

Tech Stack

Frontend:

React: A JavaScript library for building user interfaces. React allows for the creation of reusable components, making the development process faster and more efficient.

Backend:

Node.js: A JavaScript runtime built on Chrome’s V8 engine. It’s used to build scalable network applications and servers.

Express.js: A minimal and flexible Node.js web application framework that provides robust features for web and mobile applications.

Database:

PostgreSQL: A powerful, open-source relational database system. It’s used to manage event bookings, seat availability, payments, and refund data. PostgreSQL ensures data integrity and supports complex queries and transactions.

DBeaver: A universal database management tool used to interact with PostgreSQL, view tables, manage records, and perform complex queries.
