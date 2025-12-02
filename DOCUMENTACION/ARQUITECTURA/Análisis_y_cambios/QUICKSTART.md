# ⚡ INICIO RÁPIDO - Phase 1

## 🚀 En 5 Minutos

### Paso 1: Preparar Entorno
```bash
cd Back_Django_REST
```

### Paso 2: Verificar BD
```bash
# Si necesitas resetear:
rm db.sqlite3
python manage.py migrate
```

### Paso 3: Cargar Programas
```bash
python load_programs.py
```

✅ Deberías ver:
```
✓ Creado: EDUC001 - Pedagogía en Educación Básica
✓ Creado: EDUC002 - Pedagogía en Educación Parvularia
...
Total creados: 10
```

### Paso 4: Iniciar Servidor
```bash
python manage.py runserver
```

✅ Deberías ver:
```
Starting development server at http://127.0.0.1:8000/
Press CTRL+C to quit.
```

### Paso 5: Probar Endpoints
```bash
# En otra terminal:
curl http://localhost:8000/api/core/programs/
```

✅ Deberías obtener la lista de programas en JSON.

---

## 📋 Lo Que Se Ha Implementado

| Feature | Status |
|---------|--------|
| Validación RUT chileno | ✅ |
| Email @universidad.edu.co | ✅ |
| Contraseña fuerte | ✅ |
| Registro Padre/Madre | ✅ |
| Registro Niñera | ✅ |
| Verificación por email | ✅ |
| Restricción: Educación solo | ✅ |
| Admin approval | ✅ |
| Tokens JWT | ✅ |
| Admin panel | ✅ |

---

## 🧪 Tests

Ejecutar todos:
```bash
python manage.py test core
```

Resultado esperado:
```
Ran 4 tests in 0.XXs
OK
```

---

## 📚 Documentación

Lee en este orden:

1. **README_PHASE_1.md** - Esta guía de inicio
2. **TESTING_GUIDE.md** - Cómo probar cada endpoint
3. **IMPLEMENTATION_COMPLETE.md** - Guía técnica completa
4. **PHASE_1_IMPLEMENTATION_SUMMARY.md** - Detalles arquitectura

---

## 🔑 API Endpoints

### Públicos (sin autenticación)

```
POST   /api/core/register/parent/      Registrar padre
POST   /api/core/register/nanny/       Registrar niñera
POST   /api/core/verify/email/<token>/ Verificar email
POST   /api/core/resend/token/         Reenviar token
GET    /api/core/programs/             Listar programas
```

### Protegidos (requieren login)

```
GET    /api/core/verify/status/        Mi estado
POST   /api/core/student-verification/{id}/approve/  Admin
POST   /api/core/student-verification/{id}/reject/   Admin
```

---

## 📝 Ejemplo Simple

### 1. Registrar Padre
```bash
curl -X POST http://localhost:8000/api/core/register/parent/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "institutional_email": "juan@universidad.edu.co",
    "first_name": "Juan",
    "last_name": "Flores",
    "password": "Pass123!",
    "rut": "12.345.678-9"
  }'
```

### 2. Listar Programas
```bash
curl http://localhost:8000/api/core/programs/
```

### 3. Ver en Admin
```
http://localhost:8000/admin/
user: admin
password: (la que creaste con createsuperuser)
```

---

## 🐛 Si Algo No Funciona

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Database error"
```bash
python manage.py migrate
python load_programs.py
```

### "Port 8000 in use"
```bash
python manage.py runserver 8001
```

### Ver logs
```bash
python manage.py runserver --verbosity=2
```

---

## ✨ Lo Siguiente

1. Integrar con frontend React
2. Implementar Phase 2 (validación documentos)
3. Configurar email SMTP
4. Deploy a producción

---

## 📞 Ayuda

- Ver `TESTING_GUIDE.md` para test cases
- Ver `IMPLEMENTATION_COMPLETE.md` para API reference completa
- Ejecutar `python manage.py help` para comandos Django

---

**¡Listo para comenzar! 🎉**

Próximo paso: Lee `TESTING_GUIDE.md` para ver cómo probar los endpoints.
