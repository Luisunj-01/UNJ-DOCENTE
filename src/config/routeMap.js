// src/config/routeMap.js
export const routeMap = {
  // Administración (menu 001)22
  // Administración (menu 001)22
  '01-001-001': '/apps/MOD01/principal',
  '01-001-002': '/apps/MOD01/admin/general',
  '01-001-003': '/apps/MOD01/admin/cronograma',
  '01-001-009': '/apps/MOD01/admin/usuarios',
  '01-001-010': '/apps/MOD01/admin/cerrar-sesion',
  '01-001-018': '/apps/MOD01/admin/cambiar-password',
  '01-001-019': '/apps/MOD01/admin/alumno',
  '01-001-020': '/apps/MOD01/docente/datos', //ADAPTADA PARA MOSTRAR DATOS DEL DOCENTE, EN ADMIN ES PARA GESTION DE DOCENTES GENERAL, 
  '01-001-024': '/apps/MOD01/admin/cronoestudiante',
  '01-001-033': '/apps/MOD01/admin/subir-fotoalumno',
  '01-001-034': '/apps/MOD01/admin/subir-fotodocente',
  '01-001-035': '/apps/MOD01/admin/subir-firma',
  '01-001-066': '/apps/MOD01/admin/subir-reciboalumno',
  '01-001-067': '/apps/MOD01/admin/subir-recibodocente',
  '01-001-068': '/apps/MOD01/admin/resolucion-alumno',
  '01-001-069': '/apps/MOD01/admin/resolucion-docente',
  '01-001-070': '/apps/MOD01/admin/subir-voucher',
  '01-001-071': '/apps/MOD01/admin/aprobar-voucher',
  '01-001-072': '/apps/MOD01/admin/mis-voucher',
  '01-001-073': '/apps/MOD01/admin/ficha-actualizacion',
  '01-001-074': '/apps/MOD01/admin/ficha-covid',
  '01-001-099': '/apps/MOD01/admin/registro-logs',

  // Des. Asignatura (menu 002)14
  '01-002-004': '/apps/MOD01/asignatura/programacion-cursos',
  '01-002-005': '/apps/MOD01/asignatura/programacion-horarios',
  '01-002-017': '/apps/MOD01/asignatura/subir-silabo',
  '01-002-020': '/apps/MOD01/asignatura/migrar-moodle',
  '01-002-021': '/apps/MOD01/asignatura/silabos',
  '01-002-022': '/apps/MOD01/asignatura/ingresar-formula',
  '01-002-023': '/apps/MOD01/asignatura/registro-semanas',
  '01-002-024': '/apps/MOD01/asignatura/asistencia-estudiante',
  '01-002-033': '/apps/MOD01/asignatura/reprogramacion',
  '01-002-036': '/apps/MOD01/asignatura/docente-tutor',
  '01-002-040': '/apps/MOD01/curso',   //ADAPTADA PARA LA GESTION DE CURSOS /asignatura/guias  en BD CAMBIAR EL CAMPO nombre de men_opciones, el maper lo toma etiqueta para la opcion
  '01-002-041': '/apps/MOD01/asignatura/verguias',
  '01-002-055': '/apps/MOD01/asignatura/castone',
  '01-002-069': '/apps/MOD01/asignatura/ingreso-notas',

  // Matrícula (menu 003)6
  '01-003-012': '/apps/MOD01/matricula/certificados',
  '01-003-013': '/apps/MOD01/matricula/homologacion',
  '01-003-014': '/apps/MOD01/matricula/prematricula',
  '01-003-015': '/apps/MOD01/matricula/habilitar',
  '01-003-016': '/apps/MOD01/matricula/rezagados',
  '01-003-017': '/apps/MOD01/matricula/aplazados',

  // Notas (menu 004)2
  '01-004-016': '/apps/MOD01/notas/ingreso-docente',
  '01-004-017': '/apps/MOD01/notas/ingreso-rezagado',

  // Reportes (menu 005)6
  '01-005-006': '/apps/MOD01/reportes/estudiantes',
  '01-005-007': '/apps/MOD01/reportes/estadisticos',
  '01-005-008': 'apps/MOD01/Reportecurricular',//ADAPTADA PARA LA GESTION DE reportes  ruta antigua /reportes/curricular
  '01-005-011': '/apps/MOD01/reportes/actas',
  '01-005-012': '/apps/MOD01/ReporteDoc',  //ADAPTADA PARA LA GESTION DE reporteS ruta antigua /reportes/docente 
  '01-005-017': '/apps/MOD01/reportes/generales',

  // Seg. Egresado (menu 006)3
  '01-006-001': '/apps/MOD01/egresados/calculo',
  '01-006-002': '/apps/MOD01/egresados/reportes',
  '01-006-003': '/apps/MOD01/egresados/seguimiento',

  // Servicios (menu 007)13
  '01-007-001': '/apps/MOD01/servicios/primera-matricula',
  '01-007-002': '/apps/MOD01/servicios/consulta-egresado',
  '01-007-003': '/apps/MOD01/servicios/retiros',
  '01-007-004': '/apps/MOD01/servicios/suspensiones',
  '01-007-005': '/apps/MOD01/servicios/expulsiones',
  '01-007-006': '/apps/MOD01/servicios/reservas',
  '01-007-007': '/apps/MOD01/servicios/reanudacion',
  '01-007-008': '/apps/MOD01/servicios/cambiar-seccion',
  '01-007-009': '/apps/MOD01/servicios/reportes-lote',
  '01-007-010': '/apps/MOD01/servicios/becados',
  '01-007-033': '/apps/MOD01/servicios/subir-foto',
  '01-007-066': '/apps/MOD01/servicios/encuesta-minedu',
  '01-007-067': '/apps/MOD01/servicios/fotos',

  // Tutoría (menu 009)6
  '01-009-001': '/apps/MOD01/tutoria/obs',      //ADAPTADA PARA tutoria
  '01-009-002': '/apps/MOD01/tutoria/ciclo',  // adaptada   ruta antigua:  /tutoria/sesiones-ciclo
  '01-009-003': '/apps/MOD01/tutoria/individual',  ///tutoria/sesiones-individuales
  '01-009-004': '/apps/MOD01/Reportes', // /tutoria/reportes
  '01-009-005': '/apps/MOD01/tutoria/libre',   // /tutoria/sesiones-libres
  '01-009-006': '/apps/MOD01/tutoria/derivaciones',
  '01-009-100': '/apps/MOD01/tutoria/formatos',
  '01-009-007': '/apps/MOD01/tuto/micalendario',
  '01-009-008': '/apps/MOD01/Dashboard',

  //-------------------MODULO EVALUACION DOCENTE
  '3-13-91': '/apps/MOD03/EvaluacionDocente',

  //-------------------MODULO CARGA NO LECTIVA
  '09-001-004': '/apps/MOD09/Declaracion',
  '09-001-005': '/apps/MOD09/Horarios',

    //-------------------MODULO CARGA NO LECTIVA
  '10-34-159': '/apps/MOD10/Documentos',

};
