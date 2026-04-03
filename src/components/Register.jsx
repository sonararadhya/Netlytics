import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });

    if (error) {
      setMessage({ type: 'error', text: error.message.toUpperCase() });
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel flex-col-center" style={{ maxWidth: 500, padding: 48, gap: 24, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,243,255,0.08)', border: '1px solid rgba(0,243,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck className="neon-text-cyan" size={40} />
          </div>
          <h2 className="font-orbitron neon-text-cyan" style={{ fontSize: '1.8rem' }}>ACCESS GRANTED</h2>
          <div className="glass-panel font-mono" style={{ padding: 24, fontSize: 12, color: '#888', lineHeight: 1.8 }}>
            <p style={{ color: 'var(--neon-cyan)', marginBottom: 12 }}>SIGNUP_SUCCESS: {email}</p>
            <p>A verification link has been sent to your email. Please confirm your identity to activate your node.</p>
          </div>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
            <span>LOGIN</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 500, padding: 48 }}>
        <div className="tech-corner tc-tl"></div>
        <div className="tech-corner tc-tr"></div>
        <div className="tech-corner tc-bl"></div>
        <div className="tech-corner tc-br"></div>

        <div className="flex-col-center" style={{ gap: 32, textAlign: 'center' }}>
          <ShieldCheck className="neon-text-purple" size={40} />
          <div>
            <h2 className="neon-text-purple font-orbitron" style={{ fontSize: '1.8rem', marginBottom: 8 }}>NEW OPERATOR</h2>
            <p className="font-mono" style={{ fontSize: 11, color: '#555', letterSpacing: 3 }}>ENROLLMENT PROTOCOL</p>
          </div>

          <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="label-tech">Terminal Identifier (Email)</label>
              <div style={{ position: 'relative' }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="ID@NETWORK.DOMAIN" required />
                <Mail size={18} style={{ position: 'absolute', right: 16, top: 18, color: '#444' }} />
              </div>
            </div>
            <div>
              <label className="label-tech">Access Key (Password)</label>
              <div style={{ position: 'relative' }}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••••" required />
                <Lock size={18} style={{ position: 'absolute', right: 16, top: 18, color: '#444' }} />
              </div>
            </div>

            {message && (
              <div style={{ padding: 16, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', borderRadius: 4, color: '#ef4444' }}>
                <span className="font-mono" style={{ fontSize: 11 }}>{message.text}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
              {loading ? <div className="spin" style={{ width: 24, height: 24, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : (
                <>
                  <UserPlus size={22} />
                  <span>REGISTER</span>
                </>
              )}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#555', fontSize: 13 }}>Already registered?</span>
            <Link to="/login" className="neon-text-cyan font-orbitron" style={{ fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: 2 }}>LOGIN →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
