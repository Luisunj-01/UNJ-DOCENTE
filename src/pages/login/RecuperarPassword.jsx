// src/pages/login/RecuperarPassword.jsx
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import config from "../../config";
import Logo from "./componentes/LoginLogo";
import ImagenFondo from "./componentes/LoginImagenFondo";
import "../../resource/login.css";
import { useNavigate } from "react-router-dom";

export default function RecuperarPassword() {

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundImage = "url('/image/back-03_0002.svg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Correo no válido")
        .required("Debe ingresar un email válido"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await axios.post(`${config.apiUrl}api/password/email`, {
          email: values.email,
        });
        Swal.fire(
          "Revisa tu correo",
          `Se envió un correo a: ${values.email} con las instrucciones para recuperar tu contraseña.`,
          "success"
        );

        setTimeout(() => navigate("/"), 1500);
      } catch (err) {
        if (err.response?.status === 429) {
          Swal.fire("Espera un momento", "Intentaste muchas veces. Prueba dentro de 3 minutos.", "warning");
        } else {
          Swal.fire("Aviso", "El correo que proporcionaste no está autorizado", "warning");
        }
      }

      helpers.setSubmitting(false);
    },
  });

  return (
    <div className="contenedor">
      <div className="cont-login">
        <Logo />

        <p className="bienvenidos" style={{ fontWeight: "bold" }}>
          Recuperar contraseña
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="form-credenciales">

            <div className="cont-email">
              <img src="/image/iconos/mail_16dp_b.svg" alt="" />
              <p>Email</p>
            </div>

            <div className="input-email">
              <input
                type="email"
                name="email"
                placeholder="usuario@unj.edu.pe"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                style={{
                  width: "260px",      // 👈 Aumenta aquí el ancho
                  padding: "10px",     // 👈 Un toque para que se vea mejor
                  fontSize: "15px"
                }}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback">{formik.errors.email}</div>
              )}
            </div>

            <div className="btn-acceder">
              <button
                type="submit"
                className="btn-con-imagen"
                disabled={formik.isSubmitting}
                style={{ opacity: formik.isSubmitting ? 0.6 : 1 }}
              >
                <img src="/image/iconos/btn-acceder-b.svg" alt="" />
                <p>{formik.isSubmitting ? "Enviando..." : "Solicitar"}</p>
              </button>
            </div>

            {/* ✔ BOTÓN VOLVER (SIN ESTILOS NUEVOS) */}
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#004AAD",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ← Volver al inicio de sesión
              </button>
            </div>

          </div>
        </form>
      </div>

      <ImagenFondo />
    </div>
  );
}
