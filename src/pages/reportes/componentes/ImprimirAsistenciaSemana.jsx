import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';

import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerAsistenciasemana, obtenerNombreConfiguracion } from '../logica/Reportes';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';

const CabeceraMatricula = ({ titulomat, sede, nombredocente, nombreEscuela, semestre, objetos }) => (
  <>
    <Cabecerareporte titulomat={titulomat} />
    <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>
    <table className="table">
      <tbody>
        <tr>
          <td><strong>Sede:</strong></td>
          <td>{sede}</td>
          <td><strong>Docente:</strong></td>
          <td>{nombredocente}</td>
        </tr>
        <tr>
          <td><strong>Semestre:</strong></td>
          <td>{semestre}</td>
          <td><strong>Sección:</strong></td>
          <td>{objetos.seccion}</td>
        </tr>
        <tr>
          <td><strong>Curricula:</strong></td>
          <td>{objetos.curricula}</td>
          <td><strong>Sesión:</strong></td>
          <td>{objetos.sesion ? objetos.sesion : '-'}</td>
        </tr>
        <tr>
          <td><strong>Escuela:</strong></td>
          <td colSpan={3}>{nombreEscuela}</td>
        </tr>
      </tbody>
    </table>
  </>
);

const ImprimirAsistenciaSemana = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState('No Definida');
  const [nombreescuela, setNombreescuela] = useState('No Definida');
  const [fechas, setFechas] = useState([]);
  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('REGISTRO DE ASISTENCIA DE ESTUDIANTES');

  const queryParams2 = new URLSearchParams(search);
  const codigo2Param = queryParams2.get('codigo');

  let sede = '', semestre = '', escuela = '', curricula = '', curso = '', seccion = '', sesion = '';
  try {
    if (codigo2Param) {
      const decoded2 = atob(atob(codigo2Param));
      [sede, semestre, escuela, curricula, curso, seccion, sesion] = decoded2.split('|');
    }
  } catch (error) {
    console.error("❌ Error decodificando parámetros:", error);
  }

  const nombredocente = usuario?.docente?.nombrecompleto || '';
  const departamentoacademico = usuario?.docente?.departamentoacademico || '';
  const objetos = { sede, semestre, escuela, curricula, curso, seccion, sesion };

  useEffect(() => {
    if (!sede || !semestre || !escuela || !curricula || !curso || !seccion) {
      console.warn("⚠️ Faltan parámetros obligatorios:", { sede, semestre, escuela, curricula, curso, seccion });
      setLoading(false);
      return;
    }

    const fetchDatos = async () => {
      try {
        const resultado = await obtenerAsistenciasemana(sede, semestre, escuela, curricula, curso, seccion, '', '', sesion, '');
        console.log("resultado:", resultado);
        const lista = resultado?.datos || [];

        // ✅ Fechas únicas
        const fechasUnicas = [...new Set(lista.map(item => item.fecha))];
        setFechas(fechasUnicas);

        // ✅ Agrupamos alumnos y sus asistencias por fecha
        const agrupados = Object.values(
          lista.reduce((acc, item) => {
            if (!acc[item.alumno]) {
              acc[item.alumno] = { alumno: item.alumno, nombrecompleto: item.nombrecompleto, asistencias: {} };
            }
            acc[item.alumno].asistencias[item.fecha] = item.estado; // A, F, T, I, etc.
            return acc;
          }, {})
        );

        // ✅ Adaptamos para TablaCursos
        const datosAdaptados = agrupados.map(alumno => {
          const fila = { alumno: alumno.alumno, nombrecompleto: alumno.nombrecompleto };
          fechasUnicas.forEach(fecha => {
            fila[fecha] = alumno.asistencias[fecha] || '-';
          });
          return fila;
        });

        setDatos(datosAdaptados);

        // 🔹 Corregido: pasar "codigo" como parámetro
        const nombresedeResp = await obtenerNombreConfiguracion('nombresede', { sede });
        const nombreescuelaResp = await obtenerNombreConfiguracion('nombreescuela', { escuela });


        setNombresede(typeof nombresedeResp === 'object' ? nombresedeResp?.valor || 'No Definida' : nombresedeResp || 'No Definida');
        setNombreescuela(typeof nombreescuelaResp === 'object' ? nombreescuelaResp?.valor || 'No Definida' : nombreescuelaResp || 'No Definida');


      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [sede, semestre, escuela, curricula, curso, seccion, sesion, departamentoacademico]);

  // ✅ Columnas dinámicas para fechas
  const columnasEncabezado = [
    [
      { titulo: 'No.', rowSpan: 2 },
      { titulo: 'Código', rowSpan: 2 },
      { titulo: 'Apellidos y Nombres', rowSpan: 2 },
      ...fechas.map(f => ({ titulo: f }))
    ]
  ];

  const columnas = [
    { clave: 'alumno' },
    { clave: 'nombrecompleto' },
    ...fechas.map(f => ({ clave: f }))
  ];

  return (
    <>
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            {loading ? (
              <TablaSkeleton filas={3} columnas={fechas.length + 3} />
            ) : (
              <CabeceraMatricula
                titulomat={titulomat}
                sede={nombresede}
                nombredocente={nombredocente}
                nombreEscuela={nombreescuela}
                semestre={semestre}
                objetos={objetos}
              />
            )}
          </div>
        </div>

        <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>

        <div className="row mt-3">
          <div className="col-12">
            {loading ? (
              <TablaSkeleton filas={5} columnas={fechas.length + 3} />
            ) : (
              <TablaCursos datos={datos} columnasEncabezado={columnasEncabezado} columnas={columnas} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImprimirAsistenciaSemana;
