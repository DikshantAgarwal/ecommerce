import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShippingAddressForm from '../ShippingAddressForm';

const mockAddresses = [
  {
    id: 'addr-1',
    name: 'Aarav Sharma',
    phone: '9876543210',
    address_line1: '42 Park Street',
    address_line2: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400001',
    country: 'India',
    is_default: true,
  },
  {
    id: 'addr-2',
    name: 'Ananya Singh',
    phone: '9123456780',
    address_line1: '7 Lotus Lane',
    address_line2: 'Floor 2',
    city: 'Delhi',
    state: 'Delhi',
    postal_code: '110001',
    country: 'India',
    is_default: false,
  },
];

const mockMutateCreate = vi.fn();
const mockMutateDelete = vi.fn();
const mockMutateDefault = vi.fn();

vi.mock('../../hooks/useAddress', () => ({
  useAddresses: vi.fn(),
  useCreateAddress: () => ({ mutate: mockMutateCreate, isPending: false }),
  useDeleteAddress: () => ({ mutate: mockMutateDelete, isPending: false }),
  useSetDefaultAddress: () => ({ mutate: mockMutateDefault }),
}));

import { useAddresses } from '../../hooks/useAddress';

function mockHookReturn(overrides = {}) {
  return {
    data: mockAddresses,
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

function getFormFields() {
  return {
    name: screen.getByLabelText(/Full name/),
    phone: screen.getByLabelText(/^Phone/),
    line1: screen.getByLabelText(/Address line 1/),
    city: screen.getByLabelText(/City/),
    state: screen.getByLabelText(/State/),
    postal: screen.getByLabelText(/PIN code/),
    country: screen.getByLabelText(/Country/),
  };
}

describe('ShippingAddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddresses).mockReturnValue(mockHookReturn() as never);
  });

  it('shows loading state', () => {
    vi.mocked(useAddresses).mockReturnValue(mockHookReturn({ data: undefined, isLoading: true }) as never);
    render(<ShippingAddressForm />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('renders saved addresses and shows add button', () => {
    render(<ShippingAddressForm />);
    expect(screen.getByText('Aarav Sharma')).toBeTruthy();
    expect(screen.getByText('Ananya Singh')).toBeTruthy();
    expect(screen.getByRole('button', { name: /add another address/i })).toBeTruthy();
    expect(screen.getByLabelText('Select address: Aarav Sharma, 42 Park Street, Mumbai')).toBeTruthy();
  });

  it('selecting an address notifies parent', async () => {
    const user = userEvent.setup();
    const onAddressChange = vi.fn();
    render(<ShippingAddressForm onAddressChange={onAddressChange} />);

    await user.click(screen.getByLabelText('Select address: Aarav Sharma, 42 Park Street, Mumbai'));
    expect(onAddressChange).toHaveBeenCalledWith(mockAddresses[0]);
  });

  it('opens form when no addresses and validates required fields', async () => {
    vi.mocked(useAddresses).mockReturnValue(
      mockHookReturn({ data: [] }) as never,
    );
    const user = userEvent.setup();
    render(<ShippingAddressForm />);

    await user.click(screen.getByRole('button', { name: /add shipping address/i }));
    expect(screen.getByLabelText(/Full name/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /save address/i }));

    expect(screen.getByText('Full name is required')).toBeTruthy();
    expect(screen.getByText('Phone number is required')).toBeTruthy();
    expect(screen.getByText('Address line 1 is required')).toBeTruthy();
    expect(screen.getByText('City is required')).toBeTruthy();
    expect(screen.getByText('State is required')).toBeTruthy();
    expect(screen.getByText('PIN code is required')).toBeTruthy();
    expect(mockMutateCreate).not.toHaveBeenCalled();
  });

  it('validates phone and PIN format', async () => {
    vi.mocked(useAddresses).mockReturnValue(mockHookReturn({ data: [] }) as never);
    const user = userEvent.setup();
    render(<ShippingAddressForm />);

    await user.click(screen.getByRole('button', { name: /add shipping address/i }));
    const { name, phone, line1, city, state, postal } = getFormFields();

    await user.type(name, 'Test User');
    await user.type(phone, '12345');
    await user.type(line1, '1 Main Road');
    await user.type(city, 'Chennai');
    await user.type(state, 'Tamil Nadu');
    await user.type(postal, '6000');
    await user.click(screen.getByRole('button', { name: /save address/i }));

    expect(screen.getByText('Enter a valid 10-digit phone number')).toBeTruthy();
    expect(screen.getByText('Enter a valid 6-digit PIN code')).toBeTruthy();
    expect(mockMutateCreate).not.toHaveBeenCalled();
  });

  it('creates address with valid payload', async () => {
    vi.mocked(useAddresses).mockReturnValue(mockHookReturn({ data: [] }) as never);
    mockMutateCreate.mockImplementation((payload, opts) => {
      opts.onSuccess({
        ...payload,
        id: 'addr-new',
        is_default: true,
      });
    });
    const user = userEvent.setup();
    const onAddressChange = vi.fn();
    render(<ShippingAddressForm onAddressChange={onAddressChange} />);

    await user.click(screen.getByRole('button', { name: /add shipping address/i }));
    const { name, phone, line1, city, state, postal } = getFormFields();

    await user.type(name, 'Rohan Mehta');
    await user.type(phone, '9876543210');
    await user.type(line1, '15 MG Road');
    await user.type(city, 'Bengaluru');
    await user.type(state, 'Karnataka');
    await user.type(postal, '560001');
    await user.click(screen.getByRole('button', { name: /save address/i }));

    expect(mockMutateCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rohan Mehta',
        phone: '9876543210',
        address_line1: '15 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560001',
        country: 'India',
        is_default: true,
      }),
      expect.anything(),
    );
    expect(onAddressChange).toHaveBeenCalled();
  });

  it('does not force default when addresses already exist', async () => {
    const user = userEvent.setup();
    render(<ShippingAddressForm />);

    await user.click(screen.getByRole('button', { name: /add another address/i }));
    const { name, phone, line1, city, state, postal } = getFormFields();

    await user.type(name, 'Rohan Mehta');
    await user.type(phone, '9876543210');
    await user.type(line1, '15 MG Road');
    await user.type(city, 'Bengaluru');
    await user.type(state, 'Karnataka');
    await user.type(postal, '560001');
    await user.click(screen.getByRole('button', { name: /save address/i }));

    expect(mockMutateCreate).toHaveBeenCalledWith(
      expect.objectContaining({ is_default: false }),
      expect.anything(),
    );
  });

  it('shows error when create fails', async () => {
    vi.mocked(useAddresses).mockReturnValue(mockHookReturn({ data: [] }) as never);
    mockMutateCreate.mockImplementation((_payload, opts) => {
      opts.onError(new Error('boom'));
    });
    const user = userEvent.setup();
    render(<ShippingAddressForm />);

    await user.click(screen.getByRole('button', { name: /add shipping address/i }));
    const { name, phone, line1, city, state, postal } = getFormFields();

    await user.type(name, 'Rohan Mehta');
    await user.type(phone, '9876543210');
    await user.type(line1, '15 MG Road');
    await user.type(city, 'Bengaluru');
    await user.type(state, 'Karnataka');
    await user.type(postal, '560001');
    await user.click(screen.getByRole('button', { name: /save address/i }));

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/could not save address/i)).toBeTruthy();
  });
});
