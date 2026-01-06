/**
 * ParentReviews - Vista de reseñas del padre
 * Muestra todas las reseñas que el padre ha dado a niñeras
 * Permite eliminar reseñas
 */

import React, { useState } from 'react';
import { MainLayout, PageHeader, Loader, AlertToast } from '@/components/layout';
import { useApiData } from '@/hooks';
import { Star, Trash2, Calendar, MessageSquare } from 'lucide-react';
import API from '@api/api';

export const ParentReviews = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Cargar reseñas con useApiData
  const { 
    data: reviews, 
    loading, 
    setData: setReviews,
    refetch: fetchReviews 
  } = useApiData(
    async () => await API.get('/reviews/'),
    [],
    {
      onError: () => {
        setError('No se pudieron cargar las reseñas');
      },
    }
  );

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) {
      return;
    }

    try {
      setDeleteLoading(reviewId);
      await API.delete(`/reviews/${reviewId}/`);
      setSuccessMessage('Reseña eliminada exitosamente');
      setReviews((reviews || []).filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Error al eliminar reseña:', err);
      setError('No se pudo eliminar la reseña');
    } finally {
      setDeleteLoading(null);
    }
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

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="Mis Reseñas"
          subtitle="Reseñas que has dado a niñeras"
        />

        {error && (
          <AlertToast
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {successMessage && (
          <AlertToast
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No has dejado reseñas aún
            </h3>
            <p className="text-gray-500 mb-6">
              Después de completar un servicio, podrás dejar una reseña a la niñera.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Información de la niñera */}
                    <div className="flex items-center gap-4 mb-4">
                      {review.nanny?.user?.profile_photo ? (
                        <img
                          src={review.nanny.user.profile_photo}
                          alt={review.nanny.user.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                          {review.nanny?.user?.first_name?.[0] || 'N'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {review.nanny?.user?.first_name} {review.nanny?.user?.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{review.nanny?.user?.username}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>

                    {/* Comentario */}
                    {review.comment && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Fecha */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={16} />
                      <span>
                        {new Date(review.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deleteLoading === review.id}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar reseña"
                  >
                    {deleteLoading === review.id ? (
                      <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        {reviews.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{reviews.length}</p>
                <p className="text-pink-100">Total de reseñas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </p>
                <p className="text-pink-100">Calificación promedio</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {new Set(reviews.map(r => r.nanny?.id)).size}
                </p>
                <p className="text-pink-100">Niñeras evaluadas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ParentReviews;
