import { Table } from "react-bootstrap";

function TablaCursoSub({
  datos,
  columnasEncabezado = [],
  columnas = [],
  notaminima,
  modo = 'default'   // default | acta-nota | ficha
}) {
  const notaMin = Number(notaminima);
  if (!Array.isArray(datos) || datos.length === 0) return null;

  return (
    <div className={modo === 'default' ? 'table-responsive' : ''}>

      <Table
        as="table"
        className={`
          table table-bordered table-sm align-middle
          ${modo === 'acta-nota' ? 'tabla-acta-nota' : ''}
          ${modo === 'ficha' ? 'tabla-acta' : ''}
        `}
      >

        {/* =====================================================
           COLGROUP SOLO PARA ACTA DE NOTAS
        ===================================================== */}
        {modo === 'acta-nota' && (
          <colgroup>
            <col style={{ width: '2.5%' }} />   {/* No */}
            <col style={{ width: '6%' }} />     {/* Código */}
            <col style={{ width: '18%' }} />    {/* Apellidos */}

            <col span={4} style={{ width: '4.5%' }} />
            <col span={4} style={{ width: '4.5%' }} />
            <col span={4} style={{ width: '4.5%' }} />

            <col style={{ width: '3%' }} />     {/* NF */}
            <col style={{ width: '3%' }} />     {/* SUS */}
            <col style={{ width: '3%' }} />     {/* APLA */}
            <col style={{ width: '5%' }} />     {/* PF */}
          </colgroup>
        )}

        {/* =====================================================
           COLGROUP SOLO PARA FICHA DE SEGUIMIENTO
        ===================================================== */}
        {modo === 'ficha' && (
          <colgroup>
            <col style={{ width: '35px' }} />    {/* No */}
            <col style={{ width: '90px' }} />    {/* Código */}
            <col style={{ width: '190px' }} />   {/* Nombre */}
            <col style={{ width: '95px' }} />    {/* Teléfono */}
            <col style={{ width: '240px' }} />   {/* Email */}

            {/* columnas SI / NO (angostas) */}
            <col style={{ width: '60px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '60px' }} />

            {/* Fecha */}
            <col style={{ width: '90px' }} />

            {/* Tema */}
            <col style={{ width: '160px' }} />

            {/* Observación (ocupa lo restante) */}
            <col />
          </colgroup>
        )}

        {/* ===================== THEAD ===================== */}
        <thead>
          {columnasEncabezado.map((fila, rowIndex) => (
            <tr key={rowIndex}>
              {fila.map((col, colIndex) => (
                <th
                  key={colIndex}
                  colSpan={col.colSpan || 1}
                  rowSpan={col.rowSpan || 1}
                >
                  {col.titulo}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* ===================== TBODY ===================== */}
        <tbody>
          {datos.map((fila, index) => (
            <tr key={index}>
              {/* Columna No */}
              <td>{index + 1}</td>

              {columnas.map((col, i) => {
                const raw = col.render
                  ? col.render(fila)
                  : fila[col.clave] ?? '';

                const valorNumerico = col.esNota ? Number(raw) : null;

                const claseNota = col.clase
                  ? col.clase(Number(valorNumerico))
                  : '';

                const estilo = {
                  textDecoration: col.subrayar ? 'underline' : undefined,
                };

                const contenidoMostrar =
                  col.esNota && !isNaN(valorNumerico)
                    ? (valorNumerico % 1 === 0
                        ? parseInt(valorNumerico)
                        : valorNumerico.toFixed(2))
                    : raw;

                const usarStrong = col.esNota || col.negrita;

                return (
                  <td
                    key={i}
                    className={claseNota}
                    style={estilo}
                  >
                    {usarStrong ? <strong>{contenidoMostrar}</strong> : contenidoMostrar}
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
