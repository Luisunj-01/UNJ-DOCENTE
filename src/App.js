import { BrowserRouter as Router } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';

import AppRoutes from './AppRoutes'; // importa el archivo que acabas de crear

function App() {
  
  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
