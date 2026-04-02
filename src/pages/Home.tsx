import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, MessageSquare } from 'lucide-react';
import MainLayout from '../templates/MainLayout';
import chatbotImg from '../assets/chatbot.png';

const fromUnsplash = (url: string, w = 800) =>
  url.startsWith('https://images.unsplash.com') ? `${url}?w=${w}&q=80&fit=crop` : url;

const PHOTOS = {

  // ── HERO FILMSTRIP ──────────────────────────────────────────────────────
  hero_main:    'https://images.unsplash.com/photo-1558431382-9b06d0507edc', // Victoria Memorial, Kolkata
  hero_midTop:  'https://images.unsplash.com/photo-1564507592333-c60657eea523', // National Museum, New Delhi
  hero_midBot:  'https://images.unsplash.com/photo-1660973424270-28a766e577bd', // Albert Hall, Jaipur
  hero_right:   'https://images.unsplash.com/photo-1664863988713-aaa4219e3064', // CSMVS, Mumbai

  // ── TOP DESTINATIONS — All India ────────────────────────────────────────
  dest_nationalMuseum: 'https://images.unsplash.com/photo-1688406265997-77897c1a31d1',
  dest_csmvs:          'https://images.unsplash.com/photo-1664863988713-aaa4219e3064',
  dest_victoria:       'https://images.unsplash.com/photo-1558431382-9b06d0507edc',
  dest_salarJung:      'https://www.hyderabadtourism.travel/images/v3/1440x960/salarjung-museum-1440x960.jpg',
  dest_vitm:           'https://d34vm3j4h7f97z.cloudfront.net/original/4X/9/6/a/96a18cc48336cc146a052634208f1ba57525205b.jpeg',
  dest_napier:         'https://images.unsplash.com/photo-1672072960021-3de80380361c',

  // ── TOP DESTINATIONS — Delhi ────────────────────────────────────────────
  dest_d_national:   'https://images.unsplash.com/photo-1688406265997-77897c1a31d1',
  dest_d_rail:       'https://images.unsplash.com/photo-1474487548417-781cb71495f3',
  dest_d_gandhi:     'https://res.cloudinary.com/tourhq/image/upload/fl_progressive,f_auto,h_507,w_900,g_auto,c_fill,q_auto/hkdmqk6qizkwfn6yqspd',
  dest_d_crafts:     'https://delhitourism.travel/images/places-to-visit/headers/national-craft-museum-and-hastkala-academy-delhi-header-delhi-tourism.jpg.jpg',
  dest_d_indira:     'https://res.cloudinary.com/purnesh/image/upload/f_auto/v1486551044/indira-header.jpg',
  dest_d_natHistory: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Smithsonian-Museum_of_Natural_History_%28cropped%29.jpg',

  // ── TOP DESTINATIONS — Rajasthan ────────────────────────────────────────
  dest_r_albert:    'https://images.unsplash.com/photo-1599661046289-e31897846e41',
  dest_r_cityPalace:'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2019/08/Feature-Image-city-place.jpg',
  dest_r_shilpgram: 'https://www.kalyantoursudaipur.com/blog/wp-content/uploads/2023/12/Udaipurs-Cultural-Hub-for-Traditional-Arts-Crafts-and-Folk-Heritage.webp',
  dest_r_hawamahal: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
  dest_r_ajmer:     'https://anotherglobaleater.wordpress.com/wp-content/uploads/2024/10/img20240822143124.jpg?w=480',
  dest_r_bikaner:   'https://live.staticflickr.com/7380/10888032224_22a2226d01_b.jpg',

  // ── TOP DESTINATIONS — West Bengal ─────────────────────────────────────
  dest_wb_victoria:  'https://images.unsplash.com/photo-1558431382-9b06d0507edc',
  dest_wb_indianMus: 'https://images.unsplash.com/photo-1751214608311-c1e01351426c',
  dest_wb_birla:     'https://assets.telegraphindia.com/telegraph/2021/Dec/1640198045_floating-tap1.jpg',
  dest_wb_marble:    'https://kolkatatourism.travel/images//tourist-places/marble-palace-mansion-kolkata/marble-palace-mansion-kolkata-tourism-location-address.jpg',
  dest_wb_science:   'https://lh3.googleusercontent.com/ifGcQ_81fYYPoJOivyTJbNjK7ptBwV7cGu_y9CpXfM5J6_8h0LF9XznCZNtF8kgtuXzjVDZb12Jx3QLndAHlNCJj09OxyOmJTg=s1200',
  dest_wb_tagore:    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi8mDJgtwLxTqmWj6XzddvVJRp7MzXS8RhV-IJ0BW0KXfdPNndpnf-r9XHVwfNaZQg18HdOWj72Dq4sxk3FJUDkZV6d4C09zHFCllY5ar1D4hyphenhyphennoVT736w_LuP0vywZT3hXinhCnHqzPaOPva6BcxqPC-92Zvi9NAQIN0GVSxQ1TA_egZLswArRBLiPjIM/s1280/tagore.jpg',

  // ── TOP DESTINATIONS — Maharashtra ─────────────────────────────────────
  dest_m_csmvs:     'https://images.unsplash.com/photo-1664863988713-aaa4219e3064',
  dest_m_nehruSci:  'https://nehrusciencecentre.gov.in/hindi/wp-content/uploads/2022/03/Brain-and-Senses-Exhibit.jpg',
  dest_m_bhauDaji:  'https://images.livemint.com/rf/Image-621x414/LiveMint/Period2/2018/01/20/Photos/Processed/bhaujimuseum-kL6C--621x414@LiveMint.jpg',
  dest_m_kelkar:    'https://d34vm3j4h7f97z.cloudfront.net/original/4X/b/0/2/b024bc3481d5553af5d40cd44f9287e43a4f4b71.png',
  dest_m_war:       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQBrp09Ps5vf7E0IpPlbO0IPSXIfii94f6Tw&s',
  dest_m_partition: 'https://cultureandheritage.org/wp-content/uploads/2022/09/1-1-1200x675.webp',

  // ── ARC STRIP ───────────────────────────────────────────────────────────
  arc_1: 'https://images.unsplash.com/photo-1564507592333-c60657eea523', // National Museum
  arc_2: 'https://images.unsplash.com/photo-1558431382-9b06d0507edc',    // Victoria Memorial
  arc_3: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', // Albert Hall
  arc_4: 'https://www.hyderabadtourism.travel/images/v3/1440x960/salarjung-museum-1440x960.jpg',
  arc_5: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66', // CSMVS
  arc_6: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh9Pi_XuMJReyTSL3WVXTLznYJBh5ZJ7x0hA&s',
  arc_7: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1', // Napier
  arc_8: 'https://anotherglobaleater.wordpress.com/wp-content/uploads/2024/10/img20240822143124.jpg?w=480',

  // ── PROCESS STEPS ───────────────────────────────────────────────────────
  proc_1: 'https://www.contentgrip.com/content/images/size/w2000/2025/03/Best-AI-Chatbots-in-2025---find-the-right-AI-chatbot-for-your-business.webp',
  proc_2: 'https://images.unsplash.com/photo-1564507592333-c60657eea523', // National Museum
  proc_3: 'https://beyonk.com/wp-content/uploads/2025/03/selfserve-museums-1.png',
  proc_4: 'https://media-cdn.tripadvisor.com/media/photo-s/14/b9/a4/2b/ticket-of-indian-museum.jpg',

  // ── ABOUT ───────────────────────────────────────────────────────────────
  about: 'https://images.unsplash.com/photo-1719640690300-1079b566e4a7',
};


