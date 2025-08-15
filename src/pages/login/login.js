import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate, useParams } from "react-router-dom";
import Logo from "./componentes/LoginLogo";
import Formulario from "./componentes/LoginForm";
import BotonGoogle from "./componentes/LoginBotonGoogle";
import ImagenFondo from "./componentes/LoginImagenFondo";
import "../../resource/login.css";

const ROLES = {
  estudiante: "Estudiantil",
  docente: "Docente",
  admin: "Administración",
};

function normalizaRol(valor) {
  const v = (valor || "").toLowerCase();
  if (v === "docente") return "docente";
  if (v === "admin" || v === "administracion" || v === "administración")
    return "admin";
  return "estudiante";
}

export default function Login() {
  const { rol: rolParam } = useParams();
  const navigate = useNavigate();

  const [rol, setRol] = useState(normalizaRol(rolParam));
  const [usuario, setUsuario] = useState(null);

  // Sincroniza el rol cuando cambia el parámetro de la URL
  useEffect(() => {
    setRol(normalizaRol(rolParam));
  }, [rolParam]);

  // Fondo y carga de usuario
  useEffect(() => {
    document.body.style.backgroundImage = "url('/image/back-03_0002.svg')";
    const data = localStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
  }, []);

  // Cambiar rol y reflejarlo en la URL
  const handleCambiarRol = (nuevoRol) => {
    const r = normalizaRol(nuevoRol);
    setRol(r);
    navigate(`/#/${r}`, { replace: false });
  };

  return (
    <GoogleOAuthProvider clientId="468491556072-e78isnva21jh9q83ub1fnd4ikeagrj3i.apps.googleusercontent.com">
      <div className="contenedor">
        <div className="cont-login">
          <Logo />

          {/* Grupo centrado tipo pill */}
          <div className="tabs-rol-group centered">
            <button
              type="button"
              className={`tab-rol left-pill ${
                rol === "estudiante" ? "active" : ""
              }`}
              onClick={() => handleCambiarRol("estudiante")}
            >
              Estudiante
            </button>
            <button
              type="button"
              className={`tab-rol middle-pill ${
                rol === "docente" ? "active" : ""
              }`}
              onClick={() => handleCambiarRol("docente")}
            >
              Docente
            </button>
            <button
              type="button"
              className={`tab-rol right-pill ${
                rol === "admin" ? "active" : ""
              }`}
              onClick={() => handleCambiarRol("admin")}
            >
              Administrador
            </button>
          </div>

          {/* Título dinámico */}
          <p className="bienvenidos">Bienvenido al Módulo {ROLES[rol]}</p>

          {/* Formulario (si necesitas variar validaciones/endpoint por rol, ya lo tienes como prop) */}
          <Formulario rol={rol} />

          {/* Botones de acceso compactos */}
          <div className="acciones-login compact">
            {/* Si tu botón Acceder está dentro del Formulario, puedes ocultar el de allí
                y usar este como submit referenciando el form="idDelFormulario" */}
            {/* <button type="submit" form="form-login" className="btn-acceder">
              Acceder
            </button> */}

            {/* El componente de Google; añade className si lo necesitas */}
            <div className="google-wrapper">
              <BotonGoogle setUsuario={setUsuario} />
            </div>
          </div>
        </div>

        <ImagenFondo />
      </div>
    </GoogleOAuthProvider>
  );
}