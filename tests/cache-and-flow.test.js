import test from 'node:test';
import assert from 'node:assert/strict';

// Mock Chrome Storage implementation for realistic integration testing
function createMockChromeStorage() {
  const localStore = new Map();
  const sessionStore = new Map();

  return {
    local: {
      get: async (defaults) => {
        const result = {};
        for (const [key, defVal] of Object.entries(defaults)) {
          result[key] = localStore.has(key) ? JSON.parse(JSON.stringify(localStore.get(key))) : defVal;
        }
        return result;
      },
      set: async (items) => {
        for (const [key, val] of Object.entries(items)) {
          localStore.set(key, JSON.parse(JSON.stringify(val)));
        }
      },
      remove: async (keys) => {
        for (const key of [keys].flat()) localStore.delete(key);
      },
      _dump: () => Object.fromEntries(localStore)
    },
    session: {
      get: async (defaults) => {
        const result = {};
        for (const [key, defVal] of Object.entries(defaults)) {
          result[key] = sessionStore.has(key) ? JSON.parse(JSON.stringify(sessionStore.get(key))) : defVal;
        }
        return result;
      },
      set: async (items) => {
        for (const [key, val] of Object.entries(items)) {
          sessionStore.set(key, JSON.parse(JSON.stringify(val)));
        }
      },
      remove: async (keys) => {
        for (const key of [keys].flat()) sessionStore.delete(key);
      },
      _clear: () => sessionStore.clear()
    }
  };
}

test('2-Kademeli Önbellek Akışı: 1. Kademe (Akış) ve 2. Kademe (Watch Yorum Zenginleştirmesi)', async () => {
  const mockStorage = createMockChromeStorage();
  let apiCallCount = 0;

  // Mock evaluate fonksiyonu
  async function mockEvaluate(video, key) {
    apiCallCount++;
    const hasComments = Array.isArray(video.comments) && video.comments.length >= 2;
    return {
      verdict: hasComments ? 'stop' : 'other',
      badge: hasComments ? 'STOP' : 'BELİRSİZ',
      subtitle: hasComments ? 'ZAMAN KAYBI' : 'NÖTR',
      text: hasComments ? 'İzleyiciler zaman kaybı olduğunu doğruladı.' : 'Başlık belirsiz.',
      waste: hasComments ? 80 : 40,
      hasAudienceFeedback: hasComments
    };
  }

  // Simüle edilmiş background analyze motoru
  async function analyzeVideo(video, isWatch, key) {
    const videoId = video.id;
    const { persistentCache = {} } = await mockStorage.local.get({ persistentCache: {} });
    const hit = persistentCache[videoId];

    // 1. Kademe: Zaten önbellekte varsa ve watch yorumu gerektirmiyorsa 0 ms doğrudan dön
    const hasEnoughComments = Array.isArray(video.comments) && video.comments.length >= 2;
    if (hit && (!isWatch || hit.hasComments || !hasEnoughComments)) {
      return { ...hit, cached: true };
    }

    // API çağrısı yap
    const analysis = await mockEvaluate(video, key);
    const hasComments = isWatch && hasEnoughComments;

    persistentCache[videoId] = {
      ...analysis,
      hasComments: hasComments || !!hit?.hasComments,
      at: Date.now()
    };
    await mockStorage.local.set({ persistentCache });

    return { ...analysis, cached: false, enriched: (isWatch && !!hit) };
  }

  const video = {
    id: 'testVideo123',
    title: 'Yeni Telefon İncelemesi',
    channel: 'TechChannel'
  };

  // 1. ADIM: Ana sayfada kart göründü (İlk tarama)
  const step1 = await analyzeVideo(video, false, 'api_key');
  assert.equal(apiCallCount, 1, 'İlk taramada API çağrısı yapılmalı');
  assert.equal(step1.cached, false);
  assert.equal(step1.verdict, 'other');

  // 2. ADIM: Sayfa yenilendi / kullanıcı tekrar gezindi
  const step2 = await analyzeVideo(video, false, 'api_key');
  assert.equal(apiCallCount, 1, 'Önbellekte olduğu için API çağrısı ASLA yapılmamalı (0 ms)');
  assert.equal(step2.cached, true, 'Önbellekten gelmeli');

  // 3. ADIM: Tarayıcı kapandı, yeni oturum açıldı (Session storage sıfırlandı)
  mockStorage.session._clear();
  const step3 = await analyzeVideo(video, false, 'api_key');
  assert.equal(apiCallCount, 1, 'Kalıcı local storage sayesinde tarayıcı yeniden başlasa da API çağrısı yapılmamalı');
  assert.equal(step3.cached, true);

  // 4. ADIM: Kullanıcı videoya tıkladı (/watch sayfası) ve yorumlar yüklendi
  const watchVideo = {
    ...video,
    comments: [
      'Abi 10 dakika boyunca hiçbir şey anlatmamışsın vakit kaybı',
      'Tamamen sponsorlu içerik sakın izlemeyin'
    ]
  };

  const step4 = await analyzeVideo(watchVideo, true, 'api_key');
  assert.equal(apiCallCount, 2, 'Watch sayfasında ilk kez yorumlar geldiğinde 2. kademe zenginleştirme çağrısı yapılmalı');
  assert.equal(step4.cached, false);
  assert.equal(step4.enriched, true, 'Zenginleştirme bayrağı true olmalı');
  assert.equal(step4.verdict, 'stop', 'Yorumlar analizi STOP seviyesine yükseltmeli');

  // 5. ADIM: Kullanıcı videodan çıktı ve ana sayfada aynı videoyu tekrar gördü
  const step5 = await analyzeVideo(video, false, 'api_key');
  assert.equal(apiCallCount, 2, 'Daha önce zenginleştirilen video için yeni API çağrısı yapılmamalı');
  assert.equal(step5.cached, true);
  assert.equal(step5.verdict, 'stop', 'Zenginleştirilmiş STOP kararı kalıcı hafızada korunmalı');
});

test('LRU Önbellek Boyutu: 2500 videoyu aşınca en eski kayıtları güvenle temizler', async () => {
  const cache = {};
  for (let i = 0; i < 2600; i++) {
    cache[`vid_${i}`] = { at: i, verdict: 'valuable' };
  }

  // LRU pruning
  const entries = Object.entries(cache).sort((a, b) => b[1].at - a[1].at).slice(0, 2500);
  const pruned = Object.fromEntries(entries);

  assert.equal(Object.keys(pruned).length, 2500);
  assert.equal(pruned['vid_0'], undefined, 'En eski vid_0 silinmiş olmalı');
  assert.equal(pruned['vid_2599']?.verdict, 'valuable', 'En yeni vid_2599 korunmuş olmalı');
});
