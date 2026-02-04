//src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { ModuloProvider } from "./context/ModuloContext";
import AppRoutes from "./AppRoutes";

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <ModuloProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ModuloProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
