// src/cuerpos/Layout.js
import { Outlet, useLocation } from "react-router-dom";
import SidebarUNJ from './SidebarUNJ';
import HeaderTopBar from './HeaderTopBar';
import '../resource/Layout.css';
import CerrarSesionModal from '../componentes/modales/CerrarSesionModal';
import { useEffect, useState, createContext } from 'react';
import { Toast, ToastContainer } from "react-bootstrap";

// Contexto para usar el toast en cualquier parte
export const ToastContext = createContext();

function Layout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // Estado global del toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success" // success | danger | warning | info
  });

  const abrirModalCerrarSesion = () => setMostrarModal(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const confirmarCerrarSesion = () => {
    localStorage.removeItem('usuario');
    window.location.href = '/';
  };

  useEffect(() => {
    document.body.style.backgroundImage = "url('/image/back-03_0002.svg')";
    const data = localStorage.getItem('usuario');
    if (data) setUsuario(JSON.parse(data));
  }, []);

  const location = useLocation();
  const isAppsRoute = location.pathname === "/apps";

  // Función para mostrar el toast desde cualquier módulo
  const mostrarToast = (message, bg = "success") => {
    setToast({ show: true, message, bg });
  };

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      <div className="layout-container">
        {/* Sidebar */}
        <div className={`sidebar-wrapper ${isSidebarVisible ? 'show' : 'hide'}`}>
          <SidebarUNJ abrirModal={abrirModalCerrarSesion} toggleSidebar={toggleSidebar} />
        </div>

        {/* Contenido principal */}
        <div className="main-content">
          <HeaderTopBar toggleSidebar={toggleSidebar} sidebarOpen={isSidebarVisible} abrirModal={abrirModalCerrarSesion} />
          <CerrarSesionModal
            show={mostrarModal}
            onConfirm={confirmarCerrarSesion}
            onCancel={() => setMostrarModal(false)}
          />
          {isAppsRoute ? (
            <Outlet />
          ) : (
            <main className="page-body">
              <Outlet />
            </main>
          )}
        </div>
      </div>

      {/* Toast global */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.bg}
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export default Layout;
