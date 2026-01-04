/**
 * Utilidades para optimización de imágenes.
 * Incluye funciones para redimensionamiento, compresión y conversión de formato.
 */

/**
 * Redimensiona una imagen manteniendo la proporción.
 * 
 * @param {File} file - Archivo de imagen
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Alto máximo
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<Blob>} - Imagen redimensionada como Blob
 */
export const resizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo proporción
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al redimensionar imagen'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte una imagen a formato WebP (si el navegador lo soporta).
 * 
 * @param {File} file - Archivo de imagen
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<Blob>} - Imagen en formato WebP
 */
export const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Verificar soporte de WebP
    const canvas = document.createElement('canvas');
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    if (!supportsWebP) {
      // Si no soporta WebP, devolver el archivo original
      resolve(file);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al convertir imagen'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Genera una URL optimizada para imágenes desde el backend.
 * Agrega parámetros de tamaño si el backend lo soporta.
 * 
 * @param {string} url - URL original de la imagen
 * @param {object} options - Opciones de optimización
 * @returns {string} - URL optimizada
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '';

  const {
    width = null,
    height = null,
    quality = 80,
    format = null
  } = options;

  // Si es una URL completa externa, retornar tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Construir URL con parámetros de optimización
  // (Esto requiere que el backend soporte estos parámetros)
  const params = new URLSearchParams();
  
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality) params.append('q', quality);
  if (format) params.append('f', format);

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * Valida si un archivo es una imagen válida.
 * 
 * @param {File} file - Archivo a validar
 * @param {object} options - Opciones de validación
 * @returns {Promise<boolean>} - true si es válida
 */
export const validateImage = async (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    minWidth = 100,
    minHeight = 100,
    maxWidth = 4000,
    maxHeight = 4000
  } = options;

  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido. Use: ${allowedTypes.join(', ')}`);
  }

  // Validar tamaño
  if (file.size > maxSize) {
    throw new Error(`El archivo es muy grande. Máximo ${maxSize / 1024 / 1024}MB`);
  }

  // Validar dimensiones
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          reject(new Error(`Imagen muy pequeña. Mínimo ${minWidth}x${minHeight}px`));
        } else if (img.width > maxWidth || img.height > maxHeight) {
          reject(new Error(`Imagen muy grande. Máximo ${maxWidth}x${maxHeight}px`));
        } else {
          resolve(true);
        }
      };

      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Comprime una imagen antes de subirla.
 * Combina redimensionamiento y conversión a WebP si es posible.
 * 
 * @param {File} file - Archivo de imagen
 * @param {object} options - Opciones de compresión
 * @returns {Promise<File>} - Imagen comprimida
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    useWebP = true
  } = options;

  try {
    // Validar imagen
    await validateImage(file);

    // Redimensionar
    let blob = await resizeImage(file, maxWidth, maxHeight, quality);

    // Convertir a WebP si es posible y está habilitado
    if (useWebP && file.type !== 'image/webp') {
      try {
        blob = await convertToWebP(new File([blob], file.name, { type: blob.type }), quality);
      } catch (error) {
        console.warn('No se pudo convertir a WebP, usando formato original:', error);
      }
    }

    // Crear nuevo archivo
    const extension = blob.type === 'image/webp' ? 'webp' : file.name.split('.').pop();
    const newFileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);
    
    return new File([blob], newFileName, { type: blob.type });
  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    throw error;
  }
};

/**
 * Genera un thumbnail (miniatura) de una imagen.
 * 
 * @param {File} file - Archivo de imagen
 * @param {number} size - Tamaño del thumbnail (cuadrado)
 * @returns {Promise<string>} - Data URL del thumbnail
 */
export const generateThumbnail = (file, size = 150) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');

        // Calcular recorte centrado
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Carga progresiva de imágenes: primero un placeholder borroso, luego la imagen completa.
 * 
 * @param {string} url - URL de la imagen
 * @returns {Promise<{placeholder: string, full: string}>}
 */
export const loadProgressiveImage = async (url) => {
  // Generar placeholder (versión pequeña)
  const placeholderUrl = getOptimizedImageUrl(url, { width: 50, quality: 30 });
  
  return {
    placeholder: placeholderUrl,
    full: url
  };
};
