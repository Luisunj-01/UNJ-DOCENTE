// src/pages/login/componentes/Formulario.js

import { useFormik } from "formik";
import * as Yup from 'yup';
import axios from "axios";
import { iniciarSesion } from "../logica/LoginLogica";
import Swal from "sweetalert2";

function Formulario() {
  const formik = useFormik({
    initialValues: {
      email: '',
      clave: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Email no válido')
        .required('Debe ingresar un email válido'),
      clave: Yup.string()
        .required('Debe ingresar una contraseña válida'),
    }),
    onSubmit: async (values) => {
      try {
        const userData = await iniciarSesion({
          email: values.email,
          password: values.clave,
        });

        
        if (userData) {
          localStorage.setItem('usuario', JSON.stringify(userData));
          
          //window.location.reload();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Correo o clave incorrectos.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cerrar',
          });
        }
      } catch (error) {
        console.error('Error inesperado en login:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Error inesperado al intentar iniciar sesión.',
        });
      }
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
            placeholder="Docente@unj.edu.pe"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="invalid-feedback">{formik.errors.email}</div>
          )}
        </div>

        <div className="cont-password">
          <img src="/image/iconos/lock_16dp_b.svg" alt="" draggable="false" />
          <p>Contraseña</p>
        </div>
        <div className="input-password">
          <input
            className="password"
            type="password"
            name="clave"
            placeholder="••••••••••••"
            value={formik.values.clave}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
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
          <button type="submit" className="btn-con-imagen">
            <img src="/image/iconos/btn-acceder-b.svg" alt="Acceder" draggable="false" />
            <p>Acceder</p>
          </button>
        </div>
      </div>
    </form>
  );
}

export default Formulario;
