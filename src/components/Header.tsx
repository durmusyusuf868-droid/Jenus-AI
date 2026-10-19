import React from 'react';
import { OperatingMode, UserProfile } from '../types/index.ts';
import { ShieldCheck, Zap, Wifi, WifiOff, Smartphone, Monitor } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  mode: OperatingMode;
  onToggleMode: (mode: OperatingMode) => void;
  activeProfile: UserProfile;
  isOnline: boolean;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  activeProfile,
  isOnline,
  isMobileFrame,
  onToggleFrame,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3.5 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2 max-w-full">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/20 text-white font-black text-lg select-none">
            J
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                mode === 'offline' ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
              }`}
              title={mode === 'offline' ? 'Tam Çevrimdışı / Yerel Motor' : 'Hibrit Hızlı Bulut'}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Jenus
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden xs:block">
              {mode === 'offline' ? '🛡️ %100 Yerel Cihazda' : '⚡ Hibrit Ultra Hızlı'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher Button */}
          <button
            onClick={() => onToggleMode(mode === 'hybrid' ? 'offline' : 'hybrid')}
            aria-label="Çalışma Modunu Değiştir"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
              mode === 'offline'
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {mode === 'offline' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Çevrimdışı</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span className="hidden sm:inline">Hibrit</span>
              </>
            )}
          </button>

          {/* Network State Dot */}
          <div
            className={`flex items-center justify-center p-1.5 rounded-lg border text-xs ${
              isOnline
                ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30'
                : 'text-amber-400 border-amber-800/40 bg-amber-950/30'
            }`}
            title={isOnline ? 'İnternet Bağlantısı Aktif' : 'Çevrimdışı - Yerel Bellek Kullanılıyor'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          </div>

          {/* Active Profile Pill */}
          <button
            onClick={onOpenProfile}
            aria-label="Kullanıcı Profilini Aç"
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-xs text-slate-200 transition"
          >
            <span className="text-sm">{activeProfile.avatar}</span>
            <span className="font-medium max-w-[65px] truncate hidden xs:inline">{activeProfile.name}</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Mobile Frame toggle (visible on desktop) */}
          <button
            onClick={onToggleFrame}
            aria-label="Cihaz Görünümünü Değiştir"
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition"
            title={isMobileFrame ? 'Geniş Ekran Görünümüne Geç' : 'Mobil Çerçeve Görünümüne Geç'}
          >
            {isMobileFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
