import { supabase } from './supabaseClient';
import { runFullTest } from './speedEngine';

/**
 * Netlytics V9 — Scheduler Engine
 * Manages interval-based and daily scheduled speed tests.
 * Persists schedules in localStorage + Supabase.
 */

const STORAGE_KEY = 'netlytics_schedules';
const RESULTS_KEY = 'netlytics_auto_results';
let activeTimers = {};

// ==============================================
// SCHEDULE MANAGEMENT
// ==============================================
export const getSchedules = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
};

export const saveSchedules = (schedules) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
};

export const getAutoResults = () => {
    try {
        return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
    } catch { return []; }
};

const saveAutoResult = (result) => {
    const results = getAutoResults();
    results.unshift(result);
    // Keep last 200 results
    if (results.length > 200) results.length = 200;
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
};

export const createSchedule = (schedule) => {
    const schedules = getSchedules();
    const newSchedule = {
        id: crypto.randomUUID(),
        type: schedule.type, // 'interval' or 'daily'
        intervalMinutes: schedule.intervalMinutes || null,
        dailyTime: schedule.dailyTime || null,
        testProfile: schedule.testProfile || 'quick',
        enabled: true,
        createdAt: new Date().toISOString(),
        lastRun: null,
        nextRun: null,
    };
    schedules.push(newSchedule);
    saveSchedules(schedules);
    return newSchedule;
};

export const deleteSchedule = (id) => {
    const schedules = getSchedules().filter(s => s.id !== id);
    saveSchedules(schedules);
    stopScheduleTimer(id);
};

export const toggleSchedule = (id) => {
    const schedules = getSchedules();
    const s = schedules.find(x => x.id === id);
    if (s) {
        s.enabled = !s.enabled;
        saveSchedules(schedules);
        if (!s.enabled) stopScheduleTimer(id);
    }
    return schedules;
};

export const editSchedule = (id, updates) => {
    const schedules = getSchedules();
    const s = schedules.find(x => x.id === id);
    if (s) {
        Object.assign(s, updates);
        saveSchedules(schedules);
        stopScheduleTimer(id);
    }
    return schedules;
};

export const clearAutoResults = () => {
    localStorage.setItem(RESULTS_KEY, '[]');
};

// ==============================================
// TIMER MANAGEMENT
// ==============================================
const stopScheduleTimer = (id) => {
    if (activeTimers[id]) {
        clearInterval(activeTimers[id]);
        delete activeTimers[id];
    }
};

export const stopAllTimers = () => {
    Object.keys(activeTimers).forEach(stopScheduleTimer);
};

export const startScheduleTimers = (userId, onTestStart, onTestComplete) => {
    stopAllTimers();
    const schedules = getSchedules();
    
    schedules.forEach(schedule => {
        if (!schedule.enabled) return;

        if (schedule.type === 'interval' && schedule.intervalMinutes) {
            // Calculate next run
            const now = Date.now();
            const intervalMs = schedule.intervalMinutes * 60 * 1000;
            const lastRun = schedule.lastRun ? new Date(schedule.lastRun).getTime() : 0;
            const timeSinceLastRun = now - lastRun;

            // If enough time has passed, run immediately then set interval
            if (timeSinceLastRun >= intervalMs) {
                setTimeout(() => executeTest(schedule, userId, onTestStart, onTestComplete), 2000);
            }

            activeTimers[schedule.id] = setInterval(
                () => executeTest(schedule, userId, onTestStart, onTestComplete),
                intervalMs
            );
        }

        if (schedule.type === 'daily' && schedule.dailyTime) {
            // Check every minute if it's time to run
            activeTimers[schedule.id] = setInterval(() => {
                const now = new Date();
                const [h, m] = schedule.dailyTime.split(':').map(Number);
                if (now.getHours() === h && now.getMinutes() === m) {
                    const todayKey = now.toISOString().split('T')[0] + '_' + schedule.id;
                    const ranToday = localStorage.getItem('netlytics_daily_' + todayKey);
                    if (!ranToday) {
                        localStorage.setItem('netlytics_daily_' + todayKey, 'true');
                        executeTest(schedule, userId, onTestStart, onTestComplete);
                    }
                }
            }, 60000); // Check every minute
        }
    });
};

const executeTest = async (schedule, userId, onTestStart, onTestComplete) => {
    onTestStart?.(schedule);

    const result = await runFullTest(userId, schedule.testProfile, () => {});
    result.scheduleId = schedule.id;
    result.scheduleName = schedule.type === 'interval'
        ? `Every ${schedule.intervalMinutes}min`
        : `Daily at ${schedule.dailyTime}`;

    // Save to local
    saveAutoResult(result);

    // Save to Supabase
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data: rows } = await supabase.from('daily_speed_logs').select('*').eq('user_id', userId).eq('date', today);
        const row = rows?.length > 0 ? rows[0] : null;
        if (row) {
            await supabase.from('daily_speed_logs').update({ tests: [...row.tests, result] }).eq('id', row.id);
        } else {
            await supabase.from('daily_speed_logs').insert({ user_id: userId, date: today, tests: [result] });
        }
    } catch (e) { console.error('Scheduler DB save error:', e); }

    // Update schedule lastRun
    const schedules = getSchedules();
    const s = schedules.find(x => x.id === schedule.id);
    if (s) {
        s.lastRun = new Date().toISOString();
        saveSchedules(schedules);
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Netlytics Auto Test Complete', {
            body: `DL: ${result.download} Mbps | UL: ${result.upload} Mbps | Ping: ${result.ping}ms`,
            icon: '/vite.svg',
        });
    }

    onTestComplete?.(result, schedule);
};

export const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
        return await Notification.requestPermission();
    }
    return Notification.permission;
};

export const getNextRunTime = (schedule) => {
    if (!schedule.enabled) return null;
    if (schedule.type === 'interval' && schedule.intervalMinutes) {
        const lastRun = schedule.lastRun ? new Date(schedule.lastRun).getTime() : Date.now();
        return new Date(lastRun + schedule.intervalMinutes * 60 * 1000);
    }
    if (schedule.type === 'daily' && schedule.dailyTime) {
        const [h, m] = schedule.dailyTime.split(':').map(Number);
        const next = new Date();
        next.setHours(h, m, 0, 0);
        if (next <= new Date()) next.setDate(next.getDate() + 1);
        return next;
    }
    return null;
};
