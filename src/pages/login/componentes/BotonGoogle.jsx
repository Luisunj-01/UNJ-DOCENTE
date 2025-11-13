// src/pages/login/componentes/BotonGoogle.jsx
import config from '../../../config';
import './BotonGoogle.css';

export default function BotonGoogle() {
  const go = () => {
    const url = `${config.apiUrl}api/auth/google/redirect?redirect_to=${encodeURIComponent(config.frontUrl)}`;
    window.location.href = url;
  };

  return (
    <button onClick={go} className="btn-google">
      {/* 👇 SVG oficial de Google en vez de <img src="/image/iconos/google.svg" /> */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="20px"
        height="20px"
      >
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.6 32 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4c-7.9 0-14.7 4.6-17.7 11.3z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2 1.5-4.6 2.4-7.3 2.4-5.3 0-9.7-4-10.7-9.1l-6.6 5.1C10.7 39.4 16.9 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-1 5.1-5.4 9.1-10.7 9.1-3 0-5.7-1.1-7.7-2.9l-6.6 5.1C13.3 41.5 18.3 44 24 44c11.1 0 20-8.9 20-20 0-1.3-.1-2.7-.4-3.9z"
        />
      </svg>
      <span>Ingresar con Google</span>
    </button>
  );
}
