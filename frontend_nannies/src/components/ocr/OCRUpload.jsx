/**
 * OCRUpload Component - Phase 3
 * Upload de documentos para procesamiento OCR
 * 
 * Features:
 * - Drag & drop zone
 * - File type validation
 * - Upload progress
 * - Real-time status polling
 * - Result display with RUT validation
 */

import React, { useState, useRef, useCallback } from 'react';
import './OCRUpload.css';
import OCRStatus from './OCRStatus';
import OCRResult from './OCRResult';
import { uploadOCRDocument, getOCRStatus } from '../../api/ocrApi';

const OCRUpload = ({ onUploadComplete, documentType = 'rut' }) => {
  // State Management
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentId, setDocumentId] = useState(null);
  const [ocrStatus, setOcrStatus] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);

  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Configuración de tipos de archivo permitidos
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'application/pdf'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validar archivo
   */
  const validateFile = useCallback((file) => {
    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato no permitido. Use JPG, PNG, BMP, GIF o PDF');
      return false;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo es muy grande. Máximo 10MB');
      return false;
    }

    return true;
  }, []);

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = useCallback((selectedFile) => {
    setError(null);

    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      console.log('✅ Archivo seleccionado:', selectedFile.name);
    }
  }, [validateFile]);

  /**
   * Click en input file
   */
  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    handleFileSelect(selectedFile);
  };

  /**
   * Drag & drop handlers
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  /**
   * Polling para obtener estado del OCR
   */
  const startStatusPolling = useCallback((docId) => {
    setPollingActive(true);
    console.log('🔄 Iniciando polling para documento:', docId);

    const pollStatus = async () => {
      try {
        const response = await getOCRStatus(docId);
        const status = response.data?.ocr_status || response.data?.status;

        console.log(`📊 Estado OCR: ${status}`);
        setOcrStatus(status);

        // Detener polling si completado
        if (status === 'extracted' || status === 'needs_review' || status === 'failed') {
          setPollingActive(false);
          clearInterval(pollingIntervalRef.current);

          // Obtener resultado completo
          if (response.data.ocr_extraction) {
            setOcrResult(response.data.ocr_extraction);
            console.log('✅ OCR completado:', response.data.ocr_extraction);

            // Callback a componente padre
            if (onUploadComplete) {
              onUploadComplete({
                documentId: docId,
                result: response.data.ocr_extraction,
                status
              });
            }
          }
        }
      } catch (err) {
        console.error('Error obteniendo estado OCR:', err);
        // Continuar polling hasta timeout
      }
    };

    // Poll cada 3 segundos
    pollingIntervalRef.current = setInterval(pollStatus, 3000);

    // Timeout de 5 minutos
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        setPollingActive(false);
        setError('Timeout en procesamiento OCR');
      }
    }, 5 * 60 * 1000);
  }, [onUploadComplete]);

  /**
   * Subir documento
   */
  const handleUpload = async () => {
    if (!file) {
      setError('Seleccione un archivo primero');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      console.log('📤 Uploadando documento:', file.name);

      // Crear FormData
      const formData = new FormData();
      formData.append('document_file', file);
      formData.append('document_type', documentType);

      // Simular progreso (50% mientras se sube)
      setUploadProgress(50);

      // Subir documento
      const response = await uploadOCRDocument(formData);

      console.log('✅ Upload exitoso. Document ID:', response.data.document_id);

      // 100% progress
      setUploadProgress(100);

      // Guardar document ID
      setDocumentId(response.data.document_id);
      setOcrStatus('processing');

      // Iniciar polling
      startStatusPolling(response.data.document_id);

    } catch (err) {
      console.error('Error en upload:', err);
      setError(err.response?.data?.error || 'Error en upload de documento');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  /**
   * Limpiar/Reset
   */
  const handleReset = () => {
    setFile(null);
    setDocumentId(null);
    setOcrStatus(null);
    setOcrResult(null);
    setError(null);
    setUploadProgress(0);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  // Renderizar resultado si existe
  if (ocrResult) {
    return (
      <div className="ocr-upload-container">
        <OCRResult
          result={ocrResult}
          status={ocrStatus}
          onReset={handleReset}
        />
      </div>
    );
  }

  // Renderizar status si está procesando
  if (pollingActive || ocrStatus === 'processing') {
    return (
      <div className="ocr-upload-container">
        <OCRStatus
          status={ocrStatus}
          documentId={documentId}
          onCancel={handleReset}
        />
      </div>
    );
  }

  // Renderizar formulario de upload
  return (
    <div className="ocr-upload-container">
      <div className="ocr-upload-card">
        {/* Header */}
        <div className="ocr-upload-header">
          <h2>📄 Cargar Documento para OCR</h2>
          <p>Sube una imagen o PDF para extraer RUT automáticamente</p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className="ocr-drag-drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drag-drop-content">
            <div className="drag-drop-icon">📁</div>
            <h3>Arrastra y suelta tu archivo aquí</h3>
            <p>O haz clic para seleccionar</p>
            <p className="file-formats">JPG, PNG, BMP, GIF, PDF (máx. 10MB)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".jpg,.jpeg,.png,.bmp,.gif,.pdf"
            onChange={handleFileInput}
            disabled={uploading}
          />
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="ocr-file-preview">
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <p className="file-name">{file.name}</p>
                <p className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {uploading && (
              <div className="upload-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="ocr-error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="ocr-upload-actions">
          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? '⏳ Procesando...' : '🚀 Procesar Documento'}
          </button>

          {file && (
            <button
              className="btn-cancel"
              onClick={() => {
                setFile(null);
                setError(null);
              }}
              disabled={uploading}
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Info */}
        <div className="ocr-upload-info">
          <h4>✨ Características:</h4>
          <ul>
            <li>✓ Extrae RUT automáticamente</li>
            <li>✓ Valida formato RUT chileno</li>
            <li>✓ Calcula confianza OCR</li>
            <li>✓ Procesamiento en tiempo real</li>
            <li>✓ Soporta PDF e imágenes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OCRUpload;
