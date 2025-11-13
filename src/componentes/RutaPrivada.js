// src/componentes/RutaPrivada.js
import { Navigate } from 'react-router-dom';
import { useUsuario } from '../context/UserContext';
import { hasPermiso } from '../context/permiso';
import Swal from 'sweetalert2';

export default function RutaPrivada({ permisoRequerido, children }) {
  const { usuario, loading } = useUsuario();

  if (loading) return <div>Cargando…</div>;
  if (!usuario) return <Navigate to="/" replace />;

  if (permisoRequerido && !hasPermiso(usuario, permisoRequerido)) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'No tienes permisos para entrar a esta sección.',
      confirmButtonText: 'Volver',
    });
    return <Navigate to="/principal" replace />;
  }

  return children;
}
