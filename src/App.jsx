import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import SpeedTest from './components/SpeedTest';
import Scheduler from './components/Scheduler';
import Monitor from './components/Monitor';
import FileMonitor from './components/FileMonitor';
import Navbar from './components/Navbar';
import PageWrapper from './components/PageWrapper';
import CustomCursor from './components/CustomCursor';
import LiquidBackground from './components/LiquidBackground';

const AnimatedRoutes = ({ session }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={!session ? <PageWrapper><Login /></PageWrapper> : <Navigate to="/" />} />
        <Route path="/register" element={!session ? <PageWrapper><Register /></PageWrapper> : <Navigate to="/" />} />
        <Route path="/reset-password" element={!session ? <PageWrapper><ResetPassword /></PageWrapper> : <Navigate to="/" />} />
        <Route path="/" element={session ? <PageWrapper><SpeedTest session={session} /></PageWrapper> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={session ? <PageWrapper><Dashboard session={session} /></PageWrapper> : <Navigate to="/login" />} />
        <Route path="/scheduler" element={session ? <PageWrapper><Scheduler session={session} /></PageWrapper> : <Navigate to="/login" />} />
        <Route path="/monitor" element={session ? <PageWrapper><Monitor session={session} /></PageWrapper> : <Navigate to="/login" />} />
        <Route path="/file-monitor" element={session ? <PageWrapper><FileMonitor session={session} /></PageWrapper> : <Navigate to="/login" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to get session:", err);
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
          <div className="neon-text-cyan pulse font-orbitron" style={{ fontSize: 11, letterSpacing: 6, fontWeight: 700 }}>BOOTING_NETCHRONAIX</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <CustomCursor />
      <LiquidBackground>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {session && <Navbar session={session} />}
          <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
            <AnimatedRoutes session={session} />
          </main>
        </div>
      </LiquidBackground>
    </Router>
  );
}

export default App;
