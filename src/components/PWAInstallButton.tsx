import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Download, Share2, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Jenus Uygulamasını Cihaza Yükle"
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Uygulamayı İndir</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="iPhone Ana Ekrana Ekle"
          className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Ana Ekrana Ekle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">📱</span>
                  iPhone / iPad Kurulumu
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] shrink-0">1</span>
                  Safari araç çubuğundaki <strong className="text-white">Paylaş (Kare ve yukarı ok)</strong> butonuna dokunun.
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] shrink-0">2</span>
                  Aşağı kaydırıp <strong className="text-white">"Ana Ekrana Ekle"</strong> seçeneğini seçin.
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] shrink-0">3</span>
                  Jenus doğrudan yerel bir mobil uygulama gibi çevrimdışı çalışacaktır!
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
