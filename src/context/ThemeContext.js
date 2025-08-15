import { createContext, useContext, useState, useEffect } from 'react';

// 1. Crear el contexto
const ThemeContext = createContext(null);

// 2. Proveedor del contexto
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Cargar modo desde localStorage al iniciar
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode === 'true';
    setDarkMode(isDark);
    document.body.classList.toggle('dark-mode', isDark);
  }, []);

  // Alternar modo oscuro
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Hook personalizado para usar el contexto
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

