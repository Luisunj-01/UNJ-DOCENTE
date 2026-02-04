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
    // Debug info: mostrar permisos y ruta
    console.warn('Acceso denegado:', {
      permisoRequerido,
      usuarioOpciones: (usuario?.opciones || []).map(o => ({
        opcion_permiso: o.opcion_permiso,
        opcion_nombre: o.opcion_nombre,
        menu_nombre: o.menu_nombre,
        modulo_codigo: o.modulo_codigo,
      })),
      verificacion: {
        mensaje: `Se busca permiso "${permisoRequerido}" pero el usuario no lo tiene`,
      }
    });
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: `No tienes permisos para entrar a esta sección. (Permiso requerido: ${permisoRequerido})`,
      confirmButtonText: 'Volver',
    });
    return <Navigate to="/principal" replace />;
  }

  return children;
}
