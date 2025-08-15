import "bootstrap-icons/font/bootstrap-icons.css";
import '../../resource/apps.css';
import { Row, Col, Container, Image, Card, CloseButton } from "react-bootstrap";


const Apps = () => {
  const shortcuts = [
    { nombre: "GESTION ACADEMICA", icono: "01.png" },
    { nombre: "GESTION GRADOS Y TITULOS", icono: "04.png" },
    { nombre: "EVALUACION DOCENTE", icono: "05.png" },
    { nombre: "GESTIÓN BIBLIOTECA", icono: "06.png" },
    { nombre: "ESCALAFON DOCENTE", icono: "07.png" },
    { nombre: "PAGOS VIRTUALES", icono: "08.png" },
    { nombre: "GESTION DE LA CALIDAD", icono: "09.png" },
    { nombre: "CENTRO PRE", icono: "10.png" },
    { nombre: "ACTIVIDADES NO LECTIVAS", icono: "66.png" },
    { nombre: "DOCUMENTOS NORMATIVOS", icono: "67.png" },
  ];

  return (
    <>
      <Container
        fluid
        className="cont-app position-relative min-vh-100"
        style={{
         
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Botón X arriba a la derecha */}
        <div
          className="position-absolute end-0 p-4"
          style={{ zIndex: 10, top:"15px" , marginRight:"20px" }}
        >
          <CloseButton
            style={{
              filter: "invert(1)",
              opacity: 1,
            }}
            onClick={() => window.history.back()}
          />
        </div>

        {/* Contenido centrado */}
        <div className="d-flex justify-content-center align-items-center vh-100">
          <Container>
            <Row className="justify-content-center">
              {shortcuts.map((op, i) => (
                <Col key={i} xs={6} sm={4} md={3}>
                  <Card
                    className="btn btn-light border-0 p-4 m-4"
                    style={{ height: "120px" }}
                  >
                    <div className="menu-icon">
                      <Image
                        className="mx-auto"
                        style={{ width: "48px" }}
                        src={`image/apps/${op.icono}`}
                        rounded
                      />
                    </div>
                    <div className="menu-text">{op.nombre}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </Container>
    </>
  );
};

export default Apps;
