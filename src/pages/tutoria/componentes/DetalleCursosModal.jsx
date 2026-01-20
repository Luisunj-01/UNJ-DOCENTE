import { Modal, Table, Button } from "react-bootstrap";

function DetalleCursosModal({ show, onHide, alumno }) {
  if (!alumno) return null;

  const totalCreditos = alumno.cursos.reduce(
    (sum, c) => sum + c.nrocreditos,
    0
  );

  const totalPonderado = alumno.cursos.reduce(
    (sum, c) => sum + c.nrocreditos * c.promedio,
    0
  );

  const ponderado = (totalPonderado / totalCreditos).toFixed(2);

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Detalle de Cursos</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-1"><strong>Alumno:</strong> {alumno.nombrecompleto}</p>
        <p><strong>Semestre:</strong> {alumno.semestre}</p>

        <Table bordered size="sm" className="text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Curso</th>
              <th>Créditos</th>
              <th>Nota</th>
              <th>Nota × Créditos</th>
            </tr>
          </thead>
          <tbody>
            {alumno.cursos.map((c, i) => (
              <tr key={i}>
                <td className="text-start">{c.nombre}</td>
                <td>{c.nrocreditos}</td>
                <td
                className={
                    Number(c.promedio) < 11
                    ? "text-danger fw-bold"
                    : "text-primary fw-bold"
                }
                >
                {c.promedio}
                </td>

                <td>{c.nrocreditos * c.promedio}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <hr />

        <p className="mb-1">
          <strong>Total créditos:</strong> {totalCreditos}
        </p>
        <p className="mb-1">
          <strong>Suma (nota × créditos):</strong> {totalPonderado}
        </p>
        <p className="fs-6">
  <strong>Ponderado Semestral:</strong>{" "}
  <span
    className={`fw-bold ${
      Number(ponderado) < 11 ? "text-danger" : "text-primary"
    }`}
  >
    {ponderado}
  </span>

  {Number(ponderado) < 11 ? (
    <span className="text-danger fw-bold ms-2">(Desaprobado)</span>
  ) : (
    <span className="text-primary fw-bold ms-2">(Aprobado)</span>
  )}
</p>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DetalleCursosModal;
