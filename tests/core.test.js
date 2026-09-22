import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanVideo,
  requestFor,
  analysisFor,
  evaluate,
  computeClickbaitHeuristics,
  computeSponsorHeuristics,
  parseDurationToSeconds,
  fetchDislikeStats,
  VERDICTS,
  CONSENSUS_BADGES
} from '../core.js';

test('cleanVideo: geçerli video girdilerini temizler ve doğrular', () => {
  const input = {
    id: 'dQw4w9WgXcQ',
    title: '   Harika Video Başlığı \n\t  ',
    channel: '  Test Kanalı  ',
    description: '  Video açıklaması  ',
    comments: ['İlk yorum burada', 'İkinci yorum', 'ab', 'Geçersiz kısa']
  };

  const cleaned = cleanVideo(input);
  assert.ok(cleaned, 'cleanVideo nesne döndürmeli');
  assert.equal(cleaned.id, 'dQw4w9WgXcQ');
  assert.equal(cleaned.title, 'Harika Video Başlığı');
  assert.equal(cleaned.channel, 'Test Kanalı');
  assert.equal(cleaned.description, 'Video açıklaması');
  // 'ab' 3 karakterden kısa olduğu için elenmeli
  assert.deepEqual(cleaned.comments, ['İlk yorum burada', 'İkinci yorum', 'Geçersiz kısa']);
});

test('cleanVideo: geçersiz veya eksik girdilerde null döndürür', () => {
  assert.equal(cleanVideo(null), null);
  assert.equal(cleanVideo({}), null);
  assert.equal(cleanVideo({ id: 'kisa', title: 'Başlık' }), null, '11 karakter olmayan ID elenmeli');
  assert.equal(cleanVideo({ id: 'dQw4w9WgXcQ', title: '' }), null, 'Boş başlık elenmeli');
  assert.equal(cleanVideo({ id: 'dQw4w9WgXcQ', title: '   ' }), null, 'Sadece boşluk içeren başlık elenmeli');
  assert.equal(cleanVideo({ id: 'invalid!@#$%', title: 'Geçersiz Karakter' }), null, 'Geçersiz ID karakterleri elenmeli');
});

test('requestFor: TypeSafe Jev System One soru yapısını eksiksiz üretir', () => {
  const video = {
    id: 'dQw4w9WgXcQ',
    title: 'Test Başlığı',
    channel: 'Kanal',
    description: 'Uzun ve detaylı açıklama burada',
    comments: ['Yorum 1', 'Yorum 2']
  };

  const req = requestFor(video);
  assert.equal(req.model, 'jev-latest');
  assert.equal(req.state.title, 'Test Başlığı');
  assert.equal(req.state.channel, 'Kanal');
  assert.equal(req.state.description, 'Uzun ve detaylı açıklama burada');
  assert.deepEqual(req.state.comments, ['Yorum 1', 'Yorum 2']);

  // Soru matrisi kontrolü
  assert.ok(req.questions.verdict, 'verdict sorusu bulunmalı');
  assert.equal(req.questions.verdict.type, 'choice');
  assert.ok(req.questions.audience_consensus, 'audience_consensus sorusu bulunmalı');
  assert.equal(req.questions.audience_consensus.type, 'choice');
  assert.ok(req.questions.content_flaw, 'content_flaw sorusu bulunmalı');
  assert.ok(req.questions.is_time_waste, 'is_time_waste sorusu bulunmalı');
  assert.equal(req.questions.is_time_waste.type, 'noul');
});

test('analysisFor: STOP kararını doğru sınıflandırır ve atık oranını işler', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Oda Turu 2026', channel: 'Vlog' };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'stop', confidence: 0.92 },
      content_flaw: { type: 'choice', choice: 'consumer_inventory', confidence: 0.88 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.75 }
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'stop');
  assert.equal(res.badge, 'STOP');
  assert.equal(res.subtitle, 'ZAMAN KAYBI');
  assert.equal(res.cssClass, 'stamp-stop');
  assert.equal(res.waste, 75);
  assert.equal(res.confidence, 0.92);
  // Yorum olmadığı için consensusBadge null olmalı (UI kirliliği önleme)
  assert.equal(res.consensusBadge, null);
  assert.ok(res.text.includes('Kişisel eşya vitrini'), 'Teşhis metni consumer_inventory açıklamasını içermeli');
});

