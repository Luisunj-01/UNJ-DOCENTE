//src/cuerpos/UserInfoBox.js
import React, { useEffect, useState } from 'react';
import { useUsuario } from '../context/UserContext';
import { Image, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { obtenerdatdocente } from '../pages/cursos/logica/Curso';

function UserInfoBox({ abrirModal }) {
  const { usuario } = useUsuario();
  const [datos, setDatos] = useState(null);

  // Ahora usamos el token Sanctum
  const token = usuario?.token;

  const persona = usuario?.docente?.persona;
  const docente = usuario?.docente?.docente;
  const nivel = '1';
  const tipo = 'D';
  const accion = 'C';

  // Muestra el nombre y escuela correctamente
  const nombre = `${usuario?.docente?.primernombre ?? ''} ${usuario?.docente?.apellidopaterno ?? ''}`.trim();
const escuela = usuario?.escuela ?? 'Escuela no definida';

  useEffect(() => {
    if (!persona || !docente || !token) return;

    async function cargarDatosCompletos() {
      const { datos: datosDocenteArray } = await obtenerdatdocente(
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
  }, [persona, docente, token]);

  return (
    <div className="d-flex flex-row-reverse align-items-center me-1">
      {/* Imagen del usuario */}
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

      {/* Nombre y escuela */}
      <div className="d-flex flex-column text-end">
        <span style={{ color: '#252526', fontWeight: '900', fontSize: '12px' }}>
          {nombre || usuario?.name}
        </span>
        <span style={{ color: '#9ea1a2', fontSize: '10px' }}>
          {escuela}
        </span>
      </div>
    </div>
  );
}

export default UserInfoBox;
