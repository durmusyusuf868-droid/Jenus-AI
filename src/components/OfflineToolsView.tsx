import React, { useState } from 'react';
import { LocalNote, UserProfile } from '../types/index.ts';
import { ShieldCheck, Calculator, ArrowRightLeft, FileText, Plus, Trash2, Cpu, WifiOff } from 'lucide-react';
import { processLocalQuery } from '../services/localEngine.ts';

interface OfflineToolsViewProps {
  notes: LocalNote[];
  onAddNote: (note: LocalNote) => void;
  onDeleteNote: (id: string) => void;
  activeProfile: UserProfile;
}

export const OfflineToolsView: React.FC<OfflineToolsViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  activeProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'calc' | 'convert' | 'diagnostics'>('notes');
  const [newNoteText, setNewNoteText] = useState('');

  // Calc sandbox state
  const [calcInput, setCalcInput] = useState('250 nin yüzde 18 i');
  const [calcOutput, setCalcOutput] = useState<string | null>(null);

  // Convert sandbox state
  const [convertInput, setConvertInput] = useState('100 km kaç mil');
  const [convertOutput, setConvertOutput] = useState<string | null>(null);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note: LocalNote = {
      id: 'note_' + Date.now(),
      title: newNoteText.slice(0, 30) + (newNoteText.length > 30 ? '...' : ''),
      content: newNoteText.trim(),
      createdAt: new Date().toISOString(),
      category: 'not',
    };
    onAddNote(note);
    setNewNoteText('');
  };

  const handleRunCalc = () => {
    const res = processLocalQuery(calcInput, activeProfile, notes);
    setCalcOutput(res.text);
  };

  const handleRunConvert = () => {
    const res = processLocalQuery(convertInput, activeProfile, notes);
    setConvertOutput(res.text);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto">
      {/* Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Çevrimdışı Çalışma Merkezi (Yerel AI)
            </h2>
            <p className="text-xs text-emerald-300">
              İnternet bağlantısı kesildiğinde bile tam fonksiyonel
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-2 px-1 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
            activeTab === 'notes' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Notlar</span>
        </button>
        <button
          onClick={() => setActiveTab('calc')}
          className={`py-2 px-1 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
            activeTab === 'calc' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Hesap</span>
        </button>
        <button
          onClick={() => setActiveTab('convert')}
          className={`py-2 px-1 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
            activeTab === 'convert' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Dönüşüm</span>
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`py-2 px-1 rounded-xl font-medium transition flex items-center justify-center gap-1 ${
            activeTab === 'diagnostics' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Sistem</span>
        </button>
      </div>

      {/* Notes Tab Content */}
      {activeTab === 'notes' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Yerel Gizli Not Defteri
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">{notes.length} Not</span>
          </h3>

          <form onSubmit={handleCreateNote} className="space-y-2">
            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Çevrimdışı güvenli not al (Cihazda saklanır)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 resize-none"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Notu Yerel Belleğe Kaydet</span>
            </button>
          </form>

          {/* List of notes */}
          <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl">
                Henüz kayıtlı not yok. Sohbet ekranında *"Jenus, not al: ..."* diyerek de hızlıca not kaydedebilirsin.
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{n.title}</span>
                    <button
                      onClick={() => onDeleteNote(n.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                      title="Sil"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{n.content}</p>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {new Date(n.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Calc Tab Content */}
      {activeTab === 'calc' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" /> Yerel Hızlı Hesaplama Motoru
          </h3>
          <p className="text-[11px] text-slate-400">
            Aritmetik işlemler, yüzdeler, karekökler ve parantezli işlemler doğrudan cihazınızın işlemcisinde milisaniyeler içinde hesaplanır:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={calcInput}
              onChange={(e) => setCalcInput(e.target.value)}
              placeholder="Örn: 45 * 12 + 10 veya 200 ün yüzde 15 i"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleRunCalc}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
            >
              Hesapla
            </button>
          </div>

          {calcOutput && (
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs text-cyan-200 font-sans whitespace-pre-wrap">
              {calcOutput}
            </div>
          )}
        </div>
      )}

      {/* Convert Tab Content */}
      {activeTab === 'convert' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> Yerel Birim Dönüştürücü
          </h3>
          <p className="text-[11px] text-slate-400">
            Mesafe (km/mil), Ağırlık (kg/lbs) ve Sıcaklık (°C/°F) çevrimleri internetsiz çalışır:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={convertInput}
              onChange={(e) => setConvertInput(e.target.value)}
              placeholder="Örn: 50 km kaç mil veya 85 kg kaç pound"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleRunConvert}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
            >
              Dönüştür
            </button>
          </div>

          {convertOutput && (
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs text-cyan-200 font-sans whitespace-pre-wrap">
              {convertOutput}
            </div>
          )}
        </div>
      )}

      {/* Diagnostics Tab Content */}
      {activeTab === 'diagnostics' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Cihaz & Yerel Sistem Durumu
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Çalışma Modeli</span>
              <span className="font-bold text-white">Jenus Local-First Core</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Çevrimdışı Hizmet Servisi (SW)</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> PWA Önbelleği Aktif
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Yerel İşlem Yanıt Gecikmesi</span>
              <span className="font-bold text-cyan-400 font-mono">&lt; 10ms</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Kullanıcı Platformu</span>
              <span className="font-bold text-white">
                {typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobil Cihaz' : 'Masaüstü Web') : 'Web'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
