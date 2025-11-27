import { useEffect, useState } from "react";
import { useUsuario } from "../../context/UserContext";
import { obtenerEscuelas, obtenerDetalle } from "./logica/Reportes";
import Swal from "sweetalert2";
import { Modal, Button } from "react-bootstrap";
import config from "../../config";

function ReporteCurricular() {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const [escuelas, setEscuelas] = useState([]);
  const [escuela, setEscuela] = useState("");
  const [tipo, setTipo] = useState("P");
  const [modalShow, setModalShow] = useState(false);
  const [detalle, setDetalle] = useState(null);

  // ======================
  // Cargar escuelas
  // ======================
  useEffect(() => {
    cargarEscuelas();
  }, []);

  const cargarEscuelas = async () => {
    const data = await obtenerEscuelas(token);
    if (data.success) setEscuelas(data.data);
  };

  // ======================
  // Abrir modal con detalle
  // ======================
  const abrirDetalle = async () => {
    if (!escuela) {
      Swal.fire("Error", "Seleccione una escuela", "error");
      return;
    }

    const resp = await obtenerDetalle(token, escuela, tipo);

    if (!resp.success) {
      Swal.fire("Error", resp.message, "error");
      return;
    }

    setDetalle(resp);
    setModalShow(true);
  };

  return (
    <div className="container mt-4">
      <h4>Reportes Curriculares</h4>

      {/* SELECT ESCUELA */}
      <div className="mb-3 col-md-3">
        <label><strong>Escuela Profesional</strong></label>
        <select
          className="form-select"
          value={escuela}
          onChange={(e) => setEscuela(e.target.value)}
        >
          <option value="">-- Seleccione --</option>
          {escuelas.map((e) => (
            <option key={e.estructura} value={e.estructura}>
              {e.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* RADIO TIPO REPORTE */}
      <div className="mb-3">
        <label><strong>Tipo de Reporte</strong></label>
        <div>
          <input
            type="radio"
            name="tipo"
            value="P"
            checked={tipo === "P"}
            onChange={() => setTipo("P")}
          />{" "}
          Plan Curricular
          <br />
          <input
            type="radio"
            name="tipo"
            value="S"
            checked={tipo === "S"}
            onChange={() => setTipo("S")}
          />{" "}
          Equivalencias Simples
        </div>
      </div>

      {/* BOTÓN GENERAR */}
      <button className="btn btn-primary" onClick={abrirDetalle}>
        Generar
      </button>

      {/* ============================= */}
      {/*   MODAL DE DETALLE           */}
      {/* ============================= */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📘 Reporte Curricular</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {detalle && (
            <>
              <p><strong>Reporte:</strong> {detalle.reporte}</p>
              <p><strong>Escuela:</strong> {detalle.escuela}</p>

              <p><strong>Currículas:</strong></p>

              <div className="d-flex flex-wrap gap-2">
                {detalle.curriculas.map((c, i) => (
                <Button
                  key={i}
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
  const url = `${config.apiUrl}api/plancurricular/${escuela}/${c}`;
  window.open(
    url,
    "popup",
    "width=900,height=700,scrollbars=yes,resizable=yes"
  );
}}

                >
                  {c}
                </Button>
              ))}
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ReporteCurricular;