// ── REAL 2026 UPCOMING EXHIBITIONS ─────────────────────────────────────────
const EXHIBITIONS = [
  { name: 'INDIA ART FAIR 2026',              cat: 'Art',     date: 'Feb 5 — Feb 9, 2026'    },
  { name: 'KOCHI-MUZIRIS BIENNALE 2025–26',   cat: 'Art',     date: 'Dec 2025 — Apr 2026'     },
  { name: 'SURAJKUND CRAFTS MELA 2026',       cat: 'Culture', date: 'Feb 1 — Feb 16, 2026'    },
  { name: 'KALA GHODA ARTS FESTIVAL 2026',    cat: 'Art',     date: 'Feb 7 — Feb 15, 2026'    },
  { name: 'INDIA SCIENCE FESTIVAL 2026',      cat: 'Science', date: 'Jan 10 — Jan 11, 2026'   },
];

const TESTIMONIALS = [
  { stars:5, quote:`"Musema's AI chatbot planned my entire Delhi museum day in minutes. Booked 3 museums, QR tickets worked perfectly at every gate."`, name:'Priya Sharma', loc:'New Delhi', role:'School Teacher', av:'https://randomuser.me/api/portraits/women/12.jpg' },
  { stars:5, quote:`"The voice assistant booked Victoria Memorial for our whole family. The emotion AI suggested the kids galleries first. Incredible!"`,  name:'Arjun Reddy',  loc:'Bengaluru', role:'Software Engineer', av:'https://randomuser.me/api/portraits/men/65.jpg' },
  { stars:4, quote:`"Found museums I never knew existed in Hyderabad. The AI described each exhibit before I arrived. Felt like a local historian in Salar Jung!"`, name:'Kavya Menon', loc:'Hyderabad', role:'Architect', av:'https://randomuser.me/api/portraits/women/12.jpg' },
  { stars:5, quote:`"Booking Albert Hall in Jaipur took under 2 minutes. The QR ticket just worked, no queues. Absolutely seamless experience."`, name:'Rohan Gupta', loc:'Jaipur', role:'Travel Blogger', av:'https://randomuser.me/api/portraits/men/76.jpg' },
  { stars:5, quote:`"The emotion AI recommended science museums for my curious 8-year-old. She had the best day. We are already planning our next trip!"`, name:'Sneha Iyer', loc:'Chennai', role:'Parent', av:'https://randomuser.me/api/portraits/women/22.jpg' },
  { stars:5, quote:`"Used the Hindi voice mode for my parents. They were amazed, booked CSMVS tickets by just talking. This is the future of travel."`, name:'Vikram Nair', loc:'Mumbai', role:'Product Manager', av:'https://randomuser.me/api/portraits/men/11.jpg' },
];
const FAN_PHOTOS = [
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/45.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/22.jpg',
  'https://randomuser.me/api/portraits/men/76.jpg',
  'https://randomuser.me/api/portraits/women/54.jpg',
  'https://randomuser.me/api/portraits/men/81.jpg',
];

const PROC_STEPS = [
  { title:'Discover & Chat with AI',    desc:'Tell our AI what you love — history, art, science. It fetches live Wikipedia context and recommends the perfect museums for your taste and mood.' },
  { title:'Choose Your Museum',          desc:'Browse AI-curated suggestions with real photos, ratings and pricing. Use voice mode to navigate hands-free.' },
  { title:'Book in 8 Chat Steps',        desc:'Conversational booking — date, time, tickets, visitor details. No forms, no friction. Under 2 minutes to confirm.' },
  { title:'Receive QR Ticket & Explore', desc:'Instant QR ticket to your dashboard. Scan at the museum gate, walk in. Track all visits and rebook favourites.' },
];

