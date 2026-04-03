import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TEST_PROFILES, fetchNetworkInfo, measureLatency, measureDownload, measureUpload } from '../lib/speedEngine';
import AiAnalysis from './AiAnalysis';
import { 
    Download, Upload, Zap, Play, Square, Activity, Gauge, AlertCircle, RefreshCw,
    Globe, BarChart3, ChevronDown, ChevronUp
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const SpeedTest = ({ session }) => {
    const [testing, setTesting] = useState(false);
    const [testMode, setTestMode] = useState('standard');
    const [phase, setPhase] = useState('IDLE');
    const [progress, setProgress] = useState(0);
    const [liveSpeed, setLiveSpeed] = useState(0);
    const [roundInfo, setRoundInfo] = useState('');
    const [error, setError] = useState(null);
    const [results, setResults] = useState({ download:0, upload:0, ping:0, jitter:0, packetLoss:0, pingMin:0, pingMax:0, pingSamples:0 });
    const [testTime, setTestTime] = useState(null);
    const [liveData, setLiveData] = useState([]);
    const [showLog, setShowLog] = useState(false);
    const [testLog, setTestLog] = useState([]);
    const [netInfo, setNetInfo] = useState(null);
    const [diagStatus, setDiagStatus] = useState({ storage:'...', db:'...' });

    const RADIUS = 140;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const TOTAL_ANGLE = 240;
    const START_ANGLE = -120;
    const MAX_SPEED = 200;

    useEffect(() => {
        fetchNetworkInfo().then(setNetInfo);
        (async () => {
            try {
                const { error: sErr } = await supabase.storage.from('speedtest_temp').list('',{limit:1});
                setDiagStatus(p=>({...p, storage: sErr?'ERROR':'OK'}));
                const { error: dErr } = await supabase.from('daily_speed_logs').select('id').limit(1);
                setDiagStatus(p=>({...p, db: dErr?'BLOCKED':'OK'}));
            } catch { setDiagStatus({storage:'OFFLINE',db:'OFFLINE'}); }
        })();
    }, []);

    const ticks = useMemo(() => {
        const t = [];
        for (let i = 0; i <= MAX_SPEED; i += 20) {
            const angle = (i/MAX_SPEED)*TOTAL_ANGLE+START_ANGLE;
            const rad = (angle*Math.PI)/180;
            t.push({ x1:160+(RADIUS-10)*Math.cos(rad), y1:160+(RADIUS-10)*Math.sin(rad), x2:160+RADIUS*Math.cos(rad), y2:160+RADIUS*Math.sin(rad), tx:160+(RADIUS+25)*Math.cos(rad), ty:160+(RADIUS+25)*Math.sin(rad), val:i });
        }
        return t;
    }, []);

    const getStrokeOffset = v => CIRCUMFERENCE*(1-(Math.min(v,MAX_SPEED)/MAX_SPEED*(TOTAL_ANGLE/360)));
    const getNeedleRotation = v => (Math.min(v,MAX_SPEED)/MAX_SPEED)*TOTAL_ANGLE+START_ANGLE+90;
    const getPhaseColor = () => phase==='DOWNLOAD'?'#00f3ff':phase==='UPLOAD'?'#bc13fe':phase==='LATENCY'?'#eab308':'#00f3ff';
    const addLog = msg => setTestLog(p=>[...p,{time:new Date().toLocaleTimeString(),msg}]);

    const runTest = async () => {
        if (testing) return;
        const profile = TEST_PROFILES[testMode];
        setTesting(true); setError(null); setLiveData([]); setLiveSpeed(0); setTestLog([]);
        setResults({download:0,upload:0,ping:0,jitter:0,packetLoss:0,pingMin:0,pingMax:0,pingSamples:0});
        addLog(`Started: ${profile.label} profile`);
        try {
            setPhase('LATENCY'); setProgress(0);
            addLog(`Latency: ${profile.pingSamples} samples`);
            const lat = await measureLatency(profile.pingSamples, p=>{setProgress(p.percent);setLiveSpeed(p.currentPing);});
            setResults(r=>({...r,ping:lat.ping,jitter:lat.jitter,packetLoss:lat.packetLoss,pingMin:lat.min,pingMax:lat.max,pingSamples:lat.samples}));
            addLog(`Ping: ${lat.ping}ms | Jitter: ${lat.jitter}ms | Loss: ${lat.packetLoss}%`);
            await new Promise(r=>setTimeout(r,300));

            setPhase('DOWNLOAD'); setProgress(0); setLiveSpeed(0);
            addLog(`Download: ${profile.dlRounds.map(r=>`${r.count}×${r.size>=1e6?Math.round(r.size/1e6)+'MB':Math.round(r.size/1e3)+'KB'}`).join(', ')}`);
            const dl = await measureDownload(profile.dlRounds, p=>{setLiveSpeed(p.mbps);setProgress(p.percent);setRoundInfo(p.roundInfo||'');setLiveData(d=>[...d.slice(-80),{t:Date.now(),v:p.mbps}]);});
            setResults(r=>({...r,download:dl}));
            addLog(`Download: ${dl} Mbps`);
            await new Promise(r=>setTimeout(r,300));

            setPhase('UPLOAD'); setProgress(0); setLiveSpeed(0);
            addLog(`Upload: ${profile.ulSizes.map(s=>s>=1e6?Math.round(s/1e6)+'MB':Math.round(s/1e3)+'KB').join(', ')}`);
            const ul = await measureUpload(session.user.id, profile, p=>{setLiveSpeed(p.mbps);setProgress(p.percent);setRoundInfo(p.roundInfo||'');setLiveData(d=>[...d.slice(-80),{t:Date.now(),v:p.mbps}]);});
            setResults(r=>({...r,upload:ul}));
            addLog(`Upload: ${ul} Mbps`);

            const final = {download:dl,upload:ul,ping:lat.ping,jitter:lat.jitter,packetLoss:lat.packetLoss,profile:testMode,timestamp:new Date().toISOString()};
            await saveResults(final);
            setTestTime(new Date().toLocaleTimeString());
            addLog('Saved.');
        } catch(err) { setError(err.message||'TEST_FAILED'); addLog('ERROR: '+err.message); }
        finally { setPhase('COMPLETE'); setTesting(false); setProgress(100); setLiveSpeed(0); setRoundInfo(''); }
    };

    const saveResults = async td => {
        const today = new Date().toISOString().split('T')[0];
        const {data:rows,error:fe} = await supabase.from('daily_speed_logs').select('*').eq('user_id',session.user.id).eq('date',today);
        if (fe) {addLog('DB_READ: '+fe.message);return;}
        const row = rows?.length>0?rows[0]:null;
        if (row) { const{error:e}=await supabase.from('daily_speed_logs').update({tests:[...row.tests,td]}).eq('id',row.id); if(e)addLog('DB_UPD: '+e.message); }
        else { const{error:e}=await supabase.from('daily_speed_logs').insert({user_id:session.user.id,date:today,tests:[td]}); if(e)addLog('DB_INS: '+e.message); }
    };

    const gaugeVal = phase==='LATENCY'?0:liveSpeed;
    const pc = getPhaseColor();
    const profile = TEST_PROFILES[testMode];
    const hasResults = results.download>0||results.upload>0||results.ping>0;

    return (
        <div className="container-main">
            {/* HEADER */}
            <header className="flex-col-center text-center" style={{marginBottom:28,gap:6}}>
                <div className="flex-center" style={{gap:12}}>
                    <div className="header-icon-box"><Gauge style={{color:'#00f3ff'}} size={24}/></div>
                    <div style={{textAlign:'left'}}>
                        <h1 className="header-title">NETLYTICS</h1>
                        <span className="header-sub">PRECISION SPEED ANALYSIS V8</span>
                    </div>
                </div>
            </header>

            {error && <div className="error-panel" style={{marginBottom:16}}><AlertCircle size={14}/><span className="error-text">{error}</span><button onClick={()=>setError(null)}><RefreshCw size={12}/></button></div>}

            {/* MODE SELECTOR */}
            <div className="mode-selector" style={{marginBottom:20}}>
                {Object.entries(TEST_PROFILES).map(([k,p])=>(
                    <button key={k} className={`mode-btn ${testMode===k?'active':''}`} onClick={()=>!testing&&setTestMode(k)} disabled={testing}>
                        <span className="mode-label">{p.label}</span>
                        <span className="mode-duration">{p.duration}</span>
                    </button>
                ))}
            </div>

            {/* GAUGE */}
            <div className="glass-panel-hero" style={{width:'100%',padding:'28px 16px 24px',marginBottom:16}}>
                <div className="tech-corner tc-tl"></div><div className="tech-corner tc-tr"></div>
                <div className="tech-corner tc-bl"></div><div className="tech-corner tc-br"></div>
                <div className="phase-strip">
                    {['LATENCY','DOWNLOAD','UPLOAD'].map(p=>(
                        <div key={p} className={`phase-pill ${phase===p?'active':''} phase-${p.toLowerCase()}`}>
                            <span className="phase-dot"></span>{p}
                        </div>
                    ))}
                </div>
                <div className="flex-col-center" style={{gap:20}}>
                    <div className="gauge-container">
                        <svg className="gauge-svg" viewBox="0 0 320 320">
                            <circle className="gauge-bg" cx="160" cy="160" r={RADIUS} strokeDasharray={CIRCUMFERENCE*(TOTAL_ANGLE/360)} strokeDashoffset="0"/>
                            <circle className="gauge-progress" cx="160" cy="160" r={RADIUS} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={getStrokeOffset(gaugeVal)} style={{stroke:pc,filter:`drop-shadow(0 0 12px ${pc})`}}/>
                            <g>{ticks.map((t,i)=><React.Fragment key={i}><line className="gauge-tick-line" x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}/><text className="gauge-tick-text" x={t.tx} y={t.ty+4}>{t.val}</text></React.Fragment>)}</g>
                        </svg>
                        <div className="gauge-needle" style={{transform:`rotate(${getNeedleRotation(gaugeVal)}deg)`,background:`linear-gradient(to top,transparent 10%,${pc} 80%,white 100%)`,boxShadow:`0 0 15px ${pc}`}}></div>
                        <div className="gauge-center-cap" style={{borderColor:pc,boxShadow:`0 0 12px ${pc}`}}></div>
                        <div className="gauge-value">
                            <div className="gauge-phase" style={{color:pc}}>{phase==='IDLE'?'READY':phase==='COMPLETE'?'DONE':phase}</div>
                            <div className="gauge-reading" style={{color:pc,textShadow:`0 0 15px ${pc}`}}>{phase==='LATENCY'?Math.round(liveSpeed):(phase==='IDLE'||phase==='COMPLETE')?'—':Math.round(liveSpeed)}</div>
                            <div className="gauge-label">{phase==='LATENCY'?'ms':'Mbps'}</div>
                        </div>
                    </div>
                    <div className="progress-container">
                        <div className="progress-label"><span>{phase==='IDLE'?'Select mode & start':phase==='COMPLETE'?'Test complete':roundInfo||phase}</span><span>{phase==='IDLE'?'':progress+'%'}</span></div>
                        <div className="progress-bar-track"><div className="progress-bar-fill" style={{width:`${progress}%`,background:pc,boxShadow:`0 0 15px ${pc}`}}></div></div>
                    </div>
                    <button onClick={runTest} disabled={testing} className="btn-primary" style={testing?{borderColor:'#ef4444',color:'#ef4444',textShadow:'none'}:{}}>
                        {testing?<Square size={20}/>:<Play size={20}/>}
                        <span style={{fontStyle:'italic'}}>{testing?'TESTING':'START TEST'}</span>
                    </button>
                </div>
            </div>

            {/* LIVE SCOPE */}
            <div className="glass-panel" style={{width:'100%',padding:'10px 16px',marginBottom:12,height:90}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <div className="flex-center" style={{gap:6}}><Activity size={11} style={{color:pc}}/><span className="font-orbitron" style={{fontSize:8,letterSpacing:2,color:'#555'}}>LIVE SIGNAL</span></div>
                    <span className="font-mono" style={{fontSize:8,color:'#333'}}>{liveData.length} samples</span>
                </div>
                <div style={{height:50}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={liveData}><YAxis hide domain={[0,MAX_SPEED]}/><Area type="monotone" dataKey="v" stroke={pc} fillOpacity={0.1} fill={pc} strokeWidth={2} isAnimationActive={false}/></AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RESULTS */}
            <div className="results-row">
                <div className="result-card result-dl">
                    <Download size={18} style={{color:'#00f3ff',opacity:0.5}}/>
                    <span className="result-label">Download</span>
                    <div className="result-value-row">
                        <span className="result-value" style={{color:'#00f3ff',textShadow:'0 0 12px rgba(0,243,255,0.4)'}}>{results.download||'—'}</span>
                        <span className="result-unit">Mbps</span>
                    </div>
                </div>
                <div className="result-card result-ul">
                    <Upload size={18} style={{color:'#bc13fe',opacity:0.5}}/>
                    <span className="result-label">Upload</span>
                    <div className="result-value-row">
                        <span className="result-value" style={{color:'#bc13fe',textShadow:'0 0 12px rgba(188,19,254,0.4)'}}>{results.upload||'—'}</span>
                        <span className="result-unit">Mbps</span>
                    </div>
                </div>
                <div className="result-card result-ping">
                    <Zap size={18} style={{color:'#eab308',opacity:0.5}}/>
                    <span className="result-label">Latency</span>
                    <div className="result-value-row">
                        <span className="result-value" style={{color:'#eab308',textShadow:'0 0 12px rgba(234,179,8,0.4)'}}>{results.ping||'—'}</span>
                        <span className="result-unit">ms</span>
                    </div>
                </div>
            </div>

            {/* EXTENDED METRICS */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <span className="metric-title">Jitter</span>
                    <div className="flex-center" style={{gap:4}}><span className="metric-value">{results.jitter||'—'}</span><span className="metric-unit">ms</span></div>
                    <span className="metric-range">{results.pingMin>0?`${results.pingMin} – ${results.pingMax} ms`:''}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-title">Packet Loss</span>
                    <div className="flex-center" style={{gap:4}}><span className="metric-value" style={{color:results.packetLoss>0?'#ef4444':'#22c55e'}}>{results.packetLoss}</span><span className="metric-unit">%</span></div>
                    <span className="metric-range">{results.pingSamples>0?`${results.pingSamples} samples`:''}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-title">Connection</span>
                    <span className="metric-value" style={{fontSize:16}}>{netInfo?.connectionType||'—'}</span>
                    <span className="metric-range">{netInfo?.ipVersion||''}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-title">ISP</span>
                    <span className="metric-value" style={{fontSize:11,letterSpacing:0,color:'#aaa',lineHeight:1.3}}>{netInfo?.isp||'—'}</span>
                    <span className="metric-range">{netInfo?.city||''}</span>
                </div>
            </div>

            {/* AI ANALYSIS */}
            {hasResults && <AiAnalysis results={results} netInfo={netInfo}/>}

            {/* SERVER INFO */}
            <div className="server-panel">
                <div className="server-header">
                    <Globe size={14} style={{color:'#00f3ff',opacity:0.5}}/>
                    <span className="font-orbitron" style={{fontSize:8,letterSpacing:3,color:'#555'}}>SERVER & NETWORK</span>
                    {testTime&&<span className="font-mono" style={{fontSize:8,color:'#444',marginLeft:'auto'}}>Measured at {testTime}</span>}
                </div>
                <div className="server-grid">
                    <div className="server-item"><span className="server-key">Your IP</span><span className="server-val">{netInfo?.ip||'—'}</span></div>
                    <div className="server-item"><span className="server-key">ISP</span><span className="server-val">{netInfo?.isp||'—'}</span></div>
                    <div className="server-item"><span className="server-key">Location</span><span className="server-val">{netInfo?`${netInfo.city}, ${netInfo.region}`:'—'}</span></div>
                    <div className="server-item"><span className="server-key">Connected via</span><span className="server-val">{netInfo?.ipVersion||'—'}</span></div>
                </div>
            </div>

            {/* TEST LOG */}
            <div className="glass-panel" style={{width:'100%',overflow:'hidden'}}>
                <button className="log-toggle" onClick={()=>setShowLog(!showLog)}>
                    <div className="flex-center" style={{gap:6}}><BarChart3 size={12} style={{color:'#555'}}/><span className="font-orbitron" style={{fontSize:8,letterSpacing:2,color:'#555'}}>TEST LOG</span><span className="font-mono" style={{fontSize:8,color:'#333'}}>({testLog.length})</span></div>
                    {showLog?<ChevronUp size={14} style={{color:'#555'}}/>:<ChevronDown size={14} style={{color:'#555'}}/>}
                </button>
                {showLog&&<div className="log-body">{testLog.map((e,i)=><div key={i} className="log-entry"><span className="log-time">{e.time}</span><span className="log-msg">{e.msg}</span></div>)}{testLog.length===0&&<div className="log-entry"><span className="log-msg" style={{color:'#333'}}>No data yet.</span></div>}</div>}
            </div>

            {/* FOOTER */}
            <div className="diag-footer">
                <span className="font-mono" style={{fontSize:8,color:'#333'}}>Storage: <b style={{color:diagStatus.storage==='OK'?'#22c55e':'#ef4444'}}>{diagStatus.storage}</b></span>
                <span className="font-mono" style={{fontSize:8,color:'#333'}}>Database: <b style={{color:diagStatus.db==='OK'?'#22c55e':'#ef4444'}}>{diagStatus.db}</b></span>
                <span className="font-mono" style={{fontSize:8,color:'#333'}}>Profile: <b style={{color:'#00f3ff'}}>{profile.label}</b></span>
            </div>
        </div>
    );
};

export default SpeedTest;
