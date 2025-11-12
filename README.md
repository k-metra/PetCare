# 🩺 Veterinary Clinic Website
![React](https://img.shields.io/badge/Frontend-React-61DBFB?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?logo=tailwindcss&logoColor=white)
![Laravel](https://img.shields.io/badge/Backend-Laravel-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?logo=php&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-07405E?logo=sqlite&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
![VPS](https://img.shields.io/badge/Hosted%20on-Hostinger-673DE6?logo=server&logoColor=white)
![License: BSD 2-Clause](https://img.shields.io/badge/License-BSD%202--Clause-blue.svg)

A full-stack web application designed to streamline veterinary operations and enhance client engagement.  
This project includes an **Admin Dashboard** for managing patients, vaccinations, treatments, and diagnoses — along with a **marketing website** for showcasing the clinic’s services to potential clients.

🔗 **Live Demo:** [https://petcare.my.to](https://petcare.my.to)

## 🚀 Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- Axios for API requests
- React Router DOM for navigation

**Backend**
- Laravel 12 (PHP 8.4)
- SQLite (development) / MySQL (production-ready)
- Laravel Sanctum for authentication
- Laravel Seeder & Factory for sample data

**Hosting**
- Frontend + Backend hosted on a single **Hostinger VPS**
- Reverse proxy configuration for smooth API routing

---

## 🧩 Key Features

### 🩹 Admin Dashboard
- Manage pets, owners, and medical records
- View vaccination history and treatment logs
- CRUD operations for veterinarians, appointments, and patients
- Dashboard analytics for quick insights

### 🌐 Marketing Page
- Professionally designed homepage for the veterinary clinic
- Services overview and “About the Clinic” section
- Responsive and modern layout with Tailwind CSS

### 💉 Pet Diagnosis & Record Management
- Record diagnoses, symptoms, treatments, and prescribed medications
- Log vaccination doses (e.g., Bordetella, Anti-Rabies)
- Integrated support for laboratory and rapid test records

---

## ⚙️ Development Setup

Clone the repository and install dependencies for both frontend and backend:

### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Uses **SQLite** for development (`database/database.sqlite`). Easily switch to **MySQL** by updating `.env` - seeders ensure a seamless transition.
### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Environment Variables
### Laravel `.env` Example
```env
APP_NAME=PetCare
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DB_CONNECTION=sqlite
```
### React `.env` Example
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Project Overview
This project was developed as part of a professional learning journey - combiing **modern frontend development (React + Tailwind)** with **robust backend architecture (Laravel 12).**

It demonstrates:
- Full-stack deployment on a VPS
- Proper REST API design with authentication
- Modular structure ready for future integration with Inertia.js

## Screenshots
| Marketing Page | Admin Dashboard |
|----------------|-----------------|
|<img width="1898" height="919" alt="image" src="https://github.com/user-attachments/assets/b22bcb54-5627-47b3-8111-e7a288398a7f" /> | <img width="1904" height="915" alt="image" src="https://github.com/user-attachments/assets/8cb9fdce-c155-4134-ade5-003f642f2d20" /> |
| <img width="1903" height="835" alt="image" src="https://github.com/user-attachments/assets/5fd601db-e048-4f72-8b32-332ec2813484" /> | <img width="1903" height="836" alt="image" src="https://github.com/user-attachments/assets/a0a23e8a-5760-485c-b5e3-b71462908ccc" />|
| <img width="1901" height="834" alt="image" src="https://github.com/user-attachments/assets/07e46bea-c691-45d7-8a8f-f672f26887f7" /> | <img width="1901" height="834" alt="image" src="https://github.com/user-attachments/assets/d16d9266-4083-4b8c-97eb-125f230126e0" />|
| <img width="1902" height="834" alt="image" src="https://github.com/user-attachments/assets/6a1ffdba-bc7e-4680-b5e6-f0d5f5c9f671" /> | <img width="1901" height="840" alt="image" src="https://github.com/user-attachments/assets/12066ba1-1780-42e5-bc17-1aa60408b07c" />|

## License
This project is open-source and available under the **MIT License**.

---
*Developed with ❤️ by a passionate web developer exploring full-stack excellence.*



