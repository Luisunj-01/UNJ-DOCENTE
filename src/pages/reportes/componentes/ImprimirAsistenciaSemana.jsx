import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from "qrcode.react";
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerAsistenciasemana, obtenerNombreConfiguracion } from '../logica/Reportes';
import TablaCursoSub from '../../reutilizables/componentes/TablaCursoSub';
import './asistencia.css';

const fecha = new Date();
const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;
const horaActual = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', });
const urlActual = window.location.href;

// 🔹 Cabecera del acta
const CabeceraActa = ({ titulomat, sede, nombredocente, nombreEscuela, semestre, objetos }) => (
  <>
    <table className="table w-100">
      <tbody>
        <tr className="align-middle">
          {/* Columna izquierda - LOGO */}
          <td className="text-start" style={{ width: '25%' }}>
            <img src="/image/logo/logo-unj-v1.svg" alt="Logo" width="111" />
          </td>

          {/* Columna del medio - TÍTULO */}
          <td className="text-center" style={{ width: '50%' }}>
            <h4 className="titulozet mb-0"><strong>{titulomat}</strong></h4> 
            <td style={{ width: '15%', fontSize: '0.9rem', marginTop: '8px' }}>
              <div><strong>Fecha:</strong> {fechaFormateada} | <strong>Hora:</strong> {horaActual}</div>
            </td>
          </td>

          {/* Columna derecha - QR + FECHA Y HORA */}
          <td className="text-end" style={{ width: '25%', fontSize: '0.9rem' }}>
            <div className="col-12">
              <QRCodeSVG value={urlActual} size={128} level="L" includeMargin={true} />
              <p style={{ fontSize: '0.8rem', marginTop: '10px' }}><strong>Escanea para acceder:</strong></p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>

    <table className="table">
      <tbody>
        <tr>
          <td><strong>Sede:</strong></td>
          <td style={{textAlign: 'left'}}>{sede}</td>
          <td><strong>Docente:</strong></td>
          <td style={{textAlign: 'left'}}>{nombredocente}</td>
        </tr>
        <tr>
          <td><strong>Semestre:</strong></td>
          <td style={{textAlign: 'left'}}>{semestre}</td>
          <td><strong>Sección:</strong></td>
          <td style={{textAlign: 'left'}}>{objetos.seccion}</td>
        </tr>
        <tr>
          <td><strong>Curricula:</strong></td>
          <td style={{textAlign: 'left'}}>{objetos.curricula}</td>
          <td><strong>Curso:</strong></td>
          <td style={{textAlign: 'left'}}>{objetos.curso}</td>
        </tr>
        <tr>
          <td><strong>Escuela:</strong></td>
          <td style={{textAlign: 'left'}} >{nombreEscuela}</td>
        </tr>
      </tbody>
    </table>
  </>
);

