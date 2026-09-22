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
    tr: {
      badge: 'STOP',
      subtitle: 'ZAMAN KAYBI',
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
      },
      dislikeReason: ratio => `Topluluk onaylamıyor: %${ratio} dislike oranı. İzleyiciler içeriği yanıltıcı, vaadini karşılamayan veya zaman kaybı olarak değerlendirdi.`
    },
    en: {
      badge: 'STOP',
      subtitle: 'TIME WASTE',
      reasons: {
        consumer_inventory: 'Routine personal room haul, packing vlog or gear showcase; lacks analytical depth. Complete time sink.',
        sensational_clickbait: 'Sensational curiosity trap; hollow exaggeration offering zero substantive knowledge.',
        reaction_or_humor: 'Low-effort reaction or superficial montage; zero knowledge density, skip it.',
        technical_guide: 'Shallow or staged guide lacking practical depth. Unproductive time waste.',
        analytical_review: 'Routine sponsored product placement lacking rigorous objective review.',
        default: 'Low knowledge density and time-wasting filler; offers no practical value.'
      },
      consensusReasons: {
        negative_waste: 'Audience and description confirm: Sponsored product showcase with zero substance; net time waste.',
        mixed_feedback: 'Audience reports superficial presentation with no real depth.'
      },
      dislikeReason: ratio => `Community rejection: ${ratio}% dislike ratio. Viewers flagged content as misleading or a waste of time.`
    },
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
    tr: {
      badge: 'TIK TUZAĞI',
      subtitle: 'DİKKAT',
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
    en: {
      badge: 'CLICKBAIT',
      subtitle: 'WARNING',
      reasons: {
        sensational_clickbait: 'Sensational panic or curiosity trap; content fails to deliver on the exaggerated title promise.',
        consumer_inventory: 'Routine consumer showcase disguised behind an intriguing clickbait hook.',
        reaction_or_humor: 'Dramatized reaction or scripted stunt with an overhyped title.',
        default: 'Inflated promise or artificial curiosity hook; low cognitive substance, proceed with caution.'
      },
      consensusReasons: {
        negative_waste: 'Audience warnings confirm: Deceptive clickbait; does not deliver on title, skip.',
        mixed_feedback: 'Viewers note the title is misleading and substantive topic is barely skimmed at the end.'
      }
    },
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
    tr: {
      badge: 'İZLENİR',
      subtitle: 'DEĞERLİ',
      reasons: {
        analytical_review: 'Derinlikli belgesel veya analitik inceleme; somut araştırma içerir, izlemeye değer.',
        technical_guide: 'Uygulamalı teknik rehber; doğrudan beceri veya somut problem çözümüne odaklı, izlemeye değer.',
        default: 'Yüksek bilgi yoğunluğuna sahip somut içerik; zaman ayırmaya değer.'
      },
      consensusReasons: {
        positive_valuable: 'İzleyiciler onaylıyor: İçerik son derece öğretici, doğrudan konuya giren ve teknik derinliği yüksek bir kaynak. İzlemeye değer.'
      }
    },
    en: {
      badge: 'VALUABLE',
      subtitle: 'MUST WATCH',
      reasons: {
        analytical_review: 'Substantive documentary or analytical breakdown; rigorous research, worth your attention.',
        technical_guide: 'Actionable technical guide; directly teaches practical problem solving, high knowledge ROI.',
        default: 'High knowledge density with concrete insights; genuine time investment.'
      },
      consensusReasons: {
        positive_valuable: 'Audience confirms: Highly instructive, cuts straight to the core with impressive technical depth.'
      }
    },
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
    tr: {
      badge: 'EĞLENCE',
      subtitle: 'KEYFÎ',
      reasons: {
        reaction_or_humor: 'Kafa dağıtmalık mizah, skeç veya oyun içeriği; bilgi beklentisi olmadan keyfî izlenebilir.',
        default: 'Vakit geçirme ve kafa dinleme amaçlı eğlence içeriği.'
      },
      consensusReasons: {
        casual_chitchat: 'İzleyiciler keyifli ve eğlenceli bir vakit geçirme içeriği olduğunu belirtiyor; bilgi beklentisi olmadan izlenebilir.'
      }
    },
    en: {
      badge: 'ENTERTAINMENT',
      subtitle: 'CASUAL',
      reasons: {
        reaction_or_humor: 'Casual humor, gaming or comedic sketch; enjoy for relaxation with no educational pretense.',
        default: 'Casual entertainment for relaxation and leisure.'
      },
      consensusReasons: {
        casual_chitchat: 'Audience highlights fun, casual entertainment; watch for recreational enjoyment.'
      }
    },
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
    tr: {
      badge: 'BELİRSİZ',
      subtitle: 'NÖTR',
      reasons: {
        default: 'Başlık ve açıklama, içeriğin değerini veya zaman maliyetini netleştirmek için çok genel veya belirsiz.'
      }
    },
    en: {
      badge: 'UNCERTAIN',
      subtitle: 'NEUTRAL',
      reasons: {
        default: 'Title and metadata are too ambiguous to definitively determine cognitive time value.'
      }
    },
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
  no_comments: 'Yorum Verisi Yok',
  tr: {
    negative_waste: 'İzleyiciler: Zaman Kaybı 👎',
    mixed_feedback: 'İzleyiciler: Kararsız / Yüzeysel 🤔',
    positive_valuable: 'İzleyiciler: Çok Faydalı 👍',
    casual_chitchat: 'İzleyiciler: Eğlencelik 🍿',
    no_comments: 'Yorum Verisi Yok'
  },
  en: {
    negative_waste: 'Audience: Waste of Time 👎',
    mixed_feedback: 'Audience: Mixed / Shallow 🤔',
    positive_valuable: 'Audience: High Value 👍',
    casual_chitchat: 'Audience: Casual / Fun 🍿',
    no_comments: 'No Comments'
  }
};

