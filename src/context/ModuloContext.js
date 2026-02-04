import { createContext, useContext, useState } from 'react';

const ModuloContext = createContext();

export function ModuloProvider({ children }) {
  const [moduloActual, setModuloActual] = useState(null);

  return (
    <ModuloContext.Provider value={{ moduloActual, setModuloActual }}>
      {children}
    </ModuloContext.Provider>
  );
}

export function useModulo() {
  const context = useContext(ModuloContext);
  if (!context) {
    throw new Error('useModulo debe usarse dentro de ModuloProvider');
  }
  return context;
}
