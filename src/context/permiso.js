// src/context/permiso.js
export const opcionKey = (o) =>
  `${String(o.menu ?? '').padStart(3,'0')}-${String(o.opcion ?? '').padStart(3,'0')}`;

export const buildPermSet = (opciones = []) =>
  new Set(opciones.map(opcionKey));

export const hasPermiso = (usuario, code) => {
  const set = buildPermSet(usuario?.opciones || []);
  return set.has(code);
};

export const firstAllowedRoute = (opciones = [], routeMap = {}) => {
  for (const o of opciones) {
    const key = opcionKey(o);
    if (routeMap[key]) return routeMap[key];
  }
  return null;
};
