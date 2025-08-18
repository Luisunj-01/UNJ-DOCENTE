import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import config from "../../../config"; // Ajusta la ruta a tu config
import SemestreSelect from "../../reutilizables/componentes/SemestreSelect";

const NuevoGuia = ({ datoscurso, semana }) => {
  const [semestre, setSemestre] = useState();
  const [formulario, setFormulario] = useState({
    sede: "",
    semestre: "",
    escuela: "",
    curricula: "",
    curso: "",
    seccion: "",
    semana: "",
    observacion: "", // 👈 agregado porque backend lo requiere
    contenido: "",
    claseSincrona: "",
    claseGrabada: "",
    fecha: new Date().toISOString().split("T")[0],
    horaEntrada: "",
    horaSalida: "",
    concluida: false,
  });

  // Cargar datos iniciales cuando cambia datoscurso o semana (sin sobrescribir lo escrito)
  useEffect(() => {
    if (datoscurso) {
      setFormulario((prev) => ({
        ...prev, // mantiene lo que ya escribió el usuario
        sede: datoscurso.sede || prev.sede,
        semestre: datoscurso.semestre || prev.semestre,
        escuela: datoscurso.escuela || prev.escuela,
        curricula: datoscurso.curricula || prev.curricula,
        curso: datoscurso.curso || prev.curso,
        seccion: datoscurso.seccion || prev.seccion,
        semana: semana || prev.semana,
        contenido: datoscurso.contenido || prev.contenido,
        claseSincrona: datoscurso.claseSincrona || prev.claseSincrona,
        claseGrabada: datoscurso.claseGrabada || prev.claseGrabada,
        fecha: datoscurso.fecha
          ? datoscurso.fecha.split("T")[0]
          : prev.fecha,
        horaEntrada: datoscurso.horaEntrada || prev.horaEntrada,
        horaSalida: datoscurso.horaSalida || prev.horaSalida,
        concluida:
          datoscurso.concluida === 1 ? true : prev.concluida,
      }));
    }
  }, [datoscurso, semana]);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Guardar guía (POST a API Laravel)
  const guardarGuia = async () => {
    try {
      const payload = {
        sede: formulario.sede,
        semestre: formulario.semestre,
        escuela: formulario.escuela,
        curricula: formulario.curricula,
        curso: formulario.curso,
        seccion: formulario.seccion,
        semana: formulario.semana,
        observacion: formulario.observacion,
        contenido: formulario.contenido,
        concluido: formulario.concluida ? "1" : "0", // 👈 backend pide string
        fecha: formulario.fecha,
        tipo: "I", // 👈 backend espera "tipo"
      };

      const response = await fetch(`${config.apiUrl}api/GrabarGuia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Guía guardada correctamente");
      } else {
        alert("⚠️ Error: " + data.mensaje);
      }
    } catch (error) {
      console.error("Error al guardar guía:", error);
      alert("❌ Error en el servidor");
    }
  };

  return (
    <div>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Semana</Form.Label>
          <SemestreSelect
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            name="cboSemana"
            parametros={datoscurso}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contenido</Form.Label>
          <Form.Control
            type="text"
            name="contenido"
            value={formulario.contenido}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Observación</Form.Label>
          <Form.Control
            type="text"
            name="observacion"
            value={formulario.observacion}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Clase síncrona</Form.Label>
          <Form.Control
            type="text"
            name="claseSincrona"
            value={formulario.claseSincrona}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Clase grabada</Form.Label>
          <Form.Control
            type="text"
            name="claseGrabada"
            value={formulario.claseGrabada}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={formulario.fecha}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Hora entrada</Form.Label>
          <Form.Control
            type="time"
            name="horaEntrada"
            value={formulario.horaEntrada}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Hora salida</Form.Label>
          <Form.Control
            type="time"
            name="horaSalida"
            value={formulario.horaSalida}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="concluida">
          <Form.Check
            type="checkbox"
            label="Concluida"
            name="concluida"
            checked={formulario.concluida}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" onClick={guardarGuia}>
          Grabar
        </Button>
      </Form>
    </div>
  );
};

export default NuevoGuia;
