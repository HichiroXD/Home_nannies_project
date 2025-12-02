/**
 * Setup Tests - Configuración global para todos los tests
 */

// Importar matchers adicionales de testing-library
import '@testing-library/jest-dom';

// La función de localStorage está disponible en jsdom
// No necesitamos hacer un mock, ya que jsdom lo proporciona

// Silenciar console.error y console.warn en tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Filtrar warnings específicos si es necesario
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
