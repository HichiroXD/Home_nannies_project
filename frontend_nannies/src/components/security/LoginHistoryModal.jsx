/**
 * Modal Reutilizable - Historial de Acceso
 */
import React from 'react';

export default function LoginHistoryModal({ isOpen, onClose, loginHistory }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Historial de Acceso</h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {loginHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay registros de acceso</p>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((entry, index) => (
                <div 
                  key={entry.id || index}
                  className={`p-4 rounded-lg border ${
                    entry.login_successful 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${
                          entry.login_successful ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {entry.login_successful ? '✅ Acceso exitoso' : '❌ Acceso fallido'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Fecha:</strong> {new Date(entry.login_time).toLocaleString('es-ES')}</p>
                        <p><strong>IP:</strong> {entry.ip_address}</p>
                        {entry.device_type && <p><strong>Dispositivo:</strong> {entry.device_type}</p>}
                        {entry.location && <p><strong>Ubicación:</strong> {entry.location}</p>}
                        {!entry.login_successful && entry.failure_reason && (
                          <p className="text-red-600"><strong>Razón:</strong> {entry.failure_reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
