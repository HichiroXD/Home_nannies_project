import React from 'react';
import { HeaderLanding, Footer } from '@components/layout';

export default function MainLayout({ children }) {
  // Verificar si hay un usuario logueado
  const isLoggedIn = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <HeaderLanding isLoggedIn={isLoggedIn} username={username} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}