import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const COOKIE_CONSENT_KEY = 'cookieAccepted';

const CookieConsentBar: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState<boolean>(false);

  useEffect(() => {
    const cookieAccepted = Cookies.get(COOKIE_CONSENT_KEY);
    if (cookieAccepted === 'true') {
      setConsentGiven(true);
    }
  }, []);

  const handleAccept = () => {
    setConsentGiven(true);
    Cookies.set(COOKIE_CONSENT_KEY, 'true', { expires: 365 });
    localStorage.setItem('cookieConsent', 'true');
  };
  const handlePrivacyPolicyClick = () => {
    window.location.href = 'https://adultedpro.com/legal/privacy-policy';
  };

  if (consentGiven) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-black text-white py-4 px-4 flex justify-between items-start z-50"
      style={{ height: '120px' }}
    >
      <span className="flex items-start">
        We use cookies to improve your experience. By using our site, you accept
        cookies. For more information view our
        <span
          onClick={handlePrivacyPolicyClick}
          className="text-blue-500 cursor-pointer ml-1"
        >
          Privacy Policy
        </span>
      </span>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleAccept}
      >
        Accept
      </button>
    </div>
  );
};

export default CookieConsentBar;
