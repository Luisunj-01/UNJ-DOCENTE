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

import SemestreSelect from "../../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../../context/UserContext";
import { obtenerSesionesCiclo, obtenerSesionesLibres } from "../logica/DatosTutoria";

// --- Localizador en español (lunes inicio de semana)
const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales,
});

// --- Funciones de fecha
const toYMD = (fecha) => {
  if (!fecha) return "";
  if (fecha.includes("T")) return fecha.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split("/");
    return `${y}-${m}-${d}`;
  }
  return "";
};
const ymdToDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
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
  const [semestre, setSemestre] = useState(semestreValue || "202501");
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
        const ymd = toYMD(s.fecha);
        if (!ymd) return;
        const f = ymdToDate(ymd);
        lista.push({
          title: `Ciclo: ${s.descripcion}`,
          start: f,
          end: f,
          allDay: true,
          meta: { tipo: "ciclo", estado: Number(s.activo) === 1 ? "concluida" : "pendiente", sesion: s.sesion },
        });
      });

      // LIBRE
      const libresRaw = await obtenerSesionesLibres(persona, semestre, token);
      const datosLibres = Array.isArray(libresRaw) ? libresRaw : libresRaw?.data || [];
      (datosLibres || []).forEach((s) => {
        const ymd = toYMD(s.fecha);
        if (!ymd) return;
        const f = ymdToDate(ymd);
        lista.push({
          title: `Libre: ${s.descripcion}`,
          start: f,
          end: f,
          allDay: true,
          meta: { tipo: "libre", estado: Number(s.activo) === 1 ? "concluida" : "pendiente", sesion: s.sesion },
        });
      });

      setEventos(lista);
    } catch (e) {
      console.error("❌ Error cargando calendario:", e);
      Swal.fire("Error", "No se pudieron cargar las sesiones.", "error");
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, semestre]);

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
    Swal.fire({
      title: event.title,
      html: `
        <div style="text-align:left">
          <div><b>Tipo:</b> ${tipo}</div>
          <div><b>Estado:</b> ${estado}</div>
          <div><b>Sesión:</b> ${sesion || "-"}</div>
          <div><b>Fecha:</b> ${format(event.start, "dd/MM/yyyy", { locale: es })}</div>
        </div>
      `,
      icon: "info",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Ir a Sesión Ciclo",
      denyButtonText: "Ir a Sesión Libre",
      cancelButtonText: "Cerrar",
    }).then((r) => {
      if (r.isConfirmed) navigate("/tutoria/ciclo");
      else if (r.isDenied) navigate("/tutoria/libre");
    });
  };

  return (
    <div className="container mt-3">
      {/* Barra superior */}
      <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
        <div className="me-2"><strong>Semestre:</strong></div>
        <SemestreSelect value={semestre} onChange={setSemestre} name="cboSemestre" />
        <div className="ms-auto d-flex align-items-center gap-2">
          <Badge bg="primary">Ciclo</Badge>
          <Badge bg="success">Libre</Badge>
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
