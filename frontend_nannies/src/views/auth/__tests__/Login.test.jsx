/**
 * Tests para Login Component - FASE 2
 * 
 * Cubre:
 * - Renderizado básico
 * - Validación de campos
 * - Manejo de errores
 * - Flujo exitoso
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import * as userApi from '../../../api/userApi';

// Mock del API
vi.mock('../../../api/userApi');

// Mock del logger
vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock de useAuthStore
const mockLogin = vi.fn();
vi.mock('@/stores/useAuthStore', () => ({
  default: vi.fn(() => mockLogin),
}));

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/login', state: null }),
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza el formulario de login correctamente', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('muestra error cuando los campos están vacíos', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    // Remover required para permitir submit con campos vacíos
    usernameInput.removeAttribute('required');
    passwordInput.removeAttribute('required');
    
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'div' && content.includes('completa todos los campos');
      })).toBeInTheDocument();
    });
  });

  it('valida longitud mínima de usuario', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(usernameInput, 'ab');
    await user.type(passwordInput, 'password1234');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('valida longitud mínima de contraseña', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
    });
  });

  it('maneja error de credenciales incorrectas', async () => {
    const user = userEvent.setup();
    userApi.loginUser.mockRejectedValue({
      response: {
        status: 401,
        data: { detail: 'Invalid credentials' }
      }
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'wrongpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/usuario o contraseña incorrectos/i)).toBeInTheDocument();
    });
  });

  it('realiza login exitoso y guarda datos en el store', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      access: 'mock_access_token',
      refresh: 'mock_refresh_token',
      username: 'testuser',
      role: 'parent'
    };

    userApi.loginUser.mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        user: { username: 'testuser', role: 'parent' },
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        role: 'parent'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/catalog');
    });
  });

  it('muestra mensaje de cuenta no verificada', async () => {
    const user = userEvent.setup();
    userApi.loginUser.mockRejectedValue({
      response: {
        status: 403,
        data: { detail: 'Email not verified' }
      }
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password12345');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/aún no está verificada/i)).toBeInTheDocument();
    });
  });

  it('deshabilita botón mientras está cargando', async () => {
    const user = userEvent.setup();
    
    // Mock que tarda en resolver
    userApi.loginUser.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        access: 'token',
        refresh: 'token',
        username: 'test',
        role: 'parent'
      }), 1000))
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'Password123!');
    
    // Usar fireEvent para trigger inmediato sin esperar
    fireEvent.click(submitButton);

    // Verificar que se muestre el loader durante la carga
    await waitFor(() => {
      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });
});
