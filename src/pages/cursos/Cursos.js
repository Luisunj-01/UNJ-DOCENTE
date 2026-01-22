import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import { useUsuario } from '../../context/UserContext';
import { useSemestreActual } from '../../hooks/useSemestreActual';
import { useTheme } from '../../context/ThemeContext';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import ListCursos from './componentes/ListCursos';
import { CardSkeleton } from '../reutilizables/componentes/TablaSkeleton';

const colores = [
  ['#1FA2FF', '#12D8FA'],
  ['#FF512F', '#DD2476'],
  ['#654ea3', '#eaafc8'],
  ['#FF5F6D', '#FFC371'],
  ['#43C6AC', '#F8FFAE'],
  ['#00c6ff', '#0072ff']
];

function Cursos() {
  const { semestre: semestreActual } = useSemestreActual('01');
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeApi, setMensajeApi] = useState('');
  const [semestre, setSemestre] = useState('');

  const { usuario } = useUsuario();
  const { darkMode } = useTheme();

  // Cargar semestre actual de la BD
  useEffect(() => {
    if (semestreActual) {
      setSemestre(semestreActual);
    }
  }, [semestreActual]);

  // Callback cuando SemestreSelect carga los semestres disponibles
  const handleSemestresLoaded = (primerSemestre) => {
    if (primerSemestre && !semestre) {
      setSemestre(primerSemestre);
      console.log('✅ Cursos - Semestre inicializado con:', primerSemestre);
    }
  };

  const logo = darkMode
    ? '/image/logo/logo-unj-blanco.svg'
    : '/image/logo/logo-unj-v1.svg';

  //const token = usuario?.codigotokenautenticadorunj;
  
  const token = usuario?.codigotokenautenticadorunj;
  const codigo = usuario?.docente.usuario;
  const escuela = usuario?.docente.estructura;
  const nivel = usuario?.docente.curricula;


  //console.log(usuario);
  const persona = usuario?.docente.persona;
  
  const dni = usuario?.docente.numerodocumento;
  const tipo = 'D';


  const nombredocente = usuario.docente.nombrecompleto;
  useEffect(() => {
    async function cargarCursos() {
      setLoading(true);
      const { datos: cursos, mensaje } = await obtenerCursosPrematricula(semestre, persona, dni, tipo, token);
      
      setCursos(cursos);
      setMensajeApi(mensaje);
      setLoading(false);
    }
    cargarCursos();
  }, [semestre]);

  //console.log(cursos);
  return (
    <>
      <BreadcrumbUNJ />

      <div className="container mt-4">
        <div className="containerunj">
          <form className="mb-3">
            <div className="row">
              <div className="col-md-1">
                <label className="form-label"><strong>Semestre:</strong></label>
              </div>
              <div className="col-md-3">
                <SemestreSelect 
  value={semestre} 
  onChange={(e) => setSemestre(e.target.value)} 
  name="cboSemestre"
  onSemestresLoaded={handleSemestresLoaded}
/>
              </div>
            </div>
          </form>

          {loading ? (
            <CardSkeleton cards={6} />
          ) : cursos.length === 0 ? (
            <div className="alert alert-warning text-center mt-4">{mensajeApi}</div>
          ) : (
            <ListCursos
                cursos={cursos}
                
                
                nombredocente={nombredocente}
                />
          )}
        </div>
      </div>
    </>
  );
}

export default Cursos;
