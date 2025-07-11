# ⏰ TrainerSamay

A lightweight, full-stack trainer scheduling and session management platform.  
Built with **Django** (backend) and **React + Vite + Tailwind CSS** (frontend), it helps training centers streamline trainer schedules using a clean, calendar-based interface.

---

## 🎯 Project Objective

Training centers often struggle to keep trainers informed of their upcoming sessions in a clear and centralized way. Spreadsheets and manual coordination are error-prone and inefficient.

This application solves that by offering:

- A centralized **calendar view** of each trainer's scheduled sessions.
- A **login system** for trainers to see their own schedules.
- An **admin view** (optional) to oversee all trainers' utilization.
- Real-time data from the **CMIS MySQL database**, using the `trainer_utilization` and `member` tables.

---

## 🚀 Key Features

- **Trainer Login System**
  - Login via email or ID (fetched from the `member` table).
  - Secure authentication via tokens or sessions.

- **Session Calendar View**
  - Weekly and Monthly calendar interfaces.
  - Session info (course name, time, location) visible on hover or click.
  - Uses the `trainer_utilization` table for schedule data.

- **Personalized Schedule View**
  - Trainers see only their own sessions after login.
  - Admin (optional) can see all trainers’ calendars.

- **Session Highlights**
  - Today's or upcoming sessions are visually emphasized.

- **Session Auto-Mark as Absent**
  - Sessions are automatically marked "Absent" if not started in time.

- **Simple Admin Management**
  - Admins can create/update trainers, manage sessions, and view overall trainer utilization.

- **Responsive UI**
  - Built with ShadCN UI and Tailwind CSS.
  - Works smoothly across desktops, tablets, and mobile.

---

## ✨ Recent Updates

- **Trainer Filtering on Login**: Automatically shows only the logged-in trainer’s sessions.
- **Auto-Mark Absent**: Sessions are marked absent if not started:
  - ≤ 60 mins → 50% of session time
  - > 60 mins → 30 mins grace period
- **Trainer Name Rendering**: Fixed display inconsistencies across all views.
- **Improved Error Feedback**: All API issues now show detailed messages.
- **Timezone Set to Asia/Kolkata**: Ensures accurate calendar rendering.

---

## 🛠️ Project Structure

```
trainersamay/
├── backend/    # Django application
│   ├── core/
│   ├── trainersamay/
│   ├── .env
│   └── manage.py
├── frontend/   # React + Vite + Tailwind app
│   ├── src/
│   ├── .env
│   └── vite.config.ts
```

---

## ⚡ Quickstart

### 1. **Clone the repo**

```bash
git clone https://github.com/IJNikhil/TrainerSamay.git
cd trainersamay
```

### 2. **Backend Setup (Django)**

```bash
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # For Linux/macOS
# venv\Scripts\activate  # For Windows

pip install -r requirements.txt
```

Create a `.env` file and configure environment variables, then run:

```bash
python manage.py migrate
python manage.py seedadmin  # Setup initial admin account
python manage.py runserver
```

#### ✅ Sample `.env` for Backend (Do NOT commit this to Git):

```env
# Database
DB_ENGINE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:9002
CORS_ALLOW_CREDENTIALS=True
```

### 3. **Frontend Setup (React + Vite)**

```bash
cd frontend
npm install
npm run dev
```

- The app will be available at [http://localhost:5173](http://localhost:5173)

#### ✅ Sample `.env` for Frontend

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:8000/api
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 🏃‍♂️ Auto-Absence Marking (Automation)

Sessions are marked "Absent" if not started after the grace period.

- Logic: `core/management/commands/mark_absent_sessions.py`
- To run manually:

```bash
python manage.py mark_absent_sessions
```

To automate, use a cron job or `django-crontab`:

```cron
*/10 * * * * /path/to/venv/bin/python /path/to/backend/manage.py mark_absent_sessions
```

---

## 🔐 Authentication

- Uses Django REST Framework Token + Session authentication.
- Frontend stores token in `localStorage` for API access.

---

## 🧑‍💻 Developer Notes

- Admin Panel: [http://localhost:8000/admin](http://localhost:8000/admin)
- Timezone: Asia/Kolkata (set in `settings.py`)
- Custom User Model: `core.User`
- Custom Auth Backend: `core.backends.EmailBackend`

---

## 📦 Dependencies

### Backend (Django)
- `django`
- `djangorestframework`
- `python-dotenv`
- `django-cors-headers`
- `mysqlclient` *(or sqlite3 for development)*

### Frontend (React + Vite)
- `react`, `react-dom`, `react-router-dom`
- `vite`, `typescript`, `tailwindcss`, `shadcn/ui`
- `react-hook-form`, `zod`, `date-fns`, `lucide-react`, `recharts`, etc.

---

## 🙋 FAQ

**Q: Why aren't absences marked automatically?**  
A: You must run the management command manually or on a cron schedule.

**Q: How do I add roles or permissions?**  
A: Extend `core.User` and update permission logic via DRF settings.

**Q: How do I deploy?**  
A: Use Gunicorn + Nginx for backend. Vercel, Netlify, or static hosting for frontend.  
   Ensure `.env` variables are properly configured for production.

---

## 📄 License

MIT License – you're free to use, share, and modify. Contributions welcome!

---
