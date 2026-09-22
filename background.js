import { cleanVideo, evaluate, fetchDislikeStats } from './core.js';

const ready = (async () => {
  try {
    if (chrome.storage?.session?.setAccessLevel) {
      await chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
    }
  } catch {}
})();

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
    chrome.storage.local.get({ enabled: true, apiKey: '', rememberKey: true, lang: 'tr', persistentCache: {} }),
    chrome.storage.session.get({ apiKey: '', calls: 0 })
  ]);
  const activeKey = session.apiKey || (local.rememberKey !== false ? local.apiKey : '');
  const cachedCount = Object.keys(local.persistentCache || {}).length;
  return {
    enabled: local.enabled !== false,
    configured: !!activeKey,
    rememberKey: local.rememberKey !== false,
    lang: local.lang || 'tr',
    calls: session.calls || 0,
    cached: cachedCount
  };
}

async function analyze(video, isWatch = false) {
  const videoId = video.id;
  if (!videoId) throw new Error('Video bilgisi okunamadı.');

  const taskKey = `${videoId}_${isWatch ? 'watch' : 'card'}`;
  if (pending.has(taskKey)) return pending.get(taskKey);
  if (pending.size >= 32) throw new Error('İstek kuyruğu dolu; biraz sonra tekrar dene.');

  const task = slot(async () => {
    let currentLang = 'tr';
    const ticket = await lock(async () => {
      const current = await status();
      currentLang = current.lang || 'tr';
      if (!current.enabled) throw new Error(currentLang === 'en' ? 'Radar is paused.' : 'Radar duraklatıldı.');
      const [saved, local] = await Promise.all([
        chrome.storage.session.get({
          apiKey: '',
          rate: { start: 0, count: 0 },
          cooldown: 0,
          calls: 0
        }),
        chrome.storage.local.get({ apiKey: '', rememberKey: true, lang: 'tr', persistentCache: {} })
      ]);
      const effectiveKey = saved.apiKey || (local.rememberKey !== false ? local.apiKey : '');
      if (!effectiveKey) throw new Error(currentLang === 'en' ? 'Please enter your API key in extension settings.' : 'Eklenti simgesinden API anahtarını gir.');

      const cache = local.persistentCache || {};
      const hit = cache[videoId];

      // 30 günlük kalıcı hafıza: Eğer daha önce taranmışsa tekrar Jev'e sorgu atılmaz (0 ms)
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (hit && Date.now() - hit.at < THIRTY_DAYS && hit.verdict && hit.text) {
        const hasEnoughComments = Array.isArray(video.comments) && video.comments.length >= 2;
        // Eğer watch sayfası değilse, veya zaten yorum analizi yapılmışsa veya sayfada yorum yoksa:
        if (!isWatch || hit.hasComments || !hasEnoughComments) {
          return { analysis: hit };
        }
      }

      // Yeni video veya yorum zenginleştirmesi için Jev çağrısı
      if (saved.cooldown > Date.now()) throw new Error(currentLang === 'en' ? 'Jev is resting; try again in a minute.' : 'Jev kısa bir molada; bir dakika sonra tekrar dene.');
      const rate = Date.now() - saved.rate.start >= 60000 ? { start: Date.now(), count: 0 } : saved.rate;
      if (rate.count >= 24) throw new Error(currentLang === 'en' ? 'Rate limit of 24 requests per minute reached.' : 'Dakikalık 24 istek sınırına ulaşıldı.');
      rate.count++;
      await chrome.storage.session.set({ rate, calls: saved.calls + 1 });
      return { key: effectiveKey, revision, isEnrich: (isWatch && !!hit), lang: currentLang };
    });

    if (ticket.analysis) return { ...ticket.analysis, cached: true };

    const dislikeData = await fetchDislikeStats(videoId);
    if (dislikeData) {
      video.dislikeRatio = dislikeData.dislikeRatio;
      video.dislikeCount = dislikeData.dislikes;
      video.likeCount = dislikeData.likes;
    }

    let analysis;
    try {
      analysis = await evaluate(video, ticket.key, fetch, { ...(dislikeData || {}), lang: ticket.lang || currentLang });
    } catch (error) {
      if ([401, 403, 429, 500, 502, 503, 529].includes(error.code)) {
        await lock(async () => {
          if (ticket.revision === revision) await chrome.storage.session.set({ cooldown: Date.now() + 60000 });
        });
      }
      throw error;
    }

    const hasComments = isWatch && Array.isArray(video.comments) && video.comments.length >= 2;

    await lock(async () => {
      if (ticket.revision !== revision) return;
      const { persistentCache = {} } = await chrome.storage.local.get('persistentCache');
      persistentCache[videoId] = {
        ...analysis,
        hasComments: hasComments || !!persistentCache[videoId]?.hasComments,
        at: Date.now()
      };
      // En güncel 2500 videoyu hafızada tut
      const entries = Object.entries(persistentCache).sort((a, b) => b[1].at - a[1].at).slice(0, 2500);
      await chrome.storage.local.set({ persistentCache: Object.fromEntries(entries) });
    });

    if (ticket.revision !== revision || !(await status()).enabled) throw new Error('Ayarlar değişti; tekrar dene.');
    return { ...analysis, cached: false, enriched: ticket.isEnrich };
  });

  pending.set(taskKey, task);
  try { return await task; } finally { pending.delete(taskKey); }
}

