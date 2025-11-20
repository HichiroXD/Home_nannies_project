# 🔍 COMPARACIÓN DE DASHBOARDS POR ROL

**Documento:** Guía de dashboards específicas para cada tipo de usuario  
**Actualización:** 18 de noviembre de 2025

---

## 📊 Tabla Comparativa General

| Aspecto | Padre | Niñera | Admin |
|--------|-------|--------|-------|
| **Ruta** | `/dashboard/parent/` | `/dashboard/nanny/` | `/admin/dashboard/` |
| **Archivo** | `ParentDashboard.jsx` | `NannyDashboard.jsx` | `AdminDashboard.jsx` |
| **Rol Verificado** | parent/padre/madre | nanny/niñera | admin |
| **Prop. Principal** | Encontrar niñeras | Gestionar disponibilidad | Sistema completo |

---

## 🎯 PARENT DASHBOARD

### Objetivo
Permitir que los padres busquen, contraten y gestionen niñeras para el cuidado de sus hijos.

### Estadísticas Principales (4)
| Stat | Valor | Icono | Color |
|------|-------|-------|-------|
| Reservas Activas | 2 | 📖 BookOpen | Azul |
| Favoritos | 5 | ❤️ Heart | Rosa |
| Próximas Reservas | 1 | ⏱️ Clock | Naranja |

### Accesos Rápidos (4)
1. **Ver Catálogo** → `/catalog/`
   - Icono: MapPin (azul)
   - Descripción: Busca y explora niñeras disponibles

2. **Mis Favoritos** → `/favorites/`
   - Icono: Heart (rosa)
   - Descripción: Accede a tus niñeras favoritas

3. **Mis Reservas** → `/bookings/`
   - Icono: Clock (verde)
   - Descripción: Gestiona tus reservas y horarios

4. **Mi Perfil** → `/dashboard/profile`
   - Icono: BookOpen (púrpura)
   - Descripción: Actualiza tu información personal

### Actividad Reciente (Ejemplos)
- ✅ Reserva aceptada (verde)
- ❤️ Agregada a favoritos (rosa)
- ✅ Reserva completada (cyan)

### User Journey
```
Landing → Login → DashboardUser (redirección) → ParentDashboard
         ↓
    [Explora]
         ↓
  Catalog → Nanny Profile → BookingCreate → MyBookings
         ↓
    [Gestiona]
         ↓
  FavoriteList | MyBookings | Chat (Fase 5)
```

### Funcionalidades Futuras
- [ ] Historial de transacciones
- [ ] Reseñas a niñeras
- [ ] Sistema de notificaciones
- [ ] Perfil de hijo/niño

---

## 🎯 NANNY DASHBOARD

### Objetivo
Permitir que las niñeras gestionen su disponibilidad, vean solicitudes y controlen su historial de reservas.

### Estadísticas Principales (4)
| Stat | Valor | Icono | Color |
|------|-------|-------|-------|
| Franjas Disponibles | 12 | 📅 Calendar | Azul |
| Solicitudes Pendientes | 2 | ⏱️ Clock | Naranja |
| Reservas Completadas | 24 | 📄 FileText | Verde |
| Calificación Promedio | 4.8★ | ⭐ Star | Rosa |

### Acciones Principales (3)
1. **Gestionar Disponibilidad** → `/availability/`
   - Define franjas horarias disponibles
   - Icono: Calendar (azul)
   - Componente: AvailabilityManagement

2. **Solicitudes Pendientes** → `/requests/`
   - Revisa y responde solicitudes de reserva
   - Icono: Clock (naranja)
   - Componente: NannyRequests

3. **Historial de Reservas** → `/history/`
   - Consulta reservas pasadas y actuales
   - Icono: FileText (verde)
   - Componente: NannyBookingHistory

### Quick Link: Tu Perfil
- **Ruta:** `/dashboard/nanny/profile`
- **Componente:** NannyProfile
- **Descripción:** Actualiza información personal y foto de perfil

