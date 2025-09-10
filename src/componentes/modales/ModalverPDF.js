// src/components/ModalPDF.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalPDFver = ({ show, onHide, url, titulo }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
        
      </Modal.Header>
      <Modal.Body style={{ height: '80vh' }}>
        {url ? (
          <iframe
            src={url}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        ) : (
          <div className="text-center">No se pudo cargar el PDF</div>
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

export default ModalPDFver;
