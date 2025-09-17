// src/components/ModalPDF.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalPDF = ({ show, onHide, componente, titulo }) => {
  console.log(componente);
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
        
      </Modal.Header>
      <Modal.Body style={{ height: '80vh' }}>
         {componente ? (
          <iframe
            src={componente}
            style={{ width: '100%', height: '100%' }}
            frameBorder="0"
            title={titulo}
          />
        ) : (
          <p className="text-center text-muted">PDF no disponible.</p>
        )}
        
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
