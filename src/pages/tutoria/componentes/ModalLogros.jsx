import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import config from "../../../config";
import { useUsuario } from "../../../context/UserContext";
import Swal from "sweetalert2";



export default function ModalLogros({ show, onHide, semestre, persona, vperfil }) {
  const [form, setForm] = useState({
    logro: "",
    dificultad: "",
    recomendacion: ""
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos existentes
  useEffect(() => {
    if (!show) return;

    setLoading(true);

    axios
      .get(`${config.apiUrl}api/Tutoria/obtener-logros/${semestre}/${persona}/${vperfil}`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setForm({
            logro: res.data.data.logro ?? "",
            dificultad: res.data.data.dificultad ?? "",
            recomendacion: res.data.data.recomendacion ?? ""
          });
        }
      })
      .finally(() => setLoading(false));
  }, [show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        semestre,
        persona,
        logro: form.logro,
        dificultad: form.dificultad,
        recomendacion: form.recomendacion
      };

      const res = await axios.post(
        `${config.apiUrl}api/Tutoria/guardar-logros`,
        payload
      );

      if (res.data.success) {
        Swal.fire("Guardado", "Se actualizaron los datos", "success");
        onHide();        // <---- ESTA VEZ SÍ EXISTE
      } else {
        Swal.fire("Error", "No se pudo guardar", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Error inesperado", "error");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Logros, Dificultades y Recomendaciones</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <p><strong>Semestre:</strong> {semestre}</p>

            <Form.Group>
              <Form.Label>Logro</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="logro"
                value={form.logro}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Dificultad</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="dificultad"
                value={form.dificultad}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Recomendación</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="recomendacion"
                value={form.recomendacion}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
