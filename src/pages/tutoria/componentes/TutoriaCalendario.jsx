// src/pages/tutoria/componentes/TutoriaCalendario.jsx
import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import Swal from "sweetalert2";


import { useUsuario } from "../../../context/UserContext";
import { obtenerSesionesCiclo, obtenerSesionesLibres,obtenerDerivacionesTutor } from "../logica/DatosTutoria";

// --- Localizador en español (lunes inicio de semana)
const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Convierte "2025-12-02 09:06:00" → Date real
const toDateTime = (fecha) => {
  if (!fecha) return null;

  // Caso: MySQL "YYYY-MM-DD HH:MM:SS"
  if (fecha.includes("-") && fecha.includes(":")) {
    const [fechaPart, horaPart] = fecha.split(" ");
    const [anio, mes, dia] = fechaPart.split("-").map(Number);
    const [h, m] = horaPart.split(":").map(Number);
    return new Date(anio, mes - 1, dia, h, m);
  }

  // Caso "DD/MM/YYYY HH:MM"
  if (fecha.includes("/") && fecha.includes(":")) {
    const [f, h] = fecha.split(" ");
    const [dia, mes, anio] = f.split("/").map(Number);
    const [hor, min] = h.split(":").map(Number);
    return new Date(anio, mes - 1, dia, hor, min);
  }

  // Caso solo fecha
  if (fecha.includes("-")) {
    const [a, m, d] = fecha.split("-").map(Number);
    return new Date(a, m - 1, d);
  }
  if (fecha.includes("/")) {
    const [d, m, a] = fecha.split("/").map(Number);
    return new Date(a, m - 1, d);
  }
  
  return null;
};


// --- Textos en español
const messagesES = {
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  allDay: "Todo el día",
  week: "Semana",
  work_week: "Semana laboral",
  day: "Día",
  month: "Mes",
  previous: "Anterior",
  next: "Siguiente",
  yesterday: "Ayer",
  tomorrow: "Mañana",
  today: "Hoy",
  agenda: "Agenda",
  noEventsInRange: "No hay eventos en este rango.",
  showMore: (total) => `+${total} más`,
};

// --- Formatos de fecha en español (24h)
const formatsES = {
  monthHeaderFormat: (date) => format(date, "MMMM yyyy", { locale: es }),
  weekdayFormat: (date) => format(date, "EEE", { locale: es }),
  dayFormat: (date) => format(date, "d", { locale: es }),
  dayHeaderFormat: (date) => format(date, "EEEE d 'de' MMMM yyyy", { locale: es }),
  dayRangeHeaderFormat: ({ start, end }) =>
    `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`,
  agendaHeaderFormat: ({ start, end }) =>
    `${format(start, "d 'de' MMM", { locale: es })} – ${format(end, "d 'de' MMM yyyy", { locale: es })}`,
  agendaDateFormat: (date) => format(date, "EEE, d MMM", { locale: es }),
  agendaTimeRangeFormat: ({ start, end }) =>
    `${format(start, "HH:mm", { locale: es })} – ${format(end, "HH:mm", { locale: es })}`,
  eventTimeRangeFormat: ({ start, end }) =>
    `${format(start, "HH:mm", { locale: es })} – ${format(end, "HH:mm", { locale: es })}`,
  timeGutterFormat: (date) => format(date, "HH:mm", { locale: es }),
};

