import React, { useState, useEffect } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import ModalPDF from '../../../componentes/modales/ModalPDF';
import Docentesilabo from '../docentesilabo';

// Botón visual
const BotonSubirPDF = ({ onClick, titulo, activo }) => (
  <button
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()} // evita flash de focus
    className={`btn btn-sm d-flex align-items-center gap-1 ${
      activo ? "btn-primary" : "btn-outline-secondary"
    }`}
    title="Subir PDF"
    style={{ border: 'none' }}
  >
    <FaFilePdf fontSize={18} />
    <span style={{ fontSize: '0.8rem' }}>{titulo}</span>
  </button>
);

const BotonPDF = ({ fila, semestre, escuela, token, titulo, semana, ruta, tipo }) => {
  const [urlPDF, setUrlPDF] = useState(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [renderKey, setRenderKey] = useState(Date.now());

  // 👀 Revisar si ya existe archivo al montar
  useEffect(() => {
    if (fila && semestre) {
      const cursoSinGuion = fila?.curso?.replace('-', '') || '';
      const nombre = (tipo === 'guia' || tipo === 'trabajo' || tipo === 'material')
        ? `${fila?.sede || ''}${semestre}${fila?.estructura || ''}${fila?.curricula || ''}${cursoSinGuion}${fila?.seccion || ''}${semana || ''}.pdf`
        : `${fila?.sede || ''}${semestre}${fila?.estructura || ''}${fila?.curricula || ''}${cursoSinGuion}${fila?.seccion || ''}.pdf`;

      const rutaCompleta = `https://pruebas.unj.edu.pe/zetunajaen/${ruta}/${nombre}`;
      const finalUrl = `${rutaCompleta}?t=${Date.now()}`;
      setUrlPDF(finalUrl);
      setRenderKey(Date.now());
      setHasUploaded(true); // 🔵 arranca en azul si ya existe archivo
    }
  }, [fila, semestre, ruta, tipo, semana]);

  const handleUploadConfirm = (newUrl) => {
    setUrlPDF(newUrl);
    setHasUploaded(true); // 🔵 permanece azul al actualizar
  };

  return (
    <>
      <BotonSubirPDF 
        onClick={() => setMostrarModal(true)} 
        titulo={titulo} 
        activo={hasUploaded} 
      />

      <ModalPDF
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        componente={
          <Docentesilabo
            fila={fila}
            semestre={semestre}
            escuela={escuela}
            urlPDF={urlPDF}
            setUrlPDF={setUrlPDF}
            renderKey={renderKey}
            setRenderKey={setRenderKey}
            ruta={ruta}
            tipo={tipo}
            semana={semana}
            onUpload={handleUploadConfirm}
          />
        }
        titulo={titulo}
      />
    </>
  );
};

export default BotonPDF;
