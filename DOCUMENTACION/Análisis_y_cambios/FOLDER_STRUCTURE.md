# 📁 ESTRUCTURA DE ARCHIVOS - DASHBOARDS ACTUALIZADAS

**Documento:** Guía de estructura de carpetas y archivos  
**Fecha:** 18 de noviembre de 2025

---

## 📂 Vista General de Estructura Frontend

```
frontend_nannies/
├── src/
│   ├── components/
│   │   ├── dashboard/          ← [ACTUALIZADO] Componentes reutilizables
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── TokenDisplay.jsx
│   │   │   ├── LogoutButton.jsx
│   │   │   ├── StatCard.jsx              ← ✨ NUEVO
│   │   │   ├── QuickLinkButton.jsx       ← ✨ NUEVO
│   │   │   ├── ActivityItem.jsx          ← ✨ NUEVO
│   │   │   └── index.js                  ← ACTUALIZADO (exports)
│   │   │
│   │   ├── layout/
│   │   │   ├── PageHeader.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── FilterTabs.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── favorites/
│   │   ├── nanny/
│   │   ├── availability/
│   │   └── index.js
│   │
│   ├── views/
│   │   ├── dashboard/          ← [ACTUALIZADO] Dashboards por rol
│   │   │   ├── DashboardUser.jsx        ← ACTUALIZADO (redirección mejorada)
│   │   │   ├── ParentDashboard.jsx      ← ✨ NUEVO
│   │   │   ├── NannyDashboard.jsx       ← ACTUALIZADO (mejorado)
│   │   │   ├── AdminDashboard.jsx       ← ✨ NUEVO
│   │   │   └── NannyProfile.jsx
│   │   │
│   │   ├── AvailabilityManagement.jsx
│   │   ├── NannyRequests.jsx
│   │   ├── NannyBookingHistory.jsx
│   │   ├── Catalog.jsx
│   │   ├── FavoriteList.jsx
│   │   ├── MyBookings.jsx
│   │   ├── BookingCreate.jsx
│   │   ├── Landing.jsx
│   │   └── auth/
│   │
│   ├── router/
│   │   └── AppRouter.jsx       ← ACTUALIZADO (nuevas rutas)
│   │
│   ├── api/
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## 🔍 Detalle: Carpeta `components/dashboard/`

### Archivos Existentes
```
dashboard/
├── DashboardLayout.jsx
│   └── Contenedor principal para todos los dashboards
│       Props: children
│
├── TokenDisplay.jsx
│   └── Muestra el token JWT (para testing)
│       Props: token
│
└── LogoutButton.jsx
    └── Botón de cierre de sesión
        Props: onLogout (callback)
```

### Archivos Nuevos (✨)
```
├── StatCard.jsx
│   └── Tarjeta de estadística/métrica
│       Props: title, value, icon, color, trend
│       Ejemplo:
│       <StatCard
│         title="Usuarios Totales"
│         value={156}
│         icon={Users}
│         color="#3b82f6"
│         trend={12}
│       />
│
├── QuickLinkButton.jsx
│   └── Botón de acceso rápido con navegación
│       Props: title, description, icon, to, color
│       Ejemplo:
│       <QuickLinkButton
│         title="Ver Catálogo"
│         description="Busca niñeras disponibles"
│         icon={MapPin}
│         to="/catalog/"
│         color="#3b82f6"
│       />
│
└── ActivityItem.jsx
    └── Item de feed de actividad
        Props: timestamp, title, description, icon, color
        Ejemplo:
        <ActivityItem
          timestamp="Hoy a las 14:30"
          title="Reserva aceptada"
          description="María García aceptó tu solicitud"
          icon={CheckCircle}
          color="#10b981"
        />
```

### Archivo Actualizado: `index.js`
```javascript
// Antes (3 exports)
export { default as DashboardLayout } from "./DashboardLayout";
export { default as TokenDisplay } from "./TokenDisplay";
export { default as LogoutButton } from "./LogoutButton";

