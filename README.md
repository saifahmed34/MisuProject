# MisuProject – Real-Time Chat & User Management System

## 📌 Overview
MisuProject is a **full-stack ASP.NET Core Web API application** with:
- **JWT Authentication**
- **Role-based authorization**
- **SignalR real-time chat**
- **User follow/unfollow feature**
- **Password reset with OTP email verification**
- **Full CRUD operations for users**
- **Frontend built with HTML, CSS, and JavaScript**

This project can be used as a base for real-time communication apps, social platforms, or admin-controlled systems.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration & login with **JWT tokens**
- **Role-based access control** (`Admin`, `User`)
- **Password hashing** using BCrypt
- **Change password** & **Reset password** via OTP email

### 💬 Real-Time Chat
- **SignalR**-powered WebSocket communication
- Send messages to specific groups
- Store chat history in SQL Server
- Retrieve messages via API

### 👥 Social Features
- Follow & unfollow other users
- View your followers and following lists

### 📧 OTP Email System
- Send OTP codes via email using **MailKit**
- OTP expiry and usage control

---

## 🛠 Tech Stack

**Backend**
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- SignalR
- Mapster (DTO mapping)
- JWT Authentication
- BCrypt (password hashing)
- MailKit (email sending)

**Frontend**
- HTML, CSS, JavaScript (Vanilla JS)
- Fetch API for REST calls
- SignalR JS client for real-time updates

---

## 📂 Project Structure
```
MisuProject/
├── Controllers/
│   ├── AuthController.cs        # Authentication & user management
│   ├── FollowController.cs      # Follow/unfollow logic
│   ├── MessageController.cs     # Chat messages API
├── Hubs/
│   └── ChatHub.cs               # SignalR hub for real-time chat
├── Models/                      # Entity models
├── Dtos/                        # Data Transfer Objects
├── Data/
│   └── AppDbContext.cs          # EF Core database context
├── wwwroot/                     # Frontend HTML/CSS/JS
├── Program.cs                   # Service configuration & app entry
└── README.md                    # This file
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/MisuProject.git
cd MisuProject
```

### 2️⃣ Configure the database
Update **`appsettings.json`** with your SQL Server connection string:
```json
"ConnectionStrings": {
  "connect": "Server=YOUR_SERVER;Database=MisuDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### 3️⃣ Configure JWT settings
In **`appsettings.json`**:
```json
"Jwt": {
  "Key": "YourSecretKeyHere",
  "Issuer": "YourIssuer",
  "Audience": "YourAudience"
}
```

### 4️⃣ Configure Email settings (for OTP)
```json
"EmailSettings": {
  "SenderName": "MisuProject",
  "SenderEmail": "your-email@example.com",
  "SmtpServer": "smtp.yourprovider.com",
  "Port": "587",
  "Username": "your-email@example.com",
  "Password": "the app password that found in 2 step verification"
}
```

### 5️⃣ Run migrations & update database
```bash
dotnet ef database update
```

### 6️⃣ Run the application
```bash
dotnet run
```

The API will be available at:
```
http://localhost:5000
```
SignalR hub:
```
http://localhost:5000/chatHub
```

---

## 💻 Frontend
The `wwwroot` folder contains HTML, CSS, and JS files for:
- Login/Register
- Real-time chat interface
- Follow/unfollow UI

Simply open the HTML files in a browser (after running the backend).

---

## 🔑 Default Roles
When the app starts, it automatically seeds:
- **Admin**
- **User**

---

## 📜 API Endpoints

### Authentication
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login & get JWT
- `POST /api/auth/change-password` – Change password
- `POST /api/auth/forgot-password` – Send OTP email
- `POST /api/auth/verify-otp` – Verify OTP
- `POST /api/auth/reset-password` – Reset password

### User Management
- `GET /api/auth/users` – Get all users
- `GET /api/auth/users/{id}` – Get user by ID
- `PUT /api/auth/users/update/{id}` – Update user
- `DELETE /api/auth/users/del/{id}` – Delete user (Admin only)

### Follow System
- `POST /api/follow/{followeeId}` – Follow a user
- `DELETE /api/follow/{followeeId}` – Unfollow a user
- `GET /api/follow/my-following` – Get my following list
- `GET /api/follow/my-followers` – Get my followers list

### Chat
- `POST /api/message/send` – Send a message (non-SignalR)
- `GET /api/message/messages` – Get messages
- **SignalR Hub** – `/chatHub` for real-time messages

---

## 📸 Screenshots
<img width="1917" height="901" alt="image" src="https://github.com/user-attachments/assets/06b5064a-5b9d-4ae1-8112-f6bb5726fc3e" />

<img width="1730" height="837" alt="image" src="https://github.com/user-attachments/assets/f7475e40-8a94-49d3-b937-0ff2805c6c0f" />



---

## 📄 License
This project is licensed under the MIT License – feel free to use and modify it.
