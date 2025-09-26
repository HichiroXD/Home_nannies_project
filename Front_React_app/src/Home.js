import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <span className="text-4xl font-bold text-indigo-600 mb-8">HomeNannies</span>
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
            Iniciar sesión
          </button>
        </Link>
        <Link to="/register">
          <button className="px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-700 transition">
            Registrarse
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;