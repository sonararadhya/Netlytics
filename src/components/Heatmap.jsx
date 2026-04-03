import React, { useMemo } from 'react';

/**
 * Netlytics V10 — ISP Congestion Heatmap
 * Visualizes connection quality patterns across the week.
 */

const Heatmap = ({ logs }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const heatmapData = useMemo(() => {
        const grid = Array.from({ length: 7 }, () => Array(24).fill(null));
        const flatTests = logs.flatMap(day => (day.tests || []).map(t => ({ ...t, date: day.date })));

        flatTests.forEach(test => {
            const date = new Date(test.timestamp);
            const day = date.getDay();
            const hour = date.getHours();

            if (!grid[day][hour]) grid[day][hour] = { sum: 0, count: 0 };
            grid[day][hour].sum += test.download || 0;
            grid[day][hour].count += 1;
        });

        // Calculate averages and normalize
        return grid.map(dayRow => dayRow.map(cell => cell ? cell.sum / cell.count : null));
    }, [logs]);

    const maxSpeed = Math.max(...heatmapData.flat().filter(v => v !== null), 1);

    const getCellColor = (val) => {
        if (val === null) return 'rgba(255,255,255,0.02)';
        const ratio = val / maxSpeed;
        if (ratio > 0.8) return 'rgba(0, 243, 255, 0.6)'; // cyan (excellent)
        if (ratio > 0.5) return 'rgba(34, 197, 94, 0.4)'; // green (good)
        if (ratio > 0.3) return 'rgba(234, 179, 8, 0.5)'; // yellow (congested)
        return 'rgba(239, 68, 68, 0.6)'; // red (throttled)
    };

    return (
        <div className="glass-panel" style={{ width: '100%', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 className="font-orbitron" style={{ fontSize: 10, letterSpacing: 2, color: '#00f3ff' }}>ISP CONGESTION HEATMAP</h3>
                    <span className="font-mono" style={{ fontSize: 8, color: '#444' }}>DOWNLOAD PERFORMANCE BY TIME OF DAY</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="flex-center" style={{ gap: 4 }}><div style={{ width: 8, height: 8, background: 'rgba(239, 68, 68, 0.6)', borderRadius: 2 }}></div><span className="font-mono" style={{ fontSize: 7, color: '#333' }}>CONGESTED</span></div>
                    <div className="flex-center" style={{ gap: 4 }}><div style={{ width: 8, height: 8, background: 'rgba(0, 243, 255, 0.6)', borderRadius: 2 }}></div><span className="font-mono" style={{ fontSize: 7, color: '#333' }}>OPTIMAL</span></div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ width: 30 }}></div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: 6 }}>
                        {hours.filter(h => h % 4 === 0).map(h => (
                            <span key={h} className="font-mono" style={{ fontSize: 8, color: '#333' }}>{h}h</span>
                        ))}
                    </div>
                </div>

                {days.map((dayName, dIdx) => (
                    <div key={dayName} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="font-mono" style={{ width: 30, fontSize: 9, color: '#444' }}>{dayName}</span>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 3 }}>
                            {hours.map(hIdx => (
                                <div 
                                    key={hIdx} 
                                    title={heatmapData[dIdx][hIdx] ? `${heatmapData[dIdx][hIdx].toFixed(1)} Mbps` : 'No data'}
                                    style={{ 
                                        aspectRatio: '1',
                                        background: getCellColor(heatmapData[dIdx][hIdx]),
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        border: heatmapData[dIdx][hIdx] ? 'none' : '1px dashed rgba(255,255,255,0.03)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="font-mono" style={{ fontSize: 8, color: '#222', marginTop: 12, textAlign: 'center' }}>
                *Darker red indicates periods of significant speed degradation compared to your network's peak.
            </p>
        </div>
    );
};

export default Heatmap;
