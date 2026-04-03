import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SpeedTest from './components/SpeedTest';
import Scheduler from './components/Scheduler';
import Monitor from './components/Monitor';
import FileMonitor from './components/FileMonitor';
import Navbar from './components/Navbar';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: '#020205' }}>
        <div className="flex-col-center" style={{ gap: 16 }}>
          <div className="spin" style={{ width: 48, height: 48, border: '3px solid rgba(0,243,255,0.2)', borderTopColor: 'var(--neon-cyan)', borderRadius: '50%' }}></div>
          <div className="neon-text-cyan pulse font-orbitron" style={{ fontSize: 11, letterSpacing: 6, fontWeight: 700 }}>BOOTING_NETLYTICS</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {session && <Navbar session={session} />}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
            <Route path="/" element={session ? <SpeedTest session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />
            <Route path="/scheduler" element={session ? <Scheduler session={session} /> : <Navigate to="/login" />} />
            <Route path="/monitor" element={session ? <Monitor session={session} /> : <Navigate to="/login" />} />
            <Route path="/file-monitor" element={session ? <FileMonitor session={session} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
