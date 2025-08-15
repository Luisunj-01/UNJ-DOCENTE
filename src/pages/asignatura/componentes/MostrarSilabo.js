import React, { useState } from 'react';
import ModalPDF from './ModalPDF';
import Docentesilabo from './Docentesilabo';

const MostrarSilabo = ({ fila, semestre }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [urlPDF, setUrlPDF] = useState(null);
  const [renderKey, setRenderKey] = useState(Date.now());

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  return (
    <div>
      <button className="btn btn-primary" onClick={abrirModal}>
        Ver sílabo
      </button>

      <ModalPDF
        show={mostrarModal}
        onHide={cerrarModal}
        titulo="Sílabo"
        componente={
          <Docentesilabo
            fila={fila}
            semestre={semestre}
            urlPDF={urlPDF}
            setUrlPDF={setUrlPDF}
            renderKey={renderKey}
            setRenderKey={setRenderKey}
          />
        }
      />
    </div>
  );
};

export default MostrarSilabo;



