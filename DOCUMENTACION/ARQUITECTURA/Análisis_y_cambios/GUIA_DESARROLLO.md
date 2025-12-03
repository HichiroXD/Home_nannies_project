# 📚 GUÍA DE DESARROLLO Y MEJORES PRÁCTICAS

**Fecha:** 21 de noviembre de 2025  
**Version:** 1.0  
**Audiencia:** Desarrolladores del equipo

---

## 📋 TABLA DE CONTENIDOS

1. [Setup Inicial](#setup-inicial)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Convenciones de Código](#convenciones-de-código)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Git Workflow](#git-workflow)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial

### Requisitos Previos
```
- Python 3.13+
- Node.js 20+
- Git
- PostgreSQL (opcional para desarrollo)
- Visual Studio Code
```

### Clonar Repositorio
```bash
git clone https://github.com/tu-repo/Home_nannies_project.git
cd Home_nannies_project
```

### Setup Backend

#### 1. Crear Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2. Instalar Dependencias
```bash
cd Back_Django_REST
pip install -r requirements.txt
pip install python-dotenv  # Para variables de entorno
```

#### 3. Configurar Variables de Entorno
```bash
# Crear archivo .env en Back_Django_REST/
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

#### 4. Ejecutar Migraciones
```bash
python manage.py migrate
python manage.py createsuperuser  # Crear admin user
```

#### 5. Iniciar Servidor
```bash
python manage.py runserver 0.0.0.0:8000
```

**Output esperado:**
```
Performing system checks...
System check identified no issues (0 silenced).
Django version 5.2.6
Starting development server at http://0.0.0.0:8000/
```

### Setup Frontend

#### 1. Instalar Dependencias
```bash
cd frontend_nannies
npm install
```

#### 2. Verificar React Calendar
```bash
npm list react-calendar
# Debe mostrar: react-calendar@5.1.0
```

#### 3. Iniciar Dev Server
```bash
npm run dev
```

**Output esperado:**
```
VITE v7.2.0 ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

#### 4. Verificar compilación
```bash
npm run build
# Debe terminar sin errores
```

---

## 📁 Estructura del Proyecto

### Backend
```
Back_Django_REST/
├── manage.py                 # Django CLI
├── requirements.txt          # Python dependencies
├── db.sqlite3               # Database (dev)
├── django_crud_api/         # Main Django project
│   ├── settings.py          # Configuración global
│   ├── urls.py              # URL routing
│   └── wsgi.py              # Production server entry
├── users/                   # Users app
│   ├── models.py
│   ├── serializer.py
│   ├── views.py
│   ├── signals.py           # NEW: Logging
│   └── apps.py              # Registrar signals
├── nannies/                 # Nannies app
├── bookings/                # Bookings app
│   └── signals.py           # NEW: Logging
├── favorites/               # Favorites app
│   └── signals.py           # NEW: Logging
├── reviews/                 # Reviews app
├── notifications/           # Notifications app
│   └── signals.py           # NEW: Logging
└── logs/                    # NEW: Log files directory
    ├── home_nannies.log     # General logs
    ├── bookings.log         # Booking events
    ├── users.log            # User events
    └── errors.log           # Warnings/Errors
```

### Frontend
```
frontend_nannies/
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── App.css
│   ├── api/                 # API calls
│   │   ├── api.js
│   │   ├── userApi.js
│   │   ├── nannyApi.js
│   │   ├── bookingApi.js
│   │   ├── favoriteApi.js
│   │   ├── reviewApi.js
│   │   └── notificationApi.js
│   ├── components/          # React components (57 total)
│   │   ├── common/          # Shared components
│   │   │   ├── AlertToast.jsx       # NEW
│   │   │   ├── AlertToast.css       # NEW
│   │   │   └── index.js
│   │   ├── bookings/        # Booking components
│   │   │   ├── AvailabilitySelector.jsx  # NEW
│   │   │   └── AvailabilitySelector.css  # NEW
│   │   ├── auth/
│   │   ├── layout/
│   │   └── [other categories]
│   ├── views/               # Page components (37 total)
│   │   ├── auth/
│   │   ├── BookingCreate.jsx
│   │   ├── Catalog.jsx      # UPDATED: AlertToast integration
│   │   ├── MyBookings.jsx   # UPDATED: AlertToast integration
│   │   └── [other views]
│   └── router/
│       └── AppRouter.jsx
└── public/
    └── assets/
```

---

## 📝 Convenciones de Código

### JavaScript/React

#### Naming
```javascript
// Components: PascalCase
export function UserProfile() { }
export const NannyCard = () => { }

// Variables/Functions: camelCase
const userName = "John"
const getUserData = () => { }

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8000/api"
const DEFAULT_TIMEOUT = 5000

// CSS Classes: kebab-case
className="user-card"
className="nanny-profile-header"
```

#### File Organization
```javascript
// 1. Imports
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserCard from './UserCard'
import './UserProfile.css'

// 2. Constants
const API_ENDPOINT = '/api/users'

// 3. Component
export function UserProfile() {
  // 3a. Hooks (primero useState, luego useEffect, etc)
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  // 3b. Handlers
  const handleDelete = (id) => { }

  // 3c. Effects
  useEffect(() => {
    // ...
  }, [])

  // 3d. Render
  return (
    <div className="user-profile">
      {/* JSX */}
    </div>
  )
}
```

#### Error Handling
```javascript
try {
  const response = await axios.get('/api/users')
  setUsers(response.data)
} catch (error) {
  if (error.response?.status === 401) {
    navigate('/login')
  } else if (error.response?.status === 404) {
    showAlert('User not found', 'error')
  } else {
    showAlert('Something went wrong', 'error')
    console.error('Error fetching users:', error)
  }
}
```

### Python/Django

#### Naming
```python
# Classes: PascalCase
class UserSerializer(serializers.ModelSerializer):
    pass

# Functions/Methods: snake_case
def get_nanny_stats(nanny_id):
    pass

# Constants: UPPER_SNAKE_CASE
API_VERSION = "1.0"
DEFAULT_PAGE_SIZE = 20
```

#### Model Definition
```python
from django.db import models

class Booking(models.Model):
    # 1. Foreign Keys
    parent = models.ForeignKey(User, on_delete=models.CASCADE)
    nanny = models.ForeignKey(Nanny, on_delete=models.CASCADE)
    
    # 2. Required Fields
    booking_date = models.DateField()
    start_time = models.TimeField()
    
    # 3. Optional Fields
    notes = models.TextField(blank=True, null=True)
    
    # 4. Status/Choice Fields
    status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS_CHOICES,
        default='pending'
    )
    
    # 5. Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Bookings'
    
    def __str__(self):
        return f"Booking #{self.id} - {self.parent}"
```

#### Serializer Pattern
```python
class NannySerializer(serializers.ModelSerializer):
    # 1. Nested serializers
    user = UserSerializer(read_only=True)
    
    # 2. Custom fields
    total_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Nanny
        fields = ['id', 'user', 'bio', 'hourly_rate', 'total_reviews']
        read_only_fields = ['id', 'user']
    
    def get_total_reviews(self, obj):
        return obj.reviews.count()
```

#### View/ViewSet Pattern
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by current user"""
        user = self.request.user
        if user.role == 'parent':
            return Booking.objects.filter(parent__user=user)
        elif user.role == 'nanny':
            return Booking.objects.filter(nanny__user=user)
        return Booking.objects.none()
    
    @action(detail=True, methods=['patch'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'confirmed'
        booking.save()
        return Response({'status': 'confirmed'})
```

---

## 💻 Frontend Development

### Custom Hooks

#### useAlert Hook
```javascript
// src/components/common/AlertToast.jsx
import { useState } from 'react'

export function useAlert() {
  const [alert, setAlert] = useState({
    visible: false,
    message: '',
    type: 'info'
  })

  const showAlert = (message, type = 'info', duration = 3000) => {
    setAlert({ visible: true, message, type })
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }))
    }, duration)
  }

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, visible: false }))
  }

  return { alert, showAlert, closeAlert }
}
```

#### Usage
```javascript
import { AlertToast, useAlert } from './components/common'

export function Catalog() {
  const { alert, showAlert } = useAlert()

  const handleAddFavorite = async (nannyId) => {
    try {
      await favoriteApi.addFavorite(nannyId)
      showAlert('Agregada a favoritos', 'success')
    } catch (error) {
      showAlert('Error al agregar a favoritos', 'error')
    }
  }

  return (
    <>
      <AlertToast {...alert} onClose={() => {}} />
      {/* contenido */}
    </>
  )
}
```

### API Integration

#### Patrón API
```javascript
// src/api/nannyApi.js
import api from './api'

export const nannyApi = {
  // GET list
  getNannies: (params = {}) => 
    api.get('/nannies/', { params }),

  // GET detail
  getNanny: (id) => 
    api.get(`/nannies/${id}/`),

  // POST create
  createNanny: (data) => 
    api.post('/nannies/', data),

  // PATCH update
  updateNanny: (id, data) => 
    api.patch(`/nannies/${id}/`, data),

  // DELETE
  deleteNanny: (id) => 
    api.delete(`/nannies/${id}/`)
}
```

#### Uso en Componentes
```javascript
import { nannyApi } from '../api/nannyApi'

export function NannyList() {
  const [nannies, setNannies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNannies = async () => {
      try {
        const response = await nannyApi.getNannies({
          rating_min: 4,
          available: true
        })
        setNannies(response.data.results)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNannies()
  }, [])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="nanny-list">
      {nannies.map(nanny => (
        <NannyCard key={nanny.id} nanny={nanny} />
      ))}
    </div>
  )
}
```

### Styling Best Practices

#### CSS Module Pattern (si se usa)
```javascript
// UserProfile.module.css
.container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
  padding: 2rem;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 1rem;
}

// UserProfile.jsx
import styles from './UserProfile.module.css'

export function UserProfile() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>...</div>
    </div>
  )
}
```

#### Tailwind (Actual)
```javascript
export function UserProfile() {
  return (
    <div className="grid grid-cols-4 gap-8 p-8">
      <div className="col-span-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4">
        {/* Sidebar */}
      </div>
      <div className="col-span-3">
        {/* Main content */}
      </div>
    </div>
  )
}
```

---

## 🐍 Backend Development

### Signals Pattern

#### Registrar Signal en app
```python
# bookings/apps.py
from django.apps import AppConfig

class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.BigAutoField'
    name = 'bookings'
    
    def ready(self):
        import bookings.signals  # Registra los signals
```

#### Definir Signal
```python
# bookings/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Booking
from notifications.models import Notification
import logging

logger = logging.getLogger('bookings')

@receiver(post_save, sender=Booking)
def log_booking_created(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Nueva reserva creada: {instance.id} | Nanny: {instance.nanny.user.full_name}")
        # Crear notificación
        Notification.objects.create(
            user=instance.nanny.user,
            type='booking_request',
            title='Nueva solicitud de reserva',
            message=f"{instance.parent.user.full_name} solicita una reserva",
            related_id=instance.id
        )
```

### Logging System

#### Usar Logger
```python
import logging

logger = logging.getLogger('bookings')  # Usa logger específico

# DEBUG
logger.debug("Información de debug")

# INFO
logger.info("Usuario logueado: johndoe")

# WARNING
logger.warning("Método deprecado")

# ERROR
logger.error("Error en base de datos", exc_info=True)

# CRITICAL
logger.critical("Servidor sin memoria")
```

#### Ver Logs
```bash
# Ver últimas 50 líneas
tail -f Back_Django_REST/logs/home_nannies.log

# Ver logs de booking
tail -f Back_Django_REST/logs/bookings.log

# Buscar errores
grep ERROR Back_Django_REST/logs/errors.log
```

### Query Optimization

#### Bad ❌
```python
# N+1 problem
def get_bookings(request):
    bookings = Booking.objects.all()
    for booking in bookings:
        # Query adicional por cada booking
        nanny_name = booking.nanny.user.full_name
```

#### Good ✅
```python
# select_related para foreign keys
def get_bookings(request):
    bookings = Booking.objects.select_related(
        'nanny__user',
        'parent__user'
    ).all()
    
    for booking in bookings:
        # Sin queries adicionales
        nanny_name = booking.nanny.user.full_name
```

#### Prefetch ✅
```python
# prefetch_related para many-to-many o reverse FK
def get_nanny_stats(request, nanny_id):
    from django.db.models import Prefetch
    
    nanny = Nanny.objects.prefetch_related(
        Prefetch('bookings', queryset=Booking.objects.filter(status='completed'))
    ).get(id=nanny_id)
    
    completed_bookings = nanny.bookings.all()  # Ya en memoria
```

---

## 🔀 Git Workflow

### Ramas

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### Crear Feature Branch
```bash
# Basarse en develop
git checkout develop
git pull origin develop

# Crear branch
git checkout -b feature/booking-notifications

# Ejemplo: feature/[tipo]/[descripción]
git checkout -b feature/auth/email-verification
git checkout -b bugfix/favorites/duplicate-entries
git checkout -b docs/api-documentation
```

### Commit Messages
```
# Formato: [TIPO] descripción corta

# Tipos:
# feat:     Nueva funcionalidad
# fix:      Arreglo de bug
# docs:     Cambios en documentación
# style:    Cambios de formato
# refactor: Refactorización de código
# test:     Agregar/actualizar tests
# chore:    Cambios de configuración

# Ejemplos
git commit -m "feat: agregar componente AlertToast"
git commit -m "fix: corregir import de react-calendar"
git commit -m "docs: actualizar guía de desarrollo"
git commit -m "refactor: simplificar lógica de validación"
```

### Crear Pull Request
```bash
# Push a rama remota
git push origin feature/booking-notifications

# Ir a GitHub y crear PR contra develop
# Título: [FEAT] Agregar notificaciones de reserva
# Description:
# - Agrega AlertToast para feedback visual
# - Integra signals de Django para logging
# - Actualiza componentes: MyBookings, NannyRequests

# Esperar revisión y merge
```

### Merge a Main
```bash
# Solo después de testing en staging
git checkout main
git pull origin main
git merge develop
git push origin main
```

---

## 🧪 Testing

### Frontend Testing

#### Setup
```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/user-event
```

#### Ejemplo Test
```javascript
// src/components/common/__tests__/AlertToast.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AlertToast } from '../AlertToast'

describe('AlertToast', () => {
  it('should render success message', () => {
    const alert = {
      visible: true,
      message: 'Test message',
      type: 'success'
    }
    render(<AlertToast {...alert} />)
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should not render when not visible', () => {
    const alert = {
      visible: false,
      message: 'Test message',
      type: 'success'
    }
    render(<AlertToast {...alert} />)
    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })
})
```

#### Correr Tests
```bash
npm run test
npm run test:coverage
```

### Backend Testing

#### Ejemplo Test
```python
# bookings/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Booking
from nannies.models import Nanny

User = get_user_model()

class BookingTestCase(TestCase):
    def setUp(self):
        self.parent = User.objects.create_user(
            username='parent1',
            email='parent@test.com',
            password='test123',
            role='parent'
        )
        
        self.nanny = User.objects.create_user(
            username='nanny1',
            email='nanny@test.com',
            password='test123',
            role='nanny'
        )
    
    def test_create_booking(self):
        from datetime import date
        
        booking = Booking.objects.create(
            parent=self.parent,
            nanny=self.nanny,
            booking_date=date(2025, 12, 15),
            status='pending'
        )
        
        self.assertEqual(booking.status, 'pending')
        self.assertEqual(booking.parent, self.parent)
```

#### Correr Tests
```bash
python manage.py test
python manage.py test bookings.tests.BookingTestCase
python manage.py test --verbosity=2
```

---

## 🚀 Deployment

### Variables de Entorno Producción
```bash
# .env.production
DEBUG=False
SECRET_KEY=generate-secure-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost/home_nannies
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=app-password
CORS_ALLOWED_ORIGINS=https://yourdomain.com
STATIC_ROOT=/var/www/home_nannies/static/
MEDIA_ROOT=/var/www/home_nannies/media/
```

### Heroku Deployment

#### 1. Instalar Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Descargar desde heroku.com/download
```

#### 2. Crear App
```bash
heroku login
heroku create home-nannies-app
```

#### 3. Agregar Procfile
```
web: gunicorn django_crud_api.wsgi
```

#### 4. Deploy
```bash
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Python dependencies
COPY Back_Django_REST/requirements.txt .
RUN pip install -r requirements.txt

# Django files
COPY Back_Django_REST/ .

# Collectstatic
RUN python manage.py collectstatic --noinput

# Gunicorn
CMD ["gunicorn", "django_crud_api.wsgi:application", "--bind", "0.0.0.0:8000"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: home_nannies
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build: .
    command: >
      sh -c "python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DEBUG: "False"
      DATABASE_URL: postgresql://postgres:postgres@db:5432/home_nannies

volumes:
  postgres_data:
```

#### Deploy con Docker
```bash
docker-compose up --build
```

---

## 🔧 Troubleshooting

### Frontend Issues

#### Error: "react-calendar not found"
```bash
npm install react-calendar@5.1.0 --save
npm install  # Reinstalar todas las dependencias
```

#### Error: "Cannot find module AlertToast"
```javascript
// Verificar ruta correcta
// Debe ser: src/components/common/AlertToast.jsx
import { AlertToast, useAlert } from './components/common'
// NO: import from './components/AlertToast'
```

#### Vite HMR Not Working
```bash
# Limpiar cache
rm -rf node_modules/.vite
npm run dev
```

### Backend Issues

#### Django Check Error
```bash
python manage.py check
# Si hay errores de imports:
# - Verificar que signals.py esté en apps.py ready()
# - Verificar rutas correctas de imports
```

#### Migration Conflicts
```bash
# Ver estado
python manage.py showmigrations

# Revertir última
python manage.py migrate bookings 0001

# Crear nueva
python manage.py makemigrations
python manage.py migrate
```

#### Port Already in Use
```bash
# Encontrar proceso en puerto 8000
lsof -i :8000

# Matar proceso
kill -9 <PID>

# O usar puerto diferente
python manage.py runserver 0.0.0.0:8001
```

#### Database Lock
```bash
# Remover db.sqlite3
rm Back_Django_REST/db.sqlite3

# Recrear
python manage.py migrate
```

---

## 📚 Recursos Útiles

### Documentación
- [Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

### Tools
- [Insomnia](https://insomnia.rest/) - API Testing
- [Postman](https://www.postman.com/) - API Client
- [React DevTools](https://github.com/facebook/react/tree/main/packages/react-devtools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

### Comunidades
- Django Slack: #django
- React Discord: official server
- Stack Overflow: [django], [react], [javascript]

---

**Guía completada:** 21 de noviembre de 2025  
**Última actualización:** Sprint 2  
**Status:** ✅ LISTO PARA USO
