# Componentes Comunes - Documentación Completa

Este directorio contiene todos los componentes reutilizables y hooks personalizados para la aplicación.

## 📦 Componentes Principales

### 1. FormBuilder
**Ubicación:** `FormBuilder.jsx`
**Descripción:** Componente dinámico para generación de formularios con validación automática.

```jsx
import { FormBuilder } from '@/components/common';

<FormBuilder
  fields={[
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
    { name: 'role', label: 'Rol', type: 'select', options: [
      { value: 'user', label: 'Usuario' },
      { value: 'admin', label: 'Administrador' }
    ]}
  ]}
  onSubmit={(data) => console.log(data)}
  submitLabel="Enviar"
/>
```

**Props:**
- `fields[]` - Array de campos del formulario
- `onSubmit` - Callback al enviar
- `submitLabel` - Texto del botón enviar
- `loading` - Estado de carga

---

### 2. DataTable
**Ubicación:** `DataTable.jsx`
**Descripción:** Tabla de datos avanzada con búsqueda, paginación, ordenamiento y selección.

```jsx
import { DataTable } from '@/components/common';

<DataTable
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', searchable: true },
    { key: 'email', label: 'Email' }
  ]}
  data={usuarios}
  onEdit={(row) => console.log('Edit', row)}
  onDelete={(row) => console.log('Delete', row)}
  searchable
  selectable
/>
```

**Props:**
- `columns[]` - Definición de columnas
- `data[]` - Datos a mostrar
- `onEdit` - Callback de edición
- `onDelete` - Callback de eliminación
- `searchable` - Habilitar búsqueda
- `selectable` - Habilitar selección de filas

---

### 3. Modal
**Ubicación:** `Modal.jsx`
**Descripción:** Diálogo modal personalizable con múltiples tipos y acciones.

```jsx
import { Modal } from '@/components/common';

<Modal
  open={isOpen}
  title="Confirmar acción"
  onClose={() => setIsOpen(false)}
  onConfirm={() => handleConfirm()}
  type="warning"
  size="small"
>
  ¿Estás seguro de que deseas continuar?
</Modal>
```

**Props:**
- `open` - Controlar visibilidad
- `title` - Título del modal
- `onClose` - Callback al cerrar
- `onConfirm` - Callback de confirmación
- `type` - Tipo: 'default', 'success', 'error', 'warning'
- `size` - Tamaño: 'small', 'medium', 'large'

---

### 4. Alert
**Ubicación:** `Alert.jsx`
**Descripción:** Componente de alerta con cierre automático y tipos variados.

```jsx
import { Alert } from '@/components/common';

<Alert
  type="success"
  title="Éxito"
  message="La operación se completó correctamente"
  autoClose={true}
  autoCloseDuration={5000}
/>
```

**Props:**
- `type` - Tipo: 'success', 'error', 'warning', 'info'
- `title` - Título de la alerta
- `message` - Mensaje principal
- `autoClose` - Cerrar automáticamente
- `autoCloseDuration` - Duración en ms

---

### 5. StatCard
**Ubicación:** `StatCard.jsx`
**Descripción:** Tarjeta de estadísticas para dashboards.

```jsx
import { StatCard } from '@/components/common';
import { Users } from 'lucide-react';

<StatCard
  title="Total Usuarios"
  value="1,234"
  icon={Users}
  trend={{ value: 12, isPositive: true }}
  color="primary"
/>
```

**Props:**
- `title` - Título de la estadística
- `value` - Valor a mostrar
- `icon` - Icono de lucide-react
- `trend` - Objeto con tendencia: `{ value, isPositive }`
- `progress` - Objeto de progreso: `{ current, max }`
- `color` - Color: 'primary', 'success', 'error', 'warning', 'info'

---

## 🔄 Componentes de Loading

### SkeletonLoader
Esqueleto simple para texto o rectángulos.

```jsx
import { SkeletonLoader } from '@/components/common';

<SkeletonLoader variant="text" count={3} />
```

### TableSkeleton
Esqueleto de tabla.

```jsx
<TableSkeleton rows={5} columns={6} />
```

### CardSkeleton
Esqueleto de tarjetas.

```jsx
<CardSkeleton count={3} />
```

### DashboardSkeleton
Esqueleto completo de dashboard.

```jsx
<DashboardSkeleton />
```

### LoadingOverlay
Overlay de carga en pantalla completa.

```jsx
<LoadingOverlay loading={isLoading} />
```

---

## 🧭 Componentes de Navegación

### BreadcrumbsComponent
Migas de pan de navegación.

```jsx
import { BreadcrumbsComponent } from '@/components/common';

<BreadcrumbsComponent
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Usuarios', href: '/users' },
    { label: 'Detalle' }
  ]}
  showHome={true}
/>
```

---

## 📑 Componentes de Tabs

### TabsComponent
Pestañas estándar.

```jsx
import { TabsComponent } from '@/components/common';

<TabsComponent
  tabs={[
    { label: 'General', content: <div>Contenido general</div> },
    { label: 'Avanzado', content: <div>Contenido avanzado</div> }
  ]}
  onChange={(idx, tab) => console.log(idx, tab)}
/>
```

