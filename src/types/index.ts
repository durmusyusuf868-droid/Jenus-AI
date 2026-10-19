export type AIModelType = 'gemini-3.1-flash-lite' | 'gemini-3.8-flash' | 'local-engine';

export type OperatingMode = 'hybrid' | 'offline';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  latencyMs?: number;
  source: 'local' | 'cloud-flash-lite' | 'cloud-flash';
  isVoice?: boolean;
  anonymized?: boolean;
  intentCategory?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  roleDescription: string;
  tone: 'samimi' | 'resmi' | 'kısa-net' | 'teknik-analitik';
  customInstructions: string;
  memories: string[];
  preferredLanguage: 'tr' | 'en';
  autoSpeak: boolean;
  speechSpeed: number;
  createdAt: string;
}

export interface PrivacyConfig {
  localOnlyMode: boolean; // 100% offline, never sends data over network
  piiScrubbingEnabled: boolean; // Strips phone, email, tckn, card before cloud calls
  localEncryptionSimulated: boolean;
  autoPurgeDays: number; // 0 = never
}

export interface LocalNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: 'not' | 'fikir' | 'görev' | 'kod';
}

export interface SystemDiagnostics {
  isOnline: boolean;
  storageUsageKb: number;
  messageCount: number;
  notesCount: number;
  activeProfileName: string;
  platform: string;
  privacyShieldStatus: 'aktif' | 'pasif';
}
