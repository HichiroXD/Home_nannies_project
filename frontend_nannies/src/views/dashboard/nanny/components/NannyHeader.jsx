/**
 * NannyHeader - Encabezado del dashboard con información de la niñera
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Star, User } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';

export const NannyHeader = ({ nanny = {} }) => {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/profile/nanny');
  };

  const rating = nanny?.rating || 0;
  const memberSince = nanny?.memberSince ? new Date(nanny.memberSince).toLocaleDateString('es-ES') : '21/11/2025';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
          <User size={36} className="text-gray-400" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{nanny?.name || 'Niñera'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white opacity-50'}
                />
              ))}
            </div>
            <span className="text-sm opacity-90">
              {typeof rating === 'number' ? rating.toFixed(2) : rating}/5
            </span>
          </div>
          <p className="text-sm opacity-80 mt-1">
            Miembro desde {memberSince}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSettings}
          className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 hover:bg-gray-100 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Settings size={18} />
          <span>Configuración</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 hover:bg-gray-100 rounded-lg transition-colors font-medium shadow-sm"
        >
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
};

export default NannyHeader;
