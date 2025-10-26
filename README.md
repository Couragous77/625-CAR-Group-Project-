# Budget CAR — Full-Stack Student Budgeting App

[![CI](https://github.com/Couragous77/625-CAR-Group-Project-/actions/workflows/ci.yml/badge.svg)](https://github.com/Couragous77/625-CAR-Group-Project-/actions/workflows/ci.yml)

A dockerized development environment for **Budget CAR** - a smart budgeting app designed for students. Built with FastAPI backend, React frontend, and PostgreSQL database.

## 🎯 Features

- **Envelope-style budgeting** with student-focused categories (Textbooks, Tuition, Food, Rent)
- **Visual progress tracking** with charts and weekly goals
- **Receipt uploads** and detailed transaction history
- **Income & expense tracking** with multiple payment methods
- **Mobile-responsive design** with bottom navigation
- **Export capabilities** and reports

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite, React Router, modern CSS with custom design system
- **Backend**: FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL 16 with Alembic migrations
- **DevOps**: Docker Compose for orchestration
- **CI/CD**: GitHub Actions (automated linting & tests)

## 🔄 Continuous Integration

This project uses GitHub Actions for automated quality checks on every push and pull request:

- **Backend Linting**: `ruff` code quality checks and `black` formatting validation
- **Backend Tests**: `pytest` test suite execution
- **Frontend Build**: Vite build verification to ensure production readiness

All checks must pass before merging pull requests. View the [CI workflow](.github/workflows/ci.yml) for details.

## Prerequisites

- Git
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Make (optional but recommended)

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Couragous77/625-CAR-Group-Project-.git
cd 625-CAR-Group-Project-

# Copy environment template
cp .env.example .env   # Windows: copy .env.example .env

# Start all services (builds containers, starts DB, backend, frontend)
make up

# Run database migrations
make migrate

# (Optional) Seed demo data
make seed
```

### Frontend Setup (One-time)

Update `frontend/src/main.jsx` to import the CSS:

```jsx
import './styles/common.css'  // Add this line at the top
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

## 📂 Project Structure

```
625-CAR-Group-Project-/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # API routes & application
│   │   ├── models.py    # SQLAlchemy models
│   │   ├── schemas.py   # Pydantic schemas
│   │   ├── db.py        # Database connection
│   │   └── seed.py      # Demo data seeder
│   ├── alembic/         # Database migrations
│   └── Dockerfile
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components (Logo, Header)
│   │   ├── pages/       # Page components (Landing, Login)
│   │   ├── styles/
│   │   │   └── common.css  # Consolidated CSS (1000+ lines)
│   │   ├── App.jsx      # Router configuration
│   │   └── main.jsx     # Entry point
│   ├── mocks/           # HTML mockups (design reference)
│   └── Dockerfile
│
├── docker-compose.yml   # Service orchestration
├── Makefile            # Development commands
├── .env.example        # Environment template
└── QUICKSTART.md       # Detailed setup guide
```

## 🎨 Frontend Architecture

The frontend is built with a modern React setup:

- **CSS Design System**: All styles consolidated in `common.css` with CSS variables
- **React Router**: Client-side routing for SPA navigation
- **Component Library**: Reusable components (Logo, Header, Button, etc.)
- **Pages**: Landing, Login, Dashboard, Profile, Track Income/Expense

### Frontend Documentation

- 📖 **QUICKSTART.md** - Quick reference guide
- 📚 **frontend/REACT_MIGRATION_GUIDE.md** - Component examples & patterns
- 🎨 **frontend/CSS_CLASS_REFERENCE.md** - Complete CSS class catalog
- 📊 **frontend/PROJECT_STRUCTURE.md** - Architecture diagrams

## 🛠️ Makefile Commands

### Services
```bash
make up              # Build & start all services
make down            # Stop all services
make logs            # View logs from all services
```

### Database
```bash
make migrate         # Run Alembic migrations
make makemigration   # Create new migration (use: make makemigration N='message')
make seed            # Load demo data
make db-psql         # Open PostgreSQL shell
```

### Development
```bash
make be-shell        # Shell into backend container
make we-shell        # Shell into frontend container
make fmt             # Code formatting (placeholder)
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
POSTGRES_USER=budgetcar
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=budgetcar_db
POSTGRES_PORT=5432

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
DATABASE_URL=postgresql://budgetcar:yourpassword@db:5432/budgetcar_db
CORS_ORIGINS=http://localhost:5173

# Frontend
WEB_PORT=5173
```

## 🎯 Development Workflow

### Adding a New Page

1. Create component in `frontend/src/pages/PageName.jsx`
2. Add route in `frontend/src/App.jsx`
3. Use existing CSS classes from `common.css`
4. Follow examples in `REACT_MIGRATION_GUIDE.md`

### Database Changes

1. Modify models in `backend/app/models.py`
2. Generate migration: `make makemigration N='add_user_preferences'`
3. Apply migration: `make migrate`

### Adding npm Packages

```bash
# Option 1: Add to package.json, then rebuild
make down
make up

# Option 2: Install in running container
make we-shell
npm install package-name
exit
```

## 🐛 Troubleshooting

### Services won't start
```bash
make down
docker compose up --build
```

### Database connection issues
```bash
make down
docker volume rm 625-car-group-project-_pgdata
make up
make migrate
make seed
```

### Frontend CSS not loading
1. Verify `import './styles/common.css'` is in `frontend/src/main.jsx`
2. Restart containers: `make down && make up`

### npm package issues
```bash
make down
# Clean node_modules volume
docker compose down -v
make up
```

### Common Errors

- **Web container exits**: Check `docker-compose.yml` has `- /usr/src/app/node_modules` volume
- **npm ci error**: Dockerfile automatically falls back to `npm install` if lockfile missing
- **Alembic import error**: Fixed by `PYTHONPATH=/app` in docker-compose
- **bcrypt issues**: Pinned to `bcrypt==3.2.2` in requirements.txt

## 📚 Documentation

- **QUICKSTART.md** - Quick reference guide
- **frontend/SETUP_COMPLETE.md** - Frontend setup summary
- **frontend/REACT_MIGRATION_GUIDE.md** - Component patterns & examples
- **frontend/CSS_CLASS_REFERENCE.md** - CSS class documentation
- **frontend/PROJECT_STRUCTURE.md** - Architecture overview

## 🎓 For Students

This project demonstrates:
- Full-stack application development
- Docker containerization & orchestration
- RESTful API design with FastAPI
- Modern React patterns (hooks, router, components)
- Database design & migrations
- CSS architecture & design systems

## 📝 Next Steps

1. ✅ Run `make up` to start all services
2. ✅ Update `frontend/src/main.jsx` to import CSS
3. ⬜ Explore API docs at http://localhost:8000/docs
4. ⬜ Create Signup page (example in REACT_MIGRATION_GUIDE.md)
5. ⬜ Build Dashboard with charts
6. ⬜ Connect frontend to backend API
7. ⬜ Add authentication & state management

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test with `make up` and verify both frontend & backend work
4. Submit a pull request

## 📄 License

[Add your license here]

## 👥 Team

[Add team member information]

---

**Built with ❤️ for students learning to manage their finances**
