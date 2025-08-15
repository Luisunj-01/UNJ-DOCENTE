import { useEffect, useState } from "react";
import { obtenerConfiguracion } from "../../reutilizables/logica/docente";
import { Col, Table } from "react-bootstrap";


function Datospersonales({ datos = [] }){
  const [nombretipovia, setNonbretpVia] = useState(null);
  const [nombretipozona, setNonbretpZona] = useState(null);

  //const [nombredpacademco, setNombredpacademco] = useState(null);

  useEffect(() => {
      
      getdatos();
    }, []);

  const getdatos = async () => { 
     const nombretipovia = await obtenerConfiguracion('tipovia', { tpvia: datos.tipovia })
     const nombretipozona = await obtenerConfiguracion('tipozona', { tpzona: datos.tipozona })
     //const nombredpacademco = await obtenerConfiguracion('departamentoacademico', { namedepart: datos.departamentoacademico })
    setNonbretpVia(nombretipovia);
    setNonbretpZona(nombretipozona);
    //setNombredpacademco(nombredpacademco);
  }

    return(
        <div className="row">
          <Col md={9}>
            <div >
              <Table responsive>
                <tbody>

                  <tr>
                    <th>Tipo Documento</th>
                    <td>{datos.tipodocumento === '01' ? 'DNI' : datos.tipodocumento}</td>
                    <th>N° Documento</th>
                    <td>{datos.numerodocumento}</td>
                  </tr>
                  <tr>
                    <th>Estado Civil</th>
                    <td>{datos.estadoc?.descripcion != null ? datos.estadoc.descripcion : 'No disponible'}</td>
                    <th>País</th>
                    <td>{datos.pais === '9589' ? 'PERÚ' : datos.pais}</td>
                  </tr>
                  <tr>
                    <th>Tipo Zona</th>
                    <td>{nombretipozona != null ? nombretipozona : 'No disponible'}</td>
                    <th>Tipo Vía</th>
                    <td>{nombretipovia != null ? nombretipovia : 'No disponible'}</td>
                  </tr>
                  
                  <tr>
                    <th>Fecha Nacimiento</th>
                    <td>{datos.fechanacimiento}</td>
                    <th>Dirección Actual</th>
                    <td>{datos.direccion}</td>
                  </tr>
                  <tr>
                    <th>Email Personal</th>
                    <td>{datos.email || '---'}</td>
                    <th>Email Institucional</th>
                    <td>{datos.email_institucional}</td>
                  </tr>
                  <tr>
                    <th>Telefono</th>
                    <td colSpan={3}>{datos.celular}</td>
                    
                  </tr>
                  <tr>
                    <th>Celular</th>
                    <td>{datos.celular}</td>
                    <th>Sexo</th>
                    <td>{datos.varon === 1 ? 'MASCULINO' : 'FEMENINO'}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Col>
        </div>
    )
}

export default Datospersonales