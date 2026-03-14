import { useState, useEffect } from 'react';
import MainLayout from '../templates/MainLayout';
import { ArrowRight, Calendar, MapPin, X, Clock, Users, Info } from 'lucide-react';

interface Exhibition {
  name: string;
  cat: string;
  date: string;
  venue: string;
  img: string;
  desc: string;
  fullDesc: string;
  highlights: string[];
  curator: string;
  ticketInfo: string;
  timing: string;
}

const EXHIBITIONS_FULL: Exhibition[] = [
  {
    name: 'INDIA ART FAIR 2026',
    cat: 'Art', date: 'Feb 5 — Feb 9, 2026',
    venue: 'NSIC Exhibition Grounds, New Delhi',
    img: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQES6w-3kOq6nhDuD0mmBvKcPHu0CFKsj5F_xGS9SQJwjyWi3Ug',
    desc: 'India\'s premier art fair returns — showcasing modern and contemporary art from across India and the world.',
    fullDesc: 'The India Art Fair is South Asia\'s leading platform for modern and contemporary art. The 2026 edition brings together galleries, artists, collectors, and curators from across India and internationally, with a focused programme of exhibitions, artist talks, live performances, and curated installations. Spanning indoor pavilions and outdoor spaces at the NSIC grounds, the fair features works ranging from established masters to breakthrough emerging artists, with dedicated sections for digital and new-media art.',
    highlights: ['100+ galleries from 20+ countries', 'Live artist performances & installations', 'New media and digital art pavilion', 'Collector talks and acquisition support', 'Public programme free on select days'],
    curator: 'India Art Fair Curatorial Committee',
    ticketInfo: '₹500 General · ₹250 Students · Multi-day passes available',
    timing: '11:00 AM – 7:00 PM, all days',
  },
  {
    name: 'KOCHI-MUZIRIS BIENNALE 2025–26',
    cat: 'Art', date: 'Dec 2025 — Apr 2026',
    venue: 'Fort Kochi, Kerala',
    img: 'https://assets.architecturaldigest.in/photos/692e69380e236d8fda6b0d71/16:9/w_1616,h_909,c_limit/cover%20image%20template%20-%204%20(1).jpg',
    desc: 'Asia\'s largest contemporary art biennale — immersive installations and site-specific works across Fort Kochi.',
    fullDesc: 'The Kochi-Muziris Biennale is India\'s most celebrated and Asia\'s largest contemporary art event, transforming the historic port city of Kochi into a living gallery. The 2025–26 edition features over 90 artists from 40 countries creating site-specific installations in repurposed colonial warehouses, public plazas, and heritage buildings along the Fort Kochi waterfront. With a focus on ecology, migration, and cultural memory, the Biennale brings together painting, sculpture, video, performance, and community-based art practices.',
    highlights: ['90+ international artists across 40+ countries', 'Site-specific works in heritage warehouses', 'Student Biennale running parallel', 'Public access to most venues free of charge', 'Curated residency programme for artists'],
    curator: 'Biennale Foundation, Kochi',
    ticketInfo: 'Most venues free · Ticketed pavilions from ₹100',
    timing: '10:00 AM – 6:00 PM daily',
  },
  {
    name: 'SURAJKUND CRAFTS MELA 2026',
    cat: 'Culture', date: 'Feb 1 — Feb 16, 2026',
    venue: 'Surajkund, Faridabad, Haryana',
    img: 'https://www.stayvista.com/blog/wp-content/uploads/2026/01/Surajkund-International-Craft-Mela-2026-A.jpg',
    desc: 'The world\'s largest crafts fair — celebrating India\'s traditional folk arts, textiles, and living crafts traditions.',
    fullDesc: 'The Surajkund International Crafts Mela is one of the world\'s largest cultural fairs, drawing over 1 million visitors across its 16-day run. The 2026 edition features craftspeople and folk artists from all 28 Indian states alongside artisans from partner countries, showcasing handloom textiles, pottery, woodwork, metalcraft, jewellery, and performance arts. Live demonstrations allow visitors to watch master craftspeople at work, and a dedicated marketplace enables direct purchases from artisans, ensuring fair trade and cultural continuity.',
    highlights: ['1 million+ visitors expected', 'Craftspeople from all 28 Indian states', 'International artisan delegations', 'Live craft demonstrations daily', 'Folk music & dance performances every evening'],
    curator: 'Haryana Tourism & Ministry of Textiles',
    ticketInfo: '₹120 General · ₹60 Children · Weekday discounts available',
    timing: '10:30 AM – 8:30 PM, all days',
  },
  {
    name: 'KALA GHODA ARTS FESTIVAL 2026',
    cat: 'Art', date: 'Feb 7 — Feb 15, 2026',
    venue: 'Kala Ghoda Precinct, Mumbai',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRALOxf0EFiqVtMxO5OIitrdyvzmTMDtCeKhw&s',
    desc: 'Mumbai\'s beloved nine-day multidisciplinary festival — visual arts, installations, music, dance, and cinema.',
    fullDesc: 'The Kala Ghoda Arts Festival is one of Asia\'s largest multidisciplinary cultural festivals, transforming Mumbai\'s heritage arts district into an open-air gallery for nine days each February. The 2026 edition features curated visual art exhibitions, large-scale outdoor installations, live music concerts, classical and contemporary dance performances, film screenings, theatre, and an extensive children\'s programme. Most events are free and open to the public, embodying the festival\'s core belief that art belongs to everyone.',
    highlights: ['500+ events across 9 days', 'Large-scale outdoor sculpture installations', 'Classical & contemporary dance performances', 'International film screenings', 'Free entry to most events'],
    curator: 'Kala Ghoda Association, Mumbai',
    ticketInfo: 'Most events free · Select performances ticketed from ₹200',
    timing: '11:00 AM – 10:00 PM daily',
  },
  {
    name: 'INDIA SCIENCE FESTIVAL 2026',
    cat: 'Science', date: 'Jan 10 — Jan 11, 2026',
    venue: 'IISER Pune, Maharashtra',
    img: 'https://static.wixstatic.com/media/a3e476_4715bc4ae20d4723ad3886da75c927c4~mv2.jpg/v1/fill/w_980,h_844,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/DSC07000_JPG.jpg',
    desc: 'India\'s largest public science festival — interactive exhibits, talks from leading scientists, and hands-on experiments.',
    fullDesc: 'The India Science Festival brings together India\'s finest scientists, researchers, communicators, and curious minds for an electrifying two-day celebration of science. The 2026 edition at IISER Pune features interactive exhibits spanning physics, biology, astronomy, AI, and climate science, alongside talks by Nobel laureates, ISRO scientists, and pioneering researchers. A dedicated innovation fair showcases student-led startups and school science projects, making science accessible and thrilling for audiences of all ages.',
    highlights: ['100+ interactive science exhibits', 'Talks by Nobel laureates & ISRO scientists', 'AI & robotics demonstration zone', 'Student innovation fair', 'Astronomy night-sky observation sessions'],
    curator: 'India Science Festival Foundation',
    ticketInfo: '₹200 General · ₹100 Students · Free for school groups (pre-registered)',
    timing: '9:00 AM – 7:00 PM, both days',
  },
  {
    name: 'NE SCIENCE & INNOVATION FAIR 2026',
    cat: 'Science', date: 'Jan 15 — Jan 20, 2026',
    venue: 'National Science Centre, Guwahati, Assam',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    desc: 'North East India\'s flagship science showcase — AI, robotics, space technology, and student innovation.',
    fullDesc: 'The North East Science Fair & Innovation Festival spotlights the extraordinary scientific talent emerging from India\'s northeastern states. The 2026 edition at the National Science Centre Guwahati features cutting-edge demonstrations in artificial intelligence, robotics, drone technology, and space exploration, alongside competitions for student innovators from Assam, Meghalaya, Manipur, Nagaland, and beyond. Special sessions on indigenous knowledge systems and biodiversity of the Northeast bring a unique regional perspective to the national science conversation.',
    highlights: ['AI & robotics live demonstrations', 'Student innovation competition with prizes', 'Space technology showcase with ISRO models', 'Indigenous knowledge systems panel', 'Biodiversity of Northeast India exhibition'],
    curator: 'National Science Centre, Guwahati',
    ticketInfo: '₹50 General · Free for students with ID',
    timing: '9:30 AM – 6:00 PM daily',
  },
  {
    name: 'BHARAT TEX 2026',
    cat: 'Culture', date: 'Jul 14 — Jul 17, 2026',
    venue: 'Bharat Mandapam, New Delhi',
    img: 'https://bharat-tex.com/wp-content/uploads/2026/02/%F0%9D%97%A6%F0%9D%97%BD%F0%9D%97%BF%F0%9D%97%B6%F0%9D%97%BB%F0%9D%97%B4-%F0%9D%97%99%F0%9D%97%AE%F0%9D%97%B6%F0%9D%97%BF-%F0%9D%97%95%F0%9D%97%B6%F0%9D%97%BF%F0%9D%97%BA%F0%9D%97%B6%F0%9D%97%BB%F0%9D%97%B4%F0%9D%97%B5%F0%9D%97%AE%F0%9D%97%BA-with-eye-catching-promotion-of-%F0%9D%97%95%F0%9D%97%B5%F0%9D%97%AE%F0%9D%97%BF%F0%9D%97%AE%F0%9D%98%81-%F0%9D%97%A7%F0%9D%97%B2%F0%9D%98%85-%F0%9D%9F%AE%F0%9D%9F%AC%F0%9D%9F%AE%F0%9D%9F%B2.jpg',
    desc: 'India\'s mega textile event — celebrating the full spectrum of India\'s textile heritage and modern innovation.',
    fullDesc: 'Bharat Tex is India\'s most comprehensive textile showcase, bringing together the entire value chain from raw fibre to finished fashion under one roof. The 2026 edition at Bharat Mandapam features over 3,000 exhibitors spanning handloom cooperatives, power-loom manufacturers, technical textiles, fashion designers, and sustainable fabric innovators. A dedicated Heritage Pavilion presents living textile traditions — Banarasi silk, Kanjeevaram, Pashmina, Chanderi, and more — alongside a Future Fabrics zone exploring AI-designed textiles and bio-materials.',
    highlights: ['3,000+ exhibitors from across India', 'Heritage Pavilion with 20+ textile traditions', 'Future Fabrics & sustainable textiles zone', 'Live handloom weaving demonstrations', 'International buyer meet and B2B sessions'],
    curator: 'Ministry of Textiles, Government of India',
    ticketInfo: '₹300 General · Trade visitors by registration',
    timing: '10:00 AM – 7:00 PM daily',
  },
  {
    name: 'INDIA STONEMART 2026',
    cat: 'Archaeological', date: 'Feb 2 — Feb 5, 2026',
    venue: 'JECC, Jaipur, Rajasthan',
    img: 'https://i.ytimg.com/vi/M_ZenfImvbw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAD57YstBYI149XoEpIpRJ2X2DD4g',
    desc: 'The 13th edition of Asia\'s premier stone industry exhibition — architecture, sculpture, and heritage stonecraft.',
    fullDesc: 'India Stonemart is Asia\'s largest stone industry event and one of the world\'s top three stone trade fairs. The 13th edition in Jaipur — India\'s marble and sandstone capital — brings together quarry owners, processors, architects, sculptors, and heritage conservationists from 50+ countries. Beyond trade, Stonemart\'s cultural programme celebrates India\'s extraordinary tradition of stone architecture, featuring live sculpting demonstrations by master craftspeople, a heritage conservation forum, and an exhibition tracing India\'s stone monuments from Ashoka\'s pillars to Mughal monuments.',
    highlights: ['2,000+ exhibitors from 50+ countries', 'Live stone sculpting by master craftspeople', 'Heritage conservation forum', 'India\'s stone monument history exhibition', 'Architecture & design awards ceremony'],
    curator: 'Federation of Indian Granite & Stone Industry (FIGSI)',
    ticketInfo: '₹200 General · Trade registration free',
    timing: '10:00 AM – 6:00 PM daily',
  },
];

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  History:        { bg: '#FDE8DF', color: '#C85A2A' },
  Art:            { bg: '#EDF4FF', color: '#3B6FD4' },
  Culture:        { bg: '#F3F0FF', color: '#6B3FA0' },
  Science:        { bg: '#E8F8FF', color: '#0277BD' },
  Tribal:         { bg: '#F0FFF4', color: '#2E7D32' },
  Archaeological: { bg: '#FFF8E8', color: '#B8860B' },
};

