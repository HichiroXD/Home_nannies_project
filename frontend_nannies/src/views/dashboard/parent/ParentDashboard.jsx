/**
 * ParentDashboard - Dashboard principal para padres/guardias
 * Resumen de hijos, bookings activos, pagos y notificaciones
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MuiAlert from '@mui/material/Alert';
import { Plus, Calendar, CreditCard, Bell } from 'lucide-react';
import {
  TabsComponent,
  useToggle,
} from '@/components/common';
import { MainLayout } from '@/components/layout';
import { useApiData } from '@/hooks';
import API from '@api/api';
import logger from '@/utils/logger';

// Componentes del dashboard
import DashboardHeader from './components/DashboardHeader';
import StatsOverview from './components/StatsOverview';
import KidsManagement from './components/KidsManagement';
import BookingsPanel from './components/BookingsPanel';
import PaymentsPanel from './components/PaymentsPanel';
import ActivityFeed from './components/ActivityFeed';

/**
 * Dashboard principal para padres
 * Muestra: resumen, hijos, bookings activos, pagos, notificaciones
 */
export const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Usar useApiData para cargar datos del dashboard
  const {
    data: dashboardData,
    loading,
    error,
    refetch: refetchDashboard,
  } = useApiData(
    async () => {
      const response = await API.get('/parents/dashboard/');
      return response.data;
    },
    [], // sin dependencias - solo carga inicial
    {
      onSuccess: (data) => {
        logger.info('Dashboard data loaded', { stats: data?.stats });
      },
      onError: (err) => {
        logger.error('Error loading dashboard', { error: err });
      },
    }
  );

  // Estado de demostración si no hay datos reales
  const demoData = {
    user: {
      name: 'Juan García',
      avatar: 'JG',
      memberSince: '2024-01-15',
    },
    stats: {
      totalSpent: 2450.50,
      activeBookings: 3,
      upcomingBookings: 5,
      savedNannies: 8,
    },
    kids: [
      {
        id: 1,
        name: 'Sofia García',
        age: 5,
        image: null,
        interests: ['Lectura', 'Dibujo'],
      },
      {
        id: 2,
        name: 'Miguel García',
        age: 8,
        image: null,
        interests: ['Fútbol', 'Videojuegos'],
      },
    ],
    bookings: [
      {
        id: 1,
        nannyName: 'María López',
        nannyImage: null,
        date: '2024-11-25',
        startTime: '14:00',
        endTime: '18:00',
        kids: ['Sofia García'],
        status: 'confirmed',
        rating: 4.8,
      },
      {
        id: 2,
        nannyName: 'Carmen Rodríguez',
        nannyImage: null,
        date: '2024-11-26',
        startTime: '10:00',
        endTime: '13:00',
        kids: ['Miguel García'],
        status: 'pending',
        rating: null,
      },
    ],
    payments: [
      {
        id: 1,
        amount: 80.00,
        date: '2024-11-20',
        nannyName: 'María López',
        status: 'completed',
      },
      {
        id: 2,
        amount: 60.00,
        date: '2024-11-18',
        nannyName: 'Carmen Rodríguez',
        status: 'completed',
      },
      {
        id: 3,
        amount: 75.00,
        date: '2024-11-22',
        nannyName: 'Ana Martínez',
        status: 'pending',
      },
    ],
    activities: [
      {
        id: 1,
        type: 'booking_completed',
        description: 'Booking completado con María López',
        timestamp: '2024-11-20 18:30',
        icon: 'check',
      },
      {
        id: 2,
        type: 'rating_received',
        description: 'María López te ha deixado una reseña de 5 estrellas',
        timestamp: '2024-11-20 19:00',
        icon: 'star',
      },
      {
        id: 3,
        type: 'booking_requested',
        description: 'Nueva solicitud de booking para mañana',
        timestamp: '2024-11-22 10:30',
        icon: 'calendar',
      },
    ],
  };

  const data = dashboardData || demoData;

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography>Cargando dashboard...</Typography>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <DashboardHeader user={data.user} />

        {/* Alertas/Notificaciones importantes */}
        {data.stats?.upcomingBookings > 0 && (
          <MuiAlert severity="info">
            Tienes {data.stats.upcomingBookings} bookings próximos esta semana
          </MuiAlert>
        )}

        {error && (
          <MuiAlert severity="error">
            {error.response?.status === 401 
              ? 'Sesión expirada. Por favor inicia sesión nuevamente.'
              : error.response?.status === 404
              ? 'No se encontró tu perfil de padre. Por favor completa tu perfil.'
              : 'Error de conexión con el servidor. Por favor intenta de nuevo.'}
          </MuiAlert>
        )}

        {/* Stats Cards */}
        <StatsOverview stats={data.stats} />

        {/* Tabs principales */}
        <TabsComponent
          tabs={[
            {
              label: 'Mis Hijos',
              icon: <span>👨‍👩‍👧‍👦</span>,
              content: (
                <KidsManagement
                  kids={data.kids}
                />
              ),
            },
            {
              label: 'Bookings',
              icon: <Calendar size={20} />,
              content: (
                <BookingsPanel
                  bookings={data.bookings}
                  onCancelBooking={(id) => console.log('Cancel:', id)}
                  onReschedule={(id) => console.log('Reschedule:', id)}
                />
              ),
            },
            {
              label: 'Pagos',
              icon: <CreditCard size={20} />,
              content: (
                <PaymentsPanel
                  payments={data.payments}
                  totalSpent={data.stats?.totalSpent}
                />
              ),
            },
            {
              label: 'Actividad',
              icon: <Bell size={20} />,
              content: <ActivityFeed activities={data.activities} />,
            },
          ]}
          onChange={(idx) => setActiveTab(idx)}
          defaultTab={activeTab}
        />

        {/* Botón flotante para buscar niñera */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Plus size={20} />}
            onClick={() => window.location.href = '/catalog'}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Buscar Niñera
          </Button>
        </Box>
      </Stack>
    </Container>
    </MainLayout>
  );
};

export default ParentDashboard;
