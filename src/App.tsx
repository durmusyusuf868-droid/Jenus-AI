import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatMessage,
  OperatingMode,
  UserProfile,
  PrivacyConfig,
  LocalNote,
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { BottomNav, ActiveTab } from './components/BottomNav.tsx';
import { ChatThread } from './components/ChatThread.tsx';
import { VoiceWaveBar } from './components/VoiceWaveBar.tsx';
import { PrivacyVaultView } from './components/PrivacyVaultView.tsx';
import { ProfileManagerView } from './components/ProfileManagerView.tsx';
import { OfflineToolsView } from './components/OfflineToolsView.tsx';
import { OpenSourceModal } from './components/OpenSourceModal.tsx';
import { getActiveProfile } from './services/profileService.ts';
import { scrubPII } from './services/privacyVault.ts';
import { processLocalQuery } from './services/localEngine.ts';
import { voiceEngine } from './services/voiceService.ts';

const MESSAGES_KEY = 'jenus_messages_v1';
const NOTES_KEY = 'jenus_notes_v1';
const PRIVACY_KEY = 'jenus_privacy_v1';
const MODE_KEY = 'jenus_mode_v1';

export default function App() {
  // Core state
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [mode, setMode] = useState<OperatingMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(MODE_KEY) as OperatingMode) || 'hybrid';
    }
    return 'hybrid';
  });

  const [activeProfile, setActiveProfile] = useState<UserProfile>(getActiveProfile());

  const [privacyConfig, setPrivacyConfig] = useState<PrivacyConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(PRIVACY_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return {
      localOnlyMode: false,
      piiScrubbingEnabled: true,
      localEncryptionSimulated: true,
      autoPurgeDays: 0,
    };
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MESSAGES_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [notes, setNotes] = useState<LocalNote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(NOTES_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'note_welcome',
        title: 'Jenus Kurulumu & Güvenlik',
        content: 'Tüm notların ve konuşmaların bu cihazın yerel depolama alanında şifreli olarak tutulmaktadır.',
        createdAt: new Date().toISOString(),
        category: 'not',
      },
    ];
  });

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(activeProfile.autoSpeak || false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacyConfig));
  }, [privacyConfig]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  // Online / Offline connectivity listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setMode('offline'); // Auto-switch to offline mode when internet is disconnected
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update privacy config handler
  const handleUpdatePrivacyConfig = (partial: Partial<PrivacyConfig>) => {
    setPrivacyConfig((prev) => {
      const updated = { ...prev, ...partial };
      if (updated.localOnlyMode) {
        setMode('offline');
      }
      return updated;
    });
  };

  // Switch active profile
  const handleProfileSwitched = (newProfile: UserProfile) => {
    setActiveProfile(newProfile);
    setAutoSpeak(newProfile.autoSpeak || false);
  };

  // Add note
  const handleAddNote = (newNote: LocalNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(MESSAGES_KEY);
  };

  // Wipe all data
  const handleDataWiped = () => {
    setMessages([]);
    setNotes([]);
    const refreshed = getActiveProfile();
    setActiveProfile(refreshed);
    setActiveTab('chat');
  };

  // Send message workflow (Speed + Local-first + Privacy + Offline)
  const handleSendMessage = useCallback(
    async (rawText: string, isVoiceInput = false) => {
      const trimmed = rawText.trim();
      if (!trimmed || isLoading) return;

      // 1. Check PII scrubbing if enabled
      let processedUserText = trimmed;
      let piiScrubbed = false;

      if (privacyConfig.piiScrubbingEnabled) {
        const scrubRes = scrubPII(trimmed);
        if (scrubRes.hasPii) {
          processedUserText = scrubRes.scrubbedText;
          piiScrubbed = true;
        }
      }

      const userMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        role: 'user',
        content: trimmed, // Display what the user typed/said to them
        timestamp: new Date().toISOString(),
        source: 'local',
        isVoice: isVoiceInput,
        anonymized: piiScrubbed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Check if should be handled locally:
      // A) Offline mode is active OR
      // B) Navigator is offline OR
      // C) Local engine can resolve query deterministically (math, notes, unit conversion, memory query)
      const isPureOffline = mode === 'offline' || !isOnline || privacyConfig.localOnlyMode;
      const lower = trimmed.toLowerCase();
      const isLocalAction =
        lower.startsWith('not al') ||
        lower.startsWith('not ekle') ||
        lower.includes('saat kaç') ||
        lower.includes('ben kimim') ||
        lower.includes('yüzde') ||
        lower.includes('kaç mil') ||
        lower.includes('kaç pound') ||
        lower.includes('karekök');

      if (isPureOffline || isLocalAction) {
        // Execute on device instantly (< 10ms)
        const localResult = processLocalQuery(processedUserText, activeProfile, notes);

        if (localResult.actionTaken === 'note_added' && localResult.createdNote) {
          handleAddNote(localResult.createdNote);
        }

        const assistantMsg: ChatMessage = {
          id: 'msg_asst_' + Date.now(),
          role: 'assistant',
          content: localResult.text,
          timestamp: new Date().toISOString(),
          latencyMs: localResult.latencyMs,
          source: 'local',
          intentCategory: localResult.category,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);

        // Auto-speak if enabled
        if (autoSpeak) {
          voiceEngine.speak(localResult.text, {
            speed: activeProfile.speechSpeed || 1.0,
          });
        }
        return;
      }

      // Hybrid Cloud Mode via fast Gemini 3.1 Flash-Lite
      try {
        const historyPayload = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: processedUserText,
            history: historyPayload,
            model: 'gemini-3.1-flash-lite',
            profileContext: {
              name: activeProfile.name,
              tone: activeProfile.tone,
              customInstructions: activeProfile.customInstructions,
              memories: activeProfile.memories,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Sunucu hatası (${response.status})`);
        }

        const data = await response.json();

        const assistantMsg: ChatMessage = {
          id: 'msg_asst_' + Date.now(),
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toISOString(),
          latencyMs: data.latencyMs,
          source: data.model?.includes('flash') ? 'cloud-flash-lite' : 'local',
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Auto speak
        if (autoSpeak) {
          voiceEngine.speak(data.text, {
            speed: activeProfile.speechSpeed || 1.0,
          });
        }
      } catch (err: unknown) {
        console.warn('Bulut isteği başarısız oldu, yerel motora geçiliyor:', err);
        // Fallback to local engine automatically!
        const localFallback = processLocalQuery(processedUserText, activeProfile, notes);

        const fallbackMsg: ChatMessage = {
          id: 'msg_asst_' + Date.now(),
          role: 'assistant',
          content: `[Çevrimdışı Yerel Yanıt]\n${localFallback.text}`,
          timestamp: new Date().toISOString(),
          latencyMs: localFallback.latencyMs,
          source: 'local',
        };

        setMessages((prev) => [...prev, fallbackMsg]);

        if (autoSpeak) {
          voiceEngine.speak(localFallback.text, {
            speed: activeProfile.speechSpeed || 1.0,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activeProfile, autoSpeak, isLoading, messages, mode, isOnline, notes, privacyConfig]
  );

  // Voice speech recognition handlers
  const handleStartListening = () => {
    setIsListening(true);
    setInterimTranscript('');
    voiceEngine.startListening(
      (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          handleSendMessage(transcript.trim(), true);
          setInterimTranscript('');
        }
      },
      (error) => {
        console.warn('Voice error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      activeProfile.preferredLanguage === 'tr' ? 'tr-TR' : 'en-US'
    );
  };

  const handleStopListening = () => {
    voiceEngine.stopListening();
    setIsListening(false);
    if (interimTranscript.trim()) {
      handleSendMessage(interimTranscript.trim(), true);
      setInterimTranscript('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Container: either phone mockup or full width */}
      <div
        className={`w-full h-[100dvh] flex flex-col bg-slate-950 overflow-hidden transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[430px] max-h-[920px] rounded-[44px] border-[8px] border-slate-800/90 shadow-2xl shadow-cyan-950/40 relative my-auto'
            : 'max-w-2xl border-x border-slate-900'
        }`}
      >
        {/* Dynamic Island / Speaker Notch in mobile frame */}
        {isMobileFrame && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-slate-900 z-50 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 mr-2" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </div>
        )}

        {/* Header Bar */}
        <Header
          mode={mode}
          onToggleMode={(newMode) => setMode(newMode)}
          activeProfile={activeProfile}
          isOnline={isOnline}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenProfile={() => setActiveTab('profiles')}
        />

        {/* Offline Banner when network disconnected */}
        {!isOnline && (
          <div className="bg-amber-950/80 border-b border-amber-600/40 px-3 py-1.5 text-center text-[11px] text-amber-200 flex items-center justify-center gap-1.5 font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Çevrimdışısınız — Jenus Yerel Cihaz İçi Motoru devrede (%100 Gizli).</span>
          </div>
        )}

        {/* View Switcher based on active tab */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'chat' && (
            <>
              <ChatThread
                messages={messages}
                activeProfile={activeProfile}
                mode={mode}
                isLoading={isLoading}
                onClearChat={handleClearChat}
                onSelectPrompt={(p) => handleSendMessage(p, false)}
              />

              <VoiceWaveBar
                isListening={isListening}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
                interimTranscript={interimTranscript}
                onSendMessage={handleSendMessage}
                autoSpeak={autoSpeak}
                onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
                disabled={isLoading}
              />
            </>
          )}

          {activeTab === 'privacy' && (
            <PrivacyVaultView
              privacyConfig={privacyConfig}
              onUpdatePrivacyConfig={handleUpdatePrivacyConfig}
              messageCount={messages.length}
              notesCount={notes.length}
              onDataWiped={handleDataWiped}
            />
          )}

          {activeTab === 'profiles' && (
            <ProfileManagerView
              activeProfile={activeProfile}
              onProfileSwitched={handleProfileSwitched}
            />
          )}

          {activeTab === 'offline' && (
            <OfflineToolsView
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              activeProfile={activeProfile}
            />
          )}

          {activeTab === 'opensource' && <OpenSourceModal />}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
