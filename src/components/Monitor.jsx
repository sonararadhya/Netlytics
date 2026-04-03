import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { analyzeResults, getHealthColor, getHealthLabel } from '../lib/aiMonitor';
import { getAlertHistory, clearAlertHistory, getThresholds, saveThresholds, DEFAULT_THRESHOLDS } from '../lib/alertSystem';
import {
    Shield, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Settings,
    Bell, Trash2, Download, Upload, Zap, Activity, Bot, Eye, EyeOff, Save
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Heatmap from './Heatmap';

const Monitor = ({ session }) => {
    const [analysis, setAnalysis] = useState(null);
    const [allTests, setAllTests] = useState([]);
    const [alertHistory, setAlertHistory] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [thresholds, setThresholds] = useState(getThresholds());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const id = setInterval(() => setAlertHistory(getAlertHistory()), 15000);
        return () => clearInterval(id);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data } = await supabase.from('daily_speed_logs').select('*').eq('user_id', session.user.id).order('date', { ascending: false }).limit(30);
        if (data) {
            const tests = data.flatMap(d => d.tests || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAllTests(tests);
            setAnalysis(analyzeResults(tests));
        }
        setAlertHistory(getAlertHistory());
        setLoading(false);
    };

    const handleSaveThresholds = () => { saveThresholds(thresholds); setShowSettings(false); };
    const handleClearAlerts = () => { clearAlertHistory(); setAlertHistory([]); };

    const TrendIcon = ({ value }) => {
        const v = parseFloat(value);
        if (v > 5) return <TrendingUp size={14} style={{ color: '#22c55e' }} />;
        if (v < -5) return <TrendingDown size={14} style={{ color: '#ef4444' }} />;
        return <Minus size={14} style={{ color: '#555' }} />;
    };

    if (loading) return (
        <div className="flex-center" style={{ paddingTop: 160 }}>
            <div className="flex-col-center" style={{ gap: 16 }}>
                <div className="spin" style={{ width: 40, height: 40, border: '3px solid rgba(0,243,255,0.2)', borderTopColor: '#00f3ff', borderRadius: '50%' }}></div>
                <p className="neon-text-cyan font-orbitron pulse" style={{ fontSize: 10, letterSpacing: 6 }}>ANALYZING_NETWORK...</p>
            </div>
        </div>
    );

    const score = analysis?.score || 0;
    const scoreColor = getHealthColor(score);
    const chartData = allTests.slice(0, 30).reverse().map((t, i) => ({
        i, dl: t.download || 0, ul: t.upload || 0, ping: t.ping || 0,
        time: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : i
    }));

    return (
        <div className="container-main">
            {/* HEADER */}
            <header className="flex-col-center text-center" style={{ marginBottom: 28, gap: 8 }}>
                <div className="flex-center" style={{ gap: 12 }}>
                    <div className="header-icon-box" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)' }}>
                        <Shield style={{ color: '#22c55e' }} size={24} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h1 className="header-title" style={{ color: '#22c55e', textShadow: '0 0 12px rgba(34,197,94,0.4)' }}>AI MONITOR</h1>
                        <span className="header-sub">NETWORK INTELLIGENCE CENTER</span>
                    </div>
                </div>
            </header>

            {/* HEALTH SCORE + ALERT SUMMARY */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, width: '100%', marginBottom: 12 }}>
                {/* Health Ring */}
                <div className="glass-panel-hero flex-col-center" style={{ padding: 28 }}>
                    <div className="monitor-ring" style={{ '--ring-color': scoreColor }}>
                        <svg viewBox="0 0 120 120" style={{ width: 120, height: 120 }}>
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={`${score * 3.27} 327`} transform="rotate(-90 60 60)"
                                style={{ filter: `drop-shadow(0 0 8px ${scoreColor})`, transition: 'all 0.5s ease' }} />
                        </svg>
                        <div className="monitor-ring-text">
                            <span className="font-orbitron" style={{ fontSize: 32, fontWeight: 900, color: scoreColor }}>{score}</span>
                            <span className="font-mono" style={{ fontSize: 8, color: '#666', letterSpacing: 2 }}>{getHealthLabel(score).toUpperCase()}</span>
                        </div>
                    </div>
                    <span className="font-orbitron" style={{ fontSize: 8, letterSpacing: 3, color: '#555', marginTop: 12 }}>HEALTH SCORE</span>
                </div>

                {/* Averages + Trends */}
                <div className="glass-panel" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span className="font-orbitron" style={{ fontSize: 9, letterSpacing: 3, color: '#888' }}>AVERAGES & TRENDS</span>
                        <span className="font-mono" style={{ fontSize: 8, color: '#444' }}>{allTests.length} tests</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        <div className="monitor-avg-card">
                            <Download size={14} style={{ color: '#00f3ff', opacity: 0.5 }} />
                            <span className="font-orbitron" style={{ fontSize: 20, fontWeight: 900, color: '#00f3ff' }}>{analysis?.averages?.download?.toFixed(1) || '—'}</span>
                            <span className="font-mono" style={{ fontSize: 8, color: '#444' }}>Mbps avg</span>
                            {analysis?.trends?.download && <div className="flex-center" style={{ gap: 4 }}><TrendIcon value={analysis.trends.download} /><span className="font-mono" style={{ fontSize: 9, color: '#666' }}>{analysis.trends.download}%</span></div>}
                        </div>
                        <div className="monitor-avg-card">
                            <Upload size={14} style={{ color: '#bc13fe', opacity: 0.5 }} />
                            <span className="font-orbitron" style={{ fontSize: 20, fontWeight: 900, color: '#bc13fe' }}>{analysis?.averages?.upload?.toFixed(1) || '—'}</span>
                            <span className="font-mono" style={{ fontSize: 8, color: '#444' }}>Mbps avg</span>
                            {analysis?.trends?.upload && <div className="flex-center" style={{ gap: 4 }}><TrendIcon value={analysis.trends.upload} /><span className="font-mono" style={{ fontSize: 9, color: '#666' }}>{analysis.trends.upload}%</span></div>}
                        </div>
                        <div className="monitor-avg-card">
                            <Zap size={14} style={{ color: '#eab308', opacity: 0.5 }} />
                            <span className="font-orbitron" style={{ fontSize: 20, fontWeight: 900, color: '#eab308' }}>{analysis?.averages?.ping?.toFixed(0) || '—'}</span>
                            <span className="font-mono" style={{ fontSize: 8, color: '#444' }}>ms avg</span>
                            {analysis?.trends?.ping && <div className="flex-center" style={{ gap: 4 }}><TrendIcon value={analysis.trends.ping} /><span className="font-mono" style={{ fontSize: 9, color: '#666' }}>{analysis.trends.ping}%</span></div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* SPEED HISTORY CHART */}
            <div className="glass-panel" style={{ width: '100%', padding: '16px 20px', marginBottom: 12, height: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="font-orbitron" style={{ fontSize: 8, letterSpacing: 3, color: '#555' }}>SPEED HISTORY</span>
                    <button onClick={fetchData} className="sched-icon-btn" title="Refresh"><Activity size={12} style={{ color: '#555' }} /></button>
                </div>
                <div style={{ height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <XAxis dataKey="time" stroke="#333" fontSize={8} tickLine={false} />
                            <YAxis stroke="#333" fontSize={9} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#050510', border: '1px solid #1a1a2e', borderRadius: 4, fontSize: 11 }} />
                            <Area type="monotone" dataKey="dl" stroke="#00f3ff" fill="rgba(0,243,255,0.1)" strokeWidth={2} name="Download" />
                            <Area type="monotone" dataKey="ul" stroke="#bc13fe" fill="rgba(188,19,254,0.1)" strokeWidth={2} name="Upload" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI INSIGHTS */}
            {analysis?.insights?.length > 0 && (
                <div className="ai-panel" style={{ marginBottom: 12 }}>
                    <div className="ai-header">
                        <div className="ai-bot-icon"><Bot size={18} style={{ color: '#00f3ff' }} /></div>
                        <div><h3 className="ai-title">AI Network Report</h3><span className="ai-subtitle">Based on {allTests.length} test results</span></div>
                    </div>
                    <div className="ai-insights">
                        {analysis.insights.map((ins, i) => (
                            <div key={i} className="ai-insight" style={{ borderLeftColor: ins.type === 'critical' ? '#ef4444' : ins.type === 'warn' ? '#eab308' : ins.type === 'good' ? '#22c55e' : 'rgba(0,243,255,0.15)' }}>
                                <span className="ai-insight-icon">{ins.icon}</span>
                                <span className="ai-insight-text">{ins.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ISP CONGESTION HEATMAP */}
            <div style={{ marginBottom: 12 }}>
                <Heatmap logs={allTests.length > 0 ? [{ tests: allTests }] : []} />
            </div>

            {/* ALERT FEED + SETTINGS */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, width: '100%', marginBottom: 12 }}>
                {/* Alert feed */}
                <div className="glass-panel" style={{ padding: 16, maxHeight: 360, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
                        <div className="flex-center" style={{ gap: 8 }}>
                            <Bell size={14} style={{ color: '#eab308' }} />
                            <span className="font-orbitron" style={{ fontSize: 9, letterSpacing: 3, color: '#888' }}>ALERT FEED</span>
                            <span className="font-mono" style={{ fontSize: 9, color: '#444' }}>({alertHistory.length})</span>
                        </div>
                        {alertHistory.length > 0 && (
                            <button onClick={handleClearAlerts} className="sched-icon-btn sched-del" title="Clear all"><Trash2 size={12} /></button>
                        )}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {alertHistory.length === 0 ? (
                            <div className="text-center" style={{ padding: '20px 0' }}>
                                <CheckCircle size={20} style={{ color: '#22c55e', opacity: 0.4, marginBottom: 8 }} />
                                <p className="font-mono" style={{ fontSize: 10, color: '#444' }}>No alerts triggered. Your network looks healthy.</p>
                            </div>
                        ) : alertHistory.slice(0, 20).map((a, i) => (
                            <div key={i} className="alert-row" style={{ borderLeftColor: a.severity === 'critical' ? '#ef4444' : '#eab308' }}>
                                <AlertTriangle size={12} style={{ color: a.severity === 'critical' ? '#ef4444' : '#eab308', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p className="font-mono" style={{ fontSize: 10, color: '#aaa' }}>{a.message}</p>
                                    <span className="font-mono" style={{ fontSize: 8, color: '#333' }}>{new Date(a.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Settings */}
                <div className="glass-panel" style={{ padding: 16 }}>
                    <div className="flex-center" style={{ gap: 8, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
                        <Settings size={14} style={{ color: '#555' }} />
                        <span className="font-orbitron" style={{ fontSize: 9, letterSpacing: 2, color: '#888' }}>ALERT RULES</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <ThresholdInput label="Min Download (Mbps)" value={thresholds.downloadMin} onChange={v => setThresholds({...thresholds, downloadMin: v})} />
                        <ThresholdInput label="Min Upload (Mbps)" value={thresholds.uploadMin} onChange={v => setThresholds({...thresholds, uploadMin: v})} />
                        <ThresholdInput label="Max Latency (ms)" value={thresholds.pingMax} onChange={v => setThresholds({...thresholds, pingMax: v})} />
                        <ThresholdInput label="Max Jitter (ms)" value={thresholds.jitterMax} onChange={v => setThresholds({...thresholds, jitterMax: v})} />
                        <ThresholdInput label="Max Packet Loss (%)" value={thresholds.packetLossMax} onChange={v => setThresholds({...thresholds, packetLossMax: v})} />
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <ToggleRow label="Browser Alerts" checked={thresholds.browserAlerts} onChange={v => setThresholds({...thresholds, browserAlerts: v})} />
                            <ToggleRow label="Sound Alerts" checked={thresholds.soundAlerts} onChange={v => setThresholds({...thresholds, soundAlerts: v})} />
                            <ToggleRow label="Email Alerts" checked={thresholds.emailAlerts} onChange={v => setThresholds({...thresholds, emailAlerts: v})} />
                            {thresholds.emailAlerts && (
                                <input type="email" placeholder="your@email.com" value={thresholds.email || ''} onChange={e => setThresholds({...thresholds, email: e.target.value})} className="input-field" style={{ fontSize: 12, padding: 10 }} />
                            )}
                        </div>
                        <button onClick={handleSaveThresholds} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.75rem', letterSpacing: 2, width: '100%', borderColor: '#22c55e', color: '#22c55e', textShadow: '0 0 10px rgba(34,197,94,0.5)' }}>
                            <Save size={14} /> SAVE RULES
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ThresholdInput = ({ label, value, onChange }) => (
    <div>
        <label className="font-mono" style={{ fontSize: 9, color: '#555', display: 'block', marginBottom: 4 }}>{label}</label>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="input-field" style={{ fontSize: 13, padding: '8px 12px' }} />
    </div>
);

const ToggleRow = ({ label, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="font-mono" style={{ fontSize: 10, color: '#666' }}>{label}</span>
        <button onClick={() => onChange(!checked)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {checked ? <Eye size={16} style={{ color: '#22c55e' }} /> : <EyeOff size={16} style={{ color: '#333' }} />}
        </button>
    </div>
);

export default Monitor;
