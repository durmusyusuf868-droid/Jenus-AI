/**
 * Jenus Kişiselleştirilmiş Kullanıcı Profilleri ve Yerel Hafıza Servisi
 */

import { UserProfile } from '../types/index.ts';

const PROFILES_STORAGE_KEY = 'jenus_profiles_v1';
const ACTIVE_PROFILE_ID_KEY = 'jenus_active_profile_id_v1';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'profile_yusuf',
    name: 'Yusuf',
    avatar: '👨‍💻',
    roleDescription: 'Yazılım Geliştirici & Teknoloji Meraklısı',
    tone: 'teknik-analitik',
    customInstructions: 'Cevapları kısa, teknik açıdan net ve pratik kod örnekleriyle ver. Gereksiz dolambaçlı giriş cümlelerinden kaçın.',
    memories: [
      'Frontend ve mobil uygulama geliştirme ile ilgileniyor.',
      'Açık kaynak teknolojileri ve veri gizliliğini destekliyor.',
      'Hızlı ve doğrudan cevapları tercih eder.',
    ],
    preferredLanguage: 'tr',
    autoSpeak: false,
    speechSpeed: 1.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile_pro',
    name: 'İş & Yönetim',
    avatar: '💼',
    roleDescription: 'Profesyonel İş & Proje Asistanı',
    tone: 'resmi',
    customInstructions: 'Kurumsal bir dil kullan, maddeler halinde özetle ve aksiyon adımları sun.',
    memories: [
      'Toplantı notları, e-posta taslakları ve iş planlaması önceliklidir.',
      'Zaman yönetimi ve verimlilik odaklıdır.',
    ],
    preferredLanguage: 'tr',
    autoSpeak: false,
    speechSpeed: 1.05,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile_daily',
    name: 'Günlük Yaşam',
    avatar: '🌱',
    roleDescription: 'Dostane Günlük Asistan',
    tone: 'samimi',
    customInstructions: 'Güleryüzlü, destekleyici ve samimi bir üslupla konuş.',
    memories: [
      'Sağlıklı alışkanlıklar, kitap tavsiyeleri ve günlük motivasyon sever.',
    ],
    preferredLanguage: 'tr',
    autoSpeak: false,
    speechSpeed: 1.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile_stealth',
    name: 'Gizli & Anonim',
    avatar: '🕵️',
    roleDescription: 'Sıfır Hafıza & Tam Gizlilik Modu',
    tone: 'kısa-net',
    customInstructions: 'Kullanıcı hakkında hiçbir kişisel çıkarım yapma, yalnızca doğrudan soruya en kısa cevabı ver.',
    memories: [],
    preferredLanguage: 'tr',
    autoSpeak: false,
    speechSpeed: 1.1,
    createdAt: new Date().toISOString(),
  },
];

export function getStoredProfiles(): UserProfile[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_PROFILES;
  }
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) {
      saveProfiles(INITIAL_PROFILES);
      return INITIAL_PROFILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROFILES;
  } catch {
    return INITIAL_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles to localStorage:', e);
  }
}

export function getActiveProfileId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_PROFILES[0].id;
  }
  return localStorage.getItem(ACTIVE_PROFILE_ID_KEY) || INITIAL_PROFILES[0].id;
}

export function setActiveProfileId(id: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
}

export function getActiveProfile(): UserProfile {
  const profiles = getStoredProfiles();
  const activeId = getActiveProfileId();
  return profiles.find((p) => p.id === activeId) || profiles[0] || INITIAL_PROFILES[0];
}

export function addMemoryToActiveProfile(memoryText: string): UserProfile {
  const profiles = getStoredProfiles();
  const activeId = getActiveProfileId();
  const updated = profiles.map((p) => {
    if (p.id === activeId) {
      const existing = p.memories || [];
      if (!existing.includes(memoryText.trim())) {
        return { ...p, memories: [...existing, memoryText.trim()] };
      }
    }
    return p;
  });
  saveProfiles(updated);
  return updated.find((p) => p.id === activeId) || updated[0];
}

export function removeMemoryFromActiveProfile(index: number): UserProfile {
  const profiles = getStoredProfiles();
  const activeId = getActiveProfileId();
  const updated = profiles.map((p) => {
    if (p.id === activeId) {
      const filtered = (p.memories || []).filter((_, i) => i !== index);
      return { ...p, memories: filtered };
    }
    return p;
  });
  saveProfiles(updated);
  return updated.find((p) => p.id === activeId) || updated[0];
}

export function updateActiveProfile(partial: Partial<UserProfile>): UserProfile {
  const profiles = getStoredProfiles();
  const activeId = getActiveProfileId();
  const updated = profiles.map((p) => {
    if (p.id === activeId) {
      return { ...p, ...partial };
    }
    return p;
  });
  saveProfiles(updated);
  return updated.find((p) => p.id === activeId) || updated[0];
}
