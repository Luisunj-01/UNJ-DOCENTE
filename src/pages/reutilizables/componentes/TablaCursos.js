import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";

const TablaCursos = ({
  columnas,
  datos,
  usarDataTable = true,
  paginacion = true,
  mostrarBuscador = true,
  colorFondoEncabezado = "", // <- opcional
  colorTextoEncabezado = "", // <- opcional
}) => {
  const [busqueda, setBusqueda] = useState("");

  const datosConContador = useMemo(() => {
    return datos.map((item, index) => ({
      ...item,
      contador: index + 1,
    }));
  }, [datos]);

  const columnasConvertidas = useMemo(() => {
    const columnasConContador = [
      { clave: "contador", titulo: "N°", ancho: "60px" },
      ...columnas,
    ];

    return columnasConContador.map((col) => ({
      name: col.titulo,
      selector: (row) => row[col.clave],
      cell: (row) => (col.render ? col.render(row) : row[col.clave]),
      sortable: col.clave !== "contador",
      width: col.ancho || "auto",
      center: true,
    }));
  }, [columnas]);

  const datosFiltrados = useMemo(() => {
    if (!mostrarBuscador || !busqueda.trim()) return datosConContador;

    return datosConContador.filter((item) =>
      columnas.some((columna) => {
        const valor = item[columna.clave];
        return (
          valor &&
          valor.toString().toLowerCase().includes(busqueda.toLowerCase())
        );
      })
    );
  }, [busqueda, datosConContador, columnas, mostrarBuscador]);

  const customStyles = {
    table: {
      style: {
        border: "1px solid #0000002d",
      },
    },
    headCells: {
      style: {
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: colorFondoEncabezado || undefined,
        color: colorTextoEncabezado || undefined,
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        justifyContent: "center",
        textAlign: "center",
      },
    },
  };

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <div>
      {mostrarBuscador && (
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      )}

      {usarDataTable ? (
        <DataTable
          columns={columnasConvertidas}
          data={datosFiltrados}
          customStyles={customStyles}
          pagination={paginacion}
          paginationComponentOptions={paginationComponentOptions}
          noDataComponent={<span>No hay información por mostrar</span>}
          persistTableHead
          responsive
        />
      ) : (
        <table className="table table-hover">
          <thead
            style={{
              backgroundColor: colorFondoEncabezado || undefined,
              color: colorTextoEncabezado || undefined,
            }}
          >
            <tr >
              <th style={{ width: "60px" }}>N°</th>
              {columnas.map((columna, idx) => (
                <th key={idx} style={{ width: columna.ancho || "auto" }}>
                  {columna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((fila, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                {columnas.map((columna, i) => (
                  <td key={i}>
                    {columna.render ? columna.render(fila) : fila[columna.clave]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TablaCursos;




