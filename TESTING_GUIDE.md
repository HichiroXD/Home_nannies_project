# 🧪 Guía de Testing - Phase 1 Endpoints

## Inicio Rápido

### 1. Iniciar Servidor
```bash
cd Back_Django_REST
python manage.py runserver
```

El servidor estará en: `http://localhost:8000`

### 2. Obtener Token JWT (opcional para endpoints públicos)
Para endpoints que requieren autenticación, primero:
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 🧪 Test Cases

### TEST 1: Registrar Padre/Madre (Exitoso)

**Endpoint**: `POST /api/core/register/parent/`

**Request**:
```bash
curl -X POST http://localhost:8000/api/core/register/parent/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_test",
    "institutional_email": "juan.test@universidad.edu.co",
    "first_name": "Juan",
    "last_name": "Test",
    "password": "SecurePass123!",
    "rut": "12.345.678-9"
  }'
```

**Respuesta esperada (201 Created)**:
```json
{
  "id": 1,
  "username": "juan_test",
  "institutional_email": "juan.test@universidad.edu.co",
  "message": "Registro exitoso. Verifique su email para activar la cuenta."
}
```

✅ **Validar**:
- Status 201
- Usuario creado en BD
- Email de verificación enviado
- Campos obligatorios presentes

---

### TEST 2: Registrar Padre - Validación de RUT Inválido

**Endpoint**: `POST /api/core/register/parent/`

**Request**:
```bash
curl -X POST http://localhost:8000/api/core/register/parent/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria_test",
    "institutional_email": "maria.test@universidad.edu.co",
    "first_name": "María",
    "last_name": "Test",
    "password": "SecurePass123!",
    "rut": "12.345.678-0"
  }'
```

**Respuesta esperada (400 Bad Request)**:
```json
{
  "rut": ["El RUT tiene dígito verificador inválido"]
}
```

✅ **Validar**:
- Status 400
- Mensaje de error específico
- Usuario NO creado

---

### TEST 3: Registrar Padre - Email Institucional Inválido

**Endpoint**: `POST /api/core/register/parent/`

**Request**:
```bash
curl -X POST http://localhost:8000/api/core/register/parent/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "pedro_test",
    "institutional_email": "pedro@gmail.com",
    "first_name": "Pedro",
    "last_name": "Test",
    "password": "SecurePass123!",
    "rut": "98.765.432-1"
  }'
```

**Respuesta esperada (400 Bad Request)**:
```json
{
  "institutional_email": ["Email debe ser institucional (@universidad.edu.co)"]
}
```

✅ **Validar**:
- Status 400
- Rechazo de dominio no institucional

---

### TEST 4: Registrar Padre - Contraseña Débil

**Endpoint**: `POST /api/core/register/parent/`

**Request**:
```bash
curl -X POST http://localhost:8000/api/core/register/parent/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "carlos_test",
    "institutional_email": "carlos.test@universidad.edu.co",
    "first_name": "Carlos",
    "last_name": "Test",
    "password": "abc123",
    "rut": "11.111.111-1"
  }'
```

**Respuesta esperada (400 Bad Request)**:
```json
{
  "password": ["Requisitos de contraseña: Mínimo 8 caracteres, Al menos una mayúscula, Al menos un carácter especial (!@#$%^&*...)"]
}
```

✅ **Validar**:
- Status 400
- Requisitos de contraseña validados

---

### TEST 5: Registrar Niñera (Exitoso)

**Endpoint**: `POST /api/core/register/nanny/`

⚠️ **Importante**: Necesitas crear un archivo de prueba:
1. Crea un archivo PDF o JPG llamado `certificado.jpg`

**Request** (usando archivos):
```bash
curl -X POST http://localhost:8000/api/core/register/nanny/ \
  -H "Accept: application/json" \
  -F "username=sofia_teacher" \
  -F "institutional_email=sofia.teacher@universidad.edu.co" \
  -F "first_name=Sofia" \
  -F "last_name=Teacher" \
  -F "password=SecurePass123!" \
  -F "rut=98.765.432-1" \
  -F "program_id=1" \
  -F "enrollment_certificate=@certificado.jpg"
```

**Respuesta esperada (201 Created)**:
```json
{
  "id": 2,
  "username": "sofia_teacher",
  "institutional_email": "sofia.teacher@universidad.edu.co",
  "role": "nanny",
  "message": "Registro exitoso. Verifique su email y espere aprobación del administrador."
}
```

✅ **Validar**:
- Status 201
- Usuario creado con role "nanny"
- StudentVerification creada en BD
- Espera aprobación

---

### TEST 6: Registrar Niñera - Programa No es Educación

**Endpoint**: `POST /api/core/register/nanny/`

**Request**:
```bash
curl -X POST http://localhost:8000/api/core/register/nanny/ \
  -H "Accept: application/json" \
  -F "username=thomas_eng" \
  -F "institutional_email=thomas.eng@universidad.edu.co" \
  -F "first_name=Thomas" \
  -F "last_name=Engineer" \
  -F "password=SecurePass123!" \
  -F "rut=87.654.321-0" \
  -F "program_id=7" \
  -F "enrollment_certificate=@certificado.jpg"
```

