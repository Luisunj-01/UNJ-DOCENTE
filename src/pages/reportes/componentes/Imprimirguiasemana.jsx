import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';

import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';

import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerguiasemana, obtenerNombreConfiguracion } from '../logica/Reportes';
import TablaCursoSub from '../../reutilizables/componentes/TablaCursoSub';

const CabeceraMatricula = ({ titulomat, sede, nombredocente, nombreEscuela, semestre, objetos }) => {
  const fecha = new Date();
  const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;

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
            <td><strong>Fecha:</strong></td>
            <td>{fechaFormateada}</td>
          </tr>
          <tr>
            <td><strong>Curricula:</strong></td>
            <td>{objetos.curricula}</td>
            <td><strong>Sección:</strong></td>
            <td>{objetos.seccion}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

const Imprimirguiasemana = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState('No Definida');
  const [nombreescuela, setNombreescuela] = useState('No Definida');
  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('FS-01: FICHA DE SEGUIMIENTO DOCENTE AL ACCIONAR ESTUDIANTIL RESPECTO A LA GUIA DE APRENDIZAJE');

  const queryParams2 = new URLSearchParams(search);
  const codigo2 = queryParams2.get('codigo');
  const semana = queryParams2.get('semana');

  
  let sede = '', semestre = '', escuela = '', curricula = '', curso = '', seccion = '';
  try {
    if (codigo2) {
      const decoded2 = atob(atob(codigo2));
      [sede, semestre, escuela, curricula, curso, seccion] = decoded2.split('|');
      
    }
  } catch (error) {
    console.error("Error decodificando parámetros:", error);
  }

  const nombredocente = usuario?.docente?.nombrecompleto || '';
  const departamentoacademico = usuario?.docente?.departamentoacademico || '';

  const objetos = {
        sede: sede,
        semestre: semestre,
        escuela: escuela,
        curricula: curricula,
        curso: curso, seccion
      }
      
  useEffect(() => {
    if (!sede || !semestre || !escuela || !curricula  || !curso || !seccion || !semana) {
      setLoading(false);
      return;
    }

    console.log(semestre);

    const fetchDatos = async () => {
      try {
        const resultadomatricula = await obtenerguiasemana(sede, semestre, escuela, curricula, curso, seccion, semana);
        const nombresedeResp = await obtenerNombreConfiguracion('nombresede', { sede });
        const nombreescuelaResp = await obtenerNombreConfiguracion('departamentoacademico', { departamentoacademico });

        setDatos(resultadomatricula?.datos || []);

        setNombresede(typeof nombresedeResp === 'object' ? nombresedeResp?.valor || '' : nombresedeResp);
        setNombreescuela(typeof nombreescuelaResp === 'object' ? nombreescuelaResp?.valor || '' : nombreescuelaResp);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [sede, semestre, escuela, curricula, curso, seccion, semana, departamentoacademico]);


  const columnasEncabezado = [
    [
      { titulo: 'No.', rowSpan: 2 },
      { titulo: 'Código', rowSpan: 2 },
      { titulo: 'Apellidos y Nombres.', rowSpan: 2 },
      { titulo: 'Celular', rowSpan: 2 },
      { titulo: 'Correo Institucional.', rowSpan: 2 },
     
      { titulo: 'Actividades Realizadas', colSpan: 5 },
      
    ],
    [
      { titulo: 'Actividad' }, { titulo: 'Evidencia' }, { titulo: 'Participo' }, { titulo: 'Minutos' }, { titulo: 'Observación' },
      
    ]
  ];

  const columnas = [
    { clave: 'alumno' },
    { clave: 'nombrecompleto' },
    { clave: 'celular' },
    { clave: 'email_institucional' },
    { clave: 'actividad' }, { clave: 'evidencia' }, { clave: 'participo' }, { clave: 'minutos' }, { clave: 'tema' },
    
  ];

  const totalHorasTeoria = datos.reduce((sum, fila) => sum + Number(fila.horasteoria || 0), 0);
  const totalHorasPractica = datos.reduce((sum, fila) => sum + Number(fila.horaspractica || 0), 0);
  const totalHT = totalHorasTeoria + totalHorasPractica;

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
              <TablaSkeleton filas={6} columnas={8} />
            ) : (
              <>
                <TablaCursoSub
                        datos={datos} 
                        columnasEncabezado={columnasEncabezado} 
                        columnas={columnas}
                    />
                <div className="row">
                  <div className="col-md-7"></div>
                  <div className="col-md-5">
                    <table className="table">
                      <tbody>
                        <tr>
                          <td></td><td></td>
                          <td style={{ textAlign: 'center' }}><strong>{totalHorasTeoria}</strong></td>
                          <td style={{ textAlign: 'center' }}><strong>{totalHorasPractica}</strong></td>
                          <td style={{ textAlign: 'center' }}><strong>{totalHT}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Imprimirguiasemana;
