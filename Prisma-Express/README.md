# Prisma-Express

A Node.js Express API application using Prisma ORM for PostgreSQL database management.

## Prerequisites

- Node.js (version 16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
   `ash
   git clone <repository-url>
   cd Prisma-Express
   `

2. Install dependencies:
   `ash
   npm install
   `

3. Install Prisma CLI as a dev dependency:
   `ash
   npm install prisma --save-dev
   `

## Database Setup

1. Initialize Prisma with PostgreSQL provider:
   `ash
   npx prisma init --datasource-provider postgresql --output ../generated/prisma
   `

2. Configure your database connection in the generated prisma/schema.prisma file or in your environment variables.

3. Run the initial migration:
   `ash
   npx prisma migrate dev --name init
   `

4. Install additional Prisma packages:
   `ash
   npm install @prisma/client pg @prisma/adapter-pg
   `

5. Generate the Prisma client:
   `ash
   npx prisma generate
   `

## Configuration

### Database Configuration

Create a .env file in the root directory with your database connection string:

`env
DATABASE_URL="postgresql://username:password@localhost:5432/prisma-express"
`

### Prisma Client Setup

The application uses a custom Prisma client setup with PostgreSQL adapter. See db/db.config.js for the configuration:

`javascript
import "dotenv/config";
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
`

## Running the Application

1. Start the server:
   `ash
   npm start
   `

   Or for development with auto-reload:
   `ash
   npm run dev
   `

2. The server will start on the configured port (default: 3000).

## API Endpoints

The application includes user-related endpoints. See outes/userRoutes.js for available routes.

Example:
- GET /users - Retrieve all users
- POST /users - Create a new user

## Project Structure

`
Prisma-Express/
├── controller/
│   └── userController.js
├── db/
│   └── db.config.js
├── generated/
│   └── prisma/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── routes/
│   └── userRoutes.js
├── server.js
├── package.json
└── README.md
`

## Scripts

- 
pm run db:generate - Generate Prisma client
- 
pm run db:push - Push schema changes to database
- 
pm run db:seed - Seed the database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
