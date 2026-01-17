import { useState, useEffect } from 'react';

// Hook personalizado para aplicar debounce a un valor (como un input)
const useDebounce = (value, delay = 1000) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Temporizador que actualiza el valor después del retardo
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el temporizador si el valor cambia antes del delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
