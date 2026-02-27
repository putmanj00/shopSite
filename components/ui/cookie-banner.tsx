"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('wildenflower_cookie_consent');
    if (!consent) setShow(true);
  }, []);

  const handleConsent = (choice: 'accepted' | 'rejected') => {
    localStorage.setItem('wildenflower_cookie_consent', choice);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#F5EDD6] border-t border-[#8B7355] text-[#3e2723] shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          We use cookies to improve your experience. See our <Link href="/legal/privacy-policy" className="underline font-semibold hover:text-[#2d5a27]">Privacy Policy</Link> for details.
        </p>
        <div className="flex gap-4">
          <button onClick={() => handleConsent('rejected')} className="text-sm px-4 py-2 border border-[#8B7355] rounded hover:bg-[#eae0c8] transition-colors">
            Refuse
          </button>
          <button onClick={() => handleConsent('accepted')} className="text-sm px-6 py-2 bg-[#1E3B30] text-white rounded hover:bg-[#2d5a27] transition-colors">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
