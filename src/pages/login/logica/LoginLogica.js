// src/pages/login/logica/loginActions.js
import axios from 'axios';
import Swal from 'sweetalert2'
import config from '../../../config';

export const enviarTokenGoogle = async (token) => {
  try {

    const res = await axios.post(`${config.apiUrl}api/Login/auth/google`, { token });
    /*const res = await axios.post('https://pydrsu.unj.edu.pe/estudiante/api/Login/auth/google', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });*/

   
    
    if (res.data && res.data.name) {
      Swal.fire({
        icon: 'success',
        title: `Bienvenido al modulo docente`,
        text: `${res.data.name}`,
        //confirmButtonColor: '#d33',
        //confirmButtonText: 'Cerrar',
      });

      return {
        // no tocar codigotokenautenticadorunj
        codigotokenautenticadorunj: res.data.token,
        name: res.data.name,
        email: res.data.email,
        picture: res.data.picture,
        givenName: res.data.givenName,
        familyName: res.data.familyName,
        docente: res.data.docente,
        //datosalumno: res.data.datosalumno,
      };
      
      
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el nombre del usuario.',
      });
    }
    
      //console.log(res.name);
    
  } catch (error) {
    
      Swal.fire({
        icon: 'error',
        title: 'Error al autenticar con Google',
        text: 'Hay problemas para autenticar con google, contactarse con el Área de OTI',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Cerrar',
      });
    //console.error('Error al autenticar con Google:', error);
    return null;
  }
};


export const iniciarSesion = async ({ email, password }) => {
  try {
    const payload = { email, clave: password };

    const res = await axios.post(`${config.apiUrl}api/Loginform/auth/google`, payload);
    
    console.log(res.data);
    if (res.data.success) {
      // mostrar mensaje de éxito o continuar flujo
        Swal.fire({
          title: 'Bienvenido',
          text: res.data.docente.nombrecompleto,
          icon: 'success',
          timer: 2000, // tiempo visible (3 segundos)
          showConfirmButton: false, // oculta botón "OK"
          allowOutsideClick: false, // opcional: evita que lo cierren antes de tiempo
          timerProgressBar: true    // opcional: muestra barra de tiempo
        }).then(() => {
          window.location.reload();
        });
      return {
          // no tocar codigotokenautenticadorunj
        codigotokenautenticadorunj: res.data.token,
        name: res.data.docente.nombrecompleto,
        email: res.data.email,
        picture: res.data.picture,
        givenName: res.data.givenName,
        familyName: res.data.familyName,
        docente: res.data.docente,
          //datosalumno: res.data.datosalumno,
      };
    } else {
      // mostrar error
      Swal.fire('Error', res.data.message, 'error');
    }

    /*if (res.data && res.data.name) {
      Swal.fire({
        icon: 'success',
        title: `Bienvenido al modulo docente`,
        text: `${res.data.name}`,
        //confirmButtonColor: '#d33',
        //confirmButtonText: 'Cerrar',
      });

      return {
        // no tocar codigotokenautenticadorunj
        codigotokenautenticadorunj: res.data.token,
        name: res.data.name,
        email: res.data.email,
        picture: res.data.picture,
        givenName: res.data.givenName,
        familyName: res.data.familyName,
        docente: res.data.docente,
        //datosalumno: res.data.datosalumno,
      };
      
      
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el nombre del usuario.',
      });
    }*/
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al iniciar sesión',
      text: error?.response?.data?.message || error.message || 'Error desconocido',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Cerrar',
    });

    return null;
  }
};