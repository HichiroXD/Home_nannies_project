# Verificación de Persistencia de Sesión

## Problema Resuelto
Al cerrar y volver a abrir el proyecto, el usuario debía iniciar sesión nuevamente. Esto se debía a:

1. **Typo en Zustand persist**: `partializefalse` en lugar de `partialize`
2. **RoleProtectedRoute** leía solo de `localStorage` sin verificar el store

## Cambios Implementados

### 1. Fix en useAuthStore.js (línea 160)
```javascript
// ANTES (incorrecto)
partializefalse: (state) => ({

// DESPUÉS (correcto)
partialize: (state) => ({
  user: state.user,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  role: state.role,
  isAuthenticated: state.isAuthenticated
})
```

### 2. Fix en RoleProtectedRoute.jsx
```javascript
// ANTES: Solo leía de localStorage
const token = localStorage.getItem('accessToken');
const userRole = localStorage.getItem('role');

// DESPUÉS: Lee del store primero, localStorage como fallback
import useAuthStore from '@/stores/useAuthStore';

const { isAuthenticated, accessToken, role } = useAuthStore();
const token = accessToken || localStorage.getItem('accessToken');
const userRole = role || localStorage.getItem('role');
```

## Cómo Verificar que Funciona

### Paso 1: Limpiar Estado Anterior
1. Abrir DevTools del navegador (F12)
2. Ir a Application → Local Storage → http://localhost:5173
3. Eliminar todas las claves: `accessToken`, `refreshToken`, `role`, `username`, `auth-storage`
4. Recargar la página (F5)

### Paso 2: Iniciar Sesión
1. Ir a la página de login
2. Iniciar sesión con cualquier usuario (ejemplo: Romina/password123)
3. Verificar que ingresa correctamente al dashboard

### Paso 3: Verificar localStorage
1. Abrir DevTools (F12) → Application → Local Storage
2. Deberías ver:
   - `accessToken`: "eyJ0eXAiOiJKV1..."
   - `refreshToken`: "eyJ0eXAiOiJKV1..."
   - `role`: "nanny" o "parent" o "admin"
   - `username`: "Romina"
   - **`auth-storage`**: `{"state": {"user": {...}, "accessToken": "...", ...}, "version": 0}`

### Paso 4: Verificar Persistencia
**Opción A: Cerrar/Abrir Navegador**
1. Cerrar completamente el navegador (todas las ventanas)
2. Volver a abrir el navegador
3. Ir a http://localhost:5173
4. **RESULTADO ESPERADO**: El usuario debería estar automáticamente autenticado y en su dashboard

**Opción B: Recargar Página**
1. Presionar F5 o Ctrl+R para recargar
2. **RESULTADO ESPERADO**: El usuario sigue autenticado, no se redirige a login

**Opción C: Nueva Pestaña**
1. Abrir nueva pestaña
2. Ir a http://localhost:5173
3. **RESULTADO ESPERADO**: El usuario está autenticado en la nueva pestaña

### Paso 5: Verificar Console (opcional)
1. Abrir DevTools (F12) → Console
2. Buscar el log: `[INFO] User logged in` con `{ username: "Romina", role: "nanny" }`
3. No debería haber errores relacionados con autenticación

## Troubleshooting

### Problema: Sigo siendo redirigido a /login
**Verificar:**
1. ¿Existe la clave `auth-storage` en localStorage?
   - Si NO existe: El persist no está funcionando
   - Verificar que el archivo `useAuthStore.js` tenga `partialize` (no `partializefalse`)
   
2. ¿El valor de `auth-storage` contiene el token?
   ```json
   {
     "state": {
       "user": { "username": "Romina", "role": "nanny" },
       "accessToken": "eyJ0eXAi...",
       "refreshToken": "eyJ0eXAi...",
       "role": "nanny",
       "isAuthenticated": true
     },
     "version": 0
   }
   ```

3. ¿El `accessToken` está también en localStorage directamente?
   - Debería existir tanto `auth-storage` como `accessToken` individualmente
   - El sistema usa ambos para compatibilidad

