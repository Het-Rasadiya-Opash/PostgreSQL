Basic Roles
ADMIN
Full control (manage users, projects, roles)
PROJECT_MANAGER
Create projects, sprints, assign issues
DEVELOPER
Work on issues, update status
USER
Read-only access


CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(100),
email VARCHAR(150) UNIQUE NOT NULL,
password TEXT NOT NULL,
role VARCHAR(20) DEFAULT 'USER',
avatar TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150),
  key VARCHAR(20) UNIQUE,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);