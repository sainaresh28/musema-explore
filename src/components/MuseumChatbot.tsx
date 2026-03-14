import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { emotionAI, type Message, type EmotionAnalysis } from '../utils/emotionAI';
import { wikipediaApi } from '../utils/wikipediaApi';
import { groqApi } from '../utils/groqApi';
import { voiceService } from '../utils/voiceService';
import { fetchMuseumImages, getMuseumImages } from '../utils/imageService';
import { llmMuseumApi, type LLMMuseum } from '../api/museum.api';
import {
  X, Send, Bot, User, Loader2,
  Calendar, Sparkles, Mic, MicOff, Volume2, VolumeX,
  MapPin, Clock, Ticket, MessageSquare
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
type BookingStep =
  | 'idle' | 'museum' | 'fetching' | 'choose'
  | 'date' | 'time'
  | 'adults' | 'children' | 'seniors' | 'students'
  | 'name' | 'email' | 'phone'
  | 'agegroup' | 'nationality' | 'idtype' | 'idnumber'
  | 'language' | 'guidedtour' | 'photopermit'
  | 'wheelchair' | 'specialassist' | 'seniorassist'
  | 'confirm';

interface BookingState {
  step: BookingStep;
  museum: LLMMuseum | null;
  // Visit
  date: string; timeSlot: string;
  // Tickets
  adults: number; children: number; seniors: number; students: number;
  // Visitor
  visitorName: string; visitorEmail: string; visitorPhone: string;
  ageGroup: string; nationality: string; idType: string; idNumber: string;
  // Experience
  guideLanguage: string; guidedTour: boolean; photoPermit: boolean;
  // Accessibility
  wheelchair: boolean; specialAssist: boolean; seniorAssist: boolean;
}

interface ChatMsg extends Message {
  images?: string[];
  wikiUrl?: string;
  museumCard?: LLMMuseum;
}

const INITIAL_BOOKING: BookingState = {
  step: 'idle', museum: null,
  date: '', timeSlot: '',
  adults: 1, children: 0, seniors: 0, students: 0,
  visitorName: '', visitorEmail: '', visitorPhone: '',
  ageGroup: '', nationality: 'Indian', idType: '', idNumber: '',
  guideLanguage: 'English', guidedTour: false, photoPermit: false,
  wheelchair: false, specialAssist: false, seniorAssist: false,
};

const EMOTION_STYLE: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  curious:     { label: 'Curious',      icon: 'search',  bg: '#EDF4FF', color: '#3B6FD4' },
  excited:     { label: 'Excited',      icon: 'zap',     bg: '#FFF8E8', color: '#B8860B' },
  bored:       { label: 'Bored',        icon: 'minus',   bg: '#F5F5F5', color: '#666' },
  romantic:    { label: 'Romantic',     icon: 'heart',   bg: '#FFF0F5', color: '#C2185B' },
  family:      { label: 'Family Trip',  icon: 'users',   bg: '#F0FFF4', color: '#2E7D32' },
  budget:      { label: 'Budget Hunt',  icon: 'tag',     bg: '#FDE8DF', color: '#C85A2A' },
  cultural:    { label: 'Cultural',     icon: 'museum',  bg: '#F3F0FF', color: '#6B3FA0' },
  adventurous: { label: 'Adventurous',  icon: 'compass', bg: '#FFF3E8', color: '#D04B0A' },
  scientific:  { label: 'Scientific',   icon: 'flask',   bg: '#E8F8FF', color: '#0277BD' },
};

