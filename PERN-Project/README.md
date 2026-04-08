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


CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200),
  description TEXT,
  status VARCHAR(50), -- TODO, IN_PROGRESS, DONE
  priority VARCHAR(20), -- LOW, MEDIUM, HIGH
  assignee_id UUID REFERENCES users(id),
  reporter_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  goal TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT,
  author_id UUID REFERENCES users(id),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);  