function TutoriaCalendario({ semestreValue }) {
  const { usuario } = useUsuario();
  const semestre = "202502";
  const [eventos, setEventos] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [mostrarSoloPendientes, setMostrarSoloPendientes] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
    if (!usuario?.docente) return;
    try {
      const token = usuario.codigotokenautenticadorunj;
      const persona = usuario.docente.persona;
      const lista = [];

      // CICLO
      const { datos: datosCiclo } = await obtenerSesionesCiclo(persona, semestre, token);
      (datosCiclo || []).forEach((s) => {
      const f = toDateTime(s.fecha);
        if (!f) return;

        lista.push({
          title: `Ciclo: ${s.descripcion}`,
          start: f,
          end: f,
          allDay: false,  // 👈 MUY IMPORTANTE
          meta: {
            tipo: "ciclo",
            estado: Number(s.activo) === 1 ? "concluida" : "pendiente",
            sesion: s.sesion
          },
        });
      });

      // LIBRE
      const libresRaw = await obtenerSesionesLibres(persona, semestre, token);
      const datosLibres = Array.isArray(libresRaw) ? libresRaw : libresRaw?.data || [];
      (datosLibres || []).forEach((s) => {
        const f = toDateTime(s.fecha);
        if (!f) return;

        lista.push({
          title: `Libre: ${s.descripcion}`,
          start: f,
          end: f,
          allDay: false,
          meta: {
            tipo: "libre",
            estado: Number(s.activo) === 1 ? "concluida" : "pendiente",
            sesion: s.sesion
          },
        });
      });

// === DERIVACIONES ===
const derivRaw = await obtenerDerivacionesTutor(semestre, persona, token);
const derivList = derivRaw?.derivaciones || [];

derivList.forEach((d) => {
  const start = toDateTime(d.fechaDeriva);
  if (!start) return;

  let end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hora por defecto
  let tieneAtencion = false;

  // Si hay fechatencion válida → usar como 'end'
  if (d.fechatencion && d.fechatencion.trim() !== "" && d.fechatencion !== "null") {
    const fechaAtencion = toDateTime(d.fechatencion);
    if (fechaAtencion && fechaAtencion >= start) {
      end = fechaAtencion;
      tieneAtencion = true;
    }
  }

  lista.push({
    title: `Derivación: ${d.area}`,
    start,
    end,
    allDay: false,
    meta: {
      tipo: "derivacion",
      alumno: d.alumno,
      descripcion: d.descripcion,
      area: d.area,
      estado: (d.estado || "").toLowerCase(),
      fechaDeriva: d.fechaDeriva,
      fechatencion: d.fechatencion, // ← string original o null
      tieneAtencion, // ← bandera para el popup
    }
  });
});

      setEventos(lista);
    } catch (e) {
      console.error("❌ Error cargando calendario:", e);
      Swal.fire("Error", "No se pudieron cargar las sesiones.", "error");
    }
  };

 // ELIMINA ESTO (ya no cambia)
// useEffect(() => { cargar(); }, [usuario, semestre]);

// REEMPLAZA POR:
useEffect(() => {
  if (usuario?.docente) cargar();
}, [usuario]); // ← solo cuando carga el usuario

  const eventosFiltrados = useMemo(
    () => (mostrarSoloPendientes ? eventos.filter((e) => e.meta?.estado === "pendiente") : eventos),
    [eventos, mostrarSoloPendientes]
  );

  // 🎨 Colores de eventos según tipo/estado
  const eventPropGetter = (event) => {
    const tipo = event.meta?.tipo;
    const estado = event.meta?.estado;
    let backgroundColor = "#0d6efd"; // ciclo = azul
    if (tipo === "libre") backgroundColor = "#198754"; // libre = verde
    if (tipo === "individual") backgroundColor = "#6f42c1"; // individual = violeta
    // En eventPropGetter
if (tipo === "derivacion") {
  backgroundColor = "#d63384"; // rosa por defecto
  if (event.meta.estado === "atendido") {
    backgroundColor = "#6c757d"; // gris
  }
}

    return {
      style: {
        backgroundColor,
        border: estado === "pendiente" ? "2px solid rgba(0,0,0,0.1)" : "2px dotted rgba(0,0,0,0.25)",
        opacity: estado === "pendiente" ? 1 : 0.65,
        color: "#fff",
        borderRadius: 8,
        padding: "2px 6px",
        fontWeight: 600,
      },
    };
  };



 // 📅 Click en evento
