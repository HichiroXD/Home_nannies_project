# 🗺️ FASES CONSOLIDADAS Y PRIORIZADAS
**Proyecto:** Home Nannies MVP  
**Fecha:** 14 de noviembre de 2025  
**Audiencia:** Team Lead, Developers, Stakeholders

---

## Matriz de Prioridades (Impacto vs Esfuerzo)

| # | Fase | Componentes Clave | Duración | Impacto | Backend Nuevo | Deps | ROI |
|---|------|-------------------|----------|---------|---------------|------|-----|
| **0** | **Nanny Dashboard Core** (F5, F7, F11) | Availability, Requests, History | 3-4h | 🔥🔥🔥 Crítico | ❌ No | None | 🟢 Muy Alto |
| **1** | **Chat Backend** (Modelo + Serializers) | Message model, Endpoints | 1.5h | 🔥🔥 Alto | ✅ Sí (little) | None | 🟢 Alto |
| **2** | **Admin Dashboard** (F8) | Metrics, Activity, Stats | 2h | 🔥🔥 Alto | ✅ Sí | None | 🟡 Medio |
| **3** | **Admin Users CRUD** (F9) | UsersList, UserRow, Filters | 2h | 🔥🔥 Alto | ✅ Sí | Phase 2 | 🟡 Medio |
| **4** | **Admin Nannies CRUD** (F10) | NanniesList, NannyRow, Filters | 2h | 🔥🔥 Alto | ✅ Sí | Phase 2 | 🟡 Medio |
| **5** | **Chat Frontend** (ChatWindow, Polling) | Chat UI, Components | 2-3h | 🔥 Medio | ❌ No | Phase 1 | 🟡 Medio |
| **6** | **Nanny Detail Page** (Padre) | NannyDetail, Reviews, Availability | 2h | 🔥 Medio | ❌ No | None | 🟡 Medio |
| **7** | **Booking Detail Page** (Padre) | BookingDetail, Actions, Embed Chat | 1.5h | 🔥 Medio | ❌ No | Phase 5 | 🟡 Medio |
| **8** | **Admin Reviews** (F11 - Opcional) | ReviewsList, Moderation | 1.5h | 🟡 Bajo | ✅ Sí | Phase 2 | 🟠 Bajo |

---

## 📅 EJECUCIÓN RECOMENDADA

### **SPRINT 1: MVP CRÍTICO (Semana 1)**
**Objetivo:** Hacer funcional la app para los 3 roles (padre, niñera, admin)  
**Total: ~22 horas**

#### Bloque A: Nanny Core + Admin Setup (Lunes - Martes)
- **Fase 0:** Nanny Dashboard Core (3-4h) — **BLOCKER**
  - Availability Management
  - Requests (pending bookings)
  - Booking History
  - Router updates

- **Fase 2:** Admin Dashboard (2h) — **SETUP**
  - Create admin_api app backend
  - Stats endpoints
  - Dashboard UI (metrics, activity)

**Status:** ✅ Niñeras pueden gestionar disponibilidad y reservas; Admin ve overview

---

#### Bloque B: Admin CRUD + Chat Backend (Miércoles - Jueves mañana)
- **Fase 3:** Admin Users CRUD (2h) — **OPERATIVO**
  - Users list, filters, actions
  - Backend endpoints

- **Fase 4:** Admin Nannies CRUD (2h) — **VERIFICACIÓN**
  - Nannies list, filters, actions
  - Verification workflow

- **Fase 1:** Chat Backend (1.5h) — **SETUP**
  - Message model
  - Serializers
  - Endpoints

**Status:** ✅ Admin puede gestionar usuarios/niñeras; Chat backend listo

---

#### Bloque C: Chat Frontend + Padre Views (Jueves tarde - Viernes)
- **Fase 5:** Chat Frontend (2-3h) — **INTEGRACIÓN**
  - ChatWindow component
  - Polling hook
  - Embed en BookingDetail

- **Fase 6:** Nanny Detail (2h) — **UX PADRE**
  - Perfil niñera
  - Reviews
  - Disponibilidad

**Status:** ✅ Usuarios padre pueden ver perfiles, chatear; Niñeras y Admin operacionales

---

### **SPRINT 2: CONSOLIDACIÓN (Semana 2)**
**Objetivo:** Pulir, testear, optimizar y documentar  
**Total: ~8 horas**

#### Bloque D: Finishing Touches
- **Fase 7:** Booking Detail (1.5h) — **CIERRE PADRE**
  - Detalle completo de reserva
  - Acciones (accept/reject/cancel/complete)
  - Chat integrado

- **Fase 8:** Admin Reviews (1.5h) — **MODERACIÓN (Opcional)**
  - Moderation interface
  - Flag/delete reviews

