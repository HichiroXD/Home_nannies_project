# 📡 Análisis: API Layer

**Fecha:** 14 de Diciembre, 2025  
**Módulo:** API Layer - Servicios HTTP y configuración de Axios  
**Archivos analizados:** api.js, userApi.js, bookingApi.js, notificationApi.js, favoriteApi.js, nannyApi.js, profileApi.js, reviewApi.js, ocrApi.js, availabilityApi.js

---

## 📊 Resumen Ejecutivo

| Aspecto | Calificación | Comentario |
|---------|--------------|------------|
| **Configuración Axios** | ⭐⭐⭐⭐☆ (4/5) | Interceptores bien implementados, falta retry logic |
| **Organización de APIs** | ⭐⭐⭐⭐⭐ (5/5) | Excelente separación por dominio |
| **Manejo de Errores** | ⭐⭐⭐⭐☆ (4/5) | Interceptor robusto, faltan tipos de error específicos |
| **Documentación** | ⭐⭐⭐⭐⭐ (5/5) | JSDoc completo y descriptivo |
| **Type Safety** | ⭐⭐☆☆☆ (2/5) | Sin TypeScript, sin validación en runtime |
| **Testing** | ⭐☆☆☆☆ (1/5) | Sin tests de API layer |
| **Seguridad** | ⭐⭐⭐☆☆ (3/5) | Token management mejorable |

**Puntuación General:** **3.4/5** ⭐⭐⭐☆☆

---

## ✅ FORTALEZAS DESTACADAS

### 1. **Excelente Organización por Dominio** 🎯

```javascript
// ✅ BUENA PRÁCTICA: APIs separadas por dominio
api/
  ├── api.js           // Configuración base
  ├── userApi.js       // Autenticación y usuarios
  ├── bookingApi.js    // Reservas
  ├── notificationApi.js
  ├── favoriteApi.js
  ├── nannyApi.js
  ├── profileApi.js
  └── reviewApi.js
```

**Ventajas:**
- Fácil de encontrar funciones específicas
- Mantenibilidad alta
- Separación de responsabilidades clara

---

### 2. **Interceptor de Respuesta Robusto** 🛡️

```javascript
// ✅ BUENA PRÁCTICA: Manejo centralizado de errores
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    
    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    
    // Standardize error format
    const errorResponse = {
      status: status || 0,
      message: error?.response?.data?.detail || 
               error?.response?.data?.message || 
               error?.message || 
               "An unexpected error occurred",
      data: error?.response?.data || null,
    };
    
    return Promise.reject(errorResponse);
  }
);
```

**Ventajas:**
- Logout automático en 401
- Formato de error consistente
- Logging en desarrollo

---

### 3. **Documentación JSDoc Completa** 📝

```javascript
// ✅ BUENA PRÁCTICA: JSDoc detallado
/**
 * Login de usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Tokens (access, refresh) y datos del usuario
 */
export const loginUser = async (username, password) => {
  const response = await API.post("/users/login/", { username, password });
  return response.data;
};
```

**Ventajas:**
- IntelliSense mejorado
- Documentación en código
- Fácil onboarding

---

### 4. **Funciones Claras y Concisas** 🎨

```javascript
// ✅ BUENA PRÁCTICA: Funciones simples, responsabilidad única
export const acceptBooking = async (bookingId) => {
  const response = await API.post(`/bookings/${bookingId}/accept/`);
  return response.data;
};

export const rejectBooking = async (bookingId) => {
  const response = await API.post(`/bookings/${bookingId}/reject/`);
  return response.data;
};
```

---

### 5. **Paginación Soportada** 📄

```javascript
// ✅ BUENA PRÁCTICA: Paginación como parámetro
export const getNotifications = async (page = 1, pageSize = 20) => {
  const response = await API.get("/notifications/", {
    params: { page, page_size: pageSize },
  });
  return response.data;
};
```

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **BaseURL Hardcodeada** 🔐
**Ubicación:** `api.js:4`  
**Severidad:** 🔴 CRÍTICO

