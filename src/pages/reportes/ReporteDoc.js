import { useState, useEffect } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { TablaSkeleton } from "../reutilizables/componentes/TablaSkeleton";
import PanelBotones from "../cursos/componentes/PanelBotones";
import { useUsuario } from "../../context/UserContext";
import { useSemestreActual } from "../../hooks/useSemestreActual";

function ReporteDoc(){
  const { usuario } = useUsuario();
  const { semestre: semestreActual } = useSemestreActual('01');
  const [semestre, setSemestre] = useState('');

  const dniusuario = usuario.docente.usuario;
  const persona = usuario.docente.persona;
  const sede = '01';

  // Actualizar el semestre cuando se carga desde la BD
  useEffect(() => {
    if (semestreActual) {
      setSemestre(semestreActual);
    }
  }, [semestreActual]);

  // Callback cuando SemestreSelect carga los semestres disponibles
  const handleSemestresLoaded = (primerSemestre) => {
    if (primerSemestre && !semestre) {
      setSemestre(primerSemestre);
      console.log('✅ ReporteDoc - Semestre inicializado con:', primerSemestre);
    }
  };

  return (
    <>
      <BreadcrumbUNJ />

      <div className="container mt-4">
        <div className='containerunj mt-3'>
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

          {/* Siempre se pasa el semestre actualizado a PanelBotones */}
          <PanelBotones 
            dniusuario={dniusuario}
            persona={persona}
            semestre={semestre}
            sede={sede}
          />
        </div>
      </div>
    </>
  );
}

export default ReporteDoc;
