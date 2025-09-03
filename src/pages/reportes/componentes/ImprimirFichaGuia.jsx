import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from "qrcode.react";
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerListamatriculados, obtenerNombreConfiguracion } from '../logica/Reportes';
import TablaCursoSub from '../../reutilizables/componentes/TablaCursoSub';
import './ficha.css';

const fecha = new Date();
const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;


const horaActual = fecha.toLocaleTimeString('es-PE', {
  hour: '2-digit',
  minute: '2-digit',
});
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
            <td style={{ width: '25%', fontSize: '0.9rem', marginTop: '8px' }}>
              <div><strong>Fecha:</strong> {fechaFormateada} | <strong>Hora:</strong> {horaActual}</div>
            </td>
          </td>

          {/* Columna derecha - QR + FECHA Y HORA */}
          <td className="text-end" style={{ width: '25%', fontSize: '0.9rem' }}>
            <div className="col-12">
              
              
            <QRCodeSVG 
              value={urlActual}
              size={128}
              level="L"
              includeMargin={true}
            />
            
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
          <td>{objetos.curso}</td>
        </tr>
        <tr>
          <td><strong>Escuela:</strong></td>
          <td colSpan={3}>{nombreEscuela}</td>
        </tr>
      </tbody>
    </table>
  </>
);

const ImprimirFichaGuia = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState('');
  const [nombreescuela, setNombreescuela] = useState('');
  const [usuarioRegistro, setUsuarioRegistro] = useState('');
  
  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('FICHA DE SEGUIMIENTO DOCENTE AL ACCIONAR ESTUDIANTIL RESPECTO A LA GUÍA DE APRENDIZAJE');

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
  const objetos = { sede, semestre, escuela, curricula, curso, seccion};

  
  useEffect(() => {
    if (!sede || !semestre || !escuela || !curricula || !curso || !seccion ) {
      setLoading(false);
      return; 
    }

    const token = usuario.codigotokenautenticadorunj;
    
    const fetchDatos = async () => {
      try {
        const resultado = await obtenerListamatriculados(semestre, sede, escuela, curricula, curso, seccion, token);
        setDatos(resultado?.datos || []);

        if (resultado?.datos?.length > 0) {
          setUsuarioRegistro(resultado.datos[0].docente || '');
         
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
        
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [sede, semestre, escuela, curricula, curso, seccion, departamentoacademico]);

  console.log(datos);

  const columnasEncabezado = [
    [
      { titulo: 'No.', rowSpan: 2 },
      { titulo: 'DATOS DEL ESTUDIANTE', colSpan: 4 },
      { titulo: 'ACTIVIDADES REALIZADAS POR EL ESTUDIANTE', colSpan: 4 },
      { titulo: 'RETROALIMENTACION', colSpan: 3 },
      { titulo: 'OBSERVACION', rowSpan: 2 },


    ],
    [
      { titulo: 'CODIGO' }, { titulo: 'NOMBRE Y APELLIDO' }, { titulo: 'TELEFONO' }, { titulo: 'EMAIL INSTITUCIONAL' },
      { titulo: 'CONFIRMO RECEPCION DE GUIA' }, { titulo: 'CUMPLIO ACTIVIDAD' }, { titulo: 'CUMPLIO EVALUACION' }, { titulo: 'EVIDENCIA EVALUACION' },
      { titulo: 'PARTICIPO SI / NO' }, { titulo: 'FECHA' }, { titulo: 'TEMA' },

      
    ],

    
  ];

  const columnas = [
    
    { clave: 'alumno' }, { clave: 'nombrealumno' },{ clave: 'telefono' },{ clave: 'email_institucional' },
    { clave: '' }, { clave: '' },{ clave: '' },{ clave: '' },
    { clave: '' }, { clave: '' },{ clave: '' },
    { clave: '' },




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
              <div className="tabla-acta">
                <TablaCursoSub
                  datos={datos}
                  columnasEncabezado={columnasEncabezado}
                  columnas={columnas}
                />
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 🔹 Pie de última actualización */}
      <div className="text-end mt-4 pie-actualizacion">
        <p>
          Impreso por: usuario: {usuarioRegistro || '---'} 
        </p>
      </div>
    </>
  );
};

export default ImprimirFichaGuia;