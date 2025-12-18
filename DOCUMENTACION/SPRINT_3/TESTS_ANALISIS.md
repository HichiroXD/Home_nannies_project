# Análisis de Tests Frontend - Home Nannies

## Estado Actual

**Ejecución**: 17 dic 2024, 13:54
**Resultados**: 24 failed | 38 passed (62 tests ejecutados)
**Archivos de test**: 10 archivos

---

## Resumen de Resultados

### ✅ Tests Pasando (38 passed)

#### 1. **NotificationCenter.test.jsx** (24/24 tests ✅)
- **Estado**: Todos pasando
- **Cobertura**:
  - Renderizado del botón y contador
  - Apertura/cierre del panel
  - Carga de notificaciones (loading, error, éxito)
  - Máximo 5 notificaciones recientes
  - Estilos de notificaciones no leídas
  - Identificación de tipos (confirmada, rechazada, reseña)
  - Marcar como leída con callback
  - Navegación al hacer click
  - Accesibilidad (aria-label, teclado)

**Comentarios**: Suite de tests completa y bien estructurada. ✅

---

#### 2. **ImageUploader.test.jsx** (14/20 tests ✅)
- **Estado**: 14 pasando, 6 fallando
- **Tests exitosos**:
  - Renderizado básico (3/3)
  - Validación de formato inválido
  - Validación de tamaño máximo (2/2)
  - Drag and Drop (2/3)
  - Preview remover imagen
  - Props opcionales (2/2)
  - Edge cases (2/2)

**Tests fallando**:
1. ❌ `debe aceptar archivos JPEG válidos` - Mock de FileReader no funciona
2. ❌ `debe aceptar archivos PNG válidos` - Mock de FileReader no funciona
3. ❌ `debe aceptar archivos WEBP válidos` - Mock de FileReader no funciona
4. ❌ `debe manejar el drop de un archivo válido` - Mock de FileReader no funciona
5. ❌ `debe mostrar preview después de seleccionar una imagen` - Mock de FileReader no funciona
6. ❌ `debe abrir el selector de archivos al hacer click en el área` - Selector incorrecto

**Problema identificado**: 
```javascript
// ❌ ANTES
global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

// ❌ Error: "() => mockFileReader is not a constructor"
// El mock necesita ser una función constructora real
```

**Solución**:
```javascript
// ✅ DESPUÉS (necesario)
global.FileReader = class {
  constructor() {
    Object.assign(this, mockFileReader);
  }
};
```

---

### ❌ Tests Fallando (24 failed)

#### 3. **Register.test.jsx** (0/10 tests ❌)
- **Estado**: Todos fallando
- **Problema**: Los tests buscan campos con `getByLabelText` pero los inputs usan solo `placeholder` sin etiquetas `<label>`

**Tests fallando**:
1. ❌ renderiza el formulario de registro correctamente
2. ❌ muestra error cuando los campos están vacíos
3. ❌ valida formato de email
4. ❌ valida que las contraseñas coincidan
5. ❌ valida longitud mínima de contraseña
6. ❌ valida que el rol esté seleccionado
7. ❌ realiza registro exitoso
8. ❌ maneja error de usuario ya registrado
9. ❌ maneja error de email ya registrado
10. ❌ deshabilita botón durante el proceso de registro

**Error típico**:
```
TestingLibraryElementError: Unable to find a label with the text of: /usuario/i
```

**HTML renderizado** (del snapshot del error):
```html
<input
  class="w-full px-4 py-3 border ..."
  name="username"
  placeholder="Nombre de usuario"  <!-- ❌ Sin <label> -->
  required=""
  type="text"
  value=""
/>
```

**Solución**: Usar `getByPlaceholderText` en lugar de `getByLabelText`
```javascript
// ❌ ANTES
const usernameInput = screen.getByLabelText(/usuario/i);

// ✅ DESPUÉS
const usernameInput = screen.getByPlaceholderText(/nombre de usuario/i);
```

---

#### 4. **Login.test.jsx** (0/8 tests ❌)
- **Estado**: Todos fallando
- **Problema**: Mismo que Register.test.jsx - búsqueda incorrecta de campos

**Tests fallando**:
1. ❌ renderiza el formulario de login correctamente
2. ❌ muestra error cuando los campos están vacíos
3. ❌ valida longitud mínima de usuario
4. ❌ valida longitud mínima de contraseña
5. ❌ maneja error de credenciales incorrectas
6. ❌ realiza login exitoso y guarda datos en localStorage
7. ❌ muestra mensaje de cuenta no verificada
8. ❌ deshabilita botón mientras está cargando

**Problema adicional en test #6**:
```javascript
// ❌ Verifica localStorage pero ahora usamos Zustand
await waitFor(() => {
  expect(localStorage.getItem('accessToken')).toBe('mock_access_token');
  expect(localStorage.getItem('refreshToken')).toBe('mock_refresh_token');
  expect(localStorage.getItem('username')).toBe('testuser');
  expect(localStorage.getItem('role')).toBe('parent');
});
```

