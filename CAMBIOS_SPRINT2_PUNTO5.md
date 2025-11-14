# 📋 CAMBIOS IMPLEMENTADOS - SPRINT 2 (Punto 5: Calendario / Disponibilidad)

**Fecha:** 12 de noviembre de 2025
**Completitud:** 5/6 tareas finalizadas (83%)

---

## ✅ TAREA 5: Mostrar disponibilidad de la niñera y crear reserva desde slot (HNSP-59)

### Resumen de cambios:
- ✅ Backend: `AvailabilityListCreateView` ahora permite consultar disponibilidades de una niñera pasada por query param `?nanny=<id>`.
- ✅ Frontend API: añadida `src/api/availabilityApi.js` con métodos `getAvailabilities`, `createAvailability`, `deleteAvailability`.
- ✅ Componente presentacional: `src/components/bookings/AvailabilityList.jsx` muestra slots agrupados por día y botones para seleccionar.
- ✅ Nueva vista: `src/views/BookingCreate.jsx` (ruta `/bookings/create/:nannyId`) que carga disponibilidades de la niñera y permite reservar un slot (llama a `createBooking`).
- ✅ Router: ruta añadida en `AppRouter.jsx`.
- ✅ Integración con `createBooking` (server-side valida disponibilidad y choques antes de crear la reserva).

---

## Backend - Detalles

### Archivo modificado:
`Back_Django_REST/bookings/views.py`

### Cambio principal:
- `AvailabilityListCreateView.get_queryset()` ahora acepta `?nanny=<id>` para devolver la disponibilidad de otra niñera (útil para padres que consultan la disponibilidad de una niñera específica).

**Nota de seguridad/UX:**
- La vista sigue usando `IsAuthenticated` por ahora. Dado que la app ya exige login para crear reservas, permitimos que usuarios autenticados (padres) consulten disponibilidades.
- Si se desea publicar disponibilidades públicamente, podríamos cambiar permisos GET a `AllowAny` y seguir restringiendo POST a `IsAuthenticated`.

---

## Frontend - Detalles

### Nuevos archivos:
- `frontend_nannies/src/api/availabilityApi.js` - API wrapper
- `frontend_nannies/src/components/bookings/AvailabilityList.jsx` - Presentational
- `frontend_nannies/src/views/BookingCreate.jsx` - Vista para seleccionar slot y crear reserva

### UX:
- En `Catalog.jsx`, cuando el usuario hace click en "Agendar" y está autenticado, se le redirige a `/bookings/create/:nannyId`.
- `BookingCreate.jsx` carga disponibilidades con `getAvailabilities({ nanny: nannyId })`.
- El usuario selecciona un slot (botón) -> `createBooking(nannyId, startISO, endISO)`.
- En caso de éxito, se muestra `AlertToast` y se redirige a `/bookings`.
- En caso de error, se muestra `AlertToast` con el mensaje del backend (ej. "Niñera no disponible" o "Choque con reserva confirmada").

---

## Cómo probar (manual):
1. Asegúrate de estar autenticado como **padre**.
2. Ve a la vista del catálogo (`/catalog`) y elige una niñera.
3. Haz click en "Agendar" (te redirigirá a `/bookings/create/:nannyId`).
4. Selecciona uno de los slots mostrados (por día).
5. Verás un `AlertToast` de éxito y serás redirigido a `/bookings`.
6. Revisa en `/bookings` que la reserva aparece con estado `pending`.

---

## Notas técnicas y mejoras futuras
- Actualmente las disponibilidades se muestran en un componente simple (botones por slot). Para una experiencia más rica recomendamos:
  - Integrar `react-calendar` o `react-big-calendar` para vista calendario con slots.
  - Añadir selección de zona horaria y normalización al timezone del usuario.
  - Permitir previsualización del slot seleccionado antes de confirmar.
  - Soportar reservas con duraciones arbitrarias (ej. seleccionar duración en UI).

---

## Estado del Sprint 2

| Tarea | Estado |
|-------|--------|
| 1. AlertToast (HNSP-44) | ✅ |
| 2. Botón Favorito (HNSP-51) | ✅ |
| 3. Modal editar reserva (HNSP-7) | ✅ |
| 4. UI confirmación (HNSP-8) | ✅ |
| 5. Calendario disponibilidad (HNSP-59) | ✅ |
| 6. Monitoreo básico (HNSP-55) | ⏳ |

**Completitud actual:** 83%

---

¿Quieres que implemente la vista calendario completa con `react-calendar` (mejor visual) o dejamos la vista de slots por ahora y paso al monitoreo (HNSP-55)?
