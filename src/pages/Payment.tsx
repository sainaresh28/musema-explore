import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getMuseumImage } from '../utils/museumImages';
import MainLayout from '../templates/MainLayout';
import { bookingApi, museumApi } from '../api';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import {
  Lock, CheckCircle, Loader2, Calendar, Clock, Users, MapPin,
  AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Ticket,
  CreditCard, Smartphone, Building2, Star, Shield, User,
  Globe, Camera, Mic,
} from 'lucide-react';
import type { Museum } from '../@types';

type PayMethod = 'card' | 'upi' | 'netbanking';

const TIME_SLOTS   = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const LANGUAGES    = ['English','Hindi','Bengali','Tamil','Telugu','Marathi','Gujarati','Kannada','Malayalam','Odia','Punjabi'];
const ID_TYPES     = ['Aadhaar Card','Passport','Driving Licence','Voter ID','PAN Card'];
const AGE_GROUPS   = ['Under 18','18–30','31–45','46–60','60+'];

// ── Shared style tokens ───────────────────────────────────────────────────────
const labelSt: React.CSSProperties = {
  fontFamily:"'Syne',sans-serif", fontSize:'.63rem', fontWeight:700,
  letterSpacing:'.12em', textTransform:'uppercase', color:'var(--k3)',
  display:'block', marginBottom:7,
};
const inputSt: React.CSSProperties = {
  width:'100%', height:44, padding:'0 14px', border:'1.5px solid var(--bd)',
  borderRadius:12, background:'var(--w)', fontFamily:'DM Sans,sans-serif',
  fontSize:'.88rem', color:'var(--k)', outline:'none', boxSizing:'border-box',
};

// ── Tiny reusable pieces ──────────────────────────────────────────────────────
function Inp(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...p}
      style={{ ...inputSt, ...(p.style||{}) }}
      onFocus={e => { e.target.style.borderColor='var(--k)'; p.onFocus?.(e); }}
      onBlur={e  => { e.target.style.borderColor='var(--bd)'; p.onBlur?.(e); }}
    />
  );
}

function Sel(p: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ position:'relative' }}>
      <select {...p}
        style={{ ...inputSt, cursor:'pointer', paddingRight:36, appearance:'none' as any, ...(p.style||{}) }}
        onFocus={e => { e.target.style.borderColor='var(--k)'; p.onFocus?.(e); }}
        onBlur={e  => { e.target.style.borderColor='var(--bd)'; p.onBlur?.(e); }}
      />
      <ChevronDown size={13} color="var(--k3)"
        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
    </div>
  );
}

function F({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={labelSt}>{label}</label>
      {children}
    </div>
  );
}

function YesNo({ val, set }: { val: boolean; set: (v:boolean)=>void }) {
  return (
    <div style={{ display:'flex', gap:8 }}>
      {[true, false].map(b => (
        <button key={String(b)} onClick={() => set(b)}
          style={{ padding:'8px 20px', borderRadius:100, border:`1.5px solid ${val===b?'var(--k)':'var(--bd)'}`, background:val===b?'var(--k)':'transparent', color:val===b?'#fff':'var(--k3)', fontFamily:"'Syne',sans-serif", fontSize:'.7rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', cursor:'pointer', transition:'all .2s' }}>
          {b?'Yes':'No'}
        </button>
      ))}
    </div>
  );
}

