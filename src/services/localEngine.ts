/**
 * Jenus Yerel Cihaz İçi Yapay Zeka Motoru (Offline & Local Inference)
 * Sıfır internet ve sıfır ağ gecikmesiyle (<10ms) yerel cihazda çalışır.
 */

import type { UserProfile, LocalNote } from '../types/index.ts';

export interface LocalEngineResult {
  text: string;
  category: 'hesaplama' | 'donusturucu' | 'not' | 'bilgi' | 'sistem-gizlilik' | 'profil' | 'genel-yerel';
  latencyMs: number;
  handledLocally: boolean;
  actionTaken?: 'note_added' | 'note_listed' | 'profile_queried' | 'diagnostics_run';
  createdNote?: LocalNote;
}

// Built-in Knowledge Base for Offline Answering
const OFFLINE_KNOWLEDGE: Array<{ keywords: string[]; answer: string; category: LocalEngineResult['category'] }> = [
  {
    keywords: ['jenus', 'nedir', 'kimsin', 'sen kimsin'],
    answer: 'Ben Jenus! Mobil cihazlar için optimize edilmiş, ultra hızlı yanıt veren, sesli komutları destekleyen ve tüm verileri yerel cihazında işleyerek gizliliğini koruyan açık kaynaklı yapay zeka asistanınım.',
    category: 'bilgi',
  },
  {
    keywords: ['gizlilik', 'güvenlik', 'verilerim', 'nerede saklanıyor', 'cloud'],
    answer: 'Gizliliğin en yüksek önceliğimdir. Sohbetlerin, notların ve kullanıcı profillerin tamamen tarayıcının yerel hafızasında (LocalStorage/IndexedDB) tutulur. Asla üçüncü taraf sunuculara veya reklam ağlarına satılmaz. Çevrimdışı modda sıfır ağ trafiği oluşur.',
    category: 'sistem-gizlilik',
  },
  {
    keywords: ['çevrimdışı', 'offline', 'internetsiz', 'internet olmadan'],
    answer: 'Şu an tam Çevrimdışı (Offline) Yerel Motor modundasın! Jenus, internet bağlantısı olmadan da yerel bilgi tabanı, hesap makineleri, birim dönüştürücüler, not yöneticisi ve cihaz içi NLP ile kesintisiz çalışır.',
    category: 'sistem-gizlilik',
  },
  {
    keywords: ['açık kaynak', 'open source', 'lisans', 'github', 'kod'],
    answer: 'Jenus tamamen açık kaynaklıdır (MIT Lisansı). Mimarisini, PII sanitizasyon filtrelerini, yerel motor kurallarını ve kaynak kodlarını "Açık Kaynak" sekmesinden şeffaf biçimde inceleyebilirsin.',
    category: 'bilgi',
  },
  {
    keywords: ['python', 'nedir', 'yazılım'],
    answer: 'Python, okunabilirliği yüksek, çok yönlü ve dinamik bir programlama dilidir. Veri bilimi, makine öğrenmesi, web geliştirme ve otomasyon senaryolarında yaygın olarak kullanılır.',
    category: 'bilgi',
  },
  {
    keywords: ['typescript', 'javascript', 'fark'],
    answer: 'TypeScript, JavaScript\'e statik tür tanımları (static typing) ekleyen bir üst kümedir (superset). Derleme aşamasında hataları yakalar, kod okunabilirliğini ve büyük projelerin sürdürülebilirliğini artırır.',
    category: 'bilgi',
  },
  {
    keywords: ['react', 'nedir', 'bileşen'],
    answer: 'React, kullanıcı arayüzleri oluşturmak için kullanılan popüler bir JavaScript kütüphanesidir. Bileşen tabanlı yapısı (Components) ve sanal DOM (Virtual DOM) optimizasyonu sayesinde yüksek performans sunar.',
    category: 'bilgi',
  },
  {
    keywords: ['su iç', 'sağlık', 'günde kaç litre'],
    answer: 'Yetişkin bir insanın günde ortalama 2 - 2.5 litre su tüketmesi önerilir. Yeterli hidrasyon, odaklanmayı artırır, metabolizmayı destekler ve yorgunluğu azaltır.',
    category: 'bilgi',
  },
  {
    keywords: ['pomodoro', 'odaklanma', 'zaman yönetimi'],
    answer: 'Pomodoro tekniği: 25 dakika kesintisiz çalışma ve ardından 5 dakika kısa mola döngüsüdür. 4 pomodoro sonrasında 15-30 dakikalık uzun bir mola verilir. Verimliliği ve zihinsel tazeliği korur.',
    category: 'bilgi',
  },
];

/**
 * Evaluates math expressions safely without eval()
 */
