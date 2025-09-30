import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFileCsv, FaFilePdf } from "react-icons/fa";

const TablaCursoParticipante = ({
  tituloArchivo,
  columnas,
  datos,
  usarDataTable = true,
  paginacion = true,
  mostrarBuscador = true,
  colorFondoEncabezado = "",
  colorTextoEncabezado = "",
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
      width: col.ancho || "200px",
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

  // 📌 Exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      datosFiltrados.map((item) => {
        let fila = {};
        columnas.forEach((col) => {
          fila[col.titulo] = col.exportar
            ? col.exportar(item)
            : item[col.clave];
        });
        return fila;
      })
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${tituloArchivo}.xlsx`);
  };

  // 📌 Exportar a CSV
  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      datosFiltrados.map((item) => {
        let fila = {};
        columnas.forEach((col) => {
          fila[col.titulo] = col.exportar ? col.exportar(item) : item[col.clave];
        });
        return fila;
      })
    );
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tituloArchivo}.csv`;
    link.click();
  };

  // 📌 Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = columnas.map((col) => col.titulo);
    const tableRows = datosFiltrados.map((item) =>
      columnas.map((col) =>
        col.exportar ? col.exportar(item) : item[col.clave]
      )
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save(`${tituloArchivo}.pdf`);
  };

  const customStyles = {
  table: {
    style: {
      width: "100%",   // Ocupa todo el ancho
    },
  },
  headRow: {
    style: {
      backgroundColor: colorFondoEncabezado || "#f8f9fa",
    },
  },
  headCells: {
    style: {
      justifyContent: "center",
      textAlign: "center",
      fontWeight: "bold",
      backgroundColor: colorFondoEncabezado || undefined,
      color: colorTextoEncabezado || undefined,
    },
  },
  cells: {
    style: {
      justifyContent: "center",
      textAlign: "center",
    },
  },
  rows: {
    style: {
      textAlign: "center",
    },
  },
};


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {mostrarBuscador && (
          <input
            type="text"
            className="form-control w-50"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        )}
        <div>
          <button
            className="btn btn-success btn-sm me-2"
            onClick={exportToExcel}
            title="Exportar a Excel"
          >
            <FaFileExcel size={18} />
          </button>
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={exportToCSV}
            title="Exportar a CSV"
          >
            <FaFileCsv size={18} />
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={exportToPDF}
            title="Exportar a PDF"
          >
            <FaFilePdf size={18} />
          </button>
        </div>
      </div>

      {usarDataTable ? (
        <DataTable
          columns={columnasConvertidas}
          data={datosFiltrados}
          customStyles={customStyles}
          pagination={paginacion}
          paginationPerPage={10} // 👉 por defecto 10
          paginationRowsPerPageOptions={[10, 20, 50, datosFiltrados.length]} // 👉 incluye "Todos"
          noDataComponent={<span>No hay información por mostrar</span>}
          persistTableHead
          responsive
        />
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
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

export default TablaCursoParticipante;
