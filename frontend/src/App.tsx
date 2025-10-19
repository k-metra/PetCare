import React from 'react';
import logo from './logo.svg';
import './App.css';

import Home from './pages/home';
import Login from './pages/login';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
