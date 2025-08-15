// src/config/axiosSetup.js
import Axios from 'axios';


const initializeAxios = () => {
  
  const storedData = localStorage.getItem('usuario');

  
  if (storedData) {
    try {
      const token = JSON.parse(storedData); // Asegúrate de que el token esté en el formato correcto

      if (token.codigotokenautenticadorunj) {
        Axios.defaults.headers.common['Authorization'] = `Bearer ${token.codigotokenautenticadorunj}`;
      } else {
        console.error('Token inválido en localStorage');
      }
    } catch (e) {
      console.error('Error al analizar el token', e);
    }
  } else {
    console.warn('No hay token en localStorage');
  }

  // Interceptor de respuestas
  Axios.interceptors.response.use(
    (response) => response, // Devolver respuesta exitosa
    (error) => {
      console.error('Error en la respuesta:', error);

      // if (error.code === 'ERR_NETWORK') {
      //   console.error('Error de red. Posible desconexión.');
      // }

      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          console.error('No autorizado. Redirigiendo al login.');
         
          window.location.href = '#/login';
          //return false;
        }

        if (status === 504) {
          console.error('Tiempo de espera agotado (504).');
        }

        if (status === 404) {
          console.error('Recurso no encontrado (404).');
          //window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
};

export default initializeAxios;
