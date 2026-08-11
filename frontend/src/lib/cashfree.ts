interface CashfreeWindow extends Window {
  Cashfree?: (config: { mode: string }) => { checkout: (options: CashfreeCheckoutOptions) => void };
}

interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  redirectTarget: '_self' | '_blank' | '_modal';
}

const SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

let sdkPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SDK_URL}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Could not load the Cashfree checkout SDK.'));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export async function openCashfreeCheckout(paymentSessionId: string): Promise<void> {
  await loadScript();
  const Cashfree = (window as CashfreeWindow).Cashfree;
  if (!Cashfree) {
    throw new Error('Cashfree SDK is not available.');
  }
  const mode = import.meta.env.VITE_CASHFREE_MODE === 'production' ? 'production' : 'sandbox';
  const cashfree = Cashfree({ mode });
  cashfree.checkout({
    paymentSessionId,
    redirectTarget: '_self',
  });
}