import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('usuario');
      if (storedUser) {
        setUsuario(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updated = localStorage.getItem('usuario');
        setUsuario(updated ? JSON.parse(updated) : null);
      } catch (error) {
        console.error('Error parsing updated user data:', error);
        setUsuario(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsuario = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsuario must be used within a UserProvider');
  }
  return context;
};

