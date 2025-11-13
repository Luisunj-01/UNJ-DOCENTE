import { useEffect } from 'react';
import { useUsuario } from '../../context/UserContext';
import { iniciarSesion } from './logica/LoginLogica';
import Logo from './componentes/LoginLogo';
import Formulario from './componentes/LoginForm';
import BotonGoogle from './componentes/BotonGoogle';
import ImagenFondo from './componentes/LoginImagenFondo';
import '../../resource/login.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 👈 importa SweetAlert2

// 👉 importa helpers de permisos/rutas
import { firstAllowedRoute } from '../../context/permiso';
import { routeMap } from '../../config/routeMap';

function Login() {
  const { setUsuario } = useUsuario();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundImage = "url('/image/back-03_0002.svg')";

    // 👇 Captura y muestra los errores enviados por la URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      let mensaje = 'Ocurrió un error durante el inicio de sesión.';
      switch (error) {
        case 'no_autorizado':
          mensaje = 'No se encontró un usuario autorizado con este correo.';
          break;
        case 'exchange_failed':
          mensaje = 'Error al validar la sesión con Google. Intenta nuevamente.';
          break;
        case 'falta_code':
          mensaje = 'No se recibió el código de autenticación.';
          break;
        default:
          mensaje = 'Error desconocido en la autenticación.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: mensaje,
        confirmButtonText: 'Entendido',
      });

      // limpia la URL para evitar que se repita el alert
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleLogin = async (email, clave) => {
    const userData = await iniciarSesion({ email, clave });
    if (userData) {
      setUsuario(userData);
      const next = firstAllowedRoute(userData.opciones, routeMap) || '/';
      navigate(next, { replace: true }); // 👈 corregido /inicio → /
    }
    // en error no hagas nada: ya alertó iniciarSesion
  };

  return (
    <div className="contenedor">
      <div className="cont-login">
        <Logo />
        <p className="bienvenidos">Módulo Docente</p>
        <Formulario onLogin={handleLogin} />
        <BotonGoogle />
      </div>
      <ImagenFondo />
    </div>
  );
}

export default Login;
