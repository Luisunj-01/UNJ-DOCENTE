// src/pages/login/Login.js
import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Logo from './componentes/LoginLogo';
import Formulario from './componentes/LoginForm';
import BotonGoogle from './componentes/LoginBotonGoogle';
import ImagenFondo from './componentes/LoginImagenFondo';
import '../../resource/login.css';

function Login() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    document.body.style.backgroundImage = "url('/image/back-03_0002.svg')";
    const data = localStorage.getItem('usuario');
    if (data) setUsuario(JSON.parse(data));
  }, []);
 


  return (
    <GoogleOAuthProvider clientId="468491556072-e78isnva21jh9q83ub1fnd4ikeagrj3i.apps.googleusercontent.com">
      <div className="contenedor">
        <div className="cont-login">
          <Logo />
          <p className="bienvenidos">Bienvenido al Módulo Docente</p>
          <Formulario />
          <BotonGoogle setUsuario={setUsuario} />
        </div>
        <ImagenFondo />
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
