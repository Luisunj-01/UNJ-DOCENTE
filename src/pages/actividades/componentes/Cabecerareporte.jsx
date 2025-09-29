import React from 'react';

const Cabecerareporte = ({titulomat}) => {
    const fecha = new Date();
    const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;
    const horaActual = fecha.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return(
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
                </td>

                {/* Columna derecha - FECHA Y HORA */}
                <td className="text-end" style={{ width: '25%', fontSize: '0.9rem' }}>
                    <div><strong>Fecha:</strong> {fechaFormateada}</div>
                    <div><strong>Hora:</strong> {horaActual}</div>
                </td>
                </tr>
            </tbody>
        </table>
    );
};

export default Cabecerareporte