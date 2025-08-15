import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const RecursosModal = ({ fila, items, tipoRecurso: tipoRecursoProp, onClose }) => {
  const [mostrarModal, setMostrarModal] = useState(true);
  const [tipoRecurso, setTipoRecurso] = useState(tipoRecursoProp || (items[0]?.valor || null));

  // Sincronizar estado interno con la prop tipoRecursoProp cuando cambia
  useEffect(() => {
    setTipoRecurso(tipoRecursoProp);
  }, [tipoRecursoProp]);

  const cerrarModal = () => {
    setMostrarModal(false);
    onClose(); // notifica al padre que se cerró
  };

  const renderContenido = () => {
    const item = items.find((i) => i.valor === tipoRecurso);
    if (item && typeof item.componente === 'function') {
      return item.componente(fila);
    }
    return null;
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={cerrarModal}
      size="xl"
      centered
      scrollable
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {items.find(i => i.valor === tipoRecurso)?.titulo}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderContenido()}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecursosModal;