```javascript
// ❌ PROBLEMA: URL de desarrollo hardcodeada
const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Impacto:** No funcionará en producción. Sin HTTPS en desarrollo.

**Solución:**
```javascript
// ✅ CORRECTO: Variables de entorno
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos
});
```

**Archivo `.env.development`:**
```bash
VITE_API_URL=http://localhost:8000/api
```

**Archivo `.env.production`:**
```bash
VITE_API_URL=https://api.homenannies.com/api
```

---

### 2. **Sin Refresh Token Logic** 🔄
**Ubicación:** `api.js` - Interceptor de respuesta  
**Severidad:** 🔴 CRÍTICO

```javascript
// ❌ PROBLEMA: No intenta refrescar token antes de logout
if (status === 401) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}
```

**Impacto:** Usuario pierde sesión innecesariamente si token expira.

**Solución:**
```javascript
// ✅ CORRECTO: Intentar refresh antes de logout
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    
    // Handle 401 - Try refresh token first
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        // No refresh token, logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/users/token/refresh/`,
          { refresh: refreshToken }
        );
        
        const { access } = response.data;
        localStorage.setItem("accessToken", access);
        
        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        processQueue(null, access);
        
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // ... resto del código de error handling
  }
);
```

---

### 3. **Código de Debug en Producción** 🐛
**Ubicación:** `api.js:17-22`  
**Severidad:** 🟠 ALTA

```javascript
// ❌ PROBLEMA: Console.log en producción
if (config.url.includes('/profile/') && (config.method === 'patch' || config.method === 'put')) {
  console.log("AXIOS INTERCEPTOR - Request config:", config);
  console.log("AXIOS INTERCEPTOR - Request data:", config.data);
  console.log("AXIOS INTERCEPTOR - Data stringified:", JSON.stringify(config.data));
}
```

**Impacto:** Logs innecesarios en producción, posible filtración de datos sensibles.

**Solución:**
```javascript
// ✅ CORRECTO: Solo en desarrollo
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug solo en desarrollo
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
    console.group(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log("Headers:", config.headers);
    console.log("Data:", config.data);
    console.groupEnd();
  }
  
  return config;
});
```

---

## 🟠 PROBLEMAS DE PRIORIDAD ALTA

### 1. **Sin Tests de API Layer** 🧪
**Ubicación:** Todos los archivos de API  
**Severidad:** 🟠 ALTA

```javascript
// ❌ PROBLEMA: 0% de cobertura de tests
```

**Solución:**
```javascript
// ✅ tests/api/userApi.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loginUser, getProfile } from '@/api/userApi';
import API from '@/api/api';

vi.mock('@/api/api');

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
          username: 'testuser',
          role: 'parent',
        },
      };
      
      API.post.mockResolvedValue(mockResponse);
      
      const result = await loginUser('testuser', 'password123');
      
      expect(API.post).toHaveBeenCalledWith('/users/login/', {
        username: 'testuser',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle login error', async () => {
      const mockError = {
        status: 401,
        message: 'Invalid credentials',
      };
      
      API.post.mockRejectedValue(mockError);
      
      await expect(loginUser('wrong', 'wrong')).rejects.toEqual(mockError);
    });
  });

  describe('getProfile', () => {
    it('should throw error when no token', async () => {
      localStorage.removeItem('accessToken');
      
      await expect(getProfile()).rejects.toThrow('Token de acceso no encontrado');
    });
    
    it('should fetch profile successfully', async () => {
      localStorage.setItem('accessToken', 'test-token');
      
      const mockResponse = {
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      };
      
      API.get.mockResolvedValue(mockResponse);
      
      const result = await getProfile();
      
      expect(API.get).toHaveBeenCalledWith('/users/me/');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
```

---

### 2. **Sin Retry Logic para Errores de Red** 🔄
**Ubicación:** `api.js` - Configuración  
**Severidad:** 🟠 ALTA

```javascript
// ❌ PROBLEMA: Falla inmediatamente en errores de red
```

**Solución:**
```javascript
// ✅ CORRECTO: Retry logic con axios-retry
import axiosRetry from 'axios-retry';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Configurar reintentos
axiosRetry(API, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Reintentar solo en errores de red o 5xx
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status >= 500 && error.response?.status < 600)
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    if (import.meta.env.DEV) {
      console.warn(`Retry attempt ${retryCount} for ${requestConfig.url}`);
    }
  },
});
```

**Instalación:**
```bash
npm install axios-retry
```

---

### 3. **Sin Validación de Respuestas** ✔️
**Ubicación:** Todas las funciones de API  
**Severidad:** 🟠 ALTA

```javascript
// ❌ PROBLEMA: Asumir que response.data siempre existe
export const getProfile = async () => {
  const response = await API.get("/users/me/");
  return response.data; // ¿Qué si response.data es undefined?
};
```

**Solución:**
```javascript
// ✅ CORRECTO: Validación con Zod
import { z } from 'zod';

const UserProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['parent', 'nanny']),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const getProfile = async () => {
  const response = await API.get("/users/me/");
  
  // Validar respuesta
  try {
    return UserProfileSchema.parse(response.data);
  } catch (error) {
    console.error('Invalid profile data:', error);
    throw new Error('Invalid server response format');
  }
};
```

**Instalación:**
```bash
npm install zod
```

---

### 4. **localStorage sin Manejo de Errores** 💾
**Ubicación:** `api.js:12`, `userApi.js:35`  
**Severidad:** 🟠 ALTA

```javascript
// ❌ PROBLEMA: Puede fallar en modo incógnito o storage lleno
const token = localStorage.getItem("accessToken");
```

**Solución:**
```javascript
// ✅ CORRECTO: Storage helper con manejo de errores
// utils/storage.js
export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing localStorage', error);
      return false;
    }
  },
};

