# PMS - Professional Project Management Suite

PMS is a high-velocity project management platform built on the **PERN stack** (PostgreSQL, Express, React, Node.js). Inspired by the Atlassian Design System, it provides a powerful yet minimal interface for teams to track projects, manage complex issue lifecycles, and plan roadmaps with precision.

---

## 🚀 Key Functionality

### 🔐 Authentication & Identity
- **Role-Based Access Control (RBAC)**: Supports `ADMIN`, `PROJECT_MANAGER`, and `DEVELOPER` roles with granular permission gating.
- **Secure Sessions**: JWT-based authentication stored in secure HTTP-only cookies.
- **Dynamic Onboarding**: Multi-step registration with role selection (Developer, Project Manager, Admin).

### 📁 Project Management
- **Workspaces**: Create and manage multiple projects with unique **Project Keys** (e.g., `CORE`, `MKTG`).
- **Ownership & Members**: Explicit project ownership, add/remove members with instant notifications.
- **ADMIN Access**: Admin role bypasses membership filters — sees all projects and issues across the workspace.
- **Project Summaries**: High-level stats for active tasks, team size, and overall progress.

### 📋 Issue & Task Tracking
- **Interactive Kanban Board**: Drag-and-drop issues between status columns (`To Do`, `In Progress`, `Done`).
- **Granular Subtasks**: Break down complex issues into actionable subtasks with interactive progress bars.
- **Priority Gating**: Color-coded priority indicators (High, Medium, Low) and advanced filtering.
- **Issue Backlog**: Manage unassigned issues with direct sprint assignment from the backlog view.
- **Activity Log**: Full audit trail per issue — who changed status, priority, assignee, or title with timestamps.
- **Issue Activity Drawer**: Slide-in timeline panel accessible directly from Kanban cards.

### 🏃 Sprint Lifecycle
- **Sprint Planning**: Create sprints with specific timelines, goals, start/end dates.
- **Auto Status Sync**: Sprint status auto-transitions based on issue changes:
  - Issue → `IN_PROGRESS` → Sprint auto-starts (`ACTIVE`)
  - All issues → `DONE` → Sprint auto-completes (`COMPLETED`)
  - Issue moved back → Sprint reverts to `ACTIVE` or `PLANNED`
- **Sprint Insights**: Track velocity and completion rates via analytics dashboard.
- **Due Date Smart Assignment**: Selecting a sprint auto-fills issue due date; picking a due date auto-selects the matching sprint.

### 🗺️ Implementation Roadmap
- **Stepped Progress**: A specialized view tracing exact execution steps of a project.
- **Hierarchy**: Links high-level issues to granular subtask completion for precise status reporting.
- **Live Sync**: Subtask toggles instantly update issue status and overall progress bars.

### 📅 Project Calendar
- **Monthly Calendar View**: All project issues with due dates displayed on a visual calendar grid.
- **Developer Assignment**: Each calendar entry shows the assigned developer.
- **Overdue & Due Today**: Color-coded indicators (red = overdue, yellow = due today).
- **Month Task List**: Sorted list of all tasks due in the current month below the calendar.

### 💬 Discussion & Comments
- **Threaded Comments**: Per-issue discussion threads with post and delete support.
- **@Mention Tagging**: Type `@` to mention team members with autocomplete dropdown — sends `MENTION` notification.
- **Mention Highlighting**: `@username` rendered as indigo highlighted chips in comment body.
- **Role-based Delete**: Comment authors, ADMIN, and PROJECT_MANAGER can delete comments.

### 🔔 Notifications (7 Types)
| Type | Trigger |
| :--- | :--- |
| `ASSIGNMENT` | Issue assigned / added to project team |
| `HANDOVER` | Issue reassigned / removed from project team |
| `STATUS_CHANGE` | Issue status changed (PM notifies developer, developer notifies PM) |
| `COMMENT` | Someone comments on an issue you're involved in |
| `MENTION` | Someone @mentions you in a comment |
| `DUE_DATE` | Daily 8AM cron — overdue or due-today issues |
| `HANDOVER` | Removed from project team |

- **Real-time polling**: Notifications refresh every 30 seconds.
- **Mark read / Mark all read**: Individual and bulk read actions.

### 🔍 Global Search
- **Command Palette**: `Ctrl+K` / `Cmd+K` opens a full-screen search modal.
- **Cross-workspace Search**: Searches projects and issues simultaneously in memory.
- **Keyboard Navigation**: `↑↓` to navigate, `Enter` to select, `Escape` to close.
- **Keyword Highlighting**: Matched text highlighted in yellow within results.

---

## 🎨 Client-Side Design

### Design System (ADS)
The application utilizes a custom design system inspired by **Atlassian Design System (ADS)**, implemented using **Tailwind CSS v4** tokens:
- **Colors**: Standardized palette (`ads-primary`, `ads-surface`, `ads-text`, `ads-success`, etc.).
- **Typography**: Optimized hierarchy using the **Inter** font family.
- **Date Format**: Consistent `DD/MM/YY` format across all views.
- **Components**: Reusable UI primitives located in `src/components/ui/`.

