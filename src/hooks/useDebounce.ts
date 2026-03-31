/**
 * Debounce Hook
 * =============
 * Custom hook for debouncing slider inputs and other frequent updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 100
): T {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  ) as T;
}

// Specialized hook for slider inputs
export function useSliderDebounce(
  value: number,
  onChange: (value: number) => void,
  delay: number = 150
): [number, (value: number) => void] {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Update local value when prop changes (but not during drag)
    if (timeoutRef.current === undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = useCallback(
    (newValue: number) => {
      // Update immediately for UI responsiveness
      setLocalValue(newValue);

      // Debounce the actual update
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onChange(newValue);
        timeoutRef.current = undefined;
      }, delay);
    },
    [onChange, delay]
  );

  return [localValue, handleChange];
}
