# 🚀 Quick Start Guide - Componentes Comunes

Guía rápida para comenzar a usar los componentes reutilizables en tus dashboards.

## 📦 Instalación

Los componentes ya están disponibles en `src/components/common/`. No necesitas instalar nada adicional.

## 📥 Importación Básica

### Opción 1: Importar desde index (Recomendado)
```jsx
import { 
  FormBuilder, 
  DataTable, 
  Modal, 
  Alert,
  StatCard,
  useForm,
  formatters 
} from '@/components/common';
```

### Opción 2: Importar directamente del archivo
```jsx
import FormBuilder from '@/components/common/FormBuilder';
import { useForm } from '@/components/common/hooks';
```

---

## 🎯 Casos de Uso Comunes

### 1️⃣ Crear un Formulario

```jsx
import { FormBuilder, useForm } from '@/components/common';

function LoginForm() {
  const handleSubmit = (values) => {
    console.log('Form submitted:', values);
    // Enviar a API
  };

  return (
    <FormBuilder
      fields={[
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'tu@email.com'
        },
        {
          name: 'password',
          label: 'Contraseña',
          type: 'password',
          required: true
        },
        {
          name: 'remember',
          label: 'Recuérdame',
          type: 'checkbox'
        }
      ]}
      onSubmit={handleSubmit}
      submitLabel="Iniciar Sesión"
    />
  );
}
```

### 2️⃣ Mostrar una Tabla de Datos

```jsx
import { DataTable } from '@/components/common';

function UsersList() {
  const [users, setUsers] = React.useState([
    { id: 1, name: 'Juan', email: 'juan@example.com', role: 'admin' },
    { id: 2, name: 'María', email: 'maria@example.com', role: 'user' }
  ]);

  return (
    <DataTable
      columns={[
        { key: 'id', label: 'ID', width: 50 },
        { key: 'name', label: 'Nombre', searchable: true, sortable: true },
        { key: 'email', label: 'Email', searchable: true },
        { key: 'role', label: 'Rol' }
      ]}
      data={users}
      onEdit={(row) => console.log('Editar:', row)}
      onDelete={(row) => {
        setUsers(users.filter(u => u.id !== row.id));
      }}
      onView={(row) => console.log('Ver:', row)}
      searchable
      selectable
    />
  );
}
```

### 3️⃣ Mostrar Estadísticas

```jsx
import { StatCard } from '@/components/common';
import { Users, BookOpen, TrendingUp } from 'lucide-react';

function Dashboard() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
      <StatCard
        title="Total Usuarios"
        value="1,234"
        icon={Users}
        trend={{ value: 12, isPositive: true }}
        color="primary"
      />
      
      <StatCard
        title="Bookings Activos"
        value="56"
        icon={BookOpen}
        color="success"
      />
      
      <StatCard
        title="Ingresos"
        value="$4,567"
        icon={TrendingUp}
        progress={{ current: 45, max: 100 }}
        color="warning"
      />
    </Box>
  );
}
```

### 4️⃣ Crear un Modal

```jsx
import { Modal, Button } from '@/components/common';
import { useState } from 'react';

function DeleteConfirmation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Eliminar
      </Button>

      <Modal
        open={open}
        title="Confirmar eliminación"
        type="error"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          console.log('Eliminado');
          setOpen(false);
        }}
      >
        ¿Estás seguro de que deseas eliminar este elemento?
        Esta acción no puede deshacerse.
      </Modal>
    </>
  );
}
```

### 5️⃣ Usar useForm Hook

```jsx
import { useForm } from '@/components/common';

function ContactForm() {
  const form = useForm(
    { name: '', email: '', message: '' },
    async (values) => {
      try {
        // Enviar al servidor
        await fetch('/api/contact', {
          method: 'POST',
          body: JSON.stringify(values)
        });
        alert('Mensaje enviado');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="name"
        value={form.values.name}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder="Tu nombre"
      />
      {form.touched.name && form.errors.name && (
        <span>{form.errors.name}</span>
      )}

      <button type="submit" disabled={form.isSubmitting}>
        Enviar
      </button>
    </form>
  );
}
```

### 6️⃣ Usar useFetch Hook

```jsx
import { useFetch } from '@/components/common';
import { DashboardSkeleton } from '@/components/common';

function UserProfile() {
  const { data: user, loading, error } = useFetch('/api/user/profile');

  if (loading) return <DashboardSkeleton />;
  if (error) return <Alert type="error" message="Error cargando perfil" />;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 7️⃣ Usar formatters

```jsx
import { formatters } from '@/components/common';

function PriceDisplay() {
  const price = 1234.56;
  
  return (
    <>
      <p>Precio: {formatters.currency(price)}</p>
      <p>Descuento: {formatters.percentage(15)}</p>
      <p>Fecha: {formatters.date(new Date())}</p>
      <p>Tamaño archivo: {formatters.bytes(1024000)}</p>
    </>
  );
}
```

### 8️⃣ Usar validators

```jsx
import { validators } from '@/components/common';

