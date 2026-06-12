'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchStore } from '@/lib/search-store';
import PredictiveSearchResults, { type SearchResult } from '@/components/search/predictive-search-results';
import { trackGAEvent } from '@/components/analytics';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search products...',
  debounceMs = 300,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useSearchStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fetch predictive results
  const fetchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/predictive?q=${encodeURIComponent(query)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search for both parent onSearch and predictive results
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Propagate change to parent
      onChange(inputValue);

      // Fetch predictive results if we have enough characters
      if (inputValue.length >= 2) {
        fetchResults(inputValue);
      } else {
        setResults([]);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, debounceMs, onChange, fetchResults]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      addRecentSearch(inputValue);
      onSearch(inputValue);
      setIsOpen(false);
      trackGAEvent('search', 'user_interaction', inputValue);
    }
  };

  const handleSelectTerm = (term: string) => {
    setInputValue(term);
    addRecentSearch(term);
    onSearch(term);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setResults([]);
    // We keep dropdown open to show recent searches
    setIsOpen(true);
    // Trigger onSearch with empty string if desired, or wait for user
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    // @ts-expect-error - SpeechRecognition types are not standard yet
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceListening(true);
    };

    interface ISpeechRecognitionEvent {
      results: { [key: number]: { [key: number]: { transcript: string } } };
    }

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSelectTerm(transcript);
    };

    recognition.onerror = (event: Error) => {
      console.error('Voice search error', event);
      setIsVoiceListening(false);
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };

    recognition.start();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="search-input" className="sr-only">
          Search products
        </label>

        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-earth/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          id="search-input"
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={isVoiceListening ? "Listening..." : placeholder}
          className={`block w-full pl-10 pr-20 min-h-11 border rounded-lg bg-cream focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${isVoiceListening ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50' : 'border-gold/30'
            }`}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-earth/40 hover:text-earth rounded-full hover:bg-parchment"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2 rounded-full transition-colors ${isVoiceListening
              ? 'text-red-500 bg-red-100 animate-pulse'
              : 'text-earth/40 hover:text-primary-600 hover:bg-parchment'
              }`}
            aria-label="Voice search"
            title="Search by voice"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Predictive Results Dropdown */}
      <PredictiveSearchResults
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        results={results}
        query={inputValue}
        isLoading={isLoading}
        recentSearches={recentSearches}
        onClearRecent={removeRecentSearch}
        onClearAllRecent={clearRecentSearches}
        onSelectTerm={handleSelectTerm}
      />
    </div>
  );
}
