import { useEffect, useState } from 'react';
import { obtenerCursosPrematricula } from '../reutilizables/logica/docente';
import { useUsuario } from '../../context/UserContext';
import { useSemestreActual } from '../../hooks/useSemestreActual';
import { useTheme } from '../../context/ThemeContext';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import SemestreSelect from '../reutilizables/componentes/SemestreSelect';
import ListCursos from './componentes/ListCursos';
import { CardSkeleton } from '../reutilizables/componentes/TablaSkeleton';

function Cursos() {
  // 🔑 ÚNICA fuente del semestre
  const { semestre: semestreBackend, loading: loadingSemestre } = useSemestreActual('01');
const [semestreSeleccionado, setSemestreSeleccionado] = useState('');


  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensajeApi, setMensajeApi] = useState('');

  const { usuario } = useUsuario();
  const { darkMode } = useTheme();

  const persona = usuario?.docente.persona;
  const dni = usuario?.docente.numerodocumento;
  const tipo = 'D';
  const nombredocente = usuario?.docente.nombrecompleto;

  useEffect(() => {
  if (semestreBackend && !semestreSeleccionado) {
    setSemestreSeleccionado(semestreBackend);
  }
}, [semestreBackend]);


  // 🛑 ESPERA al semestre antes de llamar API
  useEffect(() => {
     if (!semestreSeleccionado) return;

    const cargarCursos = async () => {
      setLoading(true);

      const { datos, mensaje } =
        await obtenerCursosPrematricula(semestreSeleccionado, persona, dni, tipo);

      setCursos(datos);
      setMensajeApi(mensaje);
      setLoading(false);
    };

    cargarCursos();
  }, [semestreSeleccionado, persona, dni]);

  // ⏳ Mientras carga semestre
  if (loadingSemestre) {
    return <CardSkeleton cards={6} />;
  }

  return (
  <>
    <BreadcrumbUNJ />

    <div className="container mt-4">
      <div className="containerunj">
        <form className="mb-3">
          <div className="row">
            <div className="col-md-1">
              <label className="form-label">
                <strong>Semestre:</strong>
              </label>
            </div>
            <div className="col-md-3">
              <SemestreSelect
            name="cboSemestre"
            value={semestreSeleccionado}
            onChange={(e) => setSemestreSeleccionado(e.target.value)}
            />

            </div>
          </div>
        </form>

        {loading ? (
          <CardSkeleton cards={6} />
        ) : cursos.length === 0 ? (
          <div className="alert alert-warning text-center mt-4">
            {mensajeApi}
          </div>
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
