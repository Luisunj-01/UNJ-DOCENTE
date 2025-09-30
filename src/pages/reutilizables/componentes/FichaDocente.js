// src/componentes/FichaDocente.js
import React from 'react';

function FichaDocente({ datos, tipoVista }) {
  if (!datos) return <p>No hay datos disponibles del Docente.</p>;

  const fotoUrl = `https://pruebas.unj.edu.pe/zetunajaen/imagesalumno/${datos.codigo}.jpg`;

  // === Vista FICHA MATRÍCULA ===
  if (tipoVista === 'matricula') {
    return (
      <table className="table">
        <tbody>
          <tr>
            <td><strong>Sede</strong></td>
            <td>{datos.sede}</td>
            <td colSpan="2"></td>
            <td rowSpan="4" width="12%">
              <img src={fotoUrl} alt="foto" width="100%" />
            </td>
          </tr>
          <tr>
            <td><strong>Carrera:</strong></td>
            <td>{datos.carrera} ({datos.curricula})</td>
            <td><strong>Sem. Anterior:</strong></td>
            <td>{datos.semestreAnterior} <strong>Prom: {datos.promedio}</strong></td>
          </tr>
          <tr>
            <td><strong>Código:</strong></td>
            <td>{datos.alumno}</td>
            <td><strong>Cred. Dis:</strong></td>
            <td>{datos.creditosDisponibles}</td>
          </tr>
          <tr>
            <td><strong>Alumno:</strong></td>
            <td>{datos.nombre}</td>
            <td><strong>Ciclo:</strong></td>
            <td>{datos.ciclo}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  // === Vista REPORTE DOCENTE ===
  if (tipoVista === 'reporte') {
    return (
      <table className="table">
        <tbody>
          <tr>
            <td width="8%"><strong>Escuela:</strong></td>
            <td>{datos.sede}</td>
            <td rowSpan="6" width="15%" align="center" valign="center">
              <img src={fotoUrl} alt="foto" width="100%" />
            </td>
          </tr>
          <tr>
            <td><strong>Código:</strong></td>
            <td>{datos.codigo}</td>
          </tr>
          <tr>
            <td><strong>Nombres:</strong></td>
            <td>{datos.nombre}</td>
          </tr>
          <tr>
            <td><strong>Sesion:</strong></td>
            <td>{datos.carrera}</td>
          </tr>
          <tr>
            <td><strong>Semestre:</strong></td>
            <td>{datos.curricula}</td>
          </tr>
         
        </tbody>
      </table>
    );
  }

  return <div>Vista no definida</div>;
}

export default FichaDocente;
