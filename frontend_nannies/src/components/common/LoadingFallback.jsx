import React from 'react';
import styles from './LoadingFallback.module.css';

const LoadingFallback = ({
  message = 'Cargando...',
  size = 'medium',
  fullScreen = true,
  className = ''
}) => {
  const containerClass = fullScreen
    ? styles.fullScreenContainer
    : styles.container;

  const spinnerClass = `${styles.spinner} ${styles[size]}`;

  return (
    <div className={`${containerClass} ${className}`}>
      <div className={spinnerClass}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingFallback;