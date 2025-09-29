import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../../context/UserContext';
import { useLocation } from 'react-router-dom';

import { TablaSkeleton } from '../../reutilizables/componentes/TablaSkeleton';
import TablaCursos from '../../reutilizables/componentes/TablaCursos';
import { FaPrint } from 'react-icons/fa';
import Cabecerareporte from './Cabecerareporte';

import { obtenercargadocente, obtenerNombreConfiguracion } from '../logica/Actividades';

const CabeceraMatricula = ({ titulomat, sede, nombredocente, nombreEscuela, semestre }) => {
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
                </tbody>
            </table>
        </>
    );
};

const ImprimirHorarioDocente = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nombresede, setNombresede] = useState('No Definida');
    const [nombreescuela, setNombreescuela] = useState('No Definida');
    const { usuario } = useUsuario();
    const { search } = useLocation();
    const [titulomat] = useState('REPORTE CARGA ACADÉMICA');

    // 🔹 Manejo seguro del código
    const queryParams = new URLSearchParams(search);
    const codigo = queryParams.get('codigo');

    let sede = '', semestre = '', persona = '', dniusuario = '';

    if (codigo) {
        try {
            const decoded = atob(atob(codigo));
            [sede, semestre, persona, dniusuario] = decoded.split('|');
            console.log('Decodificado:', { sede, semestre, persona, dniusuario });
        } catch (err) {
            console.error('Error al decodificar el código:', err);
        }
    } else {
        console.error('No se encontró parámetro "codigo" en la URL');
    }

    const nombredocente = usuario?.docente?.nombrecompleto || '';
    const departamentoacademico = usuario?.docente?.departamentoacademico || '';

    useEffect(() => {
        if (!sede || !persona) {
            console.warn('No se tienen parámetros válidos para llamar a la API');
            setLoading(false);
            return;
        }

        const fetchDatos = async () => {
            try {
                const resultadomatricula = await obtenercargadocente(sede, semestre, persona);
                console.log('Respuesta cruda de la API:', resultadomatricula);

                // Siempre devolver array aunque esté vacío
                setDatos(resultadomatricula?.datos || []);

                const nombresedeResp = await obtenerNombreConfiguracion('nombresede', { sede });
                const nombreescuelaResp = await obtenerNombreConfiguracion('departamentoacademico', { departamentoacademico });

                setNombresede(
                    typeof nombresedeResp === 'object' ? nombresedeResp?.valor || JSON.stringify(nombresedeResp) : nombresedeResp
                );
                setNombreescuela(
                    typeof nombreescuelaResp === 'object' ? nombreescuelaResp?.valor || JSON.stringify(nombreescuelaResp) : nombreescuelaResp
                );
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setDatos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDatos();
    }, [sede, semestre, persona, departamentoacademico]);

    const columnas = [
        { clave: 'curso', titulo: 'Curso', render: (fila) => String(fila.curso || '') },
        { clave: 'nombrecurso', titulo: 'Nombre del Curso' },
        { clave: 'session', titulo: 'Sec.', render: (fila) => `${fila.seccion || ''} ${fila.practica || ''}` },
        { clave: 'nombreescuela', titulo: 'Escuela' },
        { clave: 'tipo', titulo: 'Tipo' },
        { clave: 'practica', titulo: 'Gru' },
        { clave: 'horasteoria', titulo: 'Ht' },
        { clave: 'horaspractica', titulo: 'Hp' },
        { clave: 'horastotal', titulo: 'HT' }
    ];

    const totalHorasTeoria = datos.reduce((sum, fila) => sum + Number(fila.horasteoria || 0), 0);
    const totalHorasPractica = datos.reduce((sum, fila) => sum + Number(fila.horaspractica || 0), 0);

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
                                <TablaCursos
                                    datos={datos}
                                    columnas={columnas}
                                    usarDataTable={true}
                                    mostrarBuscador={false}
                                    paginacion={false}
                                    colorFondoEncabezado="#004080"
                                    colorTextoEncabezado="#ffffff"
                                />
                                {/* 🔹 Depuración temporal */}
                                <pre>{JSON.stringify(datos, null, 2)}</pre>

                                <div className="row">
                                    <div className="col-md-7"></div>
                                    <div className="col-md-5">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td></td><td></td>
                                                    <td style={{ textAlign: 'center' }}><strong>{totalHorasTeoria}</strong></td>
                                                    <td style={{ textAlign: 'center' }}><strong>{totalHorasPractica}</strong></td>
                                                    <td style={{ textAlign: 'center' }}><strong>{totalHorasTeoria}</strong></td>
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

export default ImprimirHorarioDocente;
