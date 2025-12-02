import { validators, formatters, storage } from '../../utils';

describe('Validators', () => {
  describe('email', () => {
    test('Valida email correcto', () => {
      expect(validators.email('user@example.com')).toBe(true);
      expect(validators.email('user.name+tag@example.co.uk')).toBe(true);
    });

    test('Rechaza email incorrecto', () => {
      expect(validators.email('notanemail')).toBe(false);
      expect(validators.email('user@')).toBe(false);
      expect(validators.email('@example.com')).toBe(false);
    });
  });

  describe('phone', () => {
    test('Valida teléfono correcto', () => {
      expect(validators.phone('123-456-7890')).toBe(true);
      expect(validators.phone('(123) 456-7890')).toBe(true);
      expect(validators.phone('+1 234 567 8901')).toBe(true);
    });

    test('Rechaza teléfono incorrecto', () => {
      expect(validators.phone('123')).toBe(false);
      expect(validators.phone('abc-def-ghij')).toBe(false);
    });
  });

  describe('password', () => {
    test('Valida contraseña correcta', () => {
      expect(validators.password('SecurePass123')).toBe(true);
      expect(validators.password('MyPassword999')).toBe(true);
    });

    test('Rechaza contraseña incorrecta', () => {
      expect(validators.password('short')).toBe(false); // Muy corta
      expect(validators.password('nouppercase1')).toBe(false); // Sin mayúscula
      expect(validators.password('NOLOWERCASE1')).toBe(false); // Sin minúscula
      expect(validators.password('NoNumbers')).toBe(false); // Sin número
    });
  });

  describe('url', () => {
    test('Valida URL correcta', () => {
      expect(validators.url('https://example.com')).toBe(true);
      expect(validators.url('http://example.co.uk')).toBe(true);
    });

    test('Rechaza URL incorrecta', () => {
      expect(validators.url('notaurl')).toBe(false);
      // ftp:// es válido en constructor URL, por eso usamos algo realmente inválido
      expect(validators.url('ht!tp://invalid')).toBe(false);
    });
  });
});

describe('Formatters', () => {
  describe('currency', () => {
    test('Formatea moneda correctamente', () => {
      const result = formatters.currency(1000, 'USD');
      expect(result).toContain('1');
      expect(result).toContain('000');
    });
  });

  describe('date', () => {
    test('Formatea fecha correctamente', () => {
      const date = new Date('2025-11-20');
      const result = formatters.date(date);
      expect(result).toBeTruthy();
    });
  });

  describe('capitalize', () => {
    test('Capitaliza string correctamente', () => {
      expect(formatters.capitalize('hello')).toBe('Hello');
      expect(formatters.capitalize('WORLD')).toBe('World');
    });
  });

  describe('titleCase', () => {
    test('Convierte a title case', () => {
      expect(formatters.titleCase('hello world')).toBe('Hello World');
      expect(formatters.titleCase('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('slug', () => {
    test('Crea slug válido', () => {
      expect(formatters.slug('Hello World')).toBe('hello-world');
      expect(formatters.slug('Test  Multi  Space')).toBe('test-multi-space');
      expect(formatters.slug('Special!@# Characters')).toBe('special-characters');
    });
  });

  describe('truncate', () => {
    test('Trunca string largo', () => {
      const result = formatters.truncate('Hello World', 8);
      expect(result.length).toBeLessThanOrEqual(11); // 8 + "..."
      expect(result).toContain('...');
    });

    test('No trunca string corto', () => {
      const result = formatters.truncate('Hi', 8);
      expect(result).toBe('Hi');
    });
  });
});

describe('Storage', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    const items = Object.keys(localStorage);
    items.forEach(key => localStorage.removeItem(key));
  });

  test('Guarda y recupera valor', () => {
    const testData = { value: 'test' };
    storage.set('testKey', testData);
    const result = storage.get('testKey');
    expect(result).toEqual(testData);
  });

  test('Retorna defaultValue si no existe', () => {
    const result = storage.get('nonexistentKey', 'defaultValue');
    expect(result).toBe('defaultValue');
  });

  test('Elimina valor correctamente', () => {
    storage.set('toDelete', 'value');
    expect(storage.get('toDelete')).toBe('value');
    storage.remove('toDelete');
    expect(storage.get('toDelete', null)).toBe(null);
  });
});
