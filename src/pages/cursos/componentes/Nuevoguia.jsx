import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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
    contenido: "",
    claseSincrona: "",
    claseGrabada: "",
    fecha: new Date().toISOString().split("T")[0],
    horaEntrada: "",
    horaSalida: "",
    concluida: false,
  });

  // Cargar datos iniciales cuando cambia datoscurso o semana
  useEffect(() => {
    if (datoscurso) {
      setFormulario({
        sede: datoscurso.sede || "",
        semestre: datoscurso.semestre || "",
        escuela: datoscurso.escuela || "",
        curricula: datoscurso.curricula || "",
        curso: datoscurso.curso || "",
        seccion: datoscurso.seccion || "",
        semana: semana || "",
        contenido: datoscurso.contenido || "",
        claseSincrona: datoscurso.claseSincrona || "",
        claseGrabada: datoscurso.claseGrabada || "",
        fecha: datoscurso.fecha
          ? datoscurso.fecha.split("T")[0]
          : new Date().toISOString().split("T")[0],
        horaEntrada: datoscurso.horaEntrada || "",
        horaSalida: datoscurso.horaSalida || "",
        concluida: datoscurso.concluida === 1 ? true : false,
      });
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
        contenido: formulario.contenido,
        claseSincrona: formulario.claseSincrona,
        claseGrabada: formulario.claseGrabada,
        fecha: formulario.fecha,
        horaEntrada: formulario.horaEntrada,
        horaSalida: formulario.horaSalida,
        concluida: formulario.concluida ? 1 : 0,
        txtTipo: "I", // 'I' insertar, 'U' actualizar
      };

      const response = await fetch(`${config.apiUrl}api/curso/NuevoGuia`, {
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


