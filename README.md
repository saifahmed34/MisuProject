# MisuProject – Real-Time Chat & User Management System

## 📌 Overview

**MisuProject** is a full-stack **ASP.NET Core Web API** application built for real-time communication and user management.  
It is fully **Dockerized** and supports **automatic EF Core migrations** on startup.

This project can be used as a base for:  
- Real-time chat applications  
- Social networking platforms  
- Admin-controlled systems  
- Learning ASP.NET Core, SignalR, and Docker  

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration & login using **JWT**  
- Role-based authorization (**Admin**, **User**)  
- Secure password hashing with **BCrypt**  
- Change password functionality  
- Reset password via **OTP email verification**  

### 💬 Real-Time Chat
- **SignalR** WebSocket-based communication  
- One-to-one and group messaging  
- Chat messages stored in **SQL Server**  
- Retrieve chat history through REST APIs  

### 👥 Social Features
- Follow and unfollow users  
- View followers and following lists  

### 📧 OTP Email System
- OTP generation and verification  
- Email delivery using **MailKit**  
- OTP expiration and single-use enforcement  

---

## 🛠 Tech Stack

### Backend
- ASP.NET Core Web API (.NET 9)  
- Entity Framework Core  
- SQL Server 2022  
- SignalR  
- JWT Authentication  
- Mapster (DTO mapping)  
- BCrypt  
- MailKit  

### Frontend
- HTML, CSS, Vanilla JavaScript  
- Fetch API  
- SignalR JavaScript client  

### DevOps
- Docker  
- Docker Compose  
- SQL Server persistent volumes  
- Automatic EF Core migrations  

---

## 📂 Project Structure

```text
MisuProject/
├── Controllers/
│   ├── AuthController.cs
│   ├── FollowController.cs
│   ├── MessageController.cs
├── Hubs/
│   └── ChatHub.cs
├── Models/
├── Dtos/
├── Data/
│   └── AppDbContext.cs
├── wwwroot/
│   └── Frontend (HTML / CSS / JS)
├── Dockerfile
├── docker-compose.yml
├── Program.cs
└── README.md
```
## Docker Setup
### Dockerfile
```
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish "MisuProject.csproj" -o /published /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /published .
EXPOSE 5189
ENTRYPOINT ["dotnet", "MisuProject.dll"]
```
## docker-compose.yml
```
version: "3.8"

services:
  backend:
    build:
      context: ./
    container_name: webApi
    ports:
      - "5189:5189"
    environment:
      - ASPNETCORE_URLS=http://0.0.0.0:5189
    depends_on:
      - db

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: sql_server_container
    environment:
      SA_PASSWORD: "Password123@"
      ACCEPT_EULA: "Y"
    ports:
      - "1434:1433"
    volumes:
      - sql_data:/var/opt/mssql

volumes:
  sql_data:
```
### ⚙️ Configuration
### Database Connection String
```
{
  "ConnectionStrings": {
    "connect": "Server=db;Database=MisuDb;User Id=sa;Password=Password123@;TrustServerCertificate=True;"
  }
}
```
## JWT Settings
```
{
  "Jwt": {
    "Key": "YourSecretKeyHere",
    "Issuer": "MisuProject",
    "Audience": "MisuProjectUsers"
  }
}
```
### Email Settings (OTP)
```
{
  "EmailSettings": {
    "SenderName": "MisuProject",
    "SenderEmail": "your-email@example.com",
    "SmtpServer": "smtp.yourprovider.com",
    "Port": "587",
    "Username": "your-email@example.com",
    "Password": "your-app-password"
  }
}
```
### ▶️ Running the Project
## Clone Repository
```
git clone https://github.com/saifahmed34/MisuProject.git
cd MisuProject
```
## Build and Run Containers
```
docker compose up --build
```

### ✅ Database migrations are applied automatically
### ✅ Default roles (Admin, User) are seeded automatically

## 🌐 Application URLs
API Base URL: http://localhost:5189
SignalR Hub: http://localhost:5189/chatHub

## 💻 Frontend

Frontend files are located in the wwwroot directory:

- Login & Register

- Real-time chat interface

- Follow / Unfollow UI

- Open HTML files in the browser after starting the backend.

🔑 Default Roles

Automatically created on startup:

- Admin

- User

## 📜 API Endpoints
### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password
```
## User Management
```
GET /api/auth/users
GET /api/auth/users/{id}
PUT /api/auth/users/update/{id}
DELETE /api/auth/users/del/{id}  # Admin only
```
## Follow System
```
POST /api/follow/{followeeId}
DELETE /api/follow/{followeeId}
GET /api/follow/my-following
GET /api/follow/my-followers
```
## Chat
```
POST /api/message/send
GET /api/message/messages
SignalR Hub: /chatHub
```
### Notes

- No manual EF Core migrations required

- SQL Server data is persisted using Docker volumes

- Uses Docker internal networking (db as SQL host)

- Ready for local development and production deployment