- **Testing + Bug Fixes + Deployment:** (4h)
  - E2E testing
  - Permission checks
  - UX improvements
  - Mobile responsive
  - Deploy checklist

**Status:** ✅ MVP Completo y pulido

---

## 📊 DESGLOSE POR ROL Y TIPO

### Por Rol de Usuario

**PADRE (Rol: parent)**
```
Prioridad 1: Ver catálogo de niñeras ✅ (YA EXISTE)
Prioridad 2: Ver detalle de niñera + reviews [Fase 6] ← SEGUNDA SEMANA
Prioridad 3: Crear reserva ✅ (YA EXISTE)
Prioridad 4: Ver mis reservas ✅ (YA EXISTE)
Prioridad 5: Chat con niñera [Fases 1, 5]
Prioridad 6: Ver detalle de reserva [Fase 7]
Prioridad 7: Favoritos ✅ (YA EXISTE)

Tiempo estimado: 3-4h (fases 6 + 7)
```

**NIÑERA (Rol: nanny)**
```
Prioridad 1: Gestionar disponibilidad [Fase 0a] ← SEMANA 1 (BLOCKER)
Prioridad 2: Ver solicitudes pendientes [Fase 0b] ← SEMANA 1
Prioridad 3: Aceptar/rechazar/completar [Fase 0b + 0c] ← SEMANA 1
Prioridad 4: Ver historial de reservas [Fase 0c] ← SEMANA 1
Prioridad 5: Chat con padre [Fases 1, 5]
Prioridad 6: Ver reviews recibidas [Ya existe en backend]

Tiempo estimado: 4-5h (todas en semana 1)
Status: OPERACIONAL SEMANA 1 + COMPLETO SEMANA 2
```

**ADMIN (Rol: admin)**
```
Prioridad 1: Dashboard con métricas [Fase 2] ← SEMANA 1
Prioridad 2: Gestionar usuarios [Fase 3] ← SEMANA 1
Prioridad 3: Gestionar niñeras (verificación) [Fase 4] ← SEMANA 1
Prioridad 4: Moderar reseñas [Fase 8] ← SEMANA 2 (Opcional)
Prioridad 5: Ver actividad/logs [Fase 2 (activity feed)]

Tiempo estimado: 7-8h (fases 2, 3, 4, 8)
Status: OPERACIONAL SEMANA 1
```

---

## 📈 ROADMAP VISUAL (Semana 1 - Semana 2)

```
SEMANA 1 (Horas acumuladas)
├─ Lunes 6h
│  ├─ 3h: Fase 0 (Nanny Dashboard)
│  └─ 2h: Fase 2 (Admin Dashboard backend)
│  └─ 1h: Setup
│
├─ Martes 6h
│  ├─ 2h: Fase 3 (Admin Users)
│  ├─ 2h: Fase 4 (Admin Nannies)
│  └─ 2h: Documentación + Tests
│
├─ Miércoles 4h
│  ├─ 1.5h: Fase 1 (Chat Backend)
│  └─ 2.5h: Frontend setup
│
├─ Jueves 4h
│  ├─ 2h: Fase 5 (Chat Frontend)
│  └─ 2h: Integración
│
└─ Viernes 4h
   ├─ 2h: Fase 6 (Nanny Detail)
   └─ 2h: Testing + Docs
   
TOTAL SEMANA 1: ~22 horas

SEMANA 2 (Horas acumuladas)
├─ Lunes 3h
│  ├─ 1.5h: Fase 7 (Booking Detail)
│  └─ 1.5h: Bug fixes
│
├─ Martes 3h
│  ├─ 1.5h: Fase 8 (Reviews moderation)
│  └─ 1.5h: Testing
│
├─ Miércoles-Viernes: Polish + Deployment
│  └─ Optimizaciones, mobile, security
   
TOTAL SEMANA 2: ~8 horas

TOTAL MVP: ~30 horas de desarrollo
```

---

## 🎯 CRITERIOS DE ACEPTACIÓN POR FASE

### Fase 0: Nanny Dashboard Core ✅
- [ ] Disponibilidad: crear/editar/listar franjas
- [ ] Solicitudes: listar pending, aceptar/rechazar
- [ ] Historial: filtros, links a detalle
- [ ] Rutas: `/availability`, `/requests`, `/history` funcionan
- [ ] Permisos: solo nanny puede acceder
- [ ] Toast alerts: éxito/error en acciones
- [ ] Responsive: mobile + desktop

### Fase 1: Chat Backend ✅
- [ ] Modelo Message creado y migrado
- [ ] Endpoints GET messages, POST message funcionan
- [ ] Permisos: solo participantes pueden acceder
- [ ] Serializer valida y devuelve datos correctos
- [ ] Tests: al menos 80% coverage

