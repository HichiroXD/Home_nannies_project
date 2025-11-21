# 🚀 QUICK REFERENCE CARD - HOME NANNIES

**Imprime esta página y ten a mano** 📌

---

## 🔴 EMERGENCY CONTACTS

```
Critical Bug?        → Open issue immediately
Server Down?         → Check logs in Back_Django_REST/logs/
Build Fails?         → npm install && python manage.py check
Forgot Password?     → POST /auth/password-reset/
```

---

## ⚡ STARTUP COMMANDS

### Backend (Django)
```bash
cd Back_Django_REST
python -m venv venv
venv\Scripts\activate (Windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React)
```bash
cd frontend_nannies
npm install
npm run dev
# Abre: http://localhost:5173
```

### Ambos Terminales
```bash
# Terminal 1
cd Back_Django_REST && python manage.py runserver

# Terminal 2
cd frontend_nannies && npm run dev
```

---

## 📍 RUTAS IMPORTANTES

```
Backend API:     http://localhost:8000/api/
Admin Panel:     http://localhost:8000/admin/
Frontend Dev:    http://localhost:5173/
Log Files:       Back_Django_REST/logs/
```

---

## 🔑 LOGIN TEST ACCOUNTS

### Admin
```
Email: admin@test.com
Pass:  admin123
Role:  admin
```

### Parent
```
Email: parent@test.com
Pass:  parent123
Role:  parent
```

### Nanny
```
Email: nanny@test.com
Pass:  nanny123
Role:  nanny
```

---

## 🛠️ COMMANDS FRECUENTES

### Django Management
```bash
# Check system
python manage.py check

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create user
python manage.py createsuperuser

# See logs
tail -f Back_Django_REST/logs/home_nannies.log

# Run tests
python manage.py test
```

### Frontend Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint check
npm run lint
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit with format
git commit -m "feat: descripción breve"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# → Against 'develop' branch
```

---

## 📁 STRUCTURE CHEAT SHEET

```
Backend:
  users/          → User authentication
  nannies/        → Nanny profiles
  bookings/       → Reservations
  favorites/      → Favorites system
  reviews/        → Ratings & reviews
  notifications/  → Notifications
  
Frontend:
  components/     → Reusable components (57)
  views/          → Page views (37)
  api/            → API integration
  router/         → Route definitions
```

---

## 🎨 COMPONENT LOCATIONS

```
Common:
  - AlertToast        src/components/common/
  - Loading           src/components/common/
  - Modal             src/components/common/

Bookings:
  - AvailabilitySelector  src/components/bookings/
  - BookingCard           src/components/bookings/
  - BookingForm           src/components/bookings/

Nanny:
  - NannyCard         src/components/nanny/
  - NannyProfile      src/components/profile/
```

---

## 🔌 API ENDPOINTS QUICK LIST

### Auth
```
POST   /auth/register/
POST   /auth/login/
POST   /auth/verify-email/
POST   /auth/token/refresh/
POST   /auth/password-reset/
```

### Resources
```
GET    /nannies/
GET    /bookings/
POST   /bookings/
GET    /favorites/
POST   /favorites/
GET    /reviews/
POST   /reviews/
GET    /notifications/
POST   /availability/
```

### User
```
GET    /users/me/
PATCH  /users/me/
```

---

## 🐛 COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| Port 8000 busy | `lsof -i :8000` then `kill -9 <PID>` |
| react-calendar error | `npm install react-calendar@5.1.0` |
| Django migrations error | `python manage.py migrate --fake-initial` |
| npm install fails | `rm -rf node_modules && npm install` |
| Build warnings | Check browser console, usually safe to ignore |
| CORS error | Verify CORS_ALLOWED_ORIGINS in settings.py |
| Auth token expired | Refresh token: `POST /auth/token/refresh/` |

---

## 📊 PERFORMANCE TARGETS

```
Backend Startup:     < 2 seconds ✅
API Response:        < 200ms ✅
Frontend Build:      < 5 seconds ✅
HMR Update:          < 100ms ✅
Bundle Size:         < 200KB ✅
```

---

## 🔒 SECURITY CHECKLIST

Before deployment:
- [ ] DEBUG = False
- [ ] SECRET_KEY = unique value
- [ ] ALLOWED_HOSTS configured
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database backed up
- [ ] SSL certificates valid

---

## 📝 CODE CONVENTIONS

### JavaScript
```javascript
// Components: PascalCase
function UserCard() { }

// Variables: camelCase
const userName = "John"

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8000"

// Files: PascalCase.jsx for components
UserProfile.jsx
```

### Python
```python
# Classes: PascalCase
class UserSerializer(Serializer):
    pass

# Functions: snake_case
def get_user_data(user_id):
    pass

# Constants: UPPER_SNAKE_CASE
API_ENDPOINT = "/api/users"
```

---

## 📚 DOCUMENTATION MAP

```
FOR BEGINNERS:
  → GUIA_DESARROLLO.md (Setup section)
  → README.md

FOR DEVELOPERS:
  → GUIA_DESARROLLO.md (Development patterns)
  → MAPEO_ENDPOINTS_API.md

FOR ARCHITECTS:
  → RESUMEN_EJECUTIVO.md
  → ANALISIS_DEPENDENCIAS_RIESGOS.md

FOR COMPONENT LOOKUP:
  → AUDITORIA_COMPONENTES_VISTAS.md
  → INDICE_MAESTRO_DOCUMENTACION.md
```

---

## 🎯 DAILY CHECKLIST

### Morning
- [ ] Pull latest changes: `git pull origin develop`
- [ ] Check build status
- [ ] Review open issues

### Before Committing
- [ ] Follow code conventions
- [ ] Test your changes locally
- [ ] Write commit message with format
- [ ] Push to feature branch

### Before Merging
- [ ] Create Pull Request
- [ ] Add description & screenshots
- [ ] Request code review
- [ ] All CI checks pass

---

## 💡 QUICK TIPS

```
Tip 1:  Use AlertToast for user feedback
        showAlert('Success!', 'success')

Tip 2:  Use select_related in Django queries
        objects.select_related('user')

Tip 3:  Check logs first for errors
        tail -f Back_Django_REST/logs/*.log

Tip 4:  Read the error message carefully
        99% of issues are described there

Tip 5:  Test with real data
        Create test accounts first

Tip 6:  Use Insomnia/Postman for API testing
        Faster than frontend testing
```

---

## 📞 NEED HELP?

```
🔴 Code Issue?
   → Check GUIA_DESARROLLO.md troubleshooting section
   → Search GitHub issues
   → Post detailed question with steps

🟡 API Question?
   → Check MAPEO_ENDPOINTS_API.md
   → Look for curl examples
   → Test with Insomnia

🟢 Component Question?
   → Check AUDITORIA_COMPONENTES_VISTAS.md
   → View component in src/components/
   → Check related stories/docs
```

---

## ✅ FINAL CHECKLIST BEFORE PUSH

- [ ] Code follows conventions
- [ ] No console errors/warnings
- [ ] Django check passes: `python manage.py check`
- [ ] npm build succeeds: `npm run build`
- [ ] Tested manually in browser
- [ ] Commit message is descriptive
- [ ] Push to feature branch (not main/develop)

---

## 🎉 YOU'RE READY!

```
Everything working? Good!
Hit a wall? Check the docs!
Still stuck? Ask the team!

Remember: Read the error message first! 👆
```

---

**Keep this handy!** Print and pin on your desk 📌

**Last Updated:** 21 de noviembre de 2025  
**Version:** 1.0  
**Questions?** Check INDICE_MAESTRO_DOCUMENTACION.md
