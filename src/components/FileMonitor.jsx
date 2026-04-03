import React, { useState, useRef } from 'react';
import {
    Download, Play, Square, Link2, Clock, Gauge, BarChart3, AlertCircle, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const FileMonitor = ({ session }) => {
    const [url, setUrl] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [avgSpeed, setAvgSpeed] = useState(0);
    const [peakSpeed, setPeakSpeed] = useState(0);
    const [downloaded, setDownloaded] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [eta, setEta] = useState(0);
    const [speedData, setSpeedData] = useState([]);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState(null);
    const xhrRef = useRef(null);
    const timerRef = useRef(null);

    const formatSize = (bytes) => {
        if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
        if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
        if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
        return bytes + ' B';
    };

    const formatTime = (seconds) => {
        if (seconds <= 0 || !isFinite(seconds)) return '—';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const startDownload = () => {
        if (!url.trim()) return;
        setDownloading(true); setComplete(false); setError(null);
        setProgress(0); setCurrentSpeed(0); setAvgSpeed(0); setPeakSpeed(0);
        setDownloaded(0); setTotalSize(0); setElapsed(0); setEta(0); setSpeedData([]);

        const startTime = performance.now();
        let lastLoaded = 0;
        let lastTime = startTime;
        let peak = 0;
        const speeds = [];

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        timerRef.current = setInterval(() => {
            setElapsed((performance.now() - startTime) / 1000);
        }, 500);

        xhr.onprogress = (e) => {
            const now = performance.now();
            const dt = (now - lastTime) / 1000;
            const dBytes = e.loaded - lastLoaded;

            if (dt > 0.2 && dBytes > 0) {
                const speedMbps = parseFloat(((dBytes * 8) / dt / 1e6).toFixed(2));
                const totalElapsed = (now - startTime) / 1000;
                const avgMbps = parseFloat(((e.loaded * 8) / totalElapsed / 1e6).toFixed(2));

                speeds.push(speedMbps);
                if (speedMbps > peak) peak = speedMbps;

                const total = e.lengthComputable ? e.total : 0;
                const pct = total > 0 ? Math.round((e.loaded / total) * 100) : 0;
                const remaining = total > 0 && avgMbps > 0 ? ((total - e.loaded) * 8) / (avgMbps * 1e6) : 0;

                setCurrentSpeed(speedMbps);
                setAvgSpeed(avgMbps);
                setPeakSpeed(peak);
                setDownloaded(e.loaded);
                setTotalSize(total);
                setProgress(pct);
                setEta(remaining);
                setSpeedData(prev => [...prev.slice(-120), { t: Date.now(), v: speedMbps }]);

                lastLoaded = e.loaded;
                lastTime = now;
            }
        };

        xhr.onload = () => {
            clearInterval(timerRef.current);
            const totalElapsed = (performance.now() - startTime) / 1000;
            const finalSize = xhr.response?.size || 0;
            const finalAvg = parseFloat(((finalSize * 8) / totalElapsed / 1e6).toFixed(2));
            setDownloaded(finalSize);
            setAvgSpeed(finalAvg);
            setProgress(100);
            setElapsed(totalElapsed);
            setCurrentSpeed(0);
            setComplete(true);
            setDownloading(false);
        };

        xhr.onerror = () => {
            clearInterval(timerRef.current);
            setError('Download failed. Check URL or CORS policy.');
            setDownloading(false);
        };

        xhr.ontimeout = () => {
            clearInterval(timerRef.current);
            setError('Download timed out.');
            setDownloading(false);
        };

        xhr.timeout = 300000; // 5 min
        xhr.send();
    };

    const stopDownload = () => {
        if (xhrRef.current) xhrRef.current.abort();
        clearInterval(timerRef.current);
        setDownloading(false);
    };

    const phaseColor = downloading ? '#00f3ff' : complete ? '#22c55e' : '#555';

    return (
        <div className="container-main">
            {/* HEADER */}
            <header className="flex-col-center text-center" style={{ marginBottom: 28, gap: 8 }}>
                <div className="flex-center" style={{ gap: 12 }}>
                    <div className="header-icon-box" style={{ background: 'rgba(0,243,255,0.1)', borderColor: 'rgba(0,243,255,0.2)' }}>
                        <Download style={{ color: '#00f3ff' }} size={24} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h1 className="header-title">FILE MONITOR</h1>
                        <span className="header-sub">REAL-TIME DOWNLOAD TRACKER</span>
                    </div>
                </div>
            </header>

            {/* URL INPUT */}
            <div className="glass-panel" style={{ width: '100%', padding: 20, marginBottom: 16 }}>
                <label className="label-tech">File URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="input-field" placeholder="https://example.com/large-file.zip" disabled={downloading} style={{ paddingLeft: 36 }} />
                        <Link2 size={14} style={{ position: 'absolute', left: 12, top: 16, color: '#444' }} />
                    </div>
                    {downloading ? (
                        <button onClick={stopDownload} className="btn-primary" style={{ padding: '14px 24px', borderColor: '#ef4444', color: '#ef4444', textShadow: 'none' }}>
                            <Square size={16} /> STOP
                        </button>
                    ) : (
                        <button onClick={startDownload} className="btn-primary" style={{ padding: '14px 24px' }} disabled={!url.trim()}>
                            <Play size={16} /> START
                        </button>
                    )}
                </div>
                {error && <div style={{ marginTop: 10, padding: 10, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', borderRadius: 4, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={14} style={{ color: '#ef4444' }} /><span className="font-mono" style={{ fontSize: 10, color: '#ef4444' }}>{error}</span></div>}
            </div>

            {/* LIVE METRICS */}
            <div className="results-row" style={{ marginBottom: 12 }}>
                <div className="result-card result-dl">
                    <Gauge size={18} style={{ color: phaseColor, opacity: 0.5 }} />
                    <span className="result-label">Current Speed</span>
                    <div className="result-value-row">
                        <span className="result-value" style={{ color: phaseColor, textShadow: `0 0 12px ${phaseColor}40` }}>{downloading ? currentSpeed : complete ? avgSpeed : '—'}</span>
                        <span className="result-unit">Mbps</span>
                    </div>
                </div>
                <div className="result-card" style={{ borderTop: '3px solid #bc13fe' }}>
                    <TrendingUp size={18} style={{ color: '#bc13fe', opacity: 0.5 }} />
                    <span className="result-label">Peak Speed</span>
                    <div className="result-value-row">
                        <span className="result-value" style={{ color: '#bc13fe', textShadow: '0 0 12px rgba(188,19,254,0.4)' }}>{peakSpeed || '—'}</span>
                        <span className="result-unit">Mbps</span>
                    </div>
                </div>
                <div className="result-card" style={{ borderTop: '3px solid #eab308' }}>
                    <Clock size={18} style={{ color: '#eab308', opacity: 0.5 }} />
                    <span className="result-label">{complete ? 'Total Time' : 'ETA'}</span>
                    <div className="result-value-row">
                        <span className="result-value" style={{ color: '#eab308', textShadow: '0 0 12px rgba(234,179,8,0.4)', fontSize: 28 }}>{complete ? formatTime(elapsed) : formatTime(eta)}</span>
                    </div>
                </div>
            </div>

            {/* PROGRESS */}
            <div className="glass-panel" style={{ width: '100%', padding: '16px 20px', marginBottom: 12 }}>
                <div className="progress-label">
                    <span>{formatSize(downloaded)}{totalSize > 0 ? ` / ${formatSize(totalSize)}` : ''}</span>
                    <span>{progress}%</span>
                </div>
                <div className="progress-bar-track" style={{ height: 6, borderRadius: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, background: phaseColor, boxShadow: `0 0 15px ${phaseColor}`, borderRadius: 6, transition: 'width 0.3s ease' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span className="font-mono" style={{ fontSize: 9, color: '#444' }}>Elapsed: {formatTime(elapsed)}</span>
                    <span className="font-mono" style={{ fontSize: 9, color: '#444' }}>Avg: {avgSpeed} Mbps</span>
                </div>
            </div>

            {/* SPEED GRAPH */}
            <div className="glass-panel" style={{ width: '100%', padding: '12px 16px', height: 140 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div className="flex-center" style={{ gap: 6 }}>
                        <BarChart3 size={12} style={{ color: phaseColor }} />
                        <span className="font-orbitron" style={{ fontSize: 8, letterSpacing: 2, color: '#555' }}>DOWNLOAD SPEED GRAPH</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: 8, color: '#333' }}>{speedData.length} samples</span>
                </div>
                <div style={{ height: 95 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={speedData}>
                            <YAxis hide domain={[0, 'auto']} />
                            <Area type="monotone" dataKey="v" stroke={phaseColor} fillOpacity={0.1} fill={phaseColor} strokeWidth={2} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* COMPLETION REPORT */}
            {complete && (
                <div className="ai-panel" style={{ marginTop: 12 }}>
                    <div className="ai-header">
                        <div className="ai-bot-icon" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)' }}>
                            <Download size={18} style={{ color: '#22c55e' }} />
                        </div>
                        <div>
                            <h3 className="ai-title">Download Complete</h3>
                            <span className="ai-subtitle">Analysis of download performance</span>
                        </div>
                    </div>
                    <div className="ai-insights">
                        <div className="ai-insight" style={{ borderLeftColor: '#22c55e' }}>
                            <span className="ai-insight-icon">📦</span>
                            <span className="ai-insight-text">Downloaded <b>{formatSize(downloaded)}</b> in <b>{formatTime(elapsed)}</b></span>
                        </div>
                        <div className="ai-insight" style={{ borderLeftColor: '#00f3ff' }}>
                            <span className="ai-insight-icon">📊</span>
                            <span className="ai-insight-text">Average speed: <b>{avgSpeed} Mbps</b> | Peak: <b>{peakSpeed} Mbps</b></span>
                        </div>
                        <div className="ai-insight">
                            <span className="ai-insight-icon">{avgSpeed >= 25 ? '🚀' : avgSpeed >= 10 ? '✅' : '⚠️'}</span>
                            <span className="ai-insight-text">
                                {avgSpeed >= 25 ? 'Excellent download performance. Your connection handled this file efficiently.' :
                                 avgSpeed >= 10 ? 'Decent download speed. Larger files should complete in reasonable time.' :
                                 'Slow download detected. Your connection may be throttled or congested.'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileMonitor;
