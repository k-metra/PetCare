import React from 'react';
import logo from './logo.svg';
import './App.css';

import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import SetAppointment from './pages/setAppointment';
import AdminDashboard from './pages/adminDashboard';
import MyAppointments from './pages/myAppointments';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import EmailVerified from './pages/emailVerified';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email/verified" element={<EmailVerified />} />
          <Route path="/set-appointment" element={<SetAppointment />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
