import { supabase } from './supabaseClient';

/**
 * Netlytics V8.2 — Industry-Grade Speed Engine
 * Upload uses fetch with mode:'no-cors' to Cloudflare __up (bypasses CORS preflight).
 */

export const TEST_PROFILES = {
    quick:    { label: 'QUICK',    duration: '~5s',  pingSamples: 5,  dlRounds: [{ size: 1e6, count: 2 }], ulSizes: [2e6] },
    standard: { label: 'STANDARD', duration: '~10s', pingSamples: 10, dlRounds: [{ size: 1e6, count: 3 }, { size: 10e6, count: 2 }], ulSizes: [5e6, 10e6] },
    deep:     { label: 'DEEP',     duration: '~20s', pingSamples: 20, dlRounds: [{ size: 1e5, count: 3 }, { size: 1e6, count: 4 }, { size: 10e6, count: 3 }, { size: 25e6, count: 2 }], ulSizes: [5e6, 10e6, 25e6] },
    gaming:   { label: 'GAMING',   duration: '~15s', pingSamples: 60, dlRounds: [{ size: 1e5, count: 5 }], ulSizes: [1e6] },
    streaming:{ label: 'STREAMING',duration: '~25s', pingSamples: 5,  dlRounds: [{ size: 10e6, count: 3 }, { size: 25e6, count: 3 }, { size: 50e6, count: 2 }], ulSizes: [10e6, 25e6] },
};

// ==============================================
// NETWORK INFO
// ==============================================
export const fetchNetworkInfo = async () => {
    try {
        const res = await fetch('https://ipinfo.io/json?token=');
        if (!res.ok) throw new Error();
        const d = await res.json();
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return {
            ip: d.ip || '—', isp: d.org || '—', city: d.city || '—',
            region: d.region || '—', country: d.country || '—',
            connectionType: conn ? (conn.effectiveType || conn.type || 'Unknown') : 'Unknown',
            ipVersion: d.ip && d.ip.includes(':') ? 'IPv6' : 'IPv4',
        };
    } catch {
        try {
            const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
            const text = await res.text();
            const l = Object.fromEntries(text.trim().split('\n').map(s => s.split('=')));
            return { ip: l.ip||'—', isp: '—', city: l.loc||'—', region: '—', country: l.loc||'—', connectionType: (navigator.connection||{}).effectiveType||'Unknown', ipVersion: (l.ip||'').includes(':')?'IPv6':'IPv4' };
        } catch { return { ip:'—',isp:'—',city:'—',region:'—',country:'—',connectionType:'Unknown',ipVersion:'—' }; }
    }
};

// ==============================================
// LATENCY & JITTER
// ==============================================
export const measureLatency = async (sampleCount, onProgress) => {
    const samples = [];
    const targets = ['https://www.google.com/favicon.ico','https://www.cloudflare.com/favicon.ico','https://www.gstatic.com/images/branding/product/1x/chrome_48dp.png'];
    for (let i = 0; i < sampleCount; i++) {
        const start = performance.now();
        try {
            await fetch(targets[i%targets.length]+'?t='+Date.now(), { mode:'no-cors', cache:'no-store' });
            const lat = performance.now() - start;
            if (lat > 0 && lat < 5000) samples.push(lat);
        } catch {}
        onProgress?.({ percent: Math.round(((i+1)/sampleCount)*100), currentPing: samples.length>0?Math.round(samples[samples.length-1]):0 });
        await new Promise(r=>setTimeout(r,80));
    }
    if (!samples.length) return { ping:0,jitter:0,min:0,max:0,samples:0,packetLoss:100 };
    const avg = samples.reduce((a,b)=>a+b,0)/samples.length;
    const jitter = Math.sqrt(samples.reduce((s,v)=>s+Math.pow(v-avg,2),0)/samples.length);
    return {
        ping: parseFloat(avg.toFixed(1)), jitter: parseFloat(jitter.toFixed(1)),
        min: parseFloat(Math.min(...samples).toFixed(1)), max: parseFloat(Math.max(...samples).toFixed(1)),
        samples: samples.length, packetLoss: parseFloat((((sampleCount-samples.length)/sampleCount)*100).toFixed(1)),
    };
};

// ==============================================
// DOWNLOAD
// ==============================================
export const measureDownload = async (rounds, onProgress) => {
    const allSpeeds = [];
    let totalDone = 0;
    const totalRounds = rounds.reduce((s,r)=>s+r.count,0);
    for (const round of rounds) {
        for (let i = 0; i < round.count; i++) {
            const speed = await downloadSingle(`https://speed.cloudflare.com/__down?bytes=${round.size}&t=${Date.now()}`, round.size, (p) => {
                onProgress?.({ mbps:p.mbps, percent:Math.round(((totalDone+(p.percent/100))/totalRounds)*100), roundInfo:`${round.size>=1e6?Math.round(round.size/1e6)+'MB':Math.round(round.size/1e3)+'KB'} #${i+1}` });
            });
            if (speed > 0) allSpeeds.push(speed);
            totalDone++;
        }
    }
    if (!allSpeeds.length) return 0;
    if (allSpeeds.length > 3) { allSpeeds.sort((a,b)=>a-b); allSpeeds.shift(); allSpeeds.pop(); }
    return parseFloat((allSpeeds.reduce((a,b)=>a+b,0)/allSpeeds.length).toFixed(2));
};

