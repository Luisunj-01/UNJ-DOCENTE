import { useUsuario } from '../../context/UserContext';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import logoUNJ from "../../assets/images/unj-logo-ho.svg";

function Inicio() {
  const { usuario } = useUsuario();

  return (
    <>
      <BreadcrumbUNJ />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            {/* =========================
             *  Header de bienvenida
             * ========================= */}
            <div className="text-center mb-5">
              <img
                src={logoUNJ}
                alt="Universidad Nacional de Jaén"
                className="mb-4"
                style={{ height: "100px" }}
              />

              <h1 className="display-5 fw-bold text-primary">
                Bienvenido, {usuario?.name}
              </h1>

              <p className="lead text-muted">
                Portal del Docente – Desde aquí podrás acceder a tus datos académicos,
                asignaturas, notas, reportes y más.
              </p>
            </div>

            {/* =========================
             *  Panel de anuncios
             * ========================= */}
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card shadow-sm border-0 text-center p-5 bg-light">

                  <i className="bi bi-megaphone fs-1 text-primary mb-3"></i>

                  <h4 className="fw-bold">
                    Anuncios Institucionales
                  </h4>

                  <p className="text-muted mt-2">
                    En este espacio se publicarán próximamente comunicados oficiales,
                    avisos académicos, novedades del sistema y anuncios relevantes
                    para los docentes de la Universidad Nacional de Jaén.
                  </p>

                  <div className="mt-3">
                    <span className="badge bg-secondary px-4 py-2">
                      Próximamente
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* =========================
             *  Nota inferior
             * ========================= */}
            <div className="text-center mt-5">
              <p className="text-muted">
                Utiliza el menú lateral para navegar por los módulos disponibles.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Inicio;
