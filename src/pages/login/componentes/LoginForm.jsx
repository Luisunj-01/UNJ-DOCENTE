// src/pages/login/componentes/LoginForm.js
import { useFormik } from "formik";
import * as Yup from 'yup';

function Formulario({ onLogin }) {
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
