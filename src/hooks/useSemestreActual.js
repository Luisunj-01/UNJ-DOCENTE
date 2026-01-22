import { useEffect, useState } from 'react';
import { obtenerPeriodoAcademicoActual } from '../pages/reutilizables/logica/docente';

/**
 * Hook personalizado para obtener el semestre académico actual
 * Consulta la tabla aca_parametrosgenerales desde el backend
 * @param {string} sede - Código de sede (default: '01')
 * @returns {object} { semestre, loading, error }
 */
export const useSemestreActual = (sede = '01') => {
  const [semestre, setSemestre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarSemestreActual = async () => {
      setLoading(true);
      try {
        const resultado = await obtenerPeriodoAcademicoActual(sede);
        
        if (resultado && resultado.periodoacademico) {
          const semestreValue = String(resultado.periodoacademico).trim();
          setSemestre(semestreValue);
          console.log('✅ Semestre cargado:', semestreValue);
          setError('');
        } else {
          // Fallback a valor por defecto si no hay respuesta
          console.warn('⚠️ No se obtuvo semestre del backend, usando valor por defecto');
          setSemestre('202502');
          setError(resultado?.mensaje || 'No se pudo obtener el semestre');
        }
      } catch (err) {
        console.error('❌ Error al cargar semestre:', err.message);
        // Usar valor por defecto si hay error de conexión
        setSemestre('202502');
        setError(`Error de conexión: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    cargarSemestreActual();
  }, [sede]);

  return { semestre, loading, error };
};
