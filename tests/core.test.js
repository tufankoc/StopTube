import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanVideo, requestFor, analysisFor, evaluate, VERDICTS, CONSENSUS_BADGES } from '../core.js';

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
