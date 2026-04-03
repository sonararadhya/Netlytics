/**
 * Netlytics V9 — Alert System
 * Configurable thresholds, browser notifications, and mailto alerts.
 */

const THRESHOLDS_KEY = 'netlytics_alert_thresholds';
const ALERT_HISTORY_KEY = 'netlytics_alert_history';

export const DEFAULT_THRESHOLDS = {
    downloadMin: 10,        // Mbps — alert if below
    uploadMin: 3,           // Mbps
    pingMax: 150,           // ms — alert if above
    jitterMax: 50,          // ms
    packetLossMax: 2,       // % — alert if above
    emailAlerts: false,
    browserAlerts: true,
    soundAlerts: false,
    email: '',
};

export const getThresholds = () => {
    try { return { ...DEFAULT_THRESHOLDS, ...JSON.parse(localStorage.getItem(THRESHOLDS_KEY) || '{}') }; }
    catch { return { ...DEFAULT_THRESHOLDS }; }
};

export const saveThresholds = (thresholds) => {
    localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
};

export const getAlertHistory = () => {
    try { return JSON.parse(localStorage.getItem(ALERT_HISTORY_KEY) || '[]'); }
    catch { return []; }
};

const saveAlert = (alert) => {
    const history = getAlertHistory();
    history.unshift(alert);
    if (history.length > 100) history.length = 100;
    localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history));
};

export const clearAlertHistory = () => {
    localStorage.setItem(ALERT_HISTORY_KEY, '[]');
};

// Check a test result against thresholds
export const checkAlerts = (result) => {
    const thresholds = getThresholds();
    const triggered = [];

    if (result.download > 0 && result.download < thresholds.downloadMin) {
        triggered.push({ type: 'download_low', severity: result.download < thresholds.downloadMin / 2 ? 'critical' : 'warning',
            message: `Download ${result.download} Mbps is below threshold of ${thresholds.downloadMin} Mbps`, metric: 'download', value: result.download, threshold: thresholds.downloadMin });
    }
    if (result.upload > 0 && result.upload < thresholds.uploadMin) {
        triggered.push({ type: 'upload_low', severity: result.upload < thresholds.uploadMin / 2 ? 'critical' : 'warning',
            message: `Upload ${result.upload} Mbps is below threshold of ${thresholds.uploadMin} Mbps`, metric: 'upload', value: result.upload, threshold: thresholds.uploadMin });
    }
    if (result.ping > thresholds.pingMax) {
        triggered.push({ type: 'ping_high', severity: result.ping > thresholds.pingMax * 2 ? 'critical' : 'warning',
            message: `Latency ${result.ping}ms exceeds threshold of ${thresholds.pingMax}ms`, metric: 'ping', value: result.ping, threshold: thresholds.pingMax });
    }
    if ((result.jitter || 0) > thresholds.jitterMax) {
        triggered.push({ type: 'jitter_high', severity: 'warning',
            message: `Jitter ${result.jitter}ms exceeds threshold of ${thresholds.jitterMax}ms`, metric: 'jitter', value: result.jitter, threshold: thresholds.jitterMax });
    }
    if ((result.packetLoss || 0) > thresholds.packetLossMax) {
        triggered.push({ type: 'loss_high', severity: result.packetLoss > 5 ? 'critical' : 'warning',
            message: `Packet loss ${result.packetLoss}% exceeds threshold of ${thresholds.packetLossMax}%`, metric: 'packetLoss', value: result.packetLoss, threshold: thresholds.packetLossMax });
    }

    // Process each triggered alert
    triggered.forEach(alert => {
        alert.timestamp = new Date().toISOString();
        alert.read = false;
        saveAlert(alert);

        if (thresholds.browserAlerts) sendBrowserNotification(alert);
        if (thresholds.emailAlerts && thresholds.email) sendEmailAlert(alert, thresholds.email);
        if (thresholds.soundAlerts) playAlertSound(alert.severity);
    });

    return triggered;
};

const sendBrowserNotification = (alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        const icon = alert.severity === 'critical' ? '🚨' : '⚠️';
        new Notification(`${icon} Netlytics Alert`, {
            body: alert.message,
            icon: '/vite.svg',
            tag: alert.type,
        });
    }
};

const sendEmailAlert = (alert, email) => {
    const subject = encodeURIComponent(`[NETLYTICS ${alert.severity.toUpperCase()}] ${alert.type.replace('_', ' ')}`);
    const body = encodeURIComponent(
        `Netlytics Network Alert\n` +
        `========================\n\n` +
        `Severity: ${alert.severity.toUpperCase()}\n` +
        `Type: ${alert.type}\n` +
        `Message: ${alert.message}\n` +
        `Value: ${alert.value}\n` +
        `Threshold: ${alert.threshold}\n` +
        `Time: ${new Date(alert.timestamp).toLocaleString()}\n\n` +
        `— Netlytics Monitoring System`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
};

const playAlertSound = (severity) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = severity === 'critical' ? 880 : 440;
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, severity === 'critical' ? 500 : 300);
    } catch (e) { /* audio not available */ }
};
