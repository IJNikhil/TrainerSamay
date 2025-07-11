# 🕒 TrainerSamay

A simple, full-stack **trainer scheduling and management system** built with **Django** and **React + Vite + Tailwind CSS**.  
Designed for **training centers** to help both **trainers** and **admins** manage schedules, availability, and reports.

---

## 🎯 Project Objective

Training centers often struggle to keep trainers informed of their upcoming sessions in a clear and centralized way.  
This platform solves the problem with a **calendar-based app** that connects to an SQL database and displays each trainer's class schedule in a clean, intuitive interface.

---

## 🚀 Key Features

- **Secure Authentication:** Via tokens and sessions using Django REST Framework
- **Trainer Login:**
  - Login via email (from `member` table)
  - View only the trainer's own sessions
- **Interactive Dashboard:**
  - Highlights today's and upcoming sessions
  - Admins get a complete overview; trainers see their own calendar
- **Calendar-Based Scheduling:**
  - Sessions fetched from `trainer_utilization` table
  - Monthly, weekly, and agenda calendar views
  - Show course name, time, location on hover or click
- **Availability Management (Trainer):**
  - Trainers can update their availability directly
- **Smart Scheduling (Admin):**
  - Admin sees all trainers' schedules
  - Filter sessions by specific trainer
  - Create/modify/delete any trainer's sessions
- **Simple Admin Management:**
  - Add/update/delete trainer and admin users
- **Auto Absence Detection:**
  - Sessions not started within a grace period are auto-marked "Absent"
- **Export Reports:**
  - Admin and trainers can export filtered session reports to CSV
- **Polished & Responsive UI:**
  - Built with ShadCN UI and Tailwind CSS (light & dark modes)

---

## 🛠️ Tech Stack

### Backend
- **Django 5.x** - Web framework
- **Django REST Framework** - API development
- **MySQL/SQLite** - Database (configurable)
- **django-cors-headers** - CORS handling
- **python-dotenv** - Environment variables management

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **ShadCN UI** - UI components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

---

## 🛠️ Project Structure

```
trainersamay/
├── backend/                     # Django backend
│   ├── core/                    # Main App Backend
│   ├── trainersamay/            # Django backend settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── .env
│   ├── manage.py
│   └── requirements.txt
├── frontend/                   # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/                # files to connect frontend with backend
│   │   ├── ..                  # other remaining files
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## ⚡ Quickstart

### 1. **Clone the Repository**

```bash
git clone https://github.com/IJNikhil/TrainerSamay.git
cd trainersamay
```

### 2. **Backend Setup (Django)**

```bash
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate        # For Linux/macOS
# venv\Scripts\activate         # For Windows

pip install -r requirements.txt
```

Create a `.env` file and configure database credentials, then run:

```bash
python manage.py migrate
python manage.py seedadmin    # Creates admin user with default credentials
python manage.py runserver
```

**✅ Sample .env for Backend (Do NOT commit to Git)**

```env
# Database
DB_ENGINE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Django
SECRET_KEY=your-django-secret-key
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

Your app will be available at: **http://localhost:5173**

**✅ Sample .env for Frontend**

```env
VITE_API_URL=http://localhost:8000/api
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 🏃‍♂️ Auto-Absence Marking

Sessions are marked "Absent" if not started after a grace period.

- **Logic:** `core/management/commands/mark_absent_sessions.py`
- **Manual Run:** Execute every 5 minutes to check database

```bash
python manage.py mark_absent_sessions
```

**For Automated Execution (Production):**

Set up a cron job to run this command every 5 minutes:

```bash
# Edit crontab
crontab -e

# Add this line to run every 5 minutes
*/5 * * * * /path/to/your/venv/bin/python /path/to/your/project/manage.py mark_absent_sessions
```

---

## 🔐 Authentication

- **Login via email** (custom Django backend)
- **DRF Token & Session authentication**
- **Tokens stored in localStorage** for protected API requests
- **Role-based access control** (admin vs trainer permissions)

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration (admin only)

### User Management
- `GET /api/users/` - List all users (admin only)
- `POST /api/users/` - Create new user (admin only)
- `PUT /api/users/{id}/` - Update user (admin only)
- `DELETE /api/users/{id}/` - Delete user (admin only)

### Sessions
- `GET /api/sessions/` - List sessions
- `POST /api/sessions/` - Create new session
- `PUT /api/sessions/{id}/` - Update session
- `DELETE /api/sessions/{id}/` - Delete session

### Availability
- `GET /api/availability/` - Get trainer availability
- `POST /api/availability/` - Set trainer availability
- `PUT /api/availability/{id}/` - Update availability

---

## 📦 Installation Commands

**✅ Backend Requirements**

```bash
pip install django djangorestframework python-dotenv django-cors-headers mysqlclient
```

*If you're using SQLite for local dev, you don't need `mysqlclient`.*

**✅ Frontend Requirements (via npm)**

```bash
npm install react react-dom react-router-dom vite typescript tailwindcss \
  @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar \
  @radix-ui/react-checkbox @radix-ui/react-dropdown-menu @radix-ui/react-label \
  @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast \
  react-hook-form @hookform/resolvers zod date-fns lucide-react recharts \
  framer-motion class-variance-authority clsx tailwind-merge
```

---

## 🧑‍💻 Developer Notes

- **Admin Panel:** http://localhost:8000/admin
- **Timezone:** Asia/Kolkata
- **Custom User Model:** `core.User`
- **Custom Auth Backend:** `core.backends.EmailBackend`
- **Database Tables:** `member`, `trainer_utilization`

---

## 🚀 Deployment

### Backend Deployment

1. **Production Environment Variables**
   ```env
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   SECRET_KEY=your-production-secret-key
   DB_ENGINE=mysql
   # Add production database credentials
   ```

2. **Collect Static Files**
   ```bash
   python manage.py collectstatic
   ```

3. **Run Production Server**
   ```bash
   gunicorn trainersamay.wsgi:application
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to hosting service** (Netlify, Vercel, etc.)

---

## 🧪 Development

### Backend Development
```bash
# Run tests
python manage.py test

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Frontend Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

---

## 🙋 FAQ

**Q: Why aren't absences marked automatically?**  
A: You need to run `python manage.py mark_absent_sessions` periodically via cron or manually every 5 minutes.

**Q: How do I add more roles?**  
A: Extend `core.User` and update permission logic using DRF.

**Q: How do I deploy it?**  
A: Use Gunicorn + Nginx for Django and deploy React frontend on Vercel, Netlify, or static hosting. Configure your `.env` accordingly.

**Q: Can I use SQLite instead of MySQL?**  
A: Yes, set `DB_ENGINE=sqlite3` in your `.env` file for local development.

**Q: How do I reset the database?**  
A: Delete migrations, run `python manage.py makemigrations` and `python manage.py migrate` again.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License – Free to use, modify, and distribute.

---

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

---

## 📞 Contact

- **Project Repository:** [https://github.com/IJNikhil/TrainerSamay](https://github.com/IJNikhil/TrainerSamay)
- **Developer:** IJNikhil
- **Issues:** [GitHub Issues](https://github.com/IJNikhil/TrainerSamay/issues)