const onSelectEvent = (event) => {
  const { tipo, estado, sesion } = event.meta || {};

 const getEstadoBadge = (estado) => {
  const est = (estado || "").toLowerCase().trim();
  let bgColor = "bg-secondary";
  let textColor = "text-white";
  let texto = est;

  if (est === "programado") {
    bgColor = "bg-primary";
  } else if (est === "pendiente") {
    bgColor = "bg-warning";
    textColor = "text-dark"; // ← NEGRO para amarillo
  } else if (est === "atendido") {
    bgColor = "bg-success";
  } else {
    texto = est || "desconocido";
  }

  return `
    <span class="badge ${bgColor} ${textColor}" 
          style="font-size:13px; padding:4px 8px; border-radius:12px; font-weight:600;">
      ${texto.charAt(0).toUpperCase() + texto.slice(1)}
    </span>
  `;
};

  // ===========================
  // 🟣 CASO DERIVACIÓN
  // ===========================
if (tipo === "derivacion") {
  Swal.fire({
  title: `Derivación - ${event.meta.alumno}`,
  width: 600,
  html: `
    <div style="text-align:left; font-size:15px; line-height:1.6;">
      <div><b>Alumno:</b> ${event.meta.alumno}</div>
      <div><b>Descripción:</b> ${event.meta.descripcion}</div>
      <div><b>Área:</b> ${event.meta.area}</div>
      <div><b>Estado:</b> ${getEstadoBadge(event.meta.estado)}</div>
      <div><b>Derivación:</b> ${format(event.start, "dd/MM/yyyy HH:mm", { locale: es })}</div>
      <div><b>Atención:</b> ${
        event.meta.tieneAtencion
          ? format(event.end, "dd/MM/yyyy HH:mm", { locale: es })
          : "<i style='color:#999'>Pendiente</i>"
      }</div>
    </div>
  `,
  icon: "info",
  showCancelButton: true,
  confirmButtonText: "OK",
  cancelButtonText: "Cerrar",
});
  return;
}

  // ===========================
  // 🟦 CICLO / 🟩 LIBRE
  // ===========================

  let botones = {};

  if (tipo === "ciclo") {
    botones = {
      showConfirmButton: true,
      showDenyButton: false,
      confirmButtonText: "Ir a Sesión Ciclo",
    };
  } else if (tipo === "libre") {
    botones = {
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: "Ir a Sesión Libre",
    };
  }

  Swal.fire({
    title: event.title,
    html: `
      <div style="text-align:left;">
        <div><b>Tipo:</b> ${tipo}</div>
        <div><b>Estado:</b> ${estado}</div>
        <div><b>Sesión:</b> ${sesion || "-"}</div>
        <div><b>Fecha:</b> ${format(event.start, "dd/MM/yyyy HH:mm", { locale: es })}</div>
      </div>
    `,
    icon: "info",
    ...botones,
    showCancelButton: true,
    cancelButtonText: "Cerrar",
  }).then((r) => {
    if (r.isConfirmed && tipo === "ciclo") navigate("/tutoria/ciclo");
    if (r.isDenied && tipo === "libre") navigate("/tutoria/libre");
  });
};



  return (
    <div className="container mt-3">
      
      
        {/* REEMPLAZA la barra superior por algo más limpio */}
          <div className="d-flex align-items-center justify-content-end gap-2 mb-3">
            <Badge bg="primary">Ciclo</Badge>
            <Badge bg="success">Libre</Badge>
            <Badge bg="danger">Derivación</Badge>
            <div className="form-check form-switch ms-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="switchPend"
                checked={mostrarSoloPendientes}
                onChange={(e) => setMostrarSoloPendientes(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="switchPend">
                Mostrar solo pendientes
              </label>
            </div>
          </div>

      <div style={{ height: 650, background: "#fff", borderRadius: 12, padding: 8 }}>
        <Calendar
          localizer={localizer}
          events={eventosFiltrados}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          step={60}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          toolbar
          popup
          messages={messagesES}
          formats={formatsES}
          eventPropGetter={eventPropGetter}
          onSelectEvent={onSelectEvent}
        />
      </div>
    </div>
  );
}

export default TutoriaCalendario;