// 🔹 Función para transformar los datos
const transformarDatos = (data) => {
  // Fechas únicas
  const fechasUnicas = [...new Set(data.map(d => d.fecha))].sort(
    (a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'))
  );

  // Agrupar alumnos
  const alumnosMap = {};
  data.forEach(item => {
    if (!alumnosMap[item.alumno]) {
      alumnosMap[item.alumno] = {
        alumno: item.alumno,
        nombrecompleto: item.nombrecompleto,
        asistencias: {}
      };
    }
    alumnosMap[item.alumno].asistencias[item.fecha] = item.condicion;
  });

  // Convertir a array con columnas dinámicas
  const alumnos = Object.values(alumnosMap).map(alumno => {
    return {
      ...alumno,
      ...fechasUnicas.reduce((acc, fecha) => {
        acc[fecha] = alumno.asistencias[fecha] || "";
        return acc;
      }, {})
    };
  });

  return { alumnos, fechasUnicas };
};

const ImprimirAsistenciaSemana = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState(''); 
  const [nombreescuela, setNombreescuela] = useState('');
  const [usuarioRegistro, setUsuarioRegistro] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');
  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('ASISTENCIA ESTUDIANTES');

  const queryParams = new URLSearchParams(search);
  const codigoParam = queryParams.get('codigo');

  console.log("codigoParam:", codigoParam);


  // 🔹 Decodificación de parámetros
  let sede = '', semestre = '', escuela = '', curricula = '', curso = '', seccion = '', tipo = '', grupo = '', sesion = '', clave = '';
  try {
    if (codigoParam) {
      const decoded = atob(atob(codigoParam));

      console.log("DECODED STRING:", decoded);

      [sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave] = decoded.split('|');

      console.log("PARAMETROS SPLIT:");
console.log("sede:", sede);
console.log("semestre:", semestre);
console.log("escuela:", escuela);
console.log("curso:", curso);
console.log("seccion:", seccion);
console.log("tipo:", tipo);
console.log("grupo:", grupo);
console.log("sesion:", sesion);

    }
    
  } catch (error) {
    console.error("❌ Error decodificando parámetros:", error);
  }

   const tipoFinal = tipo || 'T';
const grupoFinal = grupo || '1';

console.log("tipoFinal:", tipoFinal);
console.log("grupoFinal:", grupoFinal);


  const nombredocente = usuario?.docente?.nombrecompleto || '';
  const departamentoacademico = usuario?.docente?.departamentoacademico || '';
  const objetos = { sede, semestre, escuela, curricula, curso, seccion };

  useEffect(() => {
    if (!sede || !semestre || !escuela || !curricula || !curso || !seccion || !tipo || !grupo || !sesion)
 {
      setLoading(false);
      return;
    } 

    const token = usuario.codigotokenautenticadorunj;

    const fetchDatos = async () => {
      try {
  const resultado = await obtenerAsistenciasemana(
 sede,
 semestre,
 escuela,
 curricula,
 curso,
 seccion,
 tipo || 'T',
 grupo || '1',
 sesion || '17',
 token
);
console.log("PARAMETROS QUE VAN A API:");
console.log({
 sede,
 semestre,
 escuela,
 curricula,
 curso,
 seccion,
 tipoFinal,
 grupoFinal,
 sesionFinal: sesion || '17'
});



            console.log("RESULTADO API:", resultado);

       setDatos(resultado?.datos || []);

if (resultado?.datos?.length > 0)
{
  setUsuarioRegistro(resultado.datos[0].ur || '');
  setFechaRegistro(resultado.datos[0].fr || '');
}



        const nombresedeResp = await obtenerNombreConfiguracion('nombresede', { sede });
        setNombresede(typeof nombresedeResp === 'object' ? nombresedeResp?.valor || sede : nombresedeResp || sede);

        const nombreescuelaResp = await obtenerNombreConfiguracion('nombreescuela', { escuela });
        setNombreescuela(typeof nombreescuelaResp === 'object' ? nombreescuelaResp?.valor || '' : nombreescuelaResp || '');
      } catch (err) {
        console.error('❌ Error al cargar datos de acta:', err);
        setNombresede(sede);
        setNombreescuela('');
        setDatos([]);
        setUsuarioRegistro('');
        setFechaRegistro('');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave, departamentoacademico]);

  

  // 🔹 Transformar datos en estructura de tabla dinámica
  const { alumnos, fechasUnicas } = transformarDatos(datos);

  const columnasEncabezado = [
    [
      { titulo: 'No.', rowSpan: 2 },
      { titulo: 'CÓDIGO', rowSpan: 2 },
      { titulo: 'NOMBRE Y APELLIDO', rowSpan: 2 },
      { titulo: 'FECHAS DE ASISTENCIA', colSpan: fechasUnicas.length },
    ],
    fechasUnicas.map(fecha => ({ titulo: fecha }))
  ];

  const columnas = [
    { clave: 'alumno' },
    { clave: 'nombrecompleto' },
    ...fechasUnicas.map(fecha => ({ clave: fecha }))
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
              <TablaSkeleton filas={3} columnas={6} />
            ) : (
              <CabeceraActa
                titulomat={titulomat}
                sede={nombresede || sede}
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
              <TablaSkeleton filas={5} columnas={6} />
            ) : (
              <div className="tabla-acta-asistencia">
                <TablaCursoSub
                  datos={alumnos}
                  columnasEncabezado={columnasEncabezado}
                  columnas={columnas}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImprimirAsistenciaSemana;
