import { renderHook, act } from '@testing-library/react';
import { useForm } from '../../hooks';

describe('useForm Hook', () => {
  const initialValues = {
    name: 'John',
    email: 'john@example.com',
    password: '',
  };

  test('Inicializa con valores correctos', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  test('Actualiza valores correctamente', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Jane', type: 'text' },
      });
    });

    expect(result.current.values.name).toBe('Jane');
  });

  test('Marca campo como touched', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleBlur({
        target: { name: 'email' },
      });
    });

    expect(result.current.touched.email).toBe(true);
  });

  test('Resetea el formulario', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Jane', type: 'text' },
      });
    });

    expect(result.current.values.name).toBe('Jane');

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.touched).toEqual({});
  });

  test('setFieldValue actualiza campo específico', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.setFieldValue('email', 'newemail@example.com');
    });

    expect(result.current.values.email).toBe('newemail@example.com');
  });

  test('setFieldError setea error en campo', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.setFieldError('email', 'Email inválido');
    });

    expect(result.current.errors.email).toBe('Email inválido');
  });
});
