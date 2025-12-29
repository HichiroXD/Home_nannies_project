/**
 * NannyReviews - Vista de reseñas de la niñera
 * Muestra todas las reseñas que la niñera ha recibido
 * Solo lectura (niñeras no pueden eliminar reseñas)
 */

import React, { useState, useEffect } from 'react';
import { MainLayout, PageHeader, Loader, AlertToast } from '@/components/layout';
import { useApiData } from '@/hooks';
import { Star, Calendar, MessageSquare, TrendingUp, Award } from 'lucide-react';
import API from '@api/api';

export const NannyReviews = () => {
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  // Cargar reseñas con useApiData
  const { 
    data: reviews, 
    loading 
  } = useApiData(
    async () => await API.get('/reviews/'),
    [],
    {
      onSuccess: (reviewsData) => {
        calculateStats(reviewsData);
      },
      onError: () => {
        setError('No se pudieron cargar las reseñas');
      },
    }
  );

  const calculateStats = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      setStats({ total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      return;
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviewsData.forEach((review) => {
      sum += review.rating;
      distribution[review.rating]++;
    });

    setStats({
      total: reviewsData.length,
      average: (sum / reviewsData.length).toFixed(1),
      distribution,
    });
  };

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

  const getPercentage = (count) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="Mis Reseñas Recibidas"
          subtitle="Lo que los padres opinan de tu servicio"
        />

        {error && (
          <AlertToast
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Estadísticas destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total de reseñas */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total de Reseñas</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare size={48} className="opacity-50" />
            </div>
          </div>

          {/* Calificación promedio */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Calificación Promedio</p>
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-bold">{stats.average}</p>
                  <Star size={24} className="fill-current" />
                </div>
              </div>
              <Award size={48} className="opacity-50" />
            </div>
          </div>

          {/* Tendencia */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">5 Estrellas</p>
                <p className="text-4xl font-bold">{getPercentage(stats.distribution[5])}%</p>
              </div>
              <TrendingUp size={48} className="opacity-50" />
            </div>
          </div>
        </div>

        {/* Distribución de calificaciones */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Distribución de Calificaciones
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-sm font-medium text-gray-700">{stars}</span>
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(stats.distribution[stars])}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-16 text-right">
                    {stats.distribution[stars]} ({getPercentage(stats.distribution[stars])}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de reseñas */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aún no tienes reseñas
            </h3>
            <p className="text-gray-500">
              Completa tus primeros servicios para recibir reseñas de los padres.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Todas las Reseñas ({reviews.length})
            </h3>
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Información del padre */}
                <div className="flex items-start gap-4 mb-4">
                  {review.parent_data?.profile_photo ? (
                    <img
                      src={review.parent_data.profile_photo}
                      alt={review.parent_data.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-bold">
                      {review.parent_data?.first_name?.[0] || review.parent_data?.username?.[0] || 'P'}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {review.parent_data?.first_name && review.parent_data?.last_name
                        ? `${review.parent_data.first_name} ${review.parent_data.last_name}`
                        : review.parent_data?.username || 'Usuario'}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        <Calendar size={14} className="inline mr-1" />
                        {new Date(review.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comentario */}
                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-pink-500">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NannyReviews;
