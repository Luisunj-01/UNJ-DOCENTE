import { useState } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { TablaSkeleton } from "../reutilizables/componentes/TablaSkeleton";
import PanelBotones from "../cursos/componentes/PanelBotones";
import { useUsuario } from "../../context/UserContext";

function ReporteDoc(){
  const [semestre, setSemestre] = useState('202501');

  const { usuario } = useUsuario();
  const dniusuario = usuario.docente.usuario;
  const persona = usuario.docente.persona;
  const sede = '01';

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
