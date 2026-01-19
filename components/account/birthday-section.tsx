'use client';

import { useState } from 'react';

interface BirthdaySectionProps {
  birthday?: string | null;
  onSave?: (birthday: string) => Promise<void>;
}

export default function BirthdaySection({ birthday: initialBirthday, onSave }: BirthdaySectionProps) {
  const [isEditing, setIsEditing] = useState(!initialBirthday);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedBirthday, setSavedBirthday] = useState(initialBirthday);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!month || !day) {
      setError('Please select both month and day');
      return;
    }

    const birthdayString = `${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(birthdayString);
      }
      setSavedBirthday(birthdayString);
      setIsEditing(false);
    } catch {
      setError('Failed to save birthday');
    } finally {
      setIsSaving(false);
    }
  };

  const formatBirthday = (bd: string) => {
    const [m, d] = bd.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
  };

  const daysInMonth = (monthNum: number) => {
    if (!monthNum) return 31;
    const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[monthNum - 1];
  };

  if (savedBirthday && !isEditing) {
    return (
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Birthday</h4>
              <p className="text-lg font-semibold text-pink-600">{formatBirthday(savedBirthday)}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Edit
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-pink-200">
          <p className="text-sm text-gray-600">
            🎁 You&apos;ll receive a special birthday discount each year!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Add Your Birthday</h4>
          <p className="text-sm text-gray-600">Get a special discount on your birthday!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label htmlFor="birthday-month" className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              id="birthday-month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Select month</option>
              {['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="birthday-day" className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>
            <select
              id="birthday-day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Select day</option>
              {Array.from({ length: daysInMonth(parseInt(month, 10)) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Birthday'}
          </button>
          {savedBirthday && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
