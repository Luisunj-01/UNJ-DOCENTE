import { Modal, Table, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Importa correctamente

import { useState } from "react";
import DetalleCursosModal from "./DetalleCursosModal";


function ReporteRendimientoModal({ show, onHide, semestre, tutor, alumnos }) {
  // ✅ Logo institucional (puedes cambiar la URL si usas otro)
  const logoUrl = "https://unj.edu.pe/wp-content/uploads/2022/06/logo-unj.png";

    const [showDetalle, setShowDetalle] = useState(false);
    const [alumnoDetalle, setAlumnoDetalle] = useState(null);

    const abrirDetalle = (alumno) => {
      setAlumnoDetalle(alumno);
      setShowDetalle(true);
    };


  const handleExportPDF = async () => {
  const doc = new jsPDF("p", "pt", "a4");

  const svgUrl = `${window.location.origin}/image/logo/logo-unj-v1.svg`;
  const svgText = await fetch(svgUrl).then((r) => r.text());

  // ✅ convierte SVG → PNG usando un canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const svgUrlBlob = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.src = svgUrlBlob;

  img.onload = function () {
    // convertir a PNG base64
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const pngData = canvas.toDataURL("image/png");

    // ahora sí se puede usar addImage ✅
    doc.addImage(pngData, "PNG", 40, 25, 70, 70);

    doc.setFontSize(14);
    doc.text("UNIVERSIDAD NACIONAL DE JAÉN", 150, 55);
    doc.setFontSize(12);
    doc.text("MATRIZ DE RENDIMIENTO ACADÉMICO", 150, 75);
    doc.setLineWidth(0.5);
    doc.line(40, 95, 550, 95);


    // 📋 Datos informativos
    doc.setFontSize(10);
    doc.text(`Semestre: ${semestre}`, 40, 115);
    doc.text(`Tutor: ${tutor}`, 40, 130);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, 40, 145);

    // 🧾 Tabla con los datos
    autoTable(doc, {
      startY: 160,
      head: [["N°", "Apellidos y Nombres", "Ponderado Semestral", "Comentario", "Recomendación"]],
      body: alumnos.map((a, i) => [
        i + 1,
        a.nombrecompleto,
        a.ponderado_semestre || "-",
        a.comentario || "",
        a.recomendacion || "",
      ]),
      styles: { fontSize: 8, cellPadding: 3, halign: "center" },
      headStyles: { fillColor: [40, 167, 69] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 150, halign: "left" },
        2: { cellWidth: 80 },
        3: { cellWidth: 130, halign: "left" },
        4: { cellWidth: 130, halign: "left" },
      },
    });

    // 🧩 Pie de documento
    const pageHeight = doc.internal.pageSize.height;
doc.setFontSize(8);
doc.text(
  `Generado automáticamente por el  Docente - ${tutor} - ${new Date().toLocaleString("es-PE")}`,
  40,
  pageHeight - 20
);



    // 📥 Descargar PDF
    doc.save(`ReporteRendimiento_${semestre}.pdf`);
  };

  img.onerror = function () {
    alert("⚠️ No se pudo cargar el logo SVG. Verifica la ruta o el nombre del archivo.");
  };
};



  return (
  <>
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>Matriz de Rendimiento Académico</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div>
            <p><strong>Semestre:</strong> {semestre}</p>
            <p><strong>Tutor:</strong> {tutor}</p>
          </div>

          <Button variant="outline-danger" size="sm" onClick={handleExportPDF}>
            📄 Exportar PDF
          </Button>
        </div>

        <Table bordered hover size="sm" className="text-center align-middle">
          <thead className="table-success">
            <tr>
              <th style={{ width: "50px" }}>N°</th>
              <th>Apellidos y Nombres</th>
              <th style={{ width: "120px" }}>Ponderado Semestral</th>
              <th>Comentario</th>
              <th>Recomendación</th>
            </tr>
          </thead>
          <tbody>
            {alumnos?.length > 0 ? (
              alumnos.map((a, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="text-start">{a.nombrecompleto}</td>

                  <td>
                    {a.ponderado_semestre ? (
                      <Button
                        variant="link"
                        className={`p-0 fw-bold text-decoration-none ${
                          Number(a.ponderado_semestre) >= 11
                            ? "text-primary"
                            : "text-danger"
                        }`}
                        onClick={() => abrirDetalle(a)}
                      >
                        {a.ponderado_semestre}
                      </Button>
                    ) : (
                      "-"
                    )}
                  </td>


                  <td>{a.comentario || ""}</td>
                  <td>{a.recomendacion || ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No hay datos disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>

    {/* 🔥 MINI MODAL (AHORA SÍ FUNCIONA) */}
    <DetalleCursosModal
      show={showDetalle}
      onHide={() => setShowDetalle(false)}
      alumno={alumnoDetalle}
    />
  </>
);

      
}

export default ReporteRendimientoModal;