test('analysisFor: İZLENİR / DEĞERLİ kararını başarıyla üretir', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Derin Kuantum Fiziği', channel: 'Bilim' };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'valuable', confidence: 0.95 },
      content_flaw: { type: 'choice', choice: 'analytical_review', confidence: 0.9 },
      audience_consensus: { type: 'choice', choice: 'positive_valuable', confidence: 0.9 },
      is_time_waste: { type: 'noul', noul: 0.12 }
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'valuable');
  assert.equal(res.badge, 'İZLENİR');
  assert.equal(res.subtitle, 'DEĞERLİ');
  assert.equal(res.cssClass, 'stamp-valuable');
  assert.equal(res.waste, 12);
  assert.equal(res.consensusBadge, CONSENSUS_BADGES.positive_valuable);
});

test('analysisFor: İzleyici konsensüsü negatifse kararı STOP seviyesine yükseltir (Consensus Override)', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Belirsiz Başlık', channel: 'Test' };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'other', confidence: 0.4 },
      content_flaw: { type: 'choice', choice: 'other', confidence: 0.3 },
      audience_consensus: { type: 'choice', choice: 'negative_waste', confidence: 0.85 },
      is_time_waste: { type: 'noul', noul: 0.50 }
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'stop', 'Negatif konsensüs durumunda karar STOP yapılmalı');
  assert.equal(res.badge, 'STOP');
});

test('analysisFor: Atık oranı >= %65 olduğunda nötr kararı STOP yapar', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Kararsız Başlık', channel: 'Test' };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'other', confidence: 0.3 },
      content_flaw: { type: 'choice', choice: 'other', confidence: 0.3 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.70 } // %70 atık riski
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'stop', '%65 üzeri atık riski STOP yapmalı');
});

test('evaluate: Başarılı API çağrısında çözümleme nesnesi döndürür', async () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'React Performance Guide', channel: 'Dev' };
  const mockFetch = async (url, options) => {
    assert.equal(url, 'https://api.typesafe.ai/v1/systemone');
    assert.equal(options.headers.Authorization, 'Bearer test_key_123');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        answers: {
          verdict: { type: 'choice', choice: 'valuable', confidence: 0.9 },
          content_flaw: { type: 'choice', choice: 'technical_guide', confidence: 0.9 },
          audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
          is_time_waste: { type: 'noul', noul: 0.05 }
        }
      })
    };
  };

  const result = await evaluate(video, 'test_key_123', mockFetch);
  assert.equal(result.verdict, 'valuable');
  assert.equal(result.badge, 'İZLENİR');
  assert.equal(result.waste, 5);
});

test('evaluate: Hatalı API anahtarında 401 hatasını yakalar ve net mesaj verir', async () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Test Video', channel: 'Test' };
  const mockFetch = async () => ({
    ok: false,
    status: 401
  });

  await assert.rejects(
    async () => await evaluate(video, 'bad_key', mockFetch),
    { message: 'API anahtarı geçersiz.' }
  );
});

test('evaluate: Kota aşımında 429 hatasını yakalar', async () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Test Video', channel: 'Test' };
  const mockFetch = async () => ({
    ok: false,
    status: 429
  });

  await assert.rejects(
    async () => await evaluate(video, 'valid_key', mockFetch),
    { message: 'Jev kullanım sınırı; bir dakika sonra tekrar dene.' }
  );
});

test('computeClickbaitHeuristics: Sansasyonel başlıkları, CAPS ve noktalama tuzaklarını tespit eder', () => {
  const clickbait1 = computeClickbaitHeuristics('TÜM GERÇEKLERİ İFŞA ETTİM! KİMSE BİLMİYOR??!');
  assert.ok(clickbait1.clickbaitScore >= 70, 'Yüksek tık tuzağı skoru vermeli');
  assert.equal(clickbait1.isHeuristicClickbait, true);
  assert.ok(clickbait1.triggers.includes('İfşa'));
  assert.ok(clickbait1.triggers.includes('Aşırı Noktalama'));
  assert.ok(clickbait1.triggers.includes('TAMAMI BÜYÜK HARF'));

  const clickbait2 = computeClickbaitHeuristics('İNANILMAZ ANLAR! SAKIN İZLEMEDEN GEÇMEYİN...');
  assert.ok(clickbait2.clickbaitScore >= 60);
  assert.equal(clickbait2.isHeuristicClickbait, true);

  const clean = computeClickbaitHeuristics('TypeScript 5.5 Tip Çıkarımı ve Performans Rehberi');
  assert.equal(clean.clickbaitScore, 0);
  assert.equal(clean.isHeuristicClickbait, false);
  assert.equal(clean.triggers.length, 0);

  const empty = computeClickbaitHeuristics('');
  assert.equal(empty.clickbaitScore, 0);
  assert.equal(empty.isHeuristicClickbait, false);
});

