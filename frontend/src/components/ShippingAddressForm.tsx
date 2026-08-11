import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Loader2, MapPin, Plus } from 'lucide-react';
import { useCreateAddress, useAddresses, useDeleteAddress, useSetDefaultAddress } from '../hooks/useAddress';
import type { Address, CreateAddressPayload } from '../types/address';

interface ShippingAddressFormProps {
  onAddressChange?: (address: Address | null) => void;
}

interface FormState {
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(form.phone.replace(/[^0-9]/g, ''))) {
    errors.phone = 'Enter a valid 10-digit phone number';
  }
  if (!form.address_line1.trim()) errors.address_line1 = 'Address line 1 is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';
  if (!form.postal_code.trim()) {
    errors.postal_code = 'PIN code is required';
  } else if (!/^\d{6}$/.test(form.postal_code.trim())) {
    errors.postal_code = 'Enter a valid 6-digit PIN code';
  }
  if (!form.country.trim()) errors.country = 'Country is required';

  return errors;
}

export default function ShippingAddressForm({ onAddressChange }: ShippingAddressFormProps) {
  const { data: addresses = [], isLoading } = useAddresses();
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefaultAddress } = useSetDefaultAddress();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  }

  function selectAddress(address: Address) {
    setSelectedId(address.id);
    if (onAddressChange) onAddressChange(address);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateAddressPayload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country.trim(),
      is_default: addresses.length === 0,
    };

    createAddress(payload, {
      onSuccess: (address) => {
        setForm(EMPTY_FORM);
        setErrors({});
        setShowForm(false);
        selectAddress(address);
      },
      onError: (error) => {
        setServerError('Could not save address. Please try again.');
        void error;
      },
    });
  }

  const inputClass = (hasError?: string) =>
    `h-12 w-full rounded-lg border bg-white px-4 text-neutral-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-300 ${
      hasError ? 'border-error bg-error/5' : 'border-neutral-300'
    }`;

  if (isLoading) {
    return (
      <div role="status" className="flex items-center gap-3 rounded-lg bg-neutral-0 p-4 text-neutral-600">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">Loading saved addresses...</span>
      </div>
    );
  }

  return (
    <section aria-labelledby="shipping-address-heading">
      <h2 id="shipping-address-heading" className="text-lg font-semibold text-neutral-900">
        Shipping Address
      </h2>

      {addresses.length > 0 && (
        <div className="mt-4 space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                selectedId === address.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 bg-neutral-0 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name="shipping-address"
                id={`address-${address.id}`}
                checked={selectedId === address.id}
                onChange={() => selectAddress(address)}
                className="mt-1 size-4 accent-primary-900"
                aria-label={`Select address: ${address.name}, ${address.address_line1}, ${address.city}`}
              />
              <label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  {address.name}
                  {address.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-900 px-2 py-0.5 text-xs text-white">
                      <Check className="size-3" aria-hidden="true" />
                      Default
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-neutral-600">
                  {address.address_line1}
                  {address.address_line2 && `, ${address.address_line2}`}, {address.city},{' '}
                  {address.state} - {address.postal_code}, {address.country}
                </span>
                <span className="mt-0.5 block text-sm text-neutral-500">{address.phone}</span>
              </label>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(address.id)}
                    className="text-xs font-medium text-neutral-500 transition-colors hover:text-primary-900"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteAddress(address.id)}
                  disabled={isDeleting}
                  className="text-xs font-medium text-error transition-colors hover:text-error hover:underline disabled:opacity-50"
                  aria-label={`Delete address for ${address.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-neutral-200 bg-neutral-0 p-4" noValidate>
          {serverError && (
            <p role="alert" className="mb-4 rounded-md bg-error/10 px-3 py-2 text-sm text-error">
              {serverError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="address-name" className="mb-1 block text-sm font-medium text-neutral-700">
                Full name <span className="text-error">*</span>
              </label>
              <input
                id="address-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputClass(errors.name)}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="address-phone" className="mb-1 block text-sm font-medium text-neutral-700">
                Phone <span className="text-error">*</span>
              </label>
              <input
                id="address-phone"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={inputClass(errors.phone)}
                aria-invalid={!!errors.phone}
                placeholder="10-digit mobile number"
              />
              {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address-line1" className="mb-1 block text-sm font-medium text-neutral-700">
                Address line 1 <span className="text-error">*</span>
              </label>
              <input
                id="address-line1"
                type="text"
                autoComplete="address-line1"
                value={form.address_line1}
                onChange={(e) => handleChange('address_line1', e.target.value)}
                className={inputClass(errors.address_line1)}
                aria-invalid={!!errors.address_line1}
                placeholder="House number, street, area"
              />
              {errors.address_line1 && <p className="mt-1 text-sm text-error">{errors.address_line1}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address-line2" className="mb-1 block text-sm font-medium text-neutral-700">
                Address line 2 <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                id="address-line2"
                type="text"
                autoComplete="address-line2"
                value={form.address_line2}
                onChange={(e) => handleChange('address_line2', e.target.value)}
                className={inputClass()}
                placeholder="Landmark, building, apartment"
              />
            </div>

            <div>
              <label htmlFor="address-city" className="mb-1 block text-sm font-medium text-neutral-700">
                City <span className="text-error">*</span>
              </label>
              <input
                id="address-city"
                type="text"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={inputClass(errors.city)}
                aria-invalid={!!errors.city}
              />
              {errors.city && <p className="mt-1 text-sm text-error">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="address-state" className="mb-1 block text-sm font-medium text-neutral-700">
                State <span className="text-error">*</span>
              </label>
              <input
                id="address-state"
                type="text"
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className={inputClass(errors.state)}
                aria-invalid={!!errors.state}
              />
              {errors.state && <p className="mt-1 text-sm text-error">{errors.state}</p>}
            </div>

            <div>
              <label htmlFor="address-postal" className="mb-1 block text-sm font-medium text-neutral-700">
                PIN code <span className="text-error">*</span>
              </label>
              <input
                id="address-postal"
                type="text"
                autoComplete="postal-code"
                inputMode="numeric"
                value={form.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className={inputClass(errors.postal_code)}
                aria-invalid={!!errors.postal_code}
                placeholder="6-digit PIN code"
              />
              {errors.postal_code && <p className="mt-1 text-sm text-error">{errors.postal_code}</p>}
            </div>

            <div>
              <label htmlFor="address-country" className="mb-1 block text-sm font-medium text-neutral-700">
                Country <span className="text-error">*</span>
              </label>
              <input
                id="address-country"
                type="text"
                autoComplete="country-name"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className={inputClass(errors.country)}
                aria-invalid={!!errors.country}
              />
              {errors.country && <p className="mt-1 text-sm text-error">{errors.country}</p>}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
                setErrors({});
                setServerError(null);
              }}
              className="h-12 rounded-lg border border-neutral-300 px-6 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="h-12 rounded-lg bg-primary-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {isCreating ? 'Saving...' : 'Save address'}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary-900 px-4 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          {addresses.length > 0 ? 'Add another address' : 'Add shipping address'}
        </button>
      )}

      {!showForm && (
        <div className="mt-4 flex items-start gap-2 text-sm text-neutral-500">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {selectedId
              ? 'Shipping address selected. You can change it before paying.'
              : addresses.length > 0
                ? 'Select a saved address or add a new one.'
                : 'Please add a shipping address to continue.'}
          </span>
        </div>
      )}
    </section>
  );
}