# Prisma-Express

A simple Node.js Express API using Prisma ORM with PostgreSQL.

## Prerequisites

- Node.js 16 or newer
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Prisma-Express
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Prisma CLI as a development dependency:
   ```bash
   npm install prisma --save-dev
   ```

## Database Setup

1. Initialize Prisma for PostgreSQL:
   ```bash
   npx prisma init --datasource-provider postgresql --output ../generated/prisma
   ```

2. Update the database connection settings in `prisma/schema.prisma` or in a `.env` file.

3. Run the initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Install the Prisma runtime and PostgreSQL adapter:
   ```bash
   npm install @prisma/client pg @prisma/adapter-pg
   ```

5. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

## Configuration

### Environment

Create a `.env` file at the project root with the database URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/prisma-express"
```

### Prisma Client

The app uses a custom Prisma client with a PostgreSQL adapter. Example configuration in `db/db.config.js`:

```javascript
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

## Running the App

Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server listens on the configured port, typically `3000`.

## API Endpoints

The project includes user and comment endpoints. See `routes/userRoutes.js`, `routes/commentRoutes.js`, and `routes/postRoutes.js` for the full route list.

Common endpoints:
- `GET /users` - List all users
- `POST /users` - Create a new user
- `GET /comments` - List all comments
- `PUT /comments/:id` - Update a comment
- `DELETE /comments/:id` - Delete a comment

## Project Structure

```text
Prisma-Express/
├── controller/
│   ├── commentController.js
│   ├── postController.js
│   └── userController.js
├── db/
│   └── db.config.js
├── generated/
│   └── prisma/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── routes/
│   ├── commentRoutes.js
│   ├── postRoutes.js
│   └── userRoutes.js
├── server.js
├── package.json
└── README.md
```

## NPM Scripts

- `npm run db:generate` - Generate the Prisma client
- `npm run db:push` - Push schema changes to the database
- `npm run db:seed` - Seed the database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Open a pull request

## License

This project is licensed under the MIT License.