### Component Hierarchy
```mermaid
graph TD
    App[App.jsx] --> AppLayout[AppLayout.jsx]
    AppLayout --> Sidebar[Sidebar.jsx]
    AppLayout --> Nav[Top Navigation + GlobalSearch]
    AppLayout --> Dashboard[Dashboard.jsx]

    Dashboard --> Home[DashboardHome.jsx]
    Dashboard --> Projects[ProjectsSection.jsx]
    Dashboard --> Issues[AssignedIssuesSection.jsx]
    Dashboard --> Workspace[Project Workspace]

    Workspace --> Board[ProjectBoardView.jsx]
    Workspace --> Sprints[ProjectSprintsView.jsx]
    Workspace --> Team[ProjectTeamView.jsx]
    Workspace --> Roadmap[ImplementationPlanView.jsx]
    Workspace --> Calendar[ProjectCalendarView.jsx]
    Workspace --> Backlog[BacklogView.jsx]
    Workspace --> Analytics[AnalyticsDashboard.jsx]

    Board --> Kanban[KanbanBoard.jsx]
    Kanban --> Subtasks[SubTaskSection.jsx]
    Kanban --> ActivityDrawer[ActivityDrawer.jsx]
    Board --> IssueModal[IssueModal.jsx]
    IssueModal --> CommentSection[CommentSection.jsx]
    IssueModal --> ActivityLog[ActivityLog.jsx]
```

---

## 🔌 API & Component Mapping

The frontend communicates with the backend via a centralized `apiRequest` (Axios) utility. Base URL configured via `VITE_API_ENDPOINT`.

### 👤 Identity & Users
| API Endpoint | Method | Role Guard | Description | Component |
| :--- | :--- | :--- | :--- | :--- |
| `/api/users/register` | `POST` | Public | Multi-step user onboarding | `Register.jsx` |
| `/api/users/login` | `POST` | Public | Secure session initialization | `Login.jsx` |
| `/api/users/logout` | `POST` | Auth | Session termination | `Sidebar.jsx` |
| `/api/users` | `GET` | Auth | Fetch current session user | `App.jsx` |
| `/api/users/profile` | `PUT` | Auth | Update profile (Name/Password) | `ProfileSettings.jsx` |
| `/api/users/developers` | `GET` | PM | List available developers | `ProjectTeamView.jsx` |

### 📁 Projects & Workspaces
| API Endpoint | Method | Role Guard | Description | Component |
| :--- | :--- | :--- | :--- | :--- |
| `/api/projects` | `GET` | Auth | List accessible projects (ADMIN = all) | `ProjectsSection.jsx` |
| `/api/projects` | `POST` | PM / ADMIN | Create new project workspace | `ProjectModal.jsx` |
| `/api/projects/:id` | `GET` | Auth | Fetch project details & issues | `ProjectBoardView.jsx` |
| `/api/projects/:id` | `PUT` | PM / ADMIN | Edit project metadata | `ProjectModal.jsx` |
| `/api/projects/:id` | `DELETE` | PM / ADMIN | Permanent project removal | `ProjectsSection.jsx` |
| `/api/projects/members/add` | `PUT` | PM / ADMIN | Add member + send notification | `ProjectTeamView.jsx` |
| `/api/projects/members/remove` | `PUT` | PM / ADMIN | Remove member + send notification | `ProjectTeamView.jsx` |

### 📋 Issues & Tasks
| API Endpoint | Method | Role Guard | Description | Component |
| :--- | :--- | :--- | :--- | :--- |
| `/api/issues` | `GET` | Auth | Fetch issues (ADMIN = all, DEV = assigned) | `AssignedIssuesSection.jsx` |
| `/api/issues` | `POST` | Auth | Create new issue/task | `IssueModal.jsx` |
| `/api/issues/:id` | `GET` | Auth | Fetch single issue details | `IssueModal.jsx` |
| `/api/issues/:id` | `PUT` | Auth | Update issue — triggers sprint auto-sync | `KanbanBoard.jsx`, `IssueModal.jsx` |
| `/api/issues/:id` | `DELETE` | PM / ADMIN | Permanent issue removal | `IssueModal.jsx` |
| `/api/issues/:id/activity` | `GET` | Auth | Fetch issue activity log | `ActivityLog.jsx`, `ActivityDrawer.jsx` |

### 🏃 Sprints & Analytics
| API Endpoint | Method | Role Guard | Description | Component |
| :--- | :--- | :--- | :--- | :--- |
| `/api/sprints` | `GET` | Auth | List sprints (optionally by projectId) | `ProjectSprintsView.jsx` |
| `/api/sprints` | `POST` | PM / ADMIN | Initialize new sprint | `SprintModal.jsx` |
| `/api/sprints/:id` | `PUT` | PM / ADMIN | Update sprint / transition status | `ProjectSprintsView.jsx` |
| `/api/sprints/:id` | `DELETE` | PM / ADMIN | Remove planned/old sprint | `ProjectSprintsView.jsx` |
| `/api/sprints/insights/:projectId` | `GET` | Auth | Velocity & completion metrics | `AnalyticsDashboard.jsx` |

