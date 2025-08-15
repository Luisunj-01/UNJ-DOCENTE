// src/componentes/HeaderTopBar.js
import React from 'react';
import { useState } from 'react';
import { Navbar, Container, Button, Image, Dropdown, Nav } from 'react-bootstrap';
import { useUsuario } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import UserInfoBox from './UserInfoBox';
import {
  FaChevronDown,
  FaChevronRight,
  FaUpload,
  FaSignOutAlt,
  FaHome,
  FaBookOpen,
  FaClipboardList,
  FaChartBar,
  FaCogs
} from 'react-icons/fa';


function HeaderTopBar({ toggleSidebar, sidebarOpen, abrirModal }) {
  const { usuario } = useUsuario();
  const { darkMode, toggleDarkMode } = useTheme();

  

  return (
    <Navbar
      bg={darkMode ? 'dark' : 'UNJ'}
      variant={darkMode ? 'dark' : 'UNJ'}
      expand="lg"
      className={`header_top_bar border-bottom ${sidebarOpen ? 'with-sidebar' : 'full'}`}
    >
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Lado izquierdo: menú, modo oscuro y más íconos si deseas */}
        <div className="d-flex align-items-center">
          
          <Button
                variant="outline-secondary"
                onClick={toggleSidebar}
                className="me-2 floating-menutoggle"
              >
                <FaBars />
          </Button>
          <Button
            variant={darkMode ? 'warning' : 'blancounj'}
            onClick={toggleDarkMode}
            className="me-2"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </Button>

          {/* Aquí puedes agregar más botones o íconos a la izquierda */}
          {/* <Button className="me-2">Otro Icono</Button> */}
        </div>

        {/* Lado derecho: dropdown de usuario */}
        
        <div className="d-flex align-items-center">
          
          <UserInfoBox />
          {/* <Dropdown align="end">
            <Dropdown.Toggle
            
              variant={darkMode ? 'warning' : 'blancounj'}
              className="d-flex align-items-center"
              id="dropdown-menumodulos"
            >
              <FaBars className='btn-menumodulos'/>

            </Dropdown.Toggle>

            <Dropdown.Menu>

              <div className="menu-group">

                
                <button className="menu-btn">
                  <FaCogs className="me-2" /> Administración
                
                </button>
                        
                      </div>
              <Dropdown.Divider />
              <Dropdown.Item onClick={abrirModal}>Salir</Dropdown.Item>
              {/*<Dropdown.Item as={Link} to="/datos">Mi Perfil</Dropdown.Item>
              <Dropdown.Item onClick={() => window.location.reload()}>Recargar</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={abrirModal}>Cerrar sesión</Dropdown.Item>}
            </Dropdown.Menu>
          </Dropdown> */}
          <div className="  mx-2 pt-1">
                <Nav.Link
                  as={Link}
                  to="/apps"
                  // onClick={() => {
                  //   setShowGap(!showGap);
                  // }}
                >
                  <i className="bi bi-grid-3x3-gap-fill fs-2 text-secondary"></i>
                </Nav.Link>
              </div>
        </div>
      </Container>

    </Navbar>

    
  );
}

export default HeaderTopBar;



