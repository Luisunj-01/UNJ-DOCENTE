// src/pages/Inicio.js
import { useUsuario } from '../../context/UserContext';
import BreadcrumbUNJ from '../../cuerpos/BreadcrumbUNJ';


function Inicio() {
  const { usuario } = useUsuario();

  console.log(usuario);
    return (
      <>

        <BreadcrumbUNJ />
        
        <div className="container mt-4">
          <div className='containerunj'>
            <h2 className='titlebienvenida'>Bienvenido al Portal del Docente {usuario.name}</h2>
            <p>Desde aquí podrás acceder a tus datos académicos, Asignatura, Notas, Reporte, y más.</p>
            <hr />
            <p>Selecciona una opción en el menú para comenzar.</p>
            <img style={{ width: '35%' }} src="https://sigad.unj.edu.pe/image/unj-logo-ho-1-1.svg"></img>
            
          </div>
        </div>
        
      
      </>
      
    );
  }
  
  export default Inicio;
  
  