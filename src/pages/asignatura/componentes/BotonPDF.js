import React, { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import ModalPDF from '../../../componentes/modales/ModalPDF';
import Docentesilabo from '../docentesilabo';

// Botón de subir
const BotonSubirPDF = ({ onClick, titulo, activo }) => (
  <button
    onClick={onClick}
    className={`btn btn-sm d-flex align-items-center gap-1 ${
      activo ? "btn-primary" : "btn-secondary"
    }`}
    title="Subir PDF"
    style={{ border: 'none' }}
  >
    <FaFilePdf fontSize={18} />
    <span style={{ fontSize: '0.8rem' }}>{titulo}</span>
  </button>
);

// Contenedor lógico
const BotonPDF = ({ fila, semestre, escuela, token, titulo, semana, ruta, tipo }) => {
  const [urlPDF, setUrlPDF] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [renderKey, setRenderKey] = useState(Date.now());

  return (
    <>
      <BotonSubirPDF
        onClick={() => setMostrarModal(true)}
        titulo={titulo}
        activo={!!urlPDF}
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
            setUrlPDF={setUrlPDF}  // 🔑 actualiza estado aquí
            renderKey={renderKey}
            setRenderKey={setRenderKey}
            ruta={ruta}
            tipo={tipo}
            semana={semana}
          />
        }
        titulo={titulo}
      />
    </>
  );
};

export default BotonPDF;
