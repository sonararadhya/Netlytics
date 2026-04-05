import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, Activity, AlertTriangle, CheckCircle, KeyRound } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      let msg = error.message.toUpperCase();
      if (msg.includes('EMAIL NOT CONFIRMED')) msg = 'EMAIL VERIFICATION PENDING. CHECK YOUR INBOX.';
      setMessage({ type:'error', text:msg });
    } else navigate('/');
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: window.location.origin + '/reset-password' });
    if (error) setMessage({ type:'error', text:error.message.toUpperCase() });
    else setResetSent(true);
    setLoading(false);
  };

  if (showForgot) {
    return (
      <div className="flex-center" style={{minHeight:'80vh'}}>
        <div className="glass-panel auth-panel" style={{width:'100%',maxWidth:460}}>
          <div className="tech-corner tc-tl"></div><div className="tech-corner tc-tr"></div>
          <div className="tech-corner tc-bl"></div><div className="tech-corner tc-br"></div>
          <div className="flex-col-center" style={{gap:24,textAlign:'center'}}>
            <KeyRound style={{color:'#eab308'}} size={36}/>
            <div>
              <h2 style={{fontFamily:'var(--font-header)',fontSize:'1.4rem',color:'#eab308',textShadow:'0 0 10px rgba(234,179,8,0.3)',marginBottom:6}}>RESET ACCESS KEY</h2>
              <p className="font-mono" style={{fontSize:10,color:'#555',letterSpacing:3}}>ENTER YOUR REGISTERED EMAIL</p>
            </div>
            {resetSent ? (
              <div className="flex-col-center" style={{gap:16,padding:'20px 0'}}>
                <CheckCircle style={{color:'#22c55e'}} size={40}/>
                <p className="font-mono" style={{fontSize:12,color:'#888',lineHeight:1.6}}>Password reset link sent to <b style={{color:'var(--neon-cyan)'}}>{resetEmail}</b>. Check your email inbox.</p>
                <button onClick={()=>{setShowForgot(false);setResetSent(false);}} className="btn-primary" style={{padding:'12px 32px',fontSize:'0.85rem'}}>BACK TO LOGIN</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{width:'100%',display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <label className="label-tech">Email Address</label>
                  <input type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} className="input-field" placeholder="your@email.com" required/>
                </div>
                {message && <div style={{padding:12,border:'1px solid rgba(239,68,68,0.4)',background:'rgba(239,68,68,0.08)',borderRadius:4,color:'#ef4444'}}><span className="font-mono" style={{fontSize:10}}>{message.text}</span></div>}
                <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%',padding:'14px',fontSize:'0.9rem'}}>
                  {loading?<div className="spin" style={{width:20,height:20,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%'}}></div>:'SEND RESET LINK'}
                </button>
                <button type="button" onClick={()=>setShowForgot(false)} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontFamily:'var(--font-header)',fontSize:11,letterSpacing:2}}>← BACK TO LOGIN</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{minHeight:'80vh'}}>
      <div className="glass-panel auth-panel" style={{width:'100%',maxWidth:460}}>
        <div className="tech-corner tc-tl"></div><div className="tech-corner tc-tr"></div>
        <div className="tech-corner tc-bl"></div><div className="tech-corner tc-br"></div>
        <div className="flex-col-center" style={{gap:28,textAlign:'center'}}>
          <Activity className="neon-text-cyan" size={36}/>
          <div>
            <h2 style={{fontFamily:'var(--font-header)',fontSize:'1.5rem',color:'#00f3ff',textShadow:'0 0 12px rgba(0,243,255,0.4)',marginBottom:6}}>ACCESS TERMINAL</h2>
            <p className="font-mono" style={{fontSize:10,color:'#555',letterSpacing:3}}>AUTHENTICATION REQUIRED</p>
          </div>
          <form onSubmit={handleLogin} style={{width:'100%',display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label className="label-tech">Email</label>
              <div style={{position:'relative'}}>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input-field" placeholder="you@domain.com" required/>
                <Mail size={16} style={{position:'absolute',right:14,top:16,color:'#444'}}/>
              </div>
            </div>
            <div>
              <label className="label-tech">Password</label>
              <div style={{position:'relative'}}>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-field" placeholder="••••••••••" required/>
                <Lock size={16} style={{position:'absolute',right:14,top:16,color:'#444'}}/>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <button type="button" onClick={()=>setShowForgot(true)} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontFamily:'Courier New,monospace',fontSize:11,textDecoration:'underline',textUnderlineOffset:3}}>Forgot password?</button>
            </div>
            {message && <div style={{padding:12,border:'1px solid rgba(239,68,68,0.4)',background:'rgba(239,68,68,0.08)',borderRadius:4,display:'flex',alignItems:'center',gap:10,color:'#ef4444'}}><AlertTriangle size={14}/><span className="font-mono" style={{fontSize:10}}>{message.text}</span></div>}
            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%'}}>
              {loading?<div className="spin" style={{width:22,height:22,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%'}}></div>:<><LogIn size={18}/><span>LOGIN</span></>}
            </button>
          </form>
          <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:20,width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'#555',fontSize:12}}>New operator?</span>
            <Link to="/register" className="neon-text-purple font-orbitron" style={{fontSize:11,fontWeight:700,textDecoration:'none',letterSpacing:2}}>REGISTER →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
