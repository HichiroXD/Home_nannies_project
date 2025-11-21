/**
 * NannyDashboard - Dashboard principal para niñeras
 * Disponibilidad, ingresos, bookings, reseñas
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  useToggle,
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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener token para auth
  const token = localStorage.getItem('token');

  // Obtener datos del dashboard
  useEffect(() => {
    if (!token) {
      setError('No autenticado');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/nanny', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          setError('Error cargando datos');
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]); // Dependencia correcta

  // Demo data para desarrollo - SOLO SI NO EXISTEN DATOS REALES
  const emptyData = {
    nanny: {
      name: dashboardData?.nanny?.name || 'Perfil de Niñera',
      avatar: dashboardData?.nanny?.avatar || 'NN',
      memberSince: dashboardData?.nanny?.memberSince || new Date().toISOString(),
      rating: 0,
    },
    stats: {
      activeBookings: 0,
      completedBookings: 0,
      totalReviews: 0,
      avgRating: 0,
    },
    upcomingBookings: [],
    recentReviews: [],
    earnings: {
      thisMonth: 0,
      total: 0,
    },
  };

  const data = dashboardData || emptyData;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography>Cargando dashboard...</Typography>
        </Box>
      </Container>
    );
  }

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
