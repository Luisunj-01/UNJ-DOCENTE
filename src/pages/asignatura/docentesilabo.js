import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import config from '../../config';

const Docentesilabo = ({ fila, semestre, escuela, urlPDF, setUrlPDF, renderKey, setRenderKey, ruta, tipo, semana }) => {
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [pdfActualizado, setPdfActualizado] = useState(false);

  const construirNombreArchivo = (cursoData, semestreValue) => {
    const cursoSinGuion = cursoData?.curso?.replace('-', '') || '';
    if (tipo === 'guia' || tipo === 'trabajo' || tipo === 'material') {
      return `${cursoData?.sede || ''}${semestreValue}${cursoData?.estructura || ''}${cursoData?.curricula || ''}${cursoSinGuion}${cursoData?.seccion || ''}${semana || ''}.pdf`;
    } else {
      return `${cursoData?.sede || ''}${semestreValue}${cursoData?.estructura || ''}${cursoData?.curricula || ''}${cursoSinGuion}${cursoData?.seccion || ''}.pdf`;
    }
  };

  useEffect(() => {
    if (fila && semestre) {
      const nombre = construirNombreArchivo(fila, semestre);
      const rutaCompleta = `https://pruebas.unj.edu.pe/zetunajaen/${ruta}/${nombre}`;
      fetch(rutaCompleta, { method: 'HEAD' })
        .then((res) => {
          if (res.ok) {
            const nuevaURL = `${rutaCompleta}?t=${Date.now()}`;
            setUrlPDF(nuevaURL);
            setRenderKey(Date.now());
          } else {
            setUrlPDF(null);
          }
        })
        .catch(() => {
          setUrlPDF(null);
        });
    }
  }, [fila, semestre, ruta]);

  const handleArchivoChange = (e) => {
    const archivoSeleccionado = e.target.files[0];
    if (!archivoSeleccionado) return;

    const tamañoKB = archivoSeleccionado.size / 1024;

    if (tamañoKB > 30720) { // 30 MB
      Swal.fire({
        icon: 'error',
        title: 'Archivo demasiado grande',
        text: 'El archivo supera los 30 MB. Por favor, suba uno más liviano.'
      });
      return;
    }

    setArchivo(archivoSeleccionado);
  };

  const handleSubir = async () => {
  if (!archivo) {
    Swal.fire('Error', 'Por favor selecciona un archivo PDF válido.', 'warning');
    return;
  }

  const nombreArchivo = construirNombreArchivo(fila, semestre);

  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('nombre', nombreArchivo);
  formData.append('ruta', ruta);
  formData.append('escuela', fila?.descripcionescuela || '');
  formData.append('semestre', semestre || '');

  try {
    setSubiendo(true);

    const res = await fetch(`${config.apiUrl}api/subir-archivo`, {
      method: 'POST',
      body: formData,
    });

    const rawText = await res.text(); // siempre leemos como texto
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null; // no era JSON válido
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || `Error HTTP ${res.status}: ${rawText}`);
    }

    // Éxito
    const nuevaURL = `https://pruebas.unj.edu.pe/zetunajaen/${ruta}/${nombreArchivo}?t=${Date.now()}`;
    setUrlPDF(nuevaURL);
    setRenderKey(Date.now());
    localStorage.setItem('archivoSubido', nombreArchivo);

    setPdfActualizado(true);
    setTimeout(() => setPdfActualizado(false), 3000);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Archivo subido correctamente',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    Swal.fire('Error', error.message || 'No se pudo subir el archivo.', 'error');
  } finally {
    setSubiendo(false);
  }
};


  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-6">
          <p><strong>NOMBRE:</strong> {fila?.nombre}</p>
          <p><strong>CÓDIGO:</strong> {fila?.curso}</p>
          <p><strong>SECCIÓN:</strong> {fila?.seccion}</p>
          <p><strong>ESCUELA:</strong> {fila?.descripcionescuela}</p>
          <p><strong>SEMESTRE:</strong> {semestre}</p>
        </div>
        <div className="col-lg-6">
          {urlPDF ? (
            <>
              <iframe
                key={renderKey}
                src={urlPDF}
                title="PDF"
                width="100%"
                height="400px"
                style={{ border: '1px solid #ccc' }}
              />
              {pdfActualizado && (
                <div className="alert alert-success mt-2 p-2" style={{ fontSize: '0.9rem' }}>
                  Archivo actualizado correctamente ✅
                </div>
              )}
            </>
          ) : (
            <p>No hay archivo disponible para mostrar.</p>
          )}
        </div>
      </div>

      <div className="mb-3 mt-0">
        <label className="form-label">Selecciona archivo PDF</label>
        <input
          type="file"
          className="form-control"
          accept="application/pdf"
          onChange={handleArchivoChange}
        />
      </div>

      <button
        className="btn btn-sm btn-primary"
        style={{ padding: '4px 12px', fontSize: '0.875rem' }}
        onClick={async () => {
          const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esto reemplazará el archivo actual si ya existe.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, subir',
            cancelButtonText: 'Cancelar'
          });

          if (result.isConfirmed) {
            await handleSubir();
          }
        }}
        disabled={subiendo}
      >
        {subiendo ? 'Subiendo...' : 'Subir PDF'}
      </button>
    </div>
  );
};

export default Docentesilabo;