async function handle(message, sender) {
  await ready;
  if (!message || typeof message !== 'object') throw new Error('Geçersiz istek biçimi.');
  if (sender.id !== chrome.runtime.id) throw new Error('Yetkisiz istek.');
  const popup = sender.url?.startsWith(chrome.runtime.getURL('popup.html')) || (!sender.tab && sender.id === chrome.runtime.id);
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
    return analyze(video, message.isWatch === true);
  }

  if (!popup) throw new Error('Bu işlem ayarlar ekranından yapılmalı.');

  if (message?.type === 'save') {
    if (typeof message.key !== 'string' || message.key.trim().length < 8 || message.key.length > 2048 || /[\r\n]/.test(message.key)) {
      throw new Error(message.lang === 'en' ? 'Please enter a valid API key.' : 'Geçerli bir API anahtarı gir.');
    }
    const cleanKey = message.key.trim();
    const remember = message.remember !== false;
    await lock(async () => {
      revision++;
      await chrome.storage.session.set({ apiKey: cleanKey, cooldown: 0 });
      await chrome.storage.local.set({ enabled: true, rememberKey: remember, apiKey: remember ? cleanKey : '' });
    });

    // Notify all active YouTube tabs so user immediately sees results on their active tab without manual reload
    chrome.tabs?.query({ url: '*://*.youtube.com/*' }, tabs => {
      for (const tab of (tabs || [])) {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'activated' }).catch(() => {});
      }
    });

    return status();
  }

  if (message?.type === 'set_lang') {
    const lang = message.lang === 'en' ? 'en' : 'tr';
    await chrome.storage.local.set({ lang });
    chrome.tabs?.query({ url: '*://*.youtube.com/*' }, tabs => {
      for (const tab of (tabs || [])) {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'rescan', lang }).catch(() => {});
      }
    });
    return status();
  }

  if (message?.type === 'toggle') {
    await chrome.storage.local.set({ enabled: message.enabled === true });
    chrome.tabs?.query({ url: '*://*.youtube.com/*' }, tabs => {
      for (const tab of (tabs || [])) {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'activated' }).catch(() => {});
      }
    });
    return status();
  }

  if (message?.type === 'clear') {
    await lock(async () => {
      revision++;
      await chrome.storage.local.set({ persistentCache: {} });
    });
    return status();
  }

  if (message?.type === 'forget') {
    await lock(async () => {
      revision++;
      await chrome.storage.local.set({ enabled: false, apiKey: '', rememberKey: false, persistentCache: {} });
      await chrome.storage.session.remove(['apiKey']);
    });
    return status();
  }

  if (message?.type === 'test') {
    const s = await status();
    if (!s.configured) throw new Error(s.lang === 'en' ? 'Save your API key first.' : 'Önce API anahtarını kaydet.');
    if (!s.enabled) throw new Error(s.lang === 'en' ? 'Enable extension to run test.' : 'Bağlantı testi için eklentiyi etkinleştir.');
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

  const s = await status().catch(() => ({ lang: 'tr' }));
  const isEn = message?.lang === 'en' || s.lang === 'en';
  throw new Error(isEn ? 'Unknown operation.' : 'Bilinmeyen işlem.');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handle(message, sender)
    .then(data => sendResponse({ ok: true, ...data }))
    .catch(error => sendResponse({ ok: false, error: error.message || 'İşlem tamamlanamadı.' }));
  return true;
});
