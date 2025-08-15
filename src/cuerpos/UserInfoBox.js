import React, { useEffect, useState } from 'react';
import { useUsuario } from '../context/UserContext';
import { Navbar, Container, Button, Image, Dropdown, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { obtenerdatdocente } from '../pages/cursos/logica/Curso';
function UserInfoBox({abrirModal}) {
  const { usuario } = useUsuario();
  const [datos, setDatos] = useState(null);
  //console.log(usuario);
  

  const token = usuario?.codigotokenautenticadorunj;

  //console.log(usuario?.docente.persona);
  //console.log(token);
  const persona = usuario?.docente.persona;
  const docente = usuario?.docente.docente;
  const nivel = '1';
  const tipo = 'D';
  const accion = 'C';

  const nombre = `${usuario.docente.primernombre} ${usuario.docente.apellidopaterno}`;
  const escuela = usuario.docente.escuela || 'Escuela no definida';

  useEffect(() => {
     async function cargarDatosCompletos() {
       const { datos: datosDocenteArray, mensaje: mensajeDocente } = await obtenerdatdocente(
            persona,
            docente,
            nivel,
            tipo,
            accion,
            token
          );
          const datosDocente = Array.isArray(datosDocenteArray) ? datosDocenteArray[0] : null;


          setDatos(datosDocente);
     }
     cargarDatosCompletos();
  });
  return (
    <div className="d-flex flex-row-reverse align-items-center me-1">
      {/* Imagen a la derecha */}
      <Dropdown align="end">
        <Dropdown.Toggle as="div" id="dropdown-custom-components" style={{ cursor: 'pointer' }}>
          <Image
            src={
              usuario?.picture
                ? usuario.picture
                : datos?.numerodocumento
                  ? `https://pruebas.unj.edu.pe/zetunajaen/imagesdocente/${datos.numerodocumento}.jpg`
                  : 'image/animoji-1.png'
            }
            alt="Usuario"
            style={{ background: '#085a9b' }}
            roundedCircle
            height="40"
            width="40"
            className="ms-2"
          />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          
          <Dropdown.Item as={Link} to="/datos">Mi Perfil</Dropdown.Item>
          <Dropdown.Item onClick={() => window.location.reload()}>Recargar</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={abrirModal}>Cerrar sesión</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>



      {/* Nombre y escuela a la izquierda */}
      <div className="d-flex flex-column text-end">
        <span style={{ color: '#252526', fontWeight: '900', fontSize: '12px' }}>
          {nombre}
        </span>
        <span style={{ color: '#9ea1a2', fontSize: '10px' }}>
          {escuela}
        </span>
      </div>
    </div> 
  );
}

export default UserInfoBox;
