// src/pages/LoginGoogle.js
import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginButton() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (data) {
      setUsuario(JSON.parse(data));
    }
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/Login/auth/google', {
        token: credentialResponse.credential,
      });

      const userData = {
        token: res.data.token,
        name: res.data.name,
        email: res.data.email,
      };

      localStorage.setItem('usuario', JSON.stringify(userData));
      setUsuario(userData);
       window.location.reload();
      //navigate('/estudiante');
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    // Opcional: redirigir a /login u otra página
    // navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Bienvenido a SIGAUNJ</h2>

      {usuario ? (
        <div>
          <p>Hola, <strong>{usuario.name}</strong></p>
          <p><em>{usuario.email}</em></p>
          <button onClick={handleLogout} className="btn btn-danger">
            Cerrar sesión
          </button>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => console.log('Error al iniciar sesión')}
        />
      )}
    </div>
  );
}

function LoginGoogle() {
  return (
    <GoogleOAuthProvider clientId="468491556072-e78isnva21jh9q83ub1fnd4ikeagrj3i.apps.googleusercontent.com">
      <LoginButton />
    </GoogleOAuthProvider>
  );
}

export default LoginGoogle;
