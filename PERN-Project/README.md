# PERN Project Management App

This repository is a PERN-stack project management application built with:
- PostgreSQL + Prisma for backend data modeling
- Express.js for REST API controllers and routing
- React + Redux Toolkit for frontend UI and state management
- JWT cookie authentication for secure sessions

---

## Project Overview

The app supports:
- user registration, login, logout
- role-based access control
- project creation, editing, deletion
- project membership management (add/remove developers)
- protected dashboard with project details

---

## Backend

### Prisma Models

`backend/prisma/schema.prisma` defines the main models:

#### User
- `id: String @id @default(uuid())`
- `name: String`
- `email: String @unique`
- `password: String`
- `role: Role @default(DEVELOPER)`
- `avatar: String?`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`
- `ownedProjects: Project[]` — one-to-many relation for projects this user owns
- `memberOfProjects: Project[]` — many-to-many relation for projects this user belongs to

#### Project
- `id: String @id @default(uuid())`
- `name: String`
- `key: String @unique`
- `description: String?`
- `ownerId: String`
- `owner: User` — relation to the project owner
- `members: User[]` — many-to-many relation for project members
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

#### Relationships
- One `User` owns many `Project`
- Many `User` can belong to many `Project` via the implicit join table `ProjectMembers`

---

### Backend Controllers

#### `backend/controllers/user.controller.js`

- `getMe(req, res)`
  - returns the authenticated user based on `req.user.userId`
- `registerUser(req, res)`
  - creates a new user with `name`, `email`, `password`, and `role`
  - hashes password with bcrypt
  - returns a JWT cookie
- `loginUser(req, res)`
  - verifies email/password
  - sets `token` cookie on success
- `logoutUser(req, res)`
  - clears the auth cookie
- `getDevelopers(req, res)`
  - returns users with role `DEVELOPER`
  - used in the dashboard member-add flow

#### `backend/controllers/project.controller.js`

- `createProject(req, res)`
  - creates a project using the authenticated user as owner
  - checks duplicate `key`
- `getProjects(req, res)`
  - returns projects where user is owner or member
  - includes owner info and member count
- `getProjectById(req, res)`
  - returns a project by id with owner and member details
- `addMemberToProject(req, res)`
  - adds a user to a project member list
- `removeMemberFromProject(req, res)`
  - removes a user from a project member list
- `deleteProject(req, res)`
  - deletes a project by id
- `editProject(req, res)`
  - updates project name, key, and description

---

### Backend Routes

#### `backend/routes/user.route.js`
- `GET /api/users/` — authenticated
- `GET /api/users/developers` — authenticated `PROJECT_MANAGER`
- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/logout` — authenticated

#### `backend/routes/project.route.js`
- `POST /api/projects/` — authenticated `PROJECT_MANAGER`
- `GET /api/projects/` — authenticated
- `GET /api/projects/:id` — authenticated
- `PUT /api/projects/members/add` — authenticated `PROJECT_MANAGER`
- `PUT /api/projects/members/remove` — authenticated `PROJECT_MANAGER`
- `PUT /api/projects/:id` — authenticated `PROJECT_MANAGER`
- `DELETE /api/projects/:id` — authenticated `PROJECT_MANAGER`

---

### Backend Middleware

- `authMiddleware` reads JWT cookie and attaches `req.user`
- `authorizeRole(...)` restricts access by user role
- `cookieParser()` enables cookie handling
- `cors()` allows requests from `http://localhost:5173`

---

## Frontend

### API Client

`frontend/src/utils/apiRequest.js`
- axios instance with `baseURL` from `import.meta.env.VITE_API_ENDPOINT`
- `withCredentials: true` sends auth cookie
- interceptor redirects to `/login` on `401`

### Redux State

`frontend/src/features/usersSlice.js`
- stores `currentUser`, `isCheckingAuth`, `loading`, and `error`
- actions:
  - `setCurrentUser`
  - `setCheckingAuth`
  - `setLoading`
  - `setError`
  - `clearError`
  - `logout`

### App Routing

`frontend/src/App.jsx`
- checks auth on mount with `GET /api/users/`
- protects routes using `GuestRoute` and `ProtectedRoute`
- routes:
  - `/login`
  - `/register`
  - `/dashboard`

### Login Page

`frontend/src/pages/Login.jsx`
- POST `/api/users/login`
- dispatches `setCurrentUser` on success
- navigates to `/dashboard`
- shows validation and auth errors

### Register Page

`frontend/src/pages/Register.jsx`
- POST `/api/users/register`
- sends `name`, `email`, `password`, `role`
- navigates to `/login` after success

### Dashboard Page

`frontend/src/pages/Dashboard.jsx`

Key frontend functions:
- `fetchProjects()`
  - GET `/api/projects`
  - loads project cards and counts
- `fetchProjectDetails(projectId)`
  - GET `/api/projects/:id`
  - shows project details modal
- `fetchDevelopers()`
  - GET `/api/users/developers`
  - loads developer list for member assignment
- `handleAddMember()`
  - PUT `/api/projects/members/add`
  - body: `{ projectId, userId }`
  - refreshes project details and projects list
- `handleProjectSubmit()`
  - POST `/api/projects`
  - body: `{ name, key, description }`

Other dashboard behavior:
- only `PROJECT_MANAGER` can create projects
- only `PROJECT_MANAGER` can add/remove project members
- project cards open a detail modal with owner and member info
- uses current user role to conditionally render manager actions

---

## API Call Examples

### Login

```js
const response = await apiRequest.post("/users/login", {
  email,
  password,
});
```

### Register

```js
await apiRequest.post("/users/register", {
  name,
  email,
  password,
  role,
});
```

### Get current user

```js
const response = await apiRequest.get("/users/");
```

### Get projects

```js
const response = await apiRequest.get("/projects");
```

### Get project details

```js
const response = await apiRequest.get(`/projects/${projectId}`);
```

### Create a project

```js
await apiRequest.post("/projects", {
  name,
  key,
  description,
});
```

### Add project member

```js
await apiRequest.put("/projects/members/add", {
  projectId,
  userId,
});
```

### Remove project member

```js
await apiRequest.put("/projects/members/remove", {
  projectId,
  userId,
});
```

### Edit project

```js
await apiRequest.put(`/projects/${projectId}`, {
  name,
  key,
  description,
});
```

### Delete project

```js
await apiRequest.delete(`/projects/${projectId}`);
```

---

## Environment

Frontend expects the environment variable:
- `VITE_API_ENDPOINT` — base URL for backend API (for example `http://localhost:3000/api`)

Backend expects:
- `PORT`
- `JWT_SECRET`
- `DATABASE_URL`

---

## Notes

- The backend uses Prisma to manage the database schema and relations.
- The frontend relies on cookies for authentication, so `withCredentials: true` is required.
- The application currently stores auth state in Redux and protects routes via React Router.
