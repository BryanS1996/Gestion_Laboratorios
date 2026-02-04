import { useState, useEffect } from 'react';

// Custom hook for debouncing values such as search inputs
const useDebounce = (value, delay = 1000) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes before the delay expires
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
