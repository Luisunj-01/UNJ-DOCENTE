import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerActaDetalle, obtenerNombreConfiguracion } from '../logica/Reportes';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';

// 🔹 Cabecera del acta
const CabeceraActa = ({ titulomat, sede, nombredocente, nombreCurso, nombreEscuela, semestre, objetos }) => (
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
            <td><strong>Curso:</strong></td>
            <td >{objetos.curso}</td>
            

        </tr>
        <tr>
          <td><strong>Escuela:</strong></td>
          <td colSpan={3}>{nombreEscuela}</td>
        </tr>
      </tbody>
    </table>
  </>
);

const ImprimirActaDetalle = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState('');
  const [nombreescuela, setNombreescuela] = useState('');


  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('ACTA DE EVALUACIONES');

  const queryParams = new URLSearchParams(search);
  const codigoParam = queryParams.get('codigo');

  // 🔹 Decodificación de parámetros
  let sede = '', semestre = '', escuela = '', curricula = '', curso = '', seccion = '';
  try {
    if (codigoParam) {
      const decoded = atob(atob(codigoParam));
      [sede, semestre, escuela, curricula, curso, seccion] = decoded.split('|');
    }
  } catch (error) {
    console.error("❌ Error decodificando parámetros:", error);
  }

  const nombredocente = usuario?.docente?.nombrecompleto || '';
  const departamentoacademico = usuario?.docente?.departamentoacademico || '';
  const objetos = { sede, semestre, escuela, curricula, curso, seccion };

  useEffect(() => {
    if (!sede || !semestre || !escuela || !curricula || !curso || !seccion) {
      setLoading(false);
      return;
    }

    const fetchDatos = async () => {
      try {
        // 🔹 Obtener los datos del acta
        const resultado = await obtenerActaDetalle(sede, semestre, escuela, curricula, curso, seccion);
        setDatos(resultado?.datos || []);
     

        // 🔹 Obtener nombre descriptivo de la sede
        const nombresedeResp = await obtenerNombreConfiguracion('nombresede', { sede });
        setNombresede(typeof nombresedeResp === 'object' ? nombresedeResp?.valor || sede : nombresedeResp || sede);

        // 🔹 Obtener nombre descriptivo de la escuela (igual que en módulo de asistencia)
        const nombreescuelaResp = await obtenerNombreConfiguracion('nombreescuela', { escuela });
        setNombreescuela(typeof nombreescuelaResp === 'object' ? nombreescuelaResp?.valor || '' : nombreescuelaResp || '');

 

      } catch (err) {
        console.error('❌ Error al cargar datos de acta:', err);
        setNombresede(sede);
        setNombreescuela('');
        setDatos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [sede, semestre, escuela, curricula, curso, seccion, departamentoacademico]);

  // ✅ Columnas del acta
  const columnasEncabezado = [
    [
      { titulo: 'No.', rowSpan: 2 },
      { titulo: 'Código', rowSpan: 2 },
      { titulo: 'Apellidos y Nombres', rowSpan: 2 },
      { titulo: 'Nota 1' },
      { titulo: 'Nota 2' },
      { titulo: 'Promedio' }
    ]
  ];

  const columnas = [
    { clave: 'alumno' },
    { clave: 'nombrecompleto' },
    { clave: 'nota1' },
    { clave: 'nota2' },
    { clave: 'promedio' }
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
                //nombreCurso={nombrecurso}
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
                
              <TablaCursos datos={datos} columnasEncabezado={columnasEncabezado} columnas={columnas} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImprimirActaDetalle;
