"use client";

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

// Try multiple possible environment variable names for Stripe publishable key
const stripePublishableKey = 
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  process.env.STRIPE_PUBLISHABLE_KEY ||
  process.env.STRIPE_PUBLIC_KEY ||
  ''

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
  options?: StripeElementsOptions;
}

export function StripeProvider({ children, clientSecret, options }: StripeProviderProps) {
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#9333ea',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    ...options,
  };

  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
}

