import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';

import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';

import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';
import { obtenercargadocente } from '../logica/Reportes';
//mport '../../../resource/reportes.css'; //

const CabeceraMatricula = ({ titulomat, nombreAlumno, pre, nombreEscuela, alumno, escuela, semestre }) => {
    const fecha = new Date();
    const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;
    
  return (
    <>
        <Cabecerareporte titulomat={titulomat} />


        <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>

        <table className="table ">
            <tbody>
                

                {/* Datos del alumno */}
                <tr>
                <td><strong>Carrera:</strong></td>
                <td colSpan="3"><strong>{escuela}</strong></td>
                </tr>
                <tr>
                <td><strong>Código:</strong></td>
                <td>{alumno}</td>
                <td><strong>Alumno:</strong></td>
                <td>{nombreAlumno}</td>
                </tr>
                <tr>
                <td><strong>Semestre:</strong></td>
                <td>{semestre}</td>
                <td><strong>Fecha:</strong></td>
                <td>{fechaFormateada}</td>
                </tr>
            </tbody>
        </table>


    </>
  );
};


const Imprimirdocentesemestrecarga = () => {
  const [datos, setDatos] = useState([]);
  const [creditos, setCreditos] = useState({ obligatorios: 0, electivos: 0 });
  const [loading, setLoading] = useState(true);
  const [infoAlumno, setInfoAlumno] = useState(null);
  const { usuario } = useUsuario();
  const { state, search } = useLocation();
  const [titulomat, setTitulomat] = useState('REPORTE CARGA ACADÉMICA');
  const [pre, setPre] = useState(0);
  const [nombreescuela, setNombreescuela] = useState('No Definida');
  
  const queryParams = new URLSearchParams(search);
  const codigo = queryParams.get('codigo');
  const decoded = atob(atob(codigo));
  const [sede, semestre, persona, dniusuario] = decoded.split('|');
  


 
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const resultadomatricula = await obtenercargadocente(sede, semestre, persona);
       // const nombreescuela = await obtenerNombreConfiguracion('nombreescuela', {escuela: escuela});
        const datos = resultadomatricula.datos;

        let saltoboleta = 20;
        let saltomatricula = 20;
        let pre = 0;
        

        if (datos && datos.length > 0) {
            const row = datos[0];
            const preValue = row.pre ?? 0;

            setPre(preValue);
            setTitulomat(preValue === 1 ? "REPORTE CARGA ACADÉMICA" : "REPORTE CARGA ACADÉMICA");
        }

        setDatos(datos); // Opcional: guarda datos si los necesitas
        setNombreescuela(nombreescuela);

      } catch (err) {
        console.error('Error al cargar matrícula:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  console.log(datos);

    const creditooselectivos = '';
    const columnas = [
        {
            clave: 'curso',
            titulo: 'Curso',
            render: (fila) => `${fila.curricula} ${fila.curso}` // <-- Cambia por las claves reales
        },
        {
            clave: 'session',
            titulo: 'Sec.',
            render: (fila) => `${fila.seccion} ${fila.practica}`, // <-- Cambia por las claves reales
        },
        { clave: 'nombrecurso', titulo: 'Nombre del Curso'},
        { clave: 'ciclo', titulo: 'Cic.'},
        { 
            clave: 'nrocreditos', 
            titulo: 'Cré.', 
            render: (fila) => fila.nrocreditos
        },
        { clave: 'tipocurso', titulo: 'Tip.'},
        { clave: 'vez', titulo: 'Vez'},
    ];

    const totalCreditos = datos.reduce((sum, fila) => sum + parseInt(fila.nrocreditos), 0);

  return (
    <>
        <button className="print-button" onClick={() => window.print()}>
            <FaPrint />
        </button>
        {/* <CabeceraMatricula titulomat={titulomat}  />*/}
      
        <Cabecerareporte titulomat={titulomat} />
        <div className="container mt-4">
            

            <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>
            

            <div className="row mt-3">
                <div className="col-12">
                {loading ? (
                    <TablaSkeleton filas={6} columnas={8} />
                ) : datos.length === 0 ? (
                    <TablaCursos datos={datos} columnas={columnas} />
                ) : (
                    <>
                    <TablaCursos
                        datos={datos}
                        columnas={columnas}
                        usarDataTable={true}
                        mostrarBuscador={false}
                        paginacion={false}
                        colorFondoEncabezado="#004080"
                         colorTextoEncabezado="#ffffff"
                    />

                    <div style={{ border: '2px solid #035aa6', margin: '20px 0' }}></div>

                    <div className="row">
                        <div className="col-md-6">
                        <table class="table w-50">
                            <tbody>
                            <tr>
                                <td><strong>Créditos Obligatorios:</strong></td>
                                <td className="text-end"><strong>{datos.length}</strong></td>
                            </tr>
                            <tr>
                                <td><strong>Créditos Electivos mínimos:</strong></td>
                                <td className="text-end"><strong>{totalCreditos}</strong></td>
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

export default Imprimirdocentesemestrecarga;
