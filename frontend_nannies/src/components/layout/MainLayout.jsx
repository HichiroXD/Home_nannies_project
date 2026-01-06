import React from 'react';
import PropTypes from 'prop-types';
import { HeaderLanding, Footer } from '@components/layout';
import useAuthStore from '@/stores/useAuthStore';

export default function MainLayout({ children, hideFooter = false }) {
  // Verificar si hay un usuario logueado desde el store
  const { isAuthenticated, username, role } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    username: state.user?.username,
    role: state.role
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-100 to-white">
      <HeaderLanding isLoggedIn={isAuthenticated} username={username} role={role} />
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  hideFooter: PropTypes.bool,
};

MainLayout.defaultProps = {
  hideFooter: false,
};