test('cleanVideo: Süre (duration) ve Dislike istatistiklerini güvenle temizler ve saklar', () => {
  const input = {
    id: 'dQw4w9WgXcQ',
    title: 'Harika Video',
    channel: 'Kanal',
    duration: '  14:20  \n',
    dislikeRatio: 32,
    dislikeCount: 4500,
    likeCount: 9500
  };

  const cleaned = cleanVideo(input);
  assert.equal(cleaned.duration, '14:20');
  assert.equal(cleaned.dislikeRatio, 32);
  assert.equal(cleaned.dislikeCount, 4500);
  assert.equal(cleaned.likeCount, 9500);
});

test('requestFor: Süre, dislike oranı ve tık tuzağı şüphe bayraklarını state içine ekler', () => {
  const video = {
    id: 'dQw4w9WgXcQ',
    title: 'ŞOK! İNANILMAZ İFŞA GELDİ!!!',
    channel: 'Sansasyon',
    duration: '08:45',
    dislikeRatio: 40
  };

  const req = requestFor(video);
  assert.equal(req.state.duration, '08:45');
  assert.equal(req.state.dislike_percentage, '40%');
  assert.ok(req.state.clickbait_suspicion, 'clickbait_suspicion bulunmalı');
  assert.ok(Array.isArray(req.state.title_flags), 'title_flags bulunmalı');
});

test('analysisFor: Yüksek dislike oranı (%25+) kararı STOP/Clickbait seviyesine yükseltir (Dislike Override)', () => {
  const video = {
    id: 'dQw4w9WgXcQ',
    title: 'Sıradan Bir Başlık',
    channel: 'Test Kanalı'
  };

  // Model 'other' dese bile yüksek dislike STOP'a zorlamalı
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'other', confidence: 0.5 },
      content_flaw: { type: 'choice', choice: 'other', confidence: 0.5 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.3 }
    }
  };

  const extra = {
    dislikeRatio: 35,
    dislikes: 12000,
    likes: 22000
  };

  const res = analysisFor(video, mockJevResponse, extra);
  assert.equal(res.verdict, 'stop');
  assert.equal(res.badge, 'STOP');
  assert.equal(res.dislikeRatio, 35);
  assert.ok(res.waste >= 70, 'Atık riski dislike oranıyla orantılı yükseltilmeli');
  assert.ok(res.text.includes('%35 dislike oranı'), 'Dislike topluluk açıklaması eklenmeli');
});

test('analysisFor: Başlık bariz tık tuzağıysa ve model kararsızsa tık tuzağına yükseltir (Heuristic Override)', () => {
  const video = {
    id: 'dQw4w9WgXcQ',
    title: 'ŞOK İFŞA! KİMSE BUNU BİLMİYOR?!?!',
    channel: 'Magazin'
  };

  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'other', confidence: 0.3 },
      content_flaw: { type: 'choice', choice: 'other', confidence: 0.3 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.4 }
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'clickbait', 'Heuristik tık tuzağı kararı clickbait yapmalı');
  assert.equal(res.badge, 'TIK TUZAĞI');
  assert.ok(res.waste >= 65);
});

test('evaluate: Return YouTube Dislike (RYD) ekstra verilerini başarıyla işler', async () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Python Eğitimi', channel: 'Kod', duration: '25:00' };
  const mockFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      answers: {
        verdict: { type: 'choice', choice: 'valuable', confidence: 0.95 },
        content_flaw: { type: 'choice', choice: 'technical_guide', confidence: 0.95 },
        audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
        is_time_waste: { type: 'noul', noul: 0.05 }
      }
    })
  });

  const dislikeExtra = { dislikeRatio: 2, dislikes: 20, likes: 980 };
  const result = await evaluate(video, 'valid_key', mockFetch, dislikeExtra);
  assert.equal(result.verdict, 'valuable');
  assert.equal(result.duration, '25:00');
  assert.equal(result.dislikeRatio, 2);
  assert.equal(result.dislikeCount, 20);
  assert.equal(result.likeCount, 980);
});

