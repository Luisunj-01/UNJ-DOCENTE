import { useState, useEffect } from 'react';
import { obtenerConfiguracion } from '../../reutilizables/logica/docente';
import { Col, Table } from 'react-bootstrap';

function Datosacademicos({ datos = [] }) {
     const [imagenPreview, setImagenPreview] = useState(null);
     const [imagenUrl, setImagenUrl] = useState('');
     const [nombrecategoria, setNombrecategoria] = useState(null);
     const [nombredpacademco, setNombredpacademco] = useState(null);
  // Cargar imagen al montar o al cambiar docente
  useEffect(() => {
    if (datos.docente) {
      const timestamp = Date.now();
      setImagenUrl(`https://pydrsu.unj.edu.pe/resourcedocente/${datos.docente}.jpg?${timestamp}`);
    }
    getdatos();
  }, [datos.docente]);

  const handleImagenChange = async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;

  const formData = new FormData();
  formData.append('foto', archivo);
  formData.append('codigo', datos.docente); // o el código que desees

  try {
    const response = await fetch('https://pydrsu.unj.edu.pe/recibirfotodocente.php', {
      method: 'POST',
      body: formData,
    });

    console.log(response);
    const data = await response.json();

    if (response.ok) {
      alert('Imagen subida con éxito');
      window.location.reload();
    } else {
      alert('Error al subir imagen: ' + data.error);
    }
  } catch (error) {
   // console.error('Error en la subida', error);
    //alert('Error en la conexión al subir la imagen');
  }
};

const getdatos = async () => { 
   const nombrecategoria = await obtenerConfiguracion('categoriadocente', { categoria: datos.categoria })
   const nombredpacademco = await obtenerConfiguracion('departamentoacademico', { namedepart: datos.departamentoacademico })
  setNombrecategoria(nombrecategoria);
  setNombredpacademco(nombredpacademco);
}


  return (
    <div className="row">
      <Col md={9}>
        <div >
          <Table responsive>
            <tbody>
              <tr><th>Código</th><td>{datos.docente}</td></tr>
              <tr><th>A. Paterno</th><td>{datos.apellidopaterno}</td></tr>
              <tr><th>A. Materno</th><td>{datos.apellidomaterno}</td></tr>
              <tr><th>Primer Nombre</th><td>{datos.primernombre}</td></tr>
              <tr><th>Segundo Nombre</th><td>{datos.segundonombre}</td></tr>
              <tr>
                <th>Categoria</th>
                <td>{nombrecategoria != null ? nombrecategoria : 'No disponible'}</td>
              </tr>
              <tr><th>Condicion</th><td>ORDINARIO</td></tr>
              <tr><th>Dedicación</th><td>{datos.dedicacion === '02' ? 'TIEMPO COMPLETO' : datos.dedicacion}</td></tr>
              <tr><th>Dpto. Académico</th><td>{nombredpacademco != null ? nombredpacademco : 'No disponible'}</td></tr>
              <tr><th>Grado</th><td>{datos.grado === '02' ? 'MAGISTER' : datos.grado}</td></tr>
            </tbody>
          </Table>
      </div>
    </Col>
      <div className="col-md-3 text-center mb-3">
        <img
          src={imagenPreview || imagenUrl}
          alt="Foto del Docente"
          className="img-thumbnail"
          style={{ width: '150px', height: '180px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = `https://pruebas.unj.edu.pe/zetunajaen/imagesdocente/${datos.numerodocumento }.jpg`;
          }}
        />
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            className="form-control"
          />
        </div>
      </div>
    </div>
  );
}

export default Datosacademicos;
