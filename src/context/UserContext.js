// src/context/UserContext.js   ---- NUEVO MODULO
// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("sanctum_token");
    if (!token) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await axios.get(`${config.apiUrl}api/me2`);

      if (data.success) {
        // 🧩 Estructura unificada (igual que login)
        const refreshed = {
          codigotokenautenticadorunj: token,
          docente: data.docente,
          datosdocente: data.datosdocente,
          opciones: data.opciones ?? [],
          name: data.docente?.nombrecompleto ?? "",
          email: data.docente?.email ?? "",
        };

        localStorage.setItem("usuario", JSON.stringify(refreshed));
        setUsuario(refreshed);
      } else {
        setUsuario(null);
        localStorage.removeItem("usuario");
      }
    } catch (error) {
      console.error("Error al refrescar sesión:", error);
      localStorage.removeItem("sanctum_token");
      localStorage.removeItem("usuario");
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      const token = localStorage.getItem("sanctum_token");

      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        await axios.post(`${config.apiUrl}api/logout`);
      }
    } catch (error) {
      console.warn("Error al cerrar sesión:", error);
    } finally {
      delete axios.defaults.headers.common.Authorization;
      setUsuario(null);
      localStorage.removeItem("usuario");
      localStorage.removeItem("sanctum_token");
      window.location.replace("/login");
    }
  };

  return (
    <UserContext.Provider value={{ usuario, setUsuario, refreshUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsuario = () => useContext(UserContext);
