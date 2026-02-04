// src/pages/login/CambiarContrasena.jsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../../context/UserContext";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";

export default function CambiarContrasena() {
  const navigate = useNavigate();
  const { usuario } = useUsuario();
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const formik = useFormik({
    initialValues: {
      contrasena_actual: "",
      contrasena_nueva: "",
      confirmar_contrasena: "",
    },
    validationSchema: Yup.object({
      contrasena_actual: Yup.string()
        .required("La contraseña actual es requerida"),
      contrasena_nueva: Yup.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .required("La nueva contraseña es requerida")
        .notOneOf([Yup.ref("contrasena_actual")], "La nueva contraseña debe ser diferente a la actual"),
      confirmar_contrasena: Yup.string()
        .oneOf([Yup.ref("contrasena_nueva"), null], "Las contraseñas no coinciden")
        .required("Debes confirmar la nueva contraseña"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const response = await axios.post(`${config.apiUrl}api/cambiar-contrasena`, {
          contrasena_actual: values.contrasena_actual,
          contrasena_nueva: values.contrasena_nueva,
          contrasena_nueva_confirmation: values.confirmar_contrasena,
        });

        if (response.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Contraseña actualizada",
            text: "Tu contraseña ha sido cambiada exitosamente. Por seguridad, debes iniciar sesión nuevamente.",
            confirmButtonText: "Aceptar",
          });

          // Cerrar sesión en el backend
          try {
            await axios.post(`${config.apiUrl}/api/logout`);
          } catch (_) {
            // Ignorar error si ya expiró
          }

          // Limpiar sesión del frontend
          sessionStorage.removeItem("usuario");
          sessionStorage.removeItem("sanctum_token");
          localStorage.clear();
          delete axios.defaults.headers.common["Authorization"];

          // Redirigir al login
          window.location.href = "/";
        }
      } catch (error) {
        let mensaje = "Ocurrió un error al cambiar la contraseña.";
        
        if (error.response?.status === 401) {
          mensaje = "La contraseña actual es incorrecta.";
        } else if (error.response?.status === 422) {
          mensaje = error.response.data?.message || "Datos inválidos. Verifica los campos.";
        } else if (error.response?.status === 429) {
          mensaje = "Demasiados intentos. Por favor, espera un momento.";
        } else if (error.response?.data?.message) {
          mensaje = error.response.data.message;
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: mensaje,
          confirmButtonText: "Cerrar",
        });
      }

      helpers.setSubmitting(false);
    },
  });

  return (
    <>
      <BreadcrumbUNJ />
      <div className="container mt-4">
        <div className="containerunj">
          <h2
        className="titlebienvenida"
        style={{ textAlign: 'center' }}
      >
        Cambiar Contraseña
      </h2>
          
          <div className="row justify-content-center mt-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={formik.handleSubmit}>
                    
                    {/* Contraseña Actual */}
                    <div className="mb-3">
                      <label htmlFor="contrasena_actual" className="form-label">
                        Contraseña Actual
                      </label>
                      <div className="input-group">
                        <input
                          type={verActual ? "text" : "password"}
                          className={`form-control ${
                            formik.touched.contrasena_actual && formik.errors.contrasena_actual
                              ? "is-invalid"
                              : ""
                          }`}
                          id="contrasena_actual"
                          name="contrasena_actual"
                          placeholder="Ingresa tu contraseña actual"
                          value={formik.values.contrasena_actual}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={formik.isSubmitting}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setVerActual(!verActual)}
                        >
                          {verActual ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      {formik.touched.contrasena_actual && formik.errors.contrasena_actual && (
                        <div className="text-danger small mt-1">
                          {formik.errors.contrasena_actual}
                        </div>
                      )}
                    </div>

                    {/* Nueva Contraseña */}
                    <div className="mb-3">
                      <label htmlFor="contrasena_nueva" className="form-label">
                        Nueva Contraseña
                      </label>
                      <div className="input-group">
                        <input
                          type={verNueva ? "text" : "password"}
                          className={`form-control ${
                            formik.touched.contrasena_nueva && formik.errors.contrasena_nueva
                              ? "is-invalid"
                              : ""
                          }`}
                          id="contrasena_nueva"
                          name="contrasena_nueva"
                          placeholder="Ingresa tu nueva contraseña"
                          value={formik.values.contrasena_nueva}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={formik.isSubmitting}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setVerNueva(!verNueva)}
                        >
                          {verNueva ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      {formik.touched.contrasena_nueva && formik.errors.contrasena_nueva && (
                        <div className="text-danger small mt-1">
                          {formik.errors.contrasena_nueva}
                        </div>
                      )}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div className="mb-3">
                      <label htmlFor="confirmar_contrasena" className="form-label">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="input-group">
                        <input
                          type={verConfirmar ? "text" : "password"}
                          className={`form-control ${
                            formik.touched.confirmar_contrasena && formik.errors.confirmar_contrasena
                              ? "is-invalid"
                              : ""
                          }`}
                          id="confirmar_contrasena"
                          name="confirmar_contrasena"
                          placeholder="Confirma tu nueva contraseña"
                          value={formik.values.confirmar_contrasena}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={formik.isSubmitting}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setVerConfirmar(!verConfirmar)}
                        >
                          {verConfirmar ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      {formik.touched.confirmar_contrasena && formik.errors.confirmar_contrasena && (
                        <div className="text-danger small mt-1">
                          {formik.errors.confirmar_contrasena}
                        </div>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="d-flex gap-2 justify-content-end mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/miperfil")}
                        disabled={formik.isSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={formik.isSubmitting}
                      >
                        {formik.isSubmitting ? "Guardando..." : "Cambiar Contraseña"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
