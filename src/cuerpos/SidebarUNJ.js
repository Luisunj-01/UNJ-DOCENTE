import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const [modo, setModo] = useState('gestion'); // gestion o actividades
  const location = useLocation();

  const { darkMode } = useTheme();
  const logo = darkMode
    ? '/image/logo/logo-unj-blanco.svg'
    : '/image/logo/logo-unj-v1.svg';

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Cargar modo desde localStorage
  useEffect(() => {
    const modoGuardado = localStorage.getItem('modo');
    if (modoGuardado) {
      setModo(modoGuardado);
    }
  }, []);

  // Cambiar modo y guardarlo
  const cambiarModo = (nuevoModo) => {
    localStorage.setItem('modo', nuevoModo);
    setModo(nuevoModo);
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
        <Link
          to="/"
          className={`menu-btn ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => cambiarModo('gestion')}
        >
          <FaHome className="me-2" /> Principal
        </Link>

        {/* Si el modo es "gestion", mostramos todos los menús de gestión académica */}
        {modo === 'gestion' && (
          <>
            {/* Administración */}
            <div className="menu-group">
              <button
                className="menu-btn"
                onClick={() => toggleMenu('administracion')}
              >
                <FaCogs className="me-2" /> Administración
                {openMenu === 'administracion' ? (
                  <FaChevronDown className="ms-auto" />
                ) : (
                  <FaChevronRight className="ms-auto" />
                )}
              </button>
              {openMenu === 'administracion' && (
                <ul className="submenu">
                  <li
                    className={`submenu-link ${
                      location.pathname.startsWith('/datos') ? 'active' : ''
                    }`}
                  >
                    <Link to="/datos" onClick={toggleSidebar}>
                      Datos Docente
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            <Link
              to="/curso"
              className={`menu-btn ${
                location.pathname === '/curso' ? 'active' : ''
              }`}
              onClick={toggleSidebar}
            >
              <FaBookOpen className="me-2" /> Mis Cursos
            </Link>

            {/* Reportes */}
            <div className="menu-group">
              <button
                className="menu-btn"
                onClick={() => toggleMenu('reportes')}
              >
                <FaChartBar className="me-2" /> Reportes
                {openMenu === 'reportes' ? (
                  <FaChevronDown className="ms-auto" />
                ) : (
                  <FaChevronRight className="ms-auto" />
                )}
              </button>
              {openMenu === 'reportes' && (
                <ul className="submenu">
                  <li
                    className={`submenu-link ${
                      location.pathname.startsWith('/ReporteDoc') ? 'active' : ''
                    }`}
                  >
                    <Link to="/ReporteDoc" onClick={toggleSidebar}>
                      Reportes Docente
                    </Link>
                  </li>
                  <li
                    className={`submenu-link ${
                      location.pathname.startsWith('/Reportecurricular')
                        ? 'active'
                        : ''
                    }`}
                  >
                    <Link to="/Reportecurricular" onClick={toggleSidebar}>
                      Reportes Curricular
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Tutoria */}
            <div className="menu-group">
              <button
                className="menu-btn"
                onClick={() => toggleMenu('tutoria')}
              >
                <FaChalkboardTeacher className="me-2" /> Tutoria
                {openMenu === 'tutoria' ? (
                  <FaChevronDown className="ms-auto" />
                ) : (
                  <FaChevronRight className="ms-auto" />
                )}
              </button>
              {openMenu === 'tutoria' && (
                <ul className="submenu">
                  <li>
                    <Link to="/tutoria/obs" onClick={toggleSidebar}>
                      Obs. Rendimiento
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutoria/ciclo" onClick={toggleSidebar}>
                      Sesión Ciclo
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutoria/libre" onClick={toggleSidebar}>
                      Sesión Libre
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutoria/individual" onClick={toggleSidebar}>
                      Sesión Individual
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutoria/reportes" onClick={toggleSidebar}>
                      Reportes
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Actividades No Lectivas con submenús */}
            <div className="menu-group">
              <button
                className="menu-btn"
                onClick={() => {
                  toggleMenu('actividades');
                  cambiarModo('actividades');
                }}
              >
                <FaClipboardList className="me-2" /> Actividades No Lectivas
                {openMenu === 'actividades' ? (
                  <FaChevronDown className="ms-auto" />
                ) : (
                  <FaChevronRight className="ms-auto" />
                )}
              </button>

              {openMenu === 'actividades' && (
                <ul className="submenu">
                  <li
                    className={`submenu-link ${
                      location.pathname === '/Declaracion'
                        ? 'active'
                        : ''
                    }`}
                  > 
                    <Link
                      to="/Declaracion"
                      onClick={toggleSidebar}
                    >
                      Declaracion
                    </Link>
                  </li>
                  <li
                    className={`submenu-link ${
                      location.pathname === '/Horarios'
                        ? 'active'
                        : ''
                    }`}
                  >
                    <Link
                      to="/Horarios"
                      onClick={toggleSidebar}
                    >
                      Horario
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </>
        )}

        {/* Si el modo es "actividades", mostramos solo ese menú con submenús */}
        {modo === 'actividades' && (
          <div className="menu-group">
            <button
              className="menu-btn"
              onClick={() => toggleMenu('actividades')}
            >
              <FaClipboardList className="me-2" /> Actividades No Lectivas
              {openMenu === 'actividades' ? (
                <FaChevronDown className="ms-auto" />
              ) : (
                <FaChevronRight className="ms-auto" />
              )}
            </button>

            {openMenu === 'actividades' && (
              <ul className="submenu">
                <li
                  className={`submenu-link ${
                    location.pathname === '/Declaracion'
                      ? 'active'
                      : ''
                  }`}
                >
                  <Link
                    to="/Declaracion"
                    onClick={toggleSidebar}
                  >
                    Declaracion
                  </Link>
                </li>
                <li
                  className={`submenu-link ${
                    location.pathname === '/Horarios'
                      ? 'active'
                      : ''
                  }`}
                >
                  <Link
                    to="/Horarios"
                    onClick={toggleSidebar}
                  >
                    Horario
                  </Link>
                </li>
              </ul>
            )}
          </div>
        )}

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
