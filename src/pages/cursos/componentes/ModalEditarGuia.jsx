import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import config from "../../../config";
import { useUsuario } from "../../../context/UserContext";

function ModalEditarGuia({ show, onClose, fila, datoscursos, onUpdated }) {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const [formData, setFormData] = useState({
    semana: "",
    contenido: "",
    observacion: "",
    claseSincrona: "",
    claseGrabada: "",
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    concluida: false,
  });

  // 🔹 Fechas adicionales ahora son objetos { fecha, hora_entrada, hora_salida }
  const [fechasAdicionales, setFechasAdicionales] = useState([]);

  function convertDateSlashToISO(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (fila && show) {
      setFormData({
        semana: fila.semana || "",
        contenido: fila.contenido || "",
        observacion: fila.observacion || "",
        claseGrabada: fila.clasegrabada || "",
        fecha: fila.fecha ? convertDateSlashToISO(fila.fecha) : "",
        horaEntrada: fila.horaentrada || "",
        horaSalida: fila.horasalida || "",
        concluida: fila.concluido === 1 ? true : false,
      });

      // 🔹 Parsear fechas adicionales
      if (fila.fechas_adicionales) {
        try {
          const parsed = JSON.parse(fila.fechas_adicionales);
          setFechasAdicionales(parsed);
        } catch {
          setFechasAdicionales([]);
        }
      } else {
        setFechasAdicionales([]);
      }
    }
  }, [fila, show]);

  // Manejo de inputs normales
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔹 Manejar cambios en fechas adicionales
  const handleFechaChange = (index, field, value) => {
    const nuevasFechas = [...fechasAdicionales];
    nuevasFechas[index][field] = value;
    setFechasAdicionales(nuevasFechas);
  };

  // 🔹 Agregar nueva fecha con estructura completa
  const agregarFecha = () => {
    setFechasAdicionales([
      ...fechasAdicionales,
      { fecha: "", hora_entrada: "", hora_salida: "" },
    ]);
  };

  // 🔹 Eliminar fecha
  const eliminarFecha = (index) => {
    const nuevasFechas = fechasAdicionales.filter((_, i) => i !== index);
    setFechasAdicionales(nuevasFechas);
  };

  // Guardar cambios
  // Guardar cambios
  const handleSave = async () => {
    const payload = {
      sede: datoscursos.sede,
      semestre: datoscursos.semestre,
      escuela: datoscursos.escuela,
      curricula: datoscursos.curricula,
      curso: datoscursos.curso,
      seccion: datoscursos.seccion,
      semana: formData.semana,
      observacion: formData.observacion,
      contenido: formData.contenido,
      clasegrabada: formData.claseGrabada,
      // 🔹 Fecha principal independiente
      fecha: formData.fecha,
      horaentrada: formData.horaEntrada,
      horasalida: formData.horaSalida,
      // 🔹 Estado concluido
      concluido: formData.concluida ? "1" : "0",
      // 🔹 Fechas adicionales
      fechas_adicionales: fechasAdicionales.map(f => ({
        fecha: f.fecha,
        hora_entrada: f.hora_entrada || "",
        hora_salida: f.hora_salida || ""
      }))
    };

    console.log("📦 Payload enviado:", JSON.stringify(payload, null, 2));
    try {
      const response = await axios.post(`${config.apiUrl}api/curso/ActualizarGuia`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.error) {
        Swal.fire("✅ Éxito", response.data.mensaje, "success");
        onUpdated();
        onClose();
      } else {
        Swal.fire("Error", response.data.mensaje, "error");
      }
    } catch (error) {
      console.error("❌ Error al actualizar la guía:", error);
      Swal.fire("Error", "No se pudo actualizar la guía", "error");
    }
  };


  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Modificar Guía</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Semana</Form.Label>
            <Form.Control
              type="text"
              name="semana"
              value={formData.semana}
              readOnly
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Contenido</Form.Label>
            <Form.Control
              type="text"
              name="contenido"
              value={formData.contenido}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Clase síncrona</Form.Label>
            <Form.Control
              type="text"
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Clase grabada</Form.Label>
            <Form.Control
              type="text"
              name="claseGrabada"
              value={formData.claseGrabada}
              onChange={handleChange}
            />
          </Form.Group>

          {/* 🔹 Fecha + Hora entrada + Hora salida en la misma fila */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha principal</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  name="horaEntrada"
                  value={formData.horaEntrada}
                  onChange={handleChange}
                  placeholder="Hora entrada"
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  name="horaSalida"
                  value={formData.horaSalida}
                  onChange={handleChange}
                  placeholder="Hora salida"
                />
              </Col>
            </Row>
          </Form.Group>

          {/* 🔹 Sección de Fechas Adicionales */}
          <Form.Group>
            <Form.Label>Fechas adicionales</Form.Label>
            {fechasAdicionales.map((fechaObj, index) => (
              <Row key={index} className="mb-2">
                <Col>
                  <Form.Control
                    type="date"
                    value={fechaObj.fecha}
                    onChange={(e) =>
                      handleFechaChange(index, "fecha", e.target.value)
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={fechaObj.hora_entrada}
                    onChange={(e) =>
                      handleFechaChange(index, "hora_entrada", e.target.value)
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={fechaObj.hora_salida}
                    onChange={(e) =>
                      handleFechaChange(index, "hora_salida", e.target.value)
                    }
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarFecha(index)}
                  >
                    ✕
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="primary" size="sm" onClick={agregarFecha}>
              + Agregar fecha
            </Button>
          </Form.Group>

          <Form.Group controlId="concluida" className="mt-3">
            <Form.Check
              type="checkbox"
              label="Concluida"
              name="concluida"
              checked={formData.concluida}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="success" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEditarGuia;
