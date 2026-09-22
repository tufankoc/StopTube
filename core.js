/**
 * Bir Cümle · Jev for YouTube
 * Bilişsel Zaman Değeri, STOP Radarı & İzleyici Yorum Konsensüsü Motoru
 */

export const VERDICTS = {
  stop: {
    badge: 'STOP',
    subtitle: 'ZAMAN KAYBI',
    cssClass: 'stamp-stop',
    pillClass: 'bir-cumle-pill-stop',
    reasons: {
      consumer_inventory: 'Kişisel eşya vitrini, oda turu veya bavul hazırlığı; somut bilgi içermeyen rutin kişisel vlog. Zaman kaybı, izlemeye değmez.',
      sensational_clickbait: 'İçi boş abartılı başlık; merak sömürüsü haricinde kayda değer bir bilgi barındırmıyor. Zaman kaybı.',
      reaction_or_humor: 'Sıradan tepki veya montaj videosu; bilgi değeri sıfır, zaman kaybı.',
      technical_guide: 'Yüzeysel veya kurgusal rehber; somut teknik derinlikten yoksun, vakit hırsızı.',
      analytical_review: 'Rutin sponsorlu tanıtım; bağımsız veya analitik bir inceleme değeri taşımıyor.',
      default: 'Düşük bilgi yoğunluğu ve vakit hırsızı içerik; somut bir kazanım sağlamaz.'
    },
    consensusReasons: {
      negative_waste: 'İzleyiciler ve açıklama teyit ediyor: Yalnızca sponsorlu vitrin ve boş muhabbet; somut bilgi yok, net zaman kaybı.',
      mixed_feedback: 'İzleyici yorumları uyuşuk veya yüzeysel buluyor; vadedilen derinlik yok, izlemeye değmeyebilir.'
    }
  },
  clickbait: {
    badge: 'TIK TUZAĞI',
    subtitle: 'DİKKAT',
    cssClass: 'stamp-clickbait',
    pillClass: 'bir-cumle-pill-clickbait',
    reasons: {
      sensational_clickbait: 'Abartılı merak ve panik yemi; başlık tıklama tuzağı (clickbait), vadedilen somut içerik fos çıkabilir.',
      consumer_inventory: 'Gizemli/abartılı başlık arkasına saklanmış standart tüketim tanıtımı.',
      reaction_or_humor: 'Dramatize edilmiş kurgu veya tepki videosu; başlık beklentiyi yükseltiyor.',
      default: 'Şişirilmiş vaat veya yapay merak tuzağı; bilgi yoğunluğu düşük olabilir, temkinli ol.'
    },
    consensusReasons: {
      negative_waste: 'İzleyici yorumları uyarıyor: Başlık abartılı tık tuzağı (clickbait); içerik vaadi karşılamıyor, boşuna izlemeyin.',
      mixed_feedback: 'İzleyiciler başlığın yanıltıcı olduğunu ve konunun yalnızca son birkaç dakikada yüzeysel geçildiğini belirtiyor.'
    }
  },
  valuable: {
    badge: 'İZLENİR',
    subtitle: 'DEĞERLİ',
    cssClass: 'stamp-valuable',
    pillClass: 'bir-cumle-pill-valuable',
    reasons: {
      analytical_review: 'Derinlikli belgesel veya analitik inceleme; somut araştırma içerir, izlemeye değer.',
      technical_guide: 'Uygulamalı teknik rehber; doğrudan beceri veya somut problem çözümüne odaklı, izlemeye değer.',
      default: 'Yüksek bilgi yoğunluğuna sahip somut içerik; zaman ayırmaya değer.'
    },
    consensusReasons: {
      positive_valuable: 'İzleyiciler onaylıyor: İçerik son derece öğretici, doğrudan konuya giren ve teknik derinliği yüksek bir kaynak. İzlemeye değer.'
    }
  },
  entertainment: {
    badge: 'EĞLENCE',
    subtitle: 'KEYFÎ',
    cssClass: 'stamp-entertainment',
    pillClass: 'bir-cumle-pill-entertainment',
    reasons: {
      reaction_or_humor: 'Kafa dağıtmalık mizah, skeç veya oyun içeriği; bilgi beklentisi olmadan keyfî izlenebilir.',
      default: 'Vakit geçirme ve kafa dinleme amaçlı eğlence içeriği.'
    },
    consensusReasons: {
      casual_chitchat: 'İzleyiciler keyifli ve eğlenceli bir vakit geçirme içeriği olduğunu belirtiyor; bilgi beklentisi olmadan izlenebilir.'
    }
  },
  other: {
    badge: 'BELİRSİZ',
    subtitle: 'NÖTR',
    cssClass: 'stamp-other',
    pillClass: 'bir-cumle-pill-other',
    reasons: {
      default: 'Başlık ve açıklama, içeriğin değerini veya zaman maliyetini netleştirmek için çok genel veya belirsiz.'
    }
  }
};