### ✅ SubTasks
| API Endpoint | Method | Role Guard | Description | Component |
| :--- | :--- | :--- | :--- | :--- |
| `/api/subtasks/:issueId` | `POST` | Auth | Create granular subtask | `SubTaskSection.jsx` |
| `/api/subtasks/:id/toggle` | `PATCH` | Auth | Toggle completion — triggers issue & sprint sync | `SubTaskSection.jsx`, `ImplementationPlanView.jsx` |
| `/api/subtasks/:id` | `DELETE` | Auth | Delete subtask | `SubTaskSection.jsx` |

### 💬 Comments
| API Endpoint | Method | Role Guard | Description | Component |
| :--- | :--- | :--- | :--- | :--- |
| `/api/comments/issue/:issueId` | `GET` | Auth | Fetch issue discussion thread | `CommentSection.jsx` |
| `/api/comments` | `POST` | Auth | Add comment + parse @mentions + notify | `CommentSection.jsx` |
| `/api/comments/:id` | `DELETE` | Author / PM / ADMIN | Delete comment | `CommentSection.jsx` |

### 🔔 Notifications
| API Endpoint | Method | Role Guard | Description | Component |
| :--- | :--- | :--- | :--- | :--- |
| `/api/notifications` | `GET` | Auth | Fetch user alerts (last 30) | `NotificationBell.jsx` |
| `/api/notifications/:id/read` | `PATCH` | Auth | Mark specific alert as read | `NotificationBell.jsx` |
| `/api/notifications/read-all` | `PATCH` | Auth | Dismiss all active alerts | `NotificationBell.jsx` |

---

## ⚙️ Automation & Background Jobs

### Sprint Auto-Status Engine
Bidirectional sync between issue status and sprint status — no manual intervention needed:

| Trigger | Condition | Result |
| :--- | :--- | :--- |
| Issue → `IN_PROGRESS` | Sprint is `PLANNED` | Sprint → `ACTIVE` |
| All issues → `DONE` | Sprint is `ACTIVE` | Sprint → `COMPLETED` |
| All issues → `TODO` | Sprint is `ACTIVE` | Sprint → `PLANNED` |
| Issue → `TODO` / `IN_PROGRESS` | Sprint is `COMPLETED` | Sprint → `ACTIVE` |
| Subtask checked | Sprint is `PLANNED` | Sprint → `ACTIVE` |
| Last subtask checked | All issues `DONE` | Sprint → `COMPLETED` |
| Subtask unchecked | Sprint is `COMPLETED` | Sprint → `ACTIVE` |

### Due Date Scheduler (node-cron)
- Runs daily at **8:00 AM**
- Finds all non-DONE issues with a due date and an assignee
- Sends `DUE_DATE` notifications for overdue and due-today issues

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit (Auth/Identity), React Hooks (Component state)
- **Navigation**: React Router v7
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Interactions**: `@hello-pangea/dnd` (Drag & Drop)

### Backend
- **Server**: Node.js & Express.js
- **Database**: PostgreSQL (Neon cloud)
- **ORM**: Prisma (with `@prisma/adapter-pg`)
- **Authentication**: JWT, Bcrypt.js
- **Scheduler**: node-cron (due date notifications)
- **Middleware**: Custom Auth Interceptors, Role Authorizers

### Database Models
| Model | Key Relations |
| :--- | :--- |
| `User` | Owns projects, assigned to issues, writes comments, receives notifications |
| `Project` | Has many issues, sprints, members (M:M with User) |
| `Issue` | Belongs to project & sprint, has subtasks, comments, activities |
| `Sprint` | Belongs to project, has many issues |
| `SubTask` | Belongs to issue |
| `Comment` | Belongs to issue & author |
| `IssueActivity` | Belongs to issue & actor — tracks field changes |
| `Notification` | Belongs to user — 7 types |

---

## 📦 Getting Started

1. **Clone the repository**
2. **Environment Setup**:
   - Create `backend/.env`:
     ```env
     DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
     JWT_SECRET=your_jwt_secret
     PORT=3000
     ```
   - Create `frontend/.env`:
     ```env
     VITE_API_ENDPOINT=http://localhost:3000/api
     ```
3. **Database Setup**:
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```
4. **Run Locally**:
   ```bash
   # Backend
   cd backend && npm run dev

   # Frontend
   cd frontend && npm run dev
   ```

---

## 🔐 Role Permissions Summary

| Feature | DEVELOPER | PROJECT_MANAGER | ADMIN |
| :--- | :---: | :---: | :---: |
| View own assigned issues | ✅ | ✅ | ✅ |
| View all issues | ❌ | ✅ | ✅ |
| Create / edit issues | ✅ (status only) | ✅ | ✅ |
| Delete issues | ❌ | ✅ | ✅ |
| Create / manage projects | ❌ | ✅ | ✅ |
| Add / remove team members | ❌ | ✅ | ✅ |
| Create / manage sprints | ❌ | ✅ | ✅ |
| View all projects | ❌ | ❌ | ✅ |
| Delete comments | Own only | ✅ | ✅ |
