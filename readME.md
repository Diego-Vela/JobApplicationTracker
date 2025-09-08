# Jobblet – Job Application Tracker

[Visit Jobblet](https://jobblet-us.com)

Jobblet is a full-stack web application designed to help users track and manage their job search.  
It includes a frontend deployed on Amplify, a backend deployed using a Docker Image and Lambda, and various AWS cloud services to provide a seamless and secure 
experience for organizing applications, resumes, and career progress.

---

## 🚀 Features

### 🔐 Authentication & Security
- **User Registration & Login** – Create an account with secure authentication.
- **Email Verification** – Users must verify their email before their account is active.
- **Password Policies** – Strong password requirements (min 8 chars, at least 1 special character).
- **Password Reset** – Reset via account settings or recovery flow.
- **SQL Injection Protection** – Backend queries parameterized to prevent injection attacks.

---

### 📄 Document Management
- **Upload Resumes & CVs** – Store up to 5 resumes and 50 CVs in the cloud (via AWS S3).
- **Download & Preview** – Secure presigned URLs allow file viewing and downloading.
- **Delete Documents** – Safely remove files; linked applications will auto-update if resume is deleted.

---

### 📌 Job Applications
- **Create Applications** – Add company, job title, job description, and applied date.
- **Attach Documents** – Link an uploaded resume or CV to each application.
- **Status Tracking** – Update status (applied, interview, offer, rejected, etc.).
- **Sorting & Filtering** – Organize applications by status, date, or company.
- **Bulk Actions** – Move or delete multiple applications at once.

---

### 📝 Notes
- **Personal Notes** – Add notes for each application (e.g., recruiter details, interview tips).
- **Edit & Update** – Modify notes anytime.
- **Delete Notes** – Keep your applications clean and organized.

---

## 🛠️ Tech Stack

- **Frontend** – React (Vite, TailwindCSS)
- **Backend** – FastAPI (Python), SQLAlchemy ORM
- **Database** – PostgreSQL (AWS RDS)
- **Storage** – AWS S3 (for resume/CV files)
- **Auth** – AWS Cognito (user accounts, verification, resets)
- **Hosting** – AWS Lambda + API Gateway

---

## 📈 Future Features

- [ ] Sharing an application
- [ ] Premium tier with storage
- [ ] Analytics dashboard (applications over time, success rates)
- [ ] Calendar reminders for interviews and follow-ups

---
