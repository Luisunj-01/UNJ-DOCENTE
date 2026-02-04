// src/cuerpos/SidebarUNJ.js
import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { routeMap } from '../config/routeMap';
import '../resource/SidebarUNJ.css';


export default function SidebarUNJ({
  sidebar = [],
  loadingOpciones = false,
  abrirModal,
  toggleSidebar,
  moduloActual,
}) {

  const location = useLocation();
  const [openMenu, setOpenMenu] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);

  // Obtiene la ruta interna usando opcion_permiso y routeMap
  const getUrl = (op) => {
    if (op.url && (op.url.startsWith('/') || op.url.startsWith('http'))) {
      return op.url;
    }
    if (op.opcion_permiso && routeMap[op.opcion_permiso]) {
      return routeMap[op.opcion_permiso];
    }
    return null;
  };

  // Agrupa dinámicamente el array plano de opciones por módulo y menú
  const groupedMenus = Array.isArray(sidebar) ? (() => {
    // Si ya viene agrupado, lo usamos tal cual
    if (sidebar.length > 0 && sidebar[0].menus) return sidebar;
    // Si es plano, agrupamos
    const modulos = {};
    sidebar.forEach(op => {
      const moduloKey = op.modulo_codigo || 'MOD';
      if (!modulos[moduloKey]) {
        modulos[moduloKey] = {
          modulo_codigo: moduloKey,
          nombre_modulo: op.modulo_nombre,
          menus: {}
        };
      }
      const menuKey = op.menu_nombre || 'Menú';
      if (!modulos[moduloKey].menus[menuKey]) {
        modulos[moduloKey].menus[menuKey] = [];
      }
      modulos[moduloKey].menus[menuKey].push(op);
    });
    // Convertimos a arreglo estructurado
    let agrupados = Object.values(modulos).map(mod => ({
      nombre_modulo: mod.nombre_modulo,
      modulo_codigo: mod.modulo_codigo,
      menus: Object.entries(mod.menus).map(([nombre_menu, opciones]) => ({
        nombre_menu,
        opciones,
      }))
    }));
    // Si se pasa moduloActual y existe, filtrar solo ese módulo; si no, mostrar el primero disponible
    if (moduloActual && agrupados.some(m => m.modulo_codigo === moduloActual)) {
      agrupados = agrupados.filter(m => m.modulo_codigo === moduloActual);
    } else if (agrupados.length > 0) {
      agrupados = [agrupados[0]];
    }
    return agrupados;
  })() : [];

  // Sincroniza la opción activa según la ruta actual
  useEffect(() => {
    if (!Array.isArray(sidebar) || sidebar.length === 0) return;
    const current = sidebar.find(op => getUrl(op) === location.pathname);
    if (current) {
      setSelectedKey(current.opcion_permiso);
    }
  }, [location.pathname, sidebar]);

  // Render
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <img
          alt="Logo UNJ"
          className="logounj mb-3"
          src="/image/logo/logo-unj-v1.svg"
        />
        {/* Título del módulo debajo del logo y menús solo si no está cargando */}
        {!loadingOpciones && groupedMenus.length > 0 && (
          <div className="sidebar-modulo-titulo mb-2" style={{ textAlign: 'center', fontWeight: 'bold', color: '#0056b3', fontSize: '1.1rem' }}>
            {groupedMenus[0].nombre_modulo}
          </div>
        )}

        {/* Estado de carga de opciones */}
        {loadingOpciones ? (
          <div style={{ padding: '20px 0' }}></div>
        ) : groupedMenus.length === 0 ? (
          <p>Sin opciones asignadas</p>
        ) : (
          <div className="sidebar-menus-container">
            {groupedMenus.map((dom, dIdx) => (
              <div key={`dom-${dIdx}`} className="dominio-group">
                <h6 className="dominio-titulo bg">{dom.nombre_dominio}</h6>
                {Array.isArray(dom.menus) && dom.menus.length > 0 ? dom.menus.map((grupo, gIdx) => {
                  const isOpen = !!openMenu[`${dIdx}-${gIdx}`];
                  return (
                    <div key={`grupo-${dIdx}-${gIdx}`} className="menu-group">
                      <button
                        className="menu-btn"
                        type="button"
                        onClick={() =>
                          setOpenMenu(prev => ({
                            ...prev,
                            [`${dIdx}-${gIdx}`]: !prev[`${dIdx}-${gIdx}`],
                          }))
                        }
                      >
                        {grupo.nombre_menu}
                        {isOpen ? <FaChevronDown className="ms-auto" /> : <FaChevronRight className="ms-auto" />}
                      </button>
                      {isOpen && Array.isArray(grupo.opciones) && grupo.opciones.length > 0 && (
                        <ul className="submenu">
                          {grupo.opciones
                            .map((op, oIdx) => {
                              const key = op.opcion_permiso || null;
                              const nombre = op.opcion_nombre;
                              const url = key && routeMap[key] ? routeMap[key] : null;
                              const isExternal = url?.startsWith("http");
                              const active = selectedKey === key;
                              const Item = (
                                <>
                                  <span className="dot" aria-hidden />
                                  {nombre}
                                </>
                              );
                              const handleSelect = () => {
                                setSelectedKey(key);
                                setOpenMenu({ [`${dIdx}-${gIdx}`]: true });
                              };
                              return (
                                <li key={`${dIdx}-${gIdx}-${oIdx}`}>
                                  {key && url ? (
                                    isExternal ? (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`submenu-item ${active ? 'active' : ''}`}
                                        onClick={handleSelect}
                                        title={nombre}
                                      >
                                        {Item}
                                      </a>
                                    ) : (
                                      <Link
                                        to={url}
                                        className={`submenu-item ${active ? 'active' : ''}`}
                                        onClick={handleSelect}
                                        title={nombre}
                                      >
                                        {Item}
                                      </Link>
                                    )
                                  ) : (
                                    <span className="submenu-item disabled" title="sin permiso" style={{ fontSize: '9px', color: '#657998' }}>
                                      {nombre} (Sin permiso o dev)
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                        </ul>
                      )}
                    </div>
                  );
                }) : null}
              </div>
            ))}
          </div>
        )}
        <div className="sidebar-hr" />
        <button className="salir-btn w-100" onClick={abrirModal}>
          <FaSignOutAlt className="me-2" /> Salir
        </button>
      </div>
    </div>
  );
}
