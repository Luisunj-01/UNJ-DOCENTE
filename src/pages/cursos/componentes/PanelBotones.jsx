import React from 'react';
import {
  FaFileAlt,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaListAlt,
  FaCalendarCheck,
  FaTasks,
  FaBook,
  FaShieldVirus,
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useUsuario } from '../../../context/UserContext';
import config from "../../../config"; // ajusta la ruta
import axios from "axios";



const iconMap = {
  'Reporte carga académica': FaClipboardList,
  'Horario docente': FaTasks,
  'Informe Académico': FaFileAlt,
  // 'Horario alumno': FaClock,
  // 'Asistencia de estudiante': FaCalendarCheck,
  // 'Record de Notas': FaListAlt,
  // 'Plan Curricular': FaBook,
  // 'Record Curricular Integral': FaListAlt,
  // 'Record Detallado': FaListAlt,
  // 'Cursos Faltantes': FaFileAlt,
  // 'Cursos Disponibles': FaFileAlt,
  // 'Equivalencias procesadas': FaFileAlt,
  // 'DJ COVID': FaShieldVirus,
};

const colorMap = {
  'Reporte carga académica': 'primary',
  'Horario docente': 'info',
  'Informe Académico': 'success',
  // 'Horario alumno': 'warning',
  // 'Asistencia de estudiante': 'secondary',
  // 'Record de Notas': 'dark',
  // 'Plan Curricular': 'primary',
  // 'Record Curricular Integral': 'dark',
  // 'Record Detallado': 'dark',
  // 'Cursos Faltantes': 'danger',
  // 'Cursos Disponibles': 'success',
  // 'Equivalencias procesadas': 'info',
  // 'DJ COVID': 'danger',
};

const ventanaSecundaria = (url) => {
  window.open(url, 'Certificado', 'width=1200,height=700,scrollbars=yes');
};

const abrirInformeAcademico = async (semestre, persona) => {
  try {
    const response = await axios.get(
      `${config.apiUrl}api/reportes/informe-academico/${semestre}/${persona}`,
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    window.open(url, "InformeAcademico", "width=1200,height=700,scrollbars=yes");
  } catch (error) {
    console.error("Error al abrir informe académico", error);
    alert("No se pudo generar el informe académico");
  }
};


const PanelBotones = ({ dniusuario, persona, semestre, sede }) => {
  const { usuario } = useUsuario();
  const { id } = useParams();
  //const alumno = usuario.alumno.usuario;
  const codex = `${sede}|${semestre}|${persona}|${dniusuario}`;
  //const cod = `${alumno}|${sede}|${escuela}|${curricula}`;
  //$cod = $alumno.$sede.$escuela.$curricula;
  //const codex = alumno + escuela + curricula + semestre;
  //const cod =  alumno + sede + escuela + curricula;	
  const code_zet = btoa(btoa(codex));
  

  
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
      url: `${config.apiUrl}api/reportes/informe-academico/${semestre}/${persona}`,

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
                abrirInformeAcademico(semestre, persona);
              } else {
                ventanaSecundaria(url);
              }
            }}

            className={`d-flex flex-column align-items-center justify-content-center border border-${color} text-${color} bg-white rounded-4 shadow-sm m-2`}
            style={{ width: '158px', height: '59px', cursor: 'pointer' }}
          >
            <Icono size={22} className="mb-1" />
            <span className="text-center small fw-semibold">
              {texto.length > 18 ? texto.slice(0, 16) + '…' : texto}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PanelBotones;
