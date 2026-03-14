import MainLayout from '../templates/MainLayout';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const VALUES = [
  { icon: 'museum',   title: 'Access for All',     desc: 'We believe every Indian should be able to discover, learn from, and visit any of the country\'s 700+ museums — regardless of location or language.' },
  { icon: 'bot',      title: 'AI, Thoughtfully',   desc: 'Our AI doesn\'t replace the museum experience — it amplifies it. From mood-based recommendations to voice-guided booking, every feature has a purpose.' },
  { icon: 'compass',  title: 'Cultural Pride',     desc: 'India\'s museums hold millennia of civilisation. We\'re dedicated to making that heritage visible, accessible, and celebrated.' },
  { icon: 'zap',      title: 'Zero Friction',      desc: 'No long forms, no confusing flows. Book a ticket in under 2 minutes with our 8-step conversational AI — or scan a QR at the gate.' },
];

const ValIcon = ({ icon }: { icon: string }) => {
  const s = { width:24, height:24, stroke:'var(--r)', strokeWidth:2, fill:'none', strokeLinecap:'round' as const, strokeLinejoin:'round' as const };
  if (icon === 'museum') return <svg {...s} viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>;
  if (icon === 'bot') return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
  if (icon === 'compass') return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  return <svg {...s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
};

export default function About() {
  const navigate = useNavigate();
  return (
    <MainLayout>
      <style>{`
        @media(max-width:768px) {
          .about-hero-sec { min-height: auto !important; padding: 80px 0 48px !important; }
          .about-hero-inner { grid-template-columns: 1fr !important; gap: 32px !important; padding: 0 16px !important; }
          .about-hero-inner h1 { font-size: clamp(2.2rem,9vw,3.5rem) !important; }
          .about-hero-right { display: none !important; }
          .about-mission { padding: 56px 16px !important; }
          .about-mission-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .about-mission-img { aspect-ratio: 16/9 !important; border-radius: 16px !important; }
          .about-values { padding: 56px 16px !important; }
          .about-values-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .about-values-grid > div { padding: 18px 14px !important; }
          .about-team-grid { grid-template-columns: repeat(2,1fr) !important; gap: 14px !important; }
          .about-stats-strip { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .about-cta { padding: 56px 16px !important; }
        }
        @media(max-width:480px) {
          .about-values-grid { grid-template-columns: 1fr !important; }
          .about-team-grid { grid-template-columns: 1fr !important; }
          .about-stats-strip { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      {/* ── HERO ── */}
      <section className="about-hero-sec" style={{ background: 'var(--k)', minHeight: '72vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* noise */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
        {/* glow */}
        <div style={{ position:'absolute', bottom:'-20%', left:'-5%', width:'50%', height:'130%', background:'radial-gradient(ellipse, rgba(180,70,30,.15) 0%, transparent 68%)', pointerEvents:'none' }} />

        <div className="about-hero-inner" style={{ maxWidth: 1360, margin: 'auto', padding: '80px 40px', position: 'relative', zIndex: 1, width: '100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

          {/* LEFT */}
          <div className="R">
            <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(4rem,7vw,7.5rem)', lineHeight: .88, color: '#fff', margin: '0 0 28px' }}>
              Built for<br /><span style={{ color: 'var(--r)' }}>India's</span><br />Curiosity
            </h1>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'.9rem', lineHeight:1.76, color:'rgba(255,255,255,.45)', fontWeight:300, maxWidth:380 }}>
              We started with a question: why does India have 700+ museums but millions have never visited one? Musema is the answer.
            </p>
          </div>

          {/* RIGHT: image mosaic */}
          <div className="RR d1" style={{ position:'relative', height:480 }}>
            {/* tall left image */}
            <div style={{ position:'absolute', top:0, left:0, width:'46%', height:'100%', borderRadius:18, overflow:'hidden', boxShadow:'0 28px 72px rgba(0,0,0,.5)' }}>
              <img src="https://anotherglobaleater.wordpress.com/wp-content/uploads/2024/10/img20240822143124.jpg?w=480" alt="About" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(24,21,15,.5))' }} />
            </div>
            {/* top-right */}
            <div style={{ position:'absolute', top:0, right:0, width:'50%', height:'47%', borderRadius:18, overflow:'hidden', boxShadow:'0 20px 56px rgba(0,0,0,.45)', border:'2px solid rgba(255,255,255,.06)' }}>
              <img src="https://images.unsplash.com/photo-1558431382-9b06d0507edc" alt="Museum hall" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            {/* bottom-right */}
            <div style={{ position:'absolute', bottom:0, right:0, width:'50%', height:'47%', borderRadius:18, overflow:'hidden', boxShadow:'0 20px 56px rgba(0,0,0,.45)', border:'2px solid rgba(255,255,255,.06)' }}>
              <img src="https://www.hyderabadtourism.travel/images/v3/1440x960/salarjung-museum-1440x960.jpg" alt="Science" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
   
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ background: 'var(--w)', padding: '96px 0' }}>
        <div className="about-mission-grid" style={{ maxWidth: 1360, margin: 'auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div className="RL">
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.68rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--k3)', marginBottom: 16 }}>Our Mission</div>
            <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(3rem,5vw,4.5rem)', lineHeight: .95, color: 'var(--k)', marginBottom: 24 }}>
              Making India's <em style={{ color: 'var(--r)', fontStyle: 'normal' }}>heritage</em> a click away
            </h2>
            <p style={{ fontSize: '.95rem', lineHeight: 1.8, color: 'var(--k3)', fontWeight: 300, marginBottom: 20 }}>
              Musema was founded on a simple belief: India has one of the world's richest museum ecosystems — spanning tribal art to space science, medieval manuscripts to revolutionary railways — and yet millions of Indians have never visited one.
            </p>
            <p style={{ fontSize: '.95rem', lineHeight: 1.8, color: 'var(--k3)', fontWeight: 300, marginBottom: 32 }}>
              We built Musema to fix that. Combining real-time AI, voice technology, and frictionless ticketing, we make museum discovery as easy as a conversation.
            </p>
            <button className="btn-v4-fill" onClick={() => navigate('/museums')}>
              Explore Museums <ArrowRight size={14} />
            </button>
          </div>
          <div className="RR" style={{ position:'relative', height:440 }}>
            {/* Main museum photo */}
            <div style={{ position:'absolute', inset:0, borderRadius:24, overflow:'hidden', boxShadow:'0 24px 64px rgba(24,21,15,.12)', border:'1.5px solid var(--bd)' }}>
              <img src="https://images.unsplash.com/photo-1564507592333-c60657eea523" alt="Mission" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(24,21,15,.72) 0%, transparent 55%)' }} />
            </div>
            {/* Stats overlay bottom */}
            <div style={{ position:'absolute', bottom:20, left:20, right:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, zIndex:2 }}>
              {[{ n: '700+', l: 'Museums' }, { n: '28', l: 'States' }, { n: '12K+', l: 'Bookings' }, { n: '4.9★', l: 'Rating' }].map((s, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,.1)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,.15)', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color: i===0||i===3 ? 'var(--r)' : '#fff', lineHeight:1, marginBottom:2 }}>{s.n}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.5)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: 'var(--c)', padding: '96px 0' }}>
        <div style={{ maxWidth: 1360, margin: 'auto', padding: '0 40px' }}>
          <div className="R" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.68rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--k3)', marginBottom: 12 }}>What We Stand For</div>
            <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(3rem,5vw,4.5rem)', lineHeight: .95, color: 'var(--k)' }}>Our Values</h2>
          </div>
          <div className="about-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {VALUES.map((v, i) => (
              <div key={i} className="R" style={{ transitionDelay: `${i * 80}ms`, background: 'var(--w)', border: '1.5px solid var(--bd)', borderRadius: 22, padding: '32px 28px' }}>
                <div style={{ marginBottom: 16 }}><ValIcon icon={v.icon} /></div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--k)', marginBottom: 12 }}>{v.title}</div>
                <p style={{ fontSize: '.83rem', lineHeight: 1.68, color: 'var(--k3)', fontWeight: 300 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </MainLayout>
  );
}