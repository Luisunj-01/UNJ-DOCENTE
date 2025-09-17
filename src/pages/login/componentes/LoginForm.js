// src/pages/Login/componentes/LoginForm.jsx
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { iniciarSesion } from "../logica/LoginLogica";

export default function Formulario({ rol, setLoading }) {
  const formik = useFormik({
    initialValues: { email: "", clave: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Email no válido")
        .required("Debe ingresar un email válido"),
      clave: Yup.string().required("Debe ingresar una contraseña válida"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const userData = await iniciarSesion({
          email: values.email,
          password: values.clave,
        });

        if (userData) {
          localStorage.setItem("usuario", JSON.stringify(userData));
          // redirección según el rol si deseas
        } else {
          Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "Correo o clave incorrectos.",
            confirmButtonColor: "#d33",
          });
        }
      } catch (err) {
        console.error("Error en login:", err);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error inesperado al iniciar sesión.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();

    // Si hay errores, alerta personalizada
    const errores = formik.errors;
    if (Object.keys(errores).length > 0) {
      const mensajes = [];
      if (errores.email) mensajes.push(errores.email);
      if (errores.clave) mensajes.push(errores.clave);

      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        html: mensajes.join("<br/>"),
        confirmButtonColor: "#f39c12",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-credenciales">
        {/* Email */}
        <div className="cont-email">
          <img src="/image/iconos/mail_16dp_b.svg" alt="" draggable="false" />
          <p>Email</p>
        </div>
        <div className="input-email">
          <input
            className="correo"
            type="email"
            name="email"
            placeholder="docente@unj.edu.pe"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        {/* Contraseña */}
        <div className="cont-password">
          <img src="/image/iconos/lock_16dp_b.svg" alt="" draggable="false" />
          <p>Contraseña</p>
        </div>
        <div className="input-password">
          <input
            className="password"
            type="password"
            name="clave"
            placeholder="••••••••"
            value={formik.values.clave}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <div className="btn-acceder">
          <button type="submit" className="btn-con-imagen">
            <img src="/image/iconos/btn-acceder-b.svg" alt="Acceder" />
            <p>Acceder</p>
          </button>
        </div>
      </div>
    </form>
  );
}
 