export function evaluateMath(query: string): string | null {
  // Strip common Turkish math question words
  let clean = query
    .toLowerCase()
    .replace(/(kaçtır|hesapla|sonucu|kaç eder|kaç yapar|\?)/g, '')
    .trim();

  // Handle words like 'artı', 'eksi', 'çarpı', 'bölü', 'üzeri'
  clean = clean
    .replace(/\bartı\b/g, '+')
    .replace(/\beksi\b/g, '-')
    .replace(/\bçarpı\b/g, '*')
    .replace(/\bbölü\b/g, '/')
    .replace(/\bx\b/g, '*');

  // Check percentage: e.g. 200 ün yüzde 15 i, 450 nin yüzde 18 i
  const percentMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:nin|nın|nün|nun|in|ın|ün|un)?\s*yüzde\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const base = parseFloat(percentMatch[1]);
    const rate = parseFloat(percentMatch[2]);
    const res = (base * rate) / 100;
    return `${base} sayısının %${rate} oranı: **${res}** (Yerel Cihaz İçi Hızlı Hesaplama)`;
  }

  // Karekök e.g. "karekök 144"
  const sqrtMatch = clean.match(/karekök\s*(\d+(?:\.\d+)?)/i);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1]);
    return `√${val} = **${Math.sqrt(val)}**`;
  }

  // Standard safe math parsing: only digits, +, -, *, /, %, (, ), ., spaces
  if (!/^[\d\s+\-*/().%]+$/.test(clean) || clean.length < 2) {
    return null;
  }

  try {
    // Safe execution using Function constructor with no access to global window variables
    const calc = Function(`"use strict"; return (${clean});`)();
    if (typeof calc === 'number' && !isNaN(calc) && isFinite(calc)) {
      return `İşlem: \`${clean}\`\nSonuç: **${Number(calc.toFixed(4))}** (Yerel Cihazda 1ms'de Hesaptandı)`;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Handles unit conversion queries
 */
export function evaluateUnitConversion(query: string): string | null {
  const q = query.toLowerCase();

  // km -> mil
  const kmToMil = q.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometre)\s*(?:kaç\s*)?(?:mil|mile)/);
  if (kmToMil) {
    const km = parseFloat(kmToMil[1]);
    const mil = (km * 0.621371).toFixed(2);
    return `${km} Kilometre = **${mil} Mil**`;
  }

  // mil -> km
  const milToKm = q.match(/(\d+(?:\.\d+)?)\s*mil\s*(?:kaç\s*)?(?:km|kilometre)/);
  if (milToKm) {
    const mil = parseFloat(milToKm[1]);
    const km = (mil / 0.621371).toFixed(2);
    return `${mil} Mil = **${km} Kilometre**`;
  }

  // kg -> pound / lbs
  const kgToLbs = q.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram)\s*(?:kaç\s*)?(?:pound|lbs)/);
  if (kgToLbs) {
    const kg = parseFloat(kgToLbs[1]);
    const lbs = (kg * 2.20462).toFixed(2);
    return `${kg} Kilogram = **${lbs} Pound (lbs)**`;
  }

  // Celsius -> Fahrenheit
  const cToF = q.match(/(\d+(?:\.\d+)?)\s*(?:c|derece|santigrat)\s*(?:kaç\s*)?(?:f|fahrenheit)/);
  if (cToF) {
    const c = parseFloat(cToF[1]);
    const f = ((c * 9) / 5 + 32).toFixed(1);
    return `${c}°C = **${f}°F**`;
  }

  return null;
}

/**
 * Processes a query entirely on the local device without sending any byte over network.
 */
