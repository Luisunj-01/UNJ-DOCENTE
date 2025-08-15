import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPrint } from 'react-icons/fa';
import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import Cabecerareporte from './Cabecerareporte';
import {
  obtenerDatoshorariodocente,
  obtenerDatoshorariodocentecalendario,
  obtenerNombreConfiguracion
} from '../logica/Reportes';
import { useUsuario } from '../../../context/UserContext';

const Imprimirhorariodocente = () => {
  const [datos, setDatos] = useState([]);
  const [datoscalendario, setDatoscalendario] = useState([]);
  const [nombresede, setNombresede] = useState('No Definida');
  const [nombreescuela, setNombreescuela] = useState('No Definida');
  const { usuario } = useUsuario();
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(search);
  const codigo = queryParams.get('codigo');
  const decoded = atob(atob(codigo || ''));
  const [sede, semestre, persona] = decoded.split('|');

  const nombredocente = usuario?.docente?.nombrecompleto || '';
  const departamentoacademico = usuario?.docente?.departamentoacademico || '';
  const titulomat = 'REPORTE CARGA ACADÉMICA';

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const alumno = await obtenerDatoshorariodocente(sede, semestre, persona);

        const nombresedeResp = await obtenerNombreConfiguracion('nombresede', { sede });
        const nombreescuelaResp = await obtenerNombreConfiguracion('departamentoacademico', { departamentoacademico });

        setDatos(alumno.datos || []);
        setNombresede(typeof nombresedeResp === 'object' ? nombresedeResp?.valor || '' : nombresedeResp);
        setNombreescuela(typeof nombreescuelaResp === 'object' ? nombreescuelaResp?.valor || '' : nombreescuelaResp);

        const calendario = await obtenerDatoshorariodocentecalendario(persona, semestre);
        setDatoscalendario(calendario.datos || []);
      } catch (err) {
        console.error('Error al cargar los datos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sede && semestre && persona) {
      fetchDatos();
    }
  }, [sede, semestre, persona, departamentoacademico]);

  const CabeceraMatricula = ({ titulomat, sede, nombredocente, nombreEscuela, semestre }) => {
    const fecha = new Date().toLocaleDateString('es-PE');
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
              <td><strong>Escuela:</strong></td>
              <td colSpan="3"><strong>{nombreEscuela}</strong></td>
            </tr>
            <tr>
              <td><strong>Semestre:</strong></td>
              <td>{semestre}</td>
              <td><strong>Fecha:</strong></td>
              <td>{fecha}</td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  const renderFilas = () =>
    datos.map((curso, index) => (
      <tr key={index}>
        <td style={{ background: curso.codigo }}></td>
        <td style={{textAlign: 'center'}}>{curso.curso}</td>
        
        <td tyle={{textAlign: 'center'}}>{curso.nombrecurso}</td>
        <td tyle={{textAlign: 'center'}} className="text-center">{curso.seccion}</td>
        <td tyle={{textAlign: 'center'}} className="text-center">{curso.nombreescuela}</td>
        <td tyle={{textAlign: 'center'}} className="text-center">{curso.tipo}</td>
        <td tyle={{textAlign: 'center'}} className="text-center">{curso.horasteoria}</td>
        <td tyle={{textAlign: 'center'}} className="text-center">{curso.horaspractica}</td>
      </tr>
    ));

  if (loading) return <TablaSkeleton filas={15} columnas={8} />;

  return (
    <>
      <button className="print-button" onClick={() => window.print()}>
        <FaPrint />
      </button>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <CabeceraMatricula
              titulomat={titulomat}
              sede={nombresede}
              nombredocente={nombredocente}
              nombreEscuela={nombreescuela}
              semestre={semestre}
            />
          </div>
        </div>

        <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>

        <table className="table table-bordered">
          <thead>
            <tr>
                <th style={{ background: "#004080", color: 'white' }}></th>
              <th style={{ background: "#004080", color: 'white' }}>Curso</th>
              
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }}>Nombre del Curso</th>
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }} className="text-center">Sec.</th>
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }} className="text-center">Escuela</th>
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }} className="text-center">Tipo</th>
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }} className="text-center">Gru</th>
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }} className="text-center">Ht</th>
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }} className="text-center">Hp</th>
              <th style={{ background: "#004080", color: 'white', textAlign: 'center' }} className="text-center">Ht</th>
            </tr>
          </thead>
          <tbody>{renderFilas()}</tbody>
        </table>

        <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>

        <div className="calendario mt-4">
          <table className="table table-bordered text-center align-middle">
            <thead>
              <tr>
                <th style={{ background: "#004080", color: "white" }}>Horario</th>
                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia) => (
                  <th key={dia} style={{ background: "#004080", color: "white" }}>{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datoscalendario.map((fila, index) => {
                const getCell = (valor) => {
                  const match = valor?.match(/(#[0-9A-Fa-f]{6})(?:\[(.*?)\])?/);
                  return {
                    color: match ? match[1] : "#FFFFFF",
                    text: match && match[2] ? match[2] : ""
                  };
                };

                return (
                  <tr key={index}>
                    <td><strong>{fila.horario}</strong></td>
                    {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map((dia) => {
                      const cell = getCell(fila[dia]);
                      return (
                        <td
                          key={dia}
                          style={{
                            backgroundColor: cell.color,
                            border: "1px solid #ccc",
                            minWidth: "80px"
                          }}
                        >
                          {cell.text}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Imprimirhorariodocente;