### Problema: Token existe pero sigo siendo redirigido
**Verificar:**
1. El token puede estar expirado
   - Backend JWT tiene tiempo de expiración (normalmente 1 día)
   - Si han pasado más de 24 horas, el token no es válido
   
2. Verificar en Console:
   ```javascript
   // Abrir Console y ejecutar:
   localStorage.getItem('accessToken')
   
   // Decodificar JWT (copiar el token completo)
   // Ir a: https://jwt.io
   // Pegar el token y verificar la fecha 'exp' (expiration)
   ```

3. Si el token expiró:
   - Hacer logout
   - Volver a hacer login
   - El nuevo token debería tener nueva fecha de expiración

### Problema: Persiste pero al recargar se pierde
**Verificar:**
1. ¿El componente `App.jsx` o `main.jsx` usa `<RoleProtectedRoute>`?
   - Verificar que importa de `@/components/auth/RoleProtectedRoute`
   
2. ¿El interceptor de axios puede leer el token?
   - El archivo `api/api.js` lee de `localStorage.getItem('accessToken')`
   - Esto debería funcionar si el store lo guarda allí

## Arquitectura de Persistencia

### Doble Sistema de Persistencia
El sistema mantiene **dos copias** del estado de autenticación:

1. **Zustand Persist** (`auth-storage`)
   - Guarda todo el estado del store
   - Se carga automáticamente al iniciar la aplicación
   - Formato JSON complejo con versioning

2. **localStorage individual** (`accessToken`, `refreshToken`, `role`, `username`)
   - Compatibilidad con componentes legacy
   - Usado por interceptor de axios
   - Usado como fallback en RoleProtectedRoute

**Ambos se mantienen sincronizados** porque:
- La función `login()` del store guarda en ambos lugares
- La función `logout()` limpia ambos lugares

### Flujo de Autenticación

```
┌──────────────┐
│  Login Page  │
└──────┬───────┘
       │ submit credentials
       ▼
┌──────────────────────────────┐
│  API POST /api/users/login/  │
└──────────────┬───────────────┘
               │ returns { access, refresh, username, role }
               ▼
┌────────────────────────────────────────────┐
│  useAuthStore.login(data)                  │
│  ├─ localStorage.setItem('accessToken')    │
│  ├─ localStorage.setItem('refreshToken')   │
│  ├─ localStorage.setItem('role')           │
│  ├─ set({ user, accessToken, ... })        │ ◄── Zustand persist auto-guarda
│  └─ isAuthenticated = true                 │     en 'auth-storage'
└────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  Navigate to Dashboard                     │
└────────────────────────────────────────────┘

═══════════════════════════════════════════════
  BROWSER CLOSE / RELOAD
═══════════════════════════════════════════════

┌────────────────────────────────────────────┐
│  App Init                                  │
│  ├─ Zustand auto-hydrate from localStorage│
│  │  (lee 'auth-storage')                   │
│  ├─ useAuthStore tiene estado restaurado   │
│  └─ isAuthenticated = true ✓               │
└────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  RoleProtectedRoute                        │
│  ├─ const { accessToken } = useAuthStore() │ ◄── Lee del store restaurado
│  ├─ if (accessToken) → render children     │
│  └─ else → <Navigate to="/login" />        │
└────────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│  User stays in Dashboard ✓                 │
└────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Typo `partializefalse` corregido a `partialize` en useAuthStore.js
- [ ] RoleProtectedRoute importa y usa `useAuthStore`
- [ ] Login guarda en localStorage y store
- [ ] Logout limpia localStorage y store
- [ ] Existe clave `auth-storage` en localStorage después de login
- [ ] Recargar página (F5) mantiene sesión
- [ ] Cerrar/abrir navegador mantiene sesión
- [ ] Nueva pestaña puede acceder sin login
- [ ] Interceptor axios envía token en headers
- [ ] Token JWT no está expirado
- [ ] Console no muestra errores de autenticación

## Referencias

- **Zustand Persist**: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
- **JWT Decoder**: https://jwt.io
- **Archivos modificados**:
  - `frontend_nannies/src/stores/useAuthStore.js` (línea 160)
  - `frontend_nannies/src/components/auth/RoleProtectedRoute.jsx`
