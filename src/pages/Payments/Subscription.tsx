import { useEffect, useRef } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const SubscriptionPage = () => {
  const containerRef = useRef(null);
  const isInTestMode = localStorage.getItem('isTestMode');

  useEffect(() => {
    // Function to create and append the script
    const loadStripeScript = () => {
      return new Promise((resolve, reject) => {
        const script = document?.createElement?.('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild?.(script);
      });
    };

    // Check if script is already loaded
    const scriptAlreadyLoaded = Array?.from?.(document?.scripts)?.some?.(
      (script) => script.src === 'https://js.stripe.com/v3/pricing-table.js',
    );

    // If not loaded, load the script
    if (!scriptAlreadyLoaded) {
      loadStripeScript()
        .then(() => {
          // Create the Stripe pricing table element
          const stripePricingTable = document?.createElement?.(
            'stripe-pricing-table',
          );
          stripePricingTable?.setAttribute?.(
            'pricing-table-id',
            isInTestMode === 'true'
              ? import.meta.env.VITE_STRIPE_TEST_TABLE
              : import.meta.env.VITE_STRIPE_PROD_TABLE,
          );
          stripePricingTable?.setAttribute?.(
            'publishable-key',
            isInTestMode === 'true'
              ? import.meta.env.VITE_STRIPE_TEST_KEY
              : import.meta.env.VITE_STRIPE_PROD_KEY,
          );
          containerRef?.current?.appendChild?.(stripePricingTable);
        })
        .catch((error) => {
          console.error('Failed to load Stripe script:', error);
        });
    } else {
      // If script is already loaded, directly create the element
      const stripePricingTable = document?.createElement?.(
        'stripe-pricing-table',
      );
      stripePricingTable?.setAttribute?.(
        'pricing-table-id',
        isInTestMode
          ? import.meta.env.VITE_STRIPE_TEST_TABLE
          : import.meta.env.VITE_STRIPE_PROD_TABLE,
      );
      stripePricingTable?.setAttribute?.(
        'publishable-key',
        isInTestMode
          ? import.meta.env.VITE_STRIPE_TEST_KEY
          : import.meta.env.VITE_STRIPE_PROD_KEY,
      );
      containerRef?.current?.appendChild?.(stripePricingTable);
    }

    // Cleanup function to remove the script and custom element when component unmounts
    return () => {
      const script = document?.querySelector?.(
        'script[src="https://js.stripe.com/v3/pricing-table.js"]',
      );
      if (script) document?.body?.removeChild?.(script);
      if (containerRef?.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Subscription" />

        <div className="flex flex-col gap-4">
          <div className="bg-gray-300 min-h-[100vh] mt-4">
            <div className="mx-5 pb-10">
              <div ref={containerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};
export default SubscriptionPage;
