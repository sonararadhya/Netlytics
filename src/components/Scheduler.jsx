import React, { useState, useEffect } from 'react';
import {
    getSchedules, createSchedule, deleteSchedule, toggleSchedule, editSchedule,
    startScheduleTimers, stopAllTimers, getAutoResults, clearAutoResults,
    requestNotificationPermission, getNextRunTime
} from '../lib/scheduler';
import { checkAlerts } from '../lib/alertSystem';
import { TEST_PROFILES } from '../lib/speedEngine';
import { t, getLang } from '../lib/i18n';
import {
    Clock, Trash2, ToggleLeft, ToggleRight, Bell, BellOff,
    Timer, Calendar, Plus, Download, Upload, Zap, Activity, Pencil, X, Save, AlertTriangle
} from 'lucide-react';

const INTERVAL_OPTIONS = [
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '6 hours', value: 360 },
];

const Scheduler = ({ session }) => {
    const [schedules, setSchedules] = useState([]);
    const [autoResults, setAutoResults] = useState([]);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null); // schedule id being edited
    const [newType, setNewType] = useState('interval');
    const [newInterval, setNewInterval] = useState(15);
    const [newDailyTime, setNewDailyTime] = useState('09:00');
    const [newProfile, setNewProfile] = useState('quick');
    const [running, setRunning] = useState(null);
    const [notifPermission, setNotifPermission] = useState(Notification.permission);
    const [now, setNow] = useState(Date.now());
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const handler = () => forceUpdate(n => n + 1);
        window.addEventListener('langchange', handler);
        return () => window.removeEventListener('langchange', handler);
    }, []);

    useEffect(() => {
        setSchedules(getSchedules());
        setAutoResults(getAutoResults());
        const timer = setInterval(() => { setNow(Date.now()); setAutoResults(getAutoResults()); }, 10000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            startScheduleTimers(session.user.id,
                (s) => setRunning(s.id),
                (result) => { setRunning(null); setAutoResults(getAutoResults()); setSchedules(getSchedules()); checkAlerts(result); }
            );
        }
        return () => stopAllTimers();
    }, [session, schedules.length]);

    const handleCreate = () => {
        createSchedule({ type: newType, intervalMinutes: newType === 'interval' ? newInterval : null, dailyTime: newType === 'daily' ? newDailyTime : null, testProfile: newProfile });
        setSchedules(getSchedules());
        setCreating(false);
    };

    const handleEdit = (s) => {
        setEditing(s.id);
        setNewType(s.type);
        setNewInterval(s.intervalMinutes || 15);
        setNewDailyTime(s.dailyTime || '09:00');
        setNewProfile(s.testProfile || 'quick');
    };

    const handleSaveEdit = () => {
        editSchedule(editing, {
            type: newType,
            intervalMinutes: newType === 'interval' ? newInterval : null,
            dailyTime: newType === 'daily' ? newDailyTime : null,
            testProfile: newProfile,
        });
        setSchedules(getSchedules());
        setEditing(null);
    };

    const handleDelete = (id) => { deleteSchedule(id); setSchedules(getSchedules()); };
    const handleToggle = (id) => { toggleSchedule(id); setSchedules(getSchedules()); };
    const handleClearHistory = () => { clearAutoResults(); setAutoResults([]); };

    const formatCountdown = (schedule) => {
        const next = getNextRunTime(schedule);
        if (!next) return '—';
        const diff = next.getTime() - now;
        if (diff <= 0) return 'Running...';
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        if (mins > 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
        return `${mins}m ${secs}s`;
    };

    // Background info note
    const backgroundNote = "⚠️ Schedules only run while this browser tab is open. For true background scheduling, install this site as a PWA (Add to Home Screen).";

    return (
        <div className="container-main">
            <header className="flex-col-center text-center" style={{ marginBottom: 28, gap: 8 }}>
                <div className="flex-center" style={{ gap: 12 }}>
                    <div className="header-icon-box" style={{ background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.2)' }}>
                        <Clock style={{ color: '#eab308' }} size={24} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h1 className="header-title" style={{ color: '#eab308', textShadow: '0 0 12px rgba(234,179,8,0.4)' }}>{t('sched.title')}</h1>
                        <span className="header-sub">{t('sched.subtitle')}</span>
                    </div>
                </div>
            </header>

            {/* Background warning */}
            <div className="glass-panel" style={{ width: '100%', padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, borderColor: 'rgba(234,179,8,0.15)' }}>
                <AlertTriangle size={14} style={{ color: '#eab308', flexShrink: 0 }} />
                <span className="font-mono" style={{ fontSize: 10, color: '#888', lineHeight: 1.5 }}>{backgroundNote}</span>
            </div>

            {notifPermission !== 'granted' && (
                <div className="glass-panel" style={{ width: '100%', padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="flex-center" style={{ gap: 8 }}><BellOff size={14} style={{ color: '#eab308' }} /><span className="font-mono" style={{ fontSize: 10, color: '#888' }}>Enable notifications for auto-test alerts</span></div>
                    <button onClick={async () => setNotifPermission(await requestNotificationPermission())} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.65rem', letterSpacing: 2 }}>{t('common.enable')}</button>
                </div>
            )}

            {/* ACTIVE SCHEDULES */}
            <div className="glass-panel" style={{ width: '100%', padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
                    <div className="flex-center" style={{ gap: 8 }}>
                        <Timer size={14} style={{ color: '#eab308' }} />
                        <span className="font-orbitron" style={{ fontSize: 9, letterSpacing: 2, color: '#888' }}>{t('sched.active')}</span>
                        <span className="font-mono" style={{ fontSize: 9, color: '#444' }}>({schedules.length})</span>
                    </div>
                    <button onClick={() => { setCreating(true); setEditing(null); }} className="sched-add-btn"><Plus size={14} /><span>NEW</span></button>
                </div>

                {schedules.length === 0 && (
                    <div className="text-center" style={{ padding: '24px 0', color: '#333' }}>
                        <Clock size={28} style={{ opacity: 0.2, marginBottom: 10 }} />
                        <p className="font-mono" style={{ fontSize: 10, color: '#444' }}>{t('sched.noSchedules')}</p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {schedules.map(s => (
                        <div key={s.id}>
                            {/* CARD */}
                            {editing !== s.id ? (
                                <div className={`sched-card ${running === s.id ? 'sched-running' : ''} ${!s.enabled ? 'sched-disabled' : ''}`}>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex-center" style={{ gap: 8, justifyContent: 'flex-start' }}>
                                            {s.type === 'interval' ? <Timer size={13} style={{ color: '#eab308' }} /> : <Calendar size={13} style={{ color: '#bc13fe' }} />}
                                            <span className="font-orbitron" style={{ fontSize: 10, color: '#ccc', letterSpacing: 1 }}>
                                                {s.type === 'interval' ? `Every ${s.intervalMinutes} min` : `Daily at ${s.dailyTime}`}
                                            </span>
                                            <span className="sched-profile-badge">{(TEST_PROFILES[s.testProfile]?.label || 'QUICK')}</span>
                                        </div>
                                        <div className="flex-center" style={{ gap: 14, marginTop: 5, justifyContent: 'flex-start' }}>
                                            <span className="font-mono" style={{ fontSize: 9, color: '#444' }}>Next: <b style={{ color: s.enabled ? '#eab308' : '#333' }}>{s.enabled ? formatCountdown(s) : 'Paused'}</b></span>
                                            {s.lastRun && <span className="font-mono" style={{ fontSize: 9, color: '#333' }}>Last: {new Date(s.lastRun).toLocaleTimeString()}</span>}
                                            {running === s.id && <span className="font-mono pulse" style={{ fontSize: 9, color: '#00f3ff' }}>⚡ RUNNING</span>}
                                        </div>
                                    </div>
                                    <div className="flex-center" style={{ gap: 4 }}>
                                        <button onClick={() => handleEdit(s)} className="sched-icon-btn" title={t('common.edit')}><Pencil size={13} style={{ color: '#888' }} /></button>
                                        <button onClick={() => handleToggle(s.id)} className="sched-icon-btn" title={s.enabled ? 'Pause' : 'Resume'}>
                                            {s.enabled ? <ToggleRight size={17} style={{ color: '#22c55e' }} /> : <ToggleLeft size={17} style={{ color: '#555' }} />}
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} className="sched-icon-btn sched-del" title={t('common.delete')}><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            ) : (
                                /* EDIT INLINE */
                                <div className="glass-panel-hero" style={{ padding: 16 }}>
                                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span className="font-orbitron" style={{ fontSize: 10, letterSpacing: 2, color: '#eab308' }}>{t('common.edit')}</span>
                                        <button onClick={() => setEditing(null)} className="sched-icon-btn"><X size={14} style={{ color: '#555' }} /></button>
                                    </div>
                                    <ScheduleForm type={newType} setType={setNewType} interval={newInterval} setInterval={setNewInterval} dailyTime={newDailyTime} setDailyTime={setNewDailyTime} profile={newProfile} setProfile={setNewProfile} />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
                                        <button onClick={() => setEditing(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#555', padding: '8px 18px', cursor: 'pointer', fontFamily: 'var(--font-header)', fontSize: 9, letterSpacing: 2 }}>{t('common.cancel')}</button>
                                        <button onClick={handleSaveEdit} className="btn-primary" style={{ padding: '8px 22px', fontSize: '0.7rem', borderColor: '#eab308', color: '#eab308', textShadow: '0 0 10px rgba(234,179,8,0.5)' }}><Save size={12} /> {t('common.save')}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* CREATE NEW */}
            {creating && !editing && (
                <div className="glass-panel-hero" style={{ width: '100%', padding: 20, marginBottom: 12 }}>
                    <h3 className="font-orbitron" style={{ fontSize: 10, letterSpacing: 3, color: '#eab308', marginBottom: 14 }}>{t('sched.new')}</h3>
                    <ScheduleForm type={newType} setType={setNewType} interval={newInterval} setInterval={setNewInterval} dailyTime={newDailyTime} setDailyTime={setNewDailyTime} profile={newProfile} setProfile={setNewProfile} />
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                        <button onClick={() => setCreating(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#555', padding: '8px 20px', cursor: 'pointer', fontFamily: 'var(--font-header)', fontSize: 9, letterSpacing: 2 }}>{t('common.cancel')}</button>
                        <button onClick={handleCreate} className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.75rem', borderColor: '#eab308', color: '#eab308', textShadow: '0 0 10px rgba(234,179,8,0.5)' }}>CREATE</button>
                    </div>
                </div>
            )}

            {/* HISTORY */}
            <div className="glass-panel" style={{ width: '100%', padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
                    <div className="flex-center" style={{ gap: 8 }}>
                        <Activity size={14} style={{ color: '#00f3ff' }} />
                        <span className="font-orbitron" style={{ fontSize: 9, letterSpacing: 2, color: '#888' }}>{t('sched.history')}</span>
                        <span className="font-mono" style={{ fontSize: 9, color: '#444' }}>{autoResults.length} {t('common.results')}</span>
                    </div>
                    {autoResults.length > 0 && (
                        <button onClick={handleClearHistory} className="sched-icon-btn sched-del" title={t('sched.deleteAll')}>
                            <Trash2 size={12} /> <span className="font-mono" style={{ fontSize: 8, color: '#888', marginLeft: 4 }}>{t('sched.deleteAll')}</span>
                        </button>
                    )}
                </div>
                {autoResults.length === 0 ? (
                    <div className="text-center" style={{ padding: '16px 0' }}><p className="font-mono" style={{ fontSize: 10, color: '#444' }}>No auto tests yet.</p></div>
                ) : (
                    <div className="sched-results-list">
                        {autoResults.slice(0, 30).map((r, i) => (
                            <div key={i} className="sched-result-row">
                                <span className="font-mono" style={{ fontSize: 9, color: '#444', minWidth: 60 }}>{new Date(r.timestamp).toLocaleTimeString()}</span>
                                <div className="flex-center" style={{ gap: 10 }}>
                                    <span className="flex-center" style={{ gap: 3 }}><Download size={10} style={{ color: '#00f3ff' }} /><span className="font-mono" style={{ fontSize: 10, color: '#00f3ff', fontWeight: 700 }}>{r.download}</span></span>
                                    <span className="flex-center" style={{ gap: 3 }}><Upload size={10} style={{ color: '#bc13fe' }} /><span className="font-mono" style={{ fontSize: 10, color: '#bc13fe', fontWeight: 700 }}>{r.upload}</span></span>
                                    <span className="flex-center" style={{ gap: 3 }}><Zap size={10} style={{ color: '#eab308' }} /><span className="font-mono" style={{ fontSize: 10, color: '#eab308' }}>{r.ping}ms</span></span>
                                </div>
                                <span className="font-mono" style={{ fontSize: 8, color: '#333' }}>{r.scheduleName || r.profile}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable form for both create + edit
const ScheduleForm = ({ type, setType, interval, setInterval, dailyTime, setDailyTime, profile, setProfile }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
            <label className="label-tech">Type</label>
            <div className="mode-selector">
                <button className={`mode-btn ${type === 'interval' ? 'active' : ''}`} onClick={() => setType('interval')} style={type === 'interval' ? { borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)', color: '#eab308' } : {}}>
                    <span className="mode-label">INTERVAL</span><span className="mode-duration">Repeating</span>
                </button>
                <button className={`mode-btn ${type === 'daily' ? 'active' : ''}`} onClick={() => setType('daily')} style={type === 'daily' ? { borderColor: 'rgba(188,19,254,0.3)', background: 'rgba(188,19,254,0.08)', color: '#bc13fe' } : {}}>
                    <span className="mode-label">DAILY</span><span className="mode-duration">Specific time</span>
                </button>
            </div>
        </div>
        {type === 'interval' ? (
            <div>
                <label className="label-tech">Frequency</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {INTERVAL_OPTIONS.map(opt => (
                        <button key={opt.value} className={`sched-freq-btn ${interval === opt.value ? 'active' : ''}`} onClick={() => setInterval(opt.value)}>{opt.label}</button>
                    ))}
                </div>
            </div>
        ) : (
            <div>
                <label className="label-tech">Time</label>
                <input type="time" value={dailyTime} onChange={e => setDailyTime(e.target.value)} className="input-field" style={{ maxWidth: 180 }} />
            </div>
        )}
        <div>
            <label className="label-tech">Test Profile</label>
            <div className="mode-selector">
                {Object.entries(TEST_PROFILES).map(([k, p]) => (
                    <button key={k} className={`mode-btn ${profile === k ? 'active' : ''}`} onClick={() => setProfile(k)}>
                        <span className="mode-label">{p.label}</span><span className="mode-duration">{p.duration}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default Scheduler;
