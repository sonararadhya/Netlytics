/**
 * Netlytics V9 — AI Monitor Engine
 * Anomaly detection, trend analysis, and health scoring.
 */

export const analyzeResults = (results) => {
    if (!results || results.length < 2) return { score: 0, alerts: [], trends: {}, insights: [] };

    const recent = results.slice(0, 10);
    const avgDl = avg(recent.map(r => r.download));
    const avgUl = avg(recent.map(r => r.upload));
    const avgPing = avg(recent.map(r => r.ping));
    const avgJitter = avg(recent.map(r => r.jitter || 0));
    const avgLoss = avg(recent.map(r => r.packetLoss || 0));

    // Detect anomalies
    const alerts = [];
    const latest = results[0];

    if (latest.download > 0 && avgDl > 0 && latest.download < avgDl * 0.6) {
        alerts.push({ type: 'speed_drop', severity: latest.download < avgDl * 0.3 ? 'critical' : 'warning', metric: 'download',
            message: `Download dropped to ${latest.download} Mbps (avg: ${avgDl.toFixed(1)} Mbps)`, value: latest.download, avg: avgDl, timestamp: latest.timestamp });
    }
    if (latest.upload > 0 && avgUl > 0 && latest.upload < avgUl * 0.6) {
        alerts.push({ type: 'speed_drop', severity: latest.upload < avgUl * 0.3 ? 'critical' : 'warning', metric: 'upload',
            message: `Upload dropped to ${latest.upload} Mbps (avg: ${avgUl.toFixed(1)} Mbps)`, value: latest.upload, avg: avgUl, timestamp: latest.timestamp });
    }
    if (latest.ping > 0 && avgPing > 0 && latest.ping > avgPing * 2) {
        alerts.push({ type: 'latency_spike', severity: latest.ping > avgPing * 3 ? 'critical' : 'warning', metric: 'ping',
            message: `Latency spiked to ${latest.ping}ms (avg: ${avgPing.toFixed(1)}ms)`, value: latest.ping, avg: avgPing, timestamp: latest.timestamp });
    }
    if ((latest.packetLoss || 0) > 2) {
        alerts.push({ type: 'packet_loss', severity: latest.packetLoss > 5 ? 'critical' : 'warning', metric: 'packetLoss',
            message: `Packet loss at ${latest.packetLoss}%`, value: latest.packetLoss, timestamp: latest.timestamp });
    }
    if ((latest.jitter || 0) > 30) {
        alerts.push({ type: 'jitter_spike', severity: latest.jitter > 50 ? 'critical' : 'warning', metric: 'jitter',
            message: `High jitter: ${latest.jitter}ms`, value: latest.jitter, timestamp: latest.timestamp });
    }

    // Trend analysis (last 10 vs previous 10)
    const older = results.slice(10, 20);
    const trends = {};
    if (older.length >= 3) {
        const olderAvgDl = avg(older.map(r => r.download));
        const olderAvgUl = avg(older.map(r => r.upload));
        const olderAvgPing = avg(older.map(r => r.ping));
        trends.download = olderAvgDl > 0 ? ((avgDl - olderAvgDl) / olderAvgDl * 100).toFixed(1) : 0;
        trends.upload = olderAvgUl > 0 ? ((avgUl - olderAvgUl) / olderAvgUl * 100).toFixed(1) : 0;
        trends.ping = olderAvgPing > 0 ? ((avgPing - olderAvgPing) / olderAvgPing * 100).toFixed(1) : 0;
    }

    // Health score (0-100)
    let score = 50;
    if (avgDl >= 50) score += 15; else if (avgDl >= 25) score += 10; else if (avgDl >= 10) score += 5;
    if (avgUl >= 20) score += 10; else if (avgUl >= 5) score += 5;
    if (avgPing <= 30) score += 10; else if (avgPing <= 60) score += 5; else if (avgPing > 100) score -= 10;
    if (avgJitter <= 10) score += 5; else if (avgJitter > 30) score -= 10;
    if (avgLoss <= 0) score += 5; else if (avgLoss > 2) score -= 10;
    if (alerts.filter(a => a.severity === 'critical').length > 0) score -= 15;
    if (alerts.filter(a => a.severity === 'warning').length > 0) score -= 5;
    score = Math.max(0, Math.min(100, score));

    // Insights
    const insights = generateInsights(avgDl, avgUl, avgPing, avgJitter, avgLoss, trends, results.length);

    return { score, alerts, trends, insights, averages: { download: avgDl, upload: avgUl, ping: avgPing, jitter: avgJitter, packetLoss: avgLoss } };
};

const generateInsights = (dl, ul, ping, jitter, loss, trends, totalTests) => {
    const out = [];
    if (totalTests < 5) out.push({ icon: '📊', text: `Only ${totalTests} tests recorded. Run more tests for accurate analysis.`, type: 'info' });
    if (dl >= 50) out.push({ icon: '🚀', text: `Average download of ${dl.toFixed(1)} Mbps is excellent for all use cases.`, type: 'good' });
    else if (dl >= 25) out.push({ icon: '✅', text: `Average download of ${dl.toFixed(1)} Mbps handles HD streaming well.`, type: 'good' });
    else if (dl < 10) out.push({ icon: '⚠️', text: `Average download of ${dl.toFixed(1)} Mbps is below standard. Consider upgrading.`, type: 'warn' });
    if (ul < 3) out.push({ icon: '⬆️', text: `Low average upload (${ul.toFixed(1)} Mbps) may affect video calls.`, type: 'warn' });
    if (ping > 80) out.push({ icon: '🏓', text: `Average latency of ${ping.toFixed(0)}ms is high for gaming.`, type: 'warn' });
    if (jitter > 20) out.push({ icon: '〰️', text: `Average jitter of ${jitter.toFixed(1)}ms indicates unstable connection.`, type: 'warn' });
    if (loss > 1) out.push({ icon: '🔴', text: `Packet loss averages ${loss.toFixed(1)}% — this degrades quality.`, type: 'critical' });
    if (trends.download > 10) out.push({ icon: '📈', text: `Download speed trending up ${trends.download}% vs previous period.`, type: 'good' });
    if (trends.download < -10) out.push({ icon: '📉', text: `Download speed trending down ${Math.abs(trends.download)}% vs previous period.`, type: 'warn' });
    if (jitter <= 5 && ping <= 30 && loss <= 0) out.push({ icon: '🎮', text: 'Network conditions are ideal for competitive gaming and real-time apps.', type: 'good' });
    return out;
};

// Helpers
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const getHealthColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#86efac';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
};

export const getHealthLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    if (score >= 20) return 'Poor';
    return 'Critical';
};
