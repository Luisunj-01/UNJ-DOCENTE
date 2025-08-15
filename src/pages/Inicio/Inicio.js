// src/pages/Inicio.js
import { useUsuario } from '../../context/UserContext';

function Inicio() {
  const { usuario } = useUsuario();

    return (
      <div>
        <h2>Bienvenido al Portal del Docente {usuario.name}</h2>
        <p>Desde aquí podrás acceder a tus datos académicos, Asignatura, Notas, Reporte, y más.</p>
        <hr />
        <p>Selecciona una opción en el menú para comenzar.</p>
        <img style={{ width: '35%' }} src="https://pruebas.unj.edu.pe/zetunajaen/images/logounjaen.png"></img>
        
      </div>
    );
  }
  
  export default Inicio;
  