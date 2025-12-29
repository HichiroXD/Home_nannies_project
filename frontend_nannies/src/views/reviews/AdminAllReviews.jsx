/**
 * AdminAllReviews - Vista de administrador
 * Muestra TODAS las reseñas del sistema (de todos los padres a todas las niñeras)
 */

import React, { useState } from 'react';
import { MainLayout, PageHeader, Loader, AlertToast } from '@/components/layout';
import { useApiData } from '@/hooks';
import { Star, Calendar, MessageSquare, User, Users, TrendingUp, Award } from 'lucide-react';
import API from '@api/api';

export const AdminAllReviews = () => {
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, high, low

  // Cargar todas las reseñas con useApiData
  const { 
    data: reviews, 
    loading 
  } = useApiData(
    async () => await API.get('/reviews/admin/all/'),
    [],
    {
      onError: () => {
        setError('No se pudieron cargar las reseñas del sistema');
      },
    }
  );

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getFilteredReviews = () => {
    const allReviews = reviews || [];
    switch (filter) {
      case 'high':
        return allReviews.filter(r => r.rating >= 4);
      case 'low':
        return allReviews.filter(r => r.rating <= 2);
      default:
        return allReviews;
    }
  };

  const calculateStats = () => {
    const allReviews = reviews || [];
    if (allReviews.length === 0) {
      return { total: 0, average: 0, highRating: 0, lowRating: 0 };
    }

    const total = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);
    const highRating = allReviews.filter(r => r.rating >= 4).length;
    const lowRating = allReviews.filter(r => r.rating <= 2).length;

    return { total, average, highRating, lowRating };
  };

  const stats = calculateStats();
  const filteredReviews = getFilteredReviews();

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="Todas las Reseñas del Sistema"
          subtitle="Vista completa de todas las reseñas de padres a niñeras"
        />

        {error && (
          <AlertToast
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Reseñas</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <MessageSquare size={40} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Promedio General</p>
                <p className="text-3xl font-bold mt-1">{stats.average} ⭐</p>
              </div>
              <Award size={40} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Reseñas Positivas</p>
                <p className="text-3xl font-bold mt-1">{stats.highRating}</p>
                <p className="text-green-100 text-xs">4-5 estrellas</p>
              </div>
              <TrendingUp size={40} className="opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Reseñas Bajas</p>
                <p className="text-3xl font-bold mt-1">{stats.lowRating}</p>
                <p className="text-red-100 text-xs">1-2 estrellas</p>
              </div>
              <Users size={40} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'high'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Positivas ({stats.highRating})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'low'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bajas ({stats.lowRating})
          </button>
        </div>

        {/* Lista de Reseñas */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay reseñas en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  {/* Información del Padre */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-pink-100 rounded-full p-3">
                      <User size={24} className="text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {review.parent_data?.first_name || ''} {review.parent_data?.last_name || ''}
                      </p>
                      <p className="text-sm text-gray-500">@{review.parent_data?.username || 'Usuario'}</p>
                      <p className="text-xs text-gray-400 mt-1">Padre/Madre</p>
                    </div>
                  </div>

                  <div className="text-4xl text-gray-300 mx-4">→</div>

                  {/* Información de la Niñera */}
                  <div className="flex items-start gap-4 flex-1">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {review.nanny_data?.first_name || ''} {review.nanny_data?.last_name || ''}
                      </p>
                      <p className="text-sm text-gray-500">@{review.nanny_data?.username || 'Usuario'}</p>
                      <p className="text-xs text-gray-400 mt-1">Niñera</p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <User size={24} className="text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Rating y Fecha */}
                <div className="flex items-center gap-4 mb-3 border-t pt-4">
                  {renderStars(review.rating)}
                  <span className="text-xl font-bold text-gray-800">{review.rating}.0</span>
                  <div className="flex items-center text-sm text-gray-500 ml-auto">
                    <Calendar size={16} className="mr-1" />
                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Comentario */}
                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                )}

                {/* Badge de calidad */}
                <div className="mt-3">
                  {review.rating >= 4 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Reseña Positiva
                    </span>
                  ) : review.rating <= 2 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Requiere Atención
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Reseña Neutral
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminAllReviews;
