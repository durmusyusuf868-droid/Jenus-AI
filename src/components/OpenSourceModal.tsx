import React, { useState } from 'react';
import { Code, BookOpen, Shield, Copy, Check, Terminal, FileCode, ExternalLink } from 'lucide-react';

interface OpenSourceModalProps {
  onClose?: () => void;
}

export const OpenSourceModal: React.FC<OpenSourceModalProps> = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'prompt' | 'pii' | 'license' | 'arch'>('arch');
  const [copied, setCopied] = useState(false);

  const samplePrompt = `Sen "Jenus" adında, mobil odaklı, ultra hızlı, sesli komutları destekleyen ve yerel gizliliğe en üst düzeyde önem veren açık kaynaklı yeni nesil bir yapay zeka asistanısın.

Önemli Kurallar:
1. Kullanıcının adı: [Profil Adı]
2. Cevap tonun: [Seçilen Ton: Teknik/Samimi/Resmi]
3. Hız: Yanıtların akıcı, doğrudan, gereksiz dolambaçsız ve son derece hızlı olmalıdır.
4. Gizlilik ve Güvenlik: Kullanıcı verilerinin yerel cihazda güvenle saklandığını bil.
5. Dil: Türkçe konuş.
6. Çevrimdışı ve Yerel Entegrasyon: Kullanıcının yerel notlarını ve yerel araçlarını gözet.`;

  const piiRegexCode = `// Jenus Cihaz İçi Kişisel Veri Filtresi
const TCKN_REGEX = /\\b[1-9][0-9]{10}\\b/g;
const EMAIL_REGEX = /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b/g;
const PHONE_REGEX = /(\\+?90\\s?)?(0?5\\d{2})[\\s.-]?(\\d{3})[\\s.-]?(\\d{2})[\\s.-]?(\\d{2})/g;
const CREDIT_CARD_REGEX = /\\b(?:\\d{4}[ -]?){3}\\d{4}\\b/g;

// Hiçbir kişisel veri buluta gitmeden önce istemcide temizlenir!`;

  const mitLicense = `MIT License

Copyright (c) 2026 Jenus AI Open Source Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-tr from-cyan-950/40 via-slate-900 to-purple-950/40 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Açık Kaynak Kod & Mimari
            </h2>
            <p className="text-xs text-cyan-300">
              MIT Lisanslı • %100 Şeffaf • Bağımsız Denetlenebilir
            </p>
          </div>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
        <button
          onClick={() => setActiveCodeTab('arch')}
          className={`py-2 px-1 rounded-xl font-medium transition ${
            activeCodeTab === 'arch' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mimari
        </button>
        <button
          onClick={() => setActiveCodeTab('prompt')}
          className={`py-2 px-1 rounded-xl font-medium transition ${
            activeCodeTab === 'prompt' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Prompt
        </button>
        <button
          onClick={() => setActiveCodeTab('pii')}
          className={`py-2 px-1 rounded-xl font-medium transition ${
            activeCodeTab === 'pii' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          PII Filtresi
        </button>
        <button
          onClick={() => setActiveCodeTab('license')}
          className={`py-2 px-1 rounded-xl font-medium transition ${
            activeCodeTab === 'license' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Lisans
        </button>
      </div>

      {/* Code Block Container */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {activeCodeTab === 'arch' && 'mimari-prensipleri.md'}
              {activeCodeTab === 'prompt' && 'system-instruction-template.ts'}
              {activeCodeTab === 'pii' && 'privacy-pii-scrubber.ts'}
              {activeCodeTab === 'license' && 'LICENSE.txt'}
            </span>
          </div>

          <button
            onClick={() => {
              if (activeCodeTab === 'prompt') handleCopy(samplePrompt);
              else if (activeCodeTab === 'pii') handleCopy(piiRegexCode);
              else if (activeCodeTab === 'license') handleCopy(mitLicense);
              else handleCopy('Jenus Local-First Open Architecture');
            }}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>

        {/* Content Views */}
        {activeCodeTab === 'arch' && (
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> 1. Yerel Veri Önceliği (Local-First):
              </h4>
              <p className="text-slate-400 text-[11px]">
                Kullanıcı mesajları, profilleri ve notları harici bir sunucu veritabanına asla kaydedilmez. Verinin sahibi yalnızca kullanıcıdır.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> 2. Çift Katmanlı Yürütme Motoru:
              </h4>
              <p className="text-slate-400 text-[11px]">
                Hesaplamalar, not alma, birim dönüştürme ve offline bilgi tabanı istemci işlemcisinde (&lt;10ms) çalışır. İleri düzey akıl yürütme gerektiğinde Gemini 3.1 Flash-Lite devreye girer.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-400" /> 3. Sıfır Telemetri ve Şeffaflık:
              </h4>
              <p className="text-slate-400 text-[11px]">
                İzleme çerezleri, üçüncü taraf analitik kütüphaneleri veya reklam pikselleri sıfırdır.
              </p>
            </div>
          </div>
        )}

        {activeCodeTab === 'prompt' && (
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-200 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {samplePrompt}
          </pre>
        )}

        {activeCodeTab === 'pii' && (
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {piiRegexCode}
          </pre>
        )}

        {activeCodeTab === 'license' && (
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {mitLicense}
          </pre>
        )}
      </div>
    </div>
  );
};
