import { useParams } from "react-router-dom";
import { obtenerDetalleActa } from "../../asignatura/logica/asignatura";
import React, { useEffect, useState } from 'react';
import TablaCursos from "../../reutilizables/componentes/TablaCursos";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";

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
      setMensajeApi(response.mensaje);
      setLoading(false);
    };

    cargarDatos();
  }, [unidad, sede, semestre, escuela, curricula, curso, seccion]);


  const columnas = [
    { clave: 'alumno', titulo: 'Código' },
    { clave: 'nombrecompleto', titulo: 'Nombres' },
    { clave: 'ec', titulo: 'EC' },
    { clave: 'ep', titulo: 'EP' },
    { clave: 'ea', titulo: 'EA' },
    { clave: 'promediounidad', titulo: 'PU' },

    
  ];

  return (
    <div className="container py-4">
      <h2
        className="text-center fw-bold mb-4"
        style={{
        backgroundColor: '#d4f6fd',   // Celeste suave
        color: '#0b60a9',             // Azul del texto
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #b3e9f7',  // Borde celeste claro
        fontSize: '1rem',
        letterSpacing: '1px'
      }}
    >
      CALIFICACIONES DEL DOCENTE
    </h2>
      <div className="mb-3 d-flex justify-content-start align-items-center gap-3">
  <label htmlFor="unidad" className="form-label mb-0">Unidad:</label>
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
        <TablaCursos datos={datos} columnas={columnas} />
      )}
      
    </div>
  );
};

export default CalificacionesDocente;