const EmotionIcon = ({ icon, color }: { icon: string; color: string }) => {
  const s = { width:12, height:12, stroke:color, strokeWidth:2, fill:'none', strokeLinecap:'round' as const, strokeLinejoin:'round' as const };
  if (icon === 'search')  return <svg {...s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if (icon === 'zap')     return <svg {...s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if (icon === 'minus')   return <svg {...s} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if (icon === 'heart')   return <svg {...s} viewBox="0 0 24 24" fill={color} stroke={color}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
  if (icon === 'users')   return <svg {...s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (icon === 'tag')     return <svg {...s} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
  if (icon === 'museum')  return <svg {...s} viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>;
  if (icon === 'compass') return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  return <svg {...s} viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>;
};

const QUICK = [
  'Museums in Delhi',  'Science museums', 
  'Family trip Mumbai', 'Museums for kids',      
  'Plan a family museum trip in Jaipur',
 
];

const COLLECT_STEPS: BookingStep[] = [
  'date','time',
  'adults','children','seniors','students',
  'name','email','phone',
  'agegroup','nationality','idtype','idnumber',
  'language','guidedtour','photopermit',
  'wheelchair','specialassist','seniorassist',
  'confirm',
];
const BOOKING_TRIGGERS = [
  'book ticket','book tickets','buy ticket','buy tickets','book a ticket',
  'want to book','book now','reserve ticket','i want to book','help me book',
  'get tickets','purchase ticket','i want tickets',
  'book for','book it','ok book','bookk','book!','wanna book','lets book',
  "let's book",'i want to visit','take me there','how to book','how do i book',
];

// ─── Component ────────────────────────────────────────────────────
const MuseumChatbot = () => {
  const { user } = useUser();
  const navigate  = useNavigate();

  const [open, setOpen]         = useState(false);
  const [msgs, setMsgs]         = useState<ChatMsg[]>([]);
  const [input, setInput]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [bk, setBk]             = useState<BookingState>(INITIAL_BOOKING);
  const [emotion, setEmotion]   = useState<EmotionAnalysis | null>(null);

  const [voiceOn, setVoiceOn]   = useState(false);
  const [mic, setMic]           = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [tts, setTts]           = useState(true);
  const [voiceOk]               = useState(() => voiceService.isSupported());
  const [showQ, setShowQ]       = useState(true);

  const endRef   = useRef<HTMLDivElement>(null);
  const srRef    = useRef<any>(null);
  const sendRef  = useRef<(raw?: string) => Promise<void>>(async () => {});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  // Listen for external open trigger 
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('musema:open-chatbot', handler);
    return () => window.removeEventListener('musema:open-chatbot', handler);
  }, []);

  useEffect(() => {
    if (open && msgs.length === 0) {
      const name = user?.firstName ? ` ${user.firstName}` : '';
      pushBot(
        `Namaste${name}! I'm your **Musema AI Guide**.\n\n` +
        `Ask me about **any of India's 700+ museums** — I'll fetch live info, show photos, and book tickets!\n\n` +
        `- **See images** of any museum\n` +
        `- **Talk to me** with voice\n` +
        `- **Book tickets** chatbot-style or self-fill\n\n` +
        `What would you like today?`
      );
    }
  }, [open]);

  const speak = useCallback(async (text: string) => {
    if (!tts || !voiceService.isTTSSupported()) return;
    setSpeaking(true);
    await voiceService.speak(text);
    setSpeaking(false);
  }, [tts]);

  const pushBot = useCallback((content: string, extras?: Partial<ChatMsg>) => {
    const m: ChatMsg = { role: 'assistant', content, timestamp: Date.now(), ...extras };
    setMsgs(p => [...p, m]);
    speak(content);
  }, [speak]);

  const startMic = useCallback(() => {
    if (mic || busy) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    
    voiceService.stop();
    setSpeaking(false);
    
    try { srRef.current?.abort(); } catch {}
    const r = new SR();
    r.lang = 'en-IN'; r.continuous = false; r.interimResults = false;
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript?.trim();
      setMic(false);
      if (t) sendRef.current(t);  
    };
    r.onerror = (e: any) => {
      console.warn('SpeechRecognition error:', e.error);
      setMic(false);
    };
    r.onend = () => setMic(false);
    try { r.start(); srRef.current = r; setMic(true); }
    catch (e) { console.warn('SpeechRecognition start failed:', e); setMic(false); }
  }, [mic, busy]);

  const stopMic = useCallback(() => {
    try { srRef.current?.stop(); } catch {}
    setMic(false);
  }, []);

  const toggleVoiceMode = () => {
    if (!voiceOk) { alert('Voice works in Chrome / Edge.'); return; }
    const next = !voiceOn;
    setVoiceOn(next);
    if (!next) { voiceService.stop(); stopMic(); return; }
    pushBot('Voice mode on — I\'ll speak my answers. Say anything to begin...');
    setTimeout(startMic, 1000);
  };

  useEffect(() => {
    if (voiceOn && !speaking && !busy && !mic) {
      const t = setTimeout(startMic, 600);
      return () => clearTimeout(t);
    }
  }, [voiceOn, speaking, busy, mic, startMic]);

  const fetchMuseum = async (name: string, city?: string): Promise<LLMMuseum | null> => {
    try { const r = await llmMuseumApi.fetch(name, city); return r.museum; }
    catch (e: any) { pushBot(`Couldn't fetch info for "${name}": ${e.message}`); return null; }
  };

  const pushMuseumCard = async (museum: LLMMuseum, text: string) => {
    const imgs = museum.images && museum.images.length > 0
      ? museum.images.slice(0, 3)
      : getMuseumImages({ name: museum.name, type: museum.type }, 3);
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent((museum.name + (museum.city ? '_' + museum.city : '')).replace(/\s+/g, '_'))}`;
    const m: ChatMsg = { role: 'assistant', content: text, timestamp: Date.now(), museumCard: museum, images: imgs, wikiUrl };
    setMsgs(p => [...p, m]);
    speak(text);
  };

  // ─── SEND HANDLER ────────────────────────────────────────────
  const send = async (raw?: string) => {
    const msg = (raw ?? input).trim();
    if (!msg || busy) return;
    setInput(''); setShowQ(false); voiceService.stop();
    setMsgs(p => [...p, { role: 'user', content: msg, timestamp: Date.now() }]);
    setBusy(true);

    try {
      const lower = msg.toLowerCase();

      // BRANCH 1 — ACTIVE BOOKING FLOW
      if (bk.step !== 'idle') {
        if (['cancel','exit','stop','quit'].some(w => lower === w)) {
          setBk(INITIAL_BOOKING); pushBot('Booking cancelled. Ask me anything!'); setBusy(false); return;
        }
        if (bk.step === 'museum') {
          setBk(p => ({ ...p, step: 'fetching' }));
          const cityHint =
            msg.match(/(?:in\s+|,\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)?.[1] ||
            msgs.slice().reverse().reduce<string | undefined>((found, m) => {
              if (found) return found;
              return m.content.match(/\b(Visakhapatnam|Vizag|Delhi|Mumbai|Kolkata|Chennai|Hyderabad|Bengaluru|Bangalore|Jaipur|Kochi|Bhubaneswar|Amritsar|Agra|Varanasi|Mysuru|Guwahati|Shimla|Gangtok|Panaji|Bhopal|Chandigarh|Ahmedabad|Prayagraj|Nilambur|Thiruvananthapuram)\b/i)?.[1];
            }, undefined);
          const searchName = cityHint && !msg.toLowerCase().includes(cityHint.toLowerCase()) ? `${msg} ${cityHint}` : msg;
          pushBot(`Fetching info for **${msg}**${cityHint ? ` in ${cityHint}` : ''}...`);
          const m = await fetchMuseum(searchName, cityHint);
          if (!m) { setBk(INITIAL_BOOKING); setBusy(false); return; }
          setBk(p => ({ ...p, step: 'choose', museum: m }));
          const p = m.ticketPrices;
          await pushMuseumCard(m,
            `**${m.name}**\n${m.city}, ${m.state}\n${m.openingHours} · Closed: ${m.closedOn}\n\n` +
            `Adult ₹${p.adult} · Child ₹${p.child} · Senior ₹${p.senior} · Foreign ₹${p.foreign||0}\n\n` +
            `${m.description ? `${m.description}\n\n` : ''}━━━━━━━━━━━━━━━━\n` +
            `**1 — Book for me** · **2 — I'll book myself**\n\nType **1** or **2**:`
          );
          setBusy(false); return;
        }
        if (bk.step === 'choose') {
          const goBot  = ['1','book for me','you book','option 1','first'].some(w => lower.includes(w));
          const goSelf = ['2','myself','self','i will','option 2','second','manual'].some(w => lower.includes(w));
          if (goBot) {
            setBk(p => ({ ...p, step: 'date' }));
            pushBot(`Let's go!\n\n**Step 1/${COLLECT_STEPS.length} — Visit Date**\nWhat **date** would you like to visit **${bk.museum?.name}**?\n_(format: YYYY-MM-DD, e.g. 2026-04-15)_`);
          } else if (goSelf) {
            const snap = bk.museum!; setBk(INITIAL_BOOKING);
            const qs = new URLSearchParams({ llmMuseum: JSON.stringify(snap), source: 'chatbot-self' });
            pushBot(`Opening pre-filled booking form for **${snap.name}**...\nRedirecting in 2 s!`);
            setTimeout(() => navigate(`/payment?${qs}`), 2000);
          } else { pushBot('Please type **1** to let me book, or **2** to fill the form yourself.'); }
          setBusy(false); return;
        }
        if (COLLECT_STEPS.includes(bk.step)) {
          const s = { ...bk };
          const stepNum = COLLECT_STEPS.indexOf(s.step) + 1;
          const total   = COLLECT_STEPS.length;
          const pfx     = (n: number, label: string) => `**Step ${n}/${total} — ${label}**`;

          switch (s.step) {
            // ── Visit ────────────────────────────────────────────────────────
            case 'date': {
              s.date = msg; s.step = 'time';
              pushBot(`📅 **${msg}** — noted!\n\n${pfx(2,'Time Slot')}\n\`09:00 · 10:00 · 11:00 · 12:00 · 13:00 · 14:00 · 15:00 · 16:00 · 17:00\``);
              break;
            }
            case 'time': {
              s.timeSlot = msg; s.step = 'adults';
              pushBot(`⏰ **${msg}** — noted!\n\n${pfx(3,'Adult Tickets')}\nHow many **adult** tickets? (age 18–59, ₹${s.museum?.ticketPrices?.adult ?? 0} each)`);
              break;
            }

            // ── Tickets ──────────────────────────────────────────────────────
            case 'adults': {
              const n = parseInt(msg);
              if (isNaN(n) || n < 0) { pushBot('Please enter a valid number (0 or more).'); setBusy(false); return; }
              s.adults = n; s.step = 'children';
              pushBot(`👨 **${n} adult${n !== 1 ? 's' : ''}** · ₹${n * (s.museum?.ticketPrices?.adult ?? 0)}\n\n${pfx(4,'Child Tickets')}\nHow many **child** tickets? (age 5–17, ₹${s.museum?.ticketPrices?.child ?? 0} each) — type **0** to skip`);
              break;
            }
            case 'children': {
              const n = parseInt(msg);
              if (isNaN(n) || n < 0) { pushBot('Enter 0 or more.'); setBusy(false); return; }
              s.children = n; s.step = 'seniors';
              pushBot(`👶 **${n} child${n !== 1 ? 'ren' : ''}** · ₹${n * (s.museum?.ticketPrices?.child ?? 0)}\n\n${pfx(5,'Senior Tickets')}\nHow many **senior citizen** tickets? (age 60+, ₹${(s.museum?.ticketPrices as any)?.senior ?? 0} each) — type **0** to skip`);
              break;
            }
            case 'seniors': {
              const n = parseInt(msg);
              if (isNaN(n) || n < 0) { pushBot('Enter 0 or more.'); setBusy(false); return; }
              s.seniors = n; s.step = 'students';
              pushBot(`👴 **${n} senior${n !== 1 ? 's' : ''}** · ₹${n * ((s.museum?.ticketPrices as any)?.senior ?? 0)}\n\n${pfx(6,'Student Tickets')}\nHow many **student** tickets? (with valid ID, ₹${(s.museum?.ticketPrices as any)?.student ?? 0} each) — type **0** to skip`);
              break;
            }
            case 'students': {
              const n = parseInt(msg);
              if (isNaN(n) || n < 0) { pushBot('Enter 0 or more.'); setBusy(false); return; }
              s.students = n; s.step = 'name';
              const sub =
                s.adults   * (s.museum?.ticketPrices?.adult  ?? 0) +
                s.children * (s.museum?.ticketPrices?.child  ?? 0) +
                s.seniors  * ((s.museum?.ticketPrices as any)?.senior  ?? 0) +
                s.students * ((s.museum?.ticketPrices as any)?.student ?? 0);
              const totalPax = s.adults + s.children + s.seniors + s.students;
              if (totalPax < 1) {
                pushBot('You need at least 1 ticket. Let\'s start over with adult tickets.\n\nHow many **adult** tickets?');
                s.step = 'adults'; setBk(s); setBusy(false); return;
              }
              pushBot(`🎟 **${totalPax} ticket${totalPax > 1 ? 's' : ''}** · Subtotal: **₹${sub}**\n\n${pfx(7,'Visitor Name')}\nWhat\'s the **full name** of the primary visitor?`);
              break;
            }

            // ── Contact ──────────────────────────────────────────────────────
            case 'name': {
              s.visitorName = msg; s.step = 'email';
              pushBot(`👤 **${msg}** — noted!\n\n${pfx(8,'Email Address')}\nYour **email address**?`);
              break;
            }
            case 'email': {
              if (!msg.includes('@')) { pushBot('That doesn\'t look like a valid email. Please try again.'); setBusy(false); return; }
              s.visitorEmail = msg; s.step = 'phone';
              pushBot(`📧 **${msg}** — noted!\n\n${pfx(9,'Phone Number')}\nYour **phone number** (with country code)?`);
              break;
            }
            case 'phone': {
              s.visitorPhone = msg; s.step = 'agegroup';
              pushBot(`📱 **${msg}** — noted!\n\n${pfx(10,'Age Group')}\nWhat\'s your **age group**?\n\`Under 18 · 18–30 · 31–45 · 46–60 · 60+\`\n_(or type **skip** to continue)_`);
              break;
            }

            // ── Visitor details ──────────────────────────────────────────────
            case 'agegroup': {
              s.ageGroup = lower === 'skip' ? '' : msg; s.step = 'nationality';
              pushBot(`${lower === 'skip' ? '⏭ Skipped' : `🎂 **${msg}**`} — noted!\n\n${pfx(11,'Nationality')}\nAre you an **Indian** national or a **Foreign National**?\n_(type \`indian\` or \`foreign\`)_`);
              break;
            }
            case 'nationality': {
              const isForeign = lower.includes('foreign') || lower.includes('international');
              s.nationality = isForeign ? 'Foreign National' : 'Indian';
              s.step = 'idtype';
              const note = isForeign ? '\n\n_Foreign national pricing will apply. Please carry your passport._' : '';
              pushBot(`🌏 **${s.nationality}** — noted!${note}\n\n${pfx(12,'ID Proof Type')}\nWhich **ID proof** will you carry?\n\`Aadhaar Card · Passport · Driving Licence · Voter ID · PAN Card\`\n_(or type **skip**)_`);
              break;
            }
            case 'idtype': {
              const skipId = lower === 'skip';
              if (skipId) {
                s.idType = ''; s.idNumber = ''; s.step = 'language';
                pushBot(`⏭ Skipped ID proof.\n\n${pfx(13,'Guide Language')}\nWhat **language** would you prefer for the museum guide?\n\`English · Hindi · Bengali · Tamil · Telugu · Marathi · Gujarati · Kannada · Malayalam · Odia · Punjabi\``);
              } else {
                s.idType = msg; s.step = 'idnumber';
                pushBot(`🪪 **${msg}** — noted!\n\n${pfx(12,'ID Number')}\nEnter your **${msg} number**:\n_(or type **skip**)_`);
              }
              break;
            }
            case 'idnumber': {
              s.idNumber = lower === 'skip' ? '' : msg; s.step = 'language';
              pushBot(`${lower === 'skip' ? '⏭ Skipped' : `🔢 **${msg}**`} — noted!\n\n${pfx(13,'Guide Language')}\nWhat **language** would you prefer for the museum guide?\n\`English · Hindi · Bengali · Tamil · Telugu · Marathi · Gujarati · Kannada · Malayalam · Odia · Punjabi\``);
              break;
            }
            case 'language': {
              s.guideLanguage = lower === 'skip' ? 'English' : msg; s.step = 'guidedtour';
              pushBot(`🗣 **${s.guideLanguage}** — noted!\n\n${pfx(14,'Guided Tour')}\nWould you like a **guided tour**? An expert guide will accompany you (+₹100).\nType **yes** or **no**`);
              break;
            }

            // ── Experience ───────────────────────────────────────────────────
            case 'guidedtour': {
              const yes = ['yes','y','yep','sure','haan','ha','ok','want'].some(w => lower.includes(w));
              s.guidedTour = yes; s.step = 'photopermit';
              pushBot(`${yes ? '🎙 **Guided tour** added (+₹100)!' : '👍 No guided tour.'}\n\n${pfx(15,'Photography Permit')}\nWould you like a **photography permit**? (Personal cameras & smartphones allowed, +₹50)\nType **yes** or **no**`);
              break;
            }
            case 'photopermit': {
              const yes = ['yes','y','yep','sure','haan','ha','ok','want'].some(w => lower.includes(w));
              s.photoPermit = yes; s.step = 'wheelchair';
              pushBot(`${yes ? '📷 **Photography permit** added (+₹50)!' : '👍 No photography permit.'}\n\n${pfx(16,'Wheelchair Access')}\nDo you need **wheelchair access**? We\'ll ensure ramps and accessible routes are ready.\nType **yes** or **no**`);
              break;
            }

            // ── Accessibility ────────────────────────────────────────────────
            case 'wheelchair': {
              const yes = ['yes','y','yep','sure','haan','ha','ok'].some(w => lower.includes(w));
              s.wheelchair = yes; s.step = 'specialassist';
              pushBot(`${yes ? '♿ **Wheelchair access** noted!' : '👍 No wheelchair needed.'}\n\n${pfx(17,'Special Assistance')}\nDo you need **special assistance**? (Visual, hearing, or mobility help from our staff)\nType **yes** or **no**`);
              break;
            }
            case 'specialassist': {
              const yes = ['yes','y','yep','sure','haan','ha','ok'].some(w => lower.includes(w));
              s.specialAssist = yes; s.step = 'seniorassist';
              pushBot(`${yes ? '✋ **Special assistance** noted!' : '👍 No special assistance.'}\n\n${pfx(18,'Senior Citizen Support')}\nDo you need **senior citizen support**? (Priority entry, seating, and escort service)\nType **yes** or **no**`);
              break;
            }
            case 'seniorassist': {
              const yes = ['yes','y','yep','sure','haan','ha','ok'].some(w => lower.includes(w));
              s.seniorAssist = yes; s.step = 'confirm';

              // Build full summary
              const ticketLines = [
                s.adults   > 0 ? `${s.adults} Adult × ₹${s.museum?.ticketPrices?.adult ?? 0} = ₹${s.adults * (s.museum?.ticketPrices?.adult ?? 0)}` : '',
                s.children > 0 ? `${s.children} Child × ₹${s.museum?.ticketPrices?.child ?? 0} = ₹${s.children * (s.museum?.ticketPrices?.child ?? 0)}` : '',
                s.seniors  > 0 ? `${s.seniors} Senior × ₹${(s.museum?.ticketPrices as any)?.senior ?? 0} = ₹${s.seniors * ((s.museum?.ticketPrices as any)?.senior ?? 0)}` : '',
                s.students > 0 ? `${s.students} Student × ₹${(s.museum?.ticketPrices as any)?.student ?? 0} = ₹${s.students * ((s.museum?.ticketPrices as any)?.student ?? 0)}` : '',
              ].filter(Boolean).join('\n');

              const extras = [s.guidedTour && 'Guided Tour (+₹100)', s.photoPermit && 'Photography Permit (+₹50)'].filter(Boolean).join(' · ') || 'None';
              const access = [s.wheelchair && '♿ Wheelchair', s.specialAssist && '✋ Special Assist', s.seniorAssist && '🧓 Senior Support'].filter(Boolean).join(' · ') || 'None';

              const sub =
                s.adults   * (s.museum?.ticketPrices?.adult  ?? 0) +
                s.children * (s.museum?.ticketPrices?.child  ?? 0) +
                s.seniors  * ((s.museum?.ticketPrices as any)?.senior  ?? 0) +
                s.students * ((s.museum?.ticketPrices as any)?.student ?? 0) +
                (s.guidedTour ? 100 : 0) +
                (s.photoPermit ? 50 : 0);
              const fee   = Math.round(sub * 0.02);
              const grand = sub + fee;

              pushBot(
                `━━━━━━━━━━━━━━━━\n` +
                `📋 **Booking Summary**\n` +
                `━━━━━━━━━━━━━━━━\n` +
                `🏛 **${s.museum?.name}**\n` +
                `📍 ${s.museum?.city}, ${s.museum?.state}\n\n` +
                `📅 ${s.date}  ⏰ ${s.timeSlot}\n\n` +
                `🎟 **Tickets**\n${ticketLines}\n\n` +
                `✨ **Add-ons:** ${extras}\n` +
                `♿ **Accessibility:** ${access}\n\n` +
                `👤 ${s.visitorName}  |  ${s.nationality}\n` +
                `📧 ${s.visitorEmail}\n` +
                `📱 ${s.visitorPhone}\n` +
                (s.ageGroup ? `🎂 ${s.ageGroup}\n` : '') +
                (s.idType ? `🪪 ${s.idType}${s.idNumber ? `: ${s.idNumber}` : ''}\n` : '') +
                `🗣 Guide: ${s.guideLanguage}\n\n` +
                `💰 Subtotal ₹${sub} + Fee ₹${fee} = **₹${grand}**\n` +
                `━━━━━━━━━━━━━━━━\n\n` +
                `Type **yes** to proceed to payment · **no** to cancel`
              );
              break;
            }

            case 'confirm': {
              if (['yes','confirm','ok','sure','proceed','haan','ha'].some(w => lower.includes(w))) {
                const specParts = [
                  s.ageGroup       ? `Age: ${s.ageGroup}`                         : '',
                  s.nationality !== 'Indian' ? `Nationality: ${s.nationality}`    : '',
                  s.idType         ? `ID: ${s.idType}${s.idNumber ? ' ' + s.idNumber : ''}` : '',
                  s.guidedTour     ? 'Guided tour requested'                       : '',
                  s.photoPermit    ? 'Photography permit'                          : '',
                  s.guideLanguage !== 'English' ? `Guide lang: ${s.guideLanguage}` : '',
                  s.wheelchair     ? 'Wheelchair access'                           : '',
                  s.specialAssist  ? 'Special assistance'                          : '',
                  s.seniorAssist   ? 'Senior support'                              : '',
                ].filter(Boolean).join(' | ');

                const qs = new URLSearchParams({
                  llmMuseum:  JSON.stringify(s.museum!),
                  date:       s.date,
                  time:       s.timeSlot,
                  adults:     String(s.adults),
                  children:   String(s.children),
                  seniors:    String(s.seniors),
                  students:   String(s.students),
                  name:       s.visitorName,
                  email:      s.visitorEmail,
                  phone:      s.visitorPhone,
                  language:   s.guideLanguage,
                  special:    specParts,
                  source:     'chatbot',
                });
                setBk(INITIAL_BOOKING);
                pushBot('✅ **Confirmed!** Redirecting to payment in 2 s...');
                setTimeout(() => navigate(`/payment?${qs}`), 2000);
              } else {
                setBk(INITIAL_BOOKING);
                pushBot('Booking cancelled. Feel free to ask me anything!');
              }
              setBusy(false); return;
            }
          }
          setBk(s); setBusy(false); return;
        }
      }

      // BRANCH 2 — BOOKING TRIGGER
      if (BOOKING_TRIGGERS.some(t => lower.includes(t))) {
        const afterFor =
          msg.match(/book\s+(?:(?:a\s+)?tickets?\s+)?for\s+(.+?)(?:\s+museum)?$/i)?.[1]?.trim() ||
          msg.match(/book\s+(?:(?:a\s+)?tickets?\s+)?(?:at|in)\s+(.+)/i)?.[1]?.trim();
        const garbage = ['me','a','the','now','tickets','ticket','some'];
        const inline  = afterFor && afterFor.length > 2 && !garbage.includes(afterFor.toLowerCase()) ? afterFor : null;
        if (inline) {
          setBk(p => ({ ...p, step: 'fetching' }));
          const ctxCity = msgs.slice().reverse().reduce<string | undefined>((found, m) => {
            if (found) return found;
            return m.content.match(/\b(Visakhapatnam|Vizag|Delhi|Mumbai|Kolkata|Chennai|Hyderabad|Bengaluru|Bangalore|Jaipur|Kochi|Bhubaneswar|Amritsar|Agra|Varanasi|Mysuru|Guwahati|Shimla|Gangtok|Panaji|Bhopal|Chandigarh|Ahmedabad|Prayagraj|Nilambur|Thiruvananthapuram)\b/i)?.[1];
          }, undefined);
          const searchName = ctxCity && !inline.toLowerCase().includes(ctxCity.toLowerCase()) ? `${inline} ${ctxCity}` : inline;
          pushBot(`Fetching info for **${inline}**${ctxCity ? ` in ${ctxCity}` : ''}...`);
          const m = await fetchMuseum(searchName, ctxCity);
          if (m) {
            setBk(p => ({ ...p, step: 'choose', museum: m }));
            const p = m.ticketPrices;
            await pushMuseumCard(m, `**${m.name}** — ${m.city}, ${m.state}\nAdult ₹${p.adult} · Child ₹${p.child} · Foreign ₹${p.foreign||0}\n\n**1 — Book for me** · **2 — I'll book myself**\n\nType **1** or **2**:`);
          } else setBk(INITIAL_BOOKING);
        } else {
          setBk({ ...INITIAL_BOOKING, step: 'museum' });
          pushBot(`**Book tickets!**\n\nWhich museum? I can find **any museum across India**:\n_(e.g. Napier Museum, Victoria Memorial, Salar Jung Museum)_`);
        }
        setBusy(false); return;
      }

      const analysis = emotionAI.analyze(msg);
      setEmotion(analysis);

      const museumNameMatch =
        msg.match(/(?:about|info(?:rmation)?\s+(?:on|about)|show(?:\s+me)?(?:\s+images?)?(?:\s+of)?|tell\s+me\s+about|what\s+is|details?\s+(?:of|about))\s+([A-Za-z][\w\s]{3,50?}?)(?:\s+museum)?\s*$/i)?.[1]?.trim() ||
        msg.match(/^([A-Za-z][\w\s]{3,50?}?\s+museum)\s*$/i)?.[1]?.trim() ||
        msg.match(/([A-Za-z][\w\s]{3,50?}?)\s+museum/i)?.[1]?.trim().concat(' museum');

      const isMuseumQuery = !!(museumNameMatch && museumNameMatch.length > 4 &&
        (analysis.entities.hasMuseumMention || lower.includes('museum') || lower.includes('gallery')));

      let wikiCtx = '';
      if (analysis.entities.hasMuseumMention || analysis.intent === 'info') {
        const wiki = await wikipediaApi.getSummary(analysis.entities.cities.length ? `${msg} museum` : msg);
        if (wiki?.extract) wikiCtx = `\n\nWIKIPEDIA:\nTitle: ${wiki.title}\n${wiki.extract.slice(0, 700)}`;
      }
      const sysprompt = emotionAI.buildSystemPrompt(analysis, msgs) + wikiCtx;
      const aiReply   = await groqApi.chat(sysprompt, msgs, msg);

     
      if (isMuseumQuery && museumNameMatch) {
        try {
          const ctxCity = analysis.entities.cities[0];
          const m = await fetchMuseum(museumNameMatch, ctxCity);
          if (m && m.name && m.name !== 'Unknown Museum') {
           
            const imgs = m.images && m.images.length > 0
              ? m.images.slice(0, 3)
              : getMuseumImages({ name: m.name, type: m.type }, 3);
           
            const wikiSearchName = ctxCity ? `${m.name} ${ctxCity}` : m.name;
            const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiSearchName.replace(/\s+/g, '_'))}`;
            setMsgs(p => [...p, { role: 'assistant', content: aiReply, timestamp: Date.now(), images: imgs, museumCard: m, wikiUrl }]);
            speak(aiReply); setBusy(false);
            return;
          }
        } catch { /* fall through to plain reply */ }
      }
      pushBot(aiReply);
    } catch (e: any) {
      pushBot(`Error: ${e.message}. Please try again.`);
    } finally {
      setBusy(false);
    }
  };


  useEffect(() => { sendRef.current = send; });

  // ─── UI ──────────────────────────────────────────────────────
  const emotCfg = emotion ? EMOTION_STYLE[emotion.emotion] : null;

  const renderMsgContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    const applyInline = (text: string): string => {
      // Bold, italic, links
      let h = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
      // Clickable URLs — show friendly label for Wikipedia/website links
      h = h.replace(
        /(https?:\/\/[^\s<>"]+)/g,
        (url) => {
          const label = url.includes('wikipedia.org') ? '📖 Wikipedia' :
                        url.includes('gov.in') || url.includes('.in') || url.includes('.com') ? '🌍 Official Website' : url;
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--rust);font-weight:600;text-decoration:none;border-bottom:1px solid var(--rust);padding-bottom:1px;">${label}</a>`;
        }
      );
      return h;
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

     
      if (!trimmed) { elements.push(<div key={i} style={{ height: 4 }} />); i++; continue; }

      if (/^[-═]{3,}$/.test(trimmed)) {
        elements.push(<hr key={i} style={{ border: 'none', borderTop: '1.5px solid var(--border)', margin: '10px 0' }} />);
        i++; continue;
      }

      
      const isMuseumHeader = /^[🏛️🎨🔬🏯🕌🚂🌿⚔️🎭🏺]/.test(trimmed) && /\*\*/.test(trimmed);
      if (isMuseumHeader) {
        elements.push(
          <div key={i} style={{ marginTop: i > 0 ? 14 : 0, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)' }}
              dangerouslySetInnerHTML={{ __html: applyInline(trimmed) }} />
          </div>
        );
        i++; continue;
      }

      // Info row with leading emoji (📍 📝 🎟️ ⏰ ✨ 🌐 🌍 🎫 🗂️)
      const isInfoRow = /^[📍📝🎟️⏰✨🌐🌍🎫🗂️💡🏆📅🔑]/.test(trimmed);
      if (isInfoRow) {
        // Special styling for Wikipedia/website lines
        const isLink = trimmed.includes('http') || trimmed.toLowerCase().includes('wikipedia') || trimmed.toLowerCase().includes('website');
        elements.push(
          <div key={i} style={{
            display: 'flex', gap: 6, margin: '2px 0', alignItems: 'flex-start',
            background: isLink ? 'rgba(180,80,40,.06)' : 'transparent',
            borderRadius: isLink ? 6 : 0, padding: isLink ? '3px 6px' : '0',
          }}>
            <span style={{ fontSize: '.78rem', lineHeight: 1.5, color: 'var(--ink)', flex: 1 }}
              dangerouslySetInnerHTML={{ __html: applyInline(trimmed) }} />
          </div>
        );
        i++; continue;
      }

      // Bullet point (- or • or *)
      const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/);
      if (bulletMatch) {
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 6, margin: '1px 0', paddingLeft: 4 }}>
            <span style={{ color: 'var(--rust)', flexShrink: 0, fontSize: '.7rem', marginTop: 4 }}>▸</span>
            <span style={{ fontSize: '.78rem', lineHeight: 1.5, color: 'var(--ink)' }}
              dangerouslySetInnerHTML={{ __html: applyInline(bulletMatch[1]) }} />
          </div>
        );
        i++; continue;
      }

      
      const boldHeading = trimmed.match(/^\*\*([^*]+)\*\*:?$/);
      if (boldHeading) {
        elements.push(
          <div key={i} style={{ marginTop: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.72rem', fontWeight: 700,
              letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--rust)' }}>
              {boldHeading[1]}
            </span>
          </div>
        );
        i++; continue;
      }

      // Default paragraph
      elements.push(
        <p key={i} style={{ margin: '2px 0', fontSize: '.8rem', lineHeight: 1.55, color: 'var(--ink)' }}
          dangerouslySetInnerHTML={{ __html: applyInline(trimmed) || '&nbsp;' }} />
      );
      i++;
    }
    return elements;
  };

  return (
    <>
      {/* ── FAB Button ── */}
      <button
        className={`chat-fab-v4${open ? " hidden-v4" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
      >
        <MessageSquare size={22} color="white" />
        <div className="fab-dot-v4" />
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div className="chat-panel-v4">

          {/* ── Header ── */}
          <div className="cp-head-v4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="cp-avatar-v4">
                {mic
                  ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', animation: 'pulse-dot 1s infinite' }} />
                  : speaking
                  ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', animation: 'pulse-dot 1s infinite' }} />
                  : <Bot size={18} color="white" />
                }
              </div>
              <div>
                <div className="cp-name-v4">Musema AI Guide</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: mic ? '#f87171' : '#4ade80', display: 'inline-block' }} />
                  <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)' }}>
                    {mic ? 'Listening…' : speaking ? 'Speaking…' : 'ASK - EXPLORE - BOOK'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {voiceOk && (
                <button onClick={() => { setTts(v => !v); voiceService.stop(); }}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tts ? '#4ade80' : 'rgba(255,255,255,.3)' }}>
                  {tts ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
              )}
              {voiceOk && (
                <button onClick={toggleVoiceMode}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: voiceOn ? '#ef4444' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: voiceOn ? '#fff' : 'rgba(255,255,255,.3)' }}>
                  <Mic size={15} />
                </button>
              )}
              <button onClick={() => { setOpen(false); voiceService.stop(); stopMic(); setVoiceOn(false); }}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.45)', marginLeft: 2 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.45)')}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Voice mode bar ── */}
          {voiceOn && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', fontSize: '.75rem', fontWeight: 500, flexShrink: 0, background: mic ? '#FEF2F2' : speaking ? '#FFFBEB' : 'var(--cream)', color: mic ? '#B91C1C' : speaking ? '#92400E' : 'var(--ink3)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: mic ? '#ef4444' : speaking ? '#f59e0b' : 'var(--border)', display: 'inline-block', animation: (mic || speaking) ? 'pulse-dot 1s infinite' : 'none' }} />
                {mic ? 'Listening — speak now…' : speaking ? 'Speaking…' : 'Voice mode — say anything'}
              </div>
              <button onClick={mic ? stopMic : startMic} style={{ textDecoration: 'underline', fontSize: '.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                {mic ? 'Stop' : 'Speak'}
              </button>
            </div>
          )}

          {/* ── Emotion indicator ── */}
          {emotCfg && !voiceOn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '.75rem', fontWeight: 500, flexShrink: 0, background: emotCfg.bg, color: emotCfg.color, borderBottom: '1px solid var(--border)' }}>
              <Sparkles size={12} />
              <span style={{display:'flex',alignItems:'center',gap:4}}><EmotionIcon icon={emotCfg.icon} color={emotCfg.color} /> {emotCfg.label}</span>
              <span style={{ marginLeft: 'auto', opacity: .5, fontSize: '.7rem' }}>{(emotion!.confidence * 100).toFixed(0)}% match</span>
            </div>
          )}

          {/* ── Messages ── */}
          <div className="cp-msgs-v4">
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '93%', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  {/* Avatar */}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'user' ? 'var(--ink)' : 'var(--rust)' }}>
                    {m.role === 'user' ? <User size={13} color="white" /> : <Bot size={13} color="white" />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                    {/* Museum image card — only show if we have a real museum name */}
                    {m.museumCard && m.museumCard.name && m.museumCard.name !== 'Unknown Museum' && m.museumCard.city && m.museumCard.city !== 'Unknown City' && m.images && m.images.length > 0 && (
                      <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', height: 100, gap: 1 }}>
                          {m.images.map((img, idx) => (
                            <div key={idx} style={{ flex: 1, overflow: 'hidden' }}>
                              <img src={img} alt={m.museumCard!.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=70'; }} />
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: '10px 13px' }}>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '.9rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{m.museumCard.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.7rem', color: 'var(--ink3)' }}><MapPin size={10} />{m.museumCard.city}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.7rem', color: 'var(--ink3)' }}><Ticket size={10} />₹{m.museumCard.ticketPrices?.adult ?? 0}</span>
                            {m.museumCard.openingHours && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '.7rem', color: 'var(--ink3)' }}><Clock size={10} />{m.museumCard.openingHours.split('–')[0]?.trim()}</span>}
                          </div>
                          {m.wikiUrl && (
                            <a
                              href={m.wikiUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: '.65rem', fontWeight: 600, fontFamily: "'Syne',sans-serif",
                                color: 'var(--rust)', textDecoration: 'none',
                                letterSpacing: '.03em',
                              }}
                            >
                              🌐 View photos & more info on Wikipedia ↗
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Image strip without card */}
                    {!m.museumCard && m.images && m.images.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, height: 96, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {m.images.map((img, idx) => (
                          <div key={idx} style={{ flex: 1, overflow: 'hidden' }}>
                            <img src={img} alt="museum" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=70'; }} />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Text bubble */}
                    <div className={m.role === 'user' ? 'bubble-u-v4' : 'bubble-b-v4'}>{renderMsgContent(m.content)}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {busy && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--rust)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} color="white" />
                  </div>
                  <div className="bubble-b-v4">
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
                      {[0, 150, 300].map(d => (
                        <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)', display: 'inline-block', animation: `bounce 1s ${d}ms infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick prompts */}
            {showQ && msgs.length <= 1 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 7, fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)' }}>Try asking</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {QUICK.map(q => (<button key={q} onClick={() => send(q)} className="cp-chip-v4">{q}</button>))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* ── Booking progress ── */}
          {COLLECT_STEPS.includes(bk.step) && (() => {
            const stepIdx  = COLLECT_STEPS.indexOf(bk.step);
            const stepNum  = stepIdx + 1;
            const total    = COLLECT_STEPS.length;
            const pct      = (stepNum / total) * 100;
            const section =
              stepIdx <= 1  ? '📅 Visit Details'
              : stepIdx <= 5  ? '🎟 Tickets'
              : stepIdx <= 8  ? '👤 Contact Info'
              : stepIdx <= 12 ? '🪪 Visitor Details'
              : stepIdx <= 15 ? '✨ Experience'
              : stepIdx <= 18 ? '♿ Accessibility'
              : '✅ Confirm';
            return (
              <div style={{ padding: '10px 16px 12px', background: 'var(--white)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Calendar size={13} color="var(--rust)" />
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink2)' }}>{bk.museum?.name ?? 'Booking'}</span>
                    <span style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 400 }}>· {section}</span>
                  </div>
                  <span style={{ fontSize: '.68rem', fontFamily: 'monospace', color: 'var(--ink3)' }}>{stepNum}/{total}</span>
                </div>
                <div className="prog-bar-v4"><div className="prog-fill-v4" style={{ width: `${pct}%`, transition: 'width .3s ease' }} /></div>
              </div>
            );
          })()}

          {/* ── Input row ── */}
          <div style={{ padding: '12px 14px', background: 'var(--white)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {voiceOk && (
              <button
                onPointerDown={(e) => {
                  if (voiceOn) return;
                  (e.currentTarget as any)._holdStart = Date.now();
                  startMic();
                }}
                onPointerUp={(e) => {
                  if (voiceOn) return;
                  const held = Date.now() - ((e.currentTarget as any)._holdStart || 0);
                  if (held > 400) stopMic(); 
                }}
                onClick={() => {
                  if (voiceOn) { toggleVoiceMode(); return; }
                  
                }}
                style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: mic ? '#ef4444' : voiceOn ? '#FDE8DF' : 'var(--cream2)', color: mic ? '#fff' : voiceOn ? 'var(--rust)' : 'var(--ink3)', transform: mic ? 'scale(1.15)' : 'scale(1)', transition: 'all .2s', userSelect: 'none' }}
              >
                {mic ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={
                bk.step === 'idle'        ? 'Ask about any Indian museum…'
                : bk.step === 'museum'    ? 'Type any museum name…'
                : bk.step === 'fetching'  ? 'Fetching…'
                : bk.step === 'choose'    ? 'Type 1 or 2…'
                : bk.step === 'date'      ? 'YYYY-MM-DD e.g. 2026-04-15'
                : bk.step === 'time'      ? 'e.g. 10:00 or 14:00'
                : bk.step === 'adults'    ? 'Number of adults (0 or more)'
                : bk.step === 'children'  ? 'Number of children (0 = none)'
                : bk.step === 'seniors'   ? 'Number of seniors (0 = none)'
                : bk.step === 'students'  ? 'Number of students (0 = none)'
                : bk.step === 'name'      ? 'Your full name'
                : bk.step === 'email'     ? 'you@email.com'
                : bk.step === 'phone'     ? '+91 98765 43210'
                : bk.step === 'agegroup'  ? 'e.g. 18–30  or  skip'
                : bk.step === 'nationality' ? 'indian  or  foreign'
                : bk.step === 'idtype'    ? 'e.g. Aadhaar Card  or  skip'
                : bk.step === 'idnumber'  ? 'Enter ID number  or  skip'
                : bk.step === 'language'  ? 'e.g. Hindi  or  English'
                : bk.step === 'guidedtour'   ? 'yes  /  no'
                : bk.step === 'photopermit'  ? 'yes  /  no'
                : bk.step === 'wheelchair'   ? 'yes  /  no'
                : bk.step === 'specialassist'? 'yes  /  no'
                : bk.step === 'seniorassist' ? 'yes  /  no'
                : bk.step === 'confirm'   ? 'yes  /  no'
                : 'Type your reply…'
              }
              disabled={busy || bk.step === 'fetching' || mic}
              className="cp-input-v4"
            />
            <button onClick={() => send()} disabled={!input.trim() || busy} className="cp-send-v4">
              {busy ? <Loader2 size={14} color="white" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} color="white" />}
            </button>
          </div>

          {/* Footer hint */}
          <div style={{ padding: '7px 14px', background: 'var(--white)', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', flexShrink: 0 }}>
            {voiceOk ? 'Hold mic to speak · ' : ''}
          </div>
        </div>
      )}
    </>
  );
};

export default MuseumChatbot;