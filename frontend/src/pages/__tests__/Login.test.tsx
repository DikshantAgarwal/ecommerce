import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Login from '../Login';
import { useAuthStore } from '../../store/auth.store';

describe('Login', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  });

  it('renders sign-in prompt', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to access your cart, orders, and more.'),
    ).toBeInTheDocument();
  });

  it('redirects to home when already authenticated', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', full_name: 'A', avatar: '' },
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});
