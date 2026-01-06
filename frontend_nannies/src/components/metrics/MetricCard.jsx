import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './MetricCard.module.css';

/**
 * Componente de tarjeta de métrica con icono, valor y tendencia.
 * 
 * @example
 * <MetricCard
 *   title="Total de Usuarios"
 *   value={1250}
 *   icon="👥"
 *   trend={12.5}
 *   trendLabel="vs mes anterior"
 * />
 */
const MetricCard = ({
  title,
  value,
  icon,
  trend = null,
  trendLabel = '',
  loading = false,
  color = 'blue',
  prefix = '',
  suffix = '',
  formatValue = true
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && formatValue && typeof value === 'number') {
      // Animate number counting
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, loading, formatValue]);

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toLocaleString('es-CL');
  };

  const getTrendClass = () => {
    if (trend === null || trend === 0) return styles.trendNeutral;
    return trend > 0 ? styles.trendUp : styles.trendDown;
  };

  const getTrendIcon = () => {
    if (trend === null || trend === 0) return '→';
    return trend > 0 ? '↑' : '↓';
  };

  return (
    <div className={`${styles.card} ${styles[color]}`}>
      {loading ? (
        <div className={styles.skeleton}>
          <div className={styles.skeletonIcon}></div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonValue}></div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.icon}>{icon}</div>
          <div className={styles.content}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.value}>
              {prefix}
              {formatValue && typeof displayValue === 'number' 
                ? formatNumber(displayValue) 
                : displayValue}
              {suffix}
            </div>
            {trend !== null && (
              <div className={`${styles.trend} ${getTrendClass()}`}>
                <span className={styles.trendIcon}>{getTrendIcon()}</span>
                <span className={styles.trendValue}>
                  {Math.abs(trend).toFixed(1)}%
                </span>
                {trendLabel && (
                  <span className={styles.trendLabel}>{trendLabel}</span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.string.isRequired,
  trend: PropTypes.number,
  trendLabel: PropTypes.string,
  loading: PropTypes.bool,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'red']),
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  formatValue: PropTypes.bool
};

export default MetricCard;
