import React, { useState, useEffect } from 'react';

const ModalNuevoMaterial = ({ mostrar, onClose, onGuardar }) => {
  const [formulario, setFormulario] = useState({
    contenido: '',
    observacion: ''
  });

  // Cuando se abre el modal, reseteamos el formulario
  useEffect(() => {
    if (mostrar) {
      setFormulario({ contenido: '', observacion: '' });
    }
  }, [mostrar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formulario.contenido.trim() || !formulario.observacion.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    onGuardar(formulario);
  };

  if (!mostrar) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog">
          <form onSubmit={handleSubmit} className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nuevo Material</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Contenido</label>
                <input
                  type="text"
                  name="contenido"
                  className="form-control"
                  value={formulario.contenido}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Observación</label>
                <textarea
                  name="observacion"
                  className="form-control"
                  value={formulario.observacion}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ModalNuevoMaterial;
