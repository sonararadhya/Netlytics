import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { t, getLang, setLang, LANGUAGES } from '../lib/i18n';
import { Gauge, BarChart3, Clock, Shield, Download, LogOut, Activity, Globe } from 'lucide-react';

const Navbar = ({ session }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
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

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const currentLang = getLang();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Activity className="neon-text-cyan" size={22} />
        <span className="font-orbitron neon-text-cyan" style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: -1, fontStyle: 'italic' }}>NETLYTICS</span>
      </div>
      <div className="navbar-links">
        <Link to="/" className={isActive('/')}><Gauge size={14} /><span>{t('nav.test')}</span></Link>
        <Link to="/dashboard" className={isActive('/dashboard')}><BarChart3 size={14} /><span>{t('nav.data')}</span></Link>
        <Link to="/scheduler" className={isActive('/scheduler')}><Clock size={14} /><span>{t('nav.schedule')}</span></Link>
        <Link to="/monitor" className={isActive('/monitor')}><Shield size={14} /><span>{t('nav.monitor')}</span></Link>
        <Link to="/file-monitor" className={isActive('/file-monitor')}><Download size={14} /><span>{t('nav.files')}</span></Link>
      </div>
      <div className="navbar-user">
        {/* Language Selector */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button onClick={() => setLangOpen(!langOpen)} className="lang-btn" title={t('common.language')}>
            <Globe size={14} />
            <span>{LANGUAGES[currentLang]?.flag}</span>
          </button>
          {langOpen && (
            <div className="lang-dropdown">
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <button key={code} className={`lang-option ${currentLang === code ? 'active' : ''}`}
                  onClick={() => { setLang(code); setLangOpen(false); }}>
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="font-mono" style={{ fontSize: 10, color: '#555' }}>{session.user.email?.split('@')[0]}</span>
        <button onClick={handleLogout} className="btn-logout" title="Logout"><LogOut size={16} /></button>
      </div>
    </nav>
  );
};

export default Navbar;
