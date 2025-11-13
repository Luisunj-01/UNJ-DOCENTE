// src/interceptor.js
import axios from 'axios';
import Swal from 'sweetalert2';

export default function initializeAxios() {
  if (axios.__INTERCEPTORS_INSTALLED__) return;
  axios.__INTERCEPTORS_INSTALLED__ = true;

  const bootToken = localStorage.getItem('sanctum_token');
  if (bootToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
  }

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('sanctum_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  let isLoggingOut = false;

  axios.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error?.response?.status;
      const url = (error?.config?.url || '').toString();

      // Sólo si /api/me confirma que el token es inválido/expiró
      if ((status === 401 || status === 419) && url.includes('/api/me')) {
        if (!isLoggingOut) {
          isLoggingOut = true;
          await Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Vuelve a iniciar sesión.',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
          });
          localStorage.clear();
          delete axios.defaults.headers.common.Authorization;
          window.location.replace('/');
        }
        return Promise.reject(error);
      }

      // 403: no borres sesión (es falta de permiso del recurso puntual)
      if (status === 403) {
        // Opcional: muestra algo si quieres
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );
}
