import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, UserProfile, OperatingMode } from '../types/index.ts';
import { Volume2, Copy, Check, ShieldCheck, Zap, Bot, User, Trash2 } from 'lucide-react';
import { voiceEngine } from '../services/voiceService.ts';

interface ChatThreadProps {
  messages: ChatMessage[];
  activeProfile: UserProfile;
  mode: OperatingMode;
  isLoading: boolean;
  onClearChat: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  activeProfile,
  mode,
  isLoading,
  onClearChat,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      voiceEngine.stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    voiceEngine.speak(text, {
      speed: activeProfile.speechSpeed || 1.0,
      onEnd: () => setSpeakingId(null),
    });
  };

  // Quick starter cards
  const starterCards = [
    {
      title: 'Hızlı Yerel Hesaplama',
      desc: '345 * 12 veya 1500\'ün %18\'i',
      prompt: '1500 ün yüzde 18 i kaç eder?',
      icon: '🧮',
    },
    {
      title: 'Yerel Not & Hatırlatıcı',
      desc: 'Cihazından hiç çıkmayan güvenli not',
      prompt: 'Not al: Yarın saat 15:00 sunumu hazırla',
      icon: '📝',
    },
    {
      title: 'Kişisel Hafıza & Bilgiler',
      desc: 'Jenus\'un hakkındaki yerel kayıtları',
      prompt: 'Ben kimim ve benim hakkımda ne biliyorsun?',
      icon: '👤',
    },
    {
      title: 'Gizlilik ve Veri Güvenliği',
      desc: 'Cihaz içi şifreleme ve PII filtresi',
      prompt: 'Gizlilik durumumu ve yerel veri politikasını anlat',
      icon: '🛡️',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scroll-smooth">
      {/* Header action bar (Clear chat & Profile indicator) */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-900 text-xs text-slate-500">
          <span>{messages.length} mesaj • {mode === 'offline' ? 'Yerel Mod' : 'Hibrit Mod'}</span>
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 hover:text-red-400 transition p-1"
            title="Sohbet Geçmişini Temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Temizle</span>
          </button>
        </div>
      )}

      {/* Empty State / Welcome Screen */}
      {messages.length === 0 && (
        <div className="py-4 sm:py-8 space-y-6 max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 text-3xl shadow-xl shadow-cyan-500/10">
            {activeProfile.avatar}
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Merhaba, {activeProfile.name}! 👋
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
              Ben <strong className="text-cyan-400">Jenus</strong>. Mobil öncelikli, ultra hızlı ve verilerini yalnızca bu cihazda tutan yapay zeka asistanınım.
            </p>
          </div>

          {/* Quick Starter Grid */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {starterCards.map((card) => (
              <button
                key={card.title}
                onClick={() => onSelectPrompt(card.prompt)}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 text-left transition active:scale-98 group"
              >
                <div className="text-xl mb-1.5">{card.icon}</div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                  {card.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {card.desc}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Veriler yerel cihazında işlenir • Açık Kaynaklı</span>
          </div>
        </div>
      )}

      {/* Messages Thread */}
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
          >
            {/* Sender Chip & Timestamp */}
            <div className="flex items-center gap-1.5 px-2 mb-1 text-[10px] text-slate-400">
              {isUser ? (
                <>
                  <span>{activeProfile.name}</span>
                  <User className="w-3 h-3 text-cyan-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span className="font-semibold text-slate-300">Jenus</span>
                  {msg.source === 'local' ? (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                      <ShieldCheck className="w-2.5 h-2.5" /> Yerel
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                      <Zap className="w-2.5 h-2.5" /> Bulut
                    </span>
                  )}
                  {typeof msg.latencyMs === 'number' && (
                    <span className="font-mono text-cyan-400 font-bold">
                      ⚡ {msg.latencyMs}ms
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`relative group max-w-[88%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed transition ${
                isUser
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-md shadow-cyan-600/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs shadow-md shadow-black/40'
              }`}
            >
              {/* Scrubbed PII Indicator Tag */}
              {msg.anonymized && (
                <div className="mb-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-[10px] text-amber-300 font-medium">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Kişisel Veri (PII) Cihazda Maskelendi</span>
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-wrap break-words font-sans selection:bg-cyan-500/40">
                {msg.content}
              </div>

              {/* Action Toolbar on Assistant Bubbles */}
              {!isUser && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      aria-label="Sesli Dinle"
                      className={`flex items-center gap-1 p-1 rounded hover:text-cyan-300 transition ${
                        speakingId === msg.id ? 'text-cyan-400 font-bold' : ''
                      }`}
                      title={speakingId === msg.id ? 'Durdur' : 'Sesli Dinle'}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${speakingId === msg.id ? 'animate-pulse' : ''}`} />
                      <span className="text-[10px]">
                        {speakingId === msg.id ? 'Okunuyor...' : 'Dinle'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      aria-label="Metni Kopyala"
                      className="flex items-center gap-1 p-1 rounded hover:text-white transition"
                      title="Kopyala"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>

                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading Bubble */}
      {isLoading && (
        <div className="flex flex-col items-start max-w-[80%]">
          <div className="flex items-center gap-1.5 px-2 mb-1 text-[10px] text-slate-400">
            <Bot className="w-3 h-3 text-cyan-400 animate-spin" />
            <span className="font-semibold text-slate-300">Jenus yanıtlıyor...</span>
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-900 border border-slate-800 text-cyan-400 flex items-center gap-2">
            <div className="flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-150" />
            </div>
            <span className="text-xs text-slate-400 ml-1">Ultra Hızlı Yanıt Hazırlanıyor</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