test('fetchDislikeStats: API yanıtını doğru oranla ayrıştırır ve hatalarda null döner', async () => {
  // Başarılı yanıt
  const mockFetchSuccess = async (url) => {
    assert.ok(url.includes('dQw4w9WgXcQ'));
    return {
      ok: true,
      json: async () => ({
        id: 'dQw4w9WgXcQ',
        likes: 8000,
        dislikes: 2000,
        viewCount: 150000
      })
    };
  };

  const res = await fetchDislikeStats('dQw4w9WgXcQ', mockFetchSuccess);
  assert.ok(res);
  assert.equal(res.likes, 8000);
  assert.equal(res.dislikes, 2000);
  assert.equal(res.dislikeRatio, 20); // 2000 / (8000 + 2000) = %20
  assert.equal(res.viewCount, 150000);

  // 404 / API hatası
  const mockFetch404 = async () => ({ ok: false, status: 404 });
  const res404 = await fetchDislikeStats('dQw4w9WgXcQ', mockFetch404);
  assert.equal(res404, null, 'Hatalı yanıtta null dönmeli');

  // Ağ hatası veya zaman aşımı
  const mockFetchError = async () => { throw new Error('Ağ koptu'); };
  const resError = await fetchDislikeStats('dQw4w9WgXcQ', mockFetchError);
  assert.equal(resError, null, 'İstisna fırlatılan durumda güvenle null dönmeli');

  // Geçersiz ID
  assert.equal(await fetchDislikeStats(null), null);
  assert.equal(await fetchDislikeStats(''), null);
});

test('analysisFor (İngilizce Dil Desteği): lang="en" iken İngilizce damga, rozet ve teşhis metinleri üretir', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Room Tour 2026', channel: 'Vlog' };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'stop', confidence: 0.94 },
      content_flaw: { type: 'choice', choice: 'consumer_inventory', confidence: 0.9 },
      audience_consensus: { type: 'choice', choice: 'negative_waste', confidence: 0.88 },
      is_time_waste: { type: 'noul', noul: 0.82 }
    }
  };

  const res = analysisFor(video, mockJevResponse, { lang: 'en' });
  assert.equal(res.verdict, 'stop');
  assert.equal(res.badge, 'STOP');
  assert.equal(res.subtitle, 'TIME WASTE');
  assert.equal(res.consensusBadge, 'Audience: Waste of Time 👎');
  assert.ok(res.text.includes('Personal gear showcase') || res.text.includes('Sponsored product showcase'));

  // Valuable test in English
  const valVideo = { id: 'dQw4w9WgXcQ', title: 'Quantum Computing Explained', channel: 'Science' };
  const valResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'valuable', confidence: 0.95 },
      content_flaw: { type: 'choice', choice: 'analytical_review', confidence: 0.9 },
      audience_consensus: { type: 'choice', choice: 'positive_valuable', confidence: 0.9 },
      is_time_waste: { type: 'noul', noul: 0.08 }
    }
  };
  const valRes = analysisFor(valVideo, valResponse, { lang: 'en' });
  assert.equal(valRes.badge, 'VALUABLE');
  assert.equal(valRes.subtitle, 'MUST WATCH');
  assert.equal(valRes.consensusBadge, 'Audience: High Value 👍');
});

test('requestFor: is_clickbait (noul) ve knowledge_density (choice) sorularını içerir', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Advanced Systems', channel: 'Tech' };
  const req = requestFor(video);
  assert.ok(req.questions.is_clickbait, 'is_clickbait sorusu bulunmalı');
  assert.equal(req.questions.is_clickbait.type, 'noul');
  assert.ok(req.questions.knowledge_density, 'knowledge_density sorusu bulunmalı');
  assert.equal(req.questions.knowledge_density.type, 'choice');
});

test('analysisFor: is_clickbait noul >= %70 olduğunda tık tuzağına yükseltir', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Sıradan Bir Başlık', channel: 'Test' };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'other', confidence: 0.4 },
      content_flaw: { type: 'choice', choice: 'other', confidence: 0.4 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.4 },
      is_clickbait: { type: 'noul', noul: 0.85 } // %85 tık tuzağı
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'clickbait', 'Yüksek is_clickbait noul kararı clickbait yapmalı');
  assert.equal(res.badge, 'TIK TUZAĞI');
  assert.ok(res.waste >= 65);
});

test('analysisFor: knowledge_density="deep" ve düşük atık riskinde nötr kararı VALUABLE yapar', () => {
  const video = { id: 'dQw4w9WgXcQ', title: 'Karmaşık Dağıtık Sistemler Mimarisi', channel: 'Mühendislik' };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'other', confidence: 0.4 },
      content_flaw: { type: 'choice', choice: 'technical_guide', confidence: 0.7 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.15 },
      knowledge_density: { type: 'choice', choice: 'deep', confidence: 0.9 }
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'valuable', 'Derin bilgi yoğunluğu kararı VALUABLE yapmalı');
  assert.equal(res.badge, 'İZLENİR');
});

