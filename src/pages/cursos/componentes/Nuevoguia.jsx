import React, { useState } from "react";

const NuevoGuia = ({datoscurso, semana}) => {
  const [mostrarModal, setMostrarModal] = useState(false);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  const guardarGuia = (datos) => {
    console.log("Datos guardados:", datos);
    // aquí puedes llamar a tu API o lógica para guardar en BD
    cerrarModal();
  };

  return (
    <div>
      {/* Botón para abrir el modal */}
      <button className="btn btn-primary" onClick={abrirModal}>
        Nuevo Guía
      </button>

      {/* Modal de creación de guía */}
      
    </div>
  );
};

export default NuevoGuia;
