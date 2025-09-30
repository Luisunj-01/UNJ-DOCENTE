// hooks/useInactividad.js
import { useEffect, useRef } from 'react';

export default function useInactividad(callback, tiempoInactividad = 210000060000) {
  const timerRef = useRef(null);

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(callback, tiempoInactividad);
    };

    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    eventos.forEach(evento => window.addEventListener(evento, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      eventos.forEach(evento =>
        window.removeEventListener(evento, resetTimer)
      );
    };
  }, [callback, tiempoInactividad]);
}
