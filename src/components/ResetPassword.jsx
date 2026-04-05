import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, KeyRound, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // When the user clicks the link in their email, they come here.
    // Ensure that Supabase has processed the hash string from the URL to get the session.
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        console.log("Password recovery event received.");
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message.toUpperCase() });
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel auth-panel flex-col-center" style={{ maxWidth: 460, gap: 24, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle style={{ color: '#22c55e' }} size={40} />
          </div>
          <h2 className="font-orbitron neon-text-cyan" style={{ fontSize: '1.5rem' }}>PASSWORD UPDATED</h2>
          <p className="font-mono" style={{ fontSize: 12, color: '#aaa' }}>Your access key has been successfully reconfigured. Redirecting to terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel auth-panel" style={{ width: '100%', maxWidth: 460 }}>
        <div className="tech-corner tc-tl"></div><div className="tech-corner tc-tr"></div>
        <div className="tech-corner tc-bl"></div><div className="tech-corner tc-br"></div>
        <div className="flex-col-center" style={{ gap: 28, textAlign: 'center' }}>
          <KeyRound style={{ color: '#00f3ff' }} size={36} />
          <div>
            <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '1.5rem', color: '#00f3ff', textShadow: '0 0 12px rgba(0,243,255,0.4)', marginBottom: 6 }}>NEW ACCESS KEY</h2>
            <p className="font-mono" style={{ fontSize: 11, color: '#aaa', letterSpacing: 2 }}>ENTER YOUR NEW PASSWORD</p>
          </div>
          
          <form onSubmit={handleReset} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label-tech">New Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••••" required minLength="6" />
                <Lock size={16} style={{ position: 'absolute', right: 14, top: 16, color: '#888' }} />
              </div>
            </div>

            {message && (
              <div style={{ padding: 12, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', borderRadius: 4, color: '#ef4444' }}>
                <span className="font-mono" style={{ fontSize: 11 }}>{message.text}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }}>
              {loading ? <div className="spin" style={{ width: 22, height: 22, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : 'UPDATE PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
