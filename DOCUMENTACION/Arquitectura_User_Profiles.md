# Arquitectura de Modelos - User y Profiles

## Diseño Actual

El sistema utiliza un patrón **User + Profile** donde:

### 1. Modelo User (Autenticación)
- **Ubicación**: `users/models.py`
- **Propósito**: Maneja autenticación, permisos y datos básicos
- **Campo clave**: `role` (choices: 'parent', 'nanny', 'admin')
- **Relaciones**: OneToOne con NannyProfile y ParentProfile

### 2. Modelos Profile (Extensión por Rol)

#### NannyProfile
- **Ubicación**: `nannies/models.py`
- **Relación**: `user = OneToOneField(User, related_name='nanny_profile')`
- **Datos específicos**: 
  - `experience_years`
  - `hourly_rate`
  - `description`
  - `verified`
  - `rating_avg`
  - `certifications`

#### ParentProfile
- **Ubicación**: `parents/models.py`
- **Relación**: `user = OneToOneField(User, related_name='parent_profile')`
- **Datos específicos**:
  - `phone`
  - `address`
  - `emergency_contact`
  - `children_count`
  - `preferences`

### 3. Modelos Transaccionales

Todos los modelos que relacionan usuarios deben usar **User directamente**:

#### Booking
```python
parent = ForeignKey(User, related_name='bookings_made')
nanny = ForeignKey(User, related_name='bookings_received')
```

#### Review
```python
parent = ForeignKey(User, related_name='reviews_made')
nanny = ForeignKey(NannyProfile, related_name='reviews_received')  # Usa Profile para agregar rating
```

#### Favorite
```python
parent = ForeignKey(User, related_name='favorites')
nanny = ForeignKey(NannyProfile, related_name='favorited_by')  # Usa Profile
```

## Signals de Auto-creación

Los perfiles se crean automáticamente al registrar un usuario:

- **NannyProfile**: `users/signals.py` → `create_nanny_profile`
- **ParentProfile**: `parents/signals.py` → `create_parent_profile`

## Acceso a Datos

### Desde User a Profile:
```python
user = User.objects.get(username='john')
if user.role == 'nanny':
    profile = user.nanny_profile
    rate = profile.hourly_rate
elif user.role == 'parent':
    profile = user.parent_profile
    children = profile.children_count
```

### Desde Profile a User:
```python
nanny = NannyProfile.objects.get(id=1)
user = nanny.user
email = user.email
```

## Ventajas del Diseño

1. ✅ **Flexibilidad**: Un usuario podría tener múltiples roles en el futuro
2. ✅ **Django estándar**: Sigue las best practices de Django
3. ✅ **Autenticación simple**: User maneja auth sin complicaciones
4. ✅ **Escalable**: Agregar nuevos roles es fácil (crear nuevo Profile)
5. ✅ **Separación de concerns**: Auth separado de datos de dominio

## Migraciones Necesarias

Para implementar ParentProfile:

```bash
# 1. Crear migraciones
python manage.py makemigrations parents

# 2. Aplicar migraciones
python manage.py migrate parents

# 3. Crear perfiles para usuarios existentes
python fix_parent_profiles.py
```

## Mantenimiento

- **Al agregar nuevo rol**: Crear nueva app con Profile model + signal
- **Al modificar User**: Considerar impacto en todos los Profiles
- **Al consultar datos**: Usar select_related('nanny_profile', 'parent_profile') para optimizar