const FEATURES = [
  { cls:'fcard-v4-rust',  icon:'bot',   name:'AI Chatbot Guide',   desc:'Powered by Groq + Wikipedia. Ask anything — exhibits, prices, timings, hidden gems. Available 24/7.' },
  { cls:'fcard-v4-dark', icon:'mic',   name:'Voice Assistant',    desc:'Talk in Hindi or English. Push-to-talk or continuous mode. Hands-free museum booking.' },
  { cls:'fcard-v4-dark',  icon:'brain', name:'Emotion AI',          desc:'Reads your mood from conversation and personalises museum picks — historic, adventurous, scientific, family.' },
  { cls:'fcard-v4-rust',  icon:'qr',    name:'Instant QR Tickets', desc:'Book via chat. QR ticket delivered to your dashboard instantly. Scan at the gate — no printing needed.' },
];

const FeatureIcon = ({ icon, cls }: { icon: string; cls: string }) => {
  const c = cls === 'fcard-v4-cream' ? 'var(--k)' : '#fff';
  if (icon === 'bot') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
    </svg>
  );
  if (icon === 'mic') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
  if (icon === 'brain') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.79A3 3 0 0 1 2 11a3 3 0 0 1 2-2.83V8a3 3 0 0 1 3-3 2.5 2.5 0 0 1 2.5-3z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.79A3 3 0 0 0 22 11a3 3 0 0 0-2-2.83V8a3 3 0 0 0-3-3 2.5 2.5 0 0 0-2.5-3z"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      <rect x="4" y="4" width="5" height="5" fill={c} stroke="none"/><rect x="15" y="4" width="5" height="5" fill={c} stroke="none"/><rect x="4" y="15" width="5" height="5" fill={c} stroke="none"/>
      <path d="M14 14h3v3h-3z"/><path d="M17 17h3v3h-3z"/><path d="M14 17h1"/><path d="M17 14h1"/>
    </svg>
  );
};

const FAN_POS: [number,number,number,number][] = [
  [-455,225,-52,86],[-330,155,-40,96],[-210,100,-27,106],[-100,60,-14,118],
  [0,40,0,130],[100,60,14,118],[210,100,27,106],[330,155,40,96],[455,225,52,86],
];

const MARQUEE_BIG   = ['700+ MUSEUMS','AI GUIDED','28 STATES','VOICE BOOKING','1M+ VISITORS','QR TICKETS','EMOTION AI','4.9★ RATED'];
const MARQUEE_SMALL = ['NATIONAL MUSEUM · DELHI','VICTORIA MEMORIAL · KOLKATA','ALBERT HALL · JAIPUR','CSMVS · MUMBAI','SALAR JUNG · HYDERABAD','NAPIER MUSEUM · KERALA','INDIAN MUSEUM · KOLKATA','VITM · BENGALURU'];

type MCard = { img:string; badge:string; rating:string; city:string; name:string };

const MASONRY_DATA: Record<string, MCard[]> = {
  'All India': [
    { img:fromUnsplash(PHOTOS.dest_nationalMuseum,600), badge:'History', rating:'4.5', city:'New Delhi',  name:'National Museum'   },
    { img:fromUnsplash(PHOTOS.dest_csmvs,600),          badge:'Art',     rating:'4.7', city:'Mumbai',     name:'CSMVS Mumbai'      },
    { img:fromUnsplash(PHOTOS.dest_victoria,700),        badge:'History', rating:'4.6', city:'Kolkata',    name:'Victoria Memorial' },
    { img:PHOTOS.dest_salarJung,                         badge:'Art',     rating:'4.4', city:'Hyderabad',  name:'Salar Jung'        },
    { img:PHOTOS.dest_vitm,                              badge:'Science', rating:'4.3', city:'Bengaluru',  name:'VITM'              },
    { img:fromUnsplash(PHOTOS.dest_napier,400),          badge:'Art',     rating:'4.2', city:'Trivandrum', name:'Napier Museum'     },
  ],
  'Delhi': [
    { img:fromUnsplash(PHOTOS.dest_d_national,600),  badge:'History', rating:'4.5', city:'New Delhi', name:'National Museum'      },
    { img:fromUnsplash(PHOTOS.dest_d_rail,600),       badge:'Railway', rating:'4.3', city:'New Delhi', name:'National Rail Museum' },
    { img:PHOTOS.dest_d_gandhi,                       badge:'History', rating:'4.4', city:'New Delhi', name:'Gandhi Museum'        },
    { img:PHOTOS.dest_d_crafts,                       badge:'Art',     rating:'4.2', city:'New Delhi', name:'Crafts Museum'        },
    { img:PHOTOS.dest_d_indira,                       badge:'History', rating:'4.3', city:'New Delhi', name:'Indira Gandhi Museum' },
    { img:PHOTOS.dest_d_natHistory,                   badge:'Science', rating:'4.0', city:'New Delhi', name:'Nat. Natural History' },
  ],
  'Rajasthan': [
    { img:fromUnsplash(PHOTOS.dest_r_albert,600),    badge:'Art',     rating:'4.3', city:'Jaipur',  name:'Albert Hall Museum' },
    { img:PHOTOS.dest_r_cityPalace,                  badge:'Culture', rating:'4.2', city:'Jaipur',  name:'City Palace Museum' },
    { img:fromUnsplash(PHOTOS.dest_r_hawamahal,700), badge:'History', rating:'4.5', city:'Jaipur',  name:'Hawa Mahal'         },
    { img:PHOTOS.dest_r_shilpgram,                   badge:'History', rating:'4.7', city:'Udaipur', name:'Shilpgram'          },
    { img:PHOTOS.dest_r_ajmer,                       badge:'History', rating:'4.3', city:'Ajmer',   name:'Ajmer Govt. Museum' },
    { img:PHOTOS.dest_r_bikaner,                     badge:'Culture', rating:'4.5', city:'Bikaner', name:'Ganga Govt. Museum' },
  ],
  'West Bengal': [
    { img:fromUnsplash(PHOTOS.dest_wb_victoria,600),  badge:'History', rating:'4.6', city:'Kolkata', name:'Victoria Memorial' },
    { img:PHOTOS.dest_wb_indianMus,                   badge:'History', rating:'4.4', city:'Kolkata', name:'Indian Museum'     },
    { img:PHOTOS.dest_wb_birla,                       badge:'Science', rating:'4.1', city:'Kolkata', name:'Birla Tech Museum' },
    { img:PHOTOS.dest_wb_marble,                      badge:'Art',     rating:'4.3', city:'Kolkata', name:'Marble Palace'     },
    { img:PHOTOS.dest_wb_science,                     badge:'Science', rating:'4.4', city:'Kolkata', name:'Science City'      },
    { img:PHOTOS.dest_wb_tagore,                      badge:'History', rating:'4.2', city:'Kolkata', name:'Tagore House'      },
  ],
  'Maharashtra': [
    { img:fromUnsplash(PHOTOS.dest_m_csmvs,600),  badge:'Art',     rating:'4.7', city:'Mumbai', name:'CSMVS Mumbai'         },
    { img:PHOTOS.dest_m_nehruSci,                  badge:'Science', rating:'4.2', city:'Mumbai', name:'Nehru Science Centre' },
    { img:PHOTOS.dest_m_bhauDaji,                  badge:'History', rating:'4.4', city:'Mumbai', name:'Bhau Daji Lad'        },
    { img:PHOTOS.dest_m_kelkar,                    badge:'History', rating:'4.5', city:'Pune',   name:'Kelkar Museum'        },
    { img:PHOTOS.dest_m_war,                       badge:'Culture', rating:'4.2', city:'Pune',   name:'National War Museum'  },
    { img:PHOTOS.dest_m_partition,                 badge:'History', rating:'4.3', city:'Pune',   name:'Aga Khan Palace'      },
  ],
};

