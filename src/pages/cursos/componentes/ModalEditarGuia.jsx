import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import config from "../../../config";

function ModalEditarGuia({ show, onClose, fila, datoscursos, onUpdated }) {
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

  // Cargar datos de la guía seleccionada
        useEffect(() => {
        if (fila && show) {
          setFormData({
            semana: fila.semana || "",
            contenido: fila.contenido || "",
            observacion: fila.observacion || "",
            claseSincrona: fila.clasesincrona || "",
            claseGrabada: fila.clasegrabada || "",
            fecha: fila.fecha ? fila.fecha.split("T")[0] : "",
            horaEntrada: fila.horaentrada || "",
            horaSalida: fila.horasalida || "",
            concluida: fila.concluido === 1 ? true : false,
          });
        }
      }, [fila, show]);


  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Guardar cambios
  const handleSave = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}api/curso/ActualizarGuia`, {
        ...datoscursos,
        ...formData,
        concluido: formData.concluida ? "1" : "0",
      });

      if (!response.data.error) {
        Swal.fire("✅ Éxito", response.data.mensaje, "success");
        onUpdated(); // refresca tabla
        onClose(); // cierra modal
      } else {
        Swal.fire("Error", response.data.mensaje, "error");
      }
    } catch (error) {
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
            <Form.Control type="text" name="semana" value={formData.semana} readOnly />
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
            <Form.Label>Observación</Form.Label>
            <Form.Control
              type="text"
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Clase síncrona</Form.Label>
            <Form.Control
              type="text"
              name="claseSincrona"
              value={formData.claseSincrona}
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

          <Form.Group>
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Hora entrada</Form.Label>
            <Form.Control
              type="time"
              name="horaEntrada"
              value={formData.horaEntrada}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Hora salida</Form.Label>
            <Form.Control
              type="time"
              name="horaSalida"
              value={formData.horaSalida}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="concluida">
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