function Check({ on, set, label, sub }: { on:boolean; set:(v:boolean)=>void; label:string; sub?:string }) {
  return (
    <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer', padding:'12px 14px', borderRadius:12, border:`1.5px solid ${on?'var(--k)':'var(--bd)'}`, background:on?'var(--c)':'transparent', transition:'all .2s' }}>
      <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${on?'var(--k)':'var(--bd)'}`, background:on?'var(--k)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all .2s' }}>
        {on && <svg width="10" height="8" viewBox="0 0 10 8"><polyline points="1,4 4,7 9,1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <input type="checkbox" checked={on} onChange={e=>set(e.target.checked)} style={{ display:'none' }}/>
      <div>
        <div style={{ fontSize:'.82rem', fontWeight:600, color:on?'var(--k)':'var(--k3)', transition:'color .2s' }}>{label}</div>
        {sub && <div style={{ fontSize:'.72rem', color:'var(--k3)', marginTop:2 }}>{sub}</div>}
      </div>
    </label>
  );
}

function Ctr({ label, sub, n, set, price, min }: { label:string; sub:string; n:number; set:(fn:(c:number)=>number)=>void; price:number; min:number }) {
  return (
    <div style={{ padding:'14px 16px', borderRadius:14, border:'1.5px solid var(--bd)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--k)' }}>{label}</div>
        <div style={{ fontSize:'.71rem', color:'var(--k3)', marginTop:2 }}>{sub} · {price>0?`₹${price} each`:'Free'}</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {(['−','+'] as const).map(op => (
          <button key={op} onClick={() => set(c => op==='−' ? Math.max(min,c-1) : c+1)}
            style={{ width:32, height:32, borderRadius:8, border:'1.5px solid var(--bd)', background:'var(--w)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', color:'var(--k)', transition:'border-color .15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--k)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--bd)'}
          >{op}</button>
        ))}
        <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.5rem', color:'var(--k)', lineHeight:1, minWidth:22, textAlign:'center' }}>{n}</span>
      </div>
    </div>
  );
}

function SumLine({ label, val }: { label:string; val:number }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontSize:'.85rem', color:'var(--k3)' }}>{label}</span>
      <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--k)' }}>₹{val}</span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { user } = useUser();

  const museumIdParam   = sp.get('museumId')  || '';
  const museumNameParam = sp.get('museum')    || '';
  const llmMuseumParam  = sp.get('llmMuseum') || '';
  const src             = sp.get('source')    || 'web';
  const fromChatbot     = src === 'chatbot' || src === 'chatbot-self';
  const pDate    = sp.get('date')     || '';
  const pTime    = sp.get('time')     || '';
  const pAdult   = parseInt(sp.get('adults')   || '0');
  const pChild   = parseInt(sp.get('children') || '0');
  const pSenior  = parseInt(sp.get('seniors')  || '0');
  const pStudent = parseInt(sp.get('students') || '0');
  const pName    = sp.get('name')     || '';
  const pEmail   = sp.get('email')    || '';
  const pPhone   = sp.get('phone')    || '';
  const pLang    = sp.get('language') || '';
  const pSpecial = sp.get('special')  || '';
  const pGuided  = pSpecial.includes('Guided tour');
  const pPhoto   = pSpecial.includes('Photography permit');
  const pWheel   = pSpecial.includes('Wheelchair');
  const pAssist  = pSpecial.includes('Special assistance');
  const pSeniorS = pSpecial.includes('Senior support');

  let llmMuseum: any = null;
  try { if (llmMuseumParam) llmMuseum = JSON.parse(llmMuseumParam); } catch {}

  const isChatbotGuided = fromChatbot && !!pDate;
  const isEditable      = !isChatbotGuided;
  const isSelfBook      = !fromChatbot || !pDate;

  // Museum loading
  const [museum,  setMuseum]  = useState<Museum|null>(null);
  const [mLoad,   setMLoad]   = useState(true);
  const [mErr,    setMErr]    = useState('');

  useEffect(() => {
    (async () => {
      setMLoad(true); setMErr('');
      try {
        if (llmMuseum)        { setMuseum(llmMuseum as any); }
        else if (museumIdParam) { setMuseum((await museumApi.getById(museumIdParam)).museum); }
        else if (museumNameParam) {
          const d = await museumApi.getAll({ search: museumNameParam, limit:'1' } as any);
          if (d.museums?.length) setMuseum(d.museums[0]);
          else setMErr(`Museum "${museumNameParam}" not found.`);
        } else setMErr('No museum specified.');
      } catch (e:any) { setMErr(e.message||'Failed to load museum.'); }
      finally { setMLoad(false); }
    })();

  }, [museumIdParam, museumNameParam, llmMuseumParam]);

  // Accordion
  const [open, setOpen] = useState('visitor');
  const tog = (s:string) => setOpen(p => p===s ? '' : s);

  // ── 1. Visit Details ─────────────────────────────────────────
  const [visitDate,   setVisitDate]   = useState(pDate);
  const [visitTime,   setVisitTime]   = useState(pTime);
  const [guideLang,   setGuideLang]   = useState(pLang || 'English');

  // ── 2. Visitor Info ──────────────────────────────────────────
  const [vName,       setVName]       = useState(pName  || user?.fullName || '');
  const [vEmail,      setVEmail]      = useState(pEmail || user?.primaryEmailAddress?.emailAddress || '');
  const [vPhone,      setVPhone]      = useState(pPhone || '');
  const [ageGrp,      setAgeGrp]      = useState('');
  const [gender,      setGender]      = useState('');
  const [nationality, setNationality] = useState('Indian');
  const [idType,      setIdType]      = useState('');
  const [idNum,       setIdNum]       = useState('');

  // ── 3. Ticket Counts ─────────────────────────────────────────
  const [adults,   setAdults]   = useState(pAdult   || 1);
  const [children, setChildren] = useState(pChild   || 0);
  const [seniors,  setSeniors]  = useState(pSenior  || 0);
  const [students, setStudents] = useState(pStudent || 0);
  const [isGroup,  setIsGroup]  = useState(false);
  const [grpName,  setGrpName]  = useState('');

  // ── 4. Experience ────────────────────────────────────────────
  const [guided,   setGuided]   = useState(pGuided);
  const [photo,    setPhoto]    = useState(pPhoto);

  // ── 5. Accessibility ─────────────────────────────────────────
  const [wheel,    setWheel]    = useState(pWheel);
  const [assist,   setAssist]   = useState(pAssist);
  const [senior,   setSenior]   = useState(pSeniorS);
  const [accNote,  setAccNote]  = useState('');

  // ── Payment ──────────────────────────────────────────────────
  const [method,   setMethod]   = useState<PayMethod>('card');
  const [cardNo,   setCardNo]   = useState('');
  const [cardNm,   setCardNm]   = useState(pName || user?.fullName || '');
  const [expiry,   setExpiry]   = useState('');
  const [cvv,      setCvv]      = useState('');
  const [upi,      setUpi]      = useState('');
  const [proc,     setProc]     = useState(false);
  const [ok,       setOk]       = useState(false);
  const [ref,      setRef]      = useState('');

  const prices   = museum?.ticketPrices || { adult:0, child:0, senior:0, student:0 };
  const photoFee = photo  ? 50  : 0;
  const guideFee = guided ? 100 : 0;
  const sub      = adults   * (prices.adult  || 0)
                 + children * (prices.child  || 0)
                 + seniors  * ((prices as any).senior  || 0)
                 + students * ((prices as any).student || 0)
                 + photoFee + guideFee;
  const conv     = Math.round(sub * 0.02);
  const total    = sub + conv;
  const totalPax = adults + children + seniors + students;

  const fmtCard   = (v:string) => v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})/g,'$1 ').trim();
  const fmtExpiry = (v:string) => v.replace(/\D/g,'').slice(0,4).replace(/(\d{2})(\d)/,'$1/$2');

  const handlePay = async () => {
    if (!museum)                       { toast.error('Museum not loaded.'); return; }
    if (!visitDate)                    { toast.error('Please select a visit date.'); return; }
    if (!visitTime)                    { toast.error('Please select a time slot.'); return; }
    if (!vName.trim())                 { toast.error('Please enter visitor name.'); return; }
    if (!vEmail.includes('@'))         { toast.error('Please enter a valid email.'); return; }
    if (!vPhone.trim())                { toast.error('Please enter a phone number.'); return; }
    if (totalPax < 1)                  { toast.error('Please add at least 1 ticket.'); return; }
    if (method==='card') {
      if (cardNo.replace(/\s/g,'').length<16) { toast.error('Enter valid card number.'); return; }
      if (expiry.length<5)                    { toast.error('Enter valid expiry.'); return; }
      if (cvv.length<3)                       { toast.error('Enter valid CVV.'); return; }
    }
    if (method==='upi' && !upi.includes('@')) { toast.error('Enter valid UPI ID.'); return; }

    setProc(true);
    await new Promise(r=>setTimeout(r,2000));
    try {
      const specParts = [
        fromChatbot ? `Source: AI Chatbot (${isSelfBook?'self-fill':'guided'})` : '',
        ageGrp      ? `Age: ${ageGrp}`                     : '',
        gender      ? `Gender: ${gender}`                  : '',
        nationality !== 'Indian' ? `Nationality: ${nationality}` : '',
        idType      ? `ID: ${idType}${idNum?` ${idNum}`:''}` : '',
        isGroup && grpName ? `Group: ${grpName}`           : '',
        guided      ? 'Guided tour requested'              : '',
        photo       ? 'Photography permit'                 : '',
        guideLang !== 'English' ? `Guide lang: ${guideLang}` : '',
        wheel       ? 'Wheelchair access'                  : '',
        assist      ? 'Special assistance'                 : '',
        senior      ? 'Senior support'                     : '',
        accNote     ? `Notes: ${accNote}`                  : '',
      ].filter(Boolean).join(' | ');

      const data = await bookingApi.create({
        ...(llmMuseum ? { llmMuseum } : { museumId: (museum as any)._id || museumIdParam }),
        visitDate, timeSlot: visitTime,
        adultTickets: adults, childTickets: children,
        seniorTickets: seniors, studentTickets: students,
        visitorName: vName, visitorEmail: vEmail, visitorPhone: vPhone,
        specialRequirements: specParts,
      } as any);
      setRef(data.booking.bookingReference);
      setOk(true);
      toast.success('Booking confirmed!');
    } catch(e:any) { toast.error(e.message||'Booking failed.'); setProc(false); }
  };

  // ── SUCCESS ───────────────────────────────────────────────────
  if (ok) return (
    <MainLayout showBack>
      <div style={{ background:'var(--c)', minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
        <div style={{ maxWidth:520, width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ width:72, height:72, background:'#ECFDF5', border:'2px solid #A7F3D0', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle style={{ color:'#059669' }} size={36}/>
            </div>
            <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'3rem', color:'var(--k)', lineHeight:1, marginBottom:8 }}>Booking Confirmed!</h1>
            <p style={{ fontSize:'.9rem', color:'var(--k3)', fontWeight:300 }}>Your ticket has been saved. Show the QR at the museum entrance.</p>
          </div>
          <div style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:24, overflow:'hidden', boxShadow:'0 20px 60px rgba(24,21,15,.1)' }}>
            <div style={{ background:'var(--k)', padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,.4)', marginBottom:4 }}>Booking Reference</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.8rem', color:'var(--r)', letterSpacing:'.08em' }}>{ref}</div>
              </div>
              <div style={{ width:40, height:40, background:'rgba(255,255,255,.08)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Ticket size={20} color="white"/>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr' }}>
              <div style={{ padding:'28px 24px', borderRight:'1.5px dashed var(--bd)', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                <QRCode value={JSON.stringify({ref,museum:museum?.name,date:visitDate,time:visitTime,visitor:vName})} size={140}/>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--k3)' }}>Scan at Gate</div>
              </div>
              <div style={{ padding:'24px' }}>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.3rem', color:'var(--k)', lineHeight:1, marginBottom:4 }}>{museum?.name}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--k3)', display:'flex', alignItems:'center', gap:4 }}><MapPin size={11}/>{museum?.city}, {museum?.state}</div>
                </div>
                <div className="pay-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { icon:<Calendar size={12}/>, label:'Date',     val: new Date(visitDate).toLocaleDateString('en-IN',{dateStyle:'medium'}) },
                    { icon:<Clock size={12}/>,    label:'Time',     val: visitTime },
                    { icon:<Users size={12}/>,    label:'Visitors', val: `${totalPax} person${totalPax>1?'s':''}` },
                    { icon:<Lock size={12}/>,     label:'Paid',     val: total>0?`₹${total}`:'Free' },
                  ].map(r => (
                    <div key={r.label}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.58rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--k3)', marginBottom:2, display:'flex', alignItems:'center', gap:4 }}>{r.icon}{r.label}</div>
                      <div style={{ fontSize:'.82rem', fontWeight:500, color:'var(--k)' }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1.5px solid var(--bd)', display:'flex', gap:12 }}>
              <button onClick={()=>navigate('/dashboard')} style={{ flex:1, padding:'10px', border:'1.5px solid var(--bd)', borderRadius:12, background:'transparent', fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--k3)', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--k)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--bd)'}>
                View Dashboard
              </button>
              <button onClick={()=>navigate('/')} style={{ flex:1, padding:'10px', border:'none', borderRadius:12, background:'var(--k)', fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'#fff', cursor:'pointer', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--r)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--k)'}>
                Explore More <ArrowRight size={12} style={{ display:'inline', marginLeft:4 }}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );

  if (mLoad) return (
    <MainLayout showBack>
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:44, height:44, border:'2.5px solid var(--k)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }}/>
          <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'.8rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--k3)' }}>Loading museum…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </MainLayout>
  );

  if (mErr) return (
    <MainLayout showBack>
      <div style={{ maxWidth:440, margin:'0 auto', padding:'80px 24px', textAlign:'center' }}>
        <div style={{ width:56, height:56, background:'#FEF2F2', border:'1.5px solid #FECACA', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <AlertTriangle style={{ color:'#DC2626' }} size={24}/>
        </div>
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'var(--k)', marginBottom:8 }}>Museum Not Found</h2>
        <p style={{ fontSize:'.88rem', color:'var(--k3)', marginBottom:24 }}>{mErr}</p>
        <button onClick={()=>navigate('/')} className="btn-v4-fill">Browse Museums</button>
      </div>
    </MainLayout>
  );

  

  return (
    <MainLayout showBack>
      <div style={{ background:'var(--c)', minHeight:'100vh', padding:'0 0 80px' }}>

        {/* ── Hero ── */}
        <div className="pay-page-hero" style={{ position:'relative', height:220, overflow:'hidden' }}>
          {museum?.images?.[0]
            ? <img src={getMuseumImage(museum.name)||museum.images[0]} alt={museum.name} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(.42)' }}/>
            : <div style={{ width:'100%', height:'100%', background:'var(--k)' }}/>
          }
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,var(--c))', zIndex:1 }}/>
          <div style={{ position:'absolute', bottom:24, left:0, right:0, zIndex:2, maxWidth:1200, margin:'auto', padding:'0 clamp(16px,3vw,40px)' }}>
            {fromChatbot && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'.7rem', fontWeight:600, background:'rgba(255,255,255,.15)', color:'#fff', padding:'4px 12px', borderRadius:100, backdropFilter:'blur(8px)', marginBottom:8, border:'1px solid rgba(255,255,255,.2)' }}>
                <Mic size={11}/> {isSelfBook ? 'Self-booking via AI' : 'AI-guided booking'}
              </span>
            )}
            <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(2rem,5vw,3.2rem)', color:'#fff', lineHeight:1, marginBottom:4 }}>{museum?.name}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <span style={{ fontSize:'.82rem', color:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', gap:4 }}><MapPin size={13}/>{museum?.city}, {museum?.state}</span>
              {museum?.rating && <span style={{ fontSize:'.82rem', color:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', gap:4 }}><Star size={12} fill="currentColor"/>{museum.rating} rating</span>}
            </div>
          </div>
        </div>

        {/* ── Demo Payment Banner ── */}
        <div className="pay-demo-banner" style={{ maxWidth:1200, margin:'0 auto', padding:'16px 40px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, background:'#FFFBEB', border:'1.5px solid #F6D860', borderRadius:14, padding:'12px 18px' }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'.78rem', letterSpacing:'.06em', textTransform:'uppercase', color:'#92400E' }}>
                Demo Mode u2014 Development &amp; Testing Phase
              </div>
              <div style={{ fontSize:'.76rem', color:'#B45309', marginTop:2, lineHeight:1.5 }}>
                This is a simulated payment flow. No real money is charged. Use any test card details to complete the booking.
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .pay-main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }

          /* ── Payment page mobile ── */
          @media(max-width:900px) {
            .pay-main-grid { grid-template-columns: 1fr; gap: 20px; }
            .pay-main-grid > div:last-child { order: -1; }
          }

          @media(max-width:768px) {
            /* Demo banner */
            .pay-demo-banner { padding: 12px 16px 0 !important; }
            /* Hero */
            .pay-page-hero { height: 160px !important; }
            .pay-page-hero h1 { font-size: clamp(1.4rem,5vw,2rem) !important; }
            .pay-page-hero-meta { flex-wrap: wrap; gap: 8px; }
            /* Main grid padding */
            .pay-main-grid { padding-left: 16px !important; padding-right: 16px !important; padding-bottom: 40px !important; }
            /* Accordion section cards */
            .pay-acc-card { padding: 16px !important; border-radius: 14px !important; }
            /* All 2-col form grids inside payment → 1 col */
            .pay-form-2col { grid-template-columns: 1fr !important; }
            .pay-form-3col { grid-template-columns: 1fr 1fr !important; }
            /* Slot grid */
            .pay-slot-row { grid-template-columns: repeat(3,1fr) !important; gap: 6px !important; }
            /* Ticket counter */
            .pay-ticket-row { gap: 12px !important; }
            /* Summary card */
            .pay-summary-card { border-radius: 16px !important; padding: 20px 16px !important; }
            /* Confirmation */
            .pay-confirm-wrap { padding: 24px 16px !important; }
            .pay-qr-section { padding: 20px 14px !important; }
            .pay-qr-section svg { width: 148px !important; height: 148px !important; }
            .pay-confirm-details-grid { grid-template-columns: 1fr !important; }
          }

          @media(max-width:480px) {
            .pay-page-hero { height: 140px !important; }
            .pay-form-3col { grid-template-columns: 1fr !important; }
            .pay-slot-row { grid-template-columns: repeat(2,1fr) !important; }
            .pay-qr-section svg { width: 130px !important; height: 130px !important; }
          }
        `}</style>
        <div className="pay-main-grid" style={{ maxWidth:1200, margin:'0 auto', padding:'clamp(16px,4vw,32px) clamp(16px,3vw,40px) 0' }}>

          {/* ── LEFT COLUMN ───────────────────────────────── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* 1 ▸ Visit Details */}
            <AccSection openId={open} onToggle={tog} id="visit" icon={<Calendar size={16}/>} title="Visit Details"
              badge={visitDate ? `${visitDate}${visitTime?' · '+visitTime:''}` : undefined}>
              {/* Museum pill */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--c)', borderRadius:14, border:'1.5px solid var(--bd)', marginBottom:20 }}>
                {museum?.thumbnail && <img src={getMuseumImage(museum.name)||museum.thumbnail} alt={museum.name} style={{ width:52, height:52, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>}
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.82rem', fontWeight:700, color:'var(--k)' }}>{museum?.name}</div>
                  <div style={{ fontSize:'.71rem', color:'var(--k3)', marginTop:2 }}>{museum?.city}, {museum?.state}</div>
                  <div style={{ fontSize:'.68rem', color:'var(--k3)', marginTop:3 }}>
                    Adult ₹{prices.adult} · Child ₹{prices.child} · Senior ₹{(prices as any).senior||0} · Student ₹{(prices as any).student||0}
                  </div>
                </div>
              </div>

              <div className="pay-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <F label="Visit Date *">
                  {isEditable
                    ? <Inp type="date" value={visitDate} onChange={e=>setVisitDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>
                    : <div style={{ ...inputSt, display:'flex', alignItems:'center', gap:8, background:'var(--c)' }}><Calendar size={14} color="var(--k3)"/>{visitDate}</div>
                  }
                </F>
                <F label="Time Slot *">
                  {isEditable
                    ? <Sel value={visitTime} onChange={e=>setVisitTime(e.target.value)}>
                        <option value="">Select time</option>
                        {TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
                      </Sel>
                    : <div style={{ ...inputSt, display:'flex', alignItems:'center', gap:8, background:'var(--c)' }}><Clock size={14} color="var(--k3)"/>{visitTime}</div>
                  }
                </F>
              </div>

              <F label="Preferred Language for Museum Guide">
                <Sel value={guideLang} onChange={e=>setGuideLang(e.target.value)}>
                  {LANGUAGES.map(l=><option key={l} value={l}>{l}</option>)}
                </Sel>
              </F>
            </AccSection>

            {/* 2 ▸ Visitor Information */}
            <AccSection openId={open} onToggle={tog} id="visitor" icon={<User size={16}/>} title="Visitor Information" badge={vName||undefined}>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                <F label="Full Name *">
                  <Inp value={vName} onChange={e=>setVName(e.target.value)} placeholder="Your full name"/>
                </F>

                <div className="pay-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <F label="Email Address *">
                    <Inp type="email" value={vEmail} onChange={e=>setVEmail(e.target.value)} placeholder="you@email.com"/>
                  </F>
                  <F label="Phone Number *">
                    <Inp value={vPhone} onChange={e=>setVPhone(e.target.value)} placeholder="+91 98765 43210"/>
                  </F>
                </div>

                <div className="pay-form-3col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                  <F label="Age Group">
                    <Sel value={ageGrp} onChange={e=>setAgeGrp(e.target.value)}>
                      <option value="">Select</option>
                      {AGE_GROUPS.map(a=><option key={a} value={a}>{a}</option>)}
                    </Sel>
                  </F>
                  <F label="Gender (optional)">
                    <Sel value={gender} onChange={e=>setGender(e.target.value)}>
                      <option value="">Prefer not to say</option>
                      <option>Male</option><option>Female</option>
                      <option>Non-binary</option><option>Other</option>
                    </Sel>
                  </F>
                  <F label="Nationality">
                    <Sel value={nationality} onChange={e=>setNationality(e.target.value)}>
                      <option value="Indian">Indian</option>
                      <option value="Foreign National">Foreign National</option>
                    </Sel>
                  </F>
                </div>

                {/* ID proof inline pair */}
                <div className="pay-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <F label="ID Proof Type">
                    <Sel value={idType} onChange={e=>{ setIdType(e.target.value); setIdNum(''); }}>
                      <option value="">Select ID type</option>
                      {ID_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </Sel>
                  </F>
                  <F label={`${idType||'ID'} Number`}>
                    <Inp
                      value={idNum}
                      onChange={e=>setIdNum(e.target.value)}
                      disabled={!idType}
                      placeholder={
                        idType==='Aadhaar Card'      ? 'XXXX XXXX XXXX' :
                        idType==='Passport'          ? 'A1234567'       :
                        idType==='Driving Licence'   ? 'DL-0000000000'  :
                        idType==='Voter ID'          ? 'ABC1234567'     :
                        idType==='PAN Card'          ? 'ABCDE1234F'     : 'Enter number'
                      }
                      style={{ background:!idType?'var(--c)':'var(--w)', color:!idType?'var(--k3)':'var(--k)', cursor:!idType?'not-allowed':'text' }}
                    />
                  </F>
                </div>

                {nationality==='Foreign National' && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#FFF7ED', border:'1.5px solid #FED7AA', borderRadius:10 }}>
                    <Globe size={13} color="#EA580C"/>
                    <span style={{ fontSize:'.72rem', color:'#9A3412', fontFamily:"'Syne',sans-serif", fontWeight:500 }}>
                      Foreign national ticket pricing applies. Carry your passport at the museum.
                    </span>
                  </div>
                )}
              </div>
            </AccSection>

            {/* 3 ▸ Visitor Category & Tickets */}
            <AccSection openId={open} onToggle={tog} id="tickets" icon={<Ticket size={16}/>} title="Visitor Category & Tickets"
              badge={totalPax>0 ? `${totalPax} ticket${totalPax>1?'s':''}` : undefined}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {isEditable ? (
                  <>
                    <Ctr label="Adult"          sub="Age 18–59"           n={adults}   set={setAdults}   price={prices.adult ||0} min={0}/>
                    <Ctr label="Child"          sub="Age 5–17"            n={children} set={setChildren} price={prices.child ||0} min={0}/>
                    <Ctr label="Senior Citizen" sub="Age 60+"             n={seniors}  set={setSeniors}  price={(prices as any).senior  ||0} min={0}/>
                    <Ctr label="Student"        sub="With valid ID card"  n={students} set={setStudents} price={(prices as any).student ||0} min={0}/>
                  </>
                ) : (
                  <div className="pay-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[['Adults',adults],['Children',children]].map(([l,c]) => (
                      <div key={String(l)} style={{ ...inputSt, display:'flex', alignItems:'center', gap:8, background:'var(--c)' }}>
                        <Users size={14} color="var(--k3)"/>{c} {l}
                      </div>
                    ))}
                  </div>
                )}

                {/* Group booking */}
                <div style={{ marginTop:4, padding:'14px 16px', borderRadius:14, border:'1.5px solid var(--bd)', background:'var(--c)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:isGroup?12:0 }}>
                    <div>
                      <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--k)' }}>Group Booking</div>
                      <div style={{ fontSize:'.71rem', color:'var(--k3)', marginTop:2 }}>10+ visitors — add a group name for coordination</div>
                    </div>
                    <YesNo val={isGroup} set={setIsGroup}/>
                  </div>
                  {isGroup && (
                    <Inp value={grpName} onChange={e=>setGrpName(e.target.value)}
                      placeholder="School / organisation / group name"/>
                  )}
                </div>
              </div>
            </AccSection>

            {/* 4 ▸ Museum Experience */}
            <AccSection openId={open} onToggle={tog} id="experience" icon={<Camera size={16}/>} title="Museum Experience Options">
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <Check on={guided} set={setGuided}
                  label="Guided Tour Required"
                  sub={`Expert guide in ${guideLang} · +₹100 per group`}/>
                <Check on={photo} set={setPhoto}
                  label="Photography Permission Ticket"
                  sub="Personal cameras & smartphones permitted · +₹50"/>
              </div>
            </AccSection>

            {/* 5 ▸ Accessibility */}
            <AccSection openId={open} onToggle={tog} id="access" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2"/><path d="M12 22V12m0 0l-4 2m4-2l4 2"/><path d="M5 12c0 3 2 5.5 7 5.5S19 15 19 12"/>
              </svg>
            } title="Accessibility Options">
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <Check on={wheel}  set={setWheel}  label="Wheelchair Access Required"  sub="We'll ensure ramps and accessible routes are ready"/>
                <Check on={assist} set={setAssist} label="Special Assistance Needed"   sub="Visual, hearing, or mobility help from our staff"/>
                <Check on={senior} set={setSenior} label="Senior Citizen Support"      sub="Priority entry, seating, and personal escort service"/>
                {(wheel||assist||senior) && (
                  <div>
                    <label style={labelSt}>Additional Notes (optional)</label>
                    <textarea value={accNote} onChange={e=>setAccNote(e.target.value)}
                      placeholder="Describe any specific requirements…" rows={3}
                      style={{ width:'100%', padding:'12px 14px', border:'1.5px solid var(--bd)', borderRadius:12, background:'var(--w)', fontFamily:'DM Sans,sans-serif', fontSize:'.88rem', color:'var(--k)', outline:'none', boxSizing:'border-box', resize:'vertical' }}
                      onFocus={e=>e.target.style.borderColor='var(--k)'}
                      onBlur={e=>e.target.style.borderColor='var(--bd)'}
                    />
                  </div>
                )}
              </div>
            </AccSection>

            {/* 6 ▸ Payment */}
            <AccSection openId={open} onToggle={tog} id="payment" icon={<CreditCard size={16}/>} title="Payment Method">
              <div className="pay-slot-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:24 }}>
                {([
                  { id:'card' as PayMethod,       icon:<CreditCard size={14}/>, line1:'Credit / Debit', line2:'Card' },
                  { id:'upi'  as PayMethod,       icon:<Smartphone size={14}/>, line1:'UPI',           line2:'Payment' },
                  { id:'netbanking' as PayMethod, icon:<Building2  size={14}/>, line1:'Net',            line2:'Banking' },
                ]).map(m=>(
                  <button key={m.id} onClick={()=>setMethod(m.id)}
                    style={{ padding:'14px 12px', borderRadius:14, border:`2px solid ${method===m.id?'var(--k)':'var(--bd)'}`, background:method===m.id?'var(--k)':'var(--w)', color:method===m.id?'#fff':'var(--k3)', cursor:'pointer', transition:'all .2s', display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    {m.icon}
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>{m.line1}</span>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.58rem', letterSpacing:'.04em', textTransform:'uppercase', opacity:.6 }}>{m.line2}</span>
                  </button>
                ))}
              </div>

              {method==='card' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <F label="Card Number">
                    <Inp placeholder="1234  5678  9012  3456" value={cardNo} onChange={e=>setCardNo(fmtCard(e.target.value))} maxLength={19}
                      style={{ fontFamily:'monospace', fontSize:'.95rem', letterSpacing:'.1em' }}/>
                  </F>
                  <F label="Name on Card">
                    <Inp value={cardNm} onChange={e=>setCardNm(e.target.value)} placeholder="Full name"/>
                  </F>
                  <div className="pay-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <F label="Expiry">
                      <Inp placeholder="MM/YY" value={expiry} onChange={e=>setExpiry(fmtExpiry(e.target.value))} maxLength={5}
                        style={{ fontFamily:'monospace', fontSize:'.95rem' }}/>
                    </F>
                    <F label="CVV">
                      <Inp placeholder="•••" value={cvv} type="password"
                        onChange={e=>setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} maxLength={4}
                        style={{ fontFamily:'monospace', fontSize:'1.1rem' }}/>
                    </F>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['Visa','Mastercard','RuPay','Amex'].map(c=>(
                      <span key={c} style={{ fontSize:'.68rem', border:'1px solid var(--bd)', color:'var(--k3)', padding:'4px 10px', borderRadius:8, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {method==='upi' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <F label="UPI ID">
                    <Inp placeholder="yourname@upi" value={upi} onChange={e=>setUpi(e.target.value)}
                      style={{ fontFamily:'monospace', fontSize:'.95rem' }}/>
                  </F>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['GPay','PhonePe','Paytm','BHIM'].map(a=>(
                      <button key={a} onClick={()=>setUpi(`user@${a.toLowerCase()}`)}
                        style={{ padding:'8px 16px', border:'1.5px solid var(--bd)', borderRadius:10, background:'var(--c)', fontFamily:"'Syne',sans-serif", fontSize:'.7rem', fontWeight:600, color:'var(--k3)', cursor:'pointer', transition:'all .2s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--k)';e.currentTarget.style.color='var(--k)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--k3)';}}>{a}</button>
                    ))}
                  </div>
                </div>
              )}

              {method==='netbanking' && (
                <div className="pay-form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {['SBI','HDFC','ICICI','Axis','Kotak','PNB'].map(b=>(
                    <button key={b}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:'1.5px solid var(--bd)', borderRadius:12, background:'var(--w)', fontFamily:"'Syne',sans-serif", fontSize:'.78rem', fontWeight:600, color:'var(--k3)', cursor:'pointer', transition:'all .2s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--k)';e.currentTarget.style.color='var(--k)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--k3)';}}><Building2 size={14}/>{b} Bank</button>
                  ))}
                </div>
              )}

              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16, padding:'12px 14px', background:'var(--c)', borderRadius:10, border:'1px solid var(--bd)' }}>
                <Shield size={13} color="var(--k3)"/>
                <span style={{ fontSize:'.72rem', color:'var(--k3)', fontFamily:"'Syne',sans-serif", fontWeight:500 }}>
                  256-bit SSL · PCI DSS Compliant · Mock payment — no real charge
                </span>
              </div>
            </AccSection>
          </div>

          {/* ── RIGHT COLUMN: Order Summary ───────────────── */}
          <div style={{ position:'sticky', top:88 }}>
            <div style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:20, overflow:'hidden', boxShadow:'0 12px 40px rgba(24,21,15,.07)' }}>

              {museum?.thumbnail && (
                <div style={{ height:140, overflow:'hidden' }}>
                  <img src={getMuseumImage(museum.name)||museum.thumbnail} alt={museum.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </div>
              )}

              <div style={{ padding:'20px 24px', borderBottom:'1.5px solid var(--bd)' }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.3rem', color:'var(--k)', lineHeight:1, marginBottom:4 }}>{museum?.name}</div>
                <div style={{ fontSize:'.72rem', color:'var(--k3)', display:'flex', alignItems:'center', gap:4 }}><MapPin size={11}/>{museum?.city}, {museum?.state}</div>
              </div>

              {/* Chips */}
              {(visitDate||visitTime||guideLang) && (
                <div style={{ padding:'12px 24px', borderBottom:'1.5px solid var(--bd)', display:'flex', gap:6, flexWrap:'wrap' }}>
                  {visitDate  && <Chip icon={<Calendar size={10}/>} label={visitDate}/>}
                  {visitTime  && <Chip icon={<Clock size={10}/>}    label={visitTime}/>}
                  {guideLang  && <Chip icon={<Globe size={10}/>}    label={guideLang}/>}
                </div>
              )}

              {/* Accessibility flags */}
              {(wheel||assist||senior) && (
                <div style={{ padding:'10px 24px', borderBottom:'1.5px solid var(--bd)', display:'flex', gap:6, flexWrap:'wrap' }}>
                  {wheel  && <span style={{ fontSize:'.62rem', padding:'3px 9px', background:'#EEF2FF', color:'#3730A3', borderRadius:100, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>♿ Wheelchair</span>}
                  {assist && <span style={{ fontSize:'.62rem', padding:'3px 9px', background:'#F0FDF4', color:'#166534', borderRadius:100, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>✋ Assistance</span>}
                  {senior && <span style={{ fontSize:'.62rem', padding:'3px 9px', background:'#FFF7ED', color:'#9A3412', borderRadius:100, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>🧓 Senior</span>}
                </div>
              )}

              {/* Extras flags */}
              {(guided||photo) && (
                <div style={{ padding:'10px 24px', borderBottom:'1.5px solid var(--bd)', display:'flex', gap:6, flexWrap:'wrap' }}>
                  {guided && <span style={{ fontSize:'.62rem', padding:'3px 9px', background:'#EEF2FF', color:'#3730A3', borderRadius:100, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>🎙 Guided Tour</span>}
                  {photo  && <span style={{ fontSize:'.62rem', padding:'3px 9px', background:'#FFF7ED', color:'#9A3412', borderRadius:100, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>📷 Photo Permit</span>}
                </div>
              )}

              {/* Price breakdown */}
              <div style={{ padding:'20px 24px' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--k3)', marginBottom:14 }}>Order Summary</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {adults   >0 && <SumLine label={`${adults}× Adult`}   val={adults   *(prices.adult ||0)}/>}
                  {children >0 && <SumLine label={`${children}× Child`} val={children *(prices.child ||0)}/>}
                  {seniors  >0 && <SumLine label={`${seniors}× Senior`} val={seniors  *((prices as any).senior  ||0)}/>}
                  {students >0 && <SumLine label={`${students}× Student`} val={students*((prices as any).student||0)}/>}
                  {guided      && <SumLine label="Guided tour"           val={100}/>}
                  {photo       && <SumLine label="Photo permit"          val={50}/>}
                  {sub>0 && (
                    <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid var(--bd)' }}>
                      <span style={{ fontSize:'.78rem', color:'var(--k3)' }}>Convenience fee (2%)</span>
                      <span style={{ fontSize:'.78rem', color:'var(--k3)' }}>₹{conv}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1.5px solid var(--bd)' }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.8rem', fontWeight:700, color:'var(--k)', textTransform:'uppercase', letterSpacing:'.06em' }}>Total</span>
                    <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'var(--k)', lineHeight:1 }}>{total>0?`₹${total}`:'Free'}</span>
                  </div>
                </div>
              </div>

              {/* Pay button */}
              <div style={{ padding:'0 24px 24px' }}>
                <button onClick={handlePay} disabled={proc}
                  style={{ width:'100%', height:52, border:'none', borderRadius:14, background:proc?'var(--k3)':'var(--k)', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:'.82rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', cursor:proc?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .2s' }}
                  onMouseEnter={e=>{ if(!proc) e.currentTarget.style.background='var(--r)'; }}
                  onMouseLeave={e=>{ if(!proc) e.currentTarget.style.background='var(--k)'; }}>
                  {proc
                    ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/>Processing…</>
                    : <><Lock size={14}/>Pay {total>0?`₹${total}`:'Now'}</>
                  }
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </button>
                <p style={{ textAlign:'center', fontSize:'.68rem', color:'var(--k3)', marginTop:10, fontFamily:"'Syne',sans-serif" }}>
                  Booking saved to your account instantly
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="pay-slot-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:16 }}>
              {[
                { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--r)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label:'SSL Secure' },
                { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--r)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label:'Instant QR' },
                { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--r)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, label:'Dashboard' },
              ].map(b=>(
                <div key={b.label} style={{ textAlign:'center', padding:'12px 8px', background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:12 }}>
                  <div style={{ marginBottom:4, display:'flex', justifyContent:'center' }}>{b.icon}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--k3)' }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', background:'var(--c)', border:'1px solid var(--bd)', borderRadius:100, fontSize:'.68rem', color:'var(--k3)', fontFamily:"'Syne',sans-serif", fontWeight:600 }}>
      {icon}{label}
    </span>
  );
}

// ── AccSection:  ──
function AccSection({ id, icon, title, badge, openId, onToggle, children }: {
  id: string; icon: React.ReactNode; title: string; badge?: string;
  openId: string; onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = openId === id;
  return (
    <div style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:20, overflow:'hidden' }}>
      <button onClick={() => onToggle(id)}
        style={{ width:'100%', padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'transparent', border:'none', cursor:'pointer', borderBottom: isOpen ? '1.5px solid var(--bd)' : 'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, background:isOpen?'var(--k)':'var(--c)', border:`1.5px solid ${isOpen?'var(--k)':'var(--bd)'}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
            <span style={{ color:isOpen?'#fff':'var(--k3)', display:'flex', transition:'color .2s' }}>{icon}</span>
          </div>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.82rem', fontWeight:700, color:'var(--k)' }}>{title}</div>
            {badge && !isOpen && <div style={{ fontSize:'.68rem', color:'var(--k3)', marginTop:1 }}>{badge}</div>}
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} color="var(--k3)"/> : <ChevronDown size={16} color="var(--k3)"/>}
      </button>
      {isOpen && <div style={{ padding:'24px' }}>{children}</div>}
    </div>
  );
}