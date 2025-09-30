// src/pages/Construccion.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../resource/Error404.css'; // Puedes reutilizar los estilos

const Tutoria = () => {
  return (
    <div className="error-container">
      {/*<img 
        alt="Logo UNJ" 
        draggable="false" 
        src="/image/logo/logo-unj-v1.svg"
      /> */}
      <div className="error-code">🚧</div>
      <div className="error-message">¡Página en construcción!</div>
      <p className="error-description">
        Estamos trabajando en esta sección. Pronto estará disponible.
      </p>
      <Link to="/" className="btn-home">
        Volver al inicio
      </Link>
    </div>
  );
};

export default Tutoria;
