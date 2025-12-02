# Testing Sprint - Home Nannies Project

## Información General

| Campo | Valor |
|-------|-------|
| **Nombre Proyecto** | Home Nannies Project |
| **Nombre de Prueba** | Testing integral de funcionalidades |
| **Módulo Principal / Sistema** | Plataforma de gestión de niñeras |
| **Responsable TI Testing** | Equipo QA |
| **Cliente Responsable** | Product Owner |
| **Perfiles utilizados** | Padre/Madre, Niñera, Administrador |

---

## Casos de Prueba

| N° | Módulo testing | Responsable de testing | Procesos a probar | Efecto esperado | Efecto obtenido | Evaluación | Fecha de prueba | Situación actual |
|----|----------------|------------------------|-------------------|-----------------|-----------------|------------|-----------------|------------------|
| **1** | **Autenticación / Registro** |
| 1 | Registro de Usuario | Tester | Registrar nuevo usuario como padre/madre | El usuario debe poder crear una cuenta con email, contraseña y rol | | | | En Proceso |
| 2 | Registro de Usuario | Tester | Registrar nuevo usuario como niñera | El usuario debe poder crear una cuenta con email, contraseña y datos profesionales | | | | En Proceso |
| 3 | Login | Tester | Iniciar sesión con credenciales válidas | El usuario debe acceder al dashboard correspondiente a su rol | | | | En Proceso |
| 4 | Login | Tester | Intentar login con credenciales inválidas | El sistema debe mostrar error y no permitir acceso | | | | En Proceso |
| 5 | Recuperación de Contraseña | Tester | Solicitar recuperación de contraseña | El sistema debe enviar email con link de recuperación | | | | En Proceso |
| 6 | Logout | Tester | Cerrar sesión | El usuario debe ser redirigido a landing page y token eliminado | | | | En Proceso |
| **2** | **Gestión de Perfil - Padre/Madre** |
| 7 | Perfil de Padre | Tester | Ver perfil de padre/madre | El sitio debe mostrar información personal, contacto y número de hijos | | | | En Proceso |
| 8 | Perfil de Padre | Tester | Editar información del perfil (nombre, teléfono, dirección) | Los datos deben quedar guardados y reflejarse inmediatamente | | | | En Proceso |
| 9 | Perfil de Padre | Tester | Actualizar preferencias y notas | Las preferencias deben guardarse correctamente | | | | En Proceso |
| 10 | Perfil de Padre | Tester | Acceder a "Ver Notificaciones" desde perfil | Debe navegar a página de notificaciones completa | | | | En Proceso |
| **3** | **Gestión de Perfil - Niñera** |
| 11 | Perfil de Niñera | Tester | Ver perfil de niñera | El sitio debe mostrar experiencia, certificaciones, tarifa por hora y estadísticas | | | | En Proceso |
| 12 | Perfil de Niñera | Tester | Editar información profesional (experiencia, certificaciones, descripción) | Los datos deben actualizarse y mostrarse en el catálogo | | | | En Proceso |
| 13 | Perfil de Niñera | Tester | Actualizar tarifa por hora | La nueva tarifa debe aparecer en el perfil y catálogo | | | | En Proceso |
| 14 | Perfil de Niñera | Tester | Ver estadísticas (calificación, reservas completadas, tasa de aceptación) | Las estadísticas deben mostrarse correctamente (solo lectura) | | | | En Proceso |
| 15 | Perfil de Niñera | Tester | Acceder a "Ver Notificaciones" desde perfil | Debe navegar a página de notificaciones completa | | | | En Proceso |
| **4** | **Catálogo de Niñeras** |
| 16 | Catálogo | Tester | Entrar al catálogo de niñeras | El usuario debe ver las niñeras disponibles con detalles básicos | | | | En Proceso |
| 17 | Catálogo | Tester | Filtrar catálogo por nombre, precio, experiencia, etc. | El sitio debe mostrar únicamente los resultados que coinciden con el filtro | | | | En Proceso |
| 18 | Catálogo | Tester | Ver detalles completos de una niñera | Debe mostrar perfil completo con foto, descripción, tarifa, calificación | | | | En Proceso |
| 19 | Catálogo | Tester | Ordenar resultados por diferentes criterios | Los resultados deben reorganizarse según el criterio seleccionado | | | | En Proceso |
| **5** | **Gestión de Favoritos** |
| 20 | Favoritos | Tester | Agregar niñera a favoritos | Debe aparecer icono de corazón lleno y la niñera en lista de favoritos | | | | En Proceso |
| 21 | Favoritos | Tester | Acceder al sitio de Favoritos para ver las niñeras marcadas | Debe mostrar un listado de niñeras marcadas como "favoritas" | | | | En Proceso |
| 22 | Favoritos | Tester | Eliminar niñera de favoritos | Sale notificación de niñera removida de favoritos y se elimina de la base de datos | | | | En Proceso |
| 23 | Favoritos | Tester | Contactar niñera desde favoritos | Debe permitir iniciar proceso de reserva desde la lista de favoritos | | | | En Proceso |
| **6** | **Gestión de Disponibilidad - Niñera** |
| 24 | Disponibilidad | Tester | Acceso al panel de gestión de disponibilidad | El sitio muestra el panel de control de niñera con botones para definir disponibilidad | | | | En Proceso |
| 25 | Disponibilidad | Tester | Crear nueva franja de disponibilidad | La niñera debe poder agregar día, hora inicio y hora fin | | | | En Proceso |
| 26 | Disponibilidad | Tester | Ver disponibilidades creadas en calendario | Las franjas deben aparecer en el calendario de disponibilidad | | | | En Proceso |
| 27 | Disponibilidad | Tester | Editar horario de disponibilidad | Los cambios deben guardarse y reflejarse en el calendario | | | | En Proceso |
| 28 | Disponibilidad | Tester | Eliminar franja de disponibilidad | La franja debe removerse del sistema y no aparecer en calendario | | | | En Proceso |
| 29 | Disponibilidad | Tester | Notificación de disponibilidad en dashboard | El dashboard de niñera debe mostrar las próximas disponibilidades configuradas | | | | En Proceso |
| **7** | **Gestión de Reservas - Padre/Madre** |
| 30 | Reservas | Tester | Entrar al perfil de niñera desde el catálogo | El sitio debe mostrar el perfil con información básica y un calendario para reservar | | | | En Proceso |
| 31 | Reservas | Tester | Seleccionar día en calendario de disponibilidad | Debe mostrar franjas horarias disponibles ese día | | | | En Proceso |
| 32 | Reservas | Tester | Reservar horario disponible | Debe crear reserva con estado "pendiente" y enviar notificación a la niñera | | | | En Proceso |
| 33 | Reservas | Tester | Verificar que franja reservada queda bloqueada | La franja debe aparecer como "Reservado" y no permitir nueva reserva | | | | En Proceso |
| 34 | Reservas | Tester | Ver "Ya reservaste" en franjas propias | Si el mismo padre intenta reservar de nuevo, debe indicar "Ya reservaste" | | | | En Proceso |
| 35 | Reservas | Tester | Ver listado de "Mis Reservas" | El sitio debe mostrar todas las reservas del usuario con estado y detalles | | | | En Proceso |
| 36 | Reservas | Tester | Cancelar reserva como padre | Entrega notificación de reserva eliminada y se remueve del sistema, notifica a niñera | | | | En Proceso |
| 37 | Reservas | Tester | Filtrar reservas por estado | Las reservas se filtran por su estado: completado, pendiente, rechazadas, etc. | | | | En Proceso |
| **8** | **Gestión de Reservas - Niñera** |
| 38 | Reservas Niñera | Tester | Ver solicitudes pendientes de reserva | El sitio debe mostrar un listado de reservas pendientes con información del padre | | | | En Proceso |
| 39 | Reservas Niñera | Tester | Aceptar solicitud de reserva | La reserva cambia a estado "confirmada" y se notifica al padre | | | | En Proceso |
| 40 | Reservas Niñera | Tester | Rechazar solicitud de reserva | La reserva cambia a estado "rechazada" y se notifica al padre | | | | En Proceso |
| 41 | Reservas Niñera | Tester | Ver historial de reservas completadas | Debe mostrar listado de todas las reservas pasadas con detalles | | | | En Proceso |
| 42 | Reservas Niñera | Tester | Marcar reserva como completada | El estado cambia a "completada" y se notifica al padre | | | | En Proceso |
| 43 | Reservas Niñera | Tester | Filtrar reservas por estado y fecha | Las reservas se filtran correctamente según criterios | | | | En Proceso |
| **9** | **Sistema de Notificaciones** |
| 44 | Notificaciones | Tester | Ver campanita de notificaciones en header | Debe aparecer campanita con contador de notificaciones no leídas | | | | En Proceso |
| 45 | Notificaciones | Tester | Abrir panel de notificaciones | Debe mostrar dropdown con últimas 5 notificaciones | | | | En Proceso |
| 46 | Notificaciones | Tester | Notificación de nueva reserva (niñera) | Al crear reserva, niñera recibe notificación con horario correcto en hora local | | | | En Proceso |
| 47 | Notificaciones | Tester | Notificación de reserva confirmada (padre) | Al aceptar reserva, padre recibe notificación de confirmación | | | | En Proceso |
| 48 | Notificaciones | Tester | Notificación de reserva rechazada (padre) | Al rechazar reserva, padre recibe notificación de rechazo | | | | En Proceso |
| 49 | Notificaciones | Tester | Notificación de reserva cancelada (niñera) | Al cancelar reserva, niñera recibe notificación de cancelación | | | | En Proceso |
| 50 | Notificaciones | Tester | Notificación de reserva completada (padre) | Al completar reserva, padre recibe notificación | | | | En Proceso |
| 51 | Notificaciones | Tester | Marcar notificación como leída | Al hacer clic, la notificación se marca como leída y desaparece el indicador | | | | En Proceso |
| 52 | Notificaciones | Tester | Navegar a vista completa de notificaciones | Click en notificación o "Ver todas" debe llevar a /notifications | | | | En Proceso |
| 53 | Notificaciones | Tester | Filtrar notificaciones (todas/no leídas/leídas) | Los filtros deben funcionar correctamente en vista completa | | | | En Proceso |
| 54 | Notificaciones | Tester | Marcar todas las notificaciones como leídas | Botón debe marcar todas como leídas simultáneamente | | | | En Proceso |
| 55 | Notificaciones | Tester | Acceder a notificaciones desde perfil | Botón "Ver Notificaciones" en perfiles debe navegar correctamente | | | | En Proceso |
| 56 | Notificaciones | Tester | Verificar formato de hora en notificaciones | Las horas deben mostrarse en hora local de Chile (America/Santiago) | | | | En Proceso |
| **10** | **Dashboard - Padre/Madre** |
| 57 | Dashboard Padre | Tester | Acceder al dashboard de padre | Debe mostrar resumen de próximas reservas, accesos rápidos | | | | En Proceso |
| 58 | Dashboard Padre | Tester | Ver próximas reservas en dashboard | Debe listar las próximas citas programadas con fecha y niñera | | | | En Proceso |
| 59 | Dashboard Padre | Tester | Acceso rápido a búsqueda de niñeras | Botón debe llevar al catálogo de niñeras | | | | En Proceso |
| 60 | Dashboard Padre | Tester | Acceso rápido a mis reservas | Botón debe navegar a página de gestión de reservas | | | | En Proceso |
| **11** | **Dashboard - Niñera** |
| 61 | Dashboard Niñera | Tester | Acceder al dashboard de niñera | Debe mostrar solicitudes pendientes, horarios, estadísticas | | | | En Proceso |
| 62 | Dashboard Niñera | Tester | Ver solicitudes pendientes en dashboard | Debe listar reservas pendientes de aceptación con info del padre | | | | En Proceso |
| 63 | Dashboard Niñera | Tester | Ver próximas disponibilidades | Debe mostrar las franjas horarias configuradas próximas | | | | En Proceso |
| 64 | Dashboard Niñera | Tester | Acceso rápido a gestión de disponibilidad | Botón debe llevar a página de configuración de horarios | | | | En Proceso |
| 65 | Dashboard Niñera | Tester | Ver estadísticas de perfil | Debe mostrar calificación promedio, reservas completadas | | | | En Proceso |
| **12** | **Dashboard - Administrador** |
| 66 | Dashboard Admin | Tester | Acceder al dashboard de administrador | Debe mostrar panel de control con métricas del sistema | | | | En Proceso |
| 67 | Dashboard Admin | Tester | Ver estadísticas generales del sistema | Debe mostrar total de usuarios, reservas, ingresos en CLP | | | | En Proceso |
| 68 | Dashboard Admin | Tester | Acceder a gestión de usuarios | Debe mostrar tabla con todos los usuarios registrados | | | | En Proceso |
| 69 | Dashboard Admin | Tester | Filtrar y buscar usuarios | Los filtros deben funcionar correctamente (rol, nombre, estado) | | | | En Proceso |
| 70 | Dashboard Admin | Tester | Editar información de usuario | Los cambios deben guardarse correctamente en la base de datos | | | | En Proceso |
| 71 | Dashboard Admin | Tester | Desactivar/activar usuario | El estado del usuario debe cambiar y afectar su acceso al sistema | | | | En Proceso |
| 72 | Dashboard Admin | Tester | Ver reportes de actividad | Debe generar reportes de reservas, usuarios activos, etc. | | | | En Proceso |
| **13** | **Sistema de Reseñas** |
| 73 | Reseñas | Tester | Dejar reseña a niñera después de servicio | El padre debe poder calificar y comentar después de reserva completada | | | | En Proceso |
| 74 | Reseñas | Tester | Ver reseñas de niñera en su perfil | Las reseñas deben aparecer en el perfil público de la niñera | | | | En Proceso |
| 75 | Reseñas | Tester | Calcular calificación promedio | La calificación promedio debe actualizarse con cada nueva reseña | | | | En Proceso |
| 76 | Reseñas | Tester | Editar reseña propia | El usuario debe poder modificar su reseña dentro de un periodo | | | | En Proceso |
| 77 | Reseñas | Tester | Eliminar reseña propia | El usuario debe poder eliminar su reseña | | | | En Proceso |
| **14** | **Validaciones y Seguridad** |
| 78 | Seguridad | Tester | Acceder a ruta protegida sin token | El sistema debe redirigir a login | | | | En Proceso |
| 79 | Seguridad | Tester | Token JWT expirado | Debe solicitar refresh token o redirigir a login | | | | En Proceso |
| 80 | Seguridad | Tester | Intentar acceder a dashboard de otro rol | El sistema debe redirigir al dashboard correcto según rol | | | | En Proceso |
| 81 | Validaciones | Tester | Crear reserva en horario no disponible | El backend debe rechazar la solicitud con mensaje de error | | | | En Proceso |
| 82 | Validaciones | Tester | Solapamiento de disponibilidades | No debe permitir crear franjas que se solapen | | | | En Proceso |
| 83 | Validaciones | Tester | Formato de email inválido en registro | Debe mostrar error de validación | | | | En Proceso |
| 84 | Validaciones | Tester | Contraseña que no cumple requisitos | Debe mostrar requisitos y no permitir registro | | | | En Proceso |
| 85 | Validaciones | Tester | Campos requeridos vacíos en formularios | Debe indicar campos obligatorios y prevenir envío | | | | En Proceso |
| **15** | **Interfaz de Usuario y Navegación** |
| 86 | UI/UX | Tester | Navegación entre páginas | Todos los links del header deben funcionar correctamente | | | | En Proceso |
| 87 | UI/UX | Tester | Diseño responsive en móvil | La interfaz debe adaptarse correctamente a pantallas móviles | | | | En Proceso |
| 88 | UI/UX | Tester | Mensajes de error y éxito (toasts) | Las alertas deben mostrarse con el estilo correcto y desaparecer | | | | En Proceso |
| 89 | UI/UX | Tester | Loaders durante operaciones | Debe mostrar indicador de carga en operaciones asíncronas | | | | En Proceso |
| 90 | UI/UX | Tester | Estados de botones (hover, disabled) | Los botones deben responder visualmente a las interacciones | | | | En Proceso |
| **16** | **Integración y Flujos Completos** |
| 91 | Flujo Completo | Tester | Flujo completo: Registro → Búsqueda → Reserva → Notificación | Un padre se registra, busca niñera, crea reserva y recibe notificación | | | | En Proceso |
| 92 | Flujo Completo | Tester | Flujo completo: Niñera recibe → Acepta → Completa → Reseña | Niñera recibe solicitud, acepta, marca completada, padre deja reseña | | | | En Proceso |
| 93 | Flujo Completo | Tester | Flujo de cancelación completo | Padre crea reserva, luego cancela, ambos reciben notificaciones | | | | En Proceso |
| 94 | Flujo Completo | Tester | Flujo de rechazo completo | Niñera rechaza solicitud, padre recibe notificación y puede buscar otra | | | | En Proceso |
| 95 | Flujo Completo | Tester | Múltiples reservas simultáneas | Verificar que no haya conflictos con reservas en horarios cercanos | | | | En Proceso |

