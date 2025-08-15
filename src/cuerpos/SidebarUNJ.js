import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../resource/SidebarUNJ.css';
import {
  FaChevronDown,
  FaChevronRight,
  FaUpload,
  FaSignOutAlt,
  FaHome,
  FaBookOpen,
  FaClipboardList,
  FaChartBar,
  FaChalkboardTeacher,
  FaCogs
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const SidebarUNJ = ({ abrirModal, toggleSidebar }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  const { darkMode } = useTheme();
  const logo = darkMode
    ? '/image/logo/logo-unj-blanco.svg'
    : '/image/logo/logo-unj-v1.svg';

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <img
          alt="Logo UNJ"
          className="logounj mb-3"
          src={logo}
        />

        {/* Principal */}
        <Link to="/" className={`menu-btn ${location.pathname === '/' ? 'active' : ''}`}>
          <FaHome className="me-2" /> Principal
        </Link>

        


        {/* Administración */}
        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('administracion')}>
            <FaCogs className="me-2" /> Administración
            {openMenu === 'administracion' ? <FaChevronDown className="ms-auto" /> : <FaChevronRight className="ms-auto" />}
          </button>
          {openMenu === 'administracion' && (
            <ul className="submenu">
              <li className={`submenu-link ${location.pathname.startsWith('/datos') ? 'active' : ''}`}><Link to="/datos" onClick={toggleSidebar} > Datos Docente</Link></li>
            </ul>
          )}
        </div>
        

        <Link to="/curso" className={`menu-btn ${location.pathname === '/' ? 'active' : ''}`}>
          <FaBookOpen className="me-2" /> Mis Cursos
        </Link>

        {/* Des. Asignatura */}
        {/*<div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('asignatura')}>
            <FaBookOpen className="me-2" /> Des. Asignatura
            {openMenu === 'asignatura' ? <FaChevronDown className="ms-auto" /> : <FaChevronRight className="ms-auto" />}
          </button>
          {openMenu === 'asignatura' && (
            <ul className="submenu">
              <li className={`submenu-link ${location.pathname.startsWith('/silabus') ? 'active' : ''}`}><Link to="/silabus" onClick={toggleSidebar} > Sílabos</Link></li>
              <li className={`submenu-link ${location.pathname.startsWith('/guias') ? 'active' : ''}`}><Link to="/guias" onClick={toggleSidebar}> Guías</Link></li>
            </ul>
          )}
        </div> */}

        {/* Notas */}
        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('notas')}>
            <FaClipboardList className="me-2" /> Notas
            {openMenu === 'notas' ? <FaChevronDown className="ms-auto" /> : <FaChevronRight className="ms-auto" />}
          </button>
          {openMenu === 'notas' && (
            <ul className="submenu">
              <li className={`submenu-link ${location.pathname.startsWith('/Ingresonotasdoc') ? 'active' : ''}`}><Link to="/Ingresonotasdoc" onClick={toggleSidebar}> Ingreso Notas Docente</Link></li>
              <li className={`submenu-link ${location.pathname.startsWith('/IngresoRezaAplaz') ? 'active' : ''}`}><Link to="/IngresoRezaAplaz" onClick={toggleSidebar}> Ingreso Reza/Aplaz</Link></li>
            </ul>
          )}
        </div>

        {/* Reportes */}
        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('reportes')}>
            <FaChartBar className="me-2" /> Reportes
            {openMenu === 'reportes' ? <FaChevronDown className="ms-auto" /> : <FaChevronRight className="ms-auto" />}
          </button>
          {openMenu === 'reportes' && (
            <ul className="submenu">
              <li className={`submenu-link ${location.pathname.startsWith('/ReporteDoc') ? 'active' : ''}`}><Link to="/ReporteDoc" onClick={toggleSidebar}> Reportes Docente </Link></li>
              <li className={`submenu-link ${location.pathname.startsWith('/Reportecurricular') ? 'active' : ''}`}><Link to="/Reportecurricular" onClick={toggleSidebar}> Reportes Curricular </Link></li>
            </ul>
          )}
        </div>

         {/* Tutoria */}
        <div className="menu-group">
          <button className="menu-btn" onClick={() => toggleMenu('tutoria')}>
            <FaChalkboardTeacher className="me-2" /> Tutoria
            {openMenu === 'tutoria' ? <FaChevronDown className="ms-auto" /> : <FaChevronRight className="ms-auto" />}
          </button>
          {openMenu === 'tutoria' && (
            <ul className="submenu">
              <li className={`submenu-link ${location.pathname.startsWith('/ObsRendimiento') ? 'active' : ''}`}><Link to="/ObsRendimiento" onClick={toggleSidebar}> Obs.ObsRendimiento</Link></li>
              <li className={`submenu-link ${location.pathname.startsWith('/Sesionciclo') ? 'active' : ''}`}><Link to="/Sesionciclo" onClick={toggleSidebar}> Sesion Ciclo</Link></li>
              <li className={`submenu-link ${location.pathname.startsWith('/Sesionlibre') ? 'active' : ''}`}><Link to="/Sesionlibre" onClick={toggleSidebar}> Sesion Libre</Link></li>
              <li className={`submenu-link ${location.pathname.startsWith('/SesionIndiv') ? 'active' : ''}`}><Link to="/SesionIndiv" onClick={toggleSidebar}> Sesion Individual</Link></li>
              <li className={`submenu-link ${location.pathname.startsWith('/Reportes') ? 'active' : ''}`}><Link to="/Reportes" onClick={toggleSidebar}> Reportes</Link></li>

            </ul>
          )}
        </div>

        <hr className="my-3" />

        {/* Botón cerrar sesión que abre modal */}
        <button className="salir-btn mt-auto w-100" onClick={abrirModal}>
          Salir <FaSignOutAlt className="me-2" />
        </button>
      </div>
    </div>
  );
};

export default SidebarUNJ;
