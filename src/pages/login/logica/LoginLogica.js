// src/pages/login/logica/LoginLogica.js
import axios from "axios";
import Swal from "sweetalert2";
import config from "../../../config";

export const iniciarSesion = async ({ email, clave }) => {
  try {
    const payload = { email, clave };
    const res = await axios.post(`${config.apiUrl}api/login`, payload);

    if (res.data.success) {
      const data = res.data;

      // 🧩 Estructura unificada (igual que refreshUser)
      const userData = {
        codigotokenautenticadorunj: data.token,
        docente: data.docente,
        datosdocente: data.datosdocente,
        opciones: data.opciones ?? [],
        name: data.docente?.nombrecompleto ?? "",
        email: data.docente?.email ?? "",
        expires_at: data.expires_at ?? null,
      };

      // Guardar en localStorage
      localStorage.setItem("usuario", JSON.stringify(userData));
      localStorage.setItem("sanctum_token", data.token);

      Swal.fire({
        title: "Bienvenido",
        text: userData.docente?.nombrecompleto ?? "Inicio de sesión correcto",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        window.location.reload();
      });

      return userData;
    } else {
      Swal.fire("Error", res.data.message, "error");
      return null;
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al iniciar sesión",
      text:
        error?.response?.data?.message ||
        error.message ||
        "Error desconocido al conectar con el servidor",
    });
    return null;
  }
};
