// src/services/ssoService.js
import axios from "axios";
import Swal from "sweetalert2";
import config from "../config.js";

export async function openExternalApp(appCode, appImage) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let swalInstance = null;

  try {
    // Mostrar loading inmediatamente
    swalInstance = Swal.fire({
      title: "Conectando…",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
          ${appImage ? `<img src="${appImage}" alt="logo" style="width:48px;height:48px;margin-bottom:12px;border-radius:8px;background:#fff;" />` : ""}
          Accediendo a <b>${appCode.toUpperCase()}</b>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Timeout de 15 segundos para evitar esperas eternas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await axios.post(
      `${config.apiUrl}api/sso/app-access`,
      { app: appCode },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    // Pequeño delay para que el usuario vea el loading (mejora percepción)
    await sleep(800);

    Swal.close();
    window.open(response.data.redirect_url, "_blank", "noopener,noreferrer");

  } catch (error) {
    if (swalInstance) Swal.close();

    let title = "Error";
    let text = "No se pudo acceder a la aplicación en este momento.";
    let icon = "error";

    if (error.name === "AbortError") {
      title = "Tiempo de espera agotado";
      text = "La aplicación no respondió a tiempo. Por favor intenta nuevamente.";
    } else if (error?.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || text;

      if (status === 401) {
        title = "Sesión expirada";
        text = "Por favor vuelve a iniciar sesión.";
        icon = "warning";
      } else if (status === 403) {
        title = "Acceso denegado";
        text = "No tienes permisos para acceder a esta aplicación.";
        icon = "error";
      } else if (status >= 500) {
        title = "Error en el servidor";
        text = serverMessage || "El servicio presenta problemas técnicos. Intenta más tarde.";
      } else {
        text = serverMessage;
      }
    } else if (error.request) {
      title = "Sin respuesta";
      text = "No se recibió respuesta del servidor. Verifica tu conexión.";
    }

    Swal.fire({
      icon,
      title,
      text,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#003a8c",
    });

    console.error("SSO Error:", error);
  }
}