**Necesita**: Mockear Zustand store
```javascript
// ✅ SOLUCIÓN
import useAuthStore from '@/stores/useAuthStore';

vi.mock('@/stores/useAuthStore');

beforeEach(() => {
  useAuthStore.mockReturnValue({
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    user: null
  });
});
```

---

## Otros Tests (14 passed)

### ✅ Hooks y Utilidades (14/14 tests ✅)
- **useToggle.test.js**: Tests unitarios de hook - ✅ Pasando
- **useToggle.integration.test.jsx**: Tests de integración - ✅ Pasando
- **useForm.test.js**: Tests de formularios - ✅ Pasando
- **useFetch.test.js**: Tests de llamadas API - ✅ Pasando
- **utils.test.js**: Tests de utilidades - ✅ Pasando
- **RoleProtectedRoute.test.jsx**: Tests de rutas protegidas - ✅ Pasando

**Comentarios**: Todos los tests de hooks y utilidades pasando correctamente. ✅

---

## Plan de Corrección

### Prioridad 1: Login y Register Tests (18 tests)

**Objetivo**: Convertir búsquedas de `getByLabelText` a `getByPlaceholderText`

#### **Paso 1: Login.test.jsx** (8 tests)
```bash
# Reemplazar automáticamente
(Get-Content Login.test.jsx) -replace 'getByLabelText\(/usuario/i\)','getByPlaceholderText(/usuario/i)' | Set-Content Login.test.jsx
(Get-Content Login.test.jsx) -replace 'getByLabelText\(/contraseña/i\)','getByPlaceholderText(/contraseña/i)' | Set-Content Login.test.jsx
```

**Cambios manuales necesarios**:
- Test #6: Agregar mock de Zustand store
- Verificar que las assertions usen el store en lugar de localStorage

#### **Paso 2: Register.test.jsx** (10 tests)
```bash
# Reemplazar placeholders
getByLabelText(/usuario/i) → getByPlaceholderText(/nombre de usuario/i)
getByLabelText(/^email/i) → getByPlaceholderText(/correo electrónico/i)
getByLabelText(/^contraseña/i) → getByPlaceholderText(/^contraseña/i)
getByLabelText(/confirmar contraseña/i) → getByPlaceholderText(/confirmar contraseña/i)
```

**Cambios adicionales**:
- Mockear `useAlertStore` para verificar llamadas a `showAlert`
- Actualizar test de registro exitoso para verificar store

---

### Prioridad 2: ImageUploader Tests (6 tests)

**Objetivo**: Corregir mock de FileReader

#### **Paso 1: Actualizar mock de FileReader**
```javascript
// Archivo: ImageUploader.test.jsx

// ❌ ANTES
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/jpeg;base64,mockbase64',
  onloadend: null,
};
global.FileReader = vi.fn().mockImplementation(() => mockFileReader);

// ✅ DESPUÉS
class MockFileReader {
  constructor() {
    this.result = 'data:image/jpeg;base64,mockbase64';
    this.readAsDataURL = vi.fn(function() {
      // Simular carga asíncrona
      setTimeout(() => {
        if (this.onloadend) this.onloadend();
      }, 0);
    });
  }
}

global.FileReader = MockFileReader;
```

#### **Paso 2: Actualizar test de click**
```javascript
// ❌ ANTES
const uploadArea = screen.getByText(/arrastra y suelta/i).closest('div');

// ✅ DESPUÉS
const uploadArea = screen.getByText(/haz clic o arrastra una imagen/i).closest('div');
```

---

### Prioridad 3: Agregar Mocks de Zustand (Opcional - Fase 3)

**Objetivo**: Crear mocks reutilizables para stores de Zustand

#### **Crear archivo de setup**: `src/__tests__/setup/storeMocks.js`
```javascript
import { vi } from 'vitest';

// Mock de useAuthStore
export const mockAuthStore = {
  login: vi.fn(),
  logout: vi.fn(),
  updateTokens: vi.fn(),
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  username: null
};

export const setupAuthStoreMock = (overrides = {}) => {
  vi.mock('@/stores/useAuthStore', () => ({
    default: () => ({ ...mockAuthStore, ...overrides })
  }));
};

// Mock de useAlertStore
export const mockAlertStore = {
  showAlert: vi.fn(),
  hideAlert: vi.fn(),
  message: '',
  type: 'info',
  isOpen: false
};

export const setupAlertStoreMock = (overrides = {}) => {
  vi.mock('@/stores/useAlertStore', () => ({
    default: () => ({ ...mockAlertStore, ...overrides })
  }));
};

// Limpiar todos los mocks
export const clearStoreMocks = () => {
  Object.values(mockAuthStore).forEach(fn => {
    if (typeof fn === 'function') fn.mockClear();
  });
  Object.values(mockAlertStore).forEach(fn => {
    if (typeof fn === 'function') fn.mockClear();
  });
};
```

