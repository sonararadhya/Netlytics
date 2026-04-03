/**
 * Netlytics V9 — Internationalization (i18n)
 * Multi-language support with localStorage persistence.
 */

const LANG_KEY = 'netlytics_lang';

export const LANGUAGES = {
    en: { label: 'English', flag: '🇺🇸' },
    hi: { label: 'हिन्दी', flag: '🇮🇳' },
    es: { label: 'Español', flag: '🇪🇸' },
    fr: { label: 'Français', flag: '🇫🇷' },
    de: { label: 'Deutsch', flag: '🇩🇪' },
    ja: { label: '日本語', flag: '🇯🇵' },
    zh: { label: '中文', flag: '🇨🇳' },
    pt: { label: 'Português', flag: '🇧🇷' },
    ar: { label: 'العربية', flag: '🇸🇦' },
};

const translations = {
    // ================ NAVBAR ================
    'nav.test': { en:'TEST', hi:'टेस्ट', es:'PRUEBA', fr:'TEST', de:'TEST', ja:'テスト', zh:'测试', pt:'TESTE', ar:'اختبار' },
    'nav.data': { en:'DATA', hi:'डेटा', es:'DATOS', fr:'DONNÉES', de:'DATEN', ja:'データ', zh:'数据', pt:'DADOS', ar:'بيانات' },
    'nav.schedule': { en:'SCHEDULE', hi:'शेड्यूल', es:'HORARIO', fr:'PLANIFIER', de:'PLANEN', ja:'スケジュール', zh:'计划', pt:'AGENDA', ar:'جدول' },
    'nav.monitor': { en:'MONITOR', hi:'मॉनिटर', es:'MONITOR', fr:'MONITEUR', de:'MONITOR', ja:'モニター', zh:'监控', pt:'MONITOR', ar:'مراقب' },
    'nav.files': { en:'FILES', hi:'फाइलें', es:'ARCHIVOS', fr:'FICHIERS', de:'DATEIEN', ja:'ファイル', zh:'文件', pt:'ARQUIVOS', ar:'ملفات' },

    // ================ SPEED TEST ================
    'test.title': { en:'PRECISION SPEED ANALYSIS V8', hi:'सटीक स्पीड विश्लेषण V8', es:'ANÁLISIS DE VELOCIDAD V8', fr:'ANALYSE DE VITESSE V8', de:'GESCHWINDIGKEITSANALYSE V8', ja:'精密速度分析 V8', zh:'精准速度分析 V8', pt:'ANÁLISE DE VELOCIDADE V8', ar:'تحليل السرعة الدقيق V8' },
    'test.start': { en:'START TEST', hi:'टेस्ट शुरू करें', es:'INICIAR', fr:'DÉMARRER', de:'STARTEN', ja:'テスト開始', zh:'开始测试', pt:'INICIAR', ar:'بدء الاختبار' },
    'test.testing': { en:'TESTING', hi:'परीक्षण जारी', es:'PROBANDO', fr:'EN COURS', de:'LÄUFT', ja:'テスト中', zh:'测试中', pt:'TESTANDO', ar:'جاري الاختبار' },
    'test.download': { en:'Download', hi:'डाउनलोड', es:'Descarga', fr:'Téléchargement', de:'Download', ja:'ダウンロード', zh:'下载', pt:'Download', ar:'تنزيل' },
    'test.upload': { en:'Upload', hi:'अपलोड', es:'Subida', fr:'Téléversement', de:'Upload', ja:'アップロード', zh:'上传', pt:'Upload', ar:'رفع' },
    'test.latency': { en:'Latency', hi:'विलंबता', es:'Latencia', fr:'Latence', de:'Latenz', ja:'遅延', zh:'延迟', pt:'Latência', ar:'زمن الوصول' },
    'test.jitter': { en:'Jitter', hi:'जिटर', es:'Jitter', fr:'Gigue', de:'Jitter', ja:'ジッター', zh:'抖动', pt:'Jitter', ar:'التذبذب' },
    'test.packetLoss': { en:'Packet Loss', hi:'पैकेट लॉस', es:'Pérdida', fr:'Perte', de:'Paketverlust', ja:'パケットロス', zh:'丢包', pt:'Perda', ar:'فقدان الحزم' },
    'test.connection': { en:'Connection', hi:'कनेक्शन', es:'Conexión', fr:'Connexion', de:'Verbindung', ja:'接続', zh:'连接', pt:'Conexão', ar:'الاتصال' },
    'test.isp': { en:'ISP', hi:'ISP', es:'ISP', fr:'FAI', de:'ISP', ja:'ISP', zh:'运营商', pt:'ISP', ar:'مزود الخدمة' },
    'test.ready': { en:'READY', hi:'तैयार', es:'LISTO', fr:'PRÊT', de:'BEREIT', ja:'準備完了', zh:'就绪', pt:'PRONTO', ar:'جاهز' },
    'test.done': { en:'DONE', hi:'पूर्ण', es:'HECHO', fr:'TERMINÉ', de:'FERTIG', ja:'完了', zh:'完成', pt:'PRONTO', ar:'تم' },
    'test.complete': { en:'Test complete', hi:'परीक्षण पूर्ण', es:'Prueba completa', fr:'Test terminé', de:'Test abgeschlossen', ja:'テスト完了', zh:'测试完成', pt:'Teste completo', ar:'اكتمل الاختبار' },
    'test.selectMode': { en:'Select mode & start', hi:'मोड चुनें और शुरू करें', es:'Seleccionar y empezar', fr:'Choisir le mode', de:'Modus wählen', ja:'モードを選択して開始', zh:'选择模式并开始', pt:'Selecionar modo', ar:'اختر الوضع وابدأ' },
    'test.liveSignal': { en:'LIVE SIGNAL', hi:'लाइव सिग्नल', es:'SEÑAL EN VIVO', fr:'SIGNAL EN DIRECT', de:'LIVE SIGNAL', ja:'ライブ信号', zh:'实时信号', pt:'SINAL AO VIVO', ar:'إشارة مباشرة' },
    'test.server': { en:'SERVER & NETWORK', hi:'सर्वर और नेटवर्क', es:'SERVIDOR Y RED', fr:'SERVEUR ET RÉSEAU', de:'SERVER UND NETZWERK', ja:'サーバーとネットワーク', zh:'服务器与网络', pt:'SERVIDOR E REDE', ar:'الخادم والشبكة' },
    'test.yourIP': { en:'Your IP', hi:'आपका IP', es:'Tu IP', fr:'Votre IP', de:'Ihre IP', ja:'あなたのIP', zh:'您的IP', pt:'Seu IP', ar:'عنوان IP الخاص بك' },
    'test.location': { en:'Location', hi:'स्थान', es:'Ubicación', fr:'Emplacement', de:'Standort', ja:'場所', zh:'位置', pt:'Localização', ar:'الموقع' },
    'test.connectedVia': { en:'Connected via', hi:'कनेक्टेड via', es:'Conectado por', fr:'Connecté via', de:'Verbunden über', ja:'接続方式', zh:'连接方式', pt:'Conectado via', ar:'متصل عبر' },
    'test.testLog': { en:'TEST LOG', hi:'टेस्ट लॉग', es:'REGISTRO', fr:'JOURNAL', de:'TESTLOG', ja:'テストログ', zh:'测试日志', pt:'REGISTRO', ar:'سجل الاختبار' },
    'test.qualityScore': { en:'Quality Score', hi:'गुणवत्ता स्कोर', es:'Puntuación', fr:'Score', de:'Bewertung', ja:'品質スコア', zh:'质量评分', pt:'Pontuação', ar:'تقييم الجودة' },

    // ================ AI ================
    'ai.title': { en:'Network Intelligence Report', hi:'नेटवर्क इंटेलिजेंस रिपोर्ट', es:'Informe de Red', fr:'Rapport Réseau', de:'Netzwerkbericht', ja:'ネットワーク分析レポート', zh:'网络智能报告', pt:'Relatório de Rede', ar:'تقرير ذكاء الشبكة' },
    'ai.subtitle': { en:'AI-powered analysis of your connection', hi:'AI-संचालित कनेक्शन विश्लेषण', es:'Análisis impulsado por IA', fr:'Analyse propulsée par IA', de:'KI-gestützte Analyse', ja:'AIによる接続分析', zh:'AI驱动的连接分析', pt:'Análise com IA', ar:'تحليل مدعوم بالذكاء الاصطناعي' },

    // ================ SCHEDULER ================
    'sched.title': { en:'SCHEDULER', hi:'शेड्यूलर', es:'PROGRAMADOR', fr:'PLANIFICATEUR', de:'PLANER', ja:'スケジューラー', zh:'调度器', pt:'AGENDADOR', ar:'المؤقت' },
    'sched.subtitle': { en:'AUTOMATED TEST CONFIGURATION', hi:'स्वचालित परीक्षण कॉन्फ़िगरेशन', es:'CONFIGURACIÓN AUTOMÁTICA', fr:'CONFIG AUTOMATIQUE', de:'AUTOMATISCHE KONFIGURATION', ja:'自動テスト設定', zh:'自动测试配置', pt:'CONFIG AUTOMÁTICA', ar:'تكوين الاختبار التلقائي' },
    'sched.active': { en:'ACTIVE SCHEDULES', hi:'सक्रिय शेड्यूल', es:'HORARIOS ACTIVOS', fr:'PLANIFICATIONS ACTIVES', de:'AKTIVE ZEITPLÄNE', ja:'アクティブスケジュール', zh:'活动计划', pt:'AGENDAS ATIVAS', ar:'الجداول النشطة' },
    'sched.history': { en:'AUTO TEST HISTORY', hi:'ऑटो टेस्ट इतिहास', es:'HISTORIAL AUTO', fr:'HISTORIQUE AUTO', de:'AUTO-TEST VERLAUF', ja:'自動テスト履歴', zh:'自动测试历史', pt:'HISTÓRICO AUTO', ar:'سجل الاختبار التلقائي' },
    'sched.new': { en:'NEW SCHEDULE', hi:'नया शेड्यूल', es:'NUEVO HORARIO', fr:'NOUVEAU', de:'NEU', ja:'新しいスケジュール', zh:'新建计划', pt:'NOVA AGENDA', ar:'جدول جديد' },
    'sched.noSchedules': { en:'No schedules configured.', hi:'कोई शेड्यूल नहीं।', es:'Sin horarios.', fr:'Aucune planification.', de:'Keine Zeitpläne.', ja:'スケジュールなし。', zh:'暂无计划。', pt:'Sem agendas.', ar:'لا توجد جداول.' },
    'sched.deleteAll': { en:'Clear History', hi:'इतिहास साफ़ करें', es:'Borrar historial', fr:'Effacer', de:'Verlauf löschen', ja:'履歴をクリア', zh:'清除历史', pt:'Limpar histórico', ar:'مسح السجل' },

    // ================ MONITOR ================
    'mon.title': { en:'AI MONITOR', hi:'AI मॉनिटर', es:'MONITOR IA', fr:'MONITEUR IA', de:'KI-MONITOR', ja:'AIモニター', zh:'AI监控', pt:'MONITOR IA', ar:'مراقب الذكاء الاصطناعي' },
    'mon.subtitle': { en:'NETWORK INTELLIGENCE CENTER', hi:'नेटवर्क इंटेलिजेंस सेंटर', es:'CENTRO DE INTELIGENCIA', fr:'CENTRE D\'INTELLIGENCE', de:'NETZWERK-ZENTRALE', ja:'ネットワーク分析センター', zh:'网络智能中心', pt:'CENTRAL DE INTELIGÊNCIA', ar:'مركز ذكاء الشبكة' },
    'mon.health': { en:'HEALTH SCORE', hi:'स्वास्थ्य स्कोर', es:'PUNTUACIÓN', fr:'SCORE SANTÉ', de:'GESUNDHEITSWERT', ja:'ヘルススコア', zh:'健康评分', pt:'PONTUAÇÃO', ar:'تقييم الصحة' },
    'mon.alertFeed': { en:'ALERT FEED', hi:'अलर्ट फ़ीड', es:'ALERTAS', fr:'ALERTES', de:'ALARME', ja:'アラートフィード', zh:'告警', pt:'ALERTAS', ar:'تنبيهات' },
    'mon.alertRules': { en:'ALERT RULES', hi:'अलर्ट नियम', es:'REGLAS', fr:'RÈGLES', de:'REGELN', ja:'アラートルール', zh:'告警规则', pt:'REGRAS', ar:'قواعد التنبيه' },
    'mon.noAlerts': { en:'No alerts. Network healthy.', hi:'कोई अलर्ट नहीं।', es:'Sin alertas. Red sana.', fr:'Pas d\'alertes.', de:'Keine Alarme.', ja:'アラートなし。', zh:'无告警，网络正常。', pt:'Sem alertas.', ar:'لا تنبيهات.' },

    // ================ FILE MONITOR ================
    'file.title': { en:'FILE MONITOR', hi:'फ़ाइल मॉनिटर', es:'MONITOR DE ARCHIVOS', fr:'MONITEUR DE FICHIERS', de:'DATEI-MONITOR', ja:'ファイルモニター', zh:'文件监控', pt:'MONITOR DE ARQUIVOS', ar:'مراقب الملفات' },
    'file.subtitle': { en:'REAL-TIME DOWNLOAD TRACKER', hi:'रीयल-टाइम डाउनलोड ट्रैकर', es:'RASTREADOR EN TIEMPO REAL', fr:'SUIVI EN TEMPS RÉEL', de:'ECHTZEIT-TRACKER', ja:'リアルタイムダウンロードトラッカー', zh:'实时下载跟踪器', pt:'RASTREADOR EM TEMPO REAL', ar:'متتبع التنزيل مباشر' },
    'file.url': { en:'File URL', hi:'फ़ाइल URL', es:'URL del archivo', fr:'URL du fichier', de:'Datei-URL', ja:'ファイルURL', zh:'文件URL', pt:'URL do arquivo', ar:'رابط الملف' },
    'file.currentSpeed': { en:'Current Speed', hi:'वर्तमान स्पी Dou', es:'Velocidad actual', fr:'Vitesse actuelle', de:'Aktuelle Geschw.', ja:'現在の速度', zh:'当前速度', pt:'Velocidade atual', ar:'السرعة الحالية' },
    'file.peakSpeed': { en:'Peak Speed', hi:'अधिकतम स्पीड', es:'Velocidad máxima', fr:'Vitesse max', de:'Spitzengeschw.', ja:'最高速度', zh:'峰值速度', pt:'Velocidade máx.', ar:'أقصى سرعة' },

    // ================ COMMON ================
    'common.delete': { en:'Delete', hi:'हटाएं', es:'Borrar', fr:'Supprimer', de:'Löschen', ja:'削除', zh:'删除', pt:'Excluir', ar:'حذف' },
    'common.edit': { en:'Edit', hi:'संपादित करें', es:'Editar', fr:'Modifier', de:'Bearbeiten', ja:'編集', zh:'编辑', pt:'Editar', ar:'تعديل' },
    'common.save': { en:'Save', hi:'सहेजें', es:'Guardar', fr:'Enregistrer', de:'Speichern', ja:'保存', zh:'保存', pt:'Salvar', ar:'حفظ' },
    'common.cancel': { en:'Cancel', hi:'रद्द करें', es:'Cancelar', fr:'Annuler', de:'Abbrechen', ja:'キャンセル', zh:'取消', pt:'Cancelar', ar:'إلغاء' },
    'common.enable': { en:'Enable', hi:'सक्रिय करें', es:'Habilitar', fr:'Activer', de:'Aktivieren', ja:'有効化', zh:'启用', pt:'Ativar', ar:'تمكين' },
    'common.samples': { en:'samples', hi:'सैंपल', es:'muestras', fr:'échantillons', de:'Proben', ja:'サンプル', zh:'样本', pt:'amostras', ar:'عينات' },
    'common.results': { en:'results', hi:'परिणाम', es:'resultados', fr:'résultats', de:'Ergebnisse', ja:'結果', zh:'结果', pt:'resultados', ar:'نتائج' },
    'common.language': { en:'Language', hi:'भाषा', es:'Idioma', fr:'Langue', de:'Sprache', ja:'言語', zh:'语言', pt:'Idioma', ar:'اللغة' },

    // ================ DASHBOARD ================
    'dash.title': { en:'TELEMETRY DASHBOARD', hi:'टेलीमेट्री डैशबोर्ड', es:'PANEL DE TELEMETRÍA', fr:'TABLEAU DE BORD', de:'TELEMETRIE-DASHBOARD', ja:'テレメトリーダッシュボード', zh:'遥测仪表板', pt:'PAINEL DE TELEMETRIA', ar:'لوحة القياسات' },
    'dash.deleteAll': { en:'Delete All Records', hi:'सभी रिकॉर्ड हटाएं', es:'Borrar todos', fr:'Tout supprimer', de:'Alle löschen', ja:'全て削除', zh:'删除所有记录', pt:'Excluir tudo', ar:'حذف الكل' },

    // ================ LOGIN ================
    'login.title': { en:'ACCESS TERMINAL', hi:'एक्सेस टर्मिनल', es:'TERMINAL DE ACCESO', fr:'TERMINAL D\'ACCÈS', de:'ZUGANGS-TERMINAL', ja:'アクセスターミナル', zh:'访问终端', pt:'TERMINAL DE ACESSO', ar:'محطة الوصول' },
    'login.forgot': { en:'Forgot password?', hi:'पासवर्ड भूल गए?', es:'¿Contraseña olvidada?', fr:'Mot de passe oublié?', de:'Passwort vergessen?', ja:'パスワードを忘れた?', zh:'忘记密码?', pt:'Esqueceu a senha?', ar:'نسيت كلمة المرور؟' },
};

// ==============================================
// API
// ==============================================
export const getLang = () => localStorage.getItem(LANG_KEY) || 'en';
export const setLang = (lang) => { localStorage.setItem(LANG_KEY, lang); window.dispatchEvent(new Event('langchange')); };

export const t = (key) => {
    const lang = getLang();
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
};
