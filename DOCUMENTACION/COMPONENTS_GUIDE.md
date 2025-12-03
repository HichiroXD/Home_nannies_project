# Guía de Componentes React - Frontend

## 📦 Estructura de Componentes

```
src/
├── components/
│   ├── auth/                    # Autenticación y protección
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── RoleProtectedRoute.jsx    ← 🆕 Fase 3
│   ├── common/                  # Componentes reutilizables
│   │   ├── ImageUploader.jsx         ← 🆕 Fase 3
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   └── layout/                  # Layout y navegación
│       ├── Navbar.jsx
│       ├── Footer.jsx
│       └── NotificationCenter.jsx    ← Actualizado Fase 3
└── views/                       # Vistas principales
    ├── profile/
    │   ├── NannyProfile.jsx          ← Actualizado Fase 3
    │   └── ParentProfile.jsx         ← Actualizado Fase 3
    ├── Unauthorized.jsx              ← 🆕 Fase 3
    └── dashboard/
```

---

## 🔐 Componentes de Autenticación

### RoleProtectedRoute.jsx
**Propósito:** Protege rutas basándose en el rol del usuario.

**Props:**
```jsx
{
  allowedRoles: string[],  // Roles permitidos: ['parent', 'nanny', 'admin']
  children: ReactNode       // Componente a renderizar si tiene acceso
}
```

**Ejemplo de uso:**
```jsx
import RoleProtectedRoute from '@components/auth/RoleProtectedRoute';

<Routes>
  <Route 
    path="/parent-dashboard" 
    element={
      <RoleProtectedRoute allowedRoles={['parent']}>
        <ParentDashboard />
      </RoleProtectedRoute>
    } 
  />
  <Route 
    path="/nanny-dashboard" 
    element={
      <RoleProtectedRoute allowedRoles={['nanny']}>
        <NannyDashboard />
      </RoleProtectedRoute>
    } 
  />
</Routes>
```

**Comportamiento:**
- ✅ Verifica el rol del usuario desde `localStorage`
- ✅ Redirige a `/unauthorized` si no tiene permisos
- ✅ Redirige a `/login` si no está autenticado
- ✅ Muestra spinner mientras verifica

**Correcciones Fase 3:**
- Eliminada dependencia de `useAuth` hook inexistente
- Usa `localStorage` directamente para compatibilidad

---

## 🖼️ Componentes Comunes

### ImageUploader.jsx
**Propósito:** Componente reutilizable para subir imágenes de perfil con preview.

**Props:**
```jsx
{
  currentImage: string,           // URL de la imagen actual
  onImageChange: (file: File) => void,  // Callback cuando cambia la imagen
  className?: string              // Clases CSS adicionales
}
```

**Ejemplo de uso:**
```jsx
import ImageUploader from '@components/common/ImageUploader';

const [profilePhoto, setProfilePhoto] = useState(null);

<ImageUploader
  currentImage={userData?.profile_photo}
  onImageChange={(file) => setProfilePhoto(file)}
  className="mb-4"
/>
```

**Características:**
- ✅ Preview inmediato de la imagen seleccionada
- ✅ Drag & drop para subir archivos
- ✅ Validación de formato (JPEG, PNG, WEBP)
- ✅ Validación de tamaño (máx 5MB)
- ✅ Mensajes de error claros
- ✅ Diseño responsive con TailwindCSS
- ✅ Icono de cámara con indicador visual

**Estados internos:**
- `preview`: URL temporal para preview
- `error`: Mensaje de error de validación
- `isDragging`: Estado de drag & drop

**Validaciones:**
```javascript
// Formatos permitidos
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

// Tamaño máximo
const maxSize = 5 * 1024 * 1024; // 5MB
```

---

## 🔔 Componente de Notificaciones

### NotificationCenter.jsx
**Propósito:** Centro de notificaciones con soporte para múltiples tipos.

