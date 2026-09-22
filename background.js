import { cleanVideo, evaluate } from './core.js';

const ready = Promise.all([
  chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' }),
  chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })
]);

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.session.set({ cache: {} }).catch(() => {});
});

let serial = Promise.resolve();
const lock = fn => {
  const next = serial.then(fn);
  serial = next.catch(() => {});
  return next;
};

const pending = new Map();
let active = 0, revision = 0;
const waiters = [];

async function slot(fn) {
  if (active >= 2) await new Promise(resolve => waiters.push(resolve));
  active++;
  try { return await fn(); } finally { active--; waiters.shift()?.(); }
}

async function status() {
  const [local, session] = await Promise.all([
    chrome.storage.local.get({ enabled: false, apiKey: '', rememberKey: true }),
    chrome.storage.session.get({ apiKey: '', calls: 0, cache: {} })
  ]);
  const activeKey = session.apiKey || (local.rememberKey ? local.apiKey : '');
  return {
    enabled: local.enabled,
    configured: !!activeKey,
    rememberKey: !!local.rememberKey,
    calls: session.calls || 0,
    cached: Object.keys(session.cache || {}).length
  };
}

async function analyze(video) {
  const fingerprint = JSON.stringify(video);
  if (pending.has(fingerprint)) return pending.get(fingerprint);
  if (pending.size >= 32) throw new Error('İstek kuyruğu dolu; biraz sonra tekrar dene.');

  const task = slot(async () => {
    const ticket = await lock(async () => {
      const current = await status();
      if (!current.enabled) throw new Error('Radar duraklatıldı.');
      const [saved, local] = await Promise.all([
        chrome.storage.session.get({
          apiKey: '',
          cache: {},
          rate: { start: 0, count: 0 },
          cooldown: 0,
          calls: 0
        }),
        chrome.storage.local.get({ apiKey: '', rememberKey: true })
      ]);
      const effectiveKey = saved.apiKey || (local.rememberKey ? local.apiKey : '');
      if (!effectiveKey) throw new Error('Eklenti simgesinden API anahtarını gir.');

      const hit = saved.cache[fingerprint];
      // Eğer önbellekte geçerli zengin analiz varsa ve 24 saati geçmediyse kullan
      if (hit && Date.now() - hit.at < 86400000 && hit.verdict && hit.text) {
        return { analysis: hit };
      }

      if (saved.cooldown > Date.now()) throw new Error('Jev kısa bir molada; bir dakika sonra tekrar dene.');
      const rate = Date.now() - saved.rate.start >= 60000 ? { start: Date.now(), count: 0 } : saved.rate;
      if (rate.count >= 24) throw new Error('Dakikalık 24 istek sınırına ulaşıldı.');
      rate.count++;
      await chrome.storage.session.set({ rate, calls: saved.calls + 1 });
      return { key: effectiveKey, revision };
    });

    if (ticket.analysis) return { ...ticket.analysis, cached: true };

    let analysis;
    try {
      analysis = await evaluate(video, ticket.key);
    } catch (error) {
      if ([401, 403, 429, 500, 502, 503, 529].includes(error.code)) {
        await lock(async () => {
          if (ticket.revision === revision) await chrome.storage.session.set({ cooldown: Date.now() + 60000 });
        });
      }
      throw error;
    }

    await lock(async () => {
      if (ticket.revision !== revision) return;
      const { cache = {} } = await chrome.storage.session.get('cache');
      cache[fingerprint] = { ...analysis, at: Date.now() };
      const entries = Object.entries(cache).sort((a, b) => b[1].at - a[1].at).slice(0, 200);
      await chrome.storage.session.set({ cache: Object.fromEntries(entries) });
    });

    if (ticket.revision !== revision || !(await status()).enabled) throw new Error('Ayarlar değişti; tekrar dene.');
    return { ...analysis, cached: false };
  });

  pending.set(fingerprint, task);
  try { return await task; } finally { pending.delete(fingerprint); }
}

async function handle(message, sender) {
  await ready;
  if (sender.id !== chrome.runtime.id) throw new Error('Yetkisiz istek.');
  const popup = sender.url === chrome.runtime.getURL('popup.html');
  let youtube = false;
  try {
    const url = new URL(sender.url);
    youtube = url.origin === 'https://www.youtube.com' && !!sender.tab;
  } catch {}

  if (!popup && !youtube) throw new Error('Bu sayfada kullanılamaz.');

  if (message?.type === 'status') return status();

  if (message?.type === 'analyze' && youtube) {
    const video = cleanVideo(message.video);
    if (!video) throw new Error('Video bilgisi okunamadı.');
    return analyze(video);
  }

  if (!popup) throw new Error('Bu işlem ayarlar ekranından yapılmalı.');

  if (message?.type === 'save') {
    if (typeof message.key !== 'string' || message.key.trim().length < 8 || message.key.length > 2048 || /[\r\n]/.test(message.key)) {
      throw new Error('Geçerli bir API anahtarı gir.');
    }
    const cleanKey = message.key.trim();
    const remember = message.remember !== false;
    await lock(async () => {
      revision++;
      await chrome.storage.session.set({ apiKey: cleanKey, cooldown: 0, cache: {} });
      await chrome.storage.local.set({ enabled: true, rememberKey: remember, apiKey: remember ? cleanKey : '' });
    });
    return status();
  }

  if (message?.type === 'toggle') {
    await chrome.storage.local.set({ enabled: message.enabled === true });
    return status();
  }

  if (message?.type === 'clear') {
    await lock(async () => {
      revision++;
      await chrome.storage.session.set({ cache: {} });
    });
    return status();
  }

  if (message?.type === 'forget') {
    await lock(async () => {
      revision++;
      await chrome.storage.local.set({ enabled: false, apiKey: '', rememberKey: false });
      await chrome.storage.session.remove(['apiKey', 'cache']);
    });
    return status();
  }

  if (message?.type === 'test') {
    const s = await status();
    if (!s.configured) throw new Error('Önce API anahtarını kaydet.');
    if (!s.enabled) throw new Error('Bağlantı testi için eklentiyi etkinleştir.');
    return analyze({
      id: 'demo1234567',
      title: 'EVİMDE KULLANDIĞIM TÜM TEKNOLOJİK ÜRÜNLER',
      channel: 'Örnek Teknoloji Kanalı',
      description: 'Masa ve ev turu. Sponsorlu bağlantılar aşağıdadır.',
      comments: [
        'Abi 15 dakika boyunca sadece link verdiğin ürünleri övmüşsün hiçbir teknik detay yok resmen reklam',
        'Zaman kaybı arkadaşlar 10 tane sponsorlu eşyayı dizmiş geçmiş'
      ]
    });
  }

  throw new Error('Bilinmeyen işlem.');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handle(message, sender)
    .then(data => sendResponse({ ok: true, ...data }))
    .catch(error => sendResponse({ ok: false, error: error.message || 'İşlem tamamlanamadı.' }));
  return true;
});
