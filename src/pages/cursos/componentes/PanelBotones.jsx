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

const iconMap = {
  'Ficha de Matrícula': FaClipboardList,
  'Avance académico': FaTasks,
  'Constancia de Notas': FaFileAlt,
  'Horario alumno': FaClock,
  'Asistencia de estudiante': FaCalendarCheck,
  'Record de Notas': FaListAlt,
  'Plan Curricular': FaBook,
  'Record Curricular Integral': FaListAlt,
  'Record Detallado': FaListAlt,
  'Cursos Faltantes': FaFileAlt,
  'Cursos Disponibles': FaFileAlt,
  'Equivalencias procesadas': FaFileAlt,
  'DJ COVID': FaShieldVirus,
};

const colorMap = {
  'Ficha de Matrícula': 'primary',
  'Avance académico': 'info',
  'Constancia de Notas': 'success',
  'Horario alumno': 'warning',
  'Asistencia de estudiante': 'secondary',
  'Record de Notas': 'dark',
  'Plan Curricular': 'primary',
  'Record Curricular Integral': 'dark',
  'Record Detallado': 'dark',
  'Cursos Faltantes': 'danger',
  'Cursos Disponibles': 'success',
  'Equivalencias procesadas': 'info',
  'DJ COVID': 'danger',
};

const ventanaSecundaria = (url) => {
  window.open(url, 'Certificado', 'width=1200,height=700,scrollbars=yes');
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
      texto: 'Avance académico',
      url: `Imprimiravanceacademico?codigo=${code_zet}`,
    },
    {
      texto: 'Constancia de Notas',
      url: `Imprimirboleta?codigo=${code_zet}`,
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
            onClick={() => ventanaSecundaria(url)}
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
