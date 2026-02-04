
//src/pages/apps/AppDomainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

function ModuloLayout() {
  // Si necesitas lógica de dominio, puedes dejarla aquí
  return (
    <main style={{ flex: 1, padding: '2rem' }}>
      <Outlet />
    </main>
  );
}

export default ModuloLayout;