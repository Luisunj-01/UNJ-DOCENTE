import React, { useEffect, useState } from "react";
import { obtenerDetalleActa, guardarNotasActa } from "../../asignatura/logica/asignatura";

const CalificacionesDocente = () => {
  // Datos de prueba (luego los puedes reemplazar con props o contexto)
  const sede = sede;
  const semestre = semestre;
  const escuela = escuela;
  const curricula = curricula;
  const curso = curso;
  const seccion = seccion;
  const uni = uni;

  const [unidad, setUnidad] = useState("01");
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const unidades = [
    { value: "01", label: "PRIMER PROMEDIO" },
    { value: "02", label: "SEGUNDO PROMEDIO" },
    { value: "03", label: "TERCER PROMEDIO" },
    { value: "04", label: "SUSTITUTORIO" },
    { value: "05", label: "APLAZADO" },
  ];

  // Cargar notas al cambiar la unidad
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await obtenerDetalleActa(
        sede,
        semestre,
        escuela,
        curricula,
        curso,
        seccion,
        uni
      );
      setCalificaciones(response.data?.data || []);

      setLoading(false);
    };
    fetchData();
  }, [unidad]);

  // Manejar cambio de notas
  const handleNotaChange = (index, campo, valor) => {
    const nuevasNotas = [...calificaciones];
    nuevasNotas[index][campo] = valor;

    const EC = parseFloat(nuevasNotas[index].EC || 0);
    const EP = parseFloat(nuevasNotas[index].EP || 0);
    const EA = parseFloat(nuevasNotas[index].EA || 0);
    nuevasNotas[index].PU = ((EC + EP + EA) / 3).toFixed(2);

    setCalificaciones(nuevasNotas);
  };

  // Guardar todas las notas
  const handleGuardar = async () => {
    const response = await guardarNotasActa(
      sede,
      semestre,
      escuela,
      curricula,
      curso,
      seccion,
      uni,
      calificaciones
    );
    if (response.exito) {
      alert("Notas guardadas correctamente ✅");
    } else {
      alert("Error al guardar ❌: " + response.mensaje);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Registro de Calificaciones</h2>

      {/* Select Unidad */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Unidad:</label>
        <select
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
          className="border p-2 rounded"
        >
          {unidades.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full border border-collapse text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Nro</th>
              <th className="border p-2">Código</th>
              <th className="border p-2">Nombres</th>
              <th className="border p-2">EC</th>
              <th className="border p-2">EP</th>
              <th className="border p-2">EA</th>
              <th className="border p-2">PU</th>
            </tr>
          </thead>
          <tbody>
            {calificaciones.map((alumno, index) => (
              <tr key={alumno.Codigo}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{alumno.Codigo}</td>
                <td className="border p-2">{alumno.Nombres}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={alumno.EC || ""}
                    onChange={(e) => handleNotaChange(index, "EC", e.target.value)}
                    className="w-16 border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={alumno.EP || ""}
                    onChange={(e) => handleNotaChange(index, "EP", e.target.value)}
                    className="w-16 border rounded p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={alumno.EA || ""}
                    onChange={(e) => handleNotaChange(index, "EA", e.target.value)}
                    className="w-16 border rounded p-1"
                  />
                </td>
                <td className="border p-2">{alumno.PU}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={handleGuardar}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Guardar Notas
      </button>
    </div>
  );
};

export default CalificacionesDocente;
