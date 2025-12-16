// src/componentes/PdfViewer.jsx
import React from 'react';

const PdfViewer = ({ url }) => {
  if (!url) {
    return <p className="text-center text-muted mt-3">PDF no disponible.</p>;
  }

  // cache busting
  const finalUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;

  return (
    <div style={{ width: '100%', height: '80vh' }}>
      {/* 1) object */}
      <object
        data={finalUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        {/* 2) embed */}
        <embed
          src={finalUrl}
          type="application/pdf"
          width="100%"
          height="100%"
        />

        {/* 3) fallback final */}
        <div className="text-center p-3">
          No se pudo mostrar el PDF aquí.&nbsp;
          <a href={url} target="_blank" rel="noreferrer">
            Abrir en nueva pestaña
          </a>
        </div>
      </object>
    </div>
  );
};

export default PdfViewer;
