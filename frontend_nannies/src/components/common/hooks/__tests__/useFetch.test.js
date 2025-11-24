import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { useFetch } from '../../hooks';

describe('useFetch Hook', () => {
  // Mock de fetch
  const mockFetch = (data, delay = 0) =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ ok: true, json: () => data }), delay)
    );

  const mockFetchError = () =>
    Promise.reject(new Error('Fetch error'));

  test('Comienza en estado loading', () => {
    const { result } = renderHook(() => useFetch('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  test('Maneja datos correctamente', async () => {
    const testData = { message: 'Success' };

    global.fetch = vi.fn(() => mockFetch(testData));

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(testData);
    expect(result.current.error).toBe(null);
  });

  test('Maneja errores correctamente', async () => {
    global.fetch = vi.fn(() => mockFetchError());

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBe(null);
  });

  test('Realiza refetch cuando se llama', async () => {
    const testData = { message: 'Data' };

    global.fetch = vi.fn(() => mockFetch(testData));

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(testData);

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