const downloadSingle = (url, expectedSize, onProgress) => new Promise(resolve => {
    const start = performance.now();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onprogress = (e) => {
        const total = e.lengthComputable ? e.total : expectedSize;
        const elapsed = (performance.now()-start)/1000;
        if (elapsed > 0.05 && e.loaded > 0) {
            onProgress({ mbps: parseFloat(((e.loaded*8)/elapsed/1e6).toFixed(2)), percent: Math.round((e.loaded/total)*100) });
        }
    };
    xhr.onload = () => {
        const dur = (performance.now()-start)/1000;
        resolve(dur>0&&xhr.response ? parseFloat(((xhr.response.size*8)/dur/1e6).toFixed(2)) : 0);
    };
    xhr.onerror = () => resolve(0);
    xhr.timeout = 30000;
    xhr.ontimeout = () => resolve(0);
    xhr.send();
});

// ==============================================
// UPLOAD — Uses fetch with mode:'no-cors'
// This bypasses CORS preflight. We can't read
// the response, but we CAN time the upload.
// Content-Type must be a "simple" type to avoid
// preflight: text/plain works.
// ==============================================
export const measureUpload = async (userId, profile, onProgress) => {
    const sizes = profile.ulSizes || [2e6];
    const allSpeeds = [];
    const total = sizes.length;

    for (let i = 0; i < total; i++) {
        const size = sizes[i];
        const sizeLabel = size >= 1e6 ? Math.round(size/1e6)+'MB' : Math.round(size/1e3)+'KB';
        
        onProgress?.({ mbps: 0, percent: Math.round((i/total)*100), roundInfo: `${sizeLabel} uploading...` });
        
        const speed = await uploadSingle(size);
        
        if (speed > 0) {
            allSpeeds.push(speed);
            onProgress?.({ mbps: speed, percent: Math.round(((i+1)/total)*100), roundInfo: `${sizeLabel} → ${speed} Mbps` });
        } else {
            onProgress?.({ mbps: 0, percent: Math.round(((i+1)/total)*100), roundInfo: `${sizeLabel} failed` });
        }
    }

    if (!allSpeeds.length) return 0;
    return parseFloat((allSpeeds.reduce((a,b)=>a+b,0)/allSpeeds.length).toFixed(2));
};

const uploadSingle = async (size) => {
    // Create blob with 'text/plain' type — this is a CORS "simple" content type
    // so the browser sends the data WITHOUT a preflight OPTIONS request
    const data = new Uint8Array(size);
    // Fill with random-ish data to prevent compression
    for (let i = 0; i < Math.min(size, 1024); i++) data[i] = Math.random() * 256 | 0;
    const blob = new Blob([data], { type: 'text/plain' });

    try {
        const start = performance.now();
        
        await fetch('https://speed.cloudflare.com/__up', {
            method: 'POST',
            mode: 'no-cors',
            body: blob,
        });
        
        const duration = (performance.now() - start) / 1000;
        
        if (duration > 0.01) {
            return parseFloat(((size * 8) / duration / 1e6).toFixed(2));
        }
        return 0;
    } catch (e) {
        console.error('Upload failed:', e);
        return 0;
    }
};

// ==============================================
// FULL TEST RUNNER (for scheduler/automation)
// ==============================================
export const runFullTest = async (userId, profileKey = 'quick', onPhase) => {
    const profile = TEST_PROFILES[profileKey] || TEST_PROFILES.quick;
    const result = { download: 0, upload: 0, ping: 0, jitter: 0, packetLoss: 0, profile: profileKey, timestamp: new Date().toISOString(), is_auto: true };

    try {
        onPhase?.('LATENCY');
        const lat = await measureLatency(profile.pingSamples, () => {});
        result.ping = lat.ping;
        result.jitter = lat.jitter;
        result.packetLoss = lat.packetLoss;

        onPhase?.('DOWNLOAD');
        result.download = await measureDownload(profile.dlRounds, () => {});

        onPhase?.('UPLOAD');
        result.upload = await measureUpload(userId, profile, () => {});

        onPhase?.('COMPLETE');
    } catch (e) {
        console.error('Auto test error:', e);
        onPhase?.('ERROR');
    }
    return result;
};

