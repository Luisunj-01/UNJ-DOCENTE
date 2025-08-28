import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';

import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerAsistenciasemana, obtenerNombreConfiguracion } from '../logica/Reportes';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import TablaCursoSub from '../../reutilizables/componentes/TablaCursoSub';

const CabeceraMatricula = ({ titulomat, sede, nombredocente, nombreEscuela, semestre, objetos}) => {
  const fecha = new Date();

  return (
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
            <td><strong>Sesion:</strong></td>
            <td>{objetos.sesion}</td>
          </tr>
          <tr>
            <td><strong>Escuela:</strong></td>
            <td colSpan={3}>{nombreEscuela}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

const ImprimirAsistenciaSemana = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState('No Definida');
  const [nombreescuela, setNombreescuela] = useState('No Definida');
  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('REGISTRO DE ASISTENCIA DE ESTUDIANTES');

  const queryParams2 = new URLSearchParams(search);
  const codigo2 = queryParams2.get('codigo');

  // 📌 aquí añadimos los nuevos parámetros
  let sede = '', semestre = '', escuela = '', curricula = '', curso = '', seccion = '', tipo = '', grupo = '', sesion = '', clave = '';
  try {
    if (codigo2) {
      const decoded2 = atob(atob(codigo2));
      [sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave] = decoded2.split('|');
    }
  } catch (error) {
    console.error("Error decodificando parámetros:", error);
  }

  const nombredocente = usuario?.docente?.nombrecompleto || '';
  const departamentoacademico = usuario?.docente?.departamentoacademico || '';

  const objetos = { sede, semestre, escuela, curricula, curso, seccion, sesion };

  useEffect(() => {
    if (!sede || !semestre || !escuela || !curricula || !curso || !seccion) {
      setLoading(false);
      return;
    }

    const fetchDatos = async () => {
      try {
        // 📌 enviamos también tipo, grupo, sesion y clave
        const resultadoAsistencia = await obtenerAsistenciasemana(
          sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave
        );

        const nombresedeResp = await obtenerNombreConfiguracion('nombresede', { sede });
        const nombreescuelaResp = await obtenerNombreConfiguracion('departamentoacademico', { departamentoacademico: departamentoacademico || '' });

        console.log("📌 Datos recibidos de la API:", resultadoAsistencia);

        setDatos(resultadoAsistencia?.datos || []);
        setNombresede(typeof nombresedeResp === 'object' ? nombresedeResp?.valor || '' : nombresedeResp);
        setNombreescuela(typeof nombreescuelaResp === 'object' ? nombreescuelaResp?.valor || '' : nombreescuelaResp);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [sede, semestre, escuela, curricula, curso, seccion, tipo, grupo, sesion, clave, departamentoacademico]);



  const columnasEncabezado = [
    [
      { titulo: 'No.', rowSpan: 2 },
      { titulo: 'Código', rowSpan: 2 },
      { titulo: 'Apellidos y Nombres.', rowSpan: 2 },
      { titulo: 'Fecha', colSpan: 5 },
      { titulo: 'Observacion' }, 
      
    ]
  ];

  const columnas = [
    { clave: 'alumno' },
    { clave: 'nombrecompleto' },
    { clave: 'fecha' }, 
    { clave: 'observacion' },
    
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
              <TablaSkeleton filas={3} columnas={5} />
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
              <TablaSkeleton filas={5} columnas={6} />
            ) : (
              <>
                <TablaCursos
                        datos={datos} 
                        columnasEncabezado={columnasEncabezado} 
                        columnas={columnas}
                    />
                
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImprimirAsistenciaSemana;
