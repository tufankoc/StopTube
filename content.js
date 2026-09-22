(() => {
  const CARDS = 'ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-video-renderer, ytd-compact-video-renderer, yt-lockup-view-model, ytd-rich-grid-media';
  const records = new Map();
  let enabled = false, scanTimer, stopped = false, lang = 'tr';
  let watchRecord = null, commentsObserver = null;

  const allowed = () => {
    const p = location.pathname;
    return !p.startsWith('/studio') && !p.startsWith('/tv');
  };

  function send(message) {
    return new Promise(resolve => {
      try {
        chrome.runtime.sendMessage(message, response => {
          if (chrome.runtime.lastError) return resolve({ ok: false, error: 'Eklenti yenilendi; sayfayı yenile.' });
          resolve(response || { ok: false, error: 'Jev yanıt vermedi.' });
        });
      } catch {
        stopped = true;
        resolve({ ok: false, error: 'Eklenti yenilendi; sayfayı yenile.' });
      }
    });
  }

  function extractChannelName(card) {
    // 1. Kart içindeki kanal bağlantısı (Ana sayfa, arama, öneriler)
    const inCard = card.querySelector('ytd-channel-name a, #channel-name a, #channel-name, .yt-content-metadata-view-model__metadata-row a, #byline a, #metadata-line a')?.textContent?.trim();
    if (inCard) return inCard;

    // 2. Kanal sayfasındaysak (Videolar sekmesi): sayfa başlığından al
    const inHeader = document.querySelector('yt-page-header-view-model h1, ytd-channel-name#channel-name, #channel-header #channel-name, #inner-header-container #text, #channel-title')?.textContent?.trim();
    if (inHeader) return inHeader;

    // 3. URL @handle fallback
    if (location.pathname.startsWith('/@')) {
      const parts = location.pathname.split('/');
      if (parts[1]) return decodeURIComponent(parts[1]);
    }

    return '';
  }

  function extractDuration(card) {
    const durEl = card.querySelector(
      'ytd-thumbnail-overlay-time-status-renderer span#text, ' +
      'span.ytd-thumbnail-overlay-time-status-renderer, ' +
      '.badge-shape-wiz__text, ' +
      '#time-status span'
    );
    if (!durEl) return null;
    const raw = durEl.textContent || '';
    const match = raw.match(/\b\d{1,2}(?::\d{2}){1,2}\b/);
    return match ? match[0] : null;
  }

  function metadata(card) {
    const anchor = card.querySelector('a#video-title, a#video-title-link, a.yt-lockup-metadata-view-model__title, h3 a[href*="/watch"]')
      || [...card.querySelectorAll('a[href*="/watch?v="]')].find(a => (a.getAttribute('title') || a.textContent || '').trim());
    if (!anchor) return null;

    let url;
    try { url = new URL(anchor.href, location.origin); } catch { return null; }
    const id = url.searchParams.get('v');
    if (url.origin !== location.origin || url.pathname !== '/watch' || !/^[\w-]{11}$/.test(id || '')) return null;

    const title = (anchor.getAttribute('title') || anchor.textContent || '').trim().replace(/\s+/g, ' ');
    if (!title) return null;

    const channel = extractChannelName(card);
    const duration = extractDuration(card);

    // Sadece gerçek arama snippet'i varsa al; kartın genel metin kapsayıcısını ASLA alma
    const descEl = card.querySelector('#description-text, .metadata-snippet-container');
    const description = descEl ? descEl.textContent.trim().replace(/\s+/g, ' ').slice(0, 200) : '';

    return { id, title: title.slice(0, 240), channel: channel.slice(0, 100), description, duration };
  }

  function getThumbContainer(card) {
    return card.querySelector('ytd-thumbnail, .yt-lockup-view-model__media, yt-thumbnail-view-model')
      || card.querySelector('#thumbnail, a#thumbnail, ytd-playlist-thumbnail');
  }

  function updateStamp(record, data, loading = false) {
    const thumb = getThumbContainer(record.card);
    if (!thumb) return;

    record.overlay?.remove();
    record.card.classList.remove('bir-cumle-flagged-stop', 'bir-cumle-flagged-clickbait', 'bir-cumle-flagged-valuable');
    thumb.classList.remove('bir-cumle-thumb-stop', 'bir-cumle-thumb-clickbait');

    if (loading) {
      const loadOverlay = document.createElement('div');
      loadOverlay.className = 'bir-cumle-thumb-overlay bir-cumle-thumb-loading';
      loadOverlay.setAttribute('aria-hidden', 'true');
      const loadText = lang === 'en' ? 'JEV EVALUATING…' : 'JEV TARTIYOR…';
      loadOverlay.innerHTML = `<span class="bir-cumle-thumb-loading-badge">${loadText}</span>`;
      thumb.style.setProperty('position', 'relative', 'important');
      thumb.style.setProperty('overflow', 'hidden', 'important');
      thumb.style.setProperty('border-radius', '12px', 'important');
      thumb.appendChild(loadOverlay);
      record.overlay = loadOverlay;
      return;
    }

    if (!data || !data.verdict) return;

    const overlay = document.createElement('div');
    overlay.className = `bir-cumle-thumb-overlay ${data.cssClass || ''}`;
    overlay.setAttribute('aria-hidden', 'true');

    let icon = '🛑';
    if (data.verdict === 'clickbait') icon = '⚠️';
    if (data.verdict === 'valuable') icon = '✦';
    if (data.verdict === 'entertainment') icon = '✦';
    if (data.verdict === 'other') icon = '✦';

    const isEn = data.lang === 'en' || lang === 'en';
    const wasteLabel = isEn ? 'Waste' : 'Atık';
    const wasteHtml = data.waste !== null ? `<span class="bir-cumle-thumb-waste">${wasteLabel}: %${data.waste}</span>` : '';
    const dislikeHtml = (typeof data.dislikeRatio === 'number' && data.dislikeRatio >= 15)
      ? `<span class="bir-cumle-thumb-dislike ${data.dislikeRatio >= 25 ? 'dislike-alert' : ''}">👎 %${data.dislikeRatio}</span>`
      : '';
    const consensusHtml = data.consensusBadge ? `<span class="bir-cumle-thumb-consensus">${data.consensusBadge}</span>` : '';

    overlay.innerHTML = `
      <div class="bir-cumle-thumb-center">
        <div class="bir-cumle-stamp-header">
          <span class="bir-cumle-stamp-icon">${icon}</span>
          <span class="bir-cumle-stamp-title">${data.badge}</span>
          ${data.subtitle ? `<span class="bir-cumle-stamp-subtitle">${data.subtitle}</span>` : ''}
        </div>
        <p class="bir-cumle-thumb-text">${data.text}</p>
        <div class="bir-cumle-thumb-meta">
          ${wasteHtml}
          ${dislikeHtml}
          ${consensusHtml}
        </div>
      </div>
    `;

    if (data.verdict === 'stop') {
      record.card.classList.add('bir-cumle-flagged-stop');
      thumb.classList.add('bir-cumle-thumb-stop');
    } else if (data.verdict === 'clickbait') {
      record.card.classList.add('bir-cumle-flagged-clickbait');
      thumb.classList.add('bir-cumle-thumb-clickbait');
    } else if (data.verdict === 'valuable') {
      record.card.classList.add('bir-cumle-flagged-valuable');
    }

    thumb.style.setProperty('position', 'relative', 'important');
    thumb.style.setProperty('overflow', 'hidden', 'important');
    thumb.style.setProperty('border-radius', '12px', 'important');

    thumb.appendChild(overlay);
    record.overlay = overlay;
  }

  function render(record, response, error = false, loading = false) {
    if (loading) {
      updateStamp(record, null, true);
      return;
    }

    if (error) {
      record.overlay?.remove();
      const thumb = getThumbContainer(record.card);
      if (thumb) {
        thumb.classList.remove('bir-cumle-thumb-stop', 'bir-cumle-thumb-clickbait');
      }
      record.card.classList.remove('bir-cumle-flagged-stop', 'bir-cumle-flagged-clickbait', 'bir-cumle-flagged-valuable');
      return;
    }

    // Doğrudan görsel üzeri STOP ve teşhis overlay'ini bas
    updateStamp(record, response, false);
  }

  async function run(record) {
    if (document.hidden || record.busy || record.done || !enabled || !allowed()) return;
    record.busy = true;
    record.attempted = true;
    render(record, null, false, true);

    const response = await send({ type: 'analyze', video: record.video, isWatch: false });
    record.busy = false;

    if (records.get(record.card) !== record || !enabled || !allowed()) return;
    record.done = response.ok;
    render(record, response.ok ? response : response.error, !response.ok);
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const record = records.get(entry.target);
        if (record && !record.attempted) run(record);
      }
    }
  }, { rootMargin: '300px', threshold: 0.05 });

  function remove(card, record) {
    observer.unobserve(card);
    record.overlay?.remove();
    card.classList.remove('bir-cumle-flagged-stop', 'bir-cumle-flagged-clickbait', 'bir-cumle-flagged-valuable');
    records.delete(card);
  }

  function scan() {
    if (stopped) return;
    for (const [card, record] of records) {
      if (!card.isConnected || !enabled || !allowed()) remove(card, record);
    }
    if (document.hidden || !enabled || !allowed()) return;

    for (const card of document.querySelectorAll(CARDS)) {
      if (card.parentElement?.closest(CARDS)) continue;
      if (card.closest('ytd-ad-slot-renderer, ytd-promoted-sparkles-web-renderer')) continue;

      const video = metadata(card);
      const old = records.get(card);

      if (!video) {
        if (old) remove(card, old);
        continue;
      }

      const signature = JSON.stringify(video);
      if (old?.signature === signature) {
        const rect = card.getBoundingClientRect();
        if (!old.done && !old.busy && !old.attempted && rect.bottom > 0 && rect.top < innerHeight + 250) {
          run(old);
        }
        continue;
      }

      if (old) remove(card, old);

      // Kart altına ayrı kutu EKLEME! Her şey doğrudan thumbnail görselinin üzerine basılacak!
      const record = { card, video, signature, busy: false, done: false, overlay: null };
      records.set(card, record);

      observer.observe(card);

      const rect = card.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight + 250) {
        run(record);
      }
    }

    scanWatchPage();
  }

  // =========================================================================
  // WATCH SAYFASI: BİLİŞSEL RADAR & İZLEYİCİ KONSENSÜSÜ BANNERI
  // =========================================================================
  function getWatchComments() {
    const commentEls = document.querySelectorAll('ytd-comments#comments ytd-comment-thread-renderer #content-text, #comment-content #content-text');
    return [...commentEls].map(el => (el.textContent || '').trim()).filter(c => c.length > 5).slice(0, 8);
  }

  function getWatchDescription() {
    const descEl = document.querySelector('#description-inline-expander, #description, ytd-text-inline-expander');
    return (descEl ? descEl.textContent : '').trim().replace(/\s+/g, ' ').slice(0, 600);
  }

  function renderWatchBanner(banner, response, error = false, loading = false) {
    const isEn = lang === 'en';
    if (loading) {
      banner.dataset.state = 'loading';
      const badgeText = isEn ? 'COGNITIVE RADAR' : 'BİLİŞSEL RADAR';
      const engineSub = isEn ? 'COMMENTS & DESCRIPTION RADAR' : 'YORUM & AÇIKLAMA ANALİZİ';
      const loadingText = isEn ? 'Scanning viewer comments, description and cognitive value…' : 'İzleyici yorumları, açıklama ve içerik taranıyor…';
      banner.innerHTML = `
        <div class="bir-cumle-watch-inner">
          <div class="bir-cumle-watch-header">
            <span class="bir-cumle-pill bir-cumle-pill-loading">${badgeText}</span>
            <span class="bir-cumle-engine">${engineSub}</span>
          </div>
          <p class="bir-cumle-watch-text">${loadingText}</p>
        </div>
      `;
      return;
    }

    if (error) {
      banner.dataset.state = 'error';
      const errBadge = isEn ? 'ERROR' : 'HATA';
      banner.innerHTML = `
        <div class="bir-cumle-watch-inner">
          <div class="bir-cumle-watch-header">
            <span class="bir-cumle-pill bir-cumle-pill-error">${errBadge}</span>
          </div>
          <p class="bir-cumle-watch-text">${typeof response === 'string' ? response : (response?.error || (isEn ? 'Analysis failed.' : 'Analiz yapılamadı.'))}</p>
        </div>
      `;
      return;
    }

    banner.dataset.state = 'ready';
    banner.dataset.verdict = response.verdict;

    let icon = '🛑';
    if (response.verdict === 'clickbait') icon = '⚠️';
    if (response.verdict === 'valuable') icon = '💡';
    if (response.verdict === 'entertainment') icon = '🍿';

    const respEn = response.lang === 'en' || isEn;
    const wastePrefix = respEn ? 'Waste Risk' : 'Atık Riski';
    const engineTitle = respEn ? 'JEV DEEP RADAR' : 'JEV DERİN RADAR';
    const quoteTitle = respEn ? '💬 Top Viewer Comment:' : '💬 Öne Çıkan Yorum:';

    const wasteHtml = response.waste !== null ? `<span class="bir-cumle-waste-pill ${response.waste >= 65 ? 'waste-high' : response.waste <= 30 ? 'waste-low' : 'waste-mid'}">${wastePrefix}: %${response.waste}</span>` : '';
    const dislikeHtml = (typeof response.dislikeRatio === 'number' && response.dislikeRatio >= 10)
      ? `<span class="bir-cumle-dislike-pill ${response.dislikeRatio >= 25 ? 'dislike-high' : ''}">👎 %${response.dislikeRatio} Dislike</span>`
      : '';
    const consensusHtml = response.consensusBadge ? `<span class="bir-cumle-consensus-pill">${response.consensusBadge}</span>` : '';
    const quoteHtml = response.topQuote ? `<div class="bir-cumle-watch-quote"><span>${quoteTitle}</span> <i>"${response.topQuote}"</i></div>` : '';

    banner.innerHTML = `
      <div class="bir-cumle-watch-inner">
        <div class="bir-cumle-watch-header">
          <div class="bir-cumle-pills">
            <span class="bir-cumle-pill ${response.pillClass || 'bir-cumle-pill-other'}">${icon} ${response.badge} · ${response.subtitle}</span>
            ${wasteHtml}
            ${dislikeHtml}
            ${consensusHtml}
          </div>
          <span class="bir-cumle-engine">${engineTitle}</span>
        </div>
        <p class="bir-cumle-watch-text">${response.text}</p>
        ${quoteHtml}
      </div>
    `;
  }

  async function runWatchAnalysis(video, banner) {
    if (watchRecord && watchRecord.running) return;
    if (!watchRecord) watchRecord = {};
    watchRecord.running = true;
    renderWatchBanner(banner, null, false, true);

    const response = await send({ type: 'analyze', video, isWatch: true });
    watchRecord.running = false;
    watchRecord.done = response.ok;
    renderWatchBanner(banner, response.ok ? response : response.error, !response.ok);
  }

  function scanWatchPage() {
    if (location.pathname !== '/watch' || !enabled) {
      if (watchRecord?.banner) {
        watchRecord.banner.remove();
        watchRecord = null;
      }
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const videoId = urlParams.get('v');
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return;

    const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, #title h1, h1.title');
    const title = titleEl?.textContent?.trim().replace(/\s+/g, ' ');
    if (!title) return;

    const channel = document.querySelector('#owner #channel-name a, ytd-watch-metadata #channel-name a')?.textContent?.trim() || '';
    const description = getWatchDescription();
    const comments = getWatchComments();
    const duration = document.querySelector('.ytp-time-duration')?.textContent?.match(/\b\d{1,2}(?::\d{2}){1,2}\b/)?.[0] || null;

    const mount = document.querySelector('ytd-watch-metadata #above-the-fold, #meta, #description-and-actions');
    if (!mount) return;

    let banner = document.querySelector('.bir-cumle-watch-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'bir-cumle-watch-banner';
      const targetBefore = mount.querySelector('#description, #bottom-row');
      if (targetBefore) {
        mount.insertBefore(banner, targetBefore);
      } else {
        mount.appendChild(banner);
      }
    }

    const sig = JSON.stringify({ id: videoId, title, descLen: description.length, commentCount: comments.length, duration, lang });
    if (watchRecord?.sig === sig) return;

    const video = { id: videoId, title, channel, description, comments, duration, lang };
    watchRecord = { video, banner, sig, running: false, done: false };
    runWatchAnalysis(video, banner);

    if (!commentsObserver) {
      const commentsContainer = document.querySelector('ytd-comments#comments');
      if (commentsContainer) {
        commentsObserver = new MutationObserver(() => {
          const freshComments = getWatchComments();
          if (freshComments.length >= 3 && (!watchRecord?.video?.comments || watchRecord.video.comments.length < freshComments.length)) {
            clearTimeout(scanTimer);
            scanTimer = setTimeout(scan, 800);
          }
        });
        commentsObserver.observe(commentsContainer, { childList: true, subtree: true });
      }
    }
  }

  function schedule() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 200);
  }

  async function refresh() {
    if (stopped || document.hidden) return;
    const state = await send({ type: 'status' });
    enabled = state.ok && state.enabled && state.configured;
    if (state.lang) lang = state.lang;
    scan();
  }

  // Real-time notification from popup (immediate card analysis upon saving key)
  try {
    chrome.runtime.onMessage?.addListener(message => {
      if (message?.type === 'activated' || message?.type === 'rescan') {
        if (message.lang) lang = message.lang;
        refresh();
      }
    });

    chrome.storage?.onChanged?.addListener(() => {
      refresh();
    });
  } catch {}

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'title']
  });

  document.addEventListener('yt-navigate-finish', refresh);
  document.addEventListener('yt-page-data-updated', refresh);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('popstate', refresh);
  window.addEventListener('focus', refresh);
  setInterval(refresh, 5000);
  refresh();
})();
