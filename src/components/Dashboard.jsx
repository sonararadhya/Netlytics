import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { t, getLang } from '../lib/i18n';
import { generatePDFReport } from '../lib/reportGenerator';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { motion } from 'framer-motion';
import { FileDown, TrendingUp, Download, Upload, Database, History, Zap, Trash2, AlertTriangle, FileText } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const Dashboard = ({ session }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('daily_speed_logs').select('*').eq('user_id', session.user.id).order('date', { ascending: false });
    if (data) {
      setLogs(data);
      setChartData(data.flatMap(day => day.tests.map(test => ({
        ...test, date: day.date,
        time: test.timestamp ? test.timestamp.split('T')[1]?.split('.')[0] : ''
      }))).reverse());
    }
    setLoading(false);
  };

  const handleGenerateReport = () => {
    if (logs.length > 0) {
      generatePDFReport(session.user, logs);
    }
  };

  const handleDeleteAll = async () => {
    const { error } = await supabase.from('daily_speed_logs').delete().eq('user_id', session.user.id);
    if (!error) { setLogs([]); setChartData([]); setConfirmDelete(false); }
  };

  const handleDeleteDay = async (id) => {
    const { error } = await supabase.from('daily_speed_logs').delete().eq('id', id);
    if (!error) fetchLogs();
  };

  const exportToXML = () => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<NetChronaixReport>\n';
    xml += `  <Metadata>\n    <User>${session.user.email}</User>\n    <ExportDate>${new Date().toISOString()}</ExportDate>\n  </Metadata>\n  <DataLog>\n`;
    logs.forEach(day => {
      xml += `    <DailyLog date="${day.date}">\n`;
      day.tests.forEach(test => {
        xml += `      <Test><Timestamp>${test.timestamp}</Timestamp><DownloadMbps>${test.download}</DownloadMbps><UploadMbps>${test.upload}</UploadMbps><PingMs>${test.ping}</PingMs><Auto>${test.is_auto}</Auto></Test>\n`;
      });
      xml += `    </DailyLog>\n`;
    });
    xml += '  </DataLog>\n</NetChronaixReport>';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
    a.download = `NetChronaix_${new Date().toISOString().split('T')[0]}.xml`;
    a.click();
  };

  if (loading) return (
    <div className="flex-center" style={{ paddingTop: 160 }}>
      <div className="flex-col-center" style={{ gap: 16 }}>
        <div className="spin" style={{ width: 40, height: 40, border: '3px solid rgba(0,243,255,0.2)', borderTopColor: 'var(--neon-cyan)', borderRadius: '50%' }}></div>
        <p className="neon-text-cyan font-orbitron pulse" style={{ fontSize: 10, letterSpacing: 6 }}>QUERYING_RECORDS...</p>
      </div>
    </div>
  );

  return (
    <motion.div className="container-main" style={{ maxWidth: 1100 }} variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20, marginBottom: 30 }}>
        <div>
          <h1 className="neon-text-purple font-orbitron" style={{ fontSize: '1.8rem', letterSpacing: -1 }}>{t('dash.title')}</h1>
          <div className="flex-center font-mono" style={{ gap: 8, fontSize: 10, color: '#555', marginTop: 6, letterSpacing: 4 }}>
            <Database size={14} className="neon-text-purple" />
            <span>HISTORICAL ANALYTICS</span>
          </div>
        </div>
        <div className="flex-center" style={{ gap: 8 }}>
          <button onClick={() => setConfirmDelete(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444', textShadow: 'none' }}>
            <Trash2 size={16} /><span>{t('dash.deleteAll')}</span>
          </button>
          <button onClick={handleGenerateReport} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.7rem', borderColor: '#22c55e', color: '#22c55e', textShadow: '0 0 10px rgba(34,197,94,0.4)' }}>
            <FileText size={16} /><span>PROOF OF SERVICE</span>
          </button>
          <button onClick={exportToXML} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.7rem', borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)', textShadow: '0 0 10px rgba(188,19,254,0.5)' }}>
            <FileDown size={16} /><span>EXPORT_XML</span>
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="glass-panel" style={{ width: '100%', padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <div className="flex-center" style={{ gap: 10 }}>
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            <span className="font-mono" style={{ fontSize: 11, color: '#ef4444' }}>This will permanently delete ALL your speed test records. Are you sure?</span>
          </div>
          <div className="flex-center" style={{ gap: 8 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#888', padding: '6px 16px', cursor: 'pointer', fontFamily: 'var(--font-header)', fontSize: 9, letterSpacing: 2 }}>{t('common.cancel')}</button>
            <button onClick={handleDeleteAll} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444', textShadow: 'none' }}>{t('common.delete')}</button>
          </div>
        </div>
      )}

      {/* Download Timeline */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ width: '100%', padding: 24, marginBottom: 20, height: 340 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span className="label-tech" style={{ color: '#888', marginBottom: 0 }}>{t('test.download')} Speed Timeline</span>
          <TrendingUp style={{ color: 'rgba(0,243,255,0.3)' }} />
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs><linearGradient id="colorDl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f3ff" stopOpacity={0.4}/><stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="5 5" stroke="#111" vertical={false} />
            <XAxis dataKey="time" stroke="#333" fontSize={10} />
            <YAxis stroke="#444" fontSize={11} tickFormatter={v => `${v}mb`} />
            <Tooltip contentStyle={{ backgroundColor: '#050510', border: '1px solid #1a1a2e', borderRadius: 4 }} itemStyle={{ color: '#00f3ff', fontWeight: 700 }} />
            <Area type="stepAfter" dataKey="download" stroke="#00f3ff" fillOpacity={1} fill="url(#colorDl)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Upload + Data Logs */}
      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }}>
        {/* Log Stream */}
        <div className="glass-panel" style={{ height: 360, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="flex-center" style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', justifyContent: 'flex-start', gap: 10 }}>
            <History size={14} style={{ color: 'var(--neon-cyan)' }} />
            <span className="font-orbitron" style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#888' }}>DATA LOG</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chartData.slice().reverse().map((test, i) => (
              <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <div className="font-mono">
                  <div style={{ color: '#555', fontSize: 9 }}>{test.time} | {test.date}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                    <span className="neon-text-cyan" style={{ fontWeight: 700 }}>{test.download}mb</span>
                    <span style={{ color: '#333' }}>/</span>
                    <span className="neon-text-purple">{test.upload}mb</span>
                  </div>
                </div>
                <span className="font-mono" style={{ fontSize: 8, fontWeight: 900, letterSpacing: 2, padding: '3px 6px', borderRadius: 3, background: test.is_auto ? 'rgba(0,243,255,0.1)' : 'rgba(255,255,255,0.03)', color: test.is_auto ? 'var(--neon-cyan)' : '#555' }}>
                  {test.is_auto ? 'AUTO' : 'USER'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + Per-day delete */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="label-tech" style={{ color: 'var(--neon-purple)' }}>Node Overview</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="glass-panel" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Max Download</div>
              <div className="neon-text-cyan font-orbitron" style={{ fontSize: 24, fontWeight: 900 }}>{chartData.length ? Math.max(...chartData.map(d => d.download || 0)).toFixed(1) : '—'}</div>
            </div>
            <div className="glass-panel" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Max Upload</div>
              <div className="neon-text-purple font-orbitron" style={{ fontSize: 24, fontWeight: 900 }}>{chartData.length ? Math.max(...chartData.map(d => d.upload || 0)).toFixed(1) : '—'}</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: '#555' }}>Total Probes:</span>
              <span className="font-mono" style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{chartData.length}</span>
            </div>
          </div>
          {/* Per-day logs with delete */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10, flex: 1, overflowY: 'auto' }}>
            <span className="font-mono" style={{ fontSize: 8, color: '#555', letterSpacing: 2, display: 'block', marginBottom: 8 }}>DAILY RECORDS</span>
            {logs.map(day => (
              <div key={day.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span className="font-mono" style={{ fontSize: 10, color: '#888' }}>{day.date} ({day.tests.length} tests)</span>
                <button onClick={() => handleDeleteDay(day.id)} className="sched-icon-btn sched-del" title="Delete this day" style={{ padding: 4 }}><Trash2 size={11} /></button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
