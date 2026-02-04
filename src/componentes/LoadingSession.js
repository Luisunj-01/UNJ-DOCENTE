

function LoadingSession({ error, refreshUser }) {
  const spinnerStyle = {
    width: '56px',
    height: '56px',
    border: '6px solid #cfe2ff',
    borderTopColor: '#0d6efd',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      gap: '1rem'
    }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={spinnerStyle} aria-label="cargando" />
      <div style={{ color: '#0d6efd', fontWeight: 500 }}>Cargando sesión...</div>
      {error && (
        <>
          <div style={{ color: '#dc3545', textAlign: 'center' }}>
            {error === 'timeout' && 'Tiempo de espera agotado'}
            {error === 'network' && 'No se puede conectar con el servidor'}
            {error === 'server' && 'Error del servidor'}
            {error === 'unauthorized' && 'Sesión inválida'}
            {!['timeout','network','server','unauthorized'].includes(error) && 'No se pudo cargar la sesión. Intenta más tarde.'}
          </div>
          <button 
            onClick={() => refreshUser()} 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar conexión
          </button>
        </>
      )}
    </div>
  );
}

export default LoadingSession;