// src/pages/administracion/componentes/Datosacademicos.js

import { useState, useEffect } from "react";
import { obtenerConfiguracion } from "../../reutilizables/logica/docente";
import { Col, Table } from "react-bootstrap";

function Datosacademicos({ datos = [] }) {
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenUrl, setImagenUrl] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const [nombrecategoria, setNombrecategoria] = useState(null);
  const [nombredpacademco, setNombredpacademco] = useState(null);

  // ============================
  // Cargar foto cuando cambia docente
  // ============================
  useEffect(() => {
    if (datos.docente) {
      const timestamp = Date.now();
      setImagenUrl(
        `https://pydrsu.unj.edu.pe/resourcedocente/${datos.docente}.jpg?${timestamp}`
      );
    }
    getdatos();
  }, [datos.docente]);

  // ============================
  // Subir imagen al servidor
  // ============================
  const handleImagenUpload = async () => {
    if (!archivoSeleccionado) return;

    const formData = new FormData();
    formData.append("foto", archivoSeleccionado);
    formData.append("codigo", datos.docente);

    try {
      const response = await fetch(
        "https://pydrsu.unj.edu.pe/recibirfotodocente.php",
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Imagen subida con éxito");

        // Actualizamos la foto sin recargar
        const timestamp = Date.now();
        setImagenUrl(
          `https://pydrsu.unj.edu.pe/resourcedocente/${datos.docente}.jpg?${timestamp}`
        );

        setArchivoSeleccionado(null);
        setImagenPreview(null);
      } else {
        alert("Error al subir imagen: " + data.error);
      }
    } catch (error) {
      alert("Error de conexión al subir la imagen");
    }
  };

  // ============================
  // Cargar textos extra
  // ============================
  const getdatos = async () => {
    const nombrecategoria = await obtenerConfiguracion("categoriadocente", {
      categoria: datos.categoria,
    });
    const nombredpacademco = await obtenerConfiguracion(
      "departamentoacademico",
      { namedepart: datos.departamentoacademico }
    );

    setNombrecategoria(nombrecategoria);
    setNombredpacademco(nombredpacademco);
  };

  return (
    <div className="row">
      {/* ========================================= */}
      {/* COLUMNA DE DATOS */}
      {/* ========================================= */}
      <Col md={9}>
        <Table responsive>
          <tbody>
            <tr><th>Código</th><td>{datos.docente}</td></tr>
            <tr><th>A. Paterno</th><td>{datos.apellidopaterno}</td></tr>
            <tr><th>A. Materno</th><td>{datos.apellidomaterno}</td></tr>
            <tr><th>Primer Nombre</th><td>{datos.primernombre}</td></tr>
            <tr><th>Segundo Nombre</th><td>{datos.segundonombre}</td></tr>

            <tr>
              <th>Categoria</th>
              <td>{nombrecategoria ?? "No disponible"}</td>
            </tr>

            <tr><th>Condición</th><td>ORDINARIO</td></tr>

            <tr>
              <th>Dedicación</th>
              <td>
                {datos.dedicacion === "02"
                  ? "TIEMPO COMPLETO"
                  : datos.dedicacion}
              </td>
            </tr>

            <tr>
              <th>Dpto. Académico</th>
              <td>{nombredpacademco ?? "No disponible"}</td>
            </tr>

            <tr>
              <th>Grado</th>
              <td>
                {datos.grado === "02"
                  ? "MAGISTER"
                  : datos.grado}
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>

      {/* ========================================= */}
      {/* COLUMNA DE IMAGEN */}
      {/* ========================================= */}
      <div className="col-md-3 text-center mb-3">
        {/* Foto */}
        <img
          src={imagenPreview || imagenUrl}
          alt="Foto del Docente"
          className="img-thumbnail"
          style={{ width: "150px", height: "180px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = `https://pruebas.unj.edu.pe/zetunajaen/imagesdocente/${datos.numerodocumento}.jpg`;
          }}
        />

        {/* Input seleccionar archivo */}
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => {
              const archivo = e.target.files[0];
              if (!archivo) return;

              // Vista previa inmediata
              const preview = URL.createObjectURL(archivo);
              setImagenPreview(preview);

              // Guardar archivo
              setArchivoSeleccionado(archivo);
            }}
          />
        </div>

        {/* Botón subir */}
        {archivoSeleccionado && (
          <button
            onClick={handleImagenUpload}
            className="btn btn-primary btn-sm mt-2"
          >
            Subir imagen
          </button>
        )}
      </div>
    </div>
  );
}

export default Datosacademicos;
