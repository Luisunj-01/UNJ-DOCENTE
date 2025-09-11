import { useParams } from "react-router-dom";
import { obtenerDetalleActa } from "../../asignatura/logica/asignatura";
import React, { useEffect, useState } from 'react';
import TablaCursos from "../../reutilizables/componentes/TablaCursos";
import { TablaSkeleton } from "../../reutilizables/componentes/TablaSkeleton";
import axios from "axios";
import Swal from "sweetalert2";
import config from '../../../config';
import { useUsuario } from "../../../context/UserContext";
import { FaUserLock  } from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import { token } desde donde lo tengas guardado

const unidades = [
  { value: '01', label: 'PRIMER PROMEDIO' },
  { value: '02', label: 'SEGUNDO PROMEDIO' },
  { value: '03', label: 'TERCER PROMEDIO' },
  { value: '04', label: 'SUSTITUTORIO' },
  { value: '05', label: 'APLAZADOS' }
];


const CalificacionesDocente = ({ datosprincipal, cerrado }) => {

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
const cerrar = () => {
  // Aquí la lógica que necesites al “cerrar”
  console.log("Función cerrar ejecutada");
  // …código para cerrar o actualizar estado
};

// 🔹 Descargar Excel (ahora también cierra automáticamente)
const descargarExcel = async () => {
  try {
    // 1. Generar hoja de Excel a partir de datos
    const hoja = XLSX.utils.json_to_sheet(calificaciones);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Calificaciones");

    // 2. Guardar archivo
    const excelBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Calificaciones.xlsx");

    // 3. Cerrar automáticamente después de descargar
    const response = await fetch(
      `/api/validacion/${sede}/${semestre}/${escuela}/${curricula}/${curso}/${seccion}/1`,
      { method: "POST" }
    );

    if (response.ok) {
      Swal.fire("🔒 Cerrado", "El curso ha sido cerrado automáticamente después de descargar.", "success");
      // Opcional: actualizar estado en vez de recargar
      // setCerrado(1);
    } else {
      Swal.fire("⚠️ Error", "El Excel se descargó, pero no se pudo cerrar el curso.", "warning");
    }
  } catch (error) {
    console.error("❌ Error en descarga/cierre:", error);
    Swal.fire("Error", "Hubo un problema al descargar y cerrar el curso.", "error");
  }
};





  // 🔹 Manejo de edición
  const handleNotaChange = (index, campo, valor) => {
    const nuevas = [...calificaciones];
    nuevas[index][campo] = valor;
    setCalificaciones(nuevas);
  };
  //console.log(datos);
  
//console.log(usuario);

  // 🔹 Guardar notas (POST al backend)
  const guardarCalificaciones = async () => {
  // Convertimos los cambios en un arreglo con valores numéricos
  const calificacionesModificadas = Object.entries(cambios).map(([alumno, notas]) => {
    const alumnoDatos = datos.find(d => d.alumno === alumno);

    const formulaFinal = escuela === "TM" ? "055,030,015" : alumnoDatos?.formula || "";

    // Convertimos a número y redondeamos, si es NaN ponemos 0
    const ec = parseFloat(notas.ec ?? alumnoDatos?.ec ?? 0) || 0;
    const ep = parseFloat(notas.ep ?? alumnoDatos?.ep ?? 0) || 0;
    const ea = parseFloat(notas.ea ?? alumnoDatos?.ea ?? 0) || 0;

    return {
      alumno,
      persona: alumnoDatos?.persona || '',
      ec: parseFloat(ec.toFixed(2)),
      ep: parseFloat(ep.toFixed(2)),
      ea: parseFloat(ea.toFixed(2)),
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
    persona: usuario.docente.persona,
    usuario: usuario.docente.numerodocumento,
    calificaciones: calificacionesModificadas
  };
  //console.log(payload);

  try {
    const response = await axios.post(`${config.apiUrl}api/curso/GrabarNotas`, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    
    console.log(response);
    console.log(response.data);
    if (!response.data.error) {
      Swal.fire("✅ Éxito", response.data.mensaje, "success");
      setCambios({}); // Limpiamos cambios
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

  if (cerrado === 1) {
    return (
      <div className="container py-5 text-center">
        {/* Ícono de candado */}
        <FaUserLock 
          size={150}          // tamaño grande
          color="#0b60a9"    // color que prefieras
          className="mb-3"
        />

        <h2 className="fw-bold text-danger mb-3">El curso ha sido cerrado</h2>
        <p className="text-muted">
          Las calificaciones no pueden editarse ni guardarse.
        </p>
      </div>
    );
  }

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
             <button className="btn btn-primary px-4" onClick={descargarExcel}>
          Descargar Excel
        </button>
                </div>

                <TablaCursos datos={calificaciones} columnas={columnas} />
              </>
            )}
          </div>
  );
};

export default CalificacionesDocente;
