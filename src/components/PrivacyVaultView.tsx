import React, { useState } from 'react';
import { ShieldCheck, Lock, Download, AlertTriangle, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { getLocalStorageSizeKb, exportLocalDataJson, wipeAllLocalData } from '../services/privacyVault.ts';
import { PrivacyConfig } from '../types/index.ts';

interface PrivacyVaultViewProps {
  privacyConfig: PrivacyConfig;
  onUpdatePrivacyConfig: (newConfig: Partial<PrivacyConfig>) => void;
  messageCount: number;
  notesCount: number;
  onDataWiped: () => void;
}

export const PrivacyVaultView: React.FC<PrivacyVaultViewProps> = ({
  privacyConfig,
  onUpdatePrivacyConfig,
  messageCount,
  notesCount,
  onDataWiped,
}) => {
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const storageKb = getLocalStorageSizeKb();

  const handleExportJson = () => {
    const jsonStr = exportLocalDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jenus_privacy_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleExecuteWipe = () => {
    wipeAllLocalData();
    setShowConfirmWipe(false);
    onDataWiped();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto">
      {/* Top Banner: Privacy Score */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Gizlilik Kasası (Yerel)
              </h2>
              <p className="text-xs text-emerald-300 font-medium">
                %100 Cihaz İçi Veri Yalıtımı Aktif
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400 font-mono">100</span>
            <span className="text-xs text-slate-400 block font-medium">Güvenlik Skoru</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300 leading-normal">
          Jenus verilerinizi asla harici bir bulut veritabanında toplamaz. Tüm konuşma geçmişi, kullanıcı profilleri ve şifreli notlar doğrudan bu tarayıcının yerel deposunda saklanır.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="block text-lg font-bold text-cyan-400 font-mono">{storageKb} KB</span>
          <span className="text-[10px] text-slate-400">Yerel Bellek</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="block text-lg font-bold text-white font-mono">{messageCount}</span>
          <span className="text-[10px] text-slate-400">Kayıtlı Mesaj</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="block text-lg font-bold text-purple-400 font-mono">{notesCount}</span>
          <span className="text-[10px] text-slate-400">Gizli Not</span>
        </div>
      </div>

      {/* Privacy Controls Switches */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-cyan-400" /> Güvenlik ve Filtre Ayarları
        </h3>

        {/* PII Scrubbing Switch */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              PII (Kişisel Veri) Cihazda Maskeleme
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Telefon, e-posta, TCKN ve kart bilgileri buluta gönderilmeden önce yerel olarak silinir.
            </span>
          </div>
          <button
            onClick={() =>
              onUpdatePrivacyConfig({ piiScrubbingEnabled: !privacyConfig.piiScrubbingEnabled })
            }
            aria-label="Kişisel Veri Maskelemeyi Aç veya Kapat"
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              privacyConfig.piiScrubbingEnabled ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="bg-white w-4 h-4 rounded-full shadow-md block" />
          </button>
        </div>

        {/* Local-Only Mode */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              Yalnızca Yerel Çalışma (Sıfır Bulut)
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Tüm harici API isteklerini tamamen engeller, sadece on-device motoru çalıştırır.
            </span>
          </div>
          <button
            onClick={() =>
              onUpdatePrivacyConfig({ localOnlyMode: !privacyConfig.localOnlyMode })
            }
            aria-label="Yalnızca Yerel Çalışmayı Aç veya Kapat"
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              privacyConfig.localOnlyMode ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="bg-white w-4 h-4 rounded-full shadow-md block" />
          </button>
        </div>
      </div>

      {/* Data Management & Export / Wipe */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Veri Yönetimi & Yedekleme
        </h3>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-cyan-300 transition active:scale-98"
          >
            {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{copiedJson ? 'Yedek JSON İndirildi!' : 'Verilerimi JSON Olarak Dışa Aktar'}</span>
          </button>

          <button
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition"
          >
            {showRawData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showRawData ? 'Ham Veri Önizlemesini Gizle' : 'Yerel Depolanan Ham Veriyi İncele'}</span>
          </button>

          {showRawData && (
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-48 scrollbar-thin">
              {exportLocalDataJson()}
            </pre>
          )}

          {/* Panic Wipe Button */}
          <button
            onClick={() => setShowConfirmWipe(true)}
            className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-xs font-semibold text-red-400 transition active:scale-98"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Kırmızı Buton: Cihazdaki Tüm Verileri Kalıcı Sil (Panic Wipe)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Panic Wipe */}
      {showConfirmWipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-red-800/60 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 text-red-400 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Tüm Verileri Sil?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bu işlem cihazınızdaki tüm konuşma geçmişini, kayıtlı notları, özel hafızaları ve profilleri kalıcı olarak silecektir. Bu işlem geri alınamaz.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setShowConfirmWipe(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleExecuteWipe}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition shadow-lg shadow-red-600/30"
              >
                Evet, Hepsini Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