test('computeSponsorHeuristics: sponsor, reklam, iş birliği ve indirim kodu kalıplarını yakalar', () => {
  const t1 = computeSponsorHeuristics('Yeni Telefon Kutudan Çıkıyor #işbirliği', 'İndirim kodu TUFAN20 ile linkler aşağıda');
  assert.equal(t1.isSponsored, true);
  assert.ok(t1.sponsorTriggers.includes('İş Birliği'));
  assert.ok(t1.sponsorTriggers.includes('İndirim/Promosyon Kodu'));
  assert.ok(t1.sponsorTriggers.includes('Ortaklık/Satış Linki'));
  assert.ok(t1.sponsorScore >= 70);

  const t2 = computeSponsorHeuristics('Rust Programlama Dili Rehberi', 'Sıfırdan ileri seviyeye mimari dersi.');
  assert.equal(t2.isSponsored, false);
  assert.equal(t2.sponsorScore, 0);
});

test('parseDurationToSeconds: video süresini saniyeye doğru ayrıştırır', () => {
  assert.equal(parseDurationToSeconds('14:20'), 860);
  assert.equal(parseDurationToSeconds('1:02:15'), 3735);
  assert.equal(parseDurationToSeconds('0:45'), 45);
  assert.equal(parseDurationToSeconds(''), null);
  assert.equal(parseDurationToSeconds(null), null);
  assert.equal(parseDurationToSeconds('geçersiz'), null);
});

test('analysisFor: Sponsorlu reklam vitrini (hasPaidPromotion) tespitinde STOP seviyesine yükseltir (Sponsor Override)', () => {
  const video = {
    id: 'dQw4w9WgXcQ',
    title: 'Yeni Favori Ürünlerim #işbirliği',
    channel: 'Lifestyle',
    description: 'Tüm sponsorlu ürünlerin linkleri aşağıdadır.',
    hasPaidPromotion: true
  };
  const mockJevResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'other', confidence: 0.4 },
      content_flaw: { type: 'choice', choice: 'consumer_inventory', confidence: 0.8 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.5 }
    }
  };

  const res = analysisFor(video, mockJevResponse);
  assert.equal(res.verdict, 'stop', 'Sponsorlu tüketim vitrini STOP olmalı');
  assert.equal(res.badge, 'STOP');
  assert.equal(res.hasPaidPromotion, true);
  assert.ok(res.waste >= 75);
  assert.ok(res.text.includes('Sponsorlu ürün tanıtımı'));
});

test('analysisFor: Süre Modifiyeri (8-12 dk mid-roll reklam padding ve 20+ dk boş vlog)', () => {
  // 1. 8-12 dakika tık tuzağı: atık oranını en az %70 yapar
  const padVideo = { id: 'dQw4w9WgXcQ', title: 'İNANILMAZ ŞOK GELİŞME!', channel: 'Haber', duration: '10:04' };
  const padResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'clickbait', confidence: 0.8 },
      content_flaw: { type: 'choice', choice: 'sensational_clickbait', confidence: 0.8 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.55 }
    }
  };
  const padRes = analysisFor(padVideo, padResponse);
  assert.equal(padRes.verdict, 'clickbait');
  assert.ok(padRes.waste >= 70, '10 dakikalık mid-roll reklam tuzağında atık oranı yükseltilmeli');
  assert.equal(padRes.durationSeconds, 604);

  // 2. 20+ dakika içi boş vlog: atık oranını en az %80 yapar
  const longVideo = { id: 'dQw4w9WgXcQ', title: 'YURT ODASI TURU', channel: 'Vlog', duration: '24:30' };
  const longResponse = {
    answers: {
      verdict: { type: 'choice', choice: 'stop', confidence: 0.85 },
      content_flaw: { type: 'choice', choice: 'consumer_inventory', confidence: 0.85 },
      audience_consensus: { type: 'choice', choice: 'no_comments', confidence: 0.5 },
      is_time_waste: { type: 'noul', noul: 0.70 }
    }
  };
  const longRes = analysisFor(longVideo, longResponse);
  assert.equal(longRes.verdict, 'stop');
  assert.ok(longRes.waste >= 80, '20+ dakikalık boş vlogda atık oranı %80 üzerine çıkarılmalı');
  assert.equal(longRes.durationSeconds, 1470);
});



