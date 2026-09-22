const $ = id => document.getElementById(id);

function send(message) {
  return new Promise((resolve, reject) => chrome.runtime.sendMessage(message, response => {
    if (chrome.runtime.lastError) return reject(new Error('Eklenti bağlantısı kesildi; yeniden aç.'));
    if (!response?.ok) return reject(new Error(response?.error || 'İşlem tamamlanamadı.'));
    resolve(response);
  }));
}

function show(text, error = false) {
  $('feedback').textContent = text;
  $('feedback').dataset.error = String(error);
}

function paint(state) {
  $('enabled').checked = state.enabled && state.configured;
  $('enabled').disabled = !state.configured;
  $('badge').textContent = !state.configured ? 'Bağlı değil' : state.enabled ? '● Radar Etkin' : 'Duraklatıldı';
  $('badge').dataset.active = String(state.configured && state.enabled);
  $('calls').textContent = state.calls;
  $('cached').textContent = state.cached;
  $('api-key').placeholder = state.configured ? 'Yeni anahtar ile değiştir (Kayıtlı)' : 'Anahtarını buraya gir';
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
    const remember = $('remember-key') ? $('remember-key').checked : true;
    paint(await send({ type: 'save', key: $('api-key').value, remember }));
    $('api-key').value = '';
    $('api-key').type = 'password';
    $('reveal').textContent = 'Göster';
    show('Kaydedildi. YouTube kartlarında 🛑 STOP ve bilişsel radar devreye girdi.');
  });
});

$('reveal').addEventListener('click', () => {
  const visible = $('api-key').type === 'password';
  $('api-key').type = visible ? 'text' : 'password';
  $('reveal').textContent = visible ? 'Gizle' : 'Göster';
  $('reveal').setAttribute('aria-label', visible ? 'API anahtarını gizle' : 'API anahtarını göster');
});

$('enabled').addEventListener('change', async () => {
  try {
    paint(await send({ type: 'toggle', enabled: $('enabled').checked }));
    show($('enabled').checked ? 'STOP Radarı etkinleştirildi.' : 'Radar duraklatıldı.');
  } catch (error) {
    show(error.message, true);
    paint(await send({ type: 'status' }));
  }
});

$('test').addEventListener('click', () => action($('test'), async () => {
  show('Örnek video ile Jev STOP testi yapılıyor…');
  const result = await send({ type: 'test' });
  const prefix = result.cached ? 'Önbellek: ' : 'Jev Yanıtı: ';
  const wasteInfo = result.waste !== null && result.waste !== undefined ? ` (Atık: %${result.waste})` : '';
  show(`${prefix}[${result.badge} · ${result.subtitle}] ${result.text}${wasteInfo}`);
  paint(await send({ type: 'status' }));
}));

for (const type of ['clear', 'forget']) {
  $(type).addEventListener('click', () => action($(type), async () => {
    paint(await send({ type }));
    show(type === 'clear' ? 'Önbellek temizlendi.' : 'Anahtar silindi; radar durduruldu.');
  }));
}

send({ type: 'status' }).then(paint).catch(error => show(error.message, true));
