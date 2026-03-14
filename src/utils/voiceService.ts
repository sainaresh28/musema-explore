class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  public isSpeaking = false;

  constructor() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.synth = window.speechSynthesis;
    const pick = () => {
      const voices = this.synth!.getVoices();
     
      this.preferredVoice =
        voices.find(v => v.name === 'Google हिन्दी') ||                          // Hindi Google (natural Indian)
        voices.find(v => v.name.includes('Raveena')) ||                            // iOS/macOS Indian female
        voices.find(v => v.name.includes('Veena')) ||                              // macOS Indian female
        voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||       // Google en-IN
        voices.find(v => v.lang === 'en-IN') ||                                    // any en-IN
        voices.find(v => v.name.includes('Neerja')) ||                             // some Android Indian
        voices.find(v => v.name.includes('Heera')) ||                              // Microsoft Indian female
        voices.find(v => v.name.includes('Google UK English Female')) ||           // soft British fallback
        voices.find(v => v.lang.startsWith('en-')) ||
        voices[0] || null;
    };
    if (this.synth.getVoices().length) pick();
    else this.synth.addEventListener('voiceschanged', pick, { once: true });
  }

  isSupported() {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
      'speechSynthesis' in window;
  }

  isTTSSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string, rate = 0.88, pitch = 1.1): Promise<void> {
    return new Promise(resolve => {
      if (!this.synth) { resolve(); return; }
      this.stop();
      const clean = text
        .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1').replace(/#{1,6}\s/g, '')
        .replace(/━+/g, '.').replace(/\n{2,}/g, '. ').replace(/\n/g, ', ')
       
        .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '')
        .replace(/[#*0-9]\uFE0F?\u20E3/gu, '') 
        .replace(/\s+/g, ' ').trim();
      if (!clean) { resolve(); return; }
      const utt = new SpeechSynthesisUtterance(clean);
      if (this.preferredVoice) utt.voice = this.preferredVoice;
      utt.rate = rate; utt.pitch = pitch; utt.volume = 1; utt.lang = 'en-IN';
      utt.onstart = () => { this.isSpeaking = true; };
      utt.onend   = () => { this.isSpeaking = false; resolve(); };
      utt.onerror = () => { this.isSpeaking = false; resolve(); };
      this.synth.speak(utt);
    });
  }

  stop() {
    this.synth?.cancel();
    this.isSpeaking = false;
  }

  /** Record one utterance from microphone. Resolves with transcript. */
  listen(lang = 'en-IN'): Promise<string> {
    return new Promise((resolve, reject) => {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { reject(new Error('Not supported')); return; }
      const r = new SR();
      r.lang = lang; r.continuous = false; r.interimResults = false;
      r.onresult = (e: any) => resolve(e.results[0][0].transcript || '');
      r.onerror  = (e: any) => reject(new Error(e.error));
      r.onend    = () => resolve('');
      r.start();
    });
  }
}

export const voiceService = new VoiceService();