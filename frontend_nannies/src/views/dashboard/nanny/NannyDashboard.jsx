/**
 * NannyDashboard - Dashboard principal para niñeras
 * Disponibilidad, ingresos, bookings, reseñas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import { MainLayout, Loader, PageContainer } from '@components/layout';
import { AlertToast, useAlert } from '@components/common';
import API from '@api/api';

// Componentes del dashboard
import NannyHeader from './components/NannyHeader';
import StatsOverview from './components/StatsOverview';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import EarningsChart from './components/EarningsChart';
import BookingQueue from './components/BookingQueue';
import ReviewsPanel from './components/ReviewsPanel';

export const NannyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showAlert, alert, setAlert } = useAlert();

  const handleAddAvailability = () => {
    navigate('/availability/');
  };

  // Obtener disponibilidades
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await API.get('/bookings/availabilities/');
        setAvailabilities(response.data || []);
      } catch (err) {
        console.error('Error fetching availabilities:', err);
      }
    };
    
    fetchAvailabilities();
  }, []);

  // Obtener datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await API.get('/nannies/dashboard/');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        showAlert(err.response?.data?.error || 'Error cargando dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <MainLayout>
        <PageContainer>
          <Loader />
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AlertToast message={alert.message} type={alert.type} isVisible={alert.visible} onClose={() => setAlert({ ...alert, visible: false })} />
      <PageContainer>
        <div className="space-y-6">
          {/* Header */}
          <NannyHeader nanny={data.nanny} />

          {/* Alertas */}
          {data.stats?.pendingRequests > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Tienes {data.stats.pendingRequests} solicitudes de booking pendientes de responder
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bookings Activos</p>
                  <p className="text-3xl font-bold text-gray-800">{data.stats?.activeBookings || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">En progreso</p>
                </div>
                <Calendar className="text-blue-500" size={40} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-3xl font-bold text-gray-800">{data.stats?.completedBookings || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Total histórico</p>
                </div>
                <div className="text-orange-500">✓</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reseñas</p>
                  <p className="text-3xl font-bold text-gray-800">{data.stats?.totalReviews || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">De clientes</p>
                </div>
                <div className="text-red-500">★</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Calificación</p>
                  <p className="text-3xl font-bold text-gray-800">{data.stats?.avgRating || 0.0}/5</p>
                  <p className="text-xs text-gray-500 mt-1">Promedio</p>
                </div>
                <TrendingUp className="text-green-500" size={40} />
              </div>
            </div>
          </div>

          {/* Tabs principales */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { label: 'Disponibilidad', icon: Calendar },
                  { label: 'Ingresos', icon: TrendingUp },
                  { label: 'Bookings', icon: Calendar },
                  { label: 'Reseñas', icon: MessageSquare },
                ].map((tab, idx) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                        activeTab === idx
                          ? 'border-pink-500 text-pink-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 0 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Calendario de Disponibilidad</h3>
                    <button
                      onClick={handleAddAvailability}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <Plus size={18} />
                      Agregar Disponibilidad
                    </button>
                  </div>
                  
                  {availabilities.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 mb-4">No tienes horarios de disponibilidad configurados</p>
                      <button
                        onClick={handleAddAvailability}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Plus size={18} />
                        AGREGAR HORARIO
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-4">
                        Tienes {availabilities.length} horario{availabilities.length !== 1 ? 's' : ''} disponible{availabilities.length !== 1 ? 's' : ''} configurado{availabilities.length !== 1 ? 's' : ''}
                      </p>
                      <div className="grid gap-3">
                        {availabilities
                          .filter(slot => {
                            // Mostrar solo disponibilidades futuras
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const slotDate = new Date(slot.day);
                            slotDate.setHours(0, 0, 0, 0);
                            return slotDate >= today;
                          })
                          .slice(0, 5)
                          .map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {new Date(slot.day + 'T00:00:00').toLocaleDateString("es-ES", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  Disponible
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                      {availabilities.filter(slot => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const slotDate = new Date(slot.day);
                        slotDate.setHours(0, 0, 0, 0);
                        return slotDate >= today;
                      }).length > 5 && (
                        <button
                          onClick={handleAddAvailability}
                          className="w-full mt-3 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Ver todos los horarios →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 1 && (
                <div className="text-center py-8 text-gray-600">
                  <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
                  <p>Ingresos: ${data.earnings?.thisMonth || 0} este mes</p>
                </div>
              )}
              {activeTab === 2 && (
                <div className="text-center py-8 text-gray-600">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <p>No tienes bookings activos</p>
                </div>
              )}
              {activeTab === 3 && (
                <div className="text-center py-8 text-gray-600">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <p>No tienes reseñas aún</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón flotante para crear disponibilidad */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleAddAvailability}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Agregar Disponibilidad
            </button>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default NannyDashboard;
