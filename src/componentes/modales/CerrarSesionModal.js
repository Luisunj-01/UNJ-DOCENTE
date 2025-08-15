// src/componentes/modales/CerrarSesionModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
 
function CerrarSesionModal({ show, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>¿Deseas cerrar sesión?</Modal.Title>
      </Modal.Header>
      <Modal.Body>Estás a punto de salir del sistema.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          No
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Sí, cerrar sesión
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CerrarSesionModal;