---

## Leyenda de Evaluación

- **1**: Funciona correctamente
- **2**: Funciona con errores menores
- **3**: Funciona con errores mayores
- **4**: No funciona
- **N/A**: No aplica

## Leyenda de Situación Actual

- **En Proceso**: Pendiente de testing
- **Completado**: Testing finalizado y aprobado
- **Con Observaciones**: Testing completado con observaciones
- **Bloqueado**: No se puede testear por dependencias

---

## Notas Adicionales

### Configuración de Pruebas
- **URL Frontend**: http://localhost:5173
- **URL Backend**: http://localhost:8000
- **Base de Datos**: SQLite (desarrollo)
- **Zona Horaria**: America/Santiago (Chile)

### Datos de Prueba Sugeridos

#### Usuarios Padre
- Email: padre1@test.com
- Password: Test1234!
- Hijos: 2

#### Usuarios Niñera
- Email: nanny1@test.com
- Password: Test1234!
- Experiencia: 3 años
- Tarifa: $15000/hora

#### Usuarios Admin
- Email: admin@homenannies.com
- Password: Admin1234!

### Criterios de Aceptación Generales
1. Todas las operaciones deben completarse en menos de 3 segundos
2. No debe haber errores 500 en consola del navegador
3. Todas las notificaciones deben mostrar hora local de Chile
4. Los mensajes de error deben ser claros y en español
5. La interfaz debe ser responsive (mobile-first)

---

## Checklist Pre-Testing

- [ ] Servidor Django corriendo en puerto 8000
- [ ] Servidor React corriendo en puerto 5173
- [ ] Base de datos con datos de prueba cargados
- [ ] Migraciones aplicadas correctamente
- [ ] Variables de entorno configuradas
- [ ] Navegador con React DevTools instalado
- [ ] Herramientas de desarrollo abiertas (Console, Network)

---

**Fecha de Creación**: 24 de noviembre de 2025  
**Versión**: 1.0  
**Estado del Documento**: Borrador
