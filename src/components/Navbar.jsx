import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { t, getLang, setLang, LANGUAGES } from '../lib/i18n';
import { Gauge, BarChart3, Clock, Shield, Download, LogOut, Activity, Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ session }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langRef = useRef(null);
  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  useEffect(() => {
    const handle = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const currentLang = getLang();

  const navLinks = [
    { path: '/', icon: <Gauge size={14} />, label: t('nav.test') },
    { path: '/dashboard', icon: <BarChart3 size={14} />, label: t('nav.data') },
    { path: '/scheduler', icon: <Clock size={14} />, label: t('nav.schedule') },
    { path: '/monitor', icon: <Shield size={14} />, label: t('nav.monitor') },
    { path: '/file-monitor', icon: <Download size={14} />, label: t('nav.files') }
  ];

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-glass">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Activity className="neon-text-cyan flex-shrink-0" size={22} />
            <span className="font-orbitron neon-text-cyan navbar-title">NETCHRONAIX</span>
          </div>
          
          {/* Desktop Links */}
          <div className="navbar-links desktop-only">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={isActive(link.path)}>{link.icon}<span>{link.label}</span></Link>
            ))}
          </div>

          <div className="navbar-user">
            {/* Language Selector */}
            <div ref={langRef} style={{ position: 'relative' }} className="desktop-only">
              <button onClick={() => setLangOpen(!langOpen)} className="lang-btn" title={t('common.language')}>
                <Globe size={14} />
                <span>{LANGUAGES[currentLang]?.flag}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="lang-dropdown"
                  >
                    {Object.entries(LANGUAGES).map(([code, lang]) => (
                      <button key={code} className={`lang-option ${currentLang === code ? 'active' : ''}`}
                        onClick={() => { setLang(code); setLangOpen(false); }}>
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <span className="font-mono user-email desktop-only">{session.user.email?.split('@')[0]}</span>
            <button onClick={handleLogout} className="btn-logout desktop-only" title="Logout"><LogOut size={16} /></button>

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mobile-dropdown"
            >
              <div className="mobile-nav-links">
                  {navLinks.map((link) => (
                    <Link key={link.path} to={link.path} className={isActive(link.path)}>{link.icon}<span>{link.label}</span></Link>
                  ))}
                  
                  {/* Mobile Lang & Logout */}
                  <div className="mobile-nav-footer">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {Object.entries(LANGUAGES).map(([code, lang]) => (
                        <button key={code} className={`lang-btn ${currentLang === code ? 'active' : ''}`}
                          onClick={() => { setLang(code); }}>
                          <span>{lang.flag}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={handleLogout} className="btn-logout" title="Logout" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                      <LogOut size={16} /> <span>Logout ({session.user.email?.split('@')[0]})</span>
                    </button>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
