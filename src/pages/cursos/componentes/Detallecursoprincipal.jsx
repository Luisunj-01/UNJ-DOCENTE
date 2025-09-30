import React from 'react';
import { FaChalkboardTeacher, FaBook, FaCalendarAlt } from 'react-icons/fa';

// Reutilizamos los mismos colores pastel
const colores = [
  "#A7E1F7", "#B8F7B0", "#FFE28A",
  "#FFB5B5", "#D6C2FF", "#FFC785",
  "#A2E8DD", "#FFEB99"
];

const Detallecursoprincipal = ({ datos }) => {
  if (!datos) return null;

  // Selección aleatoria de color (o podrías usar lógica indexada según curso ID)
  const color = colores[Math.floor(Math.random() * colores.length)];

  return (
    <div className="d-flex">
      <div className="card  border-0 rounded-4" style={{ width: '100%'}}>
        
        {/* Encabezado colorido */}
        <div
          style={{
            backgroundColor: color,
            padding: '3.5rem 1rem',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.3rem',
            borderRadius: '1.5rem',
            margin: '1rem',
          }}
        >
          <FaBook className="me-2" />
          Bienvenido al curso:
          <div className="mt-2 text-dark" style={{ fontSize: '1.6rem' }}>
            {datos.nombrecurso}
          </div>
        </div>

        {/* Cuerpo del card */}
        <div className="card-body text-center px-4">
          <p className="mb-3 fs-5">
            <FaChalkboardTeacher className="me-2 text-primary" />
            Docente: <strong>{datos.nombredocente}</strong>
          </p>

          <p className="mb-3">
            <FaCalendarAlt className="me-2 text-secondary" />
            Sección: <strong>{datos.seccion}</strong> | Código Curso: <strong>{datos.curso}</strong>
          </p>

          <div className="alert alert-info mt-4 rounded-3">
            Este espacio está diseñado para brindarte todos los <strong>recursos</strong>,
            <strong> materiales</strong> y <strong>acompañamiento</strong> necesarios para que tengas un excelente desarrollo académico. 🎯📚
            <br />¡Mucho éxito!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detallecursoprincipal;