**Características actualizadas (Fase 3):**
- ✅ Soporte para notificaciones de reseñas (`review_submitted`, `review_received`)
- ✅ Iconos contextuales por tipo de notificación
- ✅ Colores distintivos (amarillo para reseñas)
- ✅ Marcado de lectura individual y masivo
- ✅ Filtrado por estado (leídas/no leídas)

**Tipos de notificaciones soportados:**
```javascript
const notificationTypes = {
  'booking_new': { icon: Calendar, color: 'blue', title: 'Nueva Reserva' },
  'booking_confirmed': { icon: CheckCircle, color: 'green', title: 'Reserva Confirmada' },
  'booking_cancelled': { icon: XCircle, color: 'red', title: 'Reserva Cancelada' },
  'review_submitted': { icon: Star, color: 'yellow', title: 'Reseña Publicada' },     // 🆕
  'review_received': { icon: Star, color: 'yellow', title: 'Nueva Reseña Recibida' }  // 🆕
};
```

**Ejemplo de uso:**
```jsx
import NotificationCenter from '@components/layout/NotificationCenter';

// En Navbar o Layout principal
<NotificationCenter />
```

**Funcionalidades:**
```jsx
// Marcar como leída
const markAsRead = async (notificationId) => {
  await notificationApi.markAsRead(notificationId);
};

// Marcar todas como leídas
const markAllAsRead = async () => {
  await notificationApi.markAllAsRead();
};
```

---

## 👤 Componentes de Perfil

### NannyProfile.jsx
**Propósito:** Vista y edición del perfil de niñera.

**Mejoras Fase 3:**
- ✅ Sección de foto siempre visible (no solo en modo edición)
- ✅ Placeholder claro cuando no hay foto ("Sin foto de perfil")
- ✅ Integración con `ImageUploader` component
- ✅ Upload con `FormData` para envío multipart

**Estados:**
```jsx
const [isEditing, setIsEditing] = useState(false);
const [profileData, setProfileData] = useState({});
const [profilePhoto, setProfilePhoto] = useState(null);
```

**Sección de foto mejorada:**
```jsx
{/* MODO LECTURA - Siempre visible */}
{!isEditing && (
  <div className="flex flex-col items-center mb-6">
    <div className="relative w-32 h-32 mb-4">
      {profileData.profile_photo ? (
        <img 
          src={profileData.profile_photo} 
          alt="Foto de perfil"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Sin foto de perfil</span>
        </div>
      )}
    </div>
  </div>
)}

{/* MODO EDICIÓN */}
{isEditing && (
  <ImageUploader
    currentImage={profileData.profile_photo}
    onImageChange={(file) => setProfilePhoto(file)}
  />
)}
```

**Envío de datos con foto:**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('bio', profileData.bio);
  formData.append('hourly_rate', profileData.hourly_rate);
  
  if (profilePhoto) {
    formData.append('profile_photo', profilePhoto);
  }
  
  await profileApi.update(formData);
};
```

### ParentProfile.jsx
**Propósito:** Vista y edición del perfil de padre.

**Características:** Idénticas a NannyProfile con campos específicos de padres.

---

## 🚫 Vista de Error

### Unauthorized.jsx
**Propósito:** Página 403 para accesos no autorizados.

**Props:**
```jsx
{
  userRole?: string  // Rol actual del usuario (opcional)
}
```

**Características:**
- ✅ Mensaje claro de error 403
- ✅ Muestra el rol actual del usuario
- ✅ Botones de navegación (volver atrás, ir al dashboard)
- ✅ Diseño responsive y amigable

**Ejemplo de uso:**
```jsx
import Unauthorized from '@views/Unauthorized';

<Route path="/unauthorized" element={<Unauthorized />} />
```

**Contenido:**
```jsx
<div className="min-h-screen flex items-center justify-center bg-gray-50">
  <div className="text-center">
    <h1 className="text-6xl font-bold text-red-600">403</h1>
    <p className="text-2xl text-gray-700 mt-4">Acceso No Autorizado</p>
    <p className="text-gray-600 mt-2">
      Tu rol actual es: <span className="font-semibold">{getRoleText(userRole)}</span>
    </p>
    <div className="mt-6 space-x-4">
      <button onClick={() => navigate(-1)}>Volver Atrás</button>
      <button onClick={() => navigate('/dashboard')}>Ir al Dashboard</button>
    </div>
  </div>
