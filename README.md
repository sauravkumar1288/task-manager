# Task Manager — MERN Stack

A personal project I built to learn full-stack web development using the MERN stack. The app lets users create projects, assign tasks, and track progress with role-based access for Admin and Member roles.

🔗 **Live URL:** https://zoological-inspiration-production.up.railway.app  
📁 **GitHub:** https://github.com/sauravkumar1288/task-manager

---

## 🚀 Features

- **Authentication** — Signup, login and logout with JWT
- **Project Management** — Create and manage projects with team members
- **Task Management** — Create, assign and track tasks with priority levels
- **Task Status Tracking** — Todo → In Progress → Completed
- **Dashboard** — View task stats, overdue tasks and priority chart
- **Role-based Access** — Admin and Member roles with different permissions

---

## 🧑‍💼 Roles

**Admin**
- Create, update and delete tasks
- Manage team members
- View all tasks and projects

**Member**
- View assigned tasks
- Update task status
- Add activity/comments

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React.js (Vite), Redux Toolkit, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Deployment | Railway |

---

## ⚙️ Requirements Met

- ✅ REST APIs
- ✅ MongoDB database with proper relationships
- ✅ Input validations
- ✅ Role-based access control
- ✅ Live deployment on Railway

---

## 📦 Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/sauravkumar1288/task-manager.git
cd task-manager
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in server folder:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start server:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

### 5. Create first Admin user
```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456","isAdmin":true,"role":"Administrator","title":"Admin"}'
```

---

## 📡 API Endpoints

### User
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/user/register | Register user |
| POST | /api/user/login | Login |
| POST | /api/user/logout | Logout |
| GET | /api/user/get-team | Get all users |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/task | Get all tasks |
| POST | /api/task/create | Create task |
| PUT | /api/task/update/:id | Update task |
| DELETE | /api/task/:id | Delete task |
| GET | /api/task/dashboard | Dashboard stats |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/project | Get all projects |
| POST | /api/project/create | Create project |
| PUT | /api/project/update/:id | Update project |
| DELETE | /api/project/:id | Delete project |

---

## 📂 Folder Structure

```
task-manager/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       └── utils/
├── server/          # Node.js backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
└── README.md
```

---

## 👤 Author
**Saurav Singh**  
GitHub: [@sauravkumar1288](https://github.com/sauravkumar1288)
