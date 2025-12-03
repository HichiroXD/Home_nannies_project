# 🎨 Guía de Componentes - Ejemplos de Integración

**Última Actualización:** 21 de noviembre de 2025  
**Componentes Documentados:** 11 principales + Hooks + Utilidades  
**Ejemplos Prácticos:** 10 casos de uso completos

---

## 📚 Tabla de Contenidos

1. [Componentes Principales](#componentes-principales)
2. [Custom Hooks](#custom-hooks)
3. [Ejemplos Prácticos](#ejemplos-prácticos)
4. [Best Practices](#best-practices)

---

## 🎨 Componentes Principales

### 1. AlertToast Component

**Ubicación:** `src/components/common/AlertToast.jsx`  
**Tamaño:** 156 LOC  
**Dependencias:** React, Material-UI Icons

#### Uso Básico
```jsx
import { AlertToast } from '@/components/common';
import { useState } from 'react';

export function MyComponent() {
  const [alert, setAlert] = useState(null);

  const handleSuccess = () => {
    setAlert({
      message: '¡Operación exitosa!',
      type: 'success',
      duration: 3000
    });
  };

  return (
    <>
      {alert && <AlertToast {...alert} onClose={() => setAlert(null)} />}
      <button onClick={handleSuccess}>Guardar</button>
    </>
  );
}
```

#### Props
```typescript
interface AlertToastProps {
  message: string;                    // Mensaje a mostrar
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible?: boolean;                // Control externo (opcional)
  onClose: () => void;                // Callback al cerrar
  duration?: number;                  // Auto-cierre en ms (0 = manual)
  position?: 'top-right' | 'top-center' | 'bottom-right';
}
```

#### Tipos Soportados
```jsx
<AlertToast type="success" message="¡Éxito!" />      // Verde ✓
<AlertToast type="error" message="Error!" />          // Rojo ✗
<AlertToast type="info" message="Información" />      // Azul ℹ
<AlertToast type="warning" message="Cuidado!" />      // Naranja ⚠
```

---

### 2. AvailabilitySelector Component

**Ubicación:** `src/components/bookings/AvailabilitySelector.jsx`  
**Tamaño:** 199 LOC  
**Dependencias:** react-calendar v5.1.0

#### Uso Básico
```jsx
import { AvailabilitySelector } from '@/components/bookings';

export function BookingForm() {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    console.log('Fecha seleccionada:', date);
  };

  return (
    <AvailabilitySelector 
      onSelectDate={handleDateSelect}
      maxDaysAhead={90}
      minDate={new Date()}
      unavailableDates={[
        new Date(2025, 11, 25),  // Christmas
        new Date(2025, 11, 31),  // New Year
      ]}
    />
  );
}
```

#### Props
```typescript
interface AvailabilitySelectorProps {
  onSelectDate: (date: Date) => void;           // Callback al seleccionar
  maxDaysAhead?: number;                        // Días adelante permitidos (default: 90)
  minDate?: Date;                               // Fecha mínima permitida
  unavailableDates?: Date[];                    // Fechas no disponibles
  highlightColor?: string;                      // Color de resaltado (default: '#4CAF50')
  gridColumns?: number;                         // Columnas en desktop (default: 2)
}
```

#### Features
```jsx
// Responsive automático
- Desktop: 2 columnas
- Tablet: 1.5 columnas
- Mobile: 1 columna

// Filtrado automático
- Fechas pasadas deshabilitadas
- Fechas especificadas como unavailable
- Fin de semana resaltado (opcional)

// Validación
- Solo permite fechas futuras
- Rango máximo configurable
- Manejo de fusos horarios
```

---

### 3. DataTable Component

**Ubicación:** `src/components/common/DataTable.jsx`  
**Tamaño:** 210 LOC  
**Dependencias:** Material-UI Table, Icons

#### Uso Básico
```jsx
import { DataTable } from '@/components/common';

export function UsersList() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Juan', email: 'juan@example.com', role: 'User' },
    { id: 2, name: 'María', email: 'maria@example.com', role: 'Admin' },
  ]);

  return (
    <DataTable
      columns={[
        { key: 'id', label: 'ID', width: '100px' },
        { key: 'name', label: 'Nombre', searchable: true, sortable: true },
        { key: 'email', label: 'Email', searchable: true },
        { key: 'role', label: 'Rol', sortable: true },
      ]}
      data={users}
      searchable={true}
      selectable={true}
      onEdit={(user) => console.log('Edit:', user)}
      onDelete={(user) => console.log('Delete:', user)}
      pagination={{
        rowsPerPage: 10,
        currentPage: 0,
      }}
    />
  );
}
```

#### Características
```
✓ Búsqueda en tiempo real
✓ Ordenamiento de columnas
✓ Paginación configurable
✓ Selección múltiple (checkboxes)
✓ Acciones (Edit, Delete)
✓ Renderizado personalizado de celdas
✓ Responsive automático
✓ Manejo de datos vacíos
```

---

### 4. Modal Component

**Ubicación:** `src/components/common/Modal.jsx`  
**Tamaño:** 100 LOC  

#### Uso Básico
```jsx
import { Modal } from '@/components/common';
import { useState } from 'react';

export function ModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir Modal</button>
      
      <Modal
        open={open}
        title="Confirmar acción"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          console.log('Confirmado');
          setOpen(false);
        }}
        confirmText="Sí"
        cancelText="Cancelar"
      >
        ¿Estás seguro de que deseas continuar?
      </Modal>
    </>
  );
}
```

---

### 5. FormBuilder Component

**Ubicación:** `src/components/common/FormBuilder.jsx`  
**Tamaño:** 178 LOC  

#### Uso Básico
```jsx
import { FormBuilder } from '@/components/common';

export function RegistrationForm() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const handleSubmit = async (formData) => {
    console.log('Submitted:', formData);
    // API call
  };

  return (
    <FormBuilder
      fields={[
        {
          name: 'name',
          label: 'Nombre Completo',
          type: 'text',
          required: true,
          value: values.name,
          onChange: (e) => setValues({ ...values, name: e.target.value }),
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          value: values.email,
        },
        {
          name: 'password',
          label: 'Contraseña',
          type: 'password',
          required: true,
          helpText: 'Al menos 8 caracteres',
        },
        {
          name: 'role',
          label: 'Rol',
          type: 'select',
          options: [
            { value: 'user', label: 'Usuario' },
            { value: 'admin', label: 'Administrador' },
          ],
        },
      ]}
      onSubmit={handleSubmit}
      submitLabel="Registrarse"
      loading={false}
    />
  );
}
```

---

## 🎣 Custom Hooks

### useAlert()

```jsx
import { useAlert } from '@/components/common';

export function MyComponent() {
  const { alert, showAlert, hideAlert } = useAlert();

  return (
    <>
      {alert && <AlertToast {...alert} onClose={hideAlert} />}
      <button onClick={() => showAlert('¡Éxito!', 'success')}>
        Mostrar Alerta
      </button>
    </>
  );
}
```

### useForm()

```jsx
import { useForm } from '@/components/common';

export function LoginForm() {
  const form = useForm(
    {
      email: '',
      password: '',
    },
    async (values) => {
      const response = await API.post('/login', values);
      return response;
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        error={form.errors.email}
      />
      <button type="submit" disabled={form.isSubmitting}>
        Login
      </button>
    </form>
  );
}
```

### useFetch()

```jsx
import { useFetch } from '@/components/common';

export function DataComponent() {
  const { data, loading, error } = useFetch('/api/users');

  if (loading) return <LoadingSkeleton />;
  if (error) return <Error message={error} />;

  return <DataTable data={data} />;
}
```

### useDebounce()

```jsx
import { useDebounce } from '@/components/common';

export function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: results } = useFetch(
    debouncedSearch ? `/api/search?q=${debouncedSearch}` : null
  );

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar..."
      />
      <Results data={results} />
    </div>
  );
}
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Dashboard Completo de Usuarios

```jsx
import { DataTable, StatCard, Modal, Alert } from '@/components/common';
import { useState } from 'react';

export function UserManagementDashboard() {
  const [alert, setAlert] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: users, loading, error } = useFetch('/api/users');

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModal(true);
  };

  const handleDelete = async (user) => {
    try {
      await API.delete(`/api/users/${user.id}`);
      setAlert({
        message: 'Usuario eliminado exitosamente',
        type: 'success',
      });
    } catch (error) {
      setAlert({
        message: 'Error al eliminar usuario',
        type: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Usuarios"
            value={users?.length || 0}
            color="primary"
          />
        </Grid>
      </Grid>

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Nombre', searchable: true },
          { key: 'email', label: 'Email', searchable: true },
          { key: 'role', label: 'Rol' },
        ]}
        data={users || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        open={editModal}
        title="Editar Usuario"
        onClose={() => setEditModal(false)}
      >
        {/* Form aquí */}
      </Modal>
    </Box>
  );
}
```

### Ejemplo 2: Búsqueda Avanzada con Debounce

```jsx
import { useFetch, useDebounce, DataTable } from '@/components/common';
import { useState } from 'react';

export function AdvancedSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: results = [], loading } = useFetch(
    debouncedSearch ? `/api/search?q=${debouncedSearch}` : null
  );

  return (
    <Box>
      <TextField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar usuarios, nanas, reservas..."
        fullWidth
        sx={{ mb: 2 }}
      />

      {loading && <LinearProgress />}

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Título' },
          { key: 'description', label: 'Descripción' },
        ]}
        data={results}
      />
    </Box>
  );
}
```

### Ejemplo 3: Formulario Multi-paso

```jsx
import { FormBuilder, Modal, Alert } from '@/components/common';
import { useState } from 'react';

