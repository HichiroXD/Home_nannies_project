import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../../hooks';

describe('useToggle Hook', () => {
  test('Inicializa con valor por defecto false', () => {
    const { result } = renderHook(() => useToggle());

    expect(result.current[0]).toBe(false);
  });

  test('Inicializa con valor personalizado', () => {
    const { result } = renderHook(() => useToggle(true));

    expect(result.current[0]).toBe(true);
  });

  test('Toggle cambia el estado', () => {
    const { result } = renderHook(() => useToggle());

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](); // toggle function
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(false);
  });

  test('SetValue cambia el estado directamente', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      result.current[2](true); // setValue function
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[2](false);
    });

    expect(result.current[0]).toBe(false);
  });

  test('Retorna array con [value, toggle, setValue]', () => {
    const { result } = renderHook(() => useToggle());

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(3);
    expect(typeof result.current[1]).toBe('function'); // toggle
    expect(typeof result.current[2]).toBe('function'); // setValue
  });
});
