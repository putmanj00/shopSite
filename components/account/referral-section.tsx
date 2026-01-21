'use client';

import { useState } from 'react';

interface ReferralSectionProps {
  referralCode?: string;
  referralCount?: number;
  totalEarned?: number;
}

export default function ReferralSection({
  referralCode = 'FRIEND20',
  referralCount = 0,
  totalEarned = 0,
}: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${referralCode}`
    : `https://example.com?ref=${referralCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending invite
    setInviteSent(true);
    setEmail('');
    setTimeout(() => setInviteSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{referralCount}</p>
          <p className="text-sm text-primary-800">Friends Referred</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">${totalEarned}</p>
          <p className="text-sm text-green-800">Credit Earned</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">How it works</h4>
        <ol className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white text-sm font-medium rounded-full flex items-center justify-center">1</span>
            <span className="text-sm text-gray-600">Share your unique referral code or link</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white text-sm font-medium rounded-full flex items-center justify-center">2</span>
            <span className="text-sm text-gray-600">Your friend gets 20% off their first order</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white text-sm font-medium rounded-full flex items-center justify-center">3</span>
            <span className="text-sm text-gray-600">You get $15 store credit when they purchase</span>
          </li>
        </ol>
      </div>

      {/* Referral Code */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Your Referral Code
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-lg tracking-wider text-center" aria-label="Referral code">
            {referralCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Link */}
      <div>
        <label htmlFor="share-link" className="block text-sm font-medium text-gray-700 mb-2">
          Share Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="share-link"
            readOnly
            value={referralLink}
            className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Email Invite */}
      <div>
        <label htmlFor="referral-email" className="block text-sm font-medium text-gray-700 mb-2">
          Invite by Email
        </label>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            id="referral-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Send
          </button>
        </form>
        {inviteSent && (
          <p className="text-sm text-green-600 mt-2">Invitation sent!</p>
        )}
      </div>

      {/* Social Share */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Share on Social
        </p>
        <div className="flex gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
            aria-label="Share on Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
            </svg>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Get 20% off your first order at Wildenflower! Use my referral code: ${referralCode}`)}&url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-black text-white rounded-lg hover:opacity-90 transition-opacity"
            aria-label="Share on X"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent('Get 20% off at Wildenflower!')}&body=${encodeURIComponent(`I thought you might like Wildenflower! Use my referral code ${referralCode} to get 20% off your first order: ${referralLink}`)}`}
            className="p-3 bg-gray-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            aria-label="Share via Email"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
