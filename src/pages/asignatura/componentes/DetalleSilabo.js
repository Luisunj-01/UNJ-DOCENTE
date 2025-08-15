import React from 'react';
import { useLocation } from 'react-router-dom';

function DetalleSilabo() {
   
  const location = useLocation();
  const fila = location.state?.fila;
    console.log("Datos recibidos:", fila);
  if (!fila) return <p>No se encontraron datos del sílabo.</p>;
  console.log(fila);
  return (
    <div className="container mt-4">
      <h2>📘 Detalles del Sílabo</h2>
      <table className="table table-bordered">
        <tbody>
          <tr><th>Escuela</th><td>{fila.descripcionescuela}</td></tr>
          <tr><th>Código</th><td>{fila.curso}</td></tr>
          <tr><th>Nombre</th><td>{fila.nombre}</td></tr>
          <tr><th>Sección</th><td>{fila.seccion}</td></tr>
          <tr><th>Semestre</th><td>{fila.semestre}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default DetalleSilabo;

