// src/AppRoutes.js IMPORTANTE
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUsuario } from './context/UserContext';
import RutaPrivada from './componentes/RutaPrivada';
import { useState } from "react";
import initializeAxios from "./interceptor.js";


// Páginas
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
import Sesionlibre from './pages/tutoria/Sesionlibre.js';
import Sesionciclo from './pages/tutoria/Sesionciclo.js';
import SesionIndiv from './pages/tutoria/Sesionindiv.js';
import TutoriaCalendario from './pages/tutoria/componentes/TutoriaCalendario.jsx';




import Reportes from './pages/tutoria/Reportes.js';

// 🧾 Reportes imprimibles
import ImprimirFichaMatricula from "./pages/tutoria/componentes/ImprimirFichaMatricula";
import ImprimirAvanceAcademico from "./pages/tutoria/componentes/ImprimirAvanceAcademico";
import ImprimirConstanciaNotas from "./pages/tutoria/componentes/ImprimirConstanciaNotas";
import ImprimirHorarioAlumno from "./pages/tutoria/componentes/ImprimirHorarioAlumno";
import ImprimirAsistenciaAlumno from "./pages/tutoria/componentes/ImprimirAsistenciaAlumno";
import ImprimirRecordNotas from "./pages/tutoria/componentes/ImprimirRecordNotas";
import ImprimirPlanCurricular from "./pages/tutoria/componentes/ImprimirPlanCurricular";
import ImprimirRecordCurricular from "./pages/tutoria/componentes/ImprimirRecordCurricular";
import ImprimirRecordDetallado from "./pages/tutoria/componentes/ImprimirRecordDetallado";
import ImprimirCursosFaltantes from './pages/tutoria/componentes/ImprimirCursosFaltantes';
import ImprimirCursosDisponibles from './pages/tutoria/componentes/ImprimirCursosDisponibles';

import DashboardDocente from './pages/tutoria/componentes/DashboardDocente';





import Error404 from './pages/error404/Error404.js';
import Apps from './pages/apps/apps.js';
import Cursos from './pages/cursos/Cursos.js';
import Detallecursos from './pages/cursos/DetalleCurso.js';
import ParticipantesGuias from './pages/cursos/componentes/ParticipantesGuias';
import Tutoria from './pages/tutoria/Tutoria.js';
import Declaracion from './pages/actividades/Declaracion.js';
import Horarios from './pages/actividades/Horarios.js';
import ObsRendimiento from './pages/tutoria/ObsRendimiento.js';

// Reportes impresión (fuera de Layout visual, pero protegidos)
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

import GoogleCallback from './pages/login/AuthCallback.js'; // agrega este archivo
import RecuperarPassword from "./pages/login/RecuperarPassword.jsx";
import NuevaPassword from "./pages/login/NuevaPassword.jsx"; 