// Ahora (6 exports)
export { default as DashboardLayout } from "./DashboardLayout";
export { default as TokenDisplay } from "./TokenDisplay";
export { default as LogoutButton } from "./LogoutButton";
export { default as StatCard } from "./StatCard";           ← NUEVO
export { default as QuickLinkButton } from "./QuickLinkButton"; ← NUEVO
export { default as ActivityItem } from "./ActivityItem";   ← NUEVO
```

---

## 🔍 Detalle: Carpeta `views/dashboard/`

### Archivos Existentes
```
dashboard/
├── DashboardUser.jsx
│   └── Dashboard genérico con redirección por rol
│       Ruta: /dashboard/
│       Lógica: Valida token → Redirige según rol
│       Rol verificado: ALL (redirección)
│
└── NannyProfile.jsx
    └── Perfil de niñera
        Ruta: /dashboard/nanny/profile
```

### Archivos Actualizados (🔄)
```
├── DashboardUser.jsx
│   └── CAMBIOS:
│       - Agregada redirección a AdminDashboard para admin
│       - Agregada redirección a ParentDashboard para padres
│       - Mejor normalización de roles
│
└── NannyDashboard.jsx
    └── CAMBIOS:
        - Migrado a componentes reutilizables
        - Agregadas 4 tarjetas de estadísticas
        - Mejorado feed de actividad
        - Redesign completo (3 col grid)
```

### Archivos Nuevos (✨)
```
├── ParentDashboard.jsx
│   └── Dashboard para padres/madres
│       Ruta: /dashboard/parent/
│       Características:
│       - 3 stats: reservas activas, favoritos, próximas
│       - 4 quick links: catálogo, favoritos, mis reservas, perfil
│       - Feed de actividad (reservas, favoritos, completadas)
│       - Diseño completo con componentes reutilizables
│
└── AdminDashboard.jsx
    └── Dashboard para administradores
        Ruta: /admin/dashboard/
        Características:
        - 4 KPIs: usuarios totales, niñeras, reservas, ingresos
        - 4 módulos: usuarios, niñeras, reseñas, configuración
        - Feed de actividad del sistema
        - Sección de notificaciones pendientes
        - Diseño profesional
```

---

## 🔄 Cambios en `router/AppRouter.jsx`

### Imports Agregados
```javascript
// Nuevos dashboards
import ParentDashboard from "@views/dashboard/ParentDashboard";
import AdminDashboard from "@views/dashboard/AdminDashboard";
```

### Nuevas Rutas
```jsx
{/* Dashboard padre */}
<Route path="/dashboard/parent/" element={<ParentDashboard />} />

{/* Dashboard administrador */}
<Route path="/admin/dashboard/" element={<AdminDashboard />} />
```

### Estructura Actualizada
```
Routes:
├── AUTENTICACIÓN (sin cambios)
│   ├── / → Landing
│   ├── /login/ → Login
│   ├── /register/ → Register
│   └── /verify/:uid/:token/ → Verify
│
├── DASHBOARDS (ACTUALIZADO)
│   ├── /dashboard/ → DashboardUser (redirección)
│   ├── /dashboard/parent/ → ParentDashboard ← NUEVO
│   ├── /dashboard/nanny/ → NannyDashboard (mejorado)
│   ├── /admin/dashboard/ → AdminDashboard ← NUEVO
│   └── /dashboard/nanny/profile → NannyProfile
│
├── CATÁLOGO Y BÚSQUEDA
│   ├── /catalog/ → Catalog
│   └── /favorites/ → FavoriteList
│
├── RESERVAS - PADRE
│   ├── /bookings/ → MyBookings
│   └── /bookings/create/:nannyId → BookingCreate
│
├── RESERVAS - NIÑERA (FASE 0)
│   ├── /availability/ → AvailabilityManagement
│   ├── /requests/ → NannyRequests
│   └── /history/ → NannyBookingHistory
│
└── 404
    └── * → 404 Page
