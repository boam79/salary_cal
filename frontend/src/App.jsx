import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import LegacyTool from './pages/LegacyTool.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-brand" end>
          금융 계산기
        </NavLink>
        <span className="app-badge">React · Vite</span>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tool/:toolId" element={<LegacyTool />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
