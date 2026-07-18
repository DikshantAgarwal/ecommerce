import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import GoogleSignInButton from '../GoogleSignInButton';

const mockInitialize = vi.fn();
const mockRenderButton = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('google', {
    accounts: {
      id: {
        initialize: mockInitialize,
        renderButton: mockRenderButton,
      },
    },
  });
});

describe('GoogleSignInButton', () => {
  it('renders a container div and initializes GIS', async () => {
    const { container } = render(
      <BrowserRouter>
        <GoogleSignInButton clientId="test-id.apps.googleusercontent.com" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  it('initializes Google Identity Services after script loads', async () => {
    render(
      <BrowserRouter>
        <GoogleSignInButton clientId="test-id.apps.googleusercontent.com" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    expect(mockInitialize).toHaveBeenCalledWith({
      client_id: 'test-id.apps.googleusercontent.com',
      callback: expect.any(Function),
    });
  });

  it('renders the Google button after initialization', async () => {
    render(
      <BrowserRouter>
        <GoogleSignInButton clientId="test-id.apps.googleusercontent.com" />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockRenderButton).toHaveBeenCalledTimes(1);
    });
  });
});
