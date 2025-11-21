/**
 * EJEMPLOS DE INTEGRACIÓN - Componentes Completos
 * Archivo de referencia con ejemplos reales de uso combinado
 */

// ============================================================================
// EJEMPLO 1: Dashboard Completo de Usuarios
// ============================================================================

import React, { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import {
  FormBuilder,
  DataTable,
  Modal,
  Alert,
  StatCard,
  TabsComponent,
  useFetch,
  useToggle,
  formatters,
} from '@/components/common';
import { Users, Edit, Trash2, Plus } from 'lucide-react';

export function UserManagementDashboard() {
  const [alert, setAlert] = useState(null);
  const [editModal, setEditModal] = useToggle(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users, loading, error } = useFetch('/api/users');

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModal();
  };

  const handleDelete = async (user) => {
    try {
      await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      setAlert({
        type: 'success',
        title: 'Éxito',
        message: 'Usuario eliminado correctamente',
      });
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el usuario',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <StatCard
            title="Total Usuarios"
            value={users?.length || 0}
            icon={Users}
            color="primary"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Gestión de Usuarios</h2>
          <Button variant="contained" startIcon={<Plus />}>
            Nuevo Usuario
          </Button>
        </Box>

        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nombre', searchable: true, sortable: true },
            { key: 'email', label: 'Email', searchable: true },
            { key: 'role', label: 'Rol' },
            { key: 'createdAt', label: 'Creado', render: (value) => formatters.date(value) },
          ]}
          data={users || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable
          selectable
        />

        <Modal
          open={editModal}
          title="Editar Usuario"
          onClose={setEditModal}
          onConfirm={() => {
            setEditModal();
            setAlert({
              type: 'success',
              title: 'Éxito',
              message: 'Usuario actualizado correctamente',
            });
          }}
        >
          <FormBuilder
            fields={[
              { name: 'name', label: 'Nombre', value: selectedUser?.name },
              { name: 'email', label: 'Email', type: 'email', value: selectedUser?.email },
              {
                name: 'role',
                label: 'Rol',
                type: 'select',
                value: selectedUser?.role,
                options: [
                  { value: 'user', label: 'Usuario' },
                  { value: 'admin', label: 'Administrador' },
                ],
              },
            ]}
          />
        </Modal>
      </Stack>
    </Box>
  );
}

// ============================================================================
// EJEMPLO 2: Formulario Avanzado con Validación
// ============================================================================

import { useForm, validators, useAsync } from '@/components/common';

export function RegistrationForm() {
  const submitHandler = async (values) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Registro fallido');

      alert('¡Registro exitoso!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const form = useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    submitHandler
  );

  return (
    <FormBuilder
      fields={[
        {
          name: 'name',
          label: 'Nombre Completo',
          type: 'text',
          required: true,
          value: form.values.name,
          onChange: form.handleChange,
          error: form.touched.name && form.errors.name,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          value: form.values.email,
          onChange: form.handleChange,
          error: form.touched.email && form.errors.email,
        },
        {
          name: 'password',
          label: 'Contraseña',
          type: 'password',
          required: true,
          helpText: 'Al menos 8 caracteres, mayúscula, minúscula y número',
          value: form.values.password,
          onChange: form.handleChange,
          error: form.touched.password && form.errors.password,
        },
        {
          name: 'confirmPassword',
          label: 'Confirmar Contraseña',
          type: 'password',
          required: true,
          value: form.values.confirmPassword,
          onChange: form.handleChange,
          error: form.touched.confirmPassword && form.errors.confirmPassword,
        },
        {
          name: 'terms',
          label: 'Acepto los términos y condiciones',
          type: 'checkbox',
          required: true,
          checked: form.values.terms,
          onChange: form.handleChange,
        },
      ]}
      onSubmit={form.handleSubmit}
      submitLabel="Registrarse"
      loading={form.isSubmitting}
    />
  );
}

// ============================================================================
// EJEMPLO 3: Dashboard con Tabs y Analytics
// ============================================================================

import { TabsComponent, StatCard, SkeletonLoader } from '@/components/common';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const chartData = [
  { month: 'Enero', bookings: 40, revenue: 2400 },
  { month: 'Febrero', bookings: 50, revenue: 2210 },
  { month: 'Marzo', bookings: 60, revenue: 2290 },
];

export function AnalyticsDashboard() {
  const { data: analytics, loading } = useFetch('/api/analytics');

  return (
    <TabsComponent
      tabs={[
        {
          label: 'Resumen',
          content: (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <StatCard title="Total Bookings" value="1,234" color="primary" />
              <StatCard title="Ingresos" value="$45,678" color="success" />
              <StatCard title="Usuarios" value="567" color="info" />
            </Box>
          ),
        },
        {
          label: 'Gráficos',
          content: loading ? (
            <SkeletonLoader variant="rectangular" height={300} />
          ) : (
            <Box sx={{ width: '100%', height: 300 }}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </Box>
          ),
        },
        {
          label: 'Detalles',
          content: <div>Información detallada aquí...</div>,
        },
      ]}
    />
  );
}

// ============================================================================
// EJEMPLO 4: Búsqueda Avanzada con Debounce
// ============================================================================

import { useDebounce, usePagination } from '@/components/common';