export const CONSENSUS_BADGES = {
  negative_waste: 'İzleyiciler: Zaman Kaybı 👎',
  mixed_feedback: 'İzleyiciler: Kararsız / Yüzeysel 🤔',
  positive_valuable: 'İzleyiciler: Çok Faydalı 👍',
  casual_chitchat: 'İzleyiciler: Eğlencelik 🍿',
  no_comments: 'Yorum Verisi Yok'
};

const tidy = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim() : '';

export function cleanVideo(value) {
  if (!value || !/^[A-Za-z0-9_-]{11}$/.test(value.id) || !tidy(value.title)) return null;
  return {
    id: value.id,
    title: tidy(value.title).slice(0, 240),
    channel: tidy(value.channel).slice(0, 100),
    description: tidy(value.description || '').slice(0, 500),
    comments: Array.isArray(value.comments) ? value.comments.map(tidy).filter(c => c.length > 3).slice(0, 8) : []
  };
}

export function requestFor(video) {
  const state = {
    title: video.title,
    channel: video.channel
  };
  if (video.description && video.description.length > 10) {
    state.description = video.description;
  }
  if (Array.isArray(video.comments) && video.comments.length > 0) {
    state.comments = video.comments;
  }

  return {
    model: 'jev-latest',
    state,
    questions: {
      verdict: {
        type: 'choice',
        instructions: 'Classify the cognitive time-value of this video based on its title and channel. Is this video a superficial time-waste/personal vlog/room tour, sensational clickbait trap, high-value documentary/educational guide, or casual comedy/entertainment?',
        criteria: {
          stop: 'Superficial time-waste, personal vlog, room/dorm/house tour, packing haul, routine gear flex, shopping flex, or low-density filler that wastes viewer time.',
          clickbait: 'Misleading clickbait, artificial panic/urgency, or curiosity trap where content fails to deliver on the title promises.',
          valuable: 'Substantive documentary, technical guide, in-depth educational tutorial, investigative journalism, or high knowledge density.',
          entertainment: 'Casual entertainment, sketch comedy, humor, gaming, or relaxation without educational pretense.',
          other: 'Ambiguous title or insufficient evidence.'
        }
      },
      audience_consensus: {
        type: 'choice',
        instructions: 'What is the primary sentiment and consensus of the audience comments and description (if provided)?',
        criteria: {
          negative_waste: 'Audience calls out the video as a time waste, sponsored ad, or lacking promised substance',
          mixed_feedback: 'Divided opinions, some finding casual value while others criticize lack of depth',
          positive_valuable: 'Audience praises the video as highly helpful, accurate, and informative',
          casual_chitchat: 'Casual reactions, jokes, off-topic questions, or neutral remarks',
          no_comments: 'No comments available or insufficient evidence'
        }
      },
      content_flaw: {
        type: 'choice',
        instructions: 'Identify the primary format and cognitive substance of this video.',
        criteria: {
          consumer_inventory: 'Routine personal gear showcase, room/dorm tour, packing haul, or personal vlog with no analytical depth',
          sensational_clickbait: 'Artificial urgency, emotional shock, curiosity trap, or gossip drama',
          reaction_or_humor: 'Sketch comedy, humor, parodies, casual entertainment, or reaction',
          technical_guide: 'Actionable technical tutorial, coding/engineering guide, or practical problem solving',
          analytical_review: 'In-depth documentary, investigative reporting, hardware analysis, or expert insight',
          other: 'General topic or other'
        }
      },
      is_time_waste: {
        type: 'noul',
        instructions: 'Is this video primarily low-substance filler, personal vlog, room tour, or time waste?'
      }
    }
  };
}

