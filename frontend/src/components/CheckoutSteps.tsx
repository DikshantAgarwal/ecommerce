import { Check } from 'lucide-react';

export type CheckoutStep = 'cart' | 'address' | 'payment';

interface CheckoutStepsProps {
  current: CheckoutStep;
}

const STEPS: Array<{ id: CheckoutStep; label: string }> = [
  { id: 'cart', label: 'Cart' },
  { id: 'address', label: 'Address' },
  { id: 'payment', label: 'Payment' },
];

export default function CheckoutSteps({ current }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Checkout progress" className="flex items-center">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;

        return (
          <div key={step.id} className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div
              className="flex items-center gap-2"
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-900 text-white'
                    : isComplete
                      ? 'bg-primary-900 text-white'
                      : 'border border-neutral-300 bg-neutral-0 text-neutral-500'
                }`}
                aria-hidden="true"
              >
                {isComplete ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  isActive || isComplete ? 'text-primary-900' : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`mx-3 h-px flex-1 ${isComplete ? 'bg-primary-900' : 'bg-neutral-200'}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}