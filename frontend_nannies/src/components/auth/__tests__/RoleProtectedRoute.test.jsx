import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import RoleProtectedRoute from '../RoleProtectedRoute';

// Componentes de prueba
const ProtectedComponent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;
const UnauthorizedPage = () => <div>Unauthorized Page</div>;

describe('RoleProtectedRoute Component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Autenticación básica', () => {
    it('debe redirigir a login si no hay token', () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles={['parent']}>
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('debe renderizar el contenido protegido si está autenticado y tiene el rol correcto', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles={['parent']}>
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('Verificación de roles', () => {
    it('debe permitir acceso a usuario con rol "parent" cuando se requiere "parent"', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      render(
        <MemoryRouter initialEntries={['/parent-dashboard']}>
          <Routes>
            <Route 
              path="/parent-dashboard" 
              element={
                <RoleProtectedRoute allowedRoles="parent">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('debe permitir acceso a usuario con rol "nanny" cuando se requiere "nanny"', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'nanny');

      render(
        <MemoryRouter initialEntries={['/nanny-dashboard']}>
          <Routes>
            <Route 
              path="/nanny-dashboard" 
              element={
                <RoleProtectedRoute allowedRoles="nanny">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('debe permitir acceso a usuario con rol "admin" cuando se requiere "admin"', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'admin');

      render(
        <MemoryRouter initialEntries={['/admin-dashboard']}>
          <Routes>
            <Route 
              path="/admin-dashboard" 
              element={
                <RoleProtectedRoute allowedRoles="admin">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('debe redirigir a unauthorized si el usuario no tiene el rol correcto', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      render(
        <MemoryRouter initialEntries={['/nanny-dashboard']}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route 
              path="/nanny-dashboard" 
              element={
                <RoleProtectedRoute allowedRoles="nanny">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Múltiples roles permitidos', () => {
    it('debe permitir acceso cuando el usuario tiene uno de los roles permitidos', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      render(
        <MemoryRouter initialEntries={['/shared-page']}>
          <Routes>
            <Route 
              path="/shared-page" 
              element={
                <RoleProtectedRoute allowedRoles={['parent', 'nanny']}>
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('debe permitir acceso cuando el usuario es nanny y están permitidos parent y nanny', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'nanny');

      render(
        <MemoryRouter initialEntries={['/shared-page']}>
          <Routes>
            <Route 
              path="/shared-page" 
              element={
                <RoleProtectedRoute allowedRoles={['parent', 'nanny']}>
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('debe denegar acceso cuando el usuario no tiene ninguno de los roles permitidos', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      render(
        <MemoryRouter initialEntries={['/admin-only']}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route 
              path="/admin-only" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    });
  });

  describe('Case sensitivity', () => {
    it('debe manejar roles en mayúsculas correctamente', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'PARENT');

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles="parent">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('debe manejar roles en mixed case correctamente', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'Parent');

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles="parent">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Redirección personalizada', () => {
    it('debe redirigir a la ruta personalizada cuando se proporciona redirectTo', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      const CustomPage = () => <div>Custom Redirect Page</div>;

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/custom-redirect" element={<CustomPage />} />
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles="nanny" redirectTo="/custom-redirect">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Custom Redirect Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Estado de location', () => {
    it('debe preservar la ruta original en el estado al redirigir a login', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles="parent">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      // La navegación debe incluir el estado 'from' para redirigir después del login
    });
  });

  describe('Edge cases', () => {
    it('debe manejar correctamente cuando no hay rol en localStorage', () => {
      localStorage.setItem('accessToken', 'fake-token');
      // No se establece 'role'

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles="parent">
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    });

    it('debe manejar array vacío de allowedRoles', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles={[]}>
                  <ProtectedComponent />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    });

    it('debe renderizar children correctamente cuando pasa todas las validaciones', () => {
      localStorage.setItem('accessToken', 'fake-token');
      localStorage.setItem('role', 'parent');

      const ComplexChild = () => (
        <div>
          <h1>Complex Component</h1>
          <p>With multiple elements</p>
        </div>
      );

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <RoleProtectedRoute allowedRoles="parent">
                  <ComplexChild />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Complex Component')).toBeInTheDocument();
      expect(screen.getByText('With multiple elements')).toBeInTheDocument();
    });
  });
});
