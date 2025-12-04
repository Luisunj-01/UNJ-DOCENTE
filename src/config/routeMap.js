// src/config/routeMap.js
export const routeMap = {
  // Administración (menu 001)22
  '001-001': '/admin/principal',
  '001-002': '/admin/general',
  '001-003': '/admin/cronograma',
  '001-009': '/admin/usuarios',
  '001-010': '/admin/cerrar-sesion',
  '001-018': '/admin/cambiar-password',
  '001-019': '/admin/alumno',
  '001-020': '/docente/datos', //ADAPTADA PARA MOSTRAR DATOS DEL DOCENTE, EN ADMIN ES PARA GESTION DE DOCENTES GENERAL, 
  '001-024': '/admin/cronoestudiante',
  '001-033': '/admin/subir-fotoalumno',
  '001-034': '/admin/subir-fotodocente',
  '001-035': '/admin/subir-firma',
  '001-066': '/admin/subir-reciboalumno',
  '001-067': '/admin/subir-recibodocente',
  '001-068': '/admin/resolucion-alumno',
  '001-069': '/admin/resolucion-docente',
  '001-070': '/admin/subir-voucher',
  '001-071': '/admin/aprobar-voucher',
  '001-072': '/admin/mis-voucher',
  '001-073': '/admin/ficha-actualizacion',
  '001-074': '/admin/ficha-covid',
  '001-099': '/admin/registro-logs',

  // Des. Asignatura (menu 002)14
  '002-004': '/asignatura/programacion-cursos',
  '002-005': '/asignatura/programacion-horarios',
  '002-017': '/asignatura/subir-silabo',
  '002-020': '/asignatura/migrar-moodle',
  '002-021': '/asignatura/silabos',
  '002-022': '/asignatura/ingresar-formula',
  '002-023': '/asignatura/registro-semanas',
  '002-024': '/asignatura/asistencia-estudiante',
  '002-033': '/asignatura/reprogramacion',
  '002-036': '/asignatura/docente-tutor',
  '002-040': 'curso',   //ADAPTADA PARA LA GESTION DE CURSOS /asignatura/guias  en BD CAMBIAR EL CAMPO nombre de men_opciones, el maper lo toma etiqueta para la opcion
  '002-041': '/asignatura/verguias',
  '002-055': '/asignatura/castone',
  '002-069': '/asignatura/ingreso-notas',

  // Matrícula (menu 003)6
  '003-012': '/matricula/certificados',
  '003-013': '/matricula/homologacion',
  '003-014': '/matricula/prematricula',
  '003-015': '/matricula/habilitar',
  '003-016': '/matricula/rezagados',
  '003-017': '/matricula/aplazados',

  // Notas (menu 004)2
  '004-016': '/notas/ingreso-docente',
  '004-017': '/notas/ingreso-rezagado',

  // Reportes (menu 005)6
  '005-006': '/reportes/estudiantes',
  '005-007': '/reportes/estadisticos',
  '005-008': 'Reportecurricular',//ADAPTADA PARA LA GESTION DE reportes  ruta antigua /reportes/curricular
  '005-011': '/reportes/actas',
  '005-012': 'ReporteDoc',  //ADAPTADA PARA LA GESTION DE reporteS ruta antigua /reportes/docente 
  '005-017': '/reportes/generales',

  // Seg. Egresado (menu 006)3
  '006-001': '/egresados/calculo',
  '006-002': '/egresados/reportes',
  '006-003': '/egresados/seguimiento',

  // Servicios (menu 007)13
  '007-001': '/servicios/primera-matricula',
  '007-002': '/servicios/consulta-egresado',
  '007-003': '/servicios/retiros',
  '007-004': '/servicios/suspensiones',
  '007-005': '/servicios/expulsiones',
  '007-006': '/servicios/reservas',
  '007-007': '/servicios/reanudacion',
  '007-008': '/servicios/cambiar-seccion',
  '007-009': '/servicios/reportes-lote',
  '007-010': '/servicios/becados',
  '007-033': '/servicios/subir-foto',
  '007-066': '/servicios/encuesta-minedu',
  '007-067': '/servicios/fotos',

  // Tutoría (menu 009)6
  '009-001': 'tutoria/obs',      //ADAPTADA PARA tutoria
  '009-002': 'tutoria/ciclo',  // adaptada   ruta antigua:  /tutoria/sesiones-ciclo
  '009-003': 'tutoria/individual',  ///tutoria/sesiones-individuales
  '009-004': 'Reportes', // /tutoria/reportes
  '009-005': 'tutoria/libre',   // /tutoria/sesiones-libres
  '009-006': '/tutoria/derivaciones',
  '009-100': '/tutoria/formatos',
  '009-007': '/tuto/micalendario',
  '009-008': 'Dashboard',


  //-------------------MODULO CARGA NO LECTIVA
  '001-004': 'Declaracion',
  '001-005': 'Horarios',

};
