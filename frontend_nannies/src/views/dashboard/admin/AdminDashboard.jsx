/**
 * AdminDashboard - Dashboard administrativo
 * Gestión de usuarios, reportes, métricas del sistema
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  Button,
  Card,
  CardContent,
  Typography,
  Alert as MuiAlert,
} from '@mui/material';
import { Plus, Users, TrendingUp, AlertCircle, BarChart3, Settings, MessageSquare } from 'lucide-react';
import {
  TabsComponent,
  useToggle,
} from '@/components/common';
import { MainLayout } from '@/components/layout';
import API from '@api/api';

// Componentes del dashboard
import AdminHeader from './components/AdminHeader';
import SystemMetrics from './components/SystemMetrics';
import UserManagement from './components/UserManagement';
import ReportsView from './components/ReportsView';
import OCRStatus from './components/OCRStatus';
import AcademicStatus from './components/AcademicStatus';
import ReviewsManagement from './components/ReviewsManagement';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAddUser, setShowAddUser] = useToggle(false);

  // Estados del dashboard
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener datos del dashboard
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await API.get('/dashboard/admin/');
        setDashboardData(response.data);
        console.log('✅ Datos reales del dashboard cargados:', response.data);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
        if (err.response?.status === 401) {
          setError('No tienes permisos de administrador o tu sesión expiró.');
        } else if (err.response?.status === 403) {
          setError('Acceso denegado. Solo administradores pueden ver este dashboard.');
        } else {
          setError('Error de conexión con el servidor. Mostrando datos de demostración.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  // Datos de demostración (se usan solo si no hay datos reales del API)
  const demoData = {
    admin: {
      name: 'Admin Sistema',
      avatar: 'AS',
      role: 'Superadmin',
    },
    metrics: {
      totalUsers: 342,
      activeUsers: 298,
      totalNannies: 85,
      totalParents: 257,
      totalBookings: 1204,
      successRate: 98.5,
    },
    users: [
      {
        id: 1,
        name: 'María González',
        email: 'maria@example.com',
        role: 'nanny',
        status: 'active',
        joinDate: '2024-01-15',
        bookings: 45,
      },
      {
        id: 2,
        name: 'Carlos Pérez',
        email: 'carlos@example.com',
        role: 'parent',
        status: 'active',
        joinDate: '2024-02-20',
        bookings: 12,
      },
      {
        id: 3,
        name: 'Ana Martínez',
        email: 'ana@example.com',
        role: 'nanny',
        status: 'inactive',
        joinDate: '2024-03-10',
        bookings: 8,
      },
      {
        id: 4,
        name: 'David García',
        email: 'david@example.com',
        role: 'parent',
        status: 'active',
        joinDate: '2024-04-05',
        bookings: 20,
      },
      {
        id: 5,
        name: 'Rosa López',
        email: 'rosa@example.com',
        role: 'nanny',
        status: 'active',
        joinDate: '2024-05-12',
        bookings: 32,
      },
    ],
    reports: [
      { month: 'Enero', bookings: 85, revenue: 4250000, users: 120 },
      { month: 'Febrero', bookings: 92, revenue: 4600000, users: 145 },
      { month: 'Marzo', bookings: 110, revenue: 5500000, users: 178 },
      { month: 'Abril', bookings: 138, revenue: 6900000, users: 210 },
      { month: 'Mayo', bookings: 156, revenue: 7800000, users: 250 },
      { month: 'Junio', bookings: 182, revenue: 9100000, users: 298 },
    ],
    ocrStatus: {
      total: 342,
      processed: 298,
      pending: 32,
      failed: 12,
      lastUpdate: '2024-11-20 10:30',
    },
    academicStatus: {
      total: 85,
      verified: 78,
      pending: 5,
      rejected: 2,
      lastUpdate: '2024-11-20 11:15',
    },
  };

  // Usar datos reales si están disponibles, si no usar datos demo
  const data = dashboardData || demoData;
  const isUsingRealData = !!dashboardData;

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h6" sx={{ textAlign: 'center', py: 10 }}>
            Cargando datos del dashboard...
          </Typography>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <AdminHeader admin={data.admin} />

        {/* Alertas */}
        {!isUsingRealData && (
          <MuiAlert severity="warning">
            Mostrando datos de demostración. Inicia sesión con credenciales de administrador para ver datos reales.
          </MuiAlert>
        )}
        
        {isUsingRealData && (
          <MuiAlert severity="success">
            ✓ Datos reales cargados correctamente desde la base de datos
          </MuiAlert>
        )}
        
        {error && (
          <MuiAlert severity="error" onClose={() => setError(null)}>
            {error}
          </MuiAlert>
        )}

        {data.ocrStatus?.failed > 0 && (
          <MuiAlert severity="warning" onClose={() => {}}>
            Hay {data.ocrStatus.failed} documentos OCR que fallaron en el procesamiento
          </MuiAlert>
        )}

        {data.academicStatus?.rejected > 0 && (
          <MuiAlert severity="info" onClose={() => {}}>
            {data.academicStatus.rejected} certificado(s) académico(s) rechazado(s)
          </MuiAlert>
        )}

        {/* System Metrics */}
        <SystemMetrics metrics={data.metrics} />

        {/* Tabs principales */}
        <TabsComponent
          tabs={[
            {
              label: 'Usuarios',
              icon: <Users size={20} />,
              content: (
                <UserManagement
                  users={data.users || []}
                  onAddUser={setShowAddUser}
                  showAddForm={showAddUser}
                  onCancel={() => setShowAddUser(false)}
                />
              ),
            },
            {
              label: 'Reseñas',
              icon: <MessageSquare size={20} />,
              content: <ReviewsManagement />,
            },
            {
              label: 'Reportes',
              icon: <BarChart3 size={20} />,
              content: <ReportsView reports={data.reports || []} />,
            },
            {
              label: 'OCR Status',
              icon: <Settings size={20} />,
              content: <OCRStatus status={data.ocrStatus} />,
            },
            {
              label: 'Academic Status',
              icon: <Settings size={20} />,
              content: <AcademicStatus status={data.academicStatus} />,
            },
          ]}
          onChange={(idx) => setActiveTab(idx)}
          defaultTab={activeTab}
        />

        {/* Botón flotante para agregar usuario */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Users size={20} />}
            onClick={setShowAddUser}
            sx={{
              backgroundColor: '#8B5CF6',
              '&:hover': {
                backgroundColor: '#7C3AED',
              },
            }}
          >
            Agregar Usuario
          </Button>
        </Box>
      </Stack>
    </Container>
    </MainLayout>
  );
};

export default AdminDashboard;
