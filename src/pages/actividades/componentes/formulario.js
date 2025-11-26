// src/pages/actividades/componentes/FormNoLectiva.js
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

function FormNoLectiva({
  actividades,
  onAgregar,
  disabled,
  formHabilitado,
  mensajeFecha
}) {
  const [actividad, setActividad] = useState("TUTORÍA Y CONSEJERÍA");
  const [dia, setDia] = useState("LUN");
  const [inicio, setInicio] = useState("08:00");
  const [horas, setHoras] = useState(1);

  // 🔹 calcular hora fin
  const calcularHoraFin = (horaInicio, horas) => {
    if (!horaInicio || !horas) return "";
    const [h, m] = horaInicio.split(":").map(Number);
    const inicioDate = new Date();
    inicioDate.setHours(h, m);
    inicioDate.setHours(inicioDate.getHours() + horas);

    return inicioDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return; // 👈 corta si está bloqueado
    if (!actividad || !dia || !inicio || !horas) return;

    const fin = calcularHoraFin(inicio, horas);
    const nueva = {
      actividad,              // para el backend (código de actividad)
      descripcion: actividad, // para mostrar en la tabla
      dia,
      inicio,
      fin,
      horas,
    };

    onAgregar(nueva); // 🔹 se lo pasamos al padre

    // reset valores
    setActividad("TUTORÍA Y CONSEJERÍA");
    setDia("LUN");
    setInicio("08:00");
    setHoras(1);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-3">
      <div className="row g-3">
        {/* Actividad */}
        <div className="col-md-3">
          <Form.Group controlId="actividad">
            <Form.Label><strong>Actividad</strong></Form.Label>
            <Form.Select
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              required
              disabled={disabled}
            >
              <option value="">-- Actividad --</option>
              {actividades.map((a, i) => (
                <option key={i} value={a.actividad}>
                  {a.descripcion}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        {/* Día */}
        <div className="col-md-2">
          <Form.Group controlId="dia">
            <Form.Label><strong>Día</strong></Form.Label>
            <Form.Select
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              required
              disabled={disabled}
            >
              <option value="LUN">Lunes</option>
              <option value="MAR">Martes</option>
              <option value="MIE">Miércoles</option>
              <option value="JUE">Jueves</option>
              <option value="VIE">Viernes</option>
              <option value="SAB">Sábado</option>
            </Form.Select>
          </Form.Group>
        </div>

        {/* Hora inicio */}
        <div className="col-md-2">
          <Form.Group controlId="inicio">
            <Form.Label><strong>Hr Inicio</strong></Form.Label>
            <Form.Control
              type="time"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              required
              disabled={disabled}
            />
          </Form.Group>
        </div>

        {/* Horas */}
        <div className="col-md-2">
          <Form.Group controlId="horas">
            <Form.Label><strong>Horas</strong></Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={horas}
              onChange={(e) => setHoras(Number(e.target.value))}
              required
              disabled={disabled}
            />
          </Form.Group>
        </div>

        {/* Botón */}
        <div className="col-md-2 d-flex align-items-end">
          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={disabled}
          >
            Asignar
          </Button>
        </div>
        
        {/* Mensaje debajo (ocupa toda la fila) */}
          {!formHabilitado && mensajeFecha && (
            <div className="row mt-2">
              <div className="col-12">
                <p
                  style={{
                    color: "red",
                    fontSize: "0.90rem",
                    marginTop: "5px",
                    fontWeight: "600",
                  }}
                >
                  {mensajeFecha}
                </p>
              </div>
            </div>
          )}
      </div>
    </Form>
  );
}

export default FormNoLectiva;
