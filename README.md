# Task Manager with MongoDB

A full-stack task management app with a polished UI and MongoDB backend.

## Features
- User authentication (login/register)
- Task CRUD operations
- Task filtering (All, Active, Completed)
- Task editing and completion toggling
- Clear completed tasks
- Responsive design

## Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or remote)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   - Edit `backend/.env`:
     ```
     MONGO_URI=mongodb://localhost:27017/taskmanager
     JWT_SECRET=your-super-secret-jwt-key-here
     PORT=3000
     ```

3. **Start MongoDB:**
   - Make sure MongoDB is running on your system.

4. **Run the server:**
   ```bash
   cd backend
   npm start
   # or for development: npm run dev
   ```

5. **Open the app:**
   - Visit `http://localhost:3000`
   - Login with any username/password (auto-registers)

## Project Structure
```
task manager/
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   └── middleware/
│       └── auth.js
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── about.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
└── README.md
```

## API Endpoints

### Auth
- `POST /api/login` - Login user
- `POST /api/register` - Register new user

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/clear-completed` - Clear completed tasks

## Technologies
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT tokens