function ValidationExample() {
  const email = 'test@example.com';
  const password = 'MyPassword123';
  
  console.log(validators.email(email));      // true
  console.log(validators.password(password)); // true
  console.log(validators.url('https://...'));  // true
}
```

### 9️⃣ Usar Tabs

```jsx
import { TabsComponent } from '@/components/common';

function SettingsPage() {
  return (
    <TabsComponent
      tabs={[
        {
          label: 'Perfil',
          content: <ProfileSettings />
        },
        {
          label: 'Seguridad',
          content: <SecuritySettings />
        },
        {
          label: 'Notificaciones',
          content: <NotificationSettings />
        }
      ]}
      onChange={(idx, tab) => console.log('Tab changed:', idx)}
    />
  );
}
```

### 🔟 Usar Accordion

```jsx
import { FAQAccordion } from '@/components/common';

function FAQPage() {
  const faqs = [
    {
      question: '¿Cómo creo una cuenta?',
      answer: 'Haz clic en Registrarse y completa el formulario...'
    },
    {
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a Configuración > Seguridad > Cambiar Contraseña...'
    }
  ];

  return <FAQAccordion faqs={faqs} />;
}
```

---

## 🎨 Componentes de Badges

```jsx
import { StatusBadge, RoleBadge, PriorityBadge, TagList } from '@/components/common';

function BadgesExample() {
  return (
    <>
      <StatusBadge status="active" />
      <RoleBadge role="admin" />
      <PriorityBadge priority="high" />
      <TagList 
        tags={['React', 'JavaScript', 'MUI']}
        onTagClick={(tag) => console.log(tag)}
        onTagRemove={(idx) => console.log(idx)}
      />
    </>
  );
}
```

---

## 🎯 Patrones Comunes

### Patrón: Buscar y Listar

```jsx
import { DataTable, useDebounce, useFetch } from '@/components/common';

function SearchUsers() {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const { data: users } = useFetch(
    `/api/users?search=${debouncedSearch}`
  );

  return (
    <>
      <input
        placeholder="Buscar usuarios..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <DataTable
        columns={[/* ... */]}
        data={users || []}
        searchable
      />
    </>
  );
}
```

### Patrón: Editar con Modal

```jsx
import { DataTable, Modal, FormBuilder } from '@/components/common';

function UserManagement() {
  const [users, setUsers] = React.useState([]);
  const [editingUser, setEditingUser] = React.useState(null);

  return (
    <>
      <DataTable
        data={users}
        onEdit={(row) => setEditingUser(row)}
        columns={[/* ... */]}
      />

      <Modal
        open={!!editingUser}
        title="Editar Usuario"
        onClose={() => setEditingUser(null)}
        onConfirm={() => {
          // Guardar cambios
          setEditingUser(null);
        }}
      >
        <FormBuilder
          fields={[
            { name: 'name', value: editingUser?.name },
            { name: 'email', value: editingUser?.email }
          ]}
        />
      </Modal>
    </>
  );
}
```

### Patrón: Paginación Manual

```jsx
import { usePagination } from '@/components/common';
import { PaginationComponent } from '@/components/common';

function PaginatedList() {
  const items = Array.from({ length: 100 }, (_, i) => i + 1);
  const { currentPage, totalPages, currentItems, handlePageChange } = 
    usePagination(items, 10);

  return (
    <>
      <ul>
        {currentItems.map(item => <li key={item}>{item}</li>)}
      </ul>
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
```

---

## 📚 Documentación Completa

Para documentación detallada de cada componente, ver:
- `src/components/common/README.md` - Documentación completa
- Archivos individuales - Comentarios inline

---

## 💡 Tips y Trucos

1. **Siempre usa el index.js para imports:**
   ```jsx
   import { Button, Modal } from '@/components/common'; // ✅ Correcto
   import Button from '@/components/common/Button.jsx'; // ❌ Incorrecto
   ```

2. **Aprovecha los hooks personalizados:**
   - `useForm` - Evita boilerplate de formularios
   - `useAsync` - Simplifica llamadas async
   - `useDebounce` - Mejora performance en búsqueda

3. **Usa las utilidades para formateo:**
   - Nunca formatees monedas manualmente: `formatters.currency()`
   - Las validaciones están centralizadas: `validators.email()`

4. **Los componentes son totalmente tipados (ready para TypeScript)**

5. **Todos los componentes son responsive por defecto**

---

## 🆘 Solución de Problemas

### "Componente no se importa"
- Verifica que estés usando la ruta correcta: `@/components/common`
- Asegúrate de que está en el `index.js` del directorio

### "Hook se ejecuta múltiples veces"
- Revisa las dependencias del `useEffect`
- Usa `useCallback` para funciones que se pasan como props

### "Material UI no aplica estilos"
- Verifica que `@mui/material` esté instalado
- Recarga el servidor de desarrollo

---

## 🚀 Siguientes Pasos

1. **Usar estos componentes en los dashboards** (Tasks 2-4)
2. **Crear tema global de Material UI** (Task 5)
3. **Implementar Zustand para state management** (Task 6)
4. **Hacer responsive todos los dashboards** (Task 7)
5. **Optimizar performance** (Task 8)

---

**Creado:** Phase 4 Task 1
**Última actualización:** 2024
**Estado:** Production Ready ✅