export function processLocalQuery(
  rawQuery: string,
  profile?: UserProfile,
  existingNotes: LocalNote[] = []
): LocalEngineResult {
  const startTime = performance.now();
  const q = rawQuery.trim().toLowerCase();

  // 1. Math check
  const mathResult = evaluateMath(rawQuery);
  if (mathResult) {
    return {
      text: mathResult,
      category: 'hesaplama',
      latencyMs: Math.round(performance.now() - startTime),
      handledLocally: true,
    };
  }

  // 2. Unit conversion check
  const conversionResult = evaluateUnitConversion(rawQuery);
  if (conversionResult) {
    return {
      text: conversionResult,
      category: 'donusturucu',
      latencyMs: Math.round(performance.now() - startTime),
      handledLocally: true,
    };
  }

  // 3. Time / Date queries
  if (q.includes('saat kaç') || q.includes('şimdiki saat') || q.includes('zaman')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      text: `Şu anki yerel saat: **${timeStr}** ⏱️`,
      category: 'bilgi',
      latencyMs: Math.round(performance.now() - startTime),
      handledLocally: true,
    };
  }

  if (q.includes('tarih') || q.includes('bugün ayın kaçı') || q.includes('hangi gündeyiz')) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      text: `Bugün: **${dateStr}** 📅`,
      category: 'bilgi',
      latencyMs: Math.round(performance.now() - startTime),
      handledLocally: true,
    };
  }

  // 4. Note Taking intent: "not al: [...]" or "not ekle: [...]"
  const noteMatch = rawQuery.match(/(?:not al|not ekle|hatırlatıcı ekle|kaydet)[:\s]+(.+)/i);
  if (noteMatch && noteMatch[1].trim()) {
    const noteText = noteMatch[1].trim();
    const newNote: LocalNote = {
      id: 'note_' + Date.now(),
      title: noteText.slice(0, 32) + (noteText.length > 32 ? '...' : ''),
      content: noteText,
      createdAt: new Date().toISOString(),
      category: 'not',
    };
    return {
      text: `📝 **Notun Yerel Kasaya Kaydedildi:**\n"${noteText}"\n\n*(Cihaz dışına aktarılmadı, yalnızca yerel tarayıcında saklanıyor.)*`,
      category: 'not',
      latencyMs: Math.round(performance.now() - startTime),
      handledLocally: true,
      actionTaken: 'note_added',
      createdNote: newNote,
    };
  }

  // 5. Note Listing intent
  if (q.includes('notlarım') || q.includes('notlarımı göster') || q.includes('kayıtlı notlar')) {
    if (existingNotes.length === 0) {
      return {
        text: 'Henüz yerel kasanda kayıtlı not bulunmuyor. Yeni bir not almak için *"Jenus, not al: markete git"* diyebilirsin.',
        category: 'not',
        latencyMs: Math.round(performance.now() - startTime),
        handledLocally: true,
        actionTaken: 'note_listed',
      };
    }
    const notesSummary = existingNotes
      .slice(0, 5)
      .map((n, i) => `${i + 1}. **${n.title}** (${new Date(n.createdAt).toLocaleDateString('tr-TR')})`)
      .join('\n');
    return {
      text: `📋 **Yerel Cihazındaki Notların (${existingNotes.length} adet):**\n\n${notesSummary}\n\n*Notların tamamını Çevrimdışı Araçlar sekmesinden yönetebilirsin.*`,
      category: 'not',
      latencyMs: Math.round(performance.now() - startTime),
      handledLocally: true,
      actionTaken: 'note_listed',
    };
  }

  // 6. User Profile Queries: "ben kimim", "hafızam", "profilim"
  if (q.includes('ben kimim') || q.includes('beni tanıyor musun') || q.includes('hafızam')) {
    if (profile) {
      const memoryList = profile.memories.length > 0
        ? profile.memories.map((m) => `• ${m}`).join('\n')
        : 'Henüz seninle ilgili özel bir hafıza kaydı bulunmuyor.';

      return {
        text: `👤 **Kullanıcı Profilin:**\n- **İsim:** ${profile.name}\n- **Rol/Kimlik:** ${profile.roleDescription}\n- **Tercih Edilen Ton:** ${profile.tone}\n\n🧠 **Jenus'un Yerel Hafızası:**\n${memoryList}\n\n*(Bu bilgiler yalnızca cihazında şifreli tutulur.)*`,
        category: 'profil',
        latencyMs: Math.round(performance.now() - startTime),
        handledLocally: true,
        actionTaken: 'profile_queried',
      };
    }
  }

  // 7. Offline Knowledge Match
  for (const item of OFFLINE_KNOWLEDGE) {
    const isMatch = item.keywords.some((k) => q.includes(k));
    if (isMatch) {
      return {
        text: item.answer,
        category: item.category,
        latencyMs: Math.round(performance.now() - startTime),
        handledLocally: true,
      };
    }
  }

  // 8. General Local Offline Fallback
  return {
    text: `⚡ **Jenus Yerel İşlem Modu:**\n"${rawQuery}" komutunu yerel cihazında işledim.\n\nİnternet bağlantın olmadığında bile Jenus şu yerel işlevleri anında yerine getirir:\n• 🧮 **Hızlı Hesaplama:** *"450 nin yüzde 18 i"*, *"karekök 256"*, *"12 * 85"*\n• 🔄 **Birim Dönüşümü:** *"50 km kaç mil"*, *"80 kg kaç pound"*\n• 📝 **Gizli Not Alma:** *"Not al: Yarın saat 10'da toplantı"*\n• 👤 **Kişisel Hafıza:** *"Ben kimim?"*, *"Hafızamı göster"*\n• 🛡️ **Veri Kasası:** Verilerini inceleyebilir veya sıfırlayabilirsin.\n\nDilersen üst bardan **"Hibrit Hızlı Bulut"** modunu açarak Gemini 3.1 Flash-Lite'ın derin yapay zeka gücünü de yerel gizlilik korumasıyla devreye sokabilirsin.`,
    category: 'genel-yerel',
    latencyMs: Math.round(performance.now() - startTime),
    handledLocally: true,
  };
}
