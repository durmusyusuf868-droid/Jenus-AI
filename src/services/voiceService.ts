/**
 * Jenus Sesli Komut ve Konuşma Motoru
 * Web Speech Recognition, Web Speech Synthesis ve Web Audio API Spectrum Visualizer.
 */

// Speech Recognition types polyfill
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
  webkitAudioContext?: typeof AudioContext;
  AudioContext?: typeof AudioContext;
}

export class VoiceEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  public isSpeechSupported: boolean = false;
  public isTtsSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      this.isSpeechSupported = Boolean(SpeechRec);
      this.isTtsSupported = 'speechSynthesis' in window;
    }
  }

  /**
   * Generates futuristic synthesized chimes via Web Audio API without needing external sound files
   */
  public playChime(type: 'start' | 'success' | 'stop' | 'error'): void {
    if (typeof window === 'undefined') return;
    try {
      const win = window as unknown as IWindow;
      const AudioCtxClass = win.AudioContext || win.webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'stop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn('Audio chime could not be played:', e);
    }
  }

  /**
   * Initializes Speech Recognition for hands-free voice command capture
   */
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void,
    language: string = 'tr-TR'
  ): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      onError('Tarayıcınız Web Speech API ses tanıma özelliğini desteklemiyor.');
      return false;
    }

    try {
      this.stopListening();

      this.recognition = new SpeechRec();
      this.recognition.lang = language;
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.playChime('start');
        this.setupAudioAnalyser();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          onResult(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        this.cleanupAudioAnalyser();
        if (event.error !== 'no-speech') {
          this.playChime('error');
          onError(`Ses tanıma hatası: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cleanupAudioAnalyser();
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      onError(`Mikrofon başlatılamadı: ${err.message}`);
      return false;
    }
  }

  /**
   * Halts active speech listening
   */
  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
    this.cleanupAudioAnalyser();
  }

  /**
   * Sets up microphone frequency analysis for the waveform UI
   */
  private async setupAudioAnalyser() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const win = window as unknown as IWindow;
      const AudioCtxClass = win.AudioContext || win.webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 64;
      const source = ctx.createMediaStreamSource(this.mediaStream);
      source.connect(analyserNode);

      this.audioCtx = ctx;
      this.analyser = analyserNode;
      this.sourceNode = source;
    } catch (e) {
      console.warn('Audio analyser setup failed:', e);
    }
  }

  /**
   * Cleans up microphone stream
   */
  private cleanupAudioAnalyser() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
  }

  /**
   * Retrieves audio frequency spectrum data for visualizer
   */
  public getAudioFrequencyData(): Uint8Array {
    if (!this.analyser) {
      // Mock idle frequencies if mic analyser is not active
      return new Uint8Array(16).fill(0);
    }
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Speaks out response text using Text-to-Speech
   */
  public speak(
    text: string,
    options: {
      speed?: number;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    // Clean markdown formatting before speaking
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, 'bağlantı')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang || 'tr-TR';
    utterance.rate = options.speed || 1.0;
    utterance.pitch = 1.0;

    // Pick a natural Turkish voice if available
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find((v) => v.lang.startsWith('tr') || v.name.toLowerCase().includes('turkish'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    utterance.onerror = () => {
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stops any currently playing speech synthesis
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceEngine = new VoiceEngine();
