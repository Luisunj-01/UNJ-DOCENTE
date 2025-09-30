import React, { useState, useEffect } from 'react';

const ModalNuevoTrabajo = ({ mostrar, onClose, onGuardar, trabajo }) => {
  const [formulario, setFormulario] = useState({
    id: '',
    contenido: '',
    fechalimite: '',
    horaInicio: '',
    fechalimitefin: '',
    horaFin: '',
    fechaaplazados: '',      // ✅ nuevo campo
    horaAplazados: ''        // ✅ nuevo campo
  });

  useEffect(() => {
  if (mostrar) {
    if (trabajo) {
      let fechaInicio = '';
      let horaInicio = '';
      let fechaFin = '';
      let horaFin = '';
      let fechaAplaz = '';
      let horaAplaz = '';

      if (trabajo.fechalimite) {
        // Primero separamos si existe la parte de aplazados
        const [rango, aplazados] = trabajo.fechalimite.split(' Apla ');
        // rango tendrá "08/09/2025 00:00 al 20/09/2025 23:59"
        // aplazados será "13/09/2025 16:55" (o undefined)

        const [inicio, fin] = rango.split(' al ');

        if (inicio) {
          const [dia, mes, anioHora] = inicio.split('/');
          const [anio, hora] = anioHora.split(' ');
          fechaInicio = `${anio}-${mes}-${dia}`;
          horaInicio = hora || '00:00';
        }

        if (fin) {
          const [dia2, mes2, anioHora2] = fin.split('/');
          const [anio2, hora2] = anioHora2.split(' ');
          fechaFin = `${anio2}-${mes2}-${dia2}`;
          horaFin = hora2 || '23:59';
        }

        if (aplazados) {
          // ejemplo aplazados = "13/09/2025 16:55"
          const [dia3, mes3, anioHora3] = aplazados.split('/');
          const [anio3, hora3] = anioHora3.trim().split(' ');
          fechaAplaz = `${anio3}-${mes3}-${dia3}`;
          horaAplaz = hora3 || '23:59';
        }
      }

      setFormulario({
        id: trabajo.tra || '',
        contenido: trabajo.contenido || '',
        fechalimite: fechaInicio,
        horaInicio: horaInicio,
        fechalimitefin: fechaFin,
        horaFin: horaFin,
        fechaaplazados: fechaAplaz,
        horaAplazados: horaAplaz
      });
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      setFormulario({
        id: '',
        contenido: '',
        fechalimite: hoy,
        horaInicio: '00:00',
        fechalimitefin: hoy,
        horaFin: '23:59',
        fechaaplazados: hoy,
        horaAplazados: '23:59'
      });
    }
  }
}, [mostrar, trabajo]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formulario.contenido.trim()) {
      alert('Por favor, completa el contenido.');
      return;
    }

    const fechaInicioCompleta = `${formulario.fechalimite}T${formulario.horaInicio}:00`;
    const fechaFinCompleta = `${formulario.fechalimitefin}T${formulario.horaFin}:00`;
    const fechaAplazadosCompleta = `${formulario.fechaaplazados}T${formulario.horaAplazados}:00`;

    onGuardar({
      id: formulario.id,
      contenido: formulario.contenido,
      fechalimite: fechaInicioCompleta,
      fechalimitefin: fechaFinCompleta,
      fechaaplazados: fechaAplazadosCompleta // ✅ nuevo dato al backend
    });
  };

  if (!mostrar) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog">
          <form onSubmit={handleSubmit} className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{trabajo ? 'Modificar Trabajo' : 'Nuevo Trabajo'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Contenido */}
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label me-2" style={{ minWidth: '120px' }}>Contenido:</label>
                <input
                  type="text"
                  name="contenido"
                  className="form-control"
                  value={formulario.contenido}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Fecha Inicio */}
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label me-2" style={{ minWidth: '120px' }}>Fecha Inicio:</label>
                <input
                  type="date"
                  name="fechalimite"
                  className="form-control"
                  style={{ maxWidth: '180px', marginRight: '10px' }}
                  value={formulario.fechalimite}
                  onChange={handleChange}
                  required
                />
                <input
                  type="time"
                  name="horaInicio"
                  className="form-control"
                  style={{ maxWidth: '120px' }}
                  value={formulario.horaInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Fecha Fin */}
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label me-2" style={{ minWidth: '120px' }}>Fecha Fin:</label>
                <input
                  type="date"
                  name="fechalimitefin"
                  className="form-control"
                  style={{ maxWidth: '180px', marginRight: '10px' }}
                  value={formulario.fechalimitefin}
                  onChange={handleChange}
                  required
                />
                <input
                  type="time"
                  name="horaFin"
                  className="form-control"
                  style={{ maxWidth: '120px' }}
                  value={formulario.horaFin}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Fecha Aplazados */}
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label me-2" style={{ minWidth: '120px' }}>Fecha Aplazados:</label>
                <input
                  type="date"
                  name="fechaaplazados"
                  className="form-control"
                  style={{ maxWidth: '180px', marginRight: '10px' }}
                  value={formulario.fechaaplazados}
                  onChange={handleChange}
                  required
                />
                <input
                  type="time"
                  name="horaAplazados"
                  className="form-control"
                  style={{ maxWidth: '120px' }}
                  value={formulario.horaAplazados}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {trabajo ? 'Modificar Trabajo' : 'Guardar Trabajo'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ModalNuevoTrabajo;
