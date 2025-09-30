import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IconButton, Stack } from '@mui/material';

const RecursosDropdown = ({ fila, items }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoRecurso, setTipoRecurso] = useState(null);

  const abrirModal = (tipo) => {
    setTipoRecurso(tipo);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setTipoRecurso(null);
  };

  const renderContenido = () => {
    const item = items.find((i) => i.valor === tipoRecurso);
    if (item && typeof item.componente === 'function') {
      return item.componente(fila); // Pasar la fila al componente
    }
    return null;
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        {items.map((item, index) => (
          <IconButton
            key={index}
            title={item.title}
            onClick={() => abrirModal(item.valor)}
            color="primary"
            size="small"
          >
            {item.icon}
          </IconButton> 
        ))}
      </Stack>

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
            {items.find((i) => i.valor === tipoRecurso)?.titulo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderContenido()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RecursosDropdown;