const ARC_STRIP = [PHOTOS.arc_1,PHOTOS.arc_2,PHOTOS.arc_3,PHOTOS.arc_4,PHOTOS.arc_5,PHOTOS.arc_6,PHOTOS.arc_7,PHOTOS.arc_8];
const PROC_IMGS  = [PHOTOS.proc_1,PHOTOS.proc_2,PHOTOS.proc_3,PHOTOS.proc_4];

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All India');
  const [activeStep,   setActiveStep]   = useState(0);

  // ── SCROLL-DRIVEN STEP REVEAL ──────────────────────────────────────────
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps(prev => new Set([...prev, i]));
            setActiveStep(i);
          }
        },
        { threshold: 0.55, rootMargin: '-80px 0px -80px 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const openChatbot = () => window.dispatchEvent(new CustomEvent('musema:open-chatbot'));
  const FILTERS = ['All India','Delhi','Rajasthan','West Bengal','Maharashtra'];
  const masonry  = MASONRY_DATA[activeFilter] ?? MASONRY_DATA['All India'];

  return (
    <MainLayout>
      <style>{`
        /* ── HOME MOBILE FIXES (inline) ── */
        @media(max-width:768px) {

          /* ── Hero heading — staggered step alignment ── */
          .hv4-top { align-items: flex-start !important; }
          .hv4-left { text-align: left !important; width: 100% !important; }
          .hv4-h1 { display: flex !important; flex-direction: column !important; gap: 0 !important; align-items: stretch !important; }
          .hv4-word-row { display: flex !important; width: 100% !important; text-align: left !important; }
          .hv4-row-left   { justify-content: flex-start !important; }
          .hv4-row-center { justify-content: center !important; }
          .hv4-row-right  { justify-content: flex-end !important; }

          /* ── About section ── */
          .home-proc-inner .RL { height:240px !important; }

          /* ── Exhibitions header ── */
          .home-exh-header {
            display:flex !important;
            flex-direction:column !important;
            gap:12px !important;
            padding-bottom:20px !important;
            border-bottom:1.5px solid var(--bd) !important;
          }
          .home-exh-header > div:first-child { order:1; }
          .home-exh-header > p { order:2; max-width:100% !important; }
          .home-exh-header > button { order:3; align-self:flex-start !important; }
          .exh-v4-row {
            display:grid !important;
            grid-template-columns:1fr auto auto !important;
            gap:6px 12px !important;
            padding:14px 0 !important;
            align-items:center !important;
          }
          .exh-v4-name { font-size:1rem !important; line-height:1.2 !important; }
          .exh-v4-date { font-size:.7rem !important; white-space:nowrap !important; }

          /* ── Features 2×2 true square cards ── */
          .home-features-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .home-features-grid > div { grid-column: unset !important; }
          .home-features-grid .fcard-v4 {
            padding: 14px 12px !important;
            border-radius: 18px !important;
            min-height: unset !important;
            height: unset !important;
            width: 100% !important;
            aspect-ratio: 1 / 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .home-features-grid .fcard-v4-icon {
            width: 34px !important;
            height: 34px !important;
            border-radius: 9px !important;
            margin-bottom: 8px !important;
            flex-shrink: 0 !important;
          }
          .home-features-grid .fcard-v4-name {
            font-size: .78rem !important;
            margin-bottom: 5px !important;
            line-height: 1.2 !important;
            flex-shrink: 0 !important;
          }
          .home-features-grid .fcard-v4-desc {
            display: block !important;
            font-size: .65rem !important;
            line-height: 1.4 !important;
            opacity: .7 !important;
            overflow: hidden !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 4 !important;
            -webkit-box-orient: vertical !important;
          }

          /* ── Top Destinations — masonry on mobile ── */
          #destinations > div { padding: 0 10px !important; }
          .home-feat-asymmetric {
            display: grid !important;
            flex-direction: unset !important;
            overflow-x: visible !important;
            scroll-snap-type: none !important;
            grid-template-columns: 1fr 1.8fr 1fr !important;
            height: 600px !important;
            gap: 6px !important;
            padding-bottom: 0 !important;
            padding-right: 0 !important;
          }
          .home-feat-asymmetric > div {
            display: grid !important;
            grid-template-rows: 1fr 1fr !important;
            gap: 6px !important;
          }
          .home-feat-asymmetric .dcard-v4 {
            flex: unset !important;
            width: 100% !important;
            height: 100% !important;
            min-width: 0 !important;
            border-radius: 10px !important;
            scroll-snap-align: none !important;
          }
          .home-gallery-2x2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }
          .dcard-v4-name { font-size: .65rem !important; }
          .dcard-v4-tag  { font-size: .5rem !important; }
          .dcard-v4-city { display: none !important; }
          .dcard-v4-badge { font-size: .48rem !important; padding: 3px 5px !important; }
          .dcard-v4-rating { font-size: .55rem !important; padding: 3px 5px !important; }
          .dcard-v4-info { padding: 8px 8px !important; }
          .proc-step-wrap {
            position: relative !important;
            top: auto !important;
            min-height: auto !important;
            padding: 36px 0 !important;
          }
          .step-num { font-size:5rem !important; }

          /* ── CTA buttons full width ── */
          .home-howitworks-row .RR button { width:100% !important; justify-content:center !important; }

          /* Section padding */
          .sec-v4 { padding:48px 16px !important; }
        }

        @media(max-width:480px) {
          .home-features-grid { grid-template-columns:1fr 1fr !important; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero-v4">
        <div className="hero-v4-inner">

          {/* ── TOP ROW ─────────────────────────────────────── */}
          <div className="hv4-top">
            {/* Left: big editorial heading */}
            <div className="hv4-left">
              <h1 className="hv4-h1">
                <span className="hv4-word-row hv4-row-left">
                  <span className="hv4-word hv4-word-discover">Discover</span>
                </span>
                <span className="hv4-word-row hv4-row-num hv4-row-center">
                  <span className="hv4-num-outline">700+</span>
                  <span className="hv4-num-fill">Museums</span>
                </span>
                <span className="hv4-word-row hv4-row-right">
                  <span className="hv4-word hv4-word-india">Across India.</span>
                </span>
              </h1>
            </div>

            {/* Right: tag + description + CTA */}
            <div className="hv4-right">
              <div className="hv4-tag-pill">
                <MapPin size={24}/> 28 States Covered
              </div>
              <p className="hv4-desc">
                AI-powered exploration of India's most extraordinary cultural institutions — curated, voiced, and bookable in seconds.
              </p>
              <div className="hv4-cta-row">
                <button className="btn-v4-fill" onClick={()=>document.getElementById('destinations')?.scrollIntoView({behavior:'smooth'})}>
                  Start Exploring <ArrowRight size={14}/>
                </button>
                <button className="hv4-btn-ghost" onClick={openChatbot}>
                  <MessageSquare size={13}/> Ask AI Guide
                </button>
              </div>
              {/* Mini trust row */}
              <div className="hv4-trust">
                <div className="hv4-trust-avatars">
                  {['https://randomuser.me/api/portraits/men/65.jpg','https://randomuser.me/api/portraits/women/12.jpg','https://randomuser.me/api/portraits/men/76.jpg'].map((src,i)=>(
                    <img key={i} src={src} alt="visitor" style={{marginLeft: i===0?0:-10}}/>
                  ))}
                </div>
                <div className="hv4-trust-text">
                  <span>★★★★★</span> Built for <strong>museum explorers</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Filmstrip — original grid */}
          <div className="filmstrip R d2" style={{marginBottom:24}}>
            <div className="fs-main">
              <img src={fromUnsplash(PHOTOS.hero_main,900)} alt="Victoria Memorial Kolkata"/>
              <div className="fs-overlay"/>
              <div className="fs-label">
                <div className="fs-label-sm">Kolkata · History</div>
                <div className="fs-label-lg">Victoria<br/>Memorial</div>
              </div>
              <div className="fs-stat-pill">
                <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:'1.5rem',color:'var(--r)',lineHeight:1}}>700+</span>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:'.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--k3)'}}>Museums<br/>Across India</span>
              </div>
            </div>
            <div className="fs-mid">
              <div><img src={fromUnsplash(PHOTOS.hero_midTop,500)} alt="National Museum New Delhi"/></div>
              <div><img src={fromUnsplash(PHOTOS.hero_midBot,500)} alt="Albert Hall Museum Jaipur"/></div>
            </div>
            <div className="fs-right">
              <img src={fromUnsplash(PHOTOS.hero_right,700)} alt="CSMVS Mumbai"/>
              <div className="fs-right-overlay"/>
              <div className="fs-label" style={{left:'auto',right:28,textAlign:'right'}}>
                <div className="fs-label-sm">Mumbai · Art</div>
                <div className="fs-label-lg">CSMVS<br/>Mumbai</div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="hero-stats-v4 R d3">
            {[{num:'700+',label:'Museums',sub:'Across all states'},{num:'28',label:'States',sub:'Full coverage'},{num:'1M+',label:'Visitors',sub:'Annually served'},{num:'4.9',label:'Rating',sub:'5,000+ reviews'}].map(s=>(
              <div key={s.label} className="hs-v4">
                <span className="hs-v4-num">{s.num}</span>
                <div className="hs-v4-div"/>
                <div><div className="hs-v4-label">{s.label}</div><div className="hs-v4-sub">{s.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────── */}
      <div className="mq5-wrap">
        {/* Diagonal slash accent */}
        <div className="mq5-slash">/</div>

        {/* Row 1 — large outlined text scrolling right */}
        <div className="mq5-row mq5-row-top">
          <div className="mq5-track mq5-fwd">
            {[...MARQUEE_BIG, ...MARQUEE_BIG, ...MARQUEE_BIG].map((item, i) => (
              <span key={i} className="mq5-item-big">
                {/^\d/.test(item)
                  ? <><em>{item.match(/^[\d.]+[+★]/)?.[0]}</em>{item.replace(/^[\d.]+[+★]/, '')}</>
                  : item}
                <span className="mq5-diamond">◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — pill tags scrolling left */}
        <div className="mq5-row mq5-row-bot">
          <div className="mq5-track mq5-back">
            {[...MARQUEE_SMALL, ...MARQUEE_SMALL, ...MARQUEE_SMALL].map((item, i) => (
              <span key={i} className="mq5-pill">
                <span className="mq5-pill-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section id="about" style={{background:'var(--c)',padding:'96px 0',overflow:'hidden'}}>
        <div className="home-proc-inner" style={{maxWidth:1360,margin:'auto',padding:'0 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div className="RL" style={{position:'relative',height:520}}>
            <div className="about-v4-circle"><img src={fromUnsplash(PHOTOS.about,500)} alt="Museum visitor"/></div>
  

          </div>
          <div className="RR">
            <div className="s-eyebrow">Our Experience</div>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(3rem,5vw,4.4rem)',lineHeight:.95,color:'var(--k)',marginBottom:24}}>Our story of <em style={{color:'var(--r)',fontStyle:'normal'}}>adventure</em><br/>and finding the best place</h2>
            <p style={{fontSize:'.95rem',lineHeight:1.76,color:'var(--k3)',fontWeight:300,marginBottom:40,maxWidth:440}}>We believe every journey has its own story. Through Musema, find inspiration, AI-guided recommendations and exciting stories from India's greatest cultural destinations.</p>
            <div className="home-proc-steps" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:36}}>
              {[{n:'12K+',l:'Successful Journeys'},{n:'16+',l:'Awards Winning'},{n:'20+',l:'Years of Experience'}].map((s,i)=>(
                <div key={i} className="astat-v4 R" style={{transitionDelay:`${i*80}ms`}}>
                  <div className="astat-v4-n">{s.n}</div><div className="astat-v4-l">{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:12}} className="R d4">
              <button className="btn-v4-fill" onClick={()=>document.getElementById('destinations')?.scrollIntoView({behavior:'smooth'})}>Explore Museums <ArrowRight size={14}/></button>
              <button className="btn-v4-stroke" onClick={()=>navigate('/about')}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP DESTINATIONS ─────────────────────────────────── */}
      <section id="destinations" style={{background:'var(--c2)',padding:'96px 0'}}>
        <div style={{maxWidth:1360,margin:'auto',padding:'0 40px'}}>
          <div className="R" style={{textAlign:'center',marginBottom:40}}>
            <h2 className="s-title">Top <em>Destinations</em></h2>
            <p style={{fontSize:'.88rem',color:'var(--k3)',fontWeight:300,marginTop:8}}>Explore India's finest museums by city.</p>
          </div>
          <div className="R d1" style={{display:'flex',justifyContent:'center',gap:8,marginBottom:40,flexWrap:'wrap'}}>
            {FILTERS.map(f=>(
              <button key={f} className={`fp-v4${activeFilter===f?' active':''}`} onClick={()=>setActiveFilter(f)}>{f}</button>
            ))}
          </div>
          <div key={activeFilter} className="RS d2" className="home-feat-asymmetric" style={{display:'grid',gridTemplateColumns:'1fr 1.8fr 1fr',gap:12,height:540}}>
            <div style={{display:'grid',gridTemplateRows:'1.2fr 1fr',gap:12}}>
              {masonry.slice(0,2).map((m,i)=>(
                <div key={m.name+i} className="dcard-v4" style={{cursor:'default',pointerEvents:'none'}}>
                  <img src={m.img} alt={m.name}/><div className="dcard-v4-overlay"/>
                  <div className="dcard-v4-badge">{m.badge}</div>
                  <div className="dcard-v4-rating">★ {m.rating}</div>
                  <div className="dcard-v4-info">
                    <div className="dcard-v4-tag">{m.city}</div>
                    <div className="dcard-v4-name">{m.name}</div>
                    <div className="dcard-v4-city"><MapPin size={10}/>{m.city}, India</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="dcard-v4" style={{borderRadius:24,cursor:'default',pointerEvents:'none'}}>
              <img src={masonry[2].img} alt={masonry[2].name}/><div className="dcard-v4-overlay"/>
              <div className="dcard-v4-badge">{masonry[2].badge}</div>
              <div className="dcard-v4-rating">★ {masonry[2].rating}</div>
              <div className="dcard-v4-info">
                <div className="dcard-v4-tag">{masonry[2].city}</div>
                <div className="dcard-v4-name">{masonry[2].name}</div>
                <div className="dcard-v4-city"><MapPin size={10}/>{masonry[2].city}, India</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateRows:'1fr 1fr',gap:12}}>
              <div className="dcard-v4" style={{cursor:'default',pointerEvents:'none'}}>
                <img src={masonry[3].img} alt={masonry[3].name}/><div className="dcard-v4-overlay"/>
                <div className="dcard-v4-badge">{masonry[3].badge}</div>
                <div className="dcard-v4-rating">★ {masonry[3].rating}</div>
                <div className="dcard-v4-info">
                  <div className="dcard-v4-tag">{masonry[3].city}</div>
                  <div className="dcard-v4-name">{masonry[3].name}</div>
                  <div className="dcard-v4-city"><MapPin size={10}/>{masonry[3].city}, India</div>
                </div>
              </div>
              <div className="home-gallery-2x2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {masonry.slice(4,6).map((m,i)=>(
                  <div key={m.name+i} className="dcard-v4" style={{cursor:'default',pointerEvents:'none'}}>
                    <img src={m.img} alt={m.name}/><div className="dcard-v4-overlay"/>
                    <div className="dcard-v4-badge" style={{fontSize:'.55rem'}}>{m.badge}</div>
                    <div className="dcard-v4-info"><div className="dcard-v4-name" style={{fontSize:'.85rem'}}>{m.name}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MUSEUMS CTA ───────────────────────────────────────── */}
      <section style={{background:'var(--w)',padding:'72px 0',borderTop:'1.5px solid var(--bd)',borderBottom:'1.5px solid var(--bd)'}}>
        <div className="home-howitworks-row" style={{maxWidth:1360,margin:'auto',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:40}}>
          <div className="R">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'.68rem',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--k3)',marginBottom:10}}>Book Now</div>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(2.5rem,4vw,3.6rem)',lineHeight:.95,color:'var(--k)',margin:0}}>
              Browse <em style={{color:'var(--r)',fontStyle:'normal'}}>700+ Museums</em> & Book Instantly
            </h2>
          </div>
          <div className="RR" style={{display:'flex',gap:12,flexShrink:0}}>
            <button className="btn-v4-fill" onClick={()=>navigate('/museums')}>Explore All Museums <ArrowRight size={14}/></button>
            <button className="btn-v4-stroke" onClick={openChatbot}>Ask AI Guide</button>
          </div>
        </div>
      </section>

      {/* ── EXHIBITIONS ─────────────────── */}
      <section id="exhibitions" style={{background:'var(--c)',padding:'96px 0'}}>
        <div style={{maxWidth:1360,margin:'auto',padding:'0 40px'}}>
          <div className="home-exh-header" style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:40,alignItems:'end',paddingBottom:32,borderBottom:'1.5px solid var(--bd)'}}>
            <div>
              <div className="R" style={{fontFamily:"'Syne',sans-serif",fontSize:'.68rem',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--k3)'}}>Exhibitions</div>
              <div className="R d1" style={{fontFamily:"'Bebas Neue',cursive",fontSize:'3rem',color:'var(--k)',lineHeight:.9}}>2026<br/>UPCOMING</div>
            </div>
            <p className="R d1" style={{fontSize:'.85rem',lineHeight:1.72,color:'var(--k3)',fontWeight:300,maxWidth:300}}>Cultural discoveries and world-class museum experiences across India.</p>
            <button className="btn-v4-exh RR" onClick={()=>navigate('/exhibitions')}>Explore All ↗</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:40,padding:'16px 0',borderBottom:'1px solid var(--bd)'}}>
            {['Name of Exhibition','Category','Date'].map(h=><div key={h} style={{fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--k3)'}}>{h}</div>)}
          </div>
          {EXHIBITIONS.map((e,i)=>(
            <div key={i} className="exh-v4-row R" style={{transitionDelay:`${i*60}ms`}}>
              <div className="exh-v4-name">{e.name}</div>
              <span className="exh-v4-pill">{e.cat}</span>
              <div className="exh-v4-date">{e.date}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ARC — ASK AI ANYTHING ────────────────────────────── */}
      <section style={{background:'var(--c)',padding:'0 0 96px'}}>
        <div style={{maxWidth:1360,margin:'auto',padding:'0 40px'}}>
          <div className="arc-block-v4 RS">
            <div style={{position:'relative',zIndex:3,textAlign:'center',marginBottom:56}}>
      
              <h2 className="arc-v4-h2">ASK AI<br/><em>ANYTHING ABOUT</em><br/>INDIAN MUSEUMS</h2>
              <p className="arc-v4-p">Our AI knows every museum, every exhibit, every artifact across India's 700+ institutions. From ticket prices to secret galleries — just ask.</p>
              <button className="btn-v4-white" onClick={openChatbot}><MessageSquare size={16}/>Chat with AI Guide</button>
            </div>
            <div className="arc-strip-v4">
              {ARC_STRIP.map((url,i)=>(<div key={i} className="arc-strip-img-v4"><img src={fromUnsplash(url,300)} alt="Indian museum"/></div>))}
            </div>
            {/* White hemisphere with chatbot image */}
            <div className="arc-v4-shape">
              <div style={{position:'absolute',top:'70%',left:'50%',transform:'translate(-50%,-65%)',width:230,height:230,zIndex:10,pointerEvents:'none'}}>
                <img src={chatbotImg} alt="Musema AI Guide" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{background:'var(--c)',padding:'0 0 96px'}}>
        <div style={{maxWidth:1360,margin:'auto',padding:'0 40px'}}>
          <div className="s-eyebrow R">Platform Features</div>
          <h2 className="s-title R d1" style={{fontSize:'clamp(2.8rem,5vw,4.5rem)',marginBottom:48}}>Everything you need<br/>to <em>explore Indian Museums</em></h2>
          <div className="home-features-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12}}>
            {FEATURES.map((f,i)=>(<div key={i} className={`fcard-v4 ${f.cls} R`} style={{transitionDelay:`${i*80}ms`}}><div className="fcard-v4-icon"><FeatureIcon icon={f.icon} cls={f.cls}/></div><div className="fcard-v4-name">{f.name}</div><div className="fcard-v4-desc">{f.desc}</div></div>))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — redesigned ─────────────────────────── */}
      <section className="tmx-section">
        {/* Heading row */}
        <div className="tmx-head">
          <div className="tmx-head-left">
            <div className="s-eyebrow">Voices from India</div>
            <h2 className="tmx-h2">What our<br/><em>explorers</em> say</h2>
          </div>

          <div className="tmx-head-right">
            <div className="tmx-aggregate">
              <div className="tmx-agg-num">4.8</div>
              <div>
                <div className="tmx-stars">★★★★★</div>
                <div className="tmx-agg-sub">From early explorers</div>
              </div>
            </div>

            <div className="tmx-aggregate">
              <div className="tmx-agg-num">150+</div>
              <div>
                <div className="tmx-agg-sub" style={{marginTop:4}}>Beta explorers</div>
                <div className="tmx-agg-sub">across India</div>
              </div>
            </div>

            <button className="btn-v4-fill" onClick={()=>navigate('/sign-up')}>
              Join Free <ArrowRight size={14}/>
            </button>
          </div>
        </div>

        {/* Scrolling card strip */}
        <div className="tmx-strip-wrap">
          <div className="tmx-strip-fade tmx-strip-fade-l"/>
          <div className="tmx-strip-fade tmx-strip-fade-r"/>
          <div className="tmx-strip">
            <div className="tmx-strip-track">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t,i)=>(
                <div key={i} className="tmx-card">
                  <div className="tmx-card-top">
                    <img src={t.av} alt={t.name} className="tmx-card-av"/>
                    <div>
                      <div className="tmx-card-name">{t.name}</div>
                      <div className="tmx-card-role">{t.role} · {t.loc}</div>
                    </div>
                    <div className="tmx-card-stars">{'★'.repeat(t.stars)}</div>
                  </div>
                  <p className="tmx-card-quote">{t.quote}</p>
         
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS STEPS — scroll-reveal sticky ─────────────── */}
      <section style={{background:'var(--w)',padding:'96px 0 0'}}>
        <div style={{maxWidth:1360,margin:'auto',padding:'0 40px'}}>
          <div className="s-eyebrow RL">How It Works</div>
          <h2 className="s-title RL d1" style={{fontSize:'clamp(2.8rem,5vw,4.2rem)',marginBottom:12}}>How the <em>Booking</em> works</h2>
          <p className="RL d2" style={{fontSize:'.85rem',lineHeight:1.72,color:'var(--k3)',fontWeight:300,maxWidth:340,marginBottom:64}}>Every step is designed for your comfort. Our AI guides you from discovery to the museum gate.</p>
        </div>

        {PROC_STEPS.map((step, i) => (
          <div
            key={i}
            ref={el => { stepRefs.current[i] = el; }}
            className="proc-step-wrap"
            style={{
              position: 'sticky',
              top: 80 + i * 8,
              zIndex: 10 + i,
              background: i % 2 === 0 ? 'var(--w)' : 'var(--c)',
              borderTop: '1.5px solid var(--bd)',
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              opacity: visibleSteps.has(i) ? 1 : 0,
              transform: visibleSteps.has(i) ? 'none' : 'translateY(60px)',
              transition: `opacity .8s cubic-bezier(.16,1,.3,1) ${i * 60}ms, transform .8s cubic-bezier(.16,1,.3,1) ${i * 60}ms`,
            }}
          >
            <div className="home-cta-2col" style={{maxWidth:1360,margin:'auto',padding:'80px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center',width:'100%'}}>
              <div style={{order: i % 2 === 0 ? 0 : 1}}>
                <div className="step-num" style={{
                  fontFamily:"'Bebas Neue',cursive",
                  fontSize:'8rem',
                  lineHeight:1,
                  color: activeStep === i ? 'var(--r)' : 'var(--bd)',
                  transition:'color .5s cubic-bezier(.16,1,.3,1)',
                  marginBottom:8,
                }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(2.2rem,4vw,3.2rem)',lineHeight:.95,color:'var(--k)',marginBottom:20,letterSpacing:'.02em'}}>
                  {step.title}
                </h3>
                <p style={{fontSize:'.95rem',lineHeight:1.8,color:'var(--k3)',fontWeight:300,maxWidth:380}}>
                  {step.desc}
                </p>
                <div style={{display:'flex',gap:8,marginTop:36}}>
                  {PROC_STEPS.map((_,j)=>(
                    <div key={j} style={{
                      width: j===i ? 28 : 8,
                      height:4,
                      borderRadius:2,
                      background: j===i ? 'var(--r)' : j<i ? 'var(--k)' : 'var(--bd)',
                      transition:'all .4s cubic-bezier(.16,1,.3,1)',
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{
                order: i % 2 === 0 ? 1 : 0,
                borderRadius:28,
                overflow:'hidden',
                aspectRatio:'4/3',
                boxShadow: activeStep === i ? '0 32px 72px rgba(24,21,15,.18)' : '0 8px 24px rgba(24,21,15,.08)',
                transition:'box-shadow .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)',
                transform: activeStep === i ? 'scale(1)' : 'scale(0.97)',
              }}>
                <img
                  src={fromUnsplash(PROC_IMGS[i],700)}
                  alt={step.title}
                  style={{
                    width:'100%',
                    height:'100%',
                    objectFit:'cover',
                    transform: activeStep === i ? 'scale(1.04)' : 'scale(1)',
                    transition:'transform .9s cubic-bezier(.16,1,.3,1)',
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <div style={{height:'40vh',background:'var(--w)'}}/>
      </section>

    </MainLayout>
  );
}