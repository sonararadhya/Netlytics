import React from 'react';
import { Bot, TrendingUp, TrendingDown, Minus, Wifi, Gamepad2, Video, Tv } from 'lucide-react';

const getGrade = (dl, ul, ping, jitter, loss) => {
    let score = 0;
    if (dl >= 100) score += 30; else if (dl >= 50) score += 25; else if (dl >= 25) score += 20; else if (dl >= 10) score += 12; else score += 5;
    if (ul >= 50) score += 20; else if (ul >= 20) score += 16; else if (ul >= 10) score += 12; else if (ul >= 5) score += 8; else score += 3;
    if (ping <= 15) score += 25; else if (ping <= 30) score += 20; else if (ping <= 60) score += 14; else if (ping <= 100) score += 8; else score += 3;
    if (jitter <= 5) score += 15; else if (jitter <= 15) score += 12; else if (jitter <= 30) score += 8; else score += 3;
    if (loss <= 0) score += 10; else if (loss <= 1) score += 6; else score += 2;
    if (score >= 85) return { grade: 'A+', label: 'Exceptional', color: '#22c55e' };
    if (score >= 70) return { grade: 'A', label: 'Excellent', color: '#22c55e' };
    if (score >= 55) return { grade: 'B', label: 'Good', color: '#86efac' };
    if (score >= 40) return { grade: 'C', label: 'Average', color: '#eab308' };
    if (score >= 25) return { grade: 'D', label: 'Below Average', color: '#f97316' };
    return { grade: 'F', label: 'Poor', color: '#ef4444' };
};

const generateInsights = (dl, ul, ping, jitter, loss, isp) => {
    const insights = [];

    // Download analysis
    if (dl >= 100) insights.push({ icon: '🚀', text: `Your download speed of ${dl} Mbps is excellent — you can stream 4K on multiple devices simultaneously.` });
    else if (dl >= 50) insights.push({ icon: '✅', text: `Download speed of ${dl} Mbps is solid for HD streaming, gaming, and video calls.` });
    else if (dl >= 25) insights.push({ icon: '📺', text: `${dl} Mbps download supports HD streaming and general browsing well, but may struggle with 4K.` });
    else if (dl >= 10) insights.push({ icon: '⚠️', text: `${dl} Mbps download is adequate for basic use. Multiple devices may cause slowdowns.` });
    else if (dl > 0) insights.push({ icon: '🐌', text: `${dl} Mbps download is quite slow. Consider upgrading your plan or checking for network issues.` });

    // Upload analysis
    if (ul >= 50) insights.push({ icon: '📤', text: `Upload speed of ${ul} Mbps is exceptional — ideal for content creation and cloud backups.` });
    else if (ul >= 20) insights.push({ icon: '✅', text: `Upload at ${ul} Mbps handles video calls and file sharing with ease.` });
    else if (ul >= 5) insights.push({ icon: '📊', text: `Upload of ${ul} Mbps is sufficient for video calls but large file uploads will be slow.` });
    else if (ul > 0) insights.push({ icon: '⚠️', text: `Upload speed of ${ul} Mbps is low. Video calls may experience quality drops.` });
    else insights.push({ icon: '❌', text: `Upload test returned 0 Mbps. This may indicate a network restriction or firewall issue.` });

    // Latency
    if (ping <= 20) insights.push({ icon: '⚡', text: `Excellent latency of ${ping}ms — perfect for competitive gaming and real-time apps.` });
    else if (ping <= 50) insights.push({ icon: '🏓', text: `Latency of ${ping}ms is good for most online activities including casual gaming.` });
    else if (ping <= 100) insights.push({ icon: '🔄', text: `${ping}ms latency is acceptable but you may notice delays in fast-paced games.` });
    else insights.push({ icon: '🐢', text: `High latency of ${ping}ms will cause noticeable lag in video calls and gaming.` });

    // Jitter
    if (jitter > 30) insights.push({ icon: '📉', text: `Jitter of ${jitter}ms is high — your connection is unstable. Video calls may freeze intermittently.` });
    else if (jitter > 15) insights.push({ icon: '〰️', text: `Jitter of ${jitter}ms is moderate. You may experience occasional buffering.` });

    // Packet loss
    if (loss > 0) insights.push({ icon: '🔴', text: `${loss}% packet loss detected. This causes retransmissions and degrades overall performance.` });

    // ISP note
    if (isp && isp !== '—') insights.push({ icon: '🌐', text: `Connected via ${isp}. Speed may vary based on network congestion and time of day.` });

    return insights;
};

const getUseCaseRatings = (dl, ul, ping, jitter) => ([
    { label: 'Video Streaming', icon: Tv, rating: dl >= 25 ? 'Excellent' : dl >= 5 ? 'Good' : 'Poor', color: dl >= 25 ? '#22c55e' : dl >= 5 ? '#eab308' : '#ef4444' },
    { label: 'Online Gaming', icon: Gamepad2, rating: ping <= 30 && jitter <= 10 ? 'Excellent' : ping <= 80 ? 'Playable' : 'Poor', color: ping <= 30 && jitter <= 10 ? '#22c55e' : ping <= 80 ? '#eab308' : '#ef4444' },
    { label: 'Video Calls', icon: Video, rating: dl >= 5 && ul >= 3 && ping <= 100 ? 'Excellent' : dl >= 2 ? 'Usable' : 'Poor', color: dl >= 5 && ul >= 3 ? '#22c55e' : dl >= 2 ? '#eab308' : '#ef4444' },
    { label: 'Cloud Backup', icon: TrendingUp, rating: ul >= 20 ? 'Fast' : ul >= 5 ? 'Moderate' : 'Slow', color: ul >= 20 ? '#22c55e' : ul >= 5 ? '#eab308' : '#ef4444' },
]);

const AiAnalysis = ({ results, netInfo }) => {
    const { download, upload, ping, jitter, packetLoss } = results;
    if (!download && !upload && !ping) return null;

    const grade = getGrade(download, upload, ping, jitter, packetLoss);
    const insights = generateInsights(download, upload, ping, jitter, packetLoss, netInfo?.isp);
    const useCases = getUseCaseRatings(download, upload, ping, jitter);

    return (
        <div className="ai-panel">
            {/* Header */}
            <div className="ai-header">
                <div className="ai-bot-icon">
                    <Bot size={20} style={{ color: '#00f3ff' }} />
                </div>
                <div>
                    <h3 className="ai-title">Network Intelligence Report</h3>
                    <span className="ai-subtitle">AI-powered analysis of your connection</span>
                </div>
                <div className="ai-grade" style={{ background: grade.color + '15', borderColor: grade.color + '40', color: grade.color }}>
                    <span className="ai-grade-letter">{grade.grade}</span>
                    <span className="ai-grade-label">{grade.label}</span>
                </div>
            </div>

            {/* Use Case Ratings */}
            <div className="ai-usecases">
                {useCases.map((uc, i) => (
                    <div key={i} className="ai-usecase">
                        <uc.icon size={16} style={{ color: uc.color, opacity: 0.7 }} />
                        <span className="ai-uc-label">{uc.label}</span>
                        <span className="ai-uc-rating" style={{ color: uc.color }}>{uc.rating}</span>
                    </div>
                ))}
            </div>

            {/* Insights */}
            <div className="ai-insights">
                {insights.map((ins, i) => (
                    <div key={i} className="ai-insight">
                        <span className="ai-insight-icon">{ins.icon}</span>
                        <span className="ai-insight-text">{ins.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AiAnalysis;
