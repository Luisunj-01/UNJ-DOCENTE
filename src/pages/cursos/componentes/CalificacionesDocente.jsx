import { useParams } from "react-router-dom";
import { obtenerDetalleActa } from "../../asignatura/logica/asignatura";
import React, { useEffect, useState } from 'react';
import TablaCursos from "../../reutilizables/componentes/TablaCursos";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import axios from "axios";
import Swal from "sweetalert2";
import config from '../../../config';
import { useUsuario } from "../../../context/UserContext";
// import { token } desde donde lo tengas guardado

const unidades = [
  { value: '01', label: 'PRIMER PROMEDIO' },
  { value: '02', label: 'SEGUNDO PROMEDIO' },
  { value: '03', label: 'TERCER PROMEDIO' },
  { value: '04', label: 'SUSTITUTORIO' },
  { value: '05', label: 'APLAZADOS' }
];

const CalificacionesDocente = ({ datosprincipal }) => {
  const [unidad, setUnidad] = useState('01');
  const [datos, setDatos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const { id } = useParams();
  const { usuario } = useUsuario();
  const token = usuario?.codigotokenautenticadorunj;
  const [cambios, setCambios] = useState({});
  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion ] = decoded.split('|');

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      const response = await obtenerDetalleActa(sede, semestre, escuela, curricula, curso, seccion, unidad);
      //console.log(response);
      if (!response || !response.datos) {
        setMensajeApi('No se pudo obtener los trabajos.');
        setLoading(false);
        return;
      }
      setDatos(response.datos);
      setCalificaciones(response.datos.map((d, i) => ({ ...d, index: i })));

      setMensajeApi(response.mensaje);
      setLoading(false);
    };

    cargarDatos();
  }, [unidad, sede, semestre, escuela, curricula, curso, seccion]);

  // 🔹 Manejo de edición
  const handleNotaChange = (index, campo, valor) => {
    const nuevas = [...calificaciones];
    nuevas[index][campo] = valor;
    setCalificaciones(nuevas);
  };
  console.log(datos);
  

  // 🔹 Guardar notas (POST al backend)
  const guardarCalificaciones = async () => {
  // Convierte cambios en un arreglo [{ alumno, ec?, ep?, ea?, formula }]
  const calificacionesModificadas = Object.entries(cambios).map(([alumno, notas]) => {
    // buscar datos completos del alumno
    const alumnoDatos = datos.find(d => d.alumno === alumno);

    // Si escuela es TM usa la fórmula fija, si no usa la fórmula del JSON
    const formulaFinal = (escuela === "TM")
      ? "055,030,015"
      : alumnoDatos?.formula || "";

    return {
      alumno,
      ...notas,
      formula: formulaFinal
    };
  });

  if (calificacionesModificadas.length === 0) {
    Swal.fire("ℹ️ Aviso", "No hay cambios para guardar.", "info");
    return;
  }

  const payload = {
    sede,
    semestre,
    escuela,
    curricula,
    curso,
    seccion,
    unidad,
    calificaciones: calificacionesModificadas
  };

  console.log("📤 Enviando payload:", payload);

  try {
    const response = await axios.post(`${config.apiUrl}api/curso/GrabarNotas`, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.data.error) {
      Swal.fire("✅ Éxito", response.data.mensaje, "success");
      setCambios({});
    } else {
      Swal.fire("⚠️ Error", response.data.mensaje, "error");
    }
  } catch (error) {
    console.error("❌ Error al guardar notas:", error);
    Swal.fire("Error", "No se pudo guardar las notas. Intenta de nuevo.", "error");
  }
};



  const columnas = [
    { clave: 'alumno', titulo: 'Código' },
    { clave: 'nombrecompleto', titulo: 'Nombres' },
    {
      clave: 'ec',
      titulo: 'EC',
      render: (row) => (
        <input
          type="text"
          inputMode="decimal"
          maxLength="5"
          size="6"
          autoComplete="off"
          className="form-control text-center"
          value={row.ec ?? ""}
          style={{
            color: row.ec !== "" && parseFloat(row.ec) <= 10.99 ? "red" : "black",
            backgroundColor: row.ec !== "" && parseFloat(row.ec) <= 10.99 ? "#ffe6e6" : "white"
          }}
          onKeyDown={(e) => {
            if (
              !/[0-9.]/.test(e.key) &&
              !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
            ) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const nuevas = [...calificaciones];
            nuevas[row.index] = { ...row, ec: e.target.value };
            setCalificaciones(nuevas);
          }}
          onBlur={(e) => {
            const nuevas = [...calificaciones];
            let valor = parseFloat(e.target.value.replace(",", "."));
            if (isNaN(valor) || valor < 0 || valor > 20) {
              valor = 0;
            } else {
              valor = valor.toFixed(2);
            }
            nuevas[row.index] = { ...row, ec: valor };
            setCalificaciones(nuevas);

            setCambios(prev => ({
              ...prev,
              [row.alumno]: {
                ...prev[row.alumno],
                ec: valor
              }
            }));
          }}
        />
      )
    },
    {
      clave: 'ep',
      titulo: 'EP',
      render: (row) => (
        <input
          type="text"
          inputMode="decimal"
          maxLength="5"
          size="6"
          autoComplete="off"
          className="form-control text-center"
          value={row.ep ?? ""}
          style={{
            color: row.ep !== "" && parseFloat(row.ep) <= 10.99 ? "red" : "black",
            backgroundColor: row.ep !== "" && parseFloat(row.ep) <= 10.99 ? "#ffe6e6" : "white"
          }}
          onKeyDown={(e) => {
            if (
              !/[0-9.]/.test(e.key) &&
              !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
            ) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const nuevas = [...calificaciones];
            nuevas[row.index] = { ...row, ep: e.target.value };
            setCalificaciones(nuevas);
          }}
          onBlur={(e) => {
            const nuevas = [...calificaciones];
            let valor = parseFloat(e.target.value.replace(",", "."));
            if (isNaN(valor) || valor < 0 || valor > 20) {
              valor = 0;
            } else {
              valor = valor.toFixed(2);
            }
            nuevas[row.index] = { ...row, ep: valor };
            setCalificaciones(nuevas);

            setCambios(prev => ({
              ...prev,
              [row.alumno]: {
                ...prev[row.alumno],
                ep: valor
              }
            }));
          }}
        />
      )
    },
    {
      clave: 'ea',
      titulo: 'EA',
      render: (row) => (
        <input
          type="text"
          inputMode="decimal"
          maxLength="5"
          size="6"
          autoComplete="off"
          className="form-control text-center"
          value={row.ea ?? ""}
          style={{
            color: row.ea !== "" && parseFloat(row.ea) <= 10.99 ? "red" : "black",
            backgroundColor: row.ea !== "" && parseFloat(row.ea) <= 10.99 ? "#ffe6e6" : "white"
          }}
          onKeyDown={(e) => {
            if (
              !/[0-9.]/.test(e.key) &&
              !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
            ) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const nuevas = [...calificaciones];
            nuevas[row.index] = { ...row, ea: e.target.value };
            setCalificaciones(nuevas);
          }}
          onBlur={(e) => {
            const nuevas = [...calificaciones];
            let valor = parseFloat(e.target.value.replace(",", "."));
            if (isNaN(valor) || valor < 0 || valor > 20) {
              valor = 0;
            } else {
              valor = valor.toFixed(2);
            }
            nuevas[row.index] = { ...row, ea: valor };
            setCalificaciones(nuevas);

            setCambios(prev => ({
              ...prev,
              [row.alumno]: {
                ...prev[row.alumno],
                ea: valor
              }
            }));
          }}
        />
      )
    },








    { clave: 'promediounidad', titulo: 'PU' },
  ];

  return (
    <div className="container py-4">
      <h2
        className="text-center fw-bold mb-4"
        style={{
          backgroundColor: '#d4f6fd',
          color: '#0b60a9',
          padding: '0.8rem',
          borderRadius: '8px',
          border: '1px solid #b3e9f7',
          fontSize: '1rem',
          letterSpacing: '1px'
        }}
      >
        CALIFICACIONES DEL DOCENTE
      </h2>
      <div className="mb-3 d-flex flex-column align-items-start gap-2">
        <div className="d-flex align-items-center gap-3">
          <label htmlFor="unidad" className="form-label mb-0">UNIDAD:</label>
          <select
            id="unidad"
            className="form-select w-auto"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
          >
            {unidades.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Instrucciones debajo del selector */}
        <div className="mt-2 p-3 border rounded bg-light" style={{ fontSize: "0.9rem" }}>
          <strong>Instrucciones:</strong>
          <ul className="mb-0 mt-1">
            <li>Si ingresa datos no numéricos o notas que no estén dentro del rango de 0.00 a 20.00 serán consideradas como 0.</li>
            <li>Las notas se redondean a dos decimales.</li>
            <li>El promedio del aplazado tiene que ser menor o igual a 14, si ingresa una nota mayor, se transformará en 14.</li>
            <li>Utilice la tecla <kbd>Tab</kbd> para desplazarse.</li>
          </ul>
        </div>
      </div>

      {loading ? (
        <TablaSkeleton filas={9} columnas={7} />
      ) : datos.length === 0 ? (
        <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
      ) : (
        <>
          {/* 🔹 Botón arriba */}
          <div className="text-end mb-3">
            <button className="btn btn-success px-4" onClick={guardarCalificaciones}>
              Guardar Notas
            </button>
          </div>

          <TablaCursos datos={calificaciones} columnas={columnas} />
        </>
      )}
    </div>
  );
};

export default CalificacionesDocente;
