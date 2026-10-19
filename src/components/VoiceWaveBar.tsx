import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { voiceEngine } from '../services/voiceService.ts';

interface VoiceWaveBarProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  interimTranscript: string;
  onSendMessage: (text: string, isVoice?: boolean) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  disabled?: boolean;
}

export const VoiceWaveBar: React.FC<VoiceWaveBarProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  interimTranscript,
  onSendMessage,
  autoSpeak,
  onToggleAutoSpeak,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Quick voice command shortcuts
  const quickCommands = [
    { label: '🧮 450 %18', prompt: '450 nin yüzde 18 i kaç eder?' },
    { label: '📝 Not Al', prompt: 'Not al: Yarın sabah 10 da toplantı' },
    { label: '🛡️ Gizlilik', prompt: 'Gizlilik durumu nedir?' },
    { label: '⏱️ Saat Kaç?', prompt: 'Saat kaç ve bugün hangi gün?' },
    { label: '👤 Ben Kimim?', prompt: 'Ben kimim, benim hakkımda ne biliyorsun?' },
  ];

  // Draw audio spectrum on HTML5 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isListening) {
        const freqData = voiceEngine.getAudioFrequencyData();
        const barCount = 24;
        const barWidth = canvas.width / barCount - 2;

        for (let i = 0; i < barCount; i++) {
          const val = freqData[i % freqData.length] || Math.sin(phase + i * 0.4) * 20 + 25;
          const barHeight = Math.max(4, (val / 255) * canvas.height * 0.9);
          const x = i * (barWidth + 2);
          const y = (canvas.height - barHeight) / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#3b82f6');
          grad.addColorStop(1, '#a855f7');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
        phase += 0.15;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isListening]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = (inputText || interimTranscript).trim();
    if (!textToSend || disabled) return;

    onSendMessage(textToSend, isListening);
    setInputText('');
    if (isListening) {
      onStopListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80">
      {/* Quick Suggestions Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar text-xs">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-0.5">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Hızlı:
        </span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd.label}
            onClick={() => onSendMessage(cmd.prompt, false)}
            disabled={disabled}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-slate-300 active:scale-95 transition text-[11px]"
          >
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Interim Listening Floating Indicator */}
      {isListening && (
        <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-lg shadow-cyan-950/50 animate-pulse">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            <div className="text-xs text-cyan-200 truncate font-mono">
              {interimTranscript ? (
                <span>&ldquo;{interimTranscript}&rdquo;</span>
              ) : (
                <span className="italic text-slate-400">Jenus dinliyor... Konuşun</span>
              )}
            </div>
          </div>

          <canvas ref={canvasRef} width={90} height={24} className="rounded" />

          {interimTranscript && (
            <button
              onClick={() => handleSubmit()}
              className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
              title="Gönder"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onStopListening}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Durdur"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Form & Main Buttons */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Auto-TTS Toggle */}
        <button
          type="button"
          onClick={onToggleAutoSpeak}
          aria-label={autoSpeak ? 'Sesli Yanıtı Kapat' : 'Sesli Yanıtı Aç'}
          className={`p-2.5 rounded-xl border transition ${
            autoSpeak
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
          title={autoSpeak ? 'Sesli Yanıt Açık (Cevaplar seslendirilir)' : 'Sesli Yanıt Kapalı'}
        >
          {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Sesinizi dinliyorum...' : 'Jenus\'a bir şey sor veya sesli komut ver...'}
            disabled={disabled}
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
          />
        </div>

        {/* Big Animated Mic Button */}
        <button
          type="button"
          onClick={isListening ? onStopListening : onStartListening}
          disabled={disabled}
          aria-label={isListening ? 'Dinlemeyi Durdur' : 'Sesli Komut Ver'}
          className={`relative p-2.5 rounded-xl font-bold transition flex items-center justify-center ${
            isListening
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105 animate-bounce'
              : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white hover:brightness-110 active:scale-95 shadow-md shadow-cyan-500/20'
          }`}
          title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Komut Ver'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Button (active when input has text) */}
        {inputText.trim() && (
          <button
            type="submit"
            disabled={disabled}
            aria-label="Mesajı Gönder"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 border border-slate-700 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
};
