import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../resource/Sidebar.css';

function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const cerrarSesion = () => {
    // Elimina el usuario del almacenamiento local
    localStorage.removeItem('usuario');
    //window.location.reload();
    // Opcional: cerrar sesión de Google (si usas gapi en el futuro)
    // window.open('https://accounts.google.com/Logout', '_blank');

    // Redirige al inicio de sesión
    navigate('/');
    window.location.reload();
  };

  
  return (
    
    <div className="bg-light border-end p-3" style={{ width: '250px', height: '100%', background: 'white !important' }}>
      <h4 className="mb-4">
        <img src="https://pruebas.unj.edu.pe/zetunajaen/images/logounjaen.png" alt="logo" />
      </h4>

      <Link to="/" className="btn btn-outline-primary w-100 text-start mb-2">
        <i className="fas fa-home"></i> Principal
      </Link>

    

      <div className="mb-2">
        <button className="btn btn-outline-primary w-100 text-start" onClick={() => toggleMenu('datos')}>
          <i className="fas fa-cogs"></i> Administración
        </button>
        {openMenu === 'datos' && (
          <ul className="list-group list-group-flush ms-3 mt-2">
            <li className="list-group-item p-1 border-0">
              <Link to="/datos" className="text-decoration-none">🔹 Datos Alumno</Link>
            </li>
          </ul>
        )}
      </div>

      <div className="mb-2">
        <button className="btn btn-outline-primary w-100 text-start" onClick={() => toggleMenu('academico')}>
          <i className="fas fa-book-open"></i> Des. Asignatura
        </button>
        {openMenu === 'academico' && (
          <ul className="list-group list-group-flush ms-3 mt-2">
            <li className="list-group-item p-1 border-0">
              <Link to="/silabus" className="text-decoration-none">🔹 Sílabos</Link>
            </li>
            <li className="list-group-item p-1 border-0">
              <Link to="/guias" className="text-decoration-none">🔹 Guías</Link>
            </li>
          </ul>
        )}
      </div>

      <div className="mb-2">
        <button className="btn btn-outline-primary w-100 text-start" onClick={() => toggleMenu('matricula')}>
          <i className="fas fa-clipboard-list"></i> Matrícula
        </button>
        {openMenu === 'matricula' && (
          <ul className="list-group list-group-flush ms-3 mt-2">
            <li className="list-group-item p-1 border-0">
              <Link to="/fichamatricula" className="text-decoration-none">🔹 Pre / Matrícula</Link>
            </li>
          </ul>
        )}
      </div>

      <div className="mb-2">
        <button className="btn btn-outline-primary w-100 text-start" onClick={() => toggleMenu('reportestud')}>
          <i className="fas fa-chart-bar"></i> Reportes
        </button>
        {openMenu === 'reportestud' && (
          <ul className="list-group list-group-flush ms-3 mt-2">
            <li className="list-group-item p-1 border-0">
              <Link to="/reportestud" className="text-decoration-none">🔹 Pre / Matrícula</Link>
            </li>
          </ul>
        )}
      </div>

      {/* Botón para cerrar sesión */}
      <div className="mt-4">
        <button className="btn btn-danger w-100" onClick={cerrarSesion}>
          <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
