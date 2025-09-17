import { useState, useEffect } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";
import { obtenerDatosDocente } from "./logica/Actividades";

// importar el servicio


function Declaracion() {
  const [semestre, setSemestre] = useState("202501");
  const { usuario } = useUsuario();

  const [docente, setDocente] = useState(null);
  const [cargaLectiva, setCargaLectiva] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      setLoading(true);
      const result = await obtenerDatosDocente(usuario.sede, semestre, usuario.dni);
      console.log(result);

      if (result.datos) {
        setDocente(result.datos.docente);
        setCargaLectiva(result.datos.cargaLectiva || []);
        setActividades(result.datos.actividades || []);
        setMensaje("");
      } else {
        setDocente(null);
        setCargaLectiva([]);
        setActividades([]);
        setMensaje(result.mensaje);
      }
      setLoading(false);
    };

    cargarDatos();
  }, [semestre, usuario]);

  return (
    <>
      <BreadcrumbUNJ />
      <div className="container mt-4">
        <div className="containerunj mt-3">
          {/* Selección de semestre */}
          <form className="mb-3">
            <div className="row">
              <div className="col-md-1">
                <label className="form-label">
                  <strong>Semestre:</strong>
                </label>
              </div>
              <div className="col-md-3">
                <SemestreSelect
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  name="cboSemestre"
                />
              </div>
            </div>
          </form>

          {loading && <p>Cargando...</p>}
          {mensaje && <p className="text-danger">{mensaje}</p>}

          {/* Datos del docente */}
          {docente && (
            <div className="mb-4">
              <h5 className="text-center">DATOS DOCENTE</h5>
              <table className="table table-sm table-bordered">
                <tbody>
                  <tr>
                    <td><strong>DNI</strong></td>
                    <td>{docente.numerodocumento}</td>
                  </tr>
                  <tr>
                    <td><strong>Nombre</strong></td>
                    <td>{docente.nombrecompleto}</td>
                  </tr>
                  <tr>
                    <td><strong>Categoría</strong></td>
                    <td>{docente.descripcioncategoria}</td>
                  </tr>
                  <tr>
                    <td><strong>Condición</strong></td>
                    <td>{docente.descripcioncondicion}</td>
                  </tr>
                  <tr>
                    <td><strong>Dedicación</strong></td>
                    <td>{docente.descripciondedicacion}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Carga lectiva */}
          {cargaLectiva.length > 0 && (
            <div className="mb-4">
              <h5 className="text-center">1. TRABAJO LECTIVO</h5>
              <table className="table table-sm table-striped table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Curso</th>
                    <th>Escuela</th>
                    <th>Ciclo</th>
                    <th>Sec</th>
                    <th>Ht</th>
                    <th>Hp</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cargaLectiva.map((c, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{c.codigo}</td>
                      <td>{c.curso}</td>
                      <td>{c.escuela}</td>
                      <td>{c.ciclo}</td>
                      <td>{c.seccion}</td>
                      <td>{c.ht}</td>
                      <td>{c.hp}</td>
                      <td>{c.ht + c.hp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actividades no lectivas */}
          {actividades.length > 0 && (
            <div className="mb-4">
              <h5 className="text-center">2. ACTIVIDADES NO LECTIVAS</h5>
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {actividades.map((a, i) => (
                    <tr key={i}>
                      <td>{a.codigo}</td>
                      <td>{a.descripcion}</td>
                      <td>{a.horas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Declaracion;
