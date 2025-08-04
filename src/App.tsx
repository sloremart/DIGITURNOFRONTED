import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Turnos from './pages/Turnos';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/turnos" element={<Turnos />} />
            <Route path="/servicios" element={<div className="page-placeholder">Página de Servicios - En desarrollo</div>} />
            <Route path="/estadisticas" element={<div className="page-placeholder">Página de Estadísticas - En desarrollo</div>} />
            <Route path="/admin" element={<div className="page-placeholder">Página de Administración - En desarrollo</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 