```

---

## 📊 Resumen de Cambios por Archivo

### Archivos Nuevos: 5
- ✨ `StatCard.jsx` (80 líneas)
- ✨ `QuickLinkButton.jsx` (24 líneas)
- ✨ `ActivityItem.jsx` (27 líneas)
- ✨ `ParentDashboard.jsx` (165 líneas)
- ✨ `AdminDashboard.jsx` (155 líneas)

### Archivos Modificados: 4
- 🔄 `components/dashboard/index.js` (+3 exports)
- 🔄 `DashboardUser.jsx` (+2 redirecciones)
- 🔄 `NannyDashboard.jsx` (refactor completo, +100 líneas)
- 🔄 `AppRouter.jsx` (+2 imports, +2 routes)

### Archivos Sin Cambios: Resto del proyecto
- Sin afectación en otros módulos
- Componentes de layout reutilizables sin cambios
- API layer sin cambios

---

## 🎯 Importación desde Otras Vistas

### Antes
```javascript
import { DashboardLayout, TokenDisplay, LogoutButton } 
  from "@components/dashboard";
```

### Ahora (Acceso a nuevos componentes)
```javascript
import {
  DashboardLayout,
  TokenDisplay,
  LogoutButton,
  StatCard,           // ← NUEVO
  QuickLinkButton,    // ← NUEVO
  ActivityItem,       // ← NUEVO
} from "@components/dashboard";

// Uso directo
<StatCard
  title="Metric"
  value={100}
  icon={IconComponent}
  color="#3b82f6"
/>
```

---

## 📦 Dependencias (Sin cambios)

El proyecto mantiene las mismas dependencias:
- React 18+
- React Router v6
- Tailwind CSS
- Lucide React (para iconos)
- Vite (build tool)

No se agregaron nuevas librerías.

---

## 🔐 Protección de Rutas

### Rutas Protegidas Implementadas

```javascript
// ParentDashboard.jsx
if (!roleNormalized || 
    (roleNormalized !== "parent" && 
     !roleNormalized.includes("padre") && 
     !roleNormalized.includes("madre"))) {
  navigate("/dashboard/");
}

// NannyDashboard.jsx
if (!roleNormalized || 
    !(roleNormalized.includes("nanny") || 
      roleNormalized.includes("niñ"))) {
  navigate("/dashboard/");
}

// AdminDashboard.jsx
if (!roleNormalized || roleNormalized !== "admin") {
  navigate("/dashboard/");
}
```

---

## 🔍 Verificación de Estructura

### Checklist de Validación
- ✅ Todos los imports correctos
- ✅ Archivos en carpetas corretas
- ✅ Index.js actualizados
- ✅ Rutas en AppRouter
- ✅ Sin circular dependencies
- ✅ Componentes reutilizables cohesivos
- ✅ 0 errores de compilación
- ✅ Props consistentes entre componentes

---

## 🚀 Próximos Cambios Esperados

### Fase 1: Chat Backend
```
- Message model
- messageApi.js
- ChatWindow component
```

### Fase 2: Admin CRUD
```
- UsersList view
- NanniesList view
- /admin/users/ route
- /admin/nannies/ route
```

### Fase 5: Chat Frontend
```
- ChatWindow.jsx component
- usePolling hook
- messageBubble component
- Chat integrado en BookingDetail
```

---

## 📋 Notas Importantes

1. **Datos Simulados:** Las estadísticas y actividad en los dashboards usan `useState` con datos hardcodeados
2. **API Ready:** La estructura está lista para integrar API calls en lugar de datos simulados
3. **Responsive Design:** Todas las dashboards funcionan en mobile, tablet y desktop
4. **Accesibilidad:** Iconos con labels, contraste de colores adecuado
5. **Mantenibilidad:** Componentes pequeños y reutilizables, fáciles de mantener

---

## 📞 Soporte

Para agregar nuevas dashboards o modificar existentes:

1. **Crear nuevo archivo en `views/dashboard/`**
2. **Importar componentes reutilizables**
3. **Agregar ruta en `AppRouter.jsx`**
4. **Implementar validación de rol**
5. **Hacer CI/CD testing**
