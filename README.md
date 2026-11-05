# Library Task Management System (MERN)

A web-based Library Task Management System built using MongoDB, Express.js, React.js, and Node.js. It helps users organize, manage, and track library tasks efficiently.

## Requirements

- Node.js 18 or higher
- MongoDB Community Server running locally, or a MongoDB Atlas connection URI
- npm
- Visual Studio Code (recommended)

## Run Locally (Windows / VS Code)

### 1. Configure and Seed the Database

Open a terminal in the `backend` folder:

```powershell
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

The seed script replaces all documents in the `tasks` collection of the configured database with 12 mock tasks.

**Warning:** Do not run the seed script against a database containing data you want to keep.

### 2. Start the React Frontend

Open a second terminal in VS Code.

Navigate to the frontend folder:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser. It is normally:

```text
http://localhost:5173
```

### 3. Configure MongoDB

The default MongoDB URI in `backend/.env.example` is:

```text
mongodb://127.0.0.1:27017/library_task_manager
```

Make sure the MongoDB service is running before seeding the database or starting the backend API.

If you are using MongoDB Atlas, replace the default URI in your `.env` file with your Atlas connection string.

## Features

- Dashboard showing total, pending, in-progress, and completed tasks
- Create, view, edit, and delete tasks
- Search tasks by title, description, category, and assignee
- Manage task status and priority
- Set task due dates
- Assign tasks to users
- Organize tasks by category
- Express.js REST API
- MongoDB database using Mongoose
- 12 mock tasks available through the seed script

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API health |
| GET | `/api/tasks?search=keyword` | Get and search tasks |
| GET | `/api/tasks/:id` | Get a specific task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Troubleshooting

### MongoDB Connection Error

Error:

```text
ECONNREFUSED 127.0.0.1:27017
```

Solution: Make sure MongoDB is running and using the correct port.

### Failed to Fetch

Solution:

- Check whether the backend server is running.
- Verify the API port, normally `5000`.
- Check the frontend API configuration.

### npm Is Not Recognized

Solution: Install Node.js LTS from the official website and restart VS Code.

https://nodejs.org/

### GitHub README Conflict

If Git reports a conflict in `README.md`, open the file in VS Code, resolve the conflict markers, save the file, and then run:

```powershell
git add README.md
git commit -m "Resolve README conflict"
```

## Project Structure

```text
library-task-manager-mern/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Technologies Used

- MongoDB – Database
- Express.js – Backend framework
- React.js – Frontend library
- Node.js – JavaScript runtime
- Mongoose – MongoDB object modeling

## Project Purpose

The Library Task Management System helps library staff organize daily tasks, monitor task progress, manage assignments, and improve the efficiency of library operations.
