## 📌 Configuración del Semestre Académico Actual

### 🔄 Sistema Centralizado

El proyecto ahora obtiene el **semestre académico actual desde la tabla `aca_parametrosgenerales`** del servidor backend, en lugar de tenerlo hardcodeado en cada componente.

### 📚 Archivos Principales

#### 1. **`src/hooks/useSemestreActual.js`** (Nuevo)
Hook personalizado que:
- Consulta el endpoint `/api/parametrosgenerales/:sede` del backend
- Devuelve el semestre actual desde `aca_parametrosgenerales.periodoacademico`
- Incluye fallback a '202502' si hay error
- Carga automáticamente al montar el componente

```javascript
const { semestre, loading, error } = useSemestreActual('01');
```

#### 2. **`src/pages/reutilizables/logica/docente.js`** (Actualizado)
Nueva función exportada:
```javascript
export const obtenerPeriodoAcademicoActual = async (sede = '01') => {
  // Consulta el backend y devuelve:
  // { periodoacademico, sem, sem_cp, mensaje }
}
```

### 🔌 Cómo Usar en Componentes

Simplemente importa el hook y úsalo:

```javascript
import { useSemestreActual } from '../../hooks/useSemestreActual';

function MiComponente() {
  const { semestre: semestreActual } = useSemestreActual('01');
  const [semestre, setSemestre] = useState('');

  // Sincronizar cuando carga desde la BD
  useEffect(() => {
    if (semestreActual) {
      setSemestre(semestreActual);
    }
  }, [semestreActual]);

  return (
    <SemestreSelect 
      value={semestre}
      onChange={(e) => setSemestre(e.target.value)}
      name="cboSemestre"
    />
  );
}
```

### ✅ Componentes Actualizados

- ✅ `src/pages/reportes/ReporteDoc.js`
- ✅ `src/pages/actividades/Declaracion.js`
- ✅ `src/pages/asignatura/Asistenciaestudiante.js`

### 🔧 Backend - Endpoint Requerido

Debe existir un endpoint que devuelva los parámetros generales:

```
GET /api/parametrosgenerales/{sede}

Response:
{
  "periodoacademico": "202502",
  "sem": "202502",
  "sem_cp": "202401",
  "ciclo": 10,
  "mensaje": ""
}
```

El backend consulta la tabla:
```sql
SELECT periodoacademico, sem, sem_cp, ciclo 
FROM aca_parametrosgenerales 
WHERE sede = ?
```

### 📋 Próximos Pasos (Opcional)

Para completar la implementación en todos los componentes:

1. Actualizar `src/pages/notas/IngresoRezaAplaz.js`
2. Actualizar `src/pages/tutoria/ObsRendimiento.js`
3. Actualizar `src/pages/cursos/Cursos.js`
4. Actualizar `src/pages/tutoria/Reportes.js`

Usar el mismo patrón del hook `useSemestreActual` en cada uno.
