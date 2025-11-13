// src/cuerpos/SidebarUNJ.js
import { useMemo, useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { routeMap } from '../config/routeMap';
import '../resource/SidebarUNJ.css';

/**
 * Props:
 * - sidebar: Array de opciones (del /api/me)
 * - loadingOpciones: boolean (true mientras /api/me está cargando)
 * - abrirModal: () => void (Salir)
 * - toggleSidebar?: () => void (si tienes botón para colapsar)
 *
 * Estructura esperada de cada opción:
 * {
 *   dominio, nombre_dominio,
 *   modulo, nombre_modulo,
 *   menu, nombre_menu,
 *   opcion, nombre_opcion,
 *   url?, target?
 * }
 */
export default function SidebarUNJ({
  sidebar = [],
  loadingOpciones = false,
  abrirModal,
  toggleSidebar,
}) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);

  // Normaliza una URL de opción a ruta interna conocida
  const getUrl = (op) => {
    const key = `${op.menu}-${op.opcion}`;
    return op.url || routeMap[key] || '#';
  };

  // Agrupa SOLO dominio '01' por nombre_menu (estable y memorizado)
  const groupedMenus = useMemo(() => {
    const opciones = Array.isArray(sidebar) ? sidebar : [];
    const dominios = new Map();

    opciones.forEach(op => {
      if (!op?.menu || !op?.opcion) return;

      const dominio = op?.nombre_dominio || `Dominio ${op?.dominio ?? ''}`;
      const menuName = op?.nombre_menu || `Menú ${op?.menu ?? ''}`;

      if (!dominios.has(dominio)) dominios.set(dominio, new Map());
      const menus = dominios.get(dominio);

      if (!menus.has(menuName)) menus.set(menuName, []);

      menus.get(menuName).push({
        key: `${op.menu}-${op.opcion}`,
        nombre: op?.nombre_opcion || `Opción ${op?.opcion}`,
        url: getUrl(op),
        target: op?.target || '',
      });
    });

    // Convertimos a arreglo estructurado
    return Array.from(dominios.entries()).map(([nombre_dominio, menus]) => ({
      nombre_dominio,
      menus: Array.from(menus.entries()).map(([nombre_menu, opciones]) => ({
        nombre_menu,
        opciones: opciones.sort((a, b) => a.nombre.localeCompare(b.nombre)),
      })),
    }));
  }, [sidebar]);


  // Sincroniza la opción activa según la ruta actual
  useEffect(() => {
    if (!Array.isArray(sidebar) || sidebar.length === 0) return;
    const current = sidebar.find(op => getUrl(op) === location.pathname);
    if (current) {
      setSelectedKey(`${current.menu}-${current.opcion}`);
    }
  }, [location.pathname, sidebar]);

  const toggleMenuOpen = (idx) =>
    setOpenMenu(prev => ({ ...prev, [idx]: !prev[idx] }));

  // Render
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <img
          alt="Logo UNJ"
          className="logounj mb-3"
          src="/image/logo/logo-unj-v1.svg"
        />

        {/* Estado de carga de opciones */}
        {loadingOpciones ? (
          <p>Cargando menú…</p>
        ) : groupedMenus.length === 0 ? (
          <p>Sin opciones asignadas</p>
        ) : (
          groupedMenus.map((dom, dIdx) => (
            <div key={`dom-${dIdx}`} className="dominio-group">
          <h6 className="dominio-titulo bg">{dom.nombre_dominio}</h6>

              {dom.menus.map((grupo, gIdx) => {
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

                    {isOpen && (
                      <ul className="submenu">
                        {grupo.opciones.map((op, oIdx) => {
                          const active = selectedKey === op.key;
                          const isExternal = op.url?.startsWith("http");
                          const disabled = loadingOpciones || !op.url || op.url === "#";

                          const Item = (
                            <>
                              <span className="dot" aria-hidden />
                              {op.nombre}
                            </>
                          );

                          return (
                            <li key={`${dIdx}-${gIdx}-${oIdx}`}>
                              {isExternal ? (
                                <a
                                  href={op.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`submenu-item ${active ? 'active' : ''}`}
                                  onClick={() => setSelectedKey(op.key)}
                                  title={op.nombre}
                                >
                                  {Item}
                                </a>
                              ) : (
                                <Link
                                  to={op.url}
                                  className={`submenu-item ${active ? 'active' : ''}`}
                                  onClick={() => setSelectedKey(op.key)}
                                  title={op.nombre}
                                >
                                  {Item}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}


        <hr className="my-3" />

        <button className="salir-btn mt-auto w-100" onClick={abrirModal}>
          <FaSignOutAlt className="me-2" /> Salir
        </button>
      </div>
    </div>
  );
}
