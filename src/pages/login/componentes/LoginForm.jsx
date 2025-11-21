// src/pages/login/componentes/LoginForm.js
import { useFormik } from "formik";
import * as Yup from 'yup';
import { useState } from "react";
import "./LoginForm.css";

function Formulario({ onLogin }) {
  
  const [mostrarClave, setMostrarClave] = useState(false);

  const formik = useFormik({
    
    initialValues: {
      email: 'desarrollador2.oti@unj.edu.pe',
      clave: '18104355A',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email no válido').required('Debe ingresar un email válido'),
      clave: Yup.string().required('Debe ingresar una contraseña válida'),
    }),
    onSubmit: async (values, helpers) => {
      await onLogin(values.email, values.clave);
      helpers.setSubmitting(false);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="form-credenciales">
        <div className="cont-email">
          <img src="/image/iconos/mail_16dp_b.svg" alt="" draggable="false" />
          <p>Email</p>
        </div>
        <div className="input-email">
          <input
            className="correo"
            type="email"
            name="email"
            placeholder="admin@unj.edu.pe"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="invalid-feedback">{formik.errors.email}</div>
          )}
        </div>

 {/* === TÍTULO DEL CAMPO CONTRASEÑA === */}
<div className="cont-password">
  <img src="/image/iconos/lock_16dp_b.svg" alt="" draggable="false" />
  <p>Contraseña</p>
</div>

{/* === INPUT CON EL OJITO DENTRO === */}
<div className="input-password" style={{ position: "relative" }}>
  <input
    className="password"
    type={mostrarClave ? "text" : "password"}
    name="clave"
    placeholder="••••••••••••"
    value={formik.values.clave}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    style={{
      paddingRight: "42px",
      height: "40px",      // 👈 MISMO ALTO QUE EL INPUT DE EMAIL
      width: "100%",
      lineHeight: "50px"   // 👈 centramos el texto
    }}
  />

  {/* 👁 OJO DENTRO DEL INPUT */}
  <i
    className={`bi ${mostrarClave ? "bi-eye" : "bi-eye-slash"}`}
    onClick={() => setMostrarClave(!mostrarClave)}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",                    // base
      transform: "translateY(-50%)", // centra PERFECTO
      cursor: "pointer",
      fontSize: "18px",
      color: "#777",
    }}
  ></i>

  {formik.touched.clave && formik.errors.clave && (
    <div className="invalid-feedback">{formik.errors.clave}</div>
  )}
</div>





        <div className="recordar-recuperar">
          <div className="recordar">
            <input type="checkbox" id="recordar" />
            <label htmlFor="recordar">Recordar</label>
          </div>
          <div className="recuperar">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
        </div>

        <div className="btn-acceder">
          <button type="submit" className="btn-con-imagen" disabled={formik.isSubmitting}>
            <img src="/image/iconos/btn-acceder-b.svg" alt="Acceder" draggable="false" />
            <p>{formik.isSubmitting ? 'Accediendo...' : 'Acceder'}</p>
          </button>
        </div>
      </div>
    </form>
  );
}

export default Formulario;
