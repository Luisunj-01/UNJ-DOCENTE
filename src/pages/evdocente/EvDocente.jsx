import { useUsuario } from '../../context/UserContext';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';
import logoUNJ from "../../assets/images/unj-logo-ho.svg";

function EvDocente() {
  const { usuario } = useUsuario();

  return (
    <>
      <BreadcrumbUNJ />

      <div className="container mt-5">
        
      </div>
    </>
  );
}

export default EvDocente;
