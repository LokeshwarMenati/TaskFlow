# TaskFlow — Full-Stack Android To-Do Platform

[![Backend CI / Unit & Integration Tests](https://img.shields.io/badge/Backend%20Tests-26%20Passed-emerald.svg)](#testing--verification)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%20REST-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20CLI-61DAFB.svg)](https://reactnative.dev/)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux%20Toolkit-purple.svg)](https://redux-toolkit.js.org/)

TaskFlow is a production-grade, full-stack Android task management application designed with a **productivity-first aesthetic**, **strict user-scoped multi-tenancy**, and an intelligent **Composite Urgency Ranking Algorithm**.

The project consists of a decoupled architecture with a Node.js/Express TypeScript backend powered by MongoDB and a pure React Native CLI TypeScript mobile application with Redux Toolkit and React Navigation.

---

## 📑 Table of Contents

1. [Project Overview & Key Features](#-project-overview--key-features)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Folder Structure](#-folder-structure)
5. [Prerequisites](#-prerequisites)
6. [Backend Setup & Execution](#-backend-setup--execution)
7. [Environment Variables](#-environment-variables)
8. [Mobile Setup & Android Execution](#-mobile-setup--android-execution)
9. [API Documentation](#-api-documentation)
10. [Authentication Flow & Security](#-authentication-flow--security)
11. [Composite Sort Algorithm & Scoring Weights](#-composite-sort-algorithm--scoring-weights)
12. [Postman Collection](#-postman-collection)
13. [Testing & Verification](#-testing--verification)
14. [Troubleshooting](#-troubleshooting)

---

## 🚀 Project Overview & Key Features

TaskFlow solves the cognitive overhead of standard to-do applications by automatically synthesizing deadline proximity, explicit priority weighting, and scheduled start times into an intelligent task ranking pipeline.

### Core Features

- **Robust Authentication & Session Management**:
  - Email/password registration and authentication with bcrypt hashing.
  - JWT generation and stateless bearer token authentication.
  - Auto-restoration on mobile startup from persistent `AsyncStorage`.
  - Automatic 401 interception: global logout trigger on token expiration.

- **Strict Multi-Tenant Task Scoping**:
  - Every task query is enforced at the database layer using `userId: authenticatedUserId`.
  - Zero chance of cross-tenant data leakage: users can never view, update, or delete other users' tasks.

- **Task Lifecycle & Rich Attributes**:
  - `title`, `description`, `dateTime` (scheduled start), `deadline`, `priority` (`low`, `medium`, `high`), `status` (`pending`, `completed`), `category` / tag.
  - Dedicated virtual `isOverdue` calculation: tasks are overdue **only** when `deadline < now` and `status !== 'completed'`. Completed tasks are never displayed as overdue.

- **Smart Filtering & Sorting**:
  - Dynamic filtering by **Status** (`all`, `pending`, `completed`), **Priority** (`all`, `high`, `medium`, `low`), and **Category**.
  - Sorting options: Smart Urgency (`composite`), Closest Deadline, Priority (High to Low), Creation Date, and Scheduled Date/Time.

- **Polished Productivity UI/UX**:
  - Designed with customized cards, elevation, typography tokens, and responsive padding.
  - Distinct priority indicators (High = Coral/Red, Medium = Amber, Low = Emerald).
  - Checkbox completion toggle with instant visual feedback and strikethrough.
  - Dedicated Add/Edit screen with modal Date/Time pickers, category presets, and duplicate submission locks.
  - Dedicated Task Detail screen with full metadata, status toggle, and delete confirmations.
  - Polished empty states and loading feedback.
  - Pure React Native CLI FlatList implementation (no giant ScrollViews).

---

## 🛠 Technology Stack

### Backend Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 7.x via Mongoose 8.x
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`
- **Validation**: `express-validator`
- **Testing**: Jest, Supertest, MongoMemoryServer

### Mobile Frontend Stack
- **Framework**: React Native CLI (v0.76.5) — Genuine React Native CLI (No Expo)
- **Language**: TypeScript 5.x
- **Navigation**: React Navigation 6.x (`@react-navigation/native`, `@react-navigation/native-stack`)
- **State Management**: Redux Toolkit 2.x (`@reduxjs/toolkit`, `react-redux`)
- **HTTP Client**: Axios 1.7+ with centralized request/response interceptors
- **Persistence**: `@react-native-async-storage/async-storage`
- **Date/Time**: `@react-native-community/datetimepicker`
- **Styling**: Vanilla React Native StyleSheet with unified Design Tokens

---

## 📐 System Architecture

```
+-------------------------------------------------------------------------+
|                              MOBILE APP                                 |
|                       (React Native CLI + TS)                          |
+-------------------------------------------------------------------------+
|  Redux Store (authSlice, tasksSlice) <---> StorageService (AsyncStorage) |
|         |                                                               |
|   Centralized Axios Client (http://10.0.2.2:5000)                       |
|         | (Bearer JWT auto-attached, 401 triggers auto-logout)           |
+---------+---------------------------------------------------------------+
          | HTTP REST API
+---------v---------------------------------------------------------------+
|                           BACKEND API                                   |
|                     (Node.js + Express + TS)                            |
+-------------------------------------------------------------------------+
|  App Middleware: Helmet, CORS, Morgan, Body Parsers                     |
|  Routing: /auth, /tasks, /health                                        |
|  Auth Middleware: Bearer token validation -> req.user                   |
|  Validation Middleware: express-validator schemas                       |
|  Controllers: AuthController, TaskController                            |
|  Services: AuthService, TaskService (Strict userId scoping)             |
|  Error Handling: Centralized AppError & Mongo E11000/CastError handler  |
+-------------------------------------------------------------------------+
                                   |
                         +---------v---------+
                         |     MONGODB       |
                         |  Users & Tasks    |
                         +-------------------+
```

---

## 📂 Folder Structure

```text
Assignment/
├── backend/
│   ├── .env.example                     # Environment variables template
│   ├── jest.config.ts                   # Jest testing configuration
│   ├── package.json                     # Backend scripts and dependencies
│   ├── tsconfig.json                    # Backend TypeScript configuration
│   └── src/
│       ├── app.ts                       # Express application setup
│       ├── index.ts                     # Server entry point & DB connection
│       ├── config/
│       │   ├── db.ts                    # Mongoose database connection
│       │   └── env.ts                   # Validated environment configuration
│       ├── controllers/
│       │   ├── auth.controller.ts       # Register, login, getMe handlers
│       │   └── task.controller.ts       # Task CRUD handlers
│       ├── middleware/
│       │   ├── auth.middleware.ts       # JWT verification middleware
│       │   ├── error.middleware.ts      # Centralized error & 404 handler
│       │   └── validation.middleware.ts # express-validator schemas
│       ├── models/
│       │   ├── Task.ts                  # Task Mongoose schema & virtuals
│       │   └── User.ts                  # User Mongoose schema & bcrypt hooks
│       ├── routes/
│       │   ├── auth.routes.ts           # /auth routes
│       │   ├── index.ts                 # Master router & /health
│       │   └── task.routes.ts           # /tasks routes
│       ├── services/
│       │   ├── auth.service.ts          # Auth business logic
│       │   └── task.service.ts          # User-scoped task business logic
│       ├── types/
│       │   ├── auth.types.ts            # Auth & User interfaces
│       │   ├── express.d.ts             # Express Request augmentation
│       │   └── task.types.ts            # Task types & DTOs
│       ├── utils/
│       │   ├── compositeSort.ts         # Composite ranking algorithm
│       │   ├── jwt.ts                   # JWT sign & verify helpers
│       │   └── response.ts              # Consistent JSON response helper
│       └── __tests__/
│           ├── auth.test.ts             # Auth endpoint integration tests
│           ├── compositeSort.test.ts    # Composite sorting unit tests
│           ├── setup.ts                 # MongoMemoryServer test harness
│           └── task.test.ts             # Task CRUD & user-scoping security tests
├── mobile/
│   ├── App.tsx                          # App root with Redux & SafeArea
│   ├── babel.config.js                  # Metro Babel preset
│   ├── index.js                         # React Native AppRegistry entry
│   ├── metro.config.js                  # Metro bundler config
│   ├── package.json                     # Mobile dependencies
│   ├── react-native.config.js           # CLI asset & native linkage config
│   ├── tsconfig.json                    # Mobile TypeScript config
│   ├── android/                         # Pure Android native project
│   │   ├── build.gradle
│   │   ├── settings.gradle
│   │   └── app/
│   │       ├── build.gradle
│   │       └── src/main/
│   │           ├── AndroidManifest.xml  # Cleartext & network permissions
│   │           ├── java/com/taskflow/
│   │           │   ├── MainActivity.kt
│   │           │   └── MainApplication.kt
│   │           └── res/values/
│   │               ├── strings.xml
│   │               └── styles.xml
│   └── src/
│       ├── components/
│       │   ├── CustomButton.tsx         # Modern button with variants & loading
│       │   ├── CustomInput.tsx          # Styled input with show/hide password
│       │   ├── DateTimePickerModal.tsx  # Cross-platform date/time picker
│       │   ├── EmptyState.tsx           # Polished empty state with CTA
│       │   ├── FilterBar.tsx            # Status, priority & category chips
│       │   ├── LoadingIndicator.tsx     # Loading spinner
│       │   ├── PriorityBadge.tsx        # LOW, MEDIUM, HIGH badge
│       │   ├── SortModal.tsx            # Sort criteria bottom sheet
│       │   └── TaskCard.tsx             # Reusable card with checkbox & actions
│       ├── navigation/
│       │   ├── AppNavigator.tsx         # Auth vs Main stack switcher
│       │   ├── AuthNavigator.tsx        # Login & Register stack
│       │   └── MainNavigator.tsx        # TaskList, AddEdit, Detail stack
│       ├── screens/
│       │   ├── SplashScreen.tsx         # Startup session restoration screen
│       │   ├── auth/
│       │   │   ├── LoginScreen.tsx
│       │   │   └── RegisterScreen.tsx
│       │   └── tasks/
│       │       ├── AddEditTaskScreen.tsx
│       │       ├── TaskDetailScreen.tsx
│       │       └── TaskListScreen.tsx
│       ├── services/
│       │   ├── api.ts                   # Axios client (10.0.2.2 emulator support)
│       │   ├── authService.ts           # Auth API service
│       │   ├── storageService.ts        # AsyncStorage persistence service
│       │   └── taskService.ts           # Task API service
│       ├── store/
│       │   ├── hooks.ts                 # Typed useAppDispatch & useAppSelector
│       │   ├── index.ts                 # Redux store & 401 auto-logout link
│       │   └── slices/
│       │       ├── authSlice.ts         # Auth state & async thunks
│       │       └── tasksSlice.ts        # Task state & async thunks
│       ├── theme/
│       │   ├── colors.ts                # Light, dark, and priority colors
│       │   ├── index.ts                 # Unified theme hook
│       │   └── tokens.ts                # Spacing, typography, radius, shadows
│       ├── types/
│       │   ├── auth.types.ts
│       │   ├── navigation.types.ts
│       │   └── task.types.ts
│       └── utils/
│           ├── dateUtils.ts             # Overdue evaluation & date formatting
│           ├── sorting.ts               # Composite sort algorithm
│           └── validation.ts            # Client validation helpers
├── docs/
│   └── TaskFlow.postman_collection.json # Complete Postman API collection
├── .gitignore                           # Git ignore rules
└── README.md                            # Comprehensive project guide
```

---

## ⚡ Prerequisites

Before running the project locally, verify that you have:
1. **Node.js**: v18.0.0 or higher (`node -v`)
2. **NPM**: v9.0.0 or higher (`npm -v`)
3. **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI
4. **Android Development** (for running native mobile app):
   - Android Studio installed
   - Android SDK (API 34/35) & Command-line Tools
   - Android Virtual Device (AVD) running or physical device connected via USB with USB Debugging enabled

---

## 🖥 Backend Setup & Execution

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your MongoDB instance is running, or set `MONGODB_URI` in `.env`.

### 3. Run Development Server
```bash
npm run dev
```
The server will boot and display:
```text
====================================================
  TaskFlow Backend Server running in [development] mode
  Local Address:            http://localhost:5000
  Android Emulator Address: http://10.0.2.2:5000
  Health Check:             http://localhost:5000/health
====================================================
```

### 4. Build for Production & Run Compiled Code
```bash
npm run build
npm start
```

### 5. Run Automated Tests
```bash
npm test
```
The test suite utilizes `mongodb-memory-server` to spin up an ephemeral in-memory MongoDB engine, validating:
- Authentication & JWT generation
- Duplicate email prevention (409 Conflict)
- User-scoped access controls (cross-tenant security)
- Task CRUD lifecycle
- Composite ranking algorithm

---

## 🔐 Environment Variables

Create `/backend/.env` with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/taskflow

# Security & Authentication
JWT_SECRET=super_secret_jwt_key_taskflow_production_ready_dev_secret_2026
JWT_EXPIRES_IN=7d

# Cross-Origin Resource Sharing
CORS_ORIGIN=*
```

---

## 📱 Mobile Setup & Android Execution

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Backend Host for Networking
- **Android Emulator**: Uses `http://10.0.2.2:5000` (pre-configured as default in `mobile/src/services/api.ts`).
- **Physical Device**: Update the base URL in `mobile/src/services/api.ts` to your workstation's local LAN IP (e.g., `http://192.168.1.100:5000`), or run reverse port forwarding via ADB:
  ```bash
  adb reverse tcp:5000 tcp:5000
  ```

### 3. Start Metro Bundler
```bash
cd mobile
npm run start
```

### 4. Launch on Android Emulator / Device
In a separate terminal window:
```bash
cd mobile
npx react-native run-android
```

---

## 🌐 API Documentation

All responses follow a consistent JSON format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": [ ... ]
}
```

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register user (`email`, `password`) -> Returns JWT and safe user object |
| `POST` | `/auth/login` | Public | Login user (`email`, `password`) -> Returns JWT and safe user object |
| `GET` | `/auth/me` | Bearer JWT | Returns safe profile of authenticated user |

### Task Management Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/tasks` | Bearer JWT | List tasks for authenticated user. Supports `status`, `priority`, `category`, and `sort` query params |
| `POST` | `/tasks` | Bearer JWT | Create task scoped to authenticated user |
| `GET` | `/tasks/:id` | Bearer JWT | Get task by ID (Strict ownership verification: returns 404 if not owned) |
| `PATCH` | `/tasks/:id` | Bearer JWT | Update task details or toggle status (Strict ownership verification) |
| `DELETE` | `/tasks/:id` | Bearer JWT | Delete task (Strict ownership verification: returns 404 if not owned) |

### Query Parameters for `GET /tasks`

- `status`: `all` | `pending` | `completed`
- `priority`: `all` | `low` | `medium` | `high`
- `category`: string filter (case-insensitive regex match)
- `sort`: `composite` | `deadline` | `priority` | `createdAt` | `dateTime`

---

## 🛡 Authentication Flow & Security

1. **Password Encryption**:
   - Passwords are encrypted on save via `bcryptjs` with salt round `10`.
   - The User schema marks `password` with `select: false` so it is excluded from all database queries by default.
   - The User `toJSON` transformer explicitly strips password hashes and internal Mongoose fields.

2. **Bearer Token Authentication**:
   - Requests to protected endpoints pass `Authorization: Bearer <token>`.
   - The `requireAuth` middleware decodes the JWT and binds `{ id, email }` to `req.user`.

3. **Multi-Tenant Data Isolation (Critical Security)**:
   ```typescript
   // Enforced in TaskService:
   const tasks = await Task.find({
     userId: new Types.ObjectId(authenticatedUserId),
     ...filters
   });
   ```
   Users cannot access, update, or delete tasks belonging to other accounts.

---

## 🧠 Composite Sort Algorithm & Scoring Weights

The composite sorting algorithm calculates a dynamic urgency score for each task to rank it intuitively on both the backend and mobile client:

```typescript
// Composite ranking balances deadline urgency, explicit task priority,
// and scheduled time. Deadline receives the strongest influence because
// overdue/near-deadline work requires more immediate attention, while
// priority and scheduled time resolve otherwise similar tasks.
```

### Mathematical Weight Breakdown

$$\text{Composite Score} = (0.50 \times \text{DeadlineUrgency}) + (0.35 \times \text{PriorityScore}) + (0.15 \times \text{ScheduledScore})$$

1. **Deadline Urgency ($50\%$ weight)**:
   - Overdue tasks ($\Delta t < 0$): Score ranges from $1.2$ to $2.0$ depending on hours overdue.
   - Imminent tasks ($\le 24$ hours): Score ranges from $0.85$ to $1.15$.
   - Medium horizon ($\le 72$ hours): Score ranges from $0.60$ to $0.85$.
   - Extended horizon ($> 7$ days): Decays toward $0.05$.
2. **Explicit Priority ($35\%$ weight)**:
   - $\text{High} = 1.00$ ($3/3$)
   - $\text{Medium} = 0.67$ ($2/3$)
   - $\text{Low} = 0.33$ ($1/3$)
3. **Scheduled Date/Time ($15\%$ weight)**:
   - Serves as a tiebreaker favoring tasks whose scheduled execution time has arrived.
4. **Completed Tasks**:
   - Completed tasks receive an offset penalty ($-1000$) so they always sink below all pending work.
5. **Zero Mutation**:
   - The algorithm creates a shallow copy before sorting, guaranteeing the original array remains immutable.

---

## 📬 Postman Collection

A complete Postman collection is located at [`/docs/TaskFlow.postman_collection.json`](file:///e:/Assignment/docs/TaskFlow.postman_collection.json).

### Included Requests
1. `GET /health` — Health check
2. `POST /auth/register` — Registers user and sets collection `token` variable
3. `POST /auth/login` — Logs in user and sets collection `token` variable
4. `GET /auth/me` — Fetches profile with Bearer token
5. `POST /tasks` — Creates task and sets `taskId` variable
6. `GET /tasks?sort=composite` — Retrieves tasks with composite smart urgency
7. `GET /tasks?status=pending&priority=high&sort=deadline` — Multi-filtered request
8. `GET /tasks/:id` — Retrieves task by ID
9. `PATCH /tasks/:id` — Updates task properties
10. `PATCH /tasks/:id` — Toggles task completion status
11. `DELETE /tasks/:id` — Deletes task

---

## 🧪 Testing & Verification

### Executed Tests Summary
The backend contains 26 automated integration and unit tests across 3 test suites:
- `src/__tests__/compositeSort.test.ts` (4 unit tests for composite weights and non-mutation)
- `src/__tests__/task.test.ts` (12 integration tests verifying auth protection, user-scoped multi-tenancy, CRUD, and filters)
- `src/__tests__/auth.test.ts` (10 integration tests verifying registration, login, validation, and profile endpoints)

Run the test suite anytime:
```bash
cd backend
npm test
```

---

## 🔍 Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| Mobile: `Network Error` on login | Android emulator cannot access `localhost` directly | Ensure backend is running and `mobile/src/services/api.ts` points to `http://10.0.2.2:5000`. |
| Mobile: Physical device cannot reach backend | Host machine is not exposing port or firewall blocked | Run `adb reverse tcp:5000 tcp:5000` or change API base URL to workstation IP. |
| Backend: MongoDB connection refused | Local mongod is not started | Start MongoDB service (`net start MongoDB` or `mongod`) or configure remote URI in `.env`. |
| Mobile: Metro bundler caching issues | Stale cache from previous run | Run `npx react-native start --reset-cache`. |

---

Developed with ❤️ for the TaskFlow Full-Stack Engineering Assessment.
