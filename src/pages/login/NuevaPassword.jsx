import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import config from "../../config";
import Logo from "./componentes/LoginLogo";
import ImagenFondo from "./componentes/LoginImagenFondo";
import "../../resource/login.css";

export default function NuevaPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");
  const email = params.get("email");

  //👇 FONDO DEL FORMULARIO
  useEffect(() => {
    document.body.style.backgroundImage = "url('/image/back-03_0002.svg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

  //👇 FORMULARIO
  const formik = useFormik({
    initialValues: { password: "", password_confirmation: "" },
    validationSchema: Yup.object({
      password: Yup.string().min(6, "Mínimo 6 caracteres").required(),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
        .required(),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await axios.post(`${config.apiUrl}api/password/reset`, {
          token,
          email,
          password: values.password,
          password_confirmation: values.password_confirmation,
        });

        Swal.fire("Listo", "Tu contraseña ha sido actualizada", "success");

        setTimeout(() => navigate("/"), 1500);

      } catch (error) {
        Swal.fire("Error", "Token inválido o expirado", "error");
      }

      helpers.setSubmitting(false);
    },
  });

  return (
    <div className="contenedor">
      <div className="cont-login">
        <Logo />
        <p className="bienvenidos" style={{ fontWeight: "bold" }}>
          Nueva contraseña
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="form-credenciales">

            {/* NUEVA PASSWORD */}
            <div className="cont-password">
              <img src="/image/iconos/lock_16dp_b.svg" alt="" />
              <p>Nueva contraseña</p>
            </div>

            <div className="input-password">
              <input
                type="password"
                name="password"
                placeholder="••••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                style={{
                  width: "260px",
                  padding: "10px",
                  fontSize: "15px"
                }}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="invalid-feedback">{formik.errors.password}</div>
              )}
            </div>

            {/* CONFIRMAR PASSWORD */}
            <div className="cont-password">
              <img src="/image/iconos/lock_16dp_b.svg" alt="" />
              <p>Confirmar contraseña</p>
            </div>

            <div className="input-password">
              <input
                type="password"
                name="password_confirmation"
                placeholder="••••••••••"
                value={formik.values.password_confirmation}
                onChange={formik.handleChange}
                style={{
                  width: "260px",
                  padding: "10px",
                  fontSize: "15px"
                }}
                disabled={formik.isSubmitting}
              />
              {formik.touched.password_confirmation &&
                formik.errors.password_confirmation && (
                  <div className="invalid-feedback">
                    {formik.errors.password_confirmation}
                  </div>
                )}
            </div>


            {/* BOTÓN */}
            <button
              type="submit"
              className="btn-con-imagen"
              disabled={formik.isSubmitting}
              style={{
                opacity: formik.isSubmitting ? 0.6 : 1,
                marginTop: "20px"
              }}
            >
              <img src="/image/iconos/btn-acceder-b.svg" alt="" />
              <p>{formik.isSubmitting ? "Guardando..." : "Cambiar contraseña"}</p>
            </button>
          </div>
        </form>
      </div>

      <ImagenFondo />
    </div>
  );
}
