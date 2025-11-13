// src/pages/login/AuthCallback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '../../config';
import { useUsuario } from '../../context/UserContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useUsuario();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      // ⚠️ 1️⃣ Mostrar errores devueltos desde el backend
      if (error) {
        let mensaje = 'Error desconocido durante el inicio de sesión.';
        switch (error) {
          case 'no_autorizado':
            mensaje = 'No se encontró ningún usuario asociado a este correo.';
            break;
          case 'no_es_docente':
            mensaje = 'Tu cuenta no tiene perfil de docente activo.';
            break;
          case 'sin_perfil_valido':
            mensaje = 'No tienes un perfil válido para acceder.';
            break;
          case 'missing_email':
            mensaje = 'No se pudo obtener el correo electrónico desde Google.';
            break;
          case 'oauth_failed':
            mensaje = 'Error en la autenticación con Google. Intenta nuevamente.';
            break;
          default:
            mensaje = 'Error inesperado en la autenticación.';
        }

        await Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: mensaje,
          confirmButtonText: 'Entendido',
        });

        navigate('/login', { replace: true });
        return;
      }

      // ⚠️ 2️⃣ Validación de code
      if (!code) {
        navigate('/login?error=falta_code', { replace: true });
        return;
      }

      // Evita intercambiar el mismo code dos veces
      if (localStorage.getItem('auth_code_used') === code) {
        navigate('/', { replace: true });
        return;
      }
      localStorage.setItem('auth_code_used', code);

      try {
        // 3️⃣ Intercambio del code por token
        const { data } = await axios.get(`${config.apiUrl}api/auth/google/exchange`, {
          params: { code },
        });

        if (!data.token) throw new Error('Token no recibido');

        // 4️⃣ Guardar token
        localStorage.setItem('sanctum_token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        // 5️⃣ Cargar datos del usuario
        const user = await refreshUser();

        // 6️⃣ Mostrar bienvenida
        await Swal.fire({
          icon: 'success',
          title: `¡Bienvenido${user?.nombre ? `, ${user.nombre}` : ''}!`,
          text: 'Inicio de sesión con Google exitoso.',
          timer: 1800,
          showConfirmButton: false,
        });

        // 7️⃣ Redirigir a inicio
        window.history.replaceState({}, '', '/');
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Error en intercambio de código:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: 'No se pudo validar tu sesión. Intenta nuevamente.',
          confirmButtonText: 'Volver al login',
        });
        navigate('/login', { replace: true });
      }
    };

    run();
  }, [navigate, refreshUser]);

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <p>Autenticando con Google…</p>
    </div>
  );
}
