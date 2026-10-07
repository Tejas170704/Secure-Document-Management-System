🔐 Secure Document Management System

A secure full-stack document management platform built with Java Spring Boot, React, MySQL, JWT Authentication, Role-Based Access Control (RBAC), and AES Encryption.

The system allows authenticated users to securely upload, manage, access, and share documents while enforcing role-based and document-level authorization.

---

📌 Project Overview

The Secure Document Management System is designed to provide secure document storage and controlled access to sensitive files.

The application separates authentication, authorization, document management, and data persistence into different layers to create a maintainable and secure backend architecture.

Main Objectives

- Secure user authentication
- Role-based access control
- Secure document management
- Document sharing between users
- RESTful backend APIs
- Database-based document metadata management
- AES-based encryption for sensitive document data
- JWT-based API authentication

---

🚀 Key Features

👤 User Management

- User registration
- User login
- JWT-based authentication
- Role-based authorization
- Secure password handling

📄 Document Management

- Upload documents
- View documents
- Download/access documents
- Delete documents
- Manage document metadata
- Share documents with other users

🔐 Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- AES Encryption
- Protected REST APIs
- Backend authorization checks
- User-specific document access

🛡️ Access Control

The system distinguishes between authenticated users and their authorized resources.

For example:

USER
 ├── Upload Documents
 ├── View Own Documents
 └── Access Shared Documents

ADMIN
 └── Administrative Operations

---

🏗️ System Architecture

                    ┌──────────────────────┐
                    │    React Frontend    │
                    │      Vite + React    │
                    └──────────┬───────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌──────────────────────┐
                    │   Spring Boot API    │
                    └──────────┬───────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
          ┌───────────────┐         ┌───────────────┐
          │   Security    │         │  Controllers  │
          │ JWT + RBAC    │         │  REST APIs    │
          └───────────────┘         └───────┬───────┘
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │    Service    │
                                    │ Business Logic│
                                    └───────┬───────┘
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │   Repository  │
                                    │ Data Access   │
                                    └───────┬───────┘
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │     MySQL     │
                                    │   Database    │
                                    └───────────────┘

---

🔐 Authentication & Authorization Flow

User
 │
 ▼
Login
 │
 ▼
Username + Password
 │
 ▼
Authentication
 │
 ▼
JWT Token Generated
 │
 ▼
Client Sends JWT
 │
 ▼
JWT Validation
 │
 ▼
Role / Permission Check
 │
 ▼
Protected REST API

---

🔒 Document Security

Sensitive document information is protected using AES encryption.

Encryption Flow

Document
    │
    ▼
AES Encryption
    │
    ▼
Encrypted Data
    │
    ▼
Secure Storage

During authorized access:

Encrypted Data
    │
    ▼
AES Decryption
    │
    ▼
Original Document

«Note: In a production deployment, encryption keys should be managed using a secure secrets/key-management system rather than storing them directly in source code or configuration files.»

---

🛠️ Technology Stack

Backend

- Java
- Spring Boot
- Spring Security
- REST APIs
- JWT Authentication
- Maven

Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

Database

- MySQL

Security

- JWT
- AES Encryption
- Role-Based Access Control

Development Tools

- Git
- GitHub
- VS Code / IntelliJ IDEA
- Postman

---

📁 Project Structure

Secure-Document-Management-System/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── Tejas/
│   │       │           └── Secure_Document_Management_System/
│   │       │
│   │       └── resources/
│   │
│   ├── pom.xml
│   └── ...
│
├── secure-document-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md

---

🔌 Main REST API Endpoints

Authentication

Register

POST /api/auth/register

Login

POST /api/auth/login

---

Documents

GET /api/documents

Retrieve documents accessible to the authenticated user.

POST /api/documents

Upload/create a document.

DELETE /api/documents/{id}

Delete an authorized document.

---

Shared Documents

GET /api/documents/shared-with-me

Retrieve documents shared with the authenticated user.

---

🗄️ Database

The application uses MySQL for persistent data storage.

Typical entities include:

User
 │
 ├── Authentication Information
 ├── Role
 └── Documents
        │
        ├── Document Metadata
        ├── Owner
        └── Sharing Information

---

⚙️ Installation & Setup

Prerequisites

Install the following:

- Java JDK
- Maven
- Node.js
- npm
- MySQL
- Git

---

1. Clone the Repository

git clone https://github.com/Tejas170704/Secure-Document-Management-System.git

cd Secure-Document-Management-System

---

2. Configure MySQL

Create the database:

CREATE DATABASE document_system;

Update your Spring Boot database configuration with your local MySQL credentials.

Example:

spring.datasource.url=jdbc:mysql://localhost:3306/document_system
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

«Never commit real database passwords, JWT secrets, encryption keys, or other credentials to GitHub.»

---

3. Run the Backend

Navigate to the backend directory:

cd backend

Run:

mvn spring-boot:run

The backend will start according to the configured Spring Boot port.

---

4. Run the Frontend

Open another terminal:

cd secure-document-frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The Vite development server will display the local frontend URL in the terminal.

---

🧪 Testing

The REST APIs can be tested using tools such as:

- Postman
- Browser
- Frontend application

Recommended testing flow:

Register
   ↓
Login
   ↓
Receive JWT
   ↓
Access Protected API
   ↓
Upload Document
   ↓
View Documents
   ↓
Share Document
   ↓
Access Shared Document

---

🔑 Security Design

The project demonstrates multiple application-security concepts:

Authentication

JWT is used to authenticate API requests.

Authorization

RBAC ensures users can perform only operations allowed by their role.

Encryption

AES is used to protect sensitive document information.

API Protection

Protected endpoints require valid authentication and authorization.

---

📊 Project Highlights

Area| Implementation
Backend| Java + Spring Boot
Frontend| React + Vite
Database| MySQL
Authentication| JWT
Authorization| RBAC
Encryption| AES
API| REST
Version Control| Git/GitHub
Architecture| Layered Architecture

---

🎯 Learning Outcomes

Through this project, I gained practical experience in:

- Java Object-Oriented Programming
- Spring Boot backend development
- REST API development
- MySQL database integration
- JWT authentication
- Role-Based Access Control
- AES encryption
- Frontend-backend integration
- Git and GitHub
- Debugging and API testing
- Secure application design

---

🚧 Deployment Status

The project source code is available on GitHub.

«Note: The live deployment/demo URL may currently be unavailable due to deployment/environment configuration. The repository remains the primary source for reviewing the project's implementation.»

---

🔗 Project Links

GitHub Repository

https://github.com/Tejas170704/Secure-Document-Management-System

Developer

Tejas Dhule

- GitHub: https://github.com/Tejas170704/
- LinkedIn: https://www.linkedin.com/in/tejasdhule56
- Portfolio: https://tejas170704.github.io/New-Protfolio/

---

👨‍💻 Author

Tejas Dhule

B.E. Computer Engineering
Dr. D. Y. Patil Technical Campus, Pune

Interests:
Java Backend Development • Spring Boot • REST APIs • AI/ML • System Architecture • Application Security

---

⭐ If you find this project useful

Feel free to explore the repository and learn from the implementation.
