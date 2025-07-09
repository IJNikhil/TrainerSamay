
# 🏋️‍♂️ TrainerSamay

A modern, full-stack gym/fitness management platform for trainers and admins.  
Built with **Django** (backend) and **React + Vite + Tailwind CSS** (frontend).

---

## 🚀 Key Features

- **Role-Based Access Control:** Secure login system differentiating between `admin` and `trainer` roles, each with a tailored user experience.
- **Interactive Dashboard:** Admins get a comprehensive overview of all operations, including trainer utilization charts and session statistics. Trainers see a focused view of their upcoming schedule and session details.
- **Advanced Session Scheduling:**
  - **Multiple Calendar Views:** Month, Week, and Agenda views offer flexible ways to manage schedules.
  - **Smart Scheduling:** The session creation dialog checks for trainer availability and scheduling conflicts in real-time.
  - **Recurring Sessions:** Trainers can schedule their own sessions that repeat weekly.
  - **Automatic Absence Marking:** Sessions not started within a grace period are auto-marked as "Absent".
- **Availability Management:** Trainers can easily set and update their weekly availability, which is visible to admins.
- **User Management (Admin):** Admins have full CRUD (Create, Read, Update, Delete) capabilities for user accounts.
- **Reporting & Analytics:** A dedicated reports page with powerful filtering options and the ability to export session data to CSV.
- **Error Handling:** All API calls surface clear error messages in the UI.
- **Polished & Responsive UI:** Built with ShadCN UI and Tailwind CSS, the application is fully responsive and features a modern, clean aesthetic with light and dark modes.
- **Secure REST API:** Token and session authentication supported.

---

## ✨ Recent Updates

- **Automatic Session Absence**
  - Sessions are auto-marked "Absent" if not started within a grace period:
    - Sessions ≤ 60 mins → 50% of the duration (e.g. 30 mins for 60-min session)
    - Sessions > 60 mins → 30 mins after scheduled start
  - Implemented via a Django management command
- **Improved Trainer Name Rendering**: Trainer names are correctly displayed across all views.
- **Detailed API Error Feedback**: Enhanced feedback for network/API failures.
- **TimeZone Set to IST (Asia/Kolkata)**: Ensures proper scheduling and reporting for Indian region.
- **Custom Email Login Backend**: Login via email supported via custom Django backend.

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
git clone https://github.com/yourusername/trainersamay.git
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

Create a `.env` file and configure database, secret key, etc. Then run:

```bash
python manage.py migrate
python manage.py createsuperuser  # Setup admin user
python manage.py runserver
```

#### ✅ Sample `.env` for Backend (do NOT commit this to git)

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
