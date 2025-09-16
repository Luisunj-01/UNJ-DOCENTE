import { useState } from "react";
import BreadcrumbUNJ from "../../cuerpos/BreadcrumbUNJ";
import SemestreSelect from "../reutilizables/componentes/SemestreSelect";
import { useUsuario } from "../../context/UserContext";

function Declaracion(){
  const [semestre, setSemestre] = useState('202501');

  const { usuario } = useUsuario();


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

      
        </div>
      </div>
    </>
  );
}

export default Declaracion;