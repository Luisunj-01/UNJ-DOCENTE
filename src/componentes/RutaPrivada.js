// src/componentes/RutaPrivada.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaPrivada = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaPrivada;