export const I18N = {
  tr: {
    loading: 'JEV TARTIYOR…',
    wasteLabel: 'Atık',
    wasteRisk: 'Atık Riski',
    dislikeLabel: 'Dislike',
    engineLabel: 'JEV DERİN RADAR',
    commentsScan: 'YORUM & AÇIKLAMA ANALİZİ',
    scanningComments: 'İzleyici yorumları, açıklama ve içerik taranıyor…',
    highlightedComment: 'Öne Çıkan Yorum',
    errorBadge: 'HATA'
  },
  en: {
    loading: 'JEV EVALUATING…',
    wasteLabel: 'Waste',
    wasteRisk: 'Waste Risk',
    dislikeLabel: 'Dislikes',
    engineLabel: 'JEV DEEP RADAR',
    commentsScan: 'COMMENTS & DESCRIPTION RADAR',
    scanningComments: 'Scanning viewer comments, description and substance…',
    highlightedComment: 'Top Viewer Comment',
    errorBadge: 'ERROR'
  }
};

const tidy = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim() : '';

function normTurkish(str) {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

export function computeClickbaitHeuristics(title) {
  if (typeof title !== 'string' || !title.trim()) {
    return { clickbaitScore: 0, triggers: [], isCapsHeavy: false, hasPunctuationTrap: false, isHeuristicClickbait: false, capsRatio: 0 };
  }

  const clean = title.trim();
  const normalized = normTurkish(clean);
  const triggers = [];

  // 1. Sansasyonel ve Tık Tuzağı Anahtar Kelimeler (TR & EN normalize edilmiş)
  const KEYWORD_PATTERNS = [
    { pattern: /\b(sok|shocking)\b/, name: 'Şok' },
    { pattern: /\b(inanilmaz|unbelievable)\b/, name: 'İnanılmaz' },
    { pattern: /\b(ifsa|exposed)\b/, name: 'İfşa' },
    { pattern: /\b(agladi|cildirdi|delirdi)\b/, name: 'Duygu Sömürüsü' },
    { pattern: /\b(sakin|don't watch)\b/, name: 'Uyarı Yemi' },
    { pattern: /\b(hayatim degisti|changed my life)\b/, name: 'Abartı' },
    { pattern: /\b(kimse|nobody knows|secret revealed|gizli gercek)\b/, name: 'Gizem Yemi' },
    { pattern: /\b(tum gercek|tüm gerçek)\b/, name: 'Tüm Gerçekler' },
    { pattern: /\b(bomba|flas|son dakika)\b/, name: 'Suni Aciliyet' },
    { pattern: /\b(mucize|pisman|yasaklandi)\b/, name: 'Sansasyonel' },
    { pattern: /\b(you won't believe|gone wrong)\b/, name: 'Clickbait Kalıbı' }
  ];

  for (const { pattern, name } of KEYWORD_PATTERNS) {
    if (pattern.test(normalized)) {
      triggers.push(name);
    }
  }

  // 2. Noktalama Tuzakları (örn: ???, !!!, ?!, !?)
  const hasPunctuationTrap = /(\?{2,}|!{2,}|\?!|!\?)/.test(clean);
  if (hasPunctuationTrap) {
    triggers.push('Aşırı Noktalama');
  }

  // 3. Büyük Harf (CAPS) Oranı
  const letters = clean.match(/[a-zA-ZçÇğĞıİöÖşŞüÜ]/g) || [];
  let isCapsHeavy = false;
  let capsRatio = 0;

  if (letters.length >= 8) {
    const upperCount = letters.filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length;
    capsRatio = upperCount / letters.length;
    if (capsRatio >= 0.55) {
      isCapsHeavy = true;
      triggers.push(capsRatio >= 0.85 ? 'TAMAMI BÜYÜK HARF' : 'Aşırı Büyük Harf');
    }
  }

  // 4. Deterministik tık tuzağı skoru hesaplama (0 - 100)
  let score = 0;
  if (isCapsHeavy) score += capsRatio >= 0.85 ? 40 : 25;
  if (hasPunctuationTrap) score += 20;
  const keywordCount = triggers.filter(t => t !== 'Aşırı Noktalama' && t !== 'TAMAMI BÜYÜK HARF' && t !== 'Aşırı Büyük Harf').length;
  score += Math.min(45, keywordCount * 25);

  score = Math.min(100, Math.max(0, score));

  return {
    clickbaitScore: score,
    isHeuristicClickbait: score >= 50,
    triggers: [...new Set(triggers)],
    capsRatio: Math.round(capsRatio * 100)
  };
}

export function cleanVideo(value) {
  if (!value || !/^[A-Za-z0-9_-]{11}$/.test(value.id) || !tidy(value.title)) return null;
  const duration = (typeof value.duration === 'string' && value.duration.trim()) ? tidy(value.duration).slice(0, 20) : null;
  return {
    id: value.id,
    title: tidy(value.title).slice(0, 240),
    channel: tidy(value.channel).slice(0, 100),
    description: tidy(value.description || '').slice(0, 500),
    comments: Array.isArray(value.comments) ? value.comments.map(tidy).filter(c => c.length > 3).slice(0, 8) : [],
    duration: duration || null,
    dislikeRatio: Number.isFinite(value.dislikeRatio) ? value.dislikeRatio : null,
    dislikeCount: Number.isFinite(value.dislikeCount) ? value.dislikeCount : null,
    likeCount: Number.isFinite(value.likeCount) ? value.likeCount : null
  };
}

export function requestFor(video) {
  const state = {
    title: video.title,
    channel: video.channel
  };
  if (video.duration) {
    state.duration = video.duration;
  }
  if (video.dislikeRatio !== null && video.dislikeRatio !== undefined) {
    state.dislike_percentage = `${video.dislikeRatio}%`;
  }
  if (video.description && video.description.length > 10) {
    state.description = video.description;
  }
  if (Array.isArray(video.comments) && video.comments.length > 0) {
    state.comments = video.comments;
  }

  const heuristics = computeClickbaitHeuristics(video.title);
  if (heuristics.clickbaitScore >= 40) {
    state.clickbait_suspicion = `${heuristics.clickbaitScore}%`;
    state.title_flags = heuristics.triggers;
  }

  return {
    model: 'jev-latest',
    state,
    questions: {
      verdict: {
        type: 'choice',
        instructions: 'Classify the cognitive time-value of this video based on its title, channel, duration, and metrics. Is this video a superficial time-waste/personal vlog/room tour, sensational clickbait trap, high-value documentary/educational guide, or casual comedy/entertainment?',
        criteria: {
          stop: 'Superficial time-waste, personal vlog, room/dorm/house tour, packing haul, routine gear flex, shopping flex, or low-density filler that wastes viewer time.',
          clickbait: 'Misleading clickbait, artificial panic/urgency, or curiosity trap where content fails to deliver on the title promises.',
          valuable: 'Substantive documentary, technical guide, in-depth educational tutorial, investigative journalism, or high knowledge density.',
          entertainment: 'Casual entertainment, sketch comedy, humor, gaming, or relaxation without educational pretense.',
          other: 'Ambiguous title or insufficient evidence.'
        }
      },
      knowledge_density: {
        type: 'choice',
        instructions: 'What is the educational and analytical depth of this content?',
        criteria: {
          deep: 'Actionable knowledge, rigorous investigative journalism, engineering tutorial, or profound documentary',
          moderate: 'Standard review, news summary, or informative presentation with some filler',
          low: 'Personal lifestyle haul, unedited chat, drama gossip, room tour, or superficial product placement'
        }
      },
      is_clickbait: {
        type: 'noul',
        instructions: 'What is the probability (0.0 to 1.0) that this video title uses deceptive framing, emotional panic, or clickbait hooks?'
      },
      audience_consensus: {
        type: 'choice',
        instructions: 'What is the primary sentiment and consensus of the audience comments, description, and dislike metrics (if provided)?',
        criteria: {
          negative_waste: 'Audience calls out the video as a time waste, sponsored ad, high dislikes, or lacking promised substance',
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

export function analysisFor(video, response, extra = {}) {
  const answers = response?.answers || {};
  const verdictAns = answers.verdict;
  const flawAns = answers.content_flaw;
  const wasteAns = answers.is_time_waste;
  const consensusAns = answers.audience_consensus;
  const clickbaitAns = answers.is_clickbait;
  const densityAns = answers.knowledge_density;

  const verdictKeys = ['stop', 'clickbait', 'valuable', 'entertainment', 'other'];
  const flawKeys = ['consumer_inventory', 'sensational_clickbait', 'reaction_or_humor', 'technical_guide', 'analytical_review', 'other'];
  const consensusKeys = ['negative_waste', 'mixed_feedback', 'positive_valuable', 'casual_chitchat', 'no_comments'];
  const densityKeys = ['deep', 'moderate', 'low'];

  let verdict = validChoice(verdictAns, verdictKeys) ? verdictAns.choice : 'other';
  const flaw = validChoice(flawAns, flawKeys) ? flawAns.choice : 'other';
  const consensus = validChoice(consensusAns, consensusKeys) ? consensusAns.choice : 'no_comments';
  const density = validChoice(densityAns, densityKeys) ? densityAns.choice : null;
  const clickbaitNoul = validNoul(clickbaitAns) ? Math.round(clickbaitAns.noul * 100) : null;
  let waste = validNoul(wasteAns) ? Math.round(wasteAns.noul * 100) : null;
  const confidence = verdictAns?.confidence ?? 0;

  // 1. Clickbait Heuristik Analizi
  const heuristics = computeClickbaitHeuristics(video.title);

  // 2. Dislike İstatistikleri (Return YouTube Dislike veya Video Meta)
  const dislikeRatio = Number.isFinite(extra.dislikeRatio) ? extra.dislikeRatio : (Number.isFinite(video.dislikeRatio) ? video.dislikeRatio : null);
  const dislikeCount = Number.isFinite(extra.dislikes) ? extra.dislikes : (Number.isFinite(video.dislikeCount) ? video.dislikeCount : null);
  const likeCount = Number.isFinite(extra.likes) ? extra.likes : (Number.isFinite(video.likeCount) ? video.likeCount : null);

  // Dil tespiti ve seçimi (tr veya en)
  const lang = (extra.lang === 'en' || video.lang === 'en') ? 'en' : 'tr';

  // Yorum konsensüsü negatifse veya atık oranı >= 65 ise kararı STOP'a yükselt
  if (consensus === 'negative_waste' && (verdict === 'other' || verdict === 'entertainment')) {
    verdict = 'stop';
  } else if (verdict === 'other' && waste !== null && waste >= 65) {
    verdict = 'stop';
  }

  // Jev is_clickbait noul desteği:
  if (clickbaitNoul !== null && clickbaitNoul >= 70 && (verdict === 'other' || verdict === 'entertainment')) {
    verdict = 'clickbait';
    if (waste === null || waste < 50) waste = 65;
  }

  // Jev knowledge_density desteği:
  if (density === 'deep' && verdict === 'other' && (waste === null || waste < 35)) {
    verdict = 'valuable';
  } else if (density === 'low' && verdict === 'other' && heuristics.isHeuristicClickbait) {
    verdict = 'stop';
  }

  // DISLIKE OVERRIDE:
  // Eğer izleyicilerin %25'ten fazlası dislike vermişse, video bariz tık tuzağı veya zaman kaybıdır!
  if (dislikeRatio !== null && dislikeRatio >= 25) {
    if (verdict === 'valuable' || verdict === 'other' || verdict === 'entertainment') {
      verdict = heuristics.isHeuristicClickbait ? 'clickbait' : 'stop';
    }
    const enforcedWaste = Math.min(95, Math.max(waste || 0, Math.round(dislikeRatio * 2.2)));
    waste = enforcedWaste;
  } else if (dislikeRatio !== null && dislikeRatio >= 15 && verdict === 'other') {
    verdict = heuristics.isHeuristicClickbait ? 'clickbait' : 'stop';
  }

  // HEURISTIC OVERRIDE:
  // Eğer başlık açıkça tık tuzağı formülüyse (skor >= 65) ve model 'other' demişse
  if (heuristics.clickbaitScore >= 65 && (verdict === 'other' || verdict === 'entertainment')) {
    verdict = 'clickbait';
    if (waste === null || waste < 50) waste = 65;
  }

  const conf = VERDICTS[verdict] || VERDICTS.other;
  const langConf = conf[lang] || conf.tr || conf;

  let text = '';
  if (dislikeRatio !== null && dislikeRatio >= 25 && consensus === 'no_comments') {
    text = langConf.dislikeReason
      ? langConf.dislikeReason(dislikeRatio)
      : (lang === 'en'
          ? `Community rejection: ${dislikeRatio}% dislike ratio. Viewers flagged content as misleading or a waste of time.`
          : `Topluluk onaylamıyor: %${dislikeRatio} dislike oranı. İzleyiciler içeriği yanıltıcı, vaadini karşılamayan veya zaman kaybı olarak değerlendirdi.`);
  } else if (langConf.consensusReasons && langConf.consensusReasons[consensus]) {
    text = langConf.consensusReasons[consensus];
  } else if (conf.consensusReasons && conf.consensusReasons[consensus]) {
    text = conf.consensusReasons[consensus];
  } else {
    text = langConf.reasons?.[flaw] || langConf.reasons?.default || conf.reasons[flaw] || conf.reasons.default;
  }

  let topQuote = null;
  if (Array.isArray(video.comments) && video.comments.length > 0) {
    topQuote = video.comments[0].slice(0, 120);
    if (video.comments[0].length > 120) topQuote += '…';
  }

  const badge = langConf.badge || conf.badge;
  const subtitle = langConf.subtitle || conf.subtitle;
  const consensusBadge = (consensus && consensus !== 'no_comments')
    ? (CONSENSUS_BADGES[lang]?.[consensus] || CONSENSUS_BADGES[consensus] || null)
    : null;

  return {
    verdict,
    lang,
    badge,
    subtitle,
    cssClass: conf.cssClass,
    pillClass: conf.pillClass,
    consensus,
    consensusBadge,
    text,
    waste,
    confidence,
    clickbaitProbability: clickbaitNoul,
    knowledgeDensity: density,
    topQuote,
    duration: video.duration || null,
    dislikeRatio,
    dislikeCount,
    likeCount,
    clickbaitScore: heuristics.clickbaitScore,
    clickbaitFlags: heuristics.triggers,
    hasAudienceFeedback: consensus !== 'no_comments' || dislikeRatio !== null
  };
}

export async function evaluate(video, key, fetcher = fetch, extra = {}) {
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

  return analysisFor(cleaned, data, extra);
}

export async function fetchDislikeStats(videoId, fetcher = fetch) {
  if (!videoId || typeof videoId !== 'string') return null;
  try {
    const res = await fetcher(`https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`, {
      signal: AbortSignal.timeout(2200)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.dislikes === 'number' && typeof data.likes === 'number') {
      const total = data.likes + data.dislikes;
      const dislikeRatio = total > 0 ? Math.round((data.dislikes / total) * 100) : 0;
      return {
        likes: data.likes,
        dislikes: data.dislikes,
        dislikeRatio,
        viewCount: data.viewCount ?? null
      };
    }
    return null;
  } catch {
    return null;
  }
}


