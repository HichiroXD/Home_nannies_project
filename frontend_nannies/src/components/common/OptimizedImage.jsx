import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './OptimizedImage.module.css';

/**
 * Componente de imagen optimizada con lazy loading y placeholder.
 * 
 * Características:
 * - Lazy loading nativo
 * - Placeholder mientras carga
 * - Manejo de errores
 * - Tamaños responsivos
 * - Efecto de blur-up
 * 
 * @example
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Descripción"
 *   width={300}
 *   height={200}
 * />
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderSrc = null,
  fallbackSrc = '/assets/placeholder.jpg',
  loading = 'lazy',
  objectFit = 'cover',
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Precargar la imagen real
    if (src) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        setHasError(false);
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(true);
        if (onError) onError();
      };
      
      img.src = src;
    }
  }, [src, fallbackSrc, onLoad, onError]);

  const imageClassName = `
    ${styles.image}
    ${isLoading ? styles.loading : styles.loaded}
    ${hasError ? styles.error : ''}
    ${className}
  `.trim();

  return (
    <div
      className={styles.container}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width} / ${height}` : undefined
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={imageClassName}
        style={{ objectFit }}
        {...props}
      />
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  placeholderSrc: PropTypes.string,
  fallbackSrc: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default OptimizedImage;
