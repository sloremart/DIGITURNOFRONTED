import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Kiosco from './pages/Kiosco';
import Configuracion from './pages/Configuracion';
import Facturacion from './pages/Facturacion';
import AsignacionCitas from './pages/AsignacionCitas';
import LlamadosGeneral from './pages/LlamadosGeneral';
import LlamadosFacturacion from './pages/LlamadosFacturacion';
import LlamadosCitas from './pages/LlamadosCitas';
import LlamadosCompleto from './pages/LlamadosCompleto';
import PantallaSalaEsperaPage from './pages/PantallaSalaEsperaPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kiosco" element={<Kiosco />} />
            <Route path="/facturacion" element={<Facturacion />} />
            <Route path="/asignacion-citas" element={<AsignacionCitas />} />
            <Route path="/llamados" element={<LlamadosGeneral />} />
            <Route path="/llamados/facturacion" element={<LlamadosFacturacion />} />
            <Route path="/llamados/citas" element={<LlamadosCitas />} />
            <Route path="/llamados/general" element={<LlamadosCompleto />} />
            <Route path="/sala-espera" element={<PantallaSalaEsperaPage />} />
            <Route path="/pantalla-sala" element={<PantallaSalaEsperaPage />} />
            <Route path="/servicios" element={<div className="page-placeholder">Página de Servicios - En desarrollo</div>} />
            <Route path="/estadisticas" element={<div className="page-placeholder">Página de Estadísticas - En desarrollo</div>} />
            <Route path="/admin" element={<div className="page-placeholder">Página de Administración - En desarrollo</div>} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 