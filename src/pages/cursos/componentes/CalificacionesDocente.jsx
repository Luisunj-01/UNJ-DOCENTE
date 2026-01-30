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
import { obtenervalidacioncurso } from "../logica/Curso";
import confetti from "canvas-confetti";
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

  const [habilitado, setHabilitado] = useState(false);
  const [mensajeFecha, setMensajeFecha] = useState("");
 const [estadoFecha, setEstadoFecha] = useState(null);



const validarRangoMensaje = async () => {
  const mapa = {
    "01": 27,
    "02": 28,
    "03": 29,
    "04": 32,
    "05": 33
  };

  const actividad = mapa[unidad];

  try {
    const res = await fetch(
      `${config.apiUrl}api/curso/notasvalidarfecha/${semestre}/${escuela}/${actividad}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    const data = await res.json();

    if (data.success) {
      setMensajeFecha(data.mensaje);
       setEstadoFecha(data.estado); // 👈 CLAVE

    }
  } catch (error) {
    console.error("Error validando mensaje de fechas:", error);
    setMensajeFecha("No se pudo validar el rango de fechas");
  }
};


const renderMensajeEstado = () => {
  switch (estadoFecha) {
    case "programadas":
      return (
        <span className="badge bg-warning text-dark ms-3">
          ⏳ Regrese en la fecha indicada
        </span>
      );

    case "validas":
      return (
        <span className="badge bg-success ms-3">
          ✅ Ya puede registrar notas
        </span>
      );

    case "vencidas":
      return (
        <span className="badge bg-danger ms-3">
          ❌ Lo sentimos, el plazo ha vencido
        </span>
      );

    default:
      return null;
  }
};



const validarRangoUnidad = async () => {
  const mapa = {
    "01": 27,
    "02": 28,
    "03": 29,
    "04": 32,
    "05": 33
  };

  const actividad = mapa[unidad];

  try {
    const res = await fetch(
      `${config.apiUrl}api/curso/notasvalidarfecha/${semestre}/${escuela}/${actividad}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    const data = await res.json();

    if (data.success) {
      setHabilitado(data.pasa === "Si");
    } else {
      setHabilitado(false);
    }
  } catch (error) {
    console.error("Error validando unidad:", error);
    setHabilitado(false);
  }
};



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
 


// ⬇️ ⬇️ ⬇️ ESTE VA AQUÍ, DEBAJO del anterior
// 🔹 Mensaje (solo una vez)
useEffect(() => {
  validarRangoMensaje();
}, [unidad, semestre, escuela]);


// 🔹 Habilitado (cada vez que cambia unidad)
useEffect(() => {
  validarRangoUnidad();
}, [unidad, semestre, escuela]);




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
    const data = await obtenervalidacioncurso(
              sede,
              semestre,
              escuela,
              curricula,
              curso,
              seccion,
              "1"
            );

    
            if (!data || data.error) {
              throw new Error(data?.mensaje || "Error en la petición");
            }
    
            // Muestra animación de candado cerrándose
            await Swal.fire({
              title: "¡Cerrando calificaciones!",
              html: `
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <svg id="lock-icon" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#3085d6">
                    <path id="shackle" d="M12 1a5 5 0 00-5 5v3h2V6a3 3 0 116 0v3h2V6a5 5 0 00-5-5z" />
                    <path d="M5 10h14a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1z"/>
                  </svg>
                  <p style="margin-top: 10px;">Cerrando calificaciones...</p>
                </div>
              `,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              didOpen: () => {
                const shackle = document.getElementById('shackle');
                if (shackle) {
                  shackle.animate([
                    { transform: 'translateY(-20px)', opacity: 1 },
                    { transform: 'translateY(0px)', opacity: 1 }
                  ], {
                    duration: 800,
                    fill: 'forwards',
                    easing: 'ease-in-out'
                  });
                }
              },
              timer: 1200
            });
    
            // Mostrar mensaje final de éxito
            Swal.fire({
              icon: "success",
              title: "¡Proceso completado!",
              text: data.mensaje || "✅ Calificaciones cerradas correctamente",
              confirmButtonText: "Aceptar",
            });
    
            window.location.reload();
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
  // 🔹 Guardar notas (POST al backend)
const guardarCalificaciones = async () => {
  const calificacionesModificadas = Object.entries(cambios).map(([alumno, notas]) => {
    const alumnoDatos = datos.find(d => d.alumno === alumno);
    const formulaFinal = escuela === "TM" ? "055,030,015" : alumnoDatos?.formula || "";

    const ec = parseFloat(notas.ec ?? alumnoDatos?.ec ?? 0) || 0;
    const ep = parseFloat(notas.ep ?? alumnoDatos?.ep ?? 0) || 0;
    const ea = parseFloat(notas.ea ?? alumnoDatos?.ea ?? 0) || 0;

    return {
      alumno,
      persona: alumnoDatos?.persona || '',
      rendimiento: alumnoDatos?.rendimiento || null,
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

  function lanzarConfetti() {
  // Creamos un canvas manual con clase para el z-index
  const canvas = document.createElement('canvas');
  canvas.classList.add('confetti-canvas');
  document.body.appendChild(canvas);

  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

  myConfetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 }
  });

  // Opcional: eliminar el canvas después de la animación
  setTimeout(() => {
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }, 5000);
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

  // ✅ Confirmación antes de enviar
  Swal.fire({
    title: "¿Guardar notas?",
    text: "Se enviarán las calificaciones al sistema. ¿Deseas continuar?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  }).then(async (result) => {
    if (!result.isConfirmed) return; // si cancela, no hace nada

    try {
      const response = await axios.post(`${config.apiUrl}api/curso/GrabarNotas`, payload, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.data.error) {

        /*setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 }
          });
        }, 300);*/

        Swal.fire({
          title: "¡Grandioso!",
          text: response.data.mensaje,
          icon: "success",
          showConfirmButton: false,
          timer: 2000
        });
        lanzarConfetti();
        /*Swal.fire("✅ Éxito", response.data.mensaje, "success");
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 } // altura de inicio
        });*/
        setCambios({});
      } else {
        Swal.fire("⚠️ Error", response.data.mensaje, "error");
      }
    } catch (error) {
      console.error("❌ Error al guardar notas:", error);
      Swal.fire("Error", "No se pudo guardar las notas. Intenta de nuevo.", "error");
    }
  });
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
          disabled={!habilitado}   // 🟩 AQUÍ VA
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
          disabled={!habilitado}   // 🟩 AQUÍ VA
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
          disabled={!habilitado}   // 🟩 AQUÍ VA
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

        <h2 className="fw-bold text-danger mb-3">El ingreso de notas ha sido cerrado</h2>
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

     <div
  className={`alert ${
    estadoFecha === "validas"
      ? "alert-info"
      : estadoFecha === "programadas"
      ? "alert-warning"
      : "alert-danger"
  } mt-3 d-flex align-items-center`}
>
  <strong>Aviso:</strong>&nbsp;{mensajeFecha}
  {renderMensajeEstado()}
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