// api.js
import { storage } from '@/utils/storage';

API.interceptors.request.use((config) => {
  const token = storage.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🟡 PROBLEMAS DE PRIORIDAD MEDIA

### 1. **Funciones Duplicadas** 📋
**Ubicación:** `bookingApi.js:82, 116`  
**Severidad:** 🟡 MEDIA

```javascript
// ❌ PROBLEMA: Funciones que hacen lo mismo
export const scheduleBooking = async (nannyId) => {
  const response = await API.post("/bookings/", { nanny: nannyId });
  return response.data;
};

export const getBookingsByNanny = async () => {
  const response = await API.get("/bookings/");
  return response.data;
};
```

**Solución:**
```javascript
// ✅ CORRECTO: Marcar como deprecated y referir a la función correcta
/**
 * @deprecated Usar createBooking() con parámetros completos
 */
export const scheduleBooking = createBooking;
```

---

### 2. **Sin Tipos de Error Específicos** 🏷️
**Ubicación:** `api.js` - Error handling  
**Severidad:** 🟡 MEDIA

```javascript
// ❌ PROBLEMA: Objeto de error genérico
const errorResponse = {
  status: status || 0,
  message: "...",
  data: error?.response?.data || null,
};
```

**Solución:**
```javascript
// ✅ CORRECTO: Clases de error específicas
// errors/ApiErrors.js
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', data = null) {
    super(message, 401, data);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', data = null) {
    super(message, 400, data);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error', data = null) {
    super(message, 0, data);
    this.name = 'NetworkError';
  }
}

// api.js
import { ApiError, AuthenticationError, NetworkError } from '@/errors/ApiErrors';

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.detail || error?.message;
    
    if (!error.response) {
      throw new NetworkError(message);
    }
    
    if (status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      throw new AuthenticationError(message, error.response.data);
    }
    
    if (status === 400) {
      throw new ValidationError(message, error.response.data);
    }
    
    throw new ApiError(message, status, error.response.data);
  }
);
```

---

### 3. **Sin Request Cancellation** ❌
**Ubicación:** Todas las funciones de API  
**Severidad:** 🟡 MEDIA

```javascript
// ❌ PROBLEMA: Requests no se pueden cancelar
export const getNotifications = async (page = 1, pageSize = 20) => {
  const response = await API.get("/notifications/", {
    params: { page, page_size: pageSize },
  });
  return response.data;
};
```

**Impacto:** Memory leaks si componente se desmonta antes de que termine request.

**Solución:**
```javascript
// ✅ CORRECTO: Soportar AbortController
export const getNotifications = async (page = 1, pageSize = 20, signal) => {
  const response = await API.get("/notifications/", {
    params: { page, page_size: pageSize },
    signal, // Axios soporta AbortController nativamente
  });
  return response.data;
};

// Uso en componente
useEffect(() => {
  const controller = new AbortController();
  
  getNotifications(1, 20, controller.signal)
    .then(setNotifications)
    .catch((error) => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });
  
  return () => controller.abort();
}, []);
```

---

### 4. **Sin Cache de Respuestas** 💾
**Ubicación:** Configuración general  
**Severidad:** 🟡 MEDIA

```javascript
// ❌ PROBLEMA: Cada request va al servidor, incluso para datos estáticos
```

**Solución:**
```javascript
// ✅ CORRECTO: Cache con axios-cache-interceptor
import { setupCache } from 'axios-cache-interceptor';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configurar cache
const cachedAPI = setupCache(API, {
  ttl: 5 * 60 * 1000, // 5 minutos por defecto
  interpretHeader: false,
  methods: ['get'], // Solo cachear GET
  cachePredicate: {
    statusCheck: (status) => status >= 200 && status < 300,
  },
});

export default cachedAPI;
```

---

## 🟢 PROBLEMAS DE PRIORIDAD BAJA

### 1. **Inconsistencia en Exportaciones** 📦
**Ubicación:** `notificationApi.js:77-87`  
**Severidad:** 🟢 BAJA

```javascript
// ⚠️ MEJORABLE: Mix de named exports e default export
export const getNotifications = async () => { };

export default {
  getNotifications,
  // ...
};
```

**Solución:**
```javascript
// ✅ CORRECTO: Solo named exports
export const getNotifications = async () => { };
export const markAsRead = async () => { };
// No default export
```

---

### 2. **Sin Request/Response Logging** 📝
**Ubicación:** Interceptores  
**Severidad:** 🟢 BAJA

```javascript
// ⚠️ MEJORABLE: Solo logs básicos en desarrollo
```

**Solución:**
```javascript
// ✅ CORRECTO: Logger estructurado
// utils/logger.js
const logger = {
  request: (config) => {
    if (import.meta.env.DEV) {
      console.group(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Timestamp:', new Date().toISOString());
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.groupEnd();
    }
  },
  
  response: (response) => {
    if (import.meta.env.DEV) {
      console.group(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      console.log('Duration:', performance.now() - response.config.metadata.startTime, 'ms');
      console.log('Data:', response.data);
      console.groupEnd();
    }
  },
  
  error: (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  },
};

API.interceptors.request.use((config) => {
  config.metadata = { startTime: performance.now() };
  logger.request(config);
  return config;
});

API.interceptors.response.use(
  (response) => {
    logger.response(response);
    return response;
  },
  (error) => {
    logger.error(error);
    return Promise.reject(error);
  }
);
```

---

## 💡 OPORTUNIDADES DE MEJORA

### 1. **React Query para State Management de Server** 🔄

```javascript
// ✅ MEJORA: Usar React Query en lugar de llamadas directas
// hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '@/api/notificationApi';

export const useNotifications = (page = 1) => {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationApi.getNotifications(page),
    staleTime: 1 * 60 * 1000, // 1 minuto
    cacheTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationApi.markNotificationsAsRead,
    onSuccess: () => {
      // Invalidar cache de notificaciones
      queryClient.invalidateQueries(['notifications']);
    },
  });
};
```

**Ventajas:**
- Cache automático
- Refetch en background
- Optimistic updates
- Loading/error states

---

### 2. **API Client Tipado con TypeScript** 📘

```typescript
// ✅ MEJORA: Migrar a TypeScript
// types/api.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'parent' | 'nanny';
  first_name?: string;
  last_name?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  username: string;
  role: string;
}

export interface ApiError {
  status: number;
  message: string;
  data: any;
}

// api/userApi.ts
export const loginUser = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await API.post<LoginResponse>("/users/login/", {
    username,
    password,
  });
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const token = storage.get("accessToken");
  
  if (!token) {
    throw new Error("Token de acceso no encontrado");
  }
  
  const response = await API.get<User>("/users/me/");
  return response.data;
};
```

---

### 3. **Implementar Rate Limiting Client-Side** ⏱️

```javascript
// ✅ MEJORA: Prevenir spam de requests
// utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  canMakeRequest(key) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter(5, 60000); // 5 requests por minuto

// api.js
API.interceptors.request.use((config) => {
  const key = `${config.method}-${config.url}`;
  
  if (!rateLimiter.canMakeRequest(key)) {
    return Promise.reject(new Error('Too many requests. Please try again later.'));
  }
  
  return config;
});
```

---

### 4. **Monitoring y Métricas** 📊

```javascript
// ✅ MEJORA: Tracking de performance de API
// utils/metrics.js
class ApiMetrics {
  constructor() {
    this.metrics = [];
  }
  
  recordRequest(config, duration, status) {
    this.metrics.push({
      url: config.url,
      method: config.method,
      duration,
      status,
      timestamp: Date.now(),
    });
    
    // Enviar a servicio de analytics (ej: Google Analytics, Sentry)
    if (window.gtag) {
      window.gtag('event', 'api_request', {
        event_category: 'API',
        event_label: `${config.method} ${config.url}`,
        value: duration,
      });
    }
  }
  
  getAverageResponseTime(url) {
    const urlMetrics = this.metrics.filter((m) => m.url === url);
    const total = urlMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / urlMetrics.length;
  }
}

const metrics = new ApiMetrics();

API.interceptors.response.use(
  (response) => {
    const duration = performance.now() - response.config.metadata.startTime;
    metrics.recordRequest(response.config, duration, response.status);
    return response;
  },
  (error) => {
    const duration = performance.now() - error.config.metadata.startTime;
    metrics.recordRequest(error.config, duration, error.response?.status || 0);
    return Promise.reject(error);
  }
);
```

---

## 🧪 PLAN DE TESTING

### Tests Esenciales

```javascript
// tests/api/api.test.js
describe('API Configuration', () => {
  it('should use correct base URL', () => {
    expect(API.defaults.baseURL).toBe(import.meta.env.VITE_API_URL);
  });
  
  it('should include auth token in requests', async () => {
    storage.set('accessToken', 'test-token');
    
    const config = await API.interceptors.request.handlers[0].fulfilled({
      headers: {},
    });
    
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });
  
  it('should handle 401 errors', async () => {
    const error = {
      response: { status: 401 },
      config: {},
    };
    
    await expect(
      API.interceptors.response.handlers[0].rejected(error)
    ).rejects.toThrow();
    
    expect(storage.get('accessToken')).toBeNull();
  });
});

// tests/api/bookingApi.test.js
describe('bookingApi', () => {
  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      const mockBooking = {
        id: 1,
        nanny: 5,
        start_time: '2025-01-15T10:00:00Z',
        end_time: '2025-01-15T14:00:00Z',
        status: 'pending',
      };
      
      API.post.mockResolvedValue({ data: mockBooking });
      
      const result = await createBooking(5, '2025-01-15T10:00:00Z', '2025-01-15T14:00:00Z');
      
      expect(result).toEqual(mockBooking);
      expect(API.post).toHaveBeenCalledWith('/bookings/', {
        nanny: 5,
        start_time: '2025-01-15T10:00:00Z',
        end_time: '2025-01-15T14:00:00Z',
      });
    });
  });
});
```

---

## 📈 MÉTRICAS DE CÓDIGO

| Métrica | Valor | Estado |
|---------|-------|--------|
| Archivos de API | 10 | ✅ Buena separación |
| Funciones totales | ~60 | ✅ Aceptable |
| Documentación JSDoc | 95% | ✅ Excelente |
| Tests | 0% | ❌ Crítico |
| TypeScript | 0% | ⚠️ Recomendado |
| Error handling | Parcial | ⚠️ Mejorable |

---

## 🎯 PRIORIZACIÓN DE ACCIONES

### Inmediato (Sprint Actual)
1. 🔐 **Mover baseURL a variables de entorno** (30 min)
2. 🔄 **Implementar refresh token logic** (2 horas)
3. 🐛 **Eliminar console.logs de producción** (15 min)
4. 💾 **Storage helper con manejo de errores** (1 hora)

### Corto Plazo (Próximo Sprint)
5. 🧪 **Tests de API layer** (6 horas)
6. 🔄 **Retry logic con axios-retry** (1 hora)
7. ✔️ **Validación de respuestas con Zod** (3 horas)
8. 🏷️ **Clases de error específicas** (2 horas)

### Mediano Plazo
9. ❌ **Request cancellation con AbortController** (2 horas)
10. 💾 **Cache con axios-cache-interceptor** (2 horas)
11. 📝 **Logger estructurado** (1 hora)

### Largo Plazo (Mejoras Continuas)
12. 🔄 **Migrar a React Query** (8 horas)
13. 📘 **Migrar a TypeScript** (16 horas)
14. ⏱️ **Rate limiting client-side** (2 horas)
15. 📊 **Monitoring y métricas** (4 horas)

---

## ✍️ CONCLUSIÓN

El **API Layer** está **bien estructurado** con excelente organización por dominio y documentación JSDoc completa. Los principales puntos de mejora son:

**Críticos:**
- ✅ Variables de entorno para baseURL
- ✅ Refresh token logic
- ✅ Eliminar debug logs

**Importantes:**
- ✅ Tests unitarios (0% cobertura)
- ✅ Retry logic
- ✅ Validación de respuestas

**Recomendado:**
- ✅ Migración a TypeScript
- ✅ React Query para server state
- ✅ Error handling mejorado

**Puntuación:** 3.4/5 - Bueno, con margen de mejora en seguridad y testing.

---

**Próxima iteración:** [02_CONFIG_ANALYSIS.md](./02_CONFIG_ANALYSIS.md) - Configuración de Vite, ESLint, Vitest