### Actividad Reciente (Ejemplos)
- 🕐 Solicitud pendiente (naranja)
- ✅ Reserva completada (verde)
- ⭐ Nueva reseña (rosa)

### User Journey
```
Landing → Login → DashboardUser (redirección) → NannyDashboard
                                                      ↓
         [Configura]           [Gestiona]           [Revisa]
              ↓                    ↓                    ↓
     AvailabilityManagement  NannyRequests  NannyBookingHistory
              ↓                    ↓                    ↓
     [Crear slots]         [Aceptar/Rechazar]   [Ver historial]
```

### Flujo de Trabajo
1. **Semana 1:** Niñera crea franjas de disponibilidad
2. **Semana 1-N:** Recibe solicitudes de padres
3. **Al recibir:** Acepta o rechaza en "Solicitudes Pendientes"
4. **Después de reserva:** Aparece en "Historial de Reservas"
5. **Post-cuidado:** Recibe calificaciones y reseñas

### Funcionalidades Futuras
- [ ] Calendario visual de disponibilidad
- [ ] Sistema de earnings/ganancias
- [ ] Estadísticas de desempeño
- [ ] Chat con padres (Fase 1)
- [ ] Certificaciones y documentos

---

## 🎯 ADMIN DASHBOARD

### Objetivo
Permitir que los administradores monitoreen, gestionen y moderen toda la plataforma.

### KPIs Principales (4)
| KPI | Valor | Icono | Color | Tendencia |
|-----|-------|-------|-------|-----------|
| Usuarios Totales | 156 | 👥 Users | Azul | +12% |
| Niñeras Registradas | 42 | ✅ UserCheck | Verde | +8% |
| Reservas Activas | 18 | 📈 TrendingUp | Naranja | +5% |
| Ingresos (Mes) | $3,250 | 📊 BarChart3 | Púrpura | +15% |

### Gestión del Sistema (4 Módulos)
1. **Gestionar Usuarios** → `/admin/users/`
   - Ver, editar y eliminar usuarios
   - Icono: Users (azul)
   - Funcionalidades: Listar, filtrar, buscar, bloquear

2. **Gestionar Niñeras** → `/admin/nannies/`
   - Verificación, perfiles y gestión
   - Icono: UserCheck (verde)
   - Funcionalidades: Verificación, revisión de documentos

3. **Reseñas y Moderación** → `/admin/reviews/`
   - Revisar y moderar reseñas
   - Icono: AlertCircle (rosa)
   - Funcionalidades: Flag, delete, approve

4. **Configuración** → `/admin/settings/`
   - Ajustes del sistema
   - Icono: Settings (púrpura)
   - Funcionalidades: Parámetros globales

### Actividad del Sistema (Feed)
- 📝 Nuevo usuario registrado
- ✅ Niñera verificada
- 📊 Reserva confirmada
- 📈 Reporte generado

### Notificaciones Pendientes
- 3 niñeras pendientes de verificación
- 1 reseña marcada como inapropiada
- (Expandible con más alertas)

### User Journey (Admin)
```
Landing → Admin Login → DashboardUser (redirección) → AdminDashboard
                                                           ↓
          [Monitorea]    [Gestiona]      [Modera]    [Configura]
               ↓              ↓               ↓            ↓
          Analytics      Users/Nannies   Reviews      Settings
               ↓              ↓               ↓            ↓
          KPIs/Trends    CRUD Ops      Approve/Flag  Global Params
```

### Responsabilidades
1. **Monitoreo:** Ver KPIs y trends
2. **Moderación:** Revisar contenido, usuarios, niñeras
3. **Gestión:** Crear, actualizar, eliminar usuarios
4. **Reporte:** Generar reportes de actividad
5. **Configuración:** Ajustar parámetros del sistema

