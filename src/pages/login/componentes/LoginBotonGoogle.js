// src/pages/login/componentes/BotonGoogle.js
import { GoogleLogin } from '@react-oauth/google';
import { enviarTokenGoogle } from '../logica/LoginLogica';
import Swal from 'sweetalert2';

function BotonGoogle({ setUsuario }) {
  const handleSuccess = async (cred) => {
    try {
        const userData = await enviarTokenGoogle(cred.credential);
        
        if (userData) {
        localStorage.setItem('usuario', JSON.stringify(userData));
        setUsuario(userData);
        
        console.log(localStorage);

        window.location.reload(); // o navega a otra ruta
        }
    } catch (error) {
        const mensaje = typeof error === 'string' ? error : 'Ocurrió un error al iniciar sesión';
       // Swal.fire('Error', mensaje, 'error');
        Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: mensaje,
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Cerrar',
                  });
    }
    };

  return (
    <div className="btn-google">
      <GoogleLogin onSuccess={handleSuccess} onError={() => console.error('Error con Google')} />
    </div>
  );
}

export default BotonGoogle;
