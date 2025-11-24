import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { useToggle } from '../../hooks';

describe('useToggle Hook - Integration Tests', () => {
  // Componente de prueba
  const TestComponent = ({ initialValue, onToggle }) => {
    const [state, toggle] = useToggle(initialValue);

    return (
      <div>
        <div>State: {state ? 'on' : 'off'}</div>
        <button onClick={() => {
          toggle();
          if (onToggle) onToggle();
        }}>
          Toggle
        </button>
        <button onClick={() => {
          toggle(true);
          if (onToggle) onToggle();
        }}>
          Turn On
        </button>
        <button onClick={() => {
          toggle(false);
          if (onToggle) onToggle();
        }}>
          Turn Off
        </button>
      </div>
    );
  };

  it('toggles state multiple times', () => {
    render(
      <TestComponent initialValue={false} />
    );

    expect(screen.getByText('State: off')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Toggle$/ }));
    expect(screen.getByText('State: on')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Toggle$/ }));
    expect(screen.getByText('State: off')).toBeInTheDocument();
  });

  it('sets state to specific value', () => {
    render(
      <TestComponent initialValue={false} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Turn On/ }));
    expect(screen.getByText('State: on')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Turn Off/ }));
    expect(screen.getByText('State: off')).toBeInTheDocument();
  });

  it('calls onToggle callback when toggled', () => {
    const onToggle = vi.fn();
    render(
      <TestComponent initialValue={false} onToggle={onToggle} />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Toggle$/ }));
    expect(onToggle).toHaveBeenCalled();
  });

  it('starts with initial value', () => {
    const { rerender } = render(
      <TestComponent initialValue={true} />
    );

    expect(screen.getByText('State: on')).toBeInTheDocument();
  });
});
