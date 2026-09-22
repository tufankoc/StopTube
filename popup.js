const $ = id => document.getElementById(id);

const I18N_POPUP = {
  tr: {
    brandSub: 'Bilişsel YouTube Kalkanı',
    notConfigured: 'Bağlı değil',
    radarActive: '● Radar Etkin',
    radarPaused: 'Duraklatıldı',
    memoryLabel: 'Kalıcı Hafıza:',
    memoryUnit: 'video (0 ms)',
    clearBtn: 'Temizle',
    keyLabel: 'TypeSafe API Anahtarı',
    keyPlaceholder: 'Anahtarını buraya gir',
    keyPlaceholderSaved: 'Yeni anahtar ile değiştir (Kayıtlı)',
    saveBtn: 'Kaydet',
    rememberKey: 'Bu cihazda hatırla (Kalıcı sakla)',
    toggleTitle: 'Otomatik STOP Radarı',
    toggleDesc: 'Küçük resimlerde 🛑 damgalar ve blur',
    testBtn: '⚡ Hızlı Test',
    forgetBtn: 'Anahtarı Sil',
    sessionCalls: 'Oturum İstek:',
    revealShow: 'Göster',
    revealHide: 'Gizle',
    savedFeedback: '✓ Kaydedildi. YouTube kartlarında 🛑 STOP ve bilişsel radar anında devreye girdi.',
    radarEnabled: 'STOP Radarı etkinleştirildi.',
    radarPausedMsg: 'Radar duraklatıldı.',
    testRunning: 'Örnek video ile Jev STOP testi yapılıyor…',
    clearSuccess: 'Önbellek temizlendi.',
    forgetSuccess: 'Anahtar silindi; radar durduruldu.'
  },
  en: {
    brandSub: 'Cognitive YouTube Shield',
    notConfigured: 'Not connected',
    radarActive: '● Radar Active',
    radarPaused: 'Paused',
    memoryLabel: 'Persistent Cache:',
    memoryUnit: 'videos (0 ms)',
    clearBtn: 'Clear',
    keyLabel: 'TypeSafe API Key',
    keyPlaceholder: 'Enter your API key here',
    keyPlaceholderSaved: 'Replace key (Saved)',
    saveBtn: 'Save',
    rememberKey: 'Remember on this device (Persistent)',
    toggleTitle: 'Autonomous STOP Radar',
    toggleDesc: 'Applies 🛑 stamps and blur to thumbnails',
    testBtn: '⚡ Quick Test',
    forgetBtn: 'Delete Key',
    sessionCalls: 'Session Requests:',
    revealShow: 'Show',
    revealHide: 'Hide',
    savedFeedback: '✓ Saved. 🛑 STOP Radar activated immediately on YouTube cards.',
    radarEnabled: 'STOP Radar activated.',
    radarPausedMsg: 'Radar paused.',
    testRunning: 'Running sample video test with Jev STOP…',
    clearSuccess: 'Cache cleared.',
    forgetSuccess: 'Key deleted; radar stopped.'
  }
};

let currentLang = 'tr';

function send(message) {
  return new Promise((resolve, reject) => chrome.runtime.sendMessage(message, response => {
    if (chrome.runtime.lastError) return reject(new Error(currentLang === 'en' ? 'Extension reloaded; please reopen popup.' : 'Eklenti bağlantısı kesildi; yeniden aç.'));
    if (!response?.ok) return reject(new Error(response?.error || (currentLang === 'en' ? 'Operation failed.' : 'İşlem tamamlanamadı.')));
    resolve(response);
  }));
}

function show(text, error = false) {
  $('feedback').textContent = text;
  $('feedback').dataset.error = String(error);
}