### VerticalTabs
Pestañas verticales.

```jsx
<VerticalTabs tabs={tabs} />
```

### CardTabs
Pestañas estilo tarjetas.

```jsx
<CardTabs tabs={tabs} />
```

---

## 📋 Componentes de Acordeón

### AccordionComponent
Acordeón estándar.

```jsx
import { AccordionComponent } from '@/components/common';

<AccordionComponent
  items={[
    { title: 'Sección 1', content: 'Contenido 1' },
    { title: 'Sección 2', content: 'Contenido 2' }
  ]}
  allowMultiple={false}
/>
```

### FAQAccordion
Acordeón específico para FAQs.

```jsx
import { FAQAccordion } from '@/components/common';

<FAQAccordion
  faqs={[
    { question: '¿Qué es esto?', answer: 'Es un FAQ' }
  ]}
/>
```

---

## 📄 Componentes de Paginación

### PaginationComponent
Paginación estándar.

```jsx
import { PaginationComponent } from '@/components/common';

<PaginationComponent
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => console.log(page)}
/>
```

### AdvancedPagination
Paginación avanzada con selector de items.

```jsx
<AdvancedPagination
  currentPage={1}
  totalPages={10}
  totalItems={100}
  itemsPerPage={10}
  onPageChange={(page) => {}}
  onItemsPerPageChange={(count) => {}}
/>
```

---

## 🎣 Custom Hooks

### useForm
Manejo completo de formularios.

```jsx
import { useForm } from '@/components/common';

const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  (values) => console.log(values)
);
```

### useAsync
Manejo de operaciones asincrónicas.

```jsx
import { useAsync } from '@/components/common';

const { status, data, error, execute } = useAsync(async () => {
  return await fetchUsers();
});
```

### usePagination
Lógica de paginación.

```jsx
import { usePagination } from '@/components/common';

const { currentPage, totalPages, currentItems, handlePageChange } = 
  usePagination(items, 10);
```

### useLocalStorage
Persistencia en localStorage.

```jsx
import { useLocalStorage } from '@/components/common';

const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### useFetch
Obtener datos de APIs.

```jsx
import { useFetch } from '@/components/common';

const { data, loading, error } = useFetch('https://api.example.com/users');
```

### useDebounce
Debouncing de valores.

```jsx
import { useDebounce } from '@/components/common';

const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

### useToggle
Toggle de valores booleanos.

```jsx
import { useToggle } from '@/components/common';

const [isOpen, toggle] = useToggle(false);
```

---

## 🛠️ Utilidades

### validators
Funciones de validación.

```jsx
import { validators } from '@/components/common';

validators.email('test@example.com'); // true/false
validators.password('Secure123'); // true/false
validators.phone('123-456-7890'); // true/false
```

### formatters
Funciones de formateo.

```jsx
import { formatters } from '@/components/common';

formatters.currency(1000); // "$1,000.00"
formatters.date(new Date()); // "15/3/2024"
formatters.bytes(1024); // "1 KB"
formatters.capitalize('hello'); // "Hello"
```

### storage
Helpers de localStorage.

```jsx
import { storage } from '@/components/common';

storage.set('user', { name: 'John' });
storage.get('user');
storage.remove('user');
```

### arrayHelpers
Utilidades para arrays.

```jsx
import { arrayHelpers } from '@/components/common';

arrayHelpers.unique([1, 2, 2, 3]); // [1, 2, 3]
arrayHelpers.chunk([1,2,3,4,5], 2); // [[1,2], [3,4], [5]]
arrayHelpers.groupBy(users, 'role');
```

### objectHelpers
Utilidades para objetos.

```jsx
import { objectHelpers } from '@/components/common';

objectHelpers.pick(user, ['name', 'email']);
objectHelpers.omit(user, ['password']);
objectHelpers.merge(obj1, obj2);
```

---

## 📊 Estadísticas de Componentes

**Total de componentes:** 9
**Total de hooks:** 10
**Total de utilidades:** 40+
**Líneas de código totales:** 1,750+ LOC

## ✅ Lista de Componentes Completados

- ✅ FormBuilder (155 LOC)
- ✅ DataTable (210 LOC)
- ✅ Modal (100 LOC)
- ✅ Alert (70 LOC)
- ✅ StatCard (180 LOC)
- ✅ LoadingSkeleton (185 LOC)
- ✅ Breadcrumbs (140 LOC)
- ✅ Tabs (200 LOC)
- ✅ Accordion (195 LOC)
- ✅ Pagination (185 LOC)
- ✅ Custom Hooks (365 LOC)
- ✅ Utils (400 LOC)
- ✅ Index/Exports (40 LOC)

## 🚀 Próximos Pasos

1. **Material UI Theme** - Crear tema global consistente
2. **Auth Context** - Contexto de autenticación
3. **API Client** - Cliente HTTP centralizado con axios
4. **Zustand Stores** - State management global
5. **Dashboards** - Dashboards para usuarios, nannies y admin
6. **Responsive Design** - Mobile-first layouts
7. **Performance** - Code splitting y optimizaciones
