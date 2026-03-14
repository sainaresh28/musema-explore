import { useState } from 'react';
import emailjs from '@emailjs/browser';
import MainLayout from '../templates/MainLayout';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

const EMAILJS_SERVICE_ID   = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID  = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_AUTOREPLY_ID = import.meta.env.VITE_EMAILJS_AUTOREPLY_ID;
const EMAILJS_PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
// ─────────────────────────────────────────────────────────────────

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');

    const templateVars = {
      from_name:  form.name,
      from_email: form.email,
      reply_to:   form.email,  
      subject:    form.subject || 'General Enquiry',
      message:    form.message,
    };

    try {
     
      await Promise.all([
        
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateVars, EMAILJS_PUBLIC_KEY),
       
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_ID, templateVars, EMAILJS_PUBLIC_KEY),
      ]);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <MainLayout>
      <style>{`
        @media(max-width:768px) {
          .contact-hero-sec { min-height: auto !important; }
          .contact-hero-inner { grid-template-columns: 1fr !important; gap: 28px !important; padding: 60px 16px 40px !important; }
          .contact-hero-inner h1 { font-size: clamp(2.4rem,9vw,4rem) !important; margin-bottom: 16px !important; }
          .contact-hero-right { display: none !important; }
          .contact-body { grid-template-columns: 1fr !important; gap: 28px !important; padding: 40px 16px !important; }
          .contact-info-links { grid-template-columns: 1fr !important; gap: 10px !important; }
          .contact-card { padding: 28px 20px !important; border-radius: 18px !important; }
          .contact-form-name-row { grid-template-columns: 1fr !important; gap: 12px !important; margin-bottom: 12px !important; }
          .contact-form-card { padding: 28px 20px !important; border-radius: 18px !important; }
        }
        @media(max-width:480px) {
          .contact-hero-inner { padding: 48px 12px 32px !important; }
        }
      `}</style>
      {/* ── HERO ── */}
      <section className="contact-hero-sec" style={{ background: 'var(--k)', minHeight: '62vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")", pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-30%', right:'-5%', width:'45%', height:'140%', background:'radial-gradient(ellipse, rgba(180,70,30,.12) 0%, transparent 68%)', pointerEvents:'none' }} />
        <div className="contact-hero-inner" style={{ maxWidth: 1360, margin: 'auto', padding: '80px 40px', width: '100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', position:'relative', zIndex:1 }}>
          <div className="R">
            <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(4rem,7vw,7.5rem)', lineHeight: .88, color: '#fff', margin: '0 0 28px' }}>
              Contact<br /><span style={{ color: 'var(--r)' }}>Us</span>
            </h1>
            <p style={{ fontSize: '.92rem', lineHeight: 1.76, color: 'rgba(255,255,255,.45)', fontWeight: 300, maxWidth: 380 }}>
              Questions about your booking? Partnership enquiries? Or just want to say hello? We'd love to hear from you.
            </p>
          </div>
          <div className="RR d1" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img
              src="https://unblast.com/wp-content/uploads/2020/09/Contact-Us-Vector-Illustration-Part-02-1.jpg"
              alt="Contact us illustration"
              style={{ width: '100%', maxWidth: 520, objectFit: 'contain', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.35))', mixBlendMode: 'lighten' }}
            />
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section style={{ background: 'var(--w)', padding: '80px 0 96px' }}>
        <div className="contact-body" style={{ maxWidth: 1360, margin: 'auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, alignItems: 'start' }}>

          {/* Left */}
          <div className="RL">
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'var(--k3)', marginBottom:12 }}>Direct Support</div>
              <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '2.8rem', lineHeight: .95, color: 'var(--k)', marginBottom: 16 }}>
                Let's start a<br/>conversation
              </h2>
              <p style={{ fontSize: '.88rem', lineHeight: 1.76, color: 'var(--k3)', fontWeight: 300 }}>
                Our team typically responds within 24 hours. For urgent booking support, use the AI chatbot — available 24/7 in Hindi and English.
              </p>
            </div>
            <div style={{ background: 'var(--k)', borderRadius: 20, padding: '28px 24px', marginBottom:20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <MessageSquare size={20} style={{ color: 'var(--r)' }} />
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.85rem', fontWeight: 700, color: '#fff' }}>Try the AI Chatbot</div>
              </div>
              <p style={{ fontSize: '.8rem', lineHeight: 1.6, color: 'rgba(255,255,255,.45)', fontWeight: 300, marginBottom: 16 }}>
                Get instant answers about museums, bookings, and tickets — available 24/7.
              </p>
              <button className="btn-v4-white" style={{ padding: '9px 20px', fontSize: '.72rem' }}
                onClick={() => window.dispatchEvent(new CustomEvent('musema:open-chatbot'))}>
                Open AI Chat
              </button>
            </div>
            <div className="contact-info-links" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[{n:'24h', l:'Response time'},{n:'24/7', l:'AI chatbot'}].map((s,i) => (
                <div key={i} style={{ background:'var(--c)', border:'1.5px solid var(--bd)', borderRadius:14, padding:'16px 18px' }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.8rem', color:'var(--r)', lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--k3)', marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="RR">
            {status === 'sent' ? (
              <div style={{ background: 'var(--c)', border: '1.5px solid var(--bd)', borderRadius: 24, padding: '56px 40px', textAlign: 'center' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--r)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 15.5 9.5"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '2.5rem', color: 'var(--k)', marginBottom: 12 }}>Message Sent!</h3>
                <p style={{ fontSize: '.88rem', color: 'var(--k3)', fontWeight: 300, marginBottom: 24 }}>We'll get back to you within 24 hours.</p>
                <button className="btn-v4-fill" onClick={() => { setStatus('idle'); setForm({ name:'', email:'', subject:'', message:'' }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <div className="contact-form-card" style={{ background: 'var(--c)', border: '1.5px solid var(--bd)', borderRadius: 24, padding: '40px' }}>
                {status === 'error' && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '.83rem', color: '#dc2626' }}>
                    Something went wrong. Please check your EmailJS config or try again.
                  </div>
                )}

                <div className="contact-form-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {[{ key: 'name', label: 'Your Name', placeholder: 'abc' }, { key: 'email', label: 'Email', placeholder: 'abc@email.com' }].map(f => (
                    <div key={f.key}>
                      <label style={{ fontFamily: "'Syne',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--k3)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                      <input
                        value={(form as any)[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{ width: '100%', border: '1.5px solid var(--bd)', borderRadius: 12, padding: '12px 16px', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem', color: 'var(--k)', background: 'var(--w)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--r)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--bd)')}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: "'Syne',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--k3)', display: 'block', marginBottom: 8 }}>Subject</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Booking support / Partnership / General"
                    style={{ width: '100%', border: '1.5px solid var(--bd)', borderRadius: 12, padding: '12px 16px', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem', color: 'var(--k)', background: 'var(--w)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--r)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--bd)')}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontFamily: "'Syne',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--k3)', display: 'block', marginBottom: 8 }}>Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    style={{ width: '100%', border: '1.5px solid var(--bd)', borderRadius: 12, padding: '12px 16px', fontFamily: "'DM Sans',sans-serif", fontSize: '.85rem', color: 'var(--k)', background: 'var(--w)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color .2s' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--r)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--bd)')}
                  />
                </div>

                <button
                  className="btn-v4-fill"
                  style={{ width: '100%', justifyContent: 'center', opacity: status === 'sending' ? .7 : 1 }}
                  onClick={handleSubmit}
                  disabled={status === 'sending'}
                >
                  {status === 'sending'
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                    : <><Send size={14} /> Send Message</>
                  }
                </button>
              </div>
            )}
          </div>

        </div>
      </section>
    </MainLayout>
  );
}