function updateLangUI(lang) {
  currentLang = lang === 'en' ? 'en' : 'tr';
  const t = I18N_POPUP[currentLang];

  $('lang-tr')?.classList.toggle('active', currentLang === 'tr');
  $('lang-en')?.classList.toggle('active', currentLang === 'en');

  if ($('brand-sub')) $('brand-sub').textContent = t.brandSub;
  if ($('telemetry-label')) $('telemetry-label').textContent = t.memoryLabel;
  if ($('telemetry-unit')) $('telemetry-unit').textContent = t.memoryUnit;
  if ($('clear')) $('clear').textContent = t.clearBtn;
  if ($('api-key-label')) $('api-key-label').textContent = t.keyLabel;
  if ($('save-text')) $('save-text').textContent = t.saveBtn;
  if ($('remember-key-text')) $('remember-key-text').textContent = t.rememberKey;
  if ($('toggle-title')) $('toggle-title').textContent = t.toggleTitle;
  if ($('toggle-desc')) $('toggle-desc').textContent = t.toggleDesc;
  if ($('test')) $('test').textContent = t.testBtn;
  if ($('forget')) $('forget').textContent = t.forgetBtn;
  if ($('session-calls-label')) $('session-calls-label').textContent = t.sessionCalls;
}

function paint(state) {
  if (state.lang) updateLangUI(state.lang);
  const t = I18N_POPUP[currentLang];

  $('enabled').checked = state.enabled && state.configured;
  $('enabled').disabled = !state.configured;
  $('badge').textContent = !state.configured ? t.notConfigured : state.enabled ? t.radarActive : t.radarPaused;
  $('badge').dataset.active = String(state.configured && state.enabled);
  $('calls').textContent = state.calls;
  $('cached').textContent = state.cached;
  $('api-key').placeholder = state.configured ? t.keyPlaceholderSaved : t.keyPlaceholder;
  if ($('remember-key')) {
    $('remember-key').checked = state.rememberKey !== false;
  }
}

async function action(button, fn) {
  button.disabled = true;
  try {
    await fn();
  } catch (error) {
    show(error.message, true);
  } finally {
    button.disabled = false;
  }
}

$('key-form').addEventListener('submit', event => {
  event.preventDefault();
  action($('save'), async () => {
    const t = I18N_POPUP[currentLang];
    const remember = $('remember-key') ? $('remember-key').checked : true;
    paint(await send({ type: 'save', key: $('api-key').value, remember, lang: currentLang }));
    $('api-key').value = '';
    $('api-key').type = 'password';
    $('reveal').textContent = t.revealShow;
    show(t.savedFeedback);
  });
});

$('reveal').addEventListener('click', () => {
  const t = I18N_POPUP[currentLang];
  const visible = $('api-key').type === 'password';
  $('api-key').type = visible ? 'text' : 'password';
  $('reveal').textContent = visible ? t.revealHide : t.revealShow;
});

$('enabled').addEventListener('change', async () => {
  const t = I18N_POPUP[currentLang];
  try {
    paint(await send({ type: 'toggle', enabled: $('enabled').checked }));
    show($('enabled').checked ? t.radarEnabled : t.radarPausedMsg);
  } catch (error) {
    show(error.message, true);
    paint(await send({ type: 'status' }));
  }
});

$('lang-tr')?.addEventListener('click', async () => {
  if (currentLang === 'tr') return;
  updateLangUI('tr');
  paint(await send({ type: 'set_lang', lang: 'tr' }));
});

$('lang-en')?.addEventListener('click', async () => {
  if (currentLang === 'en') return;
  updateLangUI('en');
  paint(await send({ type: 'set_lang', lang: 'en' }));
});

$('test').addEventListener('click', () => action($('test'), async () => {
  const t = I18N_POPUP[currentLang];
  show(t.testRunning);
  const result = await send({ type: 'test' });
  const prefix = result.cached ? (currentLang === 'en' ? 'Cache: ' : 'Önbellek: ') : (currentLang === 'en' ? 'Jev Radar: ' : 'Jev Yanıtı: ');
  const wasteLabel = currentLang === 'en' ? 'Waste' : 'Atık';
  const wasteInfo = result.waste !== null && result.waste !== undefined ? ` (${wasteLabel}: %${result.waste})` : '';
  show(`${prefix}[${result.badge} · ${result.subtitle}] ${result.text}${wasteInfo}`);
  paint(await send({ type: 'status' }));
}));

for (const type of ['clear', 'forget']) {
  $(type).addEventListener('click', () => action($(type), async () => {
    const t = I18N_POPUP[currentLang];
    paint(await send({ type }));
    show(type === 'clear' ? t.clearSuccess : t.forgetSuccess);
  }));
}

send({ type: 'status' }).then(paint).catch(error => show(error.message, true));

