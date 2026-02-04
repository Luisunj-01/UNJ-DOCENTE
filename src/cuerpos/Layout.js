// src/cuerpos/Layout.js (DOCENTE)
import { Outlet, useLocation } from "react-router-dom";
import SidebarUNJ from './SidebarUNJ';
import HeaderTopBar from './HeaderTopBar';
import '../resource/Layout.css';
import CerrarSesionModal from '../componentes/modales/CerrarSesionModal';
import { useEffect, useState, createContext } from 'react';
import { Toast, ToastContainer } from "react-bootstrap";
import { useUsuario } from "../context/UserContext";
import { useModulo } from "../context/ModuloContext";

export const ToastContext = createContext();

function Layout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const { usuario, loading } = useUsuario(); // ⬅️ usa el mismo contexto que Admin
  const { moduloActual, setModuloActual } = useModulo(); // ⬅️ obtén el módulo actual

  const [toast, setToast] = useState({ show: false, message: "", bg: "success" });

  const abrirModalCerrarSesion = () => setMostrarModal(true);
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
  const { logout } = useUsuario();

  const confirmarCerrarSesion = async () => {
    await logout();
  };
  useEffect(() => {
    document.body.style.backgroundImage = "url('/image/back-03_0002.svg')";
  }, []);

  const location = useLocation();
  const isAppsRoute = location.pathname === "/apps";
  
  // Detectar módulo desde la URL y actualizar contexto
  useEffect(() => {
    const match = location.pathname.match(/\/apps\/(MOD\d+)/);
    if (match) {
      setModuloActual(match[1]);
    } else if (!moduloActual) {
      // Si no hay módulo en la URL y no hay uno seteado, usa el primer módulo disponible
      const primerModulo = usuario?.opciones?.[0]?.modulo_codigo;
      if (primerModulo) {
        const formatted = primerModulo.startsWith('MOD')
          ? primerModulo
          : `MOD${String(primerModulo).padStart(2, '0')}`;
        setModuloActual(formatted);
      } else {
        setModuloActual(null);
      }
    }
  }, [location.pathname, setModuloActual, usuario, moduloActual]);

  const mostrarToast = (message, bg = "success") => setToast({ show: true, message, bg });

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      <div className="layout-container">
        {/* Sidebar */}
        <div className={`sidebar-wrapper ${isSidebarVisible ? 'show' : 'hide'}`}>
          <SidebarUNJ
            sidebar={usuario?.opciones ?? []}      // ⬅️ pasa opciones
            loadingOpciones={loading}               // ⬅️ pasa loading
            abrirModal={abrirModalCerrarSesion}
            toggleSidebar={toggleSidebar}
            moduloActual={moduloActual}             // ⬅️ pasa módulo actual
          />
        </div>

        {/* Contenido principal */}
        <div className="main-content">
          <HeaderTopBar
            toggleSidebar={toggleSidebar}
            sidebarOpen={isSidebarVisible}
            abrirModal={abrirModalCerrarSesion}
          />
          <CerrarSesionModal
            show={mostrarModal}
            onConfirm={confirmarCerrarSesion}
            onCancel={() => setMostrarModal(false)}
          />
          {isAppsRoute ? <Outlet /> : <main className="page-body"><Outlet /></main>}
        </div>
      </div>

      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toast.bg} onClose={() => setToast({ ...toast, show: false })}
          show={toast.show} delay={3000} autohide>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export default Layout;
