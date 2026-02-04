// src/cuerpos/UserInfoBox.js
import React, { useEffect, useState } from 'react';
import { useUsuario } from '../context/UserContext';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { obtenerdatdocente } from '../pages/cursos/logica/Curso';

function AvatarIniciales({ nombre }) {
  const iniciales = nombre
    ?.split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: '#085a9b',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: 14
      }}
    >
      {iniciales || 'U'}
    </div>
  );
}

function UserInfoBox({ abrirModal }) {
  const { usuario } = useUsuario();
  const [datos, setDatos] = useState(null);

  const token = usuario?.token;

  const persona = usuario?.docente?.persona;
  const docente = usuario?.docente?.docente;
  const nivel = '1';
  const tipo = 'D';
  const accion = 'C';

  const nombre = `${usuario?.docente?.primernombre ?? ''} ${usuario?.docente?.apellidopaterno ?? ''}`.trim();
  const escuela = usuario?.datosdocente?.escuela ?? 'Escuela no definida';

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
      const datosDocente = Array.isArray(datosDocenteArray)
        ? datosDocenteArray[0]
        : null;

      setDatos(datosDocente);
    }

    cargarDatosCompletos();
  }, [persona, docente, token]);

  // 🔴 ESTO ES LO QUE TE FALTABA
  return (
    <div className="d-flex align-items-center justify-content-end gap-2 me-2">

      {/* Nombre y escuela */}
      <div className="d-flex flex-column text-end">
        <span
          style={{
            color: '#252526',
            fontWeight: 700,
            fontSize: '12px',
            lineHeight: 1.2
          }}
        >
          {nombre || 'Docente'}
        </span>

        <span
          style={{
            color: '#9ea1a2',
            fontSize: '10px',
            lineHeight: 1.2
          }}
        >
          {escuela}
        </span>
      </div>

      {/* Avatar + menú */}
      <Dropdown align="end">
        <Dropdown.Toggle
          as="div"
          style={{ cursor: 'pointer' }}
        >
          <AvatarIniciales nombre={nombre} />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/datos">
            Mi Perfil
          </Dropdown.Item>
          <Dropdown.Item onClick={() => window.location.reload()}>
            Recargar
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={abrirModal}>
            Cerrar sesión
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to="/cambiar-contrasena">
            Cambiar contraseña
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default UserInfoBox;
