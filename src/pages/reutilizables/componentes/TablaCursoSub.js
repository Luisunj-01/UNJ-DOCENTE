import { Table } from "react-bootstrap";

function TablaCursoSub({ datos, columnasEncabezado = [], columnas = [], notaminima }) {
  const notaMin = Number(notaminima);
  if (!Array.isArray(datos) || datos.length === 0) return null;

  return (
    <div className="table-responsive">
      <Table responsive className="table table-bordered table-sm text-center align-middle">
        <thead>
          {columnasEncabezado.map((fila, rowIndex) => (
            <tr key={rowIndex}>
              {fila.map((col, colIndex) => (
                <th 
                  key={colIndex}
                  colSpan={col.colSpan || 1}
                  rowSpan={col.rowSpan || 1}
                  className={`tablacursub ${col.className || ''}`.trim()}
                >
                  {col.titulo}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {datos.map((fila, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              {columnas.map((col, i) => {
                const raw = col.render ? col.render(fila) : fila[col.clave] ?? '';
                const valorNumerico = col.esNota ? Number(raw) : null;

              const claseNota = col.clase
                ? col.clase(Number(valorNumerico))
                : '';

              const estilo = {
                textDecoration: col.subrayar ? 'underline' : undefined,
              };



                // Mostrar: redondeado si es nota, sino tal como viene
                const contenidoMostrar = col.esNota && !isNaN(valorNumerico)
                  ? (valorNumerico % 1 === 0 ? parseInt(valorNumerico) : valorNumerico.toFixed(2))
                  : raw;

                const usarStrong = col.esNota || col.negrita;

                // 👇 Aquí agrego integración con tus clases CSS personalizadas
                const extraClass = col.estilo ? `col-${col.estilo}` : '';

              return (
  <td
    key={i}
    className={`
      ${col.className || ''}
      ${extraClass}
      ${claseNota}
    `.trim()}
    style={estilo}
  >
    {usarStrong ? (
      <strong>{contenidoMostrar}</strong>
    ) : (
      contenidoMostrar
    )}
  </td>
);

              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TablaCursoSub;
