/**
 * OCRStatus Component
 * Mostrar estado del procesamiento OCR en tiempo real
 */

import React, { useEffect, useState } from 'react';
import './OCRStatus.css';

const OCRStatus = ({ status, documentId, onCancel }) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [statusIcon, setStatusIcon] = useState('⏳');

  useEffect(() => {
    // Actualizar mensaje y icono según estado
    switch (status) {
      case 'processing':
        setStatusMessage('Procesando documento con OCR...');
        setStatusIcon('⏳');
        break;
      case 'extracted':
        setStatusMessage('✅ Documento procesado correctamente');
        setStatusIcon('✅');
        break;
      case 'needs_review':
        setStatusMessage('⚠️ Se requiere revisión manual');
        setStatusIcon('⚠️');
        break;
      case 'failed':
        setStatusMessage('❌ Error en el procesamiento');
        setStatusIcon('❌');
        break;
      default:
        setStatusMessage('Esperando...');
        setStatusIcon('⏳');
    }
  }, [status]);

  return (
    <div className="ocr-status-container">
      <div className="ocr-status-card">
        {/* Header */}
        <div className="ocr-status-header">
          <h2>Procesando Documento</h2>
        </div>

        {/* Status Content */}
        <div className="ocr-status-content">
          {/* Spinner/Icon */}
          <div className={`status-icon ${status === 'processing' ? 'spinning' : ''}`}>
            {statusIcon}
          </div>

          {/* Message */}
          <p className="status-message">{statusMessage}</p>

          {/* Document ID */}
          <div className="document-id">
            <span>ID: {documentId}</span>
          </div>

          {/* Progress Bar */}
          {status === 'processing' && (
            <div className="progress-indicator">
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Button */}
        {status === 'processing' && (
          <div className="ocr-status-actions">
            <button className="btn-cancel-status" onClick={onCancel}>
              ✕ Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRStatus;
