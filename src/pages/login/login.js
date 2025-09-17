// src/pages/Login/Login.jsx
import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Logo from "./componentes/LoginLogo";
import Formulario from "./componentes/LoginForm";
import BotonGoogle from "./componentes/LoginBotonGoogle";
import ImagenFondo from "./componentes/LoginImagenFondo";
import "../../resource/login.css";
import LoaderFullScreen from "../reutilizables/componentes/LoaderFullScreen";

const ROLES = {
  estudiante: "Estudiantil",
  docente: "Docente",
  admin: "Administración",
};

function normalizaRol(url) {
  url = url.toLowerCase();
  if (url.includes("sigad.unj.edu.pe")) return "docente";
  if (url.includes("siga.unj.edu.pe/estudiante")) return "estudiante";
  if (url.includes("/administrador")) return "admin";
  return "estudiante";
}

export default function Login() {
  const [rol, setRol] = useState(normalizaRol(window.location.href));
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false); // ⬅️ estado global de carga

  useEffect(() => {
    document.body.style.backgroundImage = "url('image/back-03_0002.svg')";
    const data = localStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
  }, []);

  const handleCambiarRol = (nuevoRol) => {
    if (nuevoRol === "estudiante") {
      window.location.href = "https://siga.unj.edu.pe/estudiante/";
    } else if (nuevoRol === "docente") {
      window.location.href = "https://sigad.unj.edu.pe/";
    } else if (nuevoRol === "admin") {
      window.location.href = "/administrador/";
    }
  };

  return (
    <>
      {/* Loader que cubre TODO el módulo */}
      <LoaderFullScreen visible={loading} />

      <GoogleOAuthProvider clientId="468491556072-e78isnva21jh9q83ub1fnd4ikeagrj3i.apps.googleusercontent.com">
        <div className="contenedor">
          <div className="cont-login">
            <Logo />

            {/* Tabs de roles */}
            <div className="tabs-rol-group centered">
              <button
                type="button"
                className={`tab-rol left-pill ${rol === "estudiante" ? "active" : ""}`}
                onClick={() => handleCambiarRol("estudiante")}
              >
                Estudiante
              </button>
              <button
                type="button"
                className={`tab-rol middle-pill ${rol === "docente" ? "active" : ""}`}
                onClick={() => handleCambiarRol("docente")}
              >
                Docente
              </button>
              <button
                type="button"
                className={`tab-rol right-pill ${rol === "admin" ? "active" : ""}`}
                onClick={() => handleCambiarRol("admin")}
              >
                Administrador
              </button>
            </div>

            <p className="bienvenidos">Bienvenido al Módulo {ROLES[rol]}</p>

            {/* Pasamos setLoading para controlar el loader */}
            <Formulario rol={rol} setLoading={setLoading} />

            <div className="acciones-login compact">
              <div className="google-wrapper">
                <BotonGoogle setUsuario={setUsuario} />
              </div>
            </div>
          </div>
          <ImagenFondo />
        </div>
      </GoogleOAuthProvider>
    </>
  );
}


/*import { useEffect, useState } from "react";
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

          
          <p className="bienvenidos">Bienvenido al Módulo {ROLES[rol]}</p>

          <Formulario rol={rol} />

          
          <div className="acciones-login compact">
            
            <div className="google-wrapper">
              <BotonGoogle setUsuario={setUsuario} />
            </div>
          </div>
        </div>

        <ImagenFondo />
      </div>
    </GoogleOAuthProvider>
  );
}*/