export default function AlertasCard({ alertas }) {
  return (
    <div className="p-3 shadow-sm bg-white rounded alert-box">
      <h5>🔔 Alertas importantes</h5>
      
      <ul style={{ marginTop: 10 }}>
        <li>Alumnos sin asistir a 2 sesiones: <b>{alertas.faltantes}</b></li>
        <li>Alumnos sin recomendación: <b>{alertas.sinRecomendacion}</b></li>
        <li>Casos críticos: <b>{alertas.criticos}</b></li>
      </ul>
    </div>
  );
}
