/**
 * OCRResult Component
 * Mostrar resultados del OCR (RUT extraído, confianza, etc.)
 */

import React from 'react';
import './OCRResult.css';

const OCRResult = ({ result, status, onReset }) => {
  const {
    extracted_rut,
    confidence_score,
    confidence_level,
    rut_valid,
    pages,
    raw_text
  } = result;

  // Determinar color según confianza
  const getConfidenceColor = (level) => {
    switch (level) {
      case 'high':
        return '#2ecc71'; // Verde
      case 'medium':
        return '#f39c12'; // Naranja
      case 'low':
        return '#e74c3c'; // Rojo
      default:
        return '#95a5a6';
    }
  };

  // Determinar icono según validez RUT
  const getRutIcon = () => {
    return rut_valid ? '✅' : '⚠️';
  };

  return (
    <div className="ocr-result-container">
      <div className="ocr-result-card">
        {/* Header */}
        <div className="ocr-result-header">
          <h2>{getRutIcon()} Resultado OCR</h2>
          <p>{rut_valid ? 'RUT válido extraído' : 'Requiere revisión'}</p>
        </div>

        {/* Main Result */}
        <div className="ocr-result-main">
          {/* RUT Box */}
          <div className={`rut-box ${rut_valid ? 'valid' : 'invalid'}`}>
            <p className="rut-label">RUT Extraído</p>
            <p className="rut-value">{extracted_rut || 'No encontrado'}</p>
          </div>

          {/* Confidence */}
          <div className="confidence-section">
            <div className="confidence-header">
              <p className="confidence-label">Confianza OCR</p>
              <p className="confidence-percent">{(confidence_score * 100).toFixed(0)}%</p>
            </div>

            {/* Confidence Bar */}
            <div className="confidence-bar-container">
              <div
                className="confidence-bar-fill"
                style={{
                  width: `${confidence_score * 100}%`,
                  backgroundColor: getConfidenceColor(confidence_level)
                }}
              ></div>
            </div>

            {/* Confidence Level */}
            <p className="confidence-level">
              Nivel: <span className={`level-${confidence_level}`}>
                {confidence_level === 'high' ? 'Alto' : confidence_level === 'medium' ? 'Medio' : 'Bajo'}
              </span>
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="ocr-result-details">
          <h3>📊 Detalles</h3>

          <div className="detail-item">
            <p className="detail-label">Páginas procesadas:</p>
            <p className="detail-value">{pages}</p>
          </div>

          <div className="detail-item">
            <p className="detail-label">RUT válido:</p>
            <p className="detail-value">{rut_valid ? '✓ Sí' : '✗ No'}</p>
          </div>

          {raw_text && (
            <div className="detail-item">
              <p className="detail-label">Texto extraído (primeras 200 caracteres):</p>
              <p className="detail-value text-preview">
                {raw_text.substring(0, 200)}
                {raw_text.length > 200 ? '...' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Status Message */}
        {!rut_valid && (
          <div className="ocr-warning">
            <p>⚠️ El RUT extraído no pasó validación. Por favor, verifique manualmente el documento.</p>
          </div>
        )}

        {confidence_score < 0.7 && (
          <div className="ocr-warning">
            <p>⚠️ Confianza baja. Se recomienda validación manual.</p>
          </div>
        )}

        {/* Actions */}
        <div className="ocr-result-actions">
          {rut_valid && confidence_score >= 0.7 ? (
            <>
              <button className="btn-confirm">
                ✓ Confirmar RUT
              </button>
              <button className="btn-edit" onClick={onReset}>
                ✎ Cargar otro documento
              </button>
            </>
          ) : (
            <>
              <button className="btn-review">
                👁️ Revisar Manualmente
              </button>
              <button className="btn-retry" onClick={onReset}>
                🔄 Intentar de nuevo
              </button>
            </>
          )}
        </div>

        {/* Help */}
        <div className="ocr-result-help">
          <h4>💡 Tips:</h4>
          <ul>
            <li>Asegúrate que el documento sea legible</li>
            <li>Buena iluminación para capturar la imagen</li>
            <li>El RUT debe estar completamente visible</li>
            <li>Si falla, carga una imagen más clara</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OCRResult;