// ── Exhibition Modal ────────────────────────────────────────────────────────
function ExhibitionModal({ ex, onClose }: { ex: Exhibition; onClose: () => void }) {
  const c = CAT_COLORS[ex.cat] ?? { bg: 'var(--c2)', color: 'var(--k3)' };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(24,21,15,0.76)', backdropFilter: 'blur(7px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        animation: 'exFadeIn .25s ease',
      }}
    >
      <style>{`
        @keyframes exFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes exSlideUp { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:none} }
        .exscroll::-webkit-scrollbar{width:4px}
        .exscroll::-webkit-scrollbar-track{background:transparent}
        .exscroll::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--w)', borderRadius: 28,
          width: '100%', maxWidth: 860, maxHeight: '88vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 48px 120px rgba(24,21,15,.4)',
          animation: 'exSlideUp .35s cubic-bezier(.16,1,.3,1)',
        }}
      >
        {/* Header image */}
        <div style={{ position: 'relative', height: 220, flexShrink: 0, overflow: 'hidden' }}>
          <img src={ex.img} alt={ex.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,21,15,.8) 0%, transparent 50%)' }} />
          <button onClick={onClose}
            style={{ position:'absolute', top:16, right:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={16} color="var(--k)" />
          </button>
          <div style={{ position:'absolute', top:16, left:20 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', background:c.bg, color:c.color, padding:'4px 11px', borderRadius:100 }}>{ex.cat}</span>
          </div>
          <div style={{ position:'absolute', bottom:18, left:20, right:60 }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(1.5rem,3vw,2.2rem)', color:'#fff', lineHeight:1, letterSpacing:'.03em', marginBottom:6 }}>{ex.name}</div>
            <div style={{ display:'flex', gap:16 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.75rem', color:'rgba(255,255,255,.72)' }}>
                <Calendar size={12} /> {ex.date}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.75rem', color:'rgba(255,255,255,.72)' }}>
                <MapPin size={12} /> {ex.venue}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="exscroll" style={{ overflowY: 'auto', flex: 1, padding: '28px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {/* Left */}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', marginBottom:10 }}>About the Exhibition</div>
              <p style={{ fontSize:'.88rem', lineHeight:1.8, color:'var(--k3)', fontWeight:300, marginBottom:24 }}>{ex.fullDesc}</p>

              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                <Users size={11} style={{ color:'var(--r)' }} /> Curator
              </div>
              <div style={{ fontSize:'.85rem', color:'var(--k)', fontWeight:500, marginBottom:24 }}>{ex.curator}</div>
            </div>

            {/* Right */}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <Info size={11} style={{ color:'var(--r)' }} /> Exhibition Highlights
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
                {ex.highlights.map((h, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', background:'var(--c)', borderRadius:10, border:'1px solid var(--bd)' }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ marginTop: 4, flexShrink: 0 }}>
                      <circle cx="4" cy="4" r="4" fill="var(--r)" />
                    </svg>
                    <span style={{ fontSize:'.82rem', color:'var(--k3)', lineHeight:1.5 }}>{h}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                <Clock size={11} style={{ color:'var(--r)' }} /> Visiting Info
              </div>
              <div style={{ background:'var(--c)', border:'1.5px solid var(--bd)', borderRadius:14, padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <Clock size={13} style={{ color:'var(--r)', marginTop:1, flexShrink:0 }} />
                  <div style={{ fontSize:'.82rem', color:'var(--k3)' }}>{ex.timing}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--r)" strokeWidth="2" style={{ marginTop:1, flexShrink:0 }}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <div style={{ fontSize:'.82rem', color:'var(--k3)' }}>{ex.ticketInfo}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <MapPin size={13} style={{ color:'var(--r)', marginTop:1, flexShrink:0 }} />
                  <div style={{ fontSize:'.82rem', color:'var(--k3)' }}>{ex.venue}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'18px 32px', borderTop:'1.5px solid var(--bd)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--w)', flexShrink:0 }}>
          <div style={{ fontSize:'.8rem', color:'var(--k3)' }}>
            <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.1rem', color:'var(--k)' }}>{ex.date}</span>
            &nbsp;&nbsp;·&nbsp;&nbsp;{ex.venue}
          </div>
          <div style={{ display:'flex', gap:9 }}>
            <button onClick={onClose}
              style={{ background:'transparent', border:'1.5px solid var(--bd)', borderRadius:100, padding:'9px 20px', fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--k3)', cursor:'pointer' }}>
              Close
            </button>
            <button
              style={{ background:'var(--k)', border:'none', borderRadius:100, padding:'9px 24px', fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:7, transition:'background .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--r)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--k)')}
            >
              Plan Visit <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Exhibitions() {
  const [selected, setSelected] = useState<Exhibition | null>(null);

  return (
    <MainLayout>
      <style>{`
        @media(max-width:768px) {
          .exh-page-hero { min-height: auto !important; }
          .exh-page-hero-inner { grid-template-columns: 1fr !important; gap: 28px !important; padding: 64px 16px 40px !important; }
          .exh-page-hero-inner h1 { font-size: clamp(2.8rem,10vw,5rem) !important; margin-bottom: 18px !important; }
          .exh-page-hero-right { display: none !important; }
          .exh-page-list-wrap { padding: 32px 16px 60px !important; }
          .exh-page-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .exh-page-card { grid-template-columns: 1fr !important; border-radius: 16px !important; }
          .exh-page-card > div:first-child { min-height: 180px !important; height: 180px !important; }
          .exh-modal-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .exh-modal-inner { border-radius: 20px 20px 0 0 !important; max-height: 88vh !important; margin: auto 0 0 !important; overflow-y: auto !important; }
          .exh-modal-overlay { align-items: flex-end !important; }
        }
        @media(max-width:480px) {
          .exh-page-hero-inner { padding: 52px 12px 32px !important; }
          .exh-page-hero-inner h1 { font-size: clamp(2.2rem,9vw,3.5rem) !important; }
        }
      `}</style>
      {/* Hero */}
      <section className="exh-page-hero" style={{ background:'var(--w)', minHeight:'68vh', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', borderBottom:'1.5px solid var(--bd)' }}>
        <div className="exh-page-hero-inner" style={{ maxWidth:1360, margin:'auto', padding:'80px 40px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', position:'relative', zIndex:1 }}>

          {/* LEFT: text */}
          <div className="R">
      
            <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(4.5rem,8vw,7.5rem)', lineHeight:.88, color:'var(--k)', margin:'0 0 28px' }}>
              Upcoming<br/><span style={{ color:'var(--r)' }}>Exhibitions</span>
            </h1>
            <p style={{ fontSize:'.95rem', lineHeight:1.76, color:'var(--k3)', fontWeight:300, marginBottom:36, maxWidth:400 }}>
              World-class cultural experiences across India's finest institutions — curated for history lovers, art enthusiasts, and curious minds.
            </p>
            <div style={{ display:'flex', gap:0 }}>
              {['8 Exhibitions','7 Cities','All India'].map((s, i) => (
                <div key={s} style={{ paddingRight:24, marginRight:24, borderRight: i<2 ? '1.5px solid var(--bd)' : 'none' }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.6rem', color:'var(--k)', lineHeight:1 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: stacked exhibition previews */}
          <div className="RR d1" style={{ position:'relative', height:460 }}>
            {/* Main image */}
            <div style={{ position:'absolute', top:0, right:0, width:'76%', height:'64%', borderRadius:20, overflow:'hidden', boxShadow:'0 24px 64px rgba(24,21,15,.14)', border:'1.5px solid var(--bd)' }}>
              <img src="https://thecsruniverse.com/adminxsafe/uploads/Interglobe%20News%20Item.JPG" alt="Exhibition" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(24,21,15,.5) 0%, transparent 55%)' }} />

            </div>
            {/* Secondary image bottom-left */}
            <div style={{ position:'absolute', bottom:0, left:0, width:'50%', height:'50%', borderRadius:16, overflow:'hidden', boxShadow:'0 20px 50px rgba(24,21,15,.12)', border:'1.5px solid var(--bd)' }}>
              <img src="https://www.tribuneindia.com/sortd-service/imaginary/v22-01/jpg/large/high?url=dGhldHJpYnVuZS1zb3J0ZC1wcm8tcHJvZC1zb3J0ZC9tZWRpYTNlYzU1MWUwLTBhOTEtMTFmMC05YTQ0LTIxMTA4MTFlOTA5YS5qcGc=" alt="Textiles" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'rgba(24,21,15,.2)' }} />
            </div>
       
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ background:'var(--c)', padding:'80px 0 96px' }}>
        <div className="exh-page-list-wrap" style={{ maxWidth:1360, margin:'auto', padding:'0 40px' }}>
          <div className="exh-page-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {EXHIBITIONS_FULL.map((ex, i) => {
              const c = CAT_COLORS[ex.cat] ?? { bg:'var(--c2)', color:'var(--k3)' };
              return (
                <div key={i} className="R exh-page-card" style={{
                  transitionDelay:`${i*55}ms`,
                  background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:24,
                  overflow:'hidden', display:'grid', gridTemplateColumns:'180px 1fr',
                  transition:'transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s',
                  cursor:'pointer',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 16px 48px rgba(24,21,15,.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow=''; }}
                >
                  <div style={{ minHeight:200, overflow:'hidden' }}>
                    <img src={ex.img} alt={ex.name}
                      style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .6s cubic-bezier(.16,1,.3,1)' }}
                      onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.06)')}
                      onMouseLeave={e=>(e.currentTarget.style.transform='')}
                    />
                  </div>
                  <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:8 }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.58rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', background:c.bg, color:c.color, padding:'3px 9px', borderRadius:100, alignSelf:'flex-start' }}>
                      {ex.cat}
                    </span>
                    <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.4rem', color:'var(--k)', lineHeight:1.05, letterSpacing:'.03em' }}>{ex.name}</div>
                    <p style={{ fontSize:'.78rem', lineHeight:1.58, color:'var(--k3)', fontWeight:300, flex:1, margin:0 }}>{ex.desc}</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.72rem', color:'var(--k3)' }}>
                        <Calendar size={11} style={{ color:'var(--r)' }} />{ex.date}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.72rem', color:'var(--k3)' }}>
                        <MapPin size={11} style={{ color:'var(--r)' }} />{ex.venue}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(ex)}
                      style={{
                        alignSelf:'flex-start', display:'inline-flex', alignItems:'center', gap:6,
                        background:'var(--k)', border:'none', borderRadius:100,
                        padding:'7px 16px', marginTop:2,
                        fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700,
                        letterSpacing:'.06em', textTransform:'uppercase',
                        color:'#fff', cursor:'pointer', transition:'background .2s',
                      }}
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--r)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='var(--k)')}
                    >
                      Learn More <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selected && <ExhibitionModal ex={selected} onClose={() => setSelected(null)} />}
    </MainLayout>
  );
}