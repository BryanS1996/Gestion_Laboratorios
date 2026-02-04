# 🧪 Laboratory Reservation Management System

### Dockerized Full-Stack Application | AWS EC2 Ready

A **production-ready laboratory reservation platform** designed for academic institutions.
The system supports **basic and premium lab reservations**, **secure online payments**, **incident reporting with images**, and a **role-based admin dashboard**.

This project is **fully Dockerized** and **ready to be deployed on AWS EC2**, following real-world DevOps and security best practices.

---

## 🚀 Features

### 👨‍🎓 Users

* Firebase Authentication
* Basic & Premium laboratory reservations
* Stripe Checkout payments
* Email confirmation after reservation/payment
* Reservation history
* Incident reporting with image uploads
* Secure access to private images (signed URLs)

### 🧑‍💼 Admin

* Role-based access control
* Admin dashboard with analytics
* User and laboratory management
* Incident report monitoring

---

## 🏗️ System Architecture

```
Client (Browser)
   │
   ▼
Frontend (React + Vite)
   │
   ▼
Backend API (Node.js + Express)
   │
   ├── Firebase Authentication
   ├── Stripe Payments & Webhooks
   ├── Firestore (Users / Labs / Reservations)
   ├── MongoDB (Incident Reports)
   └── Backblaze B2 (Private Image Storage)
```

---

## 🐳 Dockerized Stack

| Service  | Description                  |
| -------- | ---------------------------- |
| frontend | React + Vite                 |
| backend  | Node.js API                  |
| mongo    | MongoDB for incident reports |

External managed services:

* Firebase Authentication & Firestore
* Stripe
* Backblaze B2 (S3 compatible)

---

## 📁 Project Structure

```
lab-reservation-system/
├── backend/
│   ├── Dockerfile
│   ├── .env
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── .env
│   └── src/
├── docker-compose.yml
├── screenshots/
└── README.md
```

---

## 🐳 Docker Configuration

### docker-compose.yml

```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    container_name: lab-backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    container_name: lab-frontend
    ports:
      - "5173:5173"
    env_file:
      - ./frontend/.env
    depends_on:
      - backend

  mongo:
    image: mongo:6
    container_name: lab-mongo
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000
JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_NAME=
B2_ENDPOINT=

FIREBASE_PROJECT_ID=
```

### Frontend (.env)

```env
VITE_API_URL=http://<EC2_PUBLIC_IP>:5000/api
VITE_STRIPE_PUBLIC_KEY=
VITE_FIREBASE_API_KEY=
```

---

## ☁️ Deployment on AWS EC2

### Requirements

* AWS EC2 (Ubuntu 22.04 recommended)
* Docker & Docker Compose
* Open ports in Security Group:

  * 22 (SSH)
  * 5000 (Backend)
  * 5173 (Frontend)
  * 80 / 443 (optional, production)

### Deployment Steps

```bash
ssh -i key.pem ubuntu@<EC2_PUBLIC_IP>

sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu
newgrp docker

git clone https://github.com/your-username/lab-reservation-system.git
cd lab-reservation-system

docker compose up --build -d
```

---

## 🔐 Security Highlights

* Firebase ID Token → Backend JWT normalization
* Role-based authorization
* Private image storage (no public buckets)
* Signed URLs for controlled image access
* Stripe metadata validation (userId, reservaId)
* Environment isolation with Docker

---

## 📸 Screenshots

```md
![Login](screenshots/login.png)
![Catalog](screenshots/catalog.png)
![Stripe Checkout](screenshots/stripe-checkout.png)
![Admin Dashboard](screenshots/admin-dashboard.png)
```

---

## 📌 Best Practices Applied

* Containerized full-stack architecture
* Secure payment flow with webhooks
* External managed services (Firebase, Stripe)
* Separation of concerns (Frontend / Backend)
* Cloud-ready deployment (AWS EC2)

---

## 🔮 Future Improvements

* Nginx reverse proxy + HTTPS (Let's Encrypt)
* CI/CD pipeline (GitHub Actions)
* Real-time updates (WebSockets / SSE)
* Monitoring & logging

---

## 👤 Author

**Bryan Chileno**
Software Engineering Student | Full-Stack Developer
React · Node.js · Docker · AWS · Stripe · Firebase

---
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/BryanS1996/Gestion_Laboratorios)
> This project follows real-world production patterns including secure payments, private storage, and containerized cloud deployment.
