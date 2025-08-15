import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../../resource/efectos.css";

const colores = [
  "#A7E1F7", "#B8F7B0", "#FFE28A",
  "#FFB5B5", "#D6C2FF", "#FFC785",
  "#A2E8DD", "#FFEB99"
];

const ListCursos = ({ cursos, nombredocente }) => {

  return (
    <div className="row">
      {cursos.map((curso, index) => {
        const color = colores[index % colores.length];
        const cursoData = `${curso.sede}|${curso.semestre}|${curso.estructura}|${curso.curricula}|${curso.curso}|${curso.seccion}|${curso.nombre}|${nombredocente   }`;
        const idBase64 = btoa(btoa(cursoData));

        return ( 
          <div key={curso.curso + curso.seccion} className="col-md-4 mb-4">
            <Link
              to={`/curso/detalle_curso/${idBase64}`}
              state={{ cursoSeleccionado: curso }}
              className="text-decoration-none text-dark"
            >
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative card-hover">
                
                {/* Parte superior con fondo color dinámico */}
                <div
                  style={{
                    backgroundColor: color,
                    padding: "3.5rem 1rem",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    margin: "9px",
                    borderRadius: "12px",
                  }}
                >
                  {curso.nombre}
                </div>

                {/* Icono "siguiente" flotante */}
                <div
                  className="position-absolute translate-middle-y"
                  style={{
                    right: "-16px",
                    top: "27%",
                    background: "white",
                    borderRadius: "50%",
                    padding: "10px",
                    boxShadow: "rgb(0 0 0 / 12%) 0px 0px 8px",
                  }}
                >
                  <img
                    src="/image/iconos/icon-siguiente.svg"
                    alt="Siguiente"
                    style={{ width: "20px", height: "20px" }}
                  />
                </div>

                {/* Cuerpo del card */}
                <Card.Body className="px-3 py-3">

                  <div className="row align-items-center mb-2">
                    <div className="col-10">
                      <strong>Carrera:</strong><br />
                      <span className="text-muted small">{curso.descripcionescuela}</span>
                    </div>
                    <div className="col-2 text-end">
                      <img
                        src="/image/iconos/icon-docente.svg"
                        alt="Docente"
                        style={{ width: "30px" }}
                      />
                    </div>
                  </div>

                  <hr className="my-2" style={{ width: "74%" }} />

                  <div className="row mb-2">
                    <div className="col-8">
                      <div className="d-flex justify-content-between small">
                        <span><strong>Cód:</strong> {curso.curso}</span>
                        <span><strong>Sec:</strong> {curso.seccion}</span>
                        <span><strong>Créd:</strong> {curso.creditos}</span>
                      </div>
                    </div>
                  </div>

                </Card.Body>
              </Card>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ListCursos;