**Respuesta esperada (400 Bad Request)**:
```json
{
  "program_id": ["Solo estudiantes de Educación pueden registrarse como niñeras"]
}
```

✅ **Validar**:
- Status 400
- Restricción de programa aplicada

---

### TEST 7: Listar Programas Universitarios

**Endpoint**: `GET /api/core/programs/`

**Request**:
```bash
curl http://localhost:8000/api/core/programs/ \
  -H "Accept: application/json"
```

**Respuesta esperada (200 OK)**:
```json
[
  {
    "id": 1,
    "code": "EDUC001",
    "name": "Pedagogía en Educación Básica",
    "is_education_program": true,
    "specialization": "Educación Primaria"
  },
  {
    "id": 2,
    "code": "EDUC002",
    "name": "Pedagogía en Educación Parvularia",
    "is_education_program": true,
    "specialization": "Educación Preescolar"
  },
  ...
]
```

✅ **Validar**:
- Status 200
- 10 programas en respuesta
- 6 de educación
- 4 de otras áreas

---

### TEST 8: Verificar Email (Token Inválido)

**Endpoint**: `POST /api/core/verify/email/<token>/`

**Request**:
```bash
curl -X POST http://localhost:8000/api/core/verify/email/token_invalido/ \
  -H "Content-Type: application/json"
```

**Respuesta esperada (400 Bad Request)**:
```json
{
  "detail": "Token inválido"
}
```

✅ **Validar**:
- Status 400
- Validación de token

---

### TEST 9: Obtener Estado de Verificación (Sin Autenticación)

**Endpoint**: `GET /api/core/verify/status/`

**Request**:
```bash
curl http://localhost:8000/api/core/verify/status/ \
  -H "Accept: application/json"
```

**Respuesta esperada (401 Unauthorized)**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

✅ **Validar**:
- Status 401
- Protección de endpoint

---

### TEST 10: Reenviar Token

**Endpoint**: `POST /api/core/resend/token/`

**Request**:
```bash
curl -X POST http://localhost:8000/api/core/resend/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "institutional_email": "juan.test@universidad.edu.co"
  }'
```

**Respuesta esperada (200 OK)**:
```json
{
  "message": "Email de verificación reenviado",
  "institutional_email": "juan.test@universidad.edu.co"
}
```

✅ **Validar**:
- Status 200
- Nuevo email enviado

---

## 🔒 Tests con Autenticación (Opcional)

### TEST 11: Obtener Estado de Verificación (Autenticado)

**1. Obtener token** (primero crea usuario admin):
```bash
python manage.py createsuperuser
# username: admin
# email: admin@test.com
# password: Admin123!
```

**2. Login**:
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin123!"}' > token.json
```

**3. Obtener status**:
```bash
curl http://localhost:8000/api/core/verify/status/ \
  -H "Authorization: Bearer $(cat token.json | grep -o '"access":"[^"]*' | cut -d'"' -f4)" \
  -H "Accept: application/json"
```

**Respuesta esperada (200 OK)**:
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "institutional_email": null,
    "role": "parent",
    "verification_status": "pending",
    "email_verified": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "verification_status": {
    "email_verified": false,
    "institutional_status": "pending",
    "student_verification": null,
    "documents": []
  }
}
```

✅ **Validar**:
- Status 200
- Datos de usuario retornados
- Campos de verificación presentes

---

## 📊 Matriz de Validación

| Test | Endpoint | Método | Status | Validación |
|------|----------|--------|--------|-----------|
| 1 | register/parent | POST | 201 | ✅ Registro exitoso |
| 2 | register/parent | POST | 400 | ✅ RUT inválido |
| 3 | register/parent | POST | 400 | ✅ Email no institucional |
| 4 | register/parent | POST | 400 | ✅ Contraseña débil |
| 5 | register/nanny | POST | 201 | ✅ Registro exitoso |
| 6 | register/nanny | POST | 400 | ✅ Programa no educación |
| 7 | programs | GET | 200 | ✅ Listar 10 programas |
| 8 | verify/email | POST | 400 | ✅ Token inválido |
| 9 | verify/status | GET | 401 | ✅ No autenticado |
| 10 | resend/token | POST | 200 | ✅ Token reenviado |
| 11 | verify/status | GET | 200 | ✅ Status con auth |

---

## 🐛 Debugging

### Ver logs de Django
```bash
tail -f logs/django.log
```

### Ver BD SQLite
```bash
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.all()
```

### Ejecutar tests
```bash
python manage.py test core --verbosity=2
```

### Ver migrations aplicadas
```bash
python manage.py showmigrations
```

---

## 📝 Notas

1. **Email Institucional**: Debe terminar en `@universidad.edu.co`
2. **RUT Válido**: Usa `12.345.678-9`, `98.765.432-1`, etc.
3. **Contraseña**: Mínimo 8 caracteres, mayús, minús, número, especial
4. **Programa**: ID 1-6 son educación (permitido niñera), 7-10 no
5. **Certificado**: PDF/JPG/PNG, máximo 5MB
6. **Verificación**: Token expira en 24 horas

---

**¡Ready para testing! 🚀**
