import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Make sure this path is 100% correct!
import AIChatWidget from './components/AIChatWidget';
import AdminAnalytics from './pages/AdminAnalytics';

// Simple Dashboard Placeholder
const Dashboard = () => (
  <div style={{ padding: '20px' }}>
    <h1>🏠 Dashboard</h1>
    <p>This is the main dashboard area.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        {/* 1. Main Content Area */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Routes>

        {/* 2. The Widget - NO CONDITIONS, JUST RENDER IT */}
        <AIChatWidget />
      </div>
    </Router>
  );
}

export default App;