export function AdvancedSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: results = [], loading } = useFetch(
    debouncedSearch ? `/api/search?q=${debouncedSearch}` : null
  );

  const { currentPage, totalPages, currentItems, handlePageChange } = usePagination(results, 10);

  return (
    <Stack spacing={3}>
      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px', fontSize: '16px' }}
      />

      {loading && <SkeletonLoader count={3} />}

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Título', searchable: true },
          { key: 'description', label: 'Descripción' },
        ]}
        data={currentItems}
      />

      {results.length > 0 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Stack>
  );
}

// ============================================================================
// EJEMPLO 5: Formulario Multi-paso
// ============================================================================

import { AccordionComponent } from '@/components/common';

export function MultiStepForm() {
  const [step, setStep] = useState(0);

  return (
    <AccordionComponent
      items={[
        {
          title: 'Paso 1: Información Personal',
          content: (
            <FormBuilder
              fields={[
                { name: 'firstName', label: 'Nombre' },
                { name: 'lastName', label: 'Apellido' },
              ]}
            />
          ),
        },
        {
          title: 'Paso 2: Información de Contacto',
          content: (
            <FormBuilder
              fields={[
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Teléfono', type: 'tel' },
              ]}
            />
          ),
        },
        {
          title: 'Paso 3: Confirmación',
          content: <div>Revisar y confirmar información...</div>,
        },
      ]}
      defaultExpanded={step}
      onChange={(idx) => setStep(idx)}
    />
  );
}

// ============================================================================
// EJEMPLO 6: Usando LocalStorage con Componentes
// ============================================================================

import { useLocalStorage } from '@/components/common';

export function PreferencesPage() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'es');

  return (
    <FormBuilder
      fields={[
        {
          name: 'theme',
          label: 'Tema',
          type: 'select',
          value: theme,
          options: [
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Oscuro' },
            { value: 'auto', label: 'Automático' },
          ],
        },
        {
          name: 'language',
          label: 'Idioma',
          type: 'select',
          value: language,
          options: [
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'Français' },
          ],
        },
      ]}
      onSubmit={(values) => {
        setTheme(values.theme);
        setLanguage(values.language);
      }}
      submitLabel="Guardar Preferencias"
    />
  );
}

// ============================================================================
// EJEMPLO 7: Combinando Múltiples Hooks
// ============================================================================

export function ComplexPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [items, setItems] = useLocalStorage('items', []);

  const form = useForm(
    { title: '', description: '' },
    (values) => {
      setItems([...items, { id: Date.now(), ...values }]);
      form.reset();
    }
  );

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const { currentPage, totalPages, currentItems, handlePageChange } = usePagination(filtered, 5);

  return (
    <Stack spacing={3}>
      {/* Agregar item */}
      <FormBuilder {...form} fields={[]} />

      {/* Buscar */}
      <input
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Listar */}
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Título' },
          { key: 'description', label: 'Descripción' },
        ]}
        data={currentItems}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Stack>
  );
}

// ============================================================================
// EJEMPLO 8: Layout con Breadcrumbs y Tabs
// ============================================================================

import { BreadcrumbsComponent } from '@/components/common';

export function PageLayout() {
  return (
    <Box>
      <BreadcrumbsComponent
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Usuarios', href: '/users' },
          { label: 'Editar' },
        ]}
        showHome={true}
      />

      <TabsComponent
        tabs={[
          { label: 'General', content: <div>Información general</div> },
          { label: 'Avanzado', content: <div>Configuración avanzada</div> },
          { label: 'Historial', content: <div>Historial de cambios</div> },
        ]}
      />
    </Box>
  );
}

// ============================================================================
// EJEMPLO 9: Notificaciones y Alertas
// ============================================================================

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, title, message) => {
    const id = Date.now();
    setNotifications([...notifications, { id, type, title, message }]);
  };

  return (
    <Stack spacing={2}>
      <Button onClick={() => addNotification('success', 'Éxito', 'Operación completada')}>
        Agregar Notificación
      </Button>

      {notifications.map((notif) => (
        <Alert
          key={notif.id}
          type={notif.type}
          title={notif.title}
          message={notif.message}
          autoClose
          onClose={() => setNotifications(notifications.filter((n) => n.id !== notif.id))}
        />
      ))}
    </Stack>
  );
}

// ============================================================================
// EJEMPLO 10: Validación de Datos
// ============================================================================

import { validators, formatters } from '@/components/common';

export function ValidationExample() {
  const testData = {
    email: 'user@example.com',
    password: 'SecurePass123',
    phone: '123-456-7890',
    url: 'https://example.com',
  };

  return (
    <Stack spacing={2}>
      <h3>Validaciones</h3>
      <p>Email válido: {validators.email(testData.email) ? '✓' : '✗'}</p>
      <p>Contraseña fuerte: {validators.password(testData.password) ? '✓' : '✗'}</p>
      <p>Teléfono válido: {validators.phone(testData.phone) ? '✓' : '✗'}</p>

      <h3>Formatos</h3>
      <p>Moneda: {formatters.currency(1234.56)}</p>
      <p>Fecha: {formatters.date(new Date())}</p>
      <p>Bytes: {formatters.bytes(1024000)}</p>
    </Stack>
  );
}

export default {
  UserManagementDashboard,
  RegistrationForm,
  AnalyticsDashboard,
  AdvancedSearchPage,
  MultiStepForm,
  PreferencesPage,
  ComplexPage,
  PageLayout,
  NotificationCenter,
  ValidationExample,
};
