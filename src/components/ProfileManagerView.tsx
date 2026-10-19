import React, { useState } from 'react';
import { UserProfile } from '../types/index.ts';
import { User, Plus, Trash2, Check, Sparkles, Brain, Save } from 'lucide-react';
import {
  getStoredProfiles,
  saveProfiles,
  setActiveProfileId,
  addMemoryToActiveProfile,
  removeMemoryFromActiveProfile,
  updateActiveProfile,
} from '../services/profileService.ts';

interface ProfileManagerViewProps {
  activeProfile: UserProfile;
  onProfileSwitched: (newProfile: UserProfile) => void;
}

export const ProfileManagerView: React.FC<ProfileManagerViewProps> = ({
  activeProfile,
  onProfileSwitched,
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(getStoredProfiles());
  const [newMemoryText, setNewMemoryText] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New profile form state
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🚀');
  const [newRole, setNewRole] = useState('');
  const [newTone, setNewTone] = useState<UserProfile['tone']>('samimi');
  const [newInstructions, setNewInstructions] = useState('');

  const avatarOptions = ['👨‍💻', '👩‍💻', '💼', '🌱', '⚡', '🚀', '🎨', '🕵️', '🤖'];

  const handleSwitchProfile = (p: UserProfile) => {
    setActiveProfileId(p.id);
    onProfileSwitched(p);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    const updated = addMemoryToActiveProfile(newMemoryText.trim());
    setProfiles(getStoredProfiles());
    onProfileSwitched(updated);
    setNewMemoryText('');
  };

  const handleRemoveMemory = (index: number) => {
    const updated = removeMemoryFromActiveProfile(index);
    setProfiles(getStoredProfiles());
    onProfileSwitched(updated);
  };

  const handleToneChange = (tone: UserProfile['tone']) => {
    const updated = updateActiveProfile({ tone });
    setProfiles(getStoredProfiles());
    onProfileSwitched(updated);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProfile: UserProfile = {
      id: 'profile_' + Date.now(),
      name: newName.trim(),
      avatar: newAvatar,
      roleDescription: newRole.trim() || 'Kişiselleştirilmiş Kullanıcı',
      tone: newTone,
      customInstructions: newInstructions.trim(),
      memories: [],
      preferredLanguage: 'tr',
      autoSpeak: false,
      speechSpeed: 1.0,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...profiles, newProfile];
    saveProfiles(updatedList);
    setProfiles(updatedList);
    handleSwitchProfile(newProfile);
    setIsCreatingNew(false);

    // Reset form
    setNewName('');
    setNewRole('');
    setNewInstructions('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto">
      {/* Active Profile Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-tr from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              {activeProfile.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{activeProfile.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Aktif Profil
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{activeProfile.roleDescription}</p>
            </div>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-300 block mb-2">
            Yanıt Tonu & Üslubu:
          </span>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
            {(['samimi', 'resmi', 'kısa-net', 'teknik-analitik'] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => handleToneChange(tone)}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium capitalize transition border ${
                  activeProfile.tone === tone
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tone.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Bank Editor */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-purple-400" /> Jenus Kişisel Hafızası
          </h3>
          <span className="text-[10px] text-purple-300 font-mono">
            {activeProfile.memories.length} Bilgi Kayıtlı
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Jenus bu bilgileri konuşma sırasında seni daha iyi anlamak ve kişiselleştirilmiş yanıtlar üretmek için yerel olarak hatırlar:
        </p>

        {/* Memories List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {activeProfile.memories.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
              Bu profile ait özel hafıza kaydı yok.
            </div>
          ) : (
            activeProfile.memories.map((mem, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200"
              >
                <div className="flex items-start gap-1.5 overflow-hidden">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span className="truncate">{mem}</span>
                </div>
                <button
                  onClick={() => handleRemoveMemory(i)}
                  className="text-slate-500 hover:text-red-400 p-1 shrink-0 transition"
                  title="Hafızadan Sil"
                  aria-label="Hafıza Kaydını Sil"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Memory Input */}
        <form onSubmit={handleAddMemory} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newMemoryText}
            onChange={(e) => setNewMemoryText(e.target.value)}
            placeholder="Yeni bir tercih veya bilgi ekle (Örn: Python kullanmayı sever)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            aria-label="Yeni Hafıza Ekle"
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Ekle</span>
          </button>
        </form>
      </div>

      {/* Profile Switcher List */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-cyan-400" /> Kayıtlı Profiller
          </h3>
          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Profil Oluştur</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {profiles.map((p) => {
            const isSelected = p.id === activeProfile.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSwitchProfile(p)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-2xl">{p.avatar}</span>
                  <div>
                    <span className="font-bold text-xs text-white block">{p.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {p.roleDescription}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* New Profile Creation Drawer / Form */}
      {isCreatingNew && (
        <form onSubmit={handleCreateProfile} className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Yeni Kişisel Profil Ekle
            </h4>
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Kapat
            </button>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Profil İsmi</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Örn: Yusuf (Kodlama) veya Gezgin"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Avatar Emojisi</label>
            <div className="flex gap-2 flex-wrap">
              {avatarOptions.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setNewAvatar(emoji)}
                  className={`text-lg p-1.5 rounded-lg border transition ${
                    newAvatar === emoji ? 'bg-cyan-500/20 border-cyan-500 scale-110' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Rol / Açıklama</label>
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Örn: Kıdemli Yazılım Mimarı"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Özel Talimatlar</label>
            <textarea
              rows={2}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="Jenus bu profilde nasıl davranmalı? (Örn: Her zaman TypeScript kod örnekleri ver...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:brightness-110 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Profili Kaydet ve Aktif Et</span>
          </button>
        </form>
      )}
    </div>
  );
};
