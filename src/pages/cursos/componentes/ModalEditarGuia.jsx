import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
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

  function convertDateSlashToISO(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  
  // Cargar datos cuando se abre el modal y se pasa fila
  useEffect(() => {
    if (fila && show) {
      setFormData({
        semana: fila.semana || "",
        contenido: fila.contenido || "",
        observacion: fila.observacion || "",
        //claseSincrona: fila.clasesincrona || "",
        claseGrabada: fila.clasegrabada || "",
        fecha: fila.fecha ? convertDateSlashToISO(fila.fecha) : "",
        //fecha: fila.fecha ? fila.fecha.split("T")[0] : "",
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


  // Guardar cambios (POST al backend)
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
      //clasesincrona: formData.claseSincrona,
      horaentrada: formData.horaEntrada,
      horasalida: formData.horaSalida,
      concluido: formData.concluida ? "1" : "0",
      fecha: formData.fecha,
    };


    
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
        onUpdated(); // Refrescar tabla
        onClose();   // Cerrar modal
      } else {
        Swal.fire(" Error", response.data.mensaje, "error");
      }
    } catch (error) {
      console.error("❌ Error al actualizar la guía:", error);
      Swal.fire("Error", "No se pudo actualizar la guía, Hay campos vacíos para actualizar", "error");
    }
  };



  console.log(formData.fecha);
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
