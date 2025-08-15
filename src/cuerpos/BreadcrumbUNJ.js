import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaLaptop, FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const nombresPersonalizados = {
  datos: 'Mis Datos',
  //fichamatricula: 'Pre Matrícula',
  //reportestud: 'Reporte Estudiante',
  silabus: 'Sílabus',
  //guias: 'Guías',
  detalle_guias: 'Detalle Guías',
  curso: 'Mis Cursos',
  detalle_curso: 'Detalle Curso',
};

const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const formatearSegmento = (segmento) =>
  nombresPersonalizados[segmento]
    ? nombresPersonalizados[segmento]
    : segmento.split('_').map(capitalizar).join(' ');

const BreadcrumbUNJ = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [puedeVolver, setPuedeVolver] = useState(false);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  useEffect(() => {
    setPuedeVolver(window.history.length > 1);
  }, []);

  // Página Principal
  breadcrumbs.push(
    <li key="home" className="breadcrumb-item">
      <Link to="/" style={{ color: 'hsl(0deg 0% 40%)', textDecoration: 'none' }}>
        <FaLaptop className="me-2" /> Principal
      </Link>
    </li>
  );

  let basePath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    const segmento = pathSegments[i];
    const isLast = i === pathSegments.length - 1;
    const isDetalle = segmento.startsWith('detalle_');
    const siguienteSegmento = pathSegments[i + 1];
    const esVistaDetalleReal = siguienteSegmento && siguienteSegmento.length > 10;

    if (isDetalle && esVistaDetalleReal) {
      const base = segmento.replace('detalle_', '');
      breadcrumbs.push(
        <li key="detalle-id" className="breadcrumb-item active" style={{ color: 'hsl(0deg 0% 40%)', fontWeight: 'bold' }}>
          {(() => {
            try {
              const decoded = atob(atob(siguienteSegmento));
              const partes = decoded.split('|');
              return partes[partes.length - 2];
            } catch {
              return '[ID inválido]';
            }
          })()}
        </li>
      );
      break;
    }

    basePath += `/${segmento}`;
    breadcrumbs.push(
      <li
        key={segmento}
        className={`breadcrumb-item ${isLast ? 'active' : ''}`}
        style={{
          color: isLast ? 'hsl(0deg 0% 40%)' : 'rgb(102, 102, 102)',
          fontWeight: isLast ? 'bold' : 'normal',
        }}
      >
        {isLast ? (
          formatearSegmento(segmento)
        ) : (
          <Link to={basePath} style={{ color: 'rgb(102, 102, 102)' }}>
            {formatearSegmento(segmento)}
          </Link>
        )}
      </li>
    );
  }

  const { darkMode } = useTheme();
  const logo = darkMode
    ? '/image/logo/logo-unj-v1.svg'
    : '/image/logo/logo-unj-v1.svg';

  return (
    <div className="container">
      <div className="row align-items-center justify-content-between">
        <div className="col-lg-8 col-md-6 col-sm-12">
          <ul className="breadcrumb back-color-bd">
            {breadcrumbs}
            <img alt="Logo UNJ" className="logounjcont" src={logo} />
          </ul>
        </div>
        {puedeVolver && (
          <div className="col-lg-4 col-md-6 col-sm-12 text-end">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary btn-sm"
            >
              <FaArrowLeft className="me-2" />
              Regresar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbUNJ;
