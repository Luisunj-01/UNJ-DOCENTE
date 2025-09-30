import { Routes, Route } from 'react-router-dom';
import { useUsuario } from './context/UserContext';
import Login from './pages/login/login.js';
import Layout from './cuerpos/Layout';
import Inicio from './pages/Inicio/Inicio';
import DatosDocente from './pages/administracion/DatosDocente.js';
import Silabus from './pages/asignatura/Silabus';
import DetalleSilabo from './pages/asignatura/componentes/DetalleSilabo';
import Guias from './pages/asignatura/Guias';
import Asistenciaestudiant from './pages/asignatura/Asistenciaestudiante.js';
import Ingresonotasdoc from './pages/notas/Ingresonotasdoc.js';
import IngresoRezaAplaz from './pages/notas/IngresoRezaAplaz.js';
import ReporteDoc from './pages/reportes/ReporteDoc.js';
import Reportecurricular from './pages/reportes/Reportecurricular.js';
import ObsRendimiento from './pages/tutoria/ObsRendimiento.js';
import Sesionlibre from './pages/tutoria/Sesionlibre.js';
import Sesionciclo from './pages/tutoria/Sesionciclo.js';
import SesionIndiv from './pages/tutoria/Sesionindiv.js';
import Reportes from './pages/tutoria/Reportes.js';
import Error404 from './pages/error404/Error404.js';
import Apps from './pages/apps/apps.js';
import Cursos from './pages/cursos/Cursos.js';
import Detallecursos from './pages/cursos/DetalleCurso.js';
//import DetalleGuias from './pages/cursos/componentes/DetalleGuias.jsx';
import ParticipantesGuias from './pages/cursos/componentes/ParticipantesGuias';
import { useState } from 'react';
import initializeAxios from './interceptor.js';
import useInactividad from './hooks/useInactividad.js';
import Imprimirdocentesemestrecarga from './pages/reportes/componentes/Imprimirdocentesemestrecarga.jsx';
import Imprimirhorariodocente from './pages/reportes/componentes/Imprimirhorariodocente.jsx';
import Imprimirguiasemana from './pages/reportes/componentes/Imprimirguiasemana.jsx';
import ImprimirAsistenciaSemana from './pages/reportes/componentes/ImprimirAsistenciaSemana';
import ImprimirActaDetalle from './pages/reportes/componentes/ImprimirActaDetalle.jsx';
import ImprimirReporteNota from './pages/reportes/componentes/ImprimirReporteNota.jsx';
import ImprimirListaMatriculados from './pages/reportes/componentes/ImprimirListaMatriculados.jsx';
import ImprimirFichaGuia from './pages/reportes/componentes/ImprimirFichaGuia.jsx';
import ImprimirReporteSesiones from './pages/reportes/componentes/ImprimirReporteSesiones.jsx';
import ImprimirAsistenciaGuia from './pages/reportes/componentes/ImprimirAsistenciaGuia.jsx';
import ImprimirAsistenciaPorcentaje from './pages/reportes/componentes/ImprimirAsistenciaPorcentaje.jsx';
import ImprimirAsistenciaSesiones from './pages/reportes/componentes/ImprimirAsistenciaSesiones.jsx';
import ImprimirHorarioDocente from './pages/actividades/componentes/ImprimirHorarioDocente.jsx';



import Tutoria from './pages/tutoria/Tutoria.js';
import Declaracion from './pages/actividades/Declaracion.js';
import Horarios from './pages/actividades/Horarios.js';





function AppRoutes() {
 const { usuario, logout } = useUsuario();
   const [showAlert, setShowAlert] = useState(false);
  initializeAxios();
  useInactividad(() => {
    if (usuario) {
      setShowAlert(true); 
      logout();// Mostrar alerta
      /*setTimeout(() => {
        setShowAlert(false); // Ocultar después de 3 segundos
        logout();
      }, 3000);*/
    }
  }, 1800000); 

  return (
    <>
      <Routes>

      {!usuario ? (
        <>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Error404 />} />
          
          

        </>
      ) : (
        <>
          <Route path="/" element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="datos" element={<DatosDocente />} />
            <Route path="silabus" element={<Silabus />} />
            <Route path="detalle-silabo" element={<DetalleSilabo />} />
            <Route path="Guias" element={<Guias />} />
            <Route path="Asistenciaestudiant" element={<Asistenciaestudiant />} />
            <Route path="Ingresonotasdoc" element={<Ingresonotasdoc />} />
            <Route path="IngresoRezaAplaz" element={<IngresoRezaAplaz />} />
            <Route path="ReporteDoc" element={<ReporteDoc />} />
            <Route path="Reportecurricular" element={<Reportecurricular />} />
            <Route path="ObsRendimiento" element={<ObsRendimiento />} />
            <Route path="Sesionciclo" element={<Sesionciclo />} />
            <Route path="Sesionlibre" element={<Sesionlibre />} />
            <Route path="Sesionindiv" element={<SesionIndiv />} />
            <Route path="Reportes" element={<Reportes />} />
            <Route path="Curso" element={<Cursos />} />
            <Route path="curso/detalle_curso/:id" element={<Detallecursos />} />
            <Route path="participantes/:id" element={<ParticipantesGuias />}/>
            <Route path="tutoria" element={<Tutoria />} />
            <Route path="Declaracion" element={<Declaracion />} />
            <Route path="Horarios" element={<Horarios />} />

        
      
          </Route>

          {/* Ruta que no usa Layout */}
          <Route path="/apps" element={<Apps />} />
          <Route path='Imprimirdocentesemestrecarga' element={<Imprimirdocentesemestrecarga />}  />
          <Route path='Imprimirhorariodocente' element={<Imprimirhorariodocente />}  />
          <Route path='Imprimirguiasemana' element={<Imprimirguiasemana />}   />
          <Route path='ImprimirAsistenciaSemana' element={<ImprimirAsistenciaSemana />}   />
          <Route path="ImprimirActaDetalle" element={<ImprimirActaDetalle />} />
          <Route path="ImprimirReporteNota" element={<ImprimirReporteNota />} />
          <Route path="ImprimirListaMatriculados" element={<ImprimirListaMatriculados />} />
          <Route path="ImprimirFichaGuia" element={<ImprimirFichaGuia />} />
          <Route path="ImprimirReporteSesiones" element={<ImprimirReporteSesiones />} />
          <Route path="ImprimirAsistenciaGuia" element={<ImprimirAsistenciaGuia />} />

          <Route path="ImprimirAsistenciaPorcentaje" element={<ImprimirAsistenciaPorcentaje />} />
          <Route path="ImprimirAsistenciaSesiones" element={<ImprimirAsistenciaSesiones />} />
          <Route path="ImprimirHorarioDocente" element={<ImprimirHorarioDocente />} />


          
          {/* Ruta por defecto para no encontradas */}
          <Route path="*" element={<Error404 />} />
        </>
      )}

      
    </Routes>

    {showAlert && (
      <div
        className="modal fade show"
        tabIndex="-1"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header ">
              <h5 className="modal-title" style={{color:'white'}}> Atención</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAlert(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Sesión cerrada por inactividad.</p>
            </div> 
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAlert(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );    
}

export default AppRoutes;