function AppRoutes() {

  const { usuario } = useUsuario();


 
   const [showAlert, setShowAlert] = useState(false);
  initializeAxios();
  
  // useInactividad(() => {
//   if (usuario) {
//     setShowAlert(true); 
//     logout();// Mostrar alerta
//   }
// }, 1800000);

 

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      {/* <Route path="/google/callback" element={<GoogleCallback />} /> */}
      <Route path="/auth/callback" element={<GoogleCallback />} />
      <Route path="/recuperar" element={<RecuperarPassword />} />
      <Route path="/nueva-password" element={<NuevaPassword />} />


      {/* Rutas privadas dentro de Layout */}
      {usuario ? (
        <>
          <Route path="/" element={<Layout />}>
            <Route index element={<Inicio />} />

            <Route path="/docente/datos" element={<RutaPrivada permisoRequerido="001-020"><DatosDocente /></RutaPrivada>} />

            <Route path="silabus" element={<Silabus />} />
            <Route path="detalle-silabo" element={<DetalleSilabo />} />
            <Route path="Guias" element={<Guias />} />
            <Route path="Asistenciaestudiant" element={<Asistenciaestudiant />} />
            <Route path="Ingresonotasdoc" element={<Ingresonotasdoc />} />
            <Route path="IngresoRezaAplaz" element={<IngresoRezaAplaz />} />

            {/* <Route path="ReporteDoc" element={<ReporteDoc />} />
            <Route path="Reportecurricular" element={<Reportecurricular />} /> */}
            <Route path="ReporteDoc" element={<RutaPrivada permisoRequerido="005-012"><ReporteDoc /></RutaPrivada>} />
            <Route path="Reportecurricular" element={<RutaPrivada permisoRequerido="005-008"><Reportecurricular /></RutaPrivada>} />

            <Route path="tuto/micalendario" element={<TutoriaCalendario />} />

            {/* <Route path="tutoria/obs" element={<ObsRendimiento />} /> */}
            <Route path="tutoria/obs" element={<RutaPrivada permisoRequerido="009-001"><ObsRendimiento /></RutaPrivada>} />

            {/* <Route path="tutoria/ciclo" element={<Sesionciclo />} /> */}
            <Route path="tutoria/ciclo" element={<RutaPrivada permisoRequerido="009-002"><Sesionciclo /></RutaPrivada>} />

            {/* <Route path="tutoria/libre" element={<Sesionlibre />} /> */}
            <Route path="tutoria/libre" element={<RutaPrivada permisoRequerido="009-005"><Sesionlibre /></RutaPrivada>} />
            {/* <Route path="tutoria/individual" element={<SesionIndiv />} /> */}
            <Route path="tutoria/individual" element={<RutaPrivada permisoRequerido="009-003"><SesionIndiv /></RutaPrivada>} />

            {/* <Route path="Reportes" element={<Reportes />} /> */}

            <Route path="Reportes" element={<RutaPrivada permisoRequerido="009-004"><Reportes /></RutaPrivada>} />


            <Route path="Dashboard" element={<RutaPrivada permisoRequerido="009-008"><DashboardDocente /></RutaPrivada>} />



            {/* <Route path="Curso" element={<Cursos />} /> */}
            <Route path="Curso" element={<RutaPrivada permisoRequerido="002-040"><Cursos /></RutaPrivada>} />
           
            <Route path="curso/detalle_curso/:id" element={<Detallecursos />} />
            <Route path="participantes/:id" element={<ParticipantesGuias />} />


          
            {/* <RUTA DE MODULO CARGA NO LECTIVAS/>} /> */}
           <Route path="Declaracion" element={<RutaPrivada permisoRequerido="001-004"><Declaracion /></RutaPrivada>} />
            <Route path="Horarios" element={<RutaPrivada permisoRequerido="001-005"><Horarios /></RutaPrivada>} />
       


           

            <Route path="Curso" element={<Cursos />} />
            <Route path="curso/detalle_curso/:id" element={<Detallecursos />} />
            <Route path="participantes/:id" element={<ParticipantesGuias />}/>
            <Route path="tutoria" element={<Tutoria />} />
            <Route path="Declaracion" element={<Declaracion />} />
            <Route path="Horarios" element={<Horarios />} />
      

          </Route>

          {/* Privadas fuera de Layout */}
          <Route path="/apps" element={<Apps />} />

          <Route path="/Imprimirdocentesemestrecarga" element={<Imprimirdocentesemestrecarga />} />
          <Route path="/Imprimirhorariodocente" element={<Imprimirhorariodocente />} />
          <Route path="/Imprimirguiasemana" element={<Imprimirguiasemana />} />
          <Route path="/ImprimirAsistenciaSemana" element={<ImprimirAsistenciaSemana />} />
          <Route path="/ImprimirActaDetalle" element={<ImprimirActaDetalle />} />
          <Route path="/ImprimirReporteNota" element={<ImprimirReporteNota />} />
          <Route path="/ImprimirListaMatriculados" element={<ImprimirListaMatriculados />} />
          <Route path="/ImprimirFichaGuia" element={<ImprimirFichaGuia />} />
          <Route path="/ImprimirReporteSesiones" element={<ImprimirReporteSesiones />} />
          <Route path="/ImprimirAsistenciaGuia" element={<ImprimirAsistenciaGuia />} />
          <Route path="/ImprimirAsistenciaPorcentaje" element={<ImprimirAsistenciaPorcentaje />} />
          <Route path="/ImprimirAsistenciaSesiones" element={<ImprimirAsistenciaSesiones />} />

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

          <Route path="/tutoria/fichaMatricula" element={<ImprimirFichaMatricula />} />
          <Route path="/tutoria/imprimir-avance" element={<ImprimirAvanceAcademico />}/>
          <Route path="/tutoria/imprimir-constancia" element={<ImprimirConstanciaNotas />}/>
          <Route path="/tutoria/horario" element={<ImprimirHorarioAlumno />}/>
          <Route path="/tutoria/asistenciaestudiante" element={<ImprimirAsistenciaAlumno />}/>

          <Route path="/tutoria/record" element={<ImprimirRecordNotas />}/>
          <Route path="/tutoria/plancurricular" element={<ImprimirPlanCurricular />}/>
           <Route path="/tutoria/recordcurricular" element={<ImprimirRecordCurricular />}/>
           <Route path="/tutoria/recordetallado" element={<ImprimirRecordDetallado />}/>
           <Route path="/tutoria/cursosfaltantes" element={<ImprimirCursosFaltantes />}/>
            <Route path="/tutoria/cursosdisponible" element={<ImprimirCursosDisponibles />}/>
     

     
       


          {/* Fallback autenticado */}
          <Route path="*" element={<Error404 />} />
        </>
      ) : (
        // Si no hay usuario: redirige todo a /login
        <>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default AppRoutes;
