import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from "qrcode.react";
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerReportenotas, obtenerNombreConfiguracion } from '../logica/Reportes';
import TablaCursoSub from '../../reutilizables/componentes/TablaCursoSub';
import './nota.css';

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
            <td style={{ width: '15%', fontSize: '0.9rem', marginTop: '8px' }}>
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

const ImprimirReporteNota = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState('');
  const [nombreescuela, setNombreescuela] = useState('');
  const [usuarioRegistro, setUsuarioRegistro] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');

  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('REGISTRO DE EVALUACION');

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
        const resultado = await obtenerReportenotas(sede, semestre, escuela, curricula, curso, seccion, '2');

        //console.log(resultado);
        setDatos(resultado?.datos || []);

        if (resultado?.datos?.length > 0) {
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
  }, [sede, semestre, escuela, curricula, curso, seccion, departamentoacademico]);

  //console.log(datos);

  const columnasEncabezado = [
  [
    { titulo: 'No.', rowSpan: 2 },
    { titulo: 'CÓDIGO', rowSpan: 2 },
    { titulo: 'APELLIDOS Y NOMBRES', rowSpan: 2 },
    { titulo: 'PRIMER PROMEDIO', colSpan: 4 },
    { titulo: 'SEGUNDO PROMEDIO', colSpan: 4 },
    { titulo: 'TERCER PROMEDIO', colSpan: 4 },
    { titulo: 'NF', rowSpan: 2 },
    { titulo: 'SUS', rowSpan: 2 },
    { titulo: 'APLA', rowSpan: 2 },
    { titulo: 'PF', rowSpan: 2 },
  ],
  [
    { titulo: 'EC' }, { titulo: 'EP' }, { titulo: 'EA' }, { titulo: 'Prom' },
    { titulo: 'EC' }, { titulo: 'EP' }, { titulo: 'EA' }, { titulo: 'Prom' },
    { titulo: 'EC' }, { titulo: 'EP' }, { titulo: 'EA' }, { titulo: 'Prom' },
  ]
];


 const columnas = [
  { clave: 'alumno' },
  { clave: 'nombrecompleto' },

  { clave: 'u01ec' },
  { clave: 'u01ep' },
  { clave: 'u01ea' },
  { clave: 'u01pr', estilo: 'promedio' },

  { clave: 'u02ec' },
  { clave: 'u02ep' },
  { clave: 'u02ea' },
  { clave: 'u02pr', estilo: 'promedio' },

  { clave: 'u03ec' },
  { clave: 'u03ep' },
  { clave: 'u03ea' },
  { clave: 'u03pr', estilo: 'promedio' },

  { clave: 'promedioantes', estilo: 'promedio' },
  { clave: 'sus', estilo: 'final-rojo' },
  { clave: 'aplazado', estilo: 'final-rojo' },
  { clave: 'promedio', estilo: 'final-rojo' },
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
              <table className="tabla-acta-nota">
                <TablaCursoSub
                  datos={datos}
                  columnasEncabezado={columnasEncabezado}
                  columnas={columnas}
                />
              </table>
            )}
          </div>
        </div>


        <div className="row mt-8 firmas-acta mt-4">
  <div className="col-12 d-flex justify-content-start align-items-start">
    {/* Tabla resumen */}
    {datos.length > 0 && (
      <table className="table table-bordered tabla-resumen-acta">
        <thead>
          <tr>
            <th></th>
            <th>Apro.</th>
            <th>Des.</th>
            <th>% Apro.</th>
            <th>% Des.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Primer promedio</td>
            <td>{datos[0].a01}</td>
            <td>{datos[0].d01}</td>
            <td>{datos[0].pa01}</td>
            <td>{datos[0].pd01}</td>
          </tr>
          <tr>
            <td>Segundo promedio</td>
            <td>{datos[0].a02}</td>
            <td>{datos[0].d02}</td>
            <td>{datos[0].pa02}</td>
            <td>{datos[0].pd02}</td>
          </tr>
          <tr>
            <td>Tercer promedio</td>
            <td>{datos[0].a03}</td>
            <td>{datos[0].d03}</td>
            <td>{datos[0].pa03}</td>
            <td>{datos[0].pd03}</td>
          </tr>
          <tr>
            <td><strong>Promedio final</strong></td>
            <td><strong>{datos[0].a04}</strong></td>
            <td><strong>{datos[0].d04}</strong></td>
            <td><strong>{datos[0].pa04}</strong></td>
            <td><strong>{datos[0].pd04}</strong></td>
          </tr>
        </tbody>
      </table>
    )}

    {/* Firma docente */}
    <div className="firma-docente text-center ms-12">
      <p>...........................................................</p>
      <p><strong>{nombredocente}</strong></p>
      <p><small>DOCENTE UNJ</small></p>
    </div>
  </div>
</div>
      </div>

      {/* 🔹 Resumen de acta 
      
      <div className="row mt-4 text-center resumen-acta">
        <div className="col">
          <p><strong>Matriculados:</strong> {datos.length}</p>
        </div>
        <div className="col">
          <p><strong>Aprobados:</strong> {datos.filter(d => Number(d.promediomascara) >= 11).length}</p>
        </div>
        <div className="col">
          <p><strong>Desaprobados:</strong> {datos.filter(d => Number(d.promediomascara) < 11).length}</p>
        </div>
        <div className="col">
          <p><strong>Reserva:</strong> 0</p>
        </div>
        <div className="col">
          <p><strong>Verificación:</strong> 251</p>
        </div>
      </div>
      
      */}
      




    </>
  );
};

export default ImprimirReporteNota;