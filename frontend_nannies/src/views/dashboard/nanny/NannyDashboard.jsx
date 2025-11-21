/**
 * NannyDashboard - Dashboard principal para niñeras
 * Disponibilidad, ingresos, bookings, reseñas
 */

import React, { useState } from 'react';
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
import { Plus, Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import {
  TabsComponent,
  useFetch,
  useToggle,
  DashboardSkeleton,
} from '@/components/common';

// Componentes del dashboard
import NannyHeader from './components/NannyHeader';
import StatsOverview from './components/StatsOverview';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import EarningsChart from './components/EarningsChart';
import BookingQueue from './components/BookingQueue';
import ReviewsPanel from './components/ReviewsPanel';

export const NannyDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAddAvailability, setShowAddAvailability] = useToggle(false);

  // Obtener token para auth
  const token = localStorage.getItem('token');

  // Obtener datos del dashboard
  const { data: dashboardData, loading, error } = useFetch('/api/dashboard/nanny', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }, [token]);

  // Demo data para desarrollo
  const demoData = {
    nanny: {
      name: 'María González',
      avatar: 'MG',
      memberSince: '2023-06-10',
      rating: 4.9,
      reviews: 127,
    },
    stats: {
      totalEarnings: 3650.00,
      activeBookings: 4,
      pendingRequests: 2,
      completedBookings: 45,
      averageRating: 4.9,
    },
    availability: [
      { day: 'Lunes', available: true, hours: '09:00 - 18:00', bookings: 2 },
      { day: 'Martes', available: true, hours: '09:00 - 18:00', bookings: 1 },
      { day: 'Miércoles', available: true, hours: '09:00 - 18:00', bookings: 3 },
      { day: 'Jueves', available: false, hours: 'No disponible', bookings: 0 },
      { day: 'Viernes', available: true, hours: '09:00 - 18:00', bookings: 2 },
      { day: 'Sábado', available: true, hours: '10:00 - 16:00', bookings: 1 },
      { day: 'Domingo', available: false, hours: 'No disponible', bookings: 0 },
    ],
    earnings: [
      { month: 'Enero', amount: 450, bookings: 6 },
      { month: 'Febrero', amount: 520, bookings: 7 },
      { month: 'Marzo', amount: 480, bookings: 6 },
      { month: 'Abril', amount: 610, bookings: 8 },
      { month: 'Mayo', amount: 580, bookings: 7 },
      { month: 'Junio', amount: 610, bookings: 8 },
    ],
    bookings: [
      {
        id: 1,
        parentName: 'Carlos Pérez',
        parentImage: null,
        kids: 2,
        date: '2024-11-25',
        time: '14:00 - 18:00',
        status: 'confirmed',
        rate: 20,
      },
      {
        id: 2,
        parentName: 'Ana Martínez',
        parentImage: null,
        kids: 1,
        date: '2024-11-26',
        time: '09:00 - 13:00',
        status: 'pending',
        rate: 18,
      },
      {
        id: 3,
        parentName: 'David García',
        parentImage: null,
        kids: 3,
        date: '2024-11-27',
        time: '16:00 - 20:00',
        status: 'confirmed',
        rate: 25,
      },
    ],
    reviews: [
      {
        id: 1,
        parentName: 'Sofia López',
        rating: 5,
        comment: 'Excelente cuidadora, mis hijos la adoran',
        date: '2024-11-20',
        verified: true,
      },
      {
        id: 2,
        parentName: 'Juan Rodríguez',
        rating: 5,
        comment: 'Profesional y responsable, muy recomendada',
        date: '2024-11-18',
        verified: true,
      },
      {
        id: 3,
        parentName: 'Rosa Martínez',
        rating: 4,
        comment: 'Muy buena, cumplida y atenta',
        date: '2024-11-15',
        verified: true,
      },
    ],
  };

  const data = dashboardData || demoData;

  if (loading) return <DashboardSkeleton />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <NannyHeader nanny={data.nanny} />

        {/* Alertas */}
        {data.stats?.pendingRequests > 0 && (
          <MuiAlert severity="warning" onClose={() => {}}>
            Tienes {data.stats.pendingRequests} solicitudes de booking pendientes de responder
          </MuiAlert>
        )}

        {error && (
          <MuiAlert severity="error" onClose={() => {}}>
            Error cargando datos del dashboard
          </MuiAlert>
        )}

        {/* Stats Cards */}
        <StatsOverview stats={data.stats} />

        {/* Tabs principales */}
        <TabsComponent
          tabs={[
            {
              label: 'Disponibilidad',
              icon: <Calendar size={20} />,
              content: (
                <AvailabilityCalendar
                  availability={data.availability}
                  onAddAvailability={setShowAddAvailability}
                  showAddForm={showAddAvailability}
                  onCancel={() => setShowAddAvailability(false)}
                />
              ),
            },
            {
              label: 'Ingresos',
              icon: <TrendingUp size={20} />,
              content: (
                <EarningsChart
                  earnings={data.earnings}
                  totalEarnings={data.stats?.totalEarnings}
                />
              ),
            },
            {
              label: 'Bookings',
              icon: <Calendar size={20} />,
              content: (
                <BookingQueue
                  bookings={data.bookings}
                  onAccept={(id) => console.log('Accept:', id)}
                  onReject={(id) => console.log('Reject:', id)}
                  onComplete={(id) => console.log('Complete:', id)}
                />
              ),
            },
            {
              label: 'Reseñas',
              icon: <MessageSquare size={20} />,
              content: <ReviewsPanel reviews={data.reviews} />,
            },
          ]}
          onChange={(idx) => setActiveTab(idx)}
          defaultTab={activeTab}
        />

        {/* Botón flotante para crear disponibilidad */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Plus size={20} />}
            onClick={setShowAddAvailability}
            sx={{
              backgroundColor: '#10B981',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            Agregar Disponibilidad
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default NannyDashboard;
