import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

/**
 * Componente para subir y previsualizar imágenes
 * @param {Object} props
 * @param {Function} props.onImageSelect - Callback cuando se selecciona una imagen
 * @param {string} props.currentImage - URL de la imagen actual (si existe)
 * @param {string} props.label - Etiqueta del campo
 * @param {number} props.maxSizeMB - Tamaño máximo en MB (default: 5)
 * @param {Array<string>} props.acceptedFormats - Formatos aceptados (default: ['image/jpeg', 'image/png', 'image/webp'])
 */
const ImageUploader = ({
  onImageSelect,
  currentImage = null,
  label = 'Foto de perfil',
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Validar formato
    if (!acceptedFormats.includes(file.type)) {
      const formatsText = acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
      return `Formato no válido. Use: ${formatsText}`;
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `El archivo es demasiado grande. Máximo ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileChange = (file) => {
    if (!file) return;

    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageSelect(file);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Área de preview o upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          // Preview de la imagen
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              aria-label="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClickUpload}
              className="absolute bottom-2 right-2 px-3 py-1.5 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-md text-sm font-medium"
            >
              Cambiar foto
            </button>
          </div>
        ) : (
          // Área de carga
          <div
            onClick={handleClickUpload}
            className="flex flex-col items-center justify-center p-8 cursor-pointer"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {isDragging ? (
                <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragging ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una imagen'}
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} hasta {maxSizeMB}MB
            </p>
          </div>
        )}

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-label={label}
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Información adicional */}
      <p className="text-xs text-gray-500">
        Formatos aceptados: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}. 
        Tamaño máximo: {maxSizeMB}MB
      </p>
    </div>
  );
};

export default ImageUploader;