### Fase 2: Admin Dashboard ✅
- [ ] Endpoints `/api/admin/stats/` y `/api/admin/activity/` funcionan
- [ ] UI muestra: total users, nannies, bookings, revenue
- [ ] Activity feed muestra últimas acciones
- [ ] Protegido: solo admin puede acceder
- [ ] Responsive

### Fase 3: Admin Users CRUD ✅
- [ ] Tabla lista usuarios con filtros
- [ ] Búsqueda por email/nombre
- [ ] Cambiar rol funciona
- [ ] Bloquear/desbloquear funciona
- [ ] Eliminar usuario funciona
- [ ] Paginación

### Fase 4: Admin Nannies CRUD ✅
- [ ] Tabla lista niñeras con filtros
- [ ] Verificar niñera funciona
- [ ] Bloquear/desbloquear funciona
- [ ] Ver perfil + reviews funciona
- [ ] Paginación

### Fase 5: Chat Frontend ✅
- [ ] ChatWindow carga mensajes
- [ ] Polling funciona (actualiza cada 2-5s)
- [ ] Enviar mensaje funciona
- [ ] Mensajes aparecen en ambos lados
- [ ] Responsive
- [ ] Auto-scroll al último mensaje

### Fase 6: Nanny Detail ✅
- [ ] Perfil muestra: info, foto, certificaciones
- [ ] Reviews muestra: lista con puntuación
- [ ] Disponibilidad muestra: próximas franjas
- [ ] Botón reservar lleva a BookingCreate
- [ ] Botón favorito funciona
- [ ] Link desde Catalog funciona

### Fase 7: Booking Detail ✅
- [ ] Detalle muestra: parent, nanny, estado, horas
- [ ] Acciones (accept/reject/cancel/complete) funcionan
- [ ] Chat embebido funciona
- [ ] Permisos: solo participantes acceden
- [ ] Responsive

### Fase 8: Admin Reviews (Opcional) ✅
- [ ] Tabla lista reviews con filtros
- [ ] Flag/unflag funciona
- [ ] Eliminar funciona
- [ ] Paginación

---

## 🔄 DEPENDENCIAS Y ORDEN DE EJECUCIÓN

```
PARALLELIZABLE (sin dependencias):
  - Fase 0 (Nanny Dashboard)
  - Fase 2 (Admin Dashboard)
  - Fase 6 (Nanny Detail)

NECESITA FASE PREVIA:
  - Fase 1 (Chat Backend) → Fase 5 (Chat Frontend) → Fase 7 (Booking Detail)
  - Fase 2 (Admin Dashboard) → Fase 3 (Admin Users) → Fase 4 (Admin Nannies) → Fase 8 (Reviews)

RECOMENDACIÓN: Ejecutar en paralelo
  - Developer 1: Fases 0, 6, 7 (Frontend padre + niñera)
  - Developer 2: Fases 2, 3, 4, 8 (Backend admin + frontend admin)
  - Developer 3: Fases 1, 5 (Chat backend + frontend)
```

---

## ✅ CHECKLIST DE PREPARACIÓN

### Backend
- [ ] Nueva app `admin_api` creada
- [ ] Message model definido
- [ ] Custom permission `IsAdminUser` creado
- [ ] Serializers para admin endpoints listos
- [ ] Endpoints documentados en swagger/drf-spectacular

### Frontend
- [ ] Componentes estructurados por carpeta (admin/, nanny/, chat/)
- [ ] API clients (adminApi.js, messageApi.js) preparados
- [ ] Router preparado para nuevas rutas
- [ ] Tailwind CSS classes revisadas
- [ ] Mobile responsive checks

### Testing
- [ ] Tests unitarios para cada serializer
- [ ] Tests de permisos (admin, nanny, parent)
- [ ] Tests E2E principales (login → action → verify)

### Documentación
- [ ] API endpoints documentados
- [ ] Setup guide actualizado
- [ ] Deployment checklist preparado

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total horas de desarrollo** | ~30 horas |
| **Duración estimada** | 2 semanas (con equipo de 2 devs) |
| **Fases parallelizables** | 3 fases independientes |
| **Riesgo técnico** | 🟢 Bajo (endpoints backend ya existen en 70%) |
| **ROI más alto** | Fase 0 (Nanny Dashboard) |
| **Funcionalidad crítica lista en** | Fin de semana 1 |
| **MVP completo en** | Fin de semana 2 |

---

**Próximos pasos:** 
1. Revisar con equipo
2. Asignar developers a fases parallelizables
3. Iniciar Fase 0 (Nanny Dashboard Core) inmediatamente
4. Crear tickets/PRs en GitHub para cada fase
