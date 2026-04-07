# Food Delivery Hub

A robust backend and database solution for a comprehensive Food Delivery Platform, powered by Node.js, Prisma, and PostgreSQL.

## 🚀 Features

-   **Multi-Role User System**: Separate workflows for Admins, Customers, and Delivery Partners.
-   **Restaurant Management**: Detailed tracking of menus, availability, and restaurant statuses.
-   **Advanced Order Tracking**: Real-time status updates from `PENDING` to `DELIVEREED` or `CANCELLED`.
-   **Delivery Assignments**: Automated and manual delivery person assignments with timeline tracking (`assignedAt`, `pickedUpAt`, etc.).
-   **Review & Rating System**: Comprehensive feedback loop for both restaurants and delivery personnel.
-   **Payment Versatility**: Supports Credit Card, Debit Card, UPI, and Cash on Delivery.

## 🛠️ Tech Stack

-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Environment Management**: [dotenv](https://www.npmjs.com/package/dotenv)

## 📊 Database Schema

The core of the application is built on a highly relational PostgreSQL schema managed via Prisma.

### Models Overview

-   **User**: Handles authentication and profiles. Roles include `ADMIN`, `CUSTOMER`, and `DELIVERY`.
-   **Restaurant**: Stores business details, location, and operational status (`OPEN`/`CLOSED`).
-   **MenuItem**: Individual food items linked to restaurants with price, category, and availability.
-   **Order**: Tracks the customer's purchase, restaurant involvement, status, and delivery instructions.
-   **OrderItem**: Specific quantity and price-at-purchase for items within an order.
-   **DeliveryAssignment**: Maps orders to delivery personnel and tracks the handover and delivery times.
-   **Review**: Linked to users (reviewers) and can optionally target a `Restaurant` or a `Delivery Person`.

> [!NOTE]
> Check the full schema in [schema.prisma](file:///d:/PostgreSQL/Food-App/prisma/schema.prisma).

### ER Diagram

![Entity Relationship Diagram](./Untitled.png)

## ⚙️ Setup & Installation

### 1. Prerequisites

-   Node.js (v18.x or higher recommended)
-   PostgreSQL instance

### 2. Configure Environment

Create a `.env` file in the root directory (if not already present) and configure your database connection string:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

Initialize your database and generate the Prisma Client:

```bash
# Push the schema to the database (development)
npx prisma db push

# OR run migrations (production)
# npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

## 🏗️ Project Structure

```text
Food-App/
├── prisma/             # Database schema and migrations
│   └── schema.prisma
├── node_modules/       # Dependencies
├── .env                # Environment variables (ignored by git)
├── package.json        # Project metadata and scripts
└── README.md           # Documentation
```

## 📜 License

This project is licensed under the ISC License.
