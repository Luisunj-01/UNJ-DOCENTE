import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserProvider } from './context/UserContext'; // ✅ nombre correcto

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <UserProvider> {/* ✅ envuelve App correctamente */}
      <App />
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
