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


function AppRoutes() {
  const { usuario } = useUsuario();

  return (
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

        
      
          </Route>

          {/* Ruta que no usa Layout */}
          <Route path="/apps" element={<Apps />} />
          
          {/* Ruta por defecto para no encontradas */}
          <Route path="*" element={<Error404 />} />
        </>
      )}

      
    </Routes>
  );    
}

export default AppRoutes;
