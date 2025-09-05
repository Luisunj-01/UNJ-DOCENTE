import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from "qrcode.react";
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenerNombreConfiguracion, obtenerasistenciaguia } from '../logica/Reportes';
import TablaCursoSub from '../../reutilizables/componentes/TablaCursoSub';
import './guias.css';

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

// 🔹 Genera columnas dinámicamente a partir de un registro de datos
const generarColumnas = (rowEjemplo) => {
  const semanas = [];
  Object.keys(rowEjemplo).forEach((key) => {
    const match = key.match(/^r(\d+)[cae]$/);
    if (match) {
      const semana = parseInt(match[1], 10);
      if (!semanas.includes(semana)) {
        semanas.push(semana);
      }
    }
  });

  semanas.sort((a, b) => a - b);

  const fila1 = [
    { titulo: 'Nro.', rowSpan: 2 },
    { titulo: 'CODIGO', rowSpan: 2 },
    { titulo: 'NOMBRE Y APELLIDO', rowSpan: 2 },
    ...semanas.map((s) => ({
      titulo: `SEMANA ${String(s).padStart(2, '0')}`,
      colSpan: 3,
    })),
  ];

  const fila2 = semanas.flatMap(() => [
    { titulo: 'ACT' },
    { titulo: 'EVI' },
    { titulo: 'PAR' },
  ]);

  const columnas = [
    { clave: 'alumno' },
    { clave: 'nombrecompleto' },
    ...semanas.flatMap((s) => {
      const n = String(s).padStart(2, '0');
      return [
        { clave: `r${n}c` },
        { clave: `r${n}a` },
        { clave: `r${n}e` },
      ];
    }),
  ];

  return { columnasEncabezado: [fila1, fila2], columnas };
};

const ImprimirAsistenciaGuia = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombresede, setNombresede] = useState('');
  const [nombreescuela, setNombreescuela] = useState('');
  const [usuarioRegistro, setUsuarioRegistro] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');

  const [columnasEncabezado, setColumnasEncabezado] = useState([]);
  const [columnas, setColumnas] = useState([]);

  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [titulomat] = useState('REGISTRO DE SESIONES DE CLASE');

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
        const resultado = await obtenerasistenciaguia(sede, semestre, escuela, curricula, curso, seccion, token);
        setDatos(resultado?.datos || []);

        if (resultado?.datos?.length > 0) {
          setUsuarioRegistro(resultado.datos[0].ur || '');
          setFechaRegistro(resultado.datos[0].fr || '');

          // 🔹 Generar dinámicamente columnas según los datos
          const { columnasEncabezado, columnas } = generarColumnas(resultado.datos[0]);
          setColumnasEncabezado(columnasEncabezado);
          setColumnas(columnas);
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

  console.log(datos);

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
    </>
  );
};

export default ImprimirAsistenciaGuia;