</div>
```

---

## 🎨 Estilos y Temas

### TailwindCSS
Todos los componentes usan clases de Tailwind para consistencia:

```css
/* Colores primarios */
primary: '#3B82F6'      /* Azul */
success: '#10B981'      /* Verde */
warning: '#F59E0B'      /* Amarillo */
danger: '#EF4444'       /* Rojo */

/* Spacing */
spacing: {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem'
}
```

### Componentes base
```jsx
// Botón primario
<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Guardar
</button>

// Input
<input 
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

// Card
<div className="bg-white shadow-md rounded-lg p-6">
  {/* Contenido */}
</div>
```

---

## 🔌 APIs y Servicios

### Estructura de servicios
```javascript
// src/api/profileApi.js
export const profileApi = {
  getNannyProfile: () => axios.get('/api/nannies/profile/'),
  updateNannyProfile: (data) => axios.patch('/api/nannies/profile/', data),
  getParentProfile: () => axios.get('/api/parents/profile/'),
  updateParentProfile: (data) => axios.patch('/api/parents/profile/', data)
};

// src/api/notificationApi.js
export const notificationApi = {
  getAll: () => axios.get('/api/notifications/'),
  markAsRead: (id) => axios.patch(`/api/notifications/${id}/mark-read/`),
  markAllAsRead: () => axios.post('/api/notifications/mark-all-read/')
};
```

### Configuración de Axios
```javascript
// src/api/axiosConfig.js
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🧪 Testing (Pendiente - Fase 4)

### Vitest Setup
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Ejemplo de test para ImageUploader
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageUploader from '@components/common/ImageUploader';

describe('ImageUploader', () => {
  it('muestra la imagen actual si existe', () => {
    render(
      <ImageUploader 
        currentImage="http://example.com/photo.jpg"
        onImageChange={vi.fn()}
      />
    );
    
    const img = screen.getByAltText('Preview');
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('http://example.com/photo.jpg');
  });
  
  it('muestra error con archivo demasiado grande', () => {
    const onImageChange = vi.fn();
    render(<ImageUploader onImageChange={onImageChange} />);
    
    const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });
    
    const input = screen.getByLabelText('Subir imagen');
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/máximo 5MB/i)).toBeInTheDocument();
    expect(onImageChange).not.toHaveBeenCalled();
  });
});
```

---

## 📝 Convenciones de Código

### Naming
```javascript
// Componentes: PascalCase
const ImageUploader = () => {};

// Hooks: camelCase con 'use' prefix
const useAuth = () => {};

// Funciones helper: camelCase
const formatDate = (date) => {};

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

### Estructura de componentes
```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 2. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3. Hooks
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  // 4. Handlers
  const handleClick = () => {};
  
  // 5. Render helpers
  const renderContent = () => {};
  
  // 6. Return JSX
  return (
    <div>
      {renderContent()}
    </div>
  );
};

// 7. PropTypes
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func
};

// 8. Default props
MyComponent.defaultProps = {
  prop2: () => {}
};

export default MyComponent;
```

---

## 🚀 Performance Tips

1. **Lazy Loading**
```jsx
const NannyDashboard = lazy(() => import('@views/dashboard/NannyDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <NannyDashboard />
</Suspense>
```

2. **Memoization**
```jsx
const MemoizedComponent = React.memo(ExpensiveComponent);
```

3. **useCallback para handlers**
```jsx
const handleSubmit = useCallback((data) => {
  // Handle submit
}, [dependencies]);
```

---

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev)

---

**Última actualización:** 2 de diciembre de 2025  
**Fase actual:** 3 completada, 4 en progreso
