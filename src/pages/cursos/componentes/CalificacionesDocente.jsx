import { useParams } from "react-router-dom";
import { obtenerDetalleActa } from "../../asignatura/logica/asignatura";
import React, { useEffect, useState } from 'react';
import TablaCursos from "../../reutilizables/componentes/TablaCursos";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import axios from "axios";
import Swal from "sweetalert2";
import config from '../../../config';
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
  const token = localStorage.getItem("token");

  const decoded = atob(atob(id));
  const [sede, semestre, escuela, curricula, curso, seccion, nombrecurso, nombredocente] = decoded.split('|');

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      const response = await obtenerDetalleActa(sede, semestre, escuela, curricula, curso, seccion, unidad);
      console.log(response);
      if (!response || !response.datos) {
        setMensajeApi('No se pudo obtener los trabajos.');
        setLoading(false);
        return;
      }
      setDatos(response.datos);
      setCalificaciones(response.datos.map((d) => ({ ...d }))); // 👈 clonar para edición SIN perder notas
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

  // 🔹 Guardar notas (POST al backend)
  const guardarCalificaciones = async () => {
    const payload = {
      sede,
      semestre,
      escuela,
      curricula,
      curso,
      seccion,
      unidad, // unidad seleccionada
      calificaciones: calificaciones.map(c => ({
        alumno: c.alumno,
        ec: c.ec ?? null,
        ep: c.ep ?? null,
        ea: c.ea ?? null,
        promediounidad: c.promediounidad ?? null
      }))
    };

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
  render: (fila, index) => (
    <input
      type="number"
      className="form-control text-center"
      value={fila.ec !== null && fila.ec !== undefined ? fila.ec : ""}
      onChange={(e) => {
        const nuevas = [...calificaciones];
        nuevas[index] = {
          ...fila,
          ec: e.target.value // 👈 guardamos texto para que se pueda escribir libremente
        };
        setCalificaciones(nuevas);
      }}
      onBlur={(e) => {
        const nuevas = [...calificaciones];
        nuevas[index] = {
          ...fila,
          ec: e.target.value === "" ? null : parseInt(e.target.value, 10) // 👈 conversión a número solo al salir
        };
        setCalificaciones(nuevas);
      }}
    />
  )
},
{
  clave: 'ep',
  titulo: 'EP',
  render: (fila, index) => (
    <input
      type="number"
      className="form-control text-center"
      value={fila.ep !== null && fila.ep !== undefined ? fila.ep : ""}
      onChange={(e) => {
        const nuevas = [...calificaciones];
        nuevas[index] = {
          ...fila,
          ep: e.target.value
        };
        setCalificaciones(nuevas);
      }}
      onBlur={(e) => {
        const nuevas = [...calificaciones];
        nuevas[index] = {
          ...fila,
          ep: e.target.value === "" ? null : parseInt(e.target.value, 10)
        };
        setCalificaciones(nuevas);
      }}
    />
  )
},
{
  clave: 'ea',
  titulo: 'EA',
  render: (fila, index) => (
    <input
      type="number"
      className="form-control text-center"
      value={fila.ea !== null && fila.ea !== undefined ? fila.ea : ""}
      onChange={(e) => {
        const nuevas = [...calificaciones];
        nuevas[index] = {
          ...fila,
          ea: e.target.value
        };
        setCalificaciones(nuevas);
      }}
      onBlur={(e) => {
        const nuevas = [...calificaciones];
        nuevas[index] = {
          ...fila,
          ea: e.target.value === "" ? null : parseInt(e.target.value, 10)
        };
        setCalificaciones(nuevas);
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
      <div className="mb-3 d-flex justify-content-start align-items-center gap-3">
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