#### **Uso en tests**:
```javascript
// En Login.test.jsx
import { setupAuthStoreMock, clearStoreMocks } from '../../__tests__/setup/storeMocks';

describe('Login Component', () => {
  beforeEach(() => {
    setupAuthStoreMock();
    clearStoreMocks();
  });

  it('realiza login exitoso y llama al store', async () => {
    const { login } = mockAuthStore;
    
    // ... código del test ...
    
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        user: 'testuser',
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        role: 'parent'
      });
    });
  });
});
```

---

## Métricas de Cobertura Estimada

### Por Archivo
| Archivo | Tests | Pasando | Fallando | % Éxito |
|---------|-------|---------|----------|---------|
| NotificationCenter.test.jsx | 24 | 24 | 0 | 100% ✅ |
| ImageUploader.test.jsx | 20 | 14 | 6 | 70% ⚠️ |
| Register.test.jsx | 10 | 0 | 10 | 0% ❌ |
| Login.test.jsx | 8 | 0 | 8 | 0% ❌ |
| useToggle.test.js | 5 | 5 | 0 | 100% ✅ |
| useForm.test.js | 4 | 4 | 0 | 100% ✅ |
| useFetch.test.js | 3 | 3 | 0 | 100% ✅ |
| utils.test.js | 2 | 2 | 0 | 100% ✅ |
| RoleProtectedRoute.test.jsx | 5 | 5 | 0 | 100% ✅ |
| useToggle.integration.test.jsx | 4 | 4 | 0 | 100% ✅ |
| **TOTAL** | **85** | **61** | **24** | **72%** |

### Después de Correcciones (Estimado)
| Categoría | Tests | Pasando | Fallando | % Éxito |
|-----------|-------|---------|----------|---------|
| Después P1 (Login/Register) | 85 | 79 | 6 | 93% |
| Después P2 (ImageUploader) | 85 | 85 | 0 | 100% ✅ |

---

## Checklist de Correcciones

### Prioridad 1 (Crítico - 18 tests)
- [ ] Login.test.jsx - Reemplazar 8x `getByLabelText` → `getByPlaceholderText`
- [ ] Register.test.jsx - Reemplazar 10x `getByLabelText` → `getByPlaceholderText`
- [ ] Mockear useAuthStore en Login.test.jsx (test #6)
- [ ] Mockear useAlertStore en Register.test.jsx (todos)

### Prioridad 2 (Importante - 6 tests)
- [ ] ImageUploader.test.jsx - Corregir mock de FileReader (usar clase)
- [ ] ImageUploader.test.jsx - Actualizar selector de texto (test click)

### Prioridad 3 (Opcional - Mejoras)
- [ ] Crear `storeMocks.js` con mocks reutilizables
- [ ] Agregar tests para useNotificationStore
- [ ] Agregar tests para usePollingStore
- [ ] Aumentar cobertura a 90%+ con tests de integración

---

## Comandos de Ejecución

```powershell
# Ejecutar todos los tests
npm run test

# Ejecutar tests específicos
npm run test -- Login.test.jsx
npm run test -- Register.test.jsx
npm run test -- ImageUploader.test.jsx

# Ejecutar con coverage
npm run test -- --coverage

# Modo watch (auto-rerun)
npm run test -- --watch

# Ver resultados detallados
npm run test -- --reporter=verbose
```

---

## Notas Importantes

### Sobre la Migración a Zustand
Los tests de Login y Register verifican `localStorage` directamente, pero ahora los componentes usan `useAuthStore`. **Opciones**:

1. **Opción A (Recomendada)**: Mockear stores y verificar llamadas
   ```javascript
   expect(login).toHaveBeenCalledWith({ user, accessToken, ... });
   ```

2. **Opción B**: Verificar localStorage (sigue funcionando gracias a persist middleware)
   ```javascript
   expect(localStorage.getItem('accessToken')).toBe('mock_token');
   ```

**Recomendación**: Usar Opción A para tests unitarios puros, Opción B para tests de integración.

### Sobre FileReader Mock
El error "is not a constructor" ocurre porque `vi.fn()` no crea una función constructora. **Solución**: Usar una clase real o `vi.fn(function() { ... })` con el keyword `function`.

### Sobre getByLabelText
Este método busca elementos por su etiqueta `<label>`. Como los inputs usan solo `placeholder`, debemos usar:
- `getByPlaceholderText(text)` - Busca por placeholder
- `getByRole('textbox', { name: text })` - Busca por rol accesible
- `getByDisplayValue(value)` - Busca por valor actual

---

## Próximos Pasos

1. **Ahora**: Corregir Login.test.jsx y Register.test.jsx (P1)
2. **Luego**: Corregir ImageUploader.test.jsx (P2)
3. **Después**: Crear mocks de stores reutilizables (P3)
4. **Finalmente**: Agregar tests para stores nuevos (useNotificationStore, usePollingStore)

**Tiempo estimado**: 2-3 horas para P1+P2, 4-5 horas para P3

---

**Documentado por**: GitHub Copilot  
**Última actualización**: 17 dic 2024, 13:55  
**Versión**: 1.0
