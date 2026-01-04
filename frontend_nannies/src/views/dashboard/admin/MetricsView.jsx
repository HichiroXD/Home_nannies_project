import { useState, useEffect } from 'react';
import metricsApi from '@api/metricsApi';
import MetricCard from '@components/metrics/MetricCard';
import LoadingFallback from '@components/common/LoadingFallback';
import styles from './MetricsView.module.css';

/**
 * Vista de métricas del sistema para administradores.
 * Muestra KPIs principales y estadísticas del sistema.
 */
const MetricsView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [bookingMetrics, setBookingMetrics] = useState(null);
  const [revenueMetrics, setRevenueMetrics] = useState(null);
  const [topNannies, setTopNannies] = useState([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewData, bookingsData, revenueData, nanniesData] = await Promise.all([
        metricsApi.getOverview(),
        metricsApi.getBookingMetrics(period),
        metricsApi.getRevenueMetrics(period),
        metricsApi.getTopNannies(5)
      ]);

      setOverview(overviewData);
      setBookingMetrics(bookingsData);
      setRevenueMetrics(revenueData);
      setTopNannies(nanniesData.top_nannies || []);
    } catch (err) {
      console.error('Error cargando métricas:', err);
      setError('Error al cargar las métricas del sistema');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !overview) {
    return <LoadingFallback message="Cargando métricas..." />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={loadMetrics} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Métricas del Sistema</h1>
        <div className={styles.periodSelector}>
          <label>Período:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className={styles.select}
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resumen General</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Total Usuarios"
            value={overview?.users?.total || 0}
            icon="👥"
            trend={overview?.users?.growth_rate}
            trendLabel="crecimiento"
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Niñeras"
            value={overview?.users?.nannies || 0}
            icon="👨‍👩‍👧"
            color="purple"
            loading={loading}
          />
          <MetricCard
            title="Padres"
            value={overview?.users?.parents || 0}
            icon="👨‍👩‍👦"
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Niñeras Verificadas"
            value={overview?.users?.verified_nannies || 0}
            icon="✅"
            color="orange"
            loading={loading}
          />
        </div>
      </section>

      {/* Booking Metrics */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reservas</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Total Reservas"
            value={overview?.bookings?.total || 0}
            icon="📅"
            trend={overview?.bookings?.growth_rate}
            trendLabel="crecimiento"
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Completadas"
            value={overview?.bookings?.completed || 0}
            icon="✓"
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Pendientes"
            value={overview?.bookings?.pending || 0}
            icon="⏳"
            color="orange"
            loading={loading}
          />
          <MetricCard
            title="Tasa de Completado"
            value={overview?.bookings?.completion_rate || 0}
            icon="📈"
            suffix="%"
            color="purple"
            loading={loading}
          />
        </div>
      </section>

      {/* Revenue Metrics */}
      {revenueMetrics && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ingresos (últimos {period} días)</h2>
          <div className={styles.metricsGrid}>
            <MetricCard
              title="Ingresos Totales"
              value={revenueMetrics.total_revenue}
              icon="💰"
              prefix="$"
              color="green"
              loading={loading}
            />
            <MetricCard
              title="Comisión Plataforma"
              value={revenueMetrics.total_commission}
              icon="💵"
              prefix="$"
              color="blue"
              loading={loading}
            />
            <MetricCard
              title="Pago a Niñeras"
              value={revenueMetrics.revenue_to_nannies}
              icon="💸"
              prefix="$"
              color="purple"
              loading={loading}
            />
            <MetricCard
              title="Valor Promedio"
              value={revenueMetrics.average_booking_value}
              icon="📊"
              prefix="$"
              color="orange"
              loading={loading}
            />
          </div>
        </section>
      )}

      {/* Top Nannies */}
      {topNannies.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top 5 Niñeras</h2>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Reservas</th>
                  <th>Completadas</th>
                  <th>Rating</th>
                  <th>Tarifa/Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {topNannies.map((nanny, index) => (
                  <tr key={nanny.id}>
                    <td className={styles.rank}>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td className={styles.nannyName}>{nanny.name}</td>
                    <td>{nanny.total_bookings}</td>
                    <td>{nanny.completed_bookings}</td>
                    <td>
                      <span className={styles.rating}>
                        ⭐ {nanny.rating_avg.toFixed(1)}
                      </span>
                    </td>
                    <td>${nanny.hourly_rate.toLocaleString('es-CL')}</td>
                    <td>
                      {nanny.is_verified ? (
                        <span className={styles.verified}>✓ Verificada</span>
                      ) : (
                        <span className={styles.pending}>Pendiente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reseñas</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            title="Total Reseñas"
            value={overview?.reviews?.total || 0}
            icon="⭐"
            color="orange"
            loading={loading}
          />
          <MetricCard
            title="Rating Promedio"
            value={overview?.reviews?.average_rating || 0}
            icon="📊"
            suffix="/5"
            color="purple"
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
};

export default MetricsView;
