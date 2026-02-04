// src/context/permiso.js
export const opcionKey = (o) =>
  `${String(o.dominio ?? '').padStart(2,'0')}-${String(o.menu ?? '').padStart(3,'0')}-${String(o.opcion ?? '').padStart(3,'0')}`;


// Permite aplanar la estructura agrupada [{dominio, menus: [{nombre_menu, opciones: [...] }]}]
function flattenOpciones(opciones = []) {
  // Si ya es plano (tiene dominio, menu, opcion), devolver tal cual
  if (opciones.length > 0 && opciones[0].opcion !== undefined) return opciones;
  // Si es agrupado, aplanar
  let flat = [];
  for (const dom of opciones) {
    if (Array.isArray(dom.menus)) {
      for (const menu of dom.menus) {
        if (Array.isArray(menu.opciones)) {
          for (const op of menu.opciones) {
            // Mezclar info de dominio/menu en la opción
            flat.push({
              ...op,
              dominio: dom.dominio,
              nombre_dominio: dom.nombre_dominio,
              menu: menu.menu,
              nombre_menu: menu.nombre_menu,
            });
          }
        }
      }
    }
  }
  return flat;
}

export const buildPermSet = (opciones = []) => {
  return new Set(opciones.map(o => o.opcion_permiso).filter(Boolean));
};

export const hasPermiso = (usuario, code) => {
  const set = buildPermSet(usuario?.opciones || []);
  return set.has(code);
};

export const firstAllowedRoute = (opciones = [], routeMap = {}) => {
  const sorted = [...opciones].sort(
    (a, b) => (a.opcion_orden ?? 0) - (b.opcion_orden ?? 0)
  );

  for (const o of sorted) {
    if (routeMap[o.opcion_permiso]) {
      return routeMap[o.opcion_permiso];
    }
  }
  return null;
};
