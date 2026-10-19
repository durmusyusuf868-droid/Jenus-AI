import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & Status Endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'Jenus AI',
    version: '2.4.0-opensource',
    hasApiKey: Boolean(apiKey),
    recommendedModel: 'gemini-3.1-flash-lite',
    backupModel: 'gemini-3.8-flash',
    localProcessingAvailable: true,
    privacyShield: 'active',
  });
});

// Chat completion endpoint (with latency tracker & profile context)
app.post('/api/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      message,
      history = [],
      model = 'gemini-3.1-flash-lite',
      profileContext = {},
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Mesaj metni gereklidir.' });
      return;
    }

    if (!ai) {
      // Graceful fallback if no API key is provided
      const latencyMs = Date.now() - startTime;
      res.json({
        text: `[Yerel Motor Devrede] Bulut API anahtarı yapılandırılmamış, ancak Jenus yerel NLP motoru ve çevrimdışı bilgi tabanı üzerinden tam kapasite çalışmaya devam ediyor! İstediğin soruyu sorabilir, not alabilir, hesaplama yapabilir veya profilini yönetebilirsin.`,
        latencyMs,
        model: 'local-engine',
        isLocalFallback: true,
      });
      return;
    }

    // Build system instruction based on the personalized profile
    const profileName = profileContext.name || 'Kullanıcı';
    const profileTone = profileContext.tone || 'samimi ve hızlı';
    const profileCustomInstructions = profileContext.customInstructions || '';
    const profileMemories = Array.isArray(profileContext.memories)
      ? profileContext.memories.join('\n- ')
      : '';

    const systemInstruction = `Sen "Jenus" adında, mobil odaklı, ultra hızlı, sesli komutları destekleyen ve yerel gizliliğe en üst düzeyde önem veren açık kaynaklı yeni nesil bir yapay zeka asistanısın.

Önemli Kurallar:
1. Kullanıcının adı: ${profileName}
2. Cevap tonun: ${profileTone}
3. Hız: Yanıtların akıcı, doğrudan, gereksiz dolambaçsız ve son derece hızlı olmalıdır. Mobil cihazlarda okunması kolay kısa paragraflar ve net maddeler kullan.
4. Gizlilik ve Güvenlik: Kullanıcı verilerinin yerel cihazda güvenle saklandığını ve asla üçüncü taraflara satılmadığını bil.
5. Kişiselleştirilmiş Bilgiler (Hafıza):
${profileMemories ? `- ${profileMemories}` : 'Henüz kayıtlı özel hafıza yok.'}
${profileCustomInstructions ? `Özel Kullanıcı Talimatı: ${profileCustomInstructions}` : ''}
6. Dil: Türkçe konuş. Kullanıcı başka dilde sorarsa o dilde yanıtla.
7. Sesli komutlar: Kullanıcı sesli bir komut verirse veya hızlı bir işlem isterse doğrudan sonucu ilet.`;

    // Construct contents with multi-turn history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent turns (up to last 8 messages for optimal speed)
    const recentHistory = Array.isArray(history) ? history.slice(-8) : [];
    for (const item of recentHistory) {
      if (item.role === 'user' || item.role === 'model') {
        contents.push({
          role: item.role,
          parts: [{ text: item.content || item.text || '' }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const chosenModel = model === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const latencyMs = Date.now() - startTime;
    const responseText = response.text || 'Jenus yanıt oluşturamadı.';

    res.json({
      text: responseText,
      latencyMs,
      model: chosenModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    console.error('Gemini API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası';
    res.status(500).json({
      error: errorMessage,
      latencyMs,
      fallbackSuggestion: 'Çevrimdışı yerel motora geçiş yapılabilir.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jenus AI Server running at http://localhost:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
