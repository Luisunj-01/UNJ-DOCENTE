import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import config from "../../../config"; 
import SemestreSelect from "../../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../../context/UserContext";
import Swal from "sweetalert2";

const NuevoGuia = ({ datoscurso, semana, onUpdated }) => {
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;

  const [formulario, setFormulario] = useState({
    sede: "",
    semestre: "",
    escuela: "",
    curricula: "",
    curso: "",
    seccion: "",
    semana: "",
    observacion: "",
    contenido: "",
    claseSincrona: "",
    claseGrabada: "",
    fecha: new Date().toISOString().split("T")[0],
    horaEntrada: "",
    horaSalida: "",
    concluida: false,
  });

  // 🔹 Fechas adicionales
  const [fechasAdicionales, setFechasAdicionales] = useState([]);

  // Cargar datos iniciales cuando cambia datoscurso o semana
  useEffect(() => {
    if (datoscurso) {
      setFormulario((prev) => ({
        ...prev,
        sede: datoscurso.sede || prev.sede,
        semestre: datoscurso.semestre || prev.semestre,
        escuela: datoscurso.escuela || prev.escuela,
        curricula: datoscurso.curricula || prev.curricula,
        curso: datoscurso.curso || prev.curso,
        seccion: datoscurso.seccion || prev.seccion,
        semana: datoscurso.semana || prev.semana,
        contenido: datoscurso.contenido || prev.contenido,
        claseSincrona: datoscurso.claseSincrona || prev.claseSincrona,
        claseGrabada: datoscurso.claseGrabada || prev.claseGrabada,
        fecha: datoscurso.fecha ? datoscurso.fecha.split("T")[0] : prev.fecha,
        horaEntrada: datoscurso.horaEntrada || prev.horaEntrada,
        horaSalida: datoscurso.horaSalida || prev.horaSalida,
        concluida: datoscurso.concluida === 1 ? true : prev.concluida,
      }));
    }
  }, [datoscurso, semana]);

  // Manejar cambios en inputs normales
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔹 Manejar cambios en fechas adicionales
  const handleFechaChange = (index, field, value) => {
    const nuevas = [...fechasAdicionales];
    nuevas[index][field] = value;
    setFechasAdicionales(nuevas);
  };

  // 🔹 Agregar nueva fecha
  const agregarFecha = () => {
    setFechasAdicionales([
      ...fechasAdicionales,
      { fecha: "", hora_entrada: "", hora_salida: "" },
    ]);
  };

  // 🔹 Eliminar fecha
  const eliminarFecha = (index) => {
    const nuevas = fechasAdicionales.filter((_, i) => i !== index);
    setFechasAdicionales(nuevas);
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
        clasegrabada: formulario.claseGrabada, // ✅ coincide con backend
        horaentrada: formulario.horaEntrada,
        horasalida: formulario.horaSalida,
        concluido: formulario.concluida ? "1" : "0",
        fecha: formulario.fecha,
        fechas_adicionales: fechasAdicionales.map(f => ({
          fecha: f.fecha,
          hora_entrada: f.hora_entrada || "",
          hora_salida: f.hora_salida || ""
        }))
      };

      console.log("📤 Enviando payload:", payload);

      const response = await fetch(`${config.apiUrl}api/curso/GrabarGuia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && !data.error) {
        Swal.fire("✅ Guía guardada correctamente", data.mensaje, "success");
        setFechasAdicionales([]); // limpiar extras
        if (onUpdated) onUpdated();
      } else {
        Swal.fire("⚠️ Error", data.mensaje || "Faltan datos", "error");
      }
    } catch (error) {
      console.error("❌ Error al guardar guía:", error);
      Swal.fire("Error", "No se pudo guardar la guía", "error");
    }
  };

  return (
    <div>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Semana</Form.Label>
          
          <SemestreSelect
            value={formulario.semana}
           onChange={(e) =>
            setFormulario((prev) => ({ ...prev, semana: e.target.value }))
          }

            name="semana"
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

        {/*
        
        SE OCULTO ESTO POR QUE FUE EN PANDEMIA
        
        */}

        {/*

        <Form.Group className="mb-3">
          <Form.Label>Clase síncrona</Form.Label>
          <Form.Control
            type="text"
            name="observacion"
            value={formulario.observacion}
            onChange={handleChange}
          />
        </Form.Group>

        */}

        {/*

         <Form.Group className="mb-3">
          <Form.Label>Clase grabada</Form.Label>
          <Form.Control
            type="text"
            name="claseGrabada"
            value={formulario.claseGrabada}
            onChange={handleChange}
          />
        </Form.Group>


        */}

       

        {/* 🔹 Fecha + Hora entrada + Hora salida en la misma fila */}
        <Form.Group className="mb-3">
          <Form.Label>Fecha principal</Form.Label>
          <Row>
            <Col>
              <Form.Control
                type="date"
                name="fecha"
                value={formulario.fecha}
                onChange={handleChange}
              />
            </Col>
            <Col>
              <Form.Control
                type="time"
                name="horaEntrada"
                value={formulario.horaEntrada}
                onChange={handleChange}
              />
            </Col>
            <Col>
              <Form.Control
                type="time"
                name="horaSalida"
                value={formulario.horaSalida}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </Form.Group>

        {/* 🔹 Fechas adicionales */}
        <Form.Group>
          <Form.Label>Fechas adicionales</Form.Label>
          {fechasAdicionales.map((f, index) => (
            <Row key={index} className="mb-2">
              <Col>
                <Form.Control
                  type="date"
                  value={f.fecha}
                  onChange={(e) =>
                    handleFechaChange(index, "fecha", e.target.value)
                  }
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  value={f.hora_entrada}
                  onChange={(e) =>
                    handleFechaChange(index, "hora_entrada", e.target.value)
                  }
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  value={f.hora_salida}
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

        <Form.Group className="mt-3" controlId="concluida">
          <Form.Check
            type="checkbox"
            label="Concluida"
            name="concluida"
            checked={formulario.concluida}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="success" className="mt-3" onClick={guardarGuia}>
          Guardar
        </Button>
      </Form>
    </div>
  );
};

export default NuevoGuia;