function validChoice(answer, validKeys) {
  return answer?.type === 'choice' &&
    validKeys.includes(answer.choice) &&
    Number.isFinite(answer.confidence) &&
    answer.confidence >= 0 &&
    answer.confidence <= 1;
}

function validNoul(answer) {
  return answer?.type === 'noul' &&
    Number.isFinite(answer.noul) &&
    answer.noul >= 0 &&
    answer.noul <= 1;
}

export function analysisFor(video, response) {
  const answers = response?.answers || {};
  const verdictAns = answers.verdict;
  const flawAns = answers.content_flaw;
  const wasteAns = answers.is_time_waste;
  const consensusAns = answers.audience_consensus;

  const verdictKeys = ['stop', 'clickbait', 'valuable', 'entertainment', 'other'];
  const flawKeys = ['consumer_inventory', 'sensational_clickbait', 'reaction_or_humor', 'technical_guide', 'analytical_review', 'other'];
  const consensusKeys = ['negative_waste', 'mixed_feedback', 'positive_valuable', 'casual_chitchat', 'no_comments'];

  let verdict = validChoice(verdictAns, verdictKeys) ? verdictAns.choice : 'other';
  const flaw = validChoice(flawAns, flawKeys) ? flawAns.choice : 'other';
  const consensus = validChoice(consensusAns, consensusKeys) ? consensusAns.choice : 'no_comments';
  const waste = validNoul(wasteAns) ? Math.round(wasteAns.noul * 100) : null;
  const confidence = verdictAns?.confidence ?? 0;

  // Yorum konsensüsü negatifse veya atık oranı >= 65 ise kararı STOP'a yükselt
  if (consensus === 'negative_waste' && (verdict === 'other' || verdict === 'entertainment')) {
    verdict = 'stop';
  } else if (verdict === 'other' && waste !== null && waste >= 65) {
    verdict = 'stop';
  }

  const conf = VERDICTS[verdict] || VERDICTS.other;

  let text = '';
  if (conf.consensusReasons && conf.consensusReasons[consensus]) {
    text = conf.consensusReasons[consensus];
  } else {
    text = conf.reasons[flaw] || conf.reasons.default;
  }

  let topQuote = null;
  if (Array.isArray(video.comments) && video.comments.length > 0) {
    topQuote = video.comments[0].slice(0, 120);
    if (video.comments[0].length > 120) topQuote += '…';
  }

  return {
    verdict,
    badge: conf.badge,
    subtitle: conf.subtitle,
    cssClass: conf.cssClass,
    pillClass: conf.pillClass,
    consensus,
    consensusBadge: (consensus && consensus !== 'no_comments') ? (CONSENSUS_BADGES[consensus] || null) : null,
    text,
    waste,
    confidence,
    topQuote,
    hasAudienceFeedback: consensus !== 'no_comments'
  };
}

export async function evaluate(video, key, fetcher = fetch) {
  if (typeof key !== 'string' || !key.trim()) throw new Error('Önce API anahtarını gir.');
  const cleaned = cleanVideo(video);
  if (!cleaned) throw new Error('Video bilgisi okunamadı.');

  let response;
  try {
    response = await fetcher('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      credentials: 'omit',
      redirect: 'error',
      headers: {
        Authorization: `Bearer ${key.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestFor(cleaned)),
      signal: AbortSignal.timeout(18000)
    });
  } catch {
    throw new Error('Jev bağlantısı zaman aşımına uğradı veya ağ erişimi yok.');
  }

  if (!response.ok) {
    const messages = {
      401: 'API anahtarı geçersiz.',
      403: 'Bu anahtarın erişim izni yok.',
      429: 'Jev kullanım sınırı; bir dakika sonra tekrar dene.'
    };
    const error = new Error(messages[response.status] || 'Jev şu an yanıt veremiyor; daha sonra tekrar dene.');
    error.code = response.status;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Jev yanıtı okunamadı.');
  }

  const verdictKeys = ['stop', 'clickbait', 'valuable', 'entertainment', 'other'];
  if (!validChoice(data?.answers?.verdict, verdictKeys)) {
    throw new Error('Jev beklenen biçimde yanıt vermedi.');
  }

  return analysisFor(cleaned, data);
}