### Funcionalidades Futuras
- [ ] Gráficos de crecimiento
- [ ] Exportar reportes (CSV/PDF)
- [ ] Sistema de logs de auditoría
- [ ] Comunicaciones en masa (emails)
- [ ] Análisis de fraude
- [ ] Dashboard de pagos/ingresos

---

## 🔄 FLUJO DE REDIRECCIÓN POR ROL

### Puntos de Entrada
Cuando un usuario hace login, se guardan:
- `accessToken` → Token JWT
- `role` → El rol del usuario (parent, nanny, admin)

### Lógica de Redirección (`DashboardUser.jsx`)
```javascript
const roleNormalized = String(role).toLowerCase();

if (roleNormalized.includes("nanny") || roleNormalized.includes("niñ")) {
  navigate("/dashboard/nanny/");
} else if (roleNormalized === "admin") {
  navigate("/admin/dashboard/");
} else if (roleNormalized === "parent" || roleNormalized.includes("padre") || roleNormalized.includes("madre")) {
  navigate("/dashboard/parent/");
}
```

### Rutas Protegidas
Cada dashboard valida su rol:
```javascript
if (!roleNormalized || !(roleNormalized.includes("nanny") || roleNormalized.includes("niñ"))) {
  navigate("/dashboard/"); // Redirige si rol incorrecto
}
```

---

## 🎨 Componentes Compartidos

### Todos los dashboards usan:

1. **DashboardLayout** - Estructura base
2. **PageHeader** - Encabezado estandarizado
3. **LogoutButton** - Cierre de sesión seguro
4. **StatCard** - Tarjetas de métricas
5. **QuickLinkButton** - Botones de navegación
6. **ActivityItem** - Feed de actividad

---

## 📱 Responsividad

Todas las dashboards son responsive:

### Desktop (lg, 1024px+)
- Grids de 4 columnas (stats)
- Layout completo sin scroll
- Iconos grandes

### Tablet (md, 768px+)
- Grids de 2-3 columnas
- Layout compacto
- Iconos medianos

### Mobile (<768px)
- Grids de 1 columna
- Stack vertical
- Iconos pequeños, texto adaptado

---

## 🔐 Seguridad y Permisos

### Validaciones implementadas:
- ✅ Token requerido para acceder (localStorage)
- ✅ Rol verificado en cada dashboard
- ✅ Redirección automática si rol incorrecto
- ✅ Logout seguro (limpia tokens y rol)

### Próximas mejoras:
- [ ] JWT refresh automático
- [ ] Expiración de token en UI
- [ ] Permisos granulares
- [ ] Audit logs

---

## 📊 Resumen Comparativo

| Feature | Parent | Nanny | Admin |
|---------|--------|-------|-------|
| Buscar niñeras | ✅ | ❌ | ❌ |
| Reservar | ✅ | ❌ | ❌ |
| Gestionar disponibilidad | ❌ | ✅ | ❌ |
| Ver solicitudes | ❌ | ✅ | ❌ |
| Ver historial | ✅ | ✅ | ❌ |
| Ver usuarios | ❌ | ❌ | ✅ |
| Moderar contenido | ❌ | ❌ | ✅ |
| KPIs del sistema | ❌ | ❌ | ✅ |
| Feed de actividad | ✅ | ✅ | ✅ |
| Perfil | ✅ | ✅ | ❌ |

---

## 🎯 Próximos Pasos

1. **Integración de API** (Fase 1-3)
   - Conectar stats con backend
   - Actualizar datos en tiempo real

2. **Chat Integrado** (Fase 5)
   - ParentDashboard: Chat con niñera actual
   - NannyDashboard: Chat con padres

3. **Análisis Mejorado** (Fase 8)
   - AdminDashboard: Gráficos de tendencias
   - Export de reportes

4. **Notificaciones** (Futuro)
   - Push notifications
   - Email alerts
   - In-app messaging