export function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    personalInfo: {},
    academicInfo: {},
    documents: {},
  });

  const steps = [
    {
      title: 'Información Personal',
      fields: [
        { name: 'firstName', label: 'Nombre', required: true },
        { name: 'lastName', label: 'Apellido', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
      ],
    },
    {
      title: 'Información Académica',
      fields: [
        { name: 'program', label: 'Programa', type: 'select', required: true },
        { name: 'year', label: 'Año', type: 'number', required: true },
      ],
    },
    {
      title: 'Documentos',
      fields: [
        { name: 'document', label: 'Documento', type: 'file', required: true },
      ],
    },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      try {
        await API.post('/register', formData);
        setAlert({
          message: 'Registro completado exitosamente',
          type: 'success',
        });
      } catch (error) {
        setAlert({
          message: 'Error en el registro',
          type: 'error',
        });
      }
    }
  };

  return (
    <Box>
      {alert && <Alert {...alert} />}
      <Stepper activeStep={step}>
        {steps.map((s) => (
          <Step key={s.title}>
            <StepLabel>{s.title}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <FormBuilder
        fields={steps[step].fields}
        onSubmit={handleNext}
        submitLabel={step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
      />
    </Box>
  );
}
```

---

## ✅ Best Practices

### 1. Manejo de Estados
```jsx
// ✓ Correcto: Usar estados separados o useForm
const [formData, setFormData] = useState({ name: '', email: '' });
const form = useForm(initialValues, onSubmit);

// ✗ Incorrecto: Mezclar múltiples estados
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
```

### 2. Manejo de Alertas
```jsx
// ✓ Correcto: Usar AlertToast con timeout
<AlertToast
  message="Operación exitosa"
  type="success"
  duration={3000}
  onClose={() => setAlert(null)}
/>

// ✗ Incorrecto: Alertas del navegador
alert('Operación completada');
```

### 3. Búsqueda y Filtrado
```jsx
// ✓ Correcto: Usar useDebounce para API calls
const debouncedSearch = useDebounce(searchTerm, 300);
const { data } = useFetch(debouncedSearch ? `/api/search?q=${debouncedSearch}` : null);

// ✗ Incorrecto: Llamadas API en cada keystroke
onChange={(e) => fetchData(e.target.value)}
```

### 4. Validación de Formularios
```jsx
// ✓ Correcto: Validación en useForm + campos individuales
const form = useForm(values, onSubmit, validate);

// ✗ Incorrecto: Sin validación hasta submit
<button onClick={() => API.post(values)}>Enviar</button>
```

### 5. Carga de Datos
```jsx
// ✓ Correcto: Mostrar skeleton mientras carga
{loading ? <LoadingSkeleton /> : <DataTable data={data} />}

// ✗ Incorrecto: Sin feedback visual
<DataTable data={data} />
```

---

## 📖 Recursos Adicionales

- [Material-UI Components](https://mui.com/components/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Form Validation Patterns](./GUIA_DESARROLLO.md)
- [API Integration Guide](./MAPEO_ENDPOINTS_API.md)

---

**Última actualización:** 21 de noviembre de 2025  
**Autor:** GitHub Copilot  
**Versión:** 1.0
