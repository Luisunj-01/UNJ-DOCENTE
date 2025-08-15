// src/components/ModalPDF.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalPDF = ({ show, onHide, componente, titulo }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
        
      </Modal.Header>
      <Modal.Body style={{ height: '80vh' }}>
        {componente}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPDF;
