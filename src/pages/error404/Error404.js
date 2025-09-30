// src/pages/Error404.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../resource/Error404.css'; // Asegúrate de agregar los estilos

const Error404 = () => {
  return (
    <div className="error-container">
    <img alt="Logo UNJ" draggable="false" src="/image/logo/logo-unj-v1.svg"></img>
      <div className="error-code">404</div>
      <div className="error-message">¡Oops! Página no encontrada</div>
      <p className="error-description">
        Es posible que la ruta no exista o que necesites iniciar sesión.
      </p>
      <Link to="/" className="btn-home">
        Volver al inicio
      </Link>
    </div>
  );
};

export default Error404;
