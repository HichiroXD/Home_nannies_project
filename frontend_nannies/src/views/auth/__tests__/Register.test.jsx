/**
 * Tests para Register Component - FASE 2
 * 
 * Cubre:
 * - Renderizado del formulario
 * - Validación de campos
 * - Validación de email
 * - Confirmación de contraseña
 * - Flujo de registro exitoso
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
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

// Mock de useAlertStore
const mockShowAlert = vi.fn();
vi.mock('@/stores/useAlertStore', () => ({
  default: vi.fn(() => mockShowAlert),
}));

// Mock de navigate y location
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/register' }),
  };
});

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza el formulario de registro correctamente', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correo electr/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('muestra error cuando los campos están vacíos', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    // Remover required para permitir submit con campos vacíos
    usernameInput.removeAttribute('required');
    emailInput.removeAttribute('required');
    passwordInput.removeAttribute('required');
    confirmPasswordInput.removeAttribute('required');
    
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'div' && content.includes('completa todos los campos obligatorios');
      })).toBeInTheDocument();
    });
  });

  it('valida formato de email', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const form = emailInput.closest('form');
    
    // Llenar todos los campos con email inválido
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'correo-invalido');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    
    // Disparar submit del form directamente para evitar validación HTML5
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'div' && content.includes('correo electrónico válido');
      })).toBeInTheDocument();
    });
  });

  it('valida que las contraseñas coincidan', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Different123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
    });
  });

  it('valida longitud mínima de contraseña', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    await user.type(confirmPasswordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
    });
  });

  it('valida que el rol esté seleccionado', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const roleSelect = screen.getByRole('combobox');
    
    // Verificar que el rol por defecto es "parent"
    expect(roleSelect.value).toBe('parent');
    
    // Cambiar a "nanny"
    await user.selectOptions(roleSelect, 'nanny');
    expect(roleSelect.value).toBe('nanny');
  });

  it('realiza registro exitoso', { timeout: 8000 }, async () => {
    const user = userEvent.setup();
    userApi.registerUser.mockResolvedValue({
      status: 201,
      data: {
        message: 'Registro exitoso',
        username: 'newuser'
      }
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const roleSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.selectOptions(roleSelect, 'parent');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        expect.objectContaining({
          state: expect.objectContaining({
            message: expect.stringContaining('Cuenta creada')
          })
        })
      );
    }, { timeout: 5000 });
  });

  it('maneja error de usuario ya registrado', async () => {
    const user = userEvent.setup();
    userApi.registerUser.mockRejectedValue({
      response: {
        status: 400,
        data: { username: ['Este nombre de usuario ya está en uso.'] }
      }
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const roleSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(usernameInput, 'existinguser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.selectOptions(roleSelect, 'parent');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nombre de usuario ya está en uso/i)).toBeInTheDocument();
    });
  });

  it('maneja error de email ya registrado', async () => {
    const user = userEvent.setup();
    userApi.registerUser.mockRejectedValue({
      response: {
        status: 400,
        data: { email: ['Este email ya está registrado.'] }
      }
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const roleSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.selectOptions(roleSelect, 'parent');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'div' && content.includes('email ya está registrado');
      })).toBeInTheDocument();
    });
  });

  it('deshabilita botón durante el proceso de registro', async () => {
    const user = userEvent.setup();
    
    // Mock que tarda en resolver
    userApi.registerUser.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ message: 'Success' }), 1000))
    );

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/usuario/i);
    const emailInput = screen.getByPlaceholderText(/correo electr/i);
    const passwordInput = screen.getByPlaceholderText(/^contraseña/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmar contraseña/i);
    const roleSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.selectOptions(roleSelect, 'parent');
    
    // Usar fireEvent para trigger inmediato
    fireEvent.click(submitButton);

    // Verificar que se muestre el loader durante la carga
    await waitFor(() => {
      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });
});
