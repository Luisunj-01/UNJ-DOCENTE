import React, { useState } from 'react';
import {
  FaFileAlt,
  FaClipboardList,
  FaTasks,
  FaSpinner,
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useUsuario } from '../../../context/UserContext';
import config from "../../../config";
import axios from "axios";

const iconMap = {
  'Reporte carga académica': FaClipboardList,
  'Horario docente': FaTasks,
  'Informe Académico': FaFileAlt,
};

const colorMap = {
  'Reporte carga académica': 'primary',
  'Horario docente': 'info',
  'Informe Académico': 'success',
};

const ventanaSecundaria = (url) => {
  window.open(url, 'Certificado', 'width=1200,height=700,scrollbars=yes');
};

// const abrirInformeAcademico = async (semestre, persona, setLoading) => {
//   // abrir ventana inmediatamente para evitar bloqueo de popup
//   const nuevaVentana = window.open("", "InformeAcademico", "width=1200,height=700,scrollbars=yes");

//   try {
//     setLoading(true);
//     const response = await axios.get(
//       `${config.apiUrl}api/reporte-academico2/${semestre}/${persona}`,
//       { responseType: "blob" }
//     );

//     const blob = new Blob([response.data], { type: "application/pdf" });
//     const url = URL.createObjectURL(blob);

//     // cargar el PDF en la ventana ya abierta
//     nuevaVentana.location.href = url;
//   } catch (error) {
//     console.error("Error al abrir informe académico", error);
//     alert("No se pudo generar el informe académico");
//     nuevaVentana.close();
//   } finally {
//     setLoading(false);
//   }
// };

const abrirInformeAcademico = (semestre, persona, setLoading) => {
  // abrir ventana inmediatamente (evita bloqueo de popup)
  const nuevaVentana = window.open(
    "",
    "InformeAcademico",
    "width=1200,height=700,scrollbars=yes"
  );

  try {
    setLoading(true);

    const url = `${config.apiUrl}api/reporte-academico2/${semestre}/${persona}`;

    // cargar directamente el HTML (Blade)
    nuevaVentana.location.href = url;

  } catch (error) {
    console.error("Error al abrir informe académico", error);
    alert("No se pudo abrir el informe académico");
    nuevaVentana.close();
  } finally {
    setLoading(false);
  }
};



const PanelBotones = ({ dniusuario, persona, semestre, sede }) => {
  const { usuario } = useUsuario();
  const { id } = useParams();
  const codex = `${sede}|${semestre}|${persona}|${dniusuario}`;
  const code_zet = btoa(btoa(codex));

  const [loading, setLoading] = useState(false);

  const enlaces = [
    {
      texto: 'Reporte carga académica',
      url: `Imprimirdocentesemestrecarga?codigo=${code_zet}`,
    },
    {
      texto: 'Horario docente',
      url: `Imprimirhorariodocente?codigo=${code_zet}`,
    },
    {
      texto: 'Informe Académico',
      url: `${config.apiUrl}api/reporte-academico2/${semestre}/${persona}`,
    },
  ];

  return (
    <div className="d-flex flex-wrap justify-content-center mt-4">
      {enlaces.map(({ texto, url }) => {
        const Icono = iconMap[texto] || FaFileAlt;
        const color = colorMap[texto] || 'secondary';

        return (
          <button
            key={texto}
            onClick={() => {
              if (texto === 'Informe Académico') {
                abrirInformeAcademico(semestre, persona, setLoading);
              } else {
                ventanaSecundaria(url);
              }
            }}
            className={`d-flex flex-column align-items-center justify-content-center border border-${color} text-${color} bg-white rounded-4 shadow-sm m-2`}
            style={{ width: '158px', height: '59px', cursor: 'pointer' }}
            disabled={loading && texto === 'Informe Académico'}
          >
            {loading && texto === 'Informe Académico' ? (
              <>
                <FaSpinner size={22} className="mb-1 spin" />
                <span className="text-center small fw-semibold">Cargando…</span>
              </>
            ) : (
              <>
                <Icono size={22} className="mb-1" />
                <span className="text-center small fw-semibold">
                  {texto.length > 18 ? texto.slice(0, 16) + '…' : texto}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PanelBotones;
