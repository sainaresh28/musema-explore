import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import MainLayout from '../templates/MainLayout';
import { bookingApi, authApi, museumApi } from '../api';
import { toast } from 'sonner';
import { Ticket, Calendar, MapPin, Clock, Award, Edit, Save, X, ArrowUpRight, Heart, ArrowRight, Star, Download } from 'lucide-react';
import type { Booking } from '../@types';
import type { Museum } from '../@types';
import QRCode from 'react-qr-code';

const WISHLIST_KEY = 'musema_wishlist';

/* ── Ticket Download ──────────────────────────────────────────────────────── */
async function downloadTicket(booking: Booking) {
  const museum      = (booking.museum as any) || (booking as any).museumSnapshot || {};
  const museumName  = museum?.name  || 'Museum';
  const museumCity  = museum?.city  || '';
  const museumState = museum?.state || '';
  const museumType  = museum?.type  || '';
  const museumAddr  = museum?.address || '';

  const visitDate = booking.visitDate
    ? new Date(booking.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const adultTix   = booking.adultTickets   || 0;
  const childTix   = booking.childTickets   || 0;
  const seniorTix  = booking.seniorTickets  || 0;
  const studentTix = booking.studentTickets || 0;
  const totalPax   = adultTix + childTix + seniorTix + studentTix;

  // Parse any extras stored in specialRequirements
  const special    = (booking as any).specialRequirements || '';
  const hasGuide   = special.includes('Guided tour');
  const hasPhoto   = special.includes('Photography permit');
  const hasWheel   = special.includes('Wheelchair');
  const hasAssist  = special.includes('Special assistance');
  const hasSenior  = special.includes('Senior support');
  const extras     = [hasGuide && 'Guided Tour', hasPhoto && 'Photo Permit'].filter(Boolean).join(', ');
  const access     = [hasWheel && 'Wheelchair', hasAssist && 'Assistance', hasSenior && 'Senior Support'].filter(Boolean).join(', ');

  // ── QR data ──────────────────────────────────────────────────────────
  const qrData = JSON.stringify({
    ref:     booking.bookingReference,
    museum:  museumName,
    date:    booking.visitDate,
    time:    booking.timeSlot,
    visitor: booking.visitorName,
    email:   booking.visitorEmail,
    pax:     totalPax,
  });
  const qrDataUrl = await generateQRDataUrl(qrData, 200);

  // ── Canvas setup (2× for retina) ─────────────────────────────────────
  const W = 900, H = 560;
  const canvas = document.createElement('canvas');
  canvas.width  = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // ── Background ───────────────────────────────────────────────────────
  ctx.fillStyle = '#1A1710';
  roundRect(ctx, 0, 0, W, H, 20); ctx.fill();

  // ── Red left bar ─────────────────────────────────────────────────────
  const barGrad = ctx.createLinearGradient(0, 0, 0, H);
  barGrad.addColorStop(0, '#E53E3E'); barGrad.addColorStop(1, '#922B21');
  ctx.fillStyle = barGrad;
  roundRect(ctx, 0, 0, 8, H, [20, 0, 0, 20]); ctx.fill();

  // ── Diagonal texture (right stub) ────────────────────────────────────
  ctx.save(); ctx.globalAlpha = 0.035; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  for (let x = W - 230; x < W + 80; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - H, H); ctx.stroke();
  }
  ctx.restore();

  // ── Subtle top header band ────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(0, 0, W - 230, 68);

  // ── Brand ─────────────────────────────────────────────────────────────
  ctx.font = 'bold 12px Arial'; ctx.fillStyle = '#E53E3E';
  ctx.fillText('MUSEMA', 30, 30);
  ctx.font = '9px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText("INDIA'S MUSEUM EXPLORER", 30, 46);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(30, 56, W - 290, 1);

  // ── Museum name ───────────────────────────────────────────────────────
  ctx.font = 'bold 30px Georgia, serif'; ctx.fillStyle = '#fff';
  ctx.fillText(truncate(museumName, 32), 30, 102);

  // ── Type pill ─────────────────────────────────────────────────────────
  if (museumType) {
    const pt = museumType.toUpperCase();
    ctx.font = 'bold 8px Arial';
    const pw = ctx.measureText(pt).width + 18;
    ctx.fillStyle = 'rgba(229,62,62,0.2)'; roundRect(ctx, 30, 111, pw, 19, 9); ctx.fill();
    ctx.fillStyle = '#E53E3E'; ctx.fillText(pt, 39, 124);
  }

  // ── Location line ─────────────────────────────────────────────────────
  ctx.font = '11px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
  const loc = [museumCity, museumState].filter(Boolean).join(', ');
  ctx.fillText('📍  ' + loc + (museumAddr ? '  ·  ' + truncate(museumAddr, 40) : ''), 30, 148);

  // ── Horizontal rule ───────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(30, 162, W - 260, 1);

  // ── DETAILS GRID (left column, 3 cols × 3 rows) ───────────────────────
 
  const cell = (label: string, value: string, x: number, y: number, accent = false) => {
    ctx.font = 'bold 7.5px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(label.toUpperCase(), x, y);
    ctx.font = accent ? 'bold 17px Georgia, serif' : '13px Georgia, serif';
    ctx.fillStyle = accent ? '#E53E3E' : '#fff';
    ctx.fillText(truncate(value, 24), x, y + 20);
  };

  const c1 = 30, c2 = 230, c3 = 440;
  const r1 = 186, r2 = 252, r3 = 318;

  cell('Visitor Name',   booking.visitorName  || '—',     c1, r1);
  cell('Visit Date',     visitDate,                        c2, r1);
  cell('Time Slot',      booking.timeSlot || '—',          c3, r1);
  cell('Email',          booking.visitorEmail || '—',      c1, r2);
  cell('Phone',          booking.visitorPhone || '—',      c2, r2);
  cell('Status',         (booking.status || 'confirmed').toUpperCase(), c3, r2);
  cell('Tickets',        `${adultTix > 0 ? adultTix + ' Adult' : ''}${childTix > 0 ? '  ' + childTix + ' Child' : ''}${seniorTix > 0 ? '  ' + seniorTix + ' Senior' : ''}${studentTix > 0 ? '  ' + studentTix + ' Student' : ''}`.trim() || '—', c1, r3);
  cell('Total Amount',   `₹ ${booking.totalAmount || 0}`,  c2, r3, true);
  cell('Booked On',      booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', c3, r3);

  let extraY = r3 + 66;
  if (extras || access) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(30, r3 + 40, W - 260, 1);
    if (extras) { cell('Add-ons',          extras,  c1, extraY); }
    if (access) { cell('Accessibility',    access,  extras ? c2 : c1, extraY); }
    extraY += 60;
  }

  // ── Footer bar ────────────────────────────────────────────────────────
  const footerY = H - 52;
  ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, footerY, W - 230, 52);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, footerY, W - 230, 1);

  // Booking ref
  ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillText('BOOKING REF', 30, footerY + 18);
  ctx.font = '13px "Courier New", monospace'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(booking.bookingReference || '—', 30, footerY + 34);

  // Status badge (right of footer)
  const statusColors: Record<string, [string, string]> = {
    confirmed: ['#EDFBF2', '#1A7340'],
    cancelled: ['#FFF1F0', '#C0392B'],
    completed: ['#EEF2FF', '#3730A3'],
  };
  const [sBg, sFg] = statusColors[booking.status] || statusColors.confirmed;
  const st = (booking.status || 'CONFIRMED').toUpperCase();
  ctx.font = 'bold 8px Arial';
  const stW = ctx.measureText(st).width + 22;
  ctx.fillStyle = sBg; roundRect(ctx, W - 250 - stW, footerY + 14, stW, 20, 10); ctx.fill();
  ctx.fillStyle = sFg; ctx.fillText(st, W - 250 - stW + 11, footerY + 27);

  // ── Perforated divider ────────────────────────────────────────────────
  ctx.save();
  ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(255,255,255,0.11)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W - 230, 18); ctx.lineTo(W - 230, H - 18); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1A1710';
  ctx.beginPath(); ctx.arc(W - 230, 0,  13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W - 230, H,  13, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── QR code stub ──────────────────────────────────────────────────────
  const qrStubCX = W - 230 + (230 / 2); 
  const qrBox = 158;
  const qrX = qrStubCX - qrBox / 2;
  const qrY = 30;

  ctx.fillStyle = '#fff'; roundRect(ctx, qrX, qrY, qrBox, qrBox, 12); ctx.fill();

  if (qrDataUrl) {
    const qrImg = new Image();
    await new Promise<void>(res => {
      qrImg.onload = () => { ctx.drawImage(qrImg, qrX + 10, qrY + 10, qrBox - 20, qrBox - 20); res(); };
      qrImg.onerror = () => res();
      qrImg.src = qrDataUrl;
    });
  }

  // Scan label
  ctx.font = 'bold 7.5px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN AT ENTRANCE', qrStubCX, qrY + qrBox + 18);

  // Ref below QR
  ctx.font = '8px "Courier New", monospace'; ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillText(booking.bookingReference || '', qrStubCX, qrY + qrBox + 33);

  // Total in stub
  ctx.font = 'bold 22px Georgia, serif'; ctx.fillStyle = '#E53E3E';
  ctx.fillText(booking.totalAmount > 0 ? `₹${booking.totalAmount}` : 'FREE', qrStubCX, qrY + qrBox + 66);
  ctx.font = 'bold 7.5px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText('TOTAL PAID', qrStubCX, qrY + qrBox + 80);

  // Visitor name in stub
  ctx.font = '10px Georgia, serif'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(truncate(booking.visitorName || '', 18), qrStubCX, qrY + qrBox + 105);

  // Date in stub
  ctx.font = '9px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillText(visitDate, qrStubCX, qrY + qrBox + 122);

  ctx.textAlign = 'left';

  // ── Download ─────────────────────────────────────────────────────────
  const link = document.createElement('a');
  link.download = `musema-ticket-${booking.bookingReference || 'ticket'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* Helpers */
function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number | [number, number, number, number] = 8,
) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

async function generateQRDataUrl(data: string, size: number): Promise<string> {
  return new Promise(resolve => {
    
    try {
      
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;background:white;padding:8px;';
      document.body.appendChild(div);

      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=000000&margin=0`;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        c.getContext('2d')!.drawImage(img, 0, 0, size, size);
        try { resolve(c.toDataURL('image/png')); }
        catch { resolve(''); }
        document.body.removeChild(div);
      };
      img.onerror = () => { resolve(''); document.body.removeChild(div); };
      img.src = qrApiUrl;
    } catch { resolve(''); }
  });
}

const statusCfg: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  confirmed: { bg:'#EDFBF2', color:'#1A7340', dot:'#2ECC71', label:'Confirmed' },
  cancelled: { bg:'#FFF1F0', color:'#C0392B', dot:'#E74C3C', label:'Cancelled'  },
  completed: { bg:'#EEF2FF', color:'#3730A3', dot:'#6366F1', label:'Completed'  },
};

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [profile, setProfile]       = useState<any>(null);
  const [editMode, setEditMode]     = useState(false);
  const [editData, setEditData]     = useState({ phone:'', city:'', state:'', preferredLanguage:'en' });
  const [saving, setSaving]         = useState(false);
  const [selected, setSelected]     = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<'bookings'|'upcoming'|'wishlist'|'profile'>('bookings');
  const [subTab, setSubTab]         = useState<'all'|'confirmed'|'past'|'cancelled'>('all');

  // ── Wishlist ─────────────────────────────────────────────────
  const wishlistKey = user ? `${WISHLIST_KEY}_${user.id}` : WISHLIST_KEY;
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`${WISHLIST_KEY}_${user?.id}`) || '[]'); } catch { return []; }
  });
  const [wishlistMuseums, setWishlistMuseums] = useState<Museum[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try { setWishlistIds(JSON.parse(localStorage.getItem(`${WISHLIST_KEY}_${user.id}`) || '[]')); } catch { setWishlistIds([]); }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'wishlist') return;
    if (wishlistIds.length === 0) { setWishlistMuseums([]); return; }
    setWishlistLoading(true);
    museumApi.getAll()
      .then((d: any) => {
        const all: Museum[] = d.museums || [];
        setWishlistMuseums(all.filter(m => wishlistIds.includes(m._id)));
      })
      .catch(() => setWishlistMuseums([]))
      .finally(() => setWishlistLoading(false));
  }, [activeTab, wishlistIds]);

  const removeFromWishlist = (museumId: string) => {
    const next = wishlistIds.filter(id => id !== museumId);
    setWishlistIds(next);
    localStorage.setItem(wishlistKey, JSON.stringify(next));
    setWishlistMuseums(prev => prev.filter(m => m._id !== museumId));
  };

  useEffect(() => {
    bookingApi.getAll()
      .then(d => setBookings(d.bookings || []))
      .catch(() => setBookings([]));
    authApi.getMe()
      .then(d => {
        setProfile(d.user);
        setEditData({ phone:d.user?.phone||'', city:d.user?.city||'', state:d.user?.state||'', preferredLanguage:d.user?.preferredLanguage||'en' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming  = bookings.filter(b => b.status==='confirmed' && new Date(b.visitDate)>=new Date());
  const past      = bookings.filter(b => b.status==='completed' || (b.status!=='cancelled' && new Date(b.visitDate)<new Date()));
  const cancelled = bookings.filter(b => b.status==='cancelled');
  const totalSpent   = bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+(b.totalAmount||0),0);
  const totalTickets = bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+(b.adultTickets||0)+(b.childTickets||0),0);

  const badge = bookings.length>=5 ? 'Heritage Explorer' : bookings.length>=2 ? 'Museum Enthusiast' : 'New Explorer';

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingApi.cancel(id);
      setBookings(p => p.map(b => b._id===id ? {...b,status:'cancelled'} : b));
      toast.success('Booking cancelled');
    } catch(e:any) { toast.error(e.message||'Failed'); }
    finally { setCancelling(null); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(editData);
      setProfile((p:any) => ({...p,...editData}));
      setEditMode(false);
      toast.success('Profile updated');
    } catch(e:any) { toast.error(e.message||'Failed'); }
    finally { setSaving(false); }
  };

  const subData = { all:bookings, confirmed:upcoming, past, cancelled };
  const currentBookings = subData[subTab] || bookings;

  if (loading) return (
    <MainLayout>
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:36,height:36,border:'2.5px solid var(--bd)',borderTopColor:'var(--r)',borderRadius:'50%',animation:'spin 1s linear infinite' }} />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <style>{`
        @media(max-width:768px) {
          /* ── Hero header — stack vertically ── */
          .dash-hero-inner { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; padding: 32px 16px 24px !important; }

          /* ── User info + action buttons — both fit inside ── */
          .dash-user-row { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; width: 100% !important; }
          .dash-action-btns {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            width: 100% !important;
            flex-shrink: 0 !important;
          }
          .dash-action-btns button {
            flex: 1 !important;
            justify-content: center !important;
            font-size: .65rem !important;
            padding: 10px 8px !important;
            white-space: nowrap !important;
          }

          /* ── Stats — 2×2 grid ── */
          .dash-stats-row {
            grid-template-columns: repeat(2,1fr) !important;
            gap: 6px !important;
            margin-top: 20px !important;
            border-radius: 12px !important;
          }
          .dash-stats-row > div { padding: 12px 10px !important; border-radius: 0 !important; }
          .dash-stats-row > div:first-child { border-radius: 12px 0 0 0 !important; }
          .dash-stats-row > div:nth-child(2) { border-radius: 0 12px 0 0 !important; }
          .dash-stats-row > div:nth-child(3) { border-radius: 0 0 0 12px !important; }
          .dash-stats-row > div:last-child { border-radius: 0 0 12px 0 !important; }

          /* ── Tab nav — scrollable, no overflow ── */
          .dash-tab-bar {
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding: 0 16px !important;
            scrollbar-width: none !important;
          }
          .dash-tab-bar::-webkit-scrollbar { display: none; }
          .dash-tab-bar button { padding: 12px 14px !important; font-size: .65rem !important; }

          /* ── Content area ── */
          .dash-content { padding: 20px 16px !important; }

          /* ── Bookings sub-tab bar — scrollable ── */
          .dash-subtab-bar {
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          .dash-subtab-bar::-webkit-scrollbar { display: none; }
          .dash-subtab-bar button { padding: 10px 12px !important; font-size: .65rem !important; flex-shrink: 0 !important; }

          /* ── Booking cards ── */
          .dash-bookings-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .dash-booking-card { padding: 14px !important; border-radius: 14px !important; }
          .dash-booking-inner { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }

          /* ── Profile ── */
          .dash-profile-form { grid-template-columns: 1fr !important; gap: 12px !important; }
          .dash-profile-inner-grid { grid-template-columns: 1fr !important; gap: 14px !important; }

          /* ── QR Modal ── */
          .dash-ticket-modal { max-width: 100% !important; border-radius: 20px 20px 0 0 !important; padding: 20px 16px !important; }
        }
        @media(max-width:480px) {
          .dash-stats-row { grid-template-columns: 1fr 1fr !important; }
          .dash-action-btns { flex-direction: column !important; }
        }
      `}</style>
      <div style={{ background:'var(--c)', minHeight:'100vh' }}>

        {/* ─── HERO HEADER ─── */}
        <div style={{ background:'var(--k)', position:'relative', overflow:'hidden' }}>
          {/* Grain */}
          <div style={{ position:'absolute',inset:0,backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E\")",pointerEvents:'none' }} />
          <div style={{ maxWidth:1360, margin:'auto', padding:'48px 40px 56px', position:'relative', zIndex:1 }}>
            <div className="dash-user-row" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24 }}>
              {/* Left: user info */}
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                {/* Avatar */}
                <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--r)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'3px solid rgba(255,255,255,.15)' }}>
                  <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.2rem', color:'#fff', lineHeight:1 }}>
                    {user?.firstName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(2rem,4vw,3.2rem)', color:'#fff', lineHeight:.92, letterSpacing:'.02em', marginBottom:8 }}>
                    {user?.fullName || 'Explorer'}
                  </h1>
                  <p style={{ fontSize:'.82rem', color:'rgba(255,255,255,.4)', marginBottom:12 }}>{user?.primaryEmailAddress?.emailAddress}</p>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(201,78,28,.25)', border:'1px solid rgba(201,78,28,.4)', borderRadius:100, padding:'5px 14px', fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--r)' }}>
                    <Award size={11} />{badge}
                  </span>
                </div>
              </div>
              {/* Right: action buttons */}
              <div className="dash-action-btns" style={{ display:'flex', gap:10, flexShrink:0 }}>
                <button className="btn-v4-stroke" style={{ color:'rgba(255,255,255,.5)', borderColor:'rgba(255,255,255,.2)' }} onClick={() => navigate('/')}>
                  Explore Museums <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => signOut(() => navigate('/sign-in'))}
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 20px', borderRadius:100, background:'rgba(201,78,28,.15)', border:'1.5px solid rgba(201,78,28,.35)', color:'var(--r)', fontFamily:"'Syne',sans-serif", fontSize:'.75rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                  onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background='var(--r)'; (e.currentTarget as HTMLButtonElement).style.color='#fff'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(201,78,28,.15)'; (e.currentTarget as HTMLButtonElement).style.color='var(--r)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="dash-stats-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'rgba(255,255,255,.06)', borderRadius:16, overflow:'hidden', marginTop:40, border:'1px solid rgba(255,255,255,.06)' }}>
              {[
                { num:String(bookings.length), label:'Total Bookings' },
                { num:String(upcoming.length), label:'Upcoming Visits' },
                { num:`₹${totalSpent}`,        label:'Total Spent'    },
                { num:String(totalTickets),    label:'Tickets Bought' },
              ].map((s,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,.04)', padding:'20px 24px' }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.4rem', color:'var(--r)', lineHeight:1, marginBottom:4 }}>{s.num}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.35)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tab nav */}
            <div className="dash-tab-bar" style={{ display:'flex', gap:0, marginTop:32, borderBottom:'1px solid rgba(255,255,255,.08)' }}>
              {([['bookings','My Bookings'],['upcoming',`Upcoming (${upcoming.length})`],['wishlist',`Wishlist (${wishlistIds.length})`],['profile','Profile']] as const).map(([key,label]) => (
                <button key={key} onClick={() => setActiveTab(key as any)}
                  style={{ padding:'12px 24px', fontFamily:"'Syne',sans-serif", fontSize:'.75rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', background:'none', border:'none', cursor:'pointer', borderBottom:`2px solid ${activeTab===key?'var(--r)':'transparent'}`, color:activeTab===key?'#fff':'rgba(255,255,255,.35)', marginBottom:-1, transition:'all .2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CONTENT ─── */}
        <div className="dash-content" style={{ maxWidth:1360, margin:'auto', padding:'48px 40px' }}>

          {/* ── MY BOOKINGS ── */}
          {activeTab==='bookings' && (
            bookings.length===0 ? (
              <div style={{ textAlign:'center', padding:'80px 0', border:'1.5px dashed var(--bd)', borderRadius:24 }}>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>🎫</div>
                <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.2rem', color:'var(--k)', marginBottom:8 }}>No Bookings Yet</h3>
                <p style={{ fontSize:'.88rem', color:'var(--k3)', marginBottom:28 }}>Start exploring India's extraordinary museums</p>
                <button className="btn-v4-fill" onClick={() => navigate('/')}>Browse Museums <ArrowRight size={14} /></button>
              </div>
            ) : (
              <div>
                {/* Sub-tabs */}
                <div className="dash-subtab-bar" style={{ display:'flex', gap:0, marginBottom:32, borderBottom:'1.5px solid var(--bd)' }}>
                  {([
                    ['all',`All (${bookings.length})`],
                    ['confirmed',`Upcoming (${upcoming.length})`],
                    ['past',`Past (${past.length})`],
                    ['cancelled',`Cancelled (${cancelled.length})`],
                  ] as const).map(([key,label]) => (
                    <button key={key} onClick={() => setSubTab(key as any)}
                      style={{ padding:'10px 22px', fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', background:'none', border:'none', cursor:'pointer', borderBottom:`2px solid ${subTab===key?'var(--k)':'transparent'}`, color:subTab===key?'var(--k)':'var(--k3)', marginBottom:-2, transition:'all .2s' }}>
                      {label}
                    </button>
                  ))}
                </div>
                {currentBookings.length===0 ? (
                  <p style={{ textAlign:'center', padding:'48px 0', color:'var(--k3)', fontSize:'.88rem' }}>No bookings in this category</p>
                ) : (
                  <div className="dash-bookings-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))', gap:20 }}>
                    {currentBookings.map(b => <BookingCard key={b._id} booking={b} onSelect={setSelected} onCancel={handleCancel} cancelling={cancelling} />)}
                  </div>
                )}
              </div>
            )
          )}

          {/* ── UPCOMING ── */}
          {activeTab==='upcoming' && (
            upcoming.length===0 ? (
              <div style={{ textAlign:'center', padding:'80px 0', border:'1.5px dashed var(--bd)', borderRadius:24 }}>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>📅</div>
                <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.2rem', color:'var(--k)', marginBottom:8 }}>No Upcoming Visits</h3>
                <p style={{ fontSize:'.88rem', color:'var(--k3)', marginBottom:28 }}>Book a museum to see your upcoming visits here</p>
                <button className="btn-v4-fill" onClick={() => navigate('/')}>Book a Visit <ArrowRight size={14} /></button>
              </div>
            ) : (
              <div className="dash-bookings-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))', gap:20 }}>
                {upcoming.map(b => <BookingCard key={b._id} booking={b} onSelect={setSelected} onCancel={handleCancel} cancelling={cancelling} />)}
              </div>
            )
          )}

          {/* ── WISHLIST ── */}
          {activeTab==='wishlist' && (
            wishlistLoading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:20, overflow:'hidden', height:320 }}>
                    <div style={{ height:180, background:'var(--c2)', animation:'wlpulse 1.4s ease-in-out infinite' }} />
                    <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                      {[80,55].map((w,j) => <div key={j} style={{ height:12, width:`${w}%`, background:'var(--c2)', borderRadius:6, animation:'wlpulse 1.4s ease-in-out infinite' }} />)}
                    </div>
                    <style>{`@keyframes wlpulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
                  </div>
                ))}
              </div>
            ) : wishlistMuseums.length === 0 ? (
              <div style={{ textAlign:'center', padding:'80px 0', border:'1.5px dashed var(--bd)', borderRadius:24 }}>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>⭐</div>
                <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2.2rem', color:'var(--k)', marginBottom:8 }}>No Wishlisted Museums</h3>
                <p style={{ fontSize:'.88rem', color:'var(--k3)', marginBottom:28 }}>Star museums you love to save them here</p>
                <button className="btn-v4-fill" onClick={() => navigate('/museums')}>Browse Museums <ArrowRight size={14} /></button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize:'.82rem', color:'var(--k3)', marginBottom:24, fontFamily:"'Syne',sans-serif" }}>
                  {wishlistMuseums.length} museum{wishlistMuseums.length !== 1 ? 's' : ''} saved
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
                  {wishlistMuseums.map(museum => {
                    const img = museum.thumbnail || museum.images?.[0] || `https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80`;
                    const price = museum.ticketPrices?.adult ?? 0;
                    return (
                      <div key={museum._id} style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', transition:'box-shadow .2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,.10)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                      >
                        {/* Image */}
                        <div style={{ position:'relative', height:180, overflow:'hidden', flexShrink:0 }}>
                          <img src={img} alt={museum.name}
                            style={{ width:'100%', height:'100%', objectFit:'cover' }}
                            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80'; }}
                          />
                          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 55%)' }} />
                          <span style={{ position:'absolute', top:12, left:12, fontFamily:"'Syne',sans-serif", fontSize:'.58rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', background:'var(--r)', color:'#fff', padding:'4px 10px', borderRadius:100 }}>{museum.type}</span>
                          {/* Remove from wishlist */}
                          <button
                            onClick={() => removeFromWishlist(museum._id)}
                            title="Remove from wishlist"
                            style={{ position:'absolute', top:10, right:10, width:32, height:32, borderRadius:'50%', background:'rgba(229,62,62,0.92)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.18)', transition:'transform .2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform='scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                          >
                            <Star size={14} fill="#fff" color="#fff" strokeWidth={2} />
                          </button>
                        </div>
                        {/* Info */}
                        <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.62rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--k3)' }}>{museum.city}, {museum.state}</div>
                          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.3rem', color:'var(--k)', lineHeight:1.15 }}>{museum.name}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--k3)', fontSize:'.75rem', fontFamily:"'Syne',sans-serif" }}>
                            <MapPin size={11} />{museum.city}
                          </div>
                          <div style={{ marginTop:'auto', paddingTop:12, display:'flex', gap:8 }}>
                            <div style={{ flex:1, fontSize:'.82rem', fontFamily:"'Syne',sans-serif", color:'var(--k3)' }}>
                              {price === 0
                                ? <strong style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.2rem', color:'var(--k)' }}>FREE</strong>
                                : <>₹<strong style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.2rem', color:'var(--k)' }}>{price}</strong>/person</>
                              }
                            </div>
                            <button
                              onClick={() => navigate(`/museums`)}
                              style={{ display:'inline-flex', alignItems:'center', gap:5, background:'var(--k)', color:'#fff', border:'none', borderRadius:100, padding:'8px 16px', fontFamily:"'Syne',sans-serif", fontSize:'.62rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', cursor:'pointer', transition:'opacity .2s' }}
                              onMouseEnter={e => e.currentTarget.style.opacity='.8'}
                              onMouseLeave={e => e.currentTarget.style.opacity='1'}
                            >
                              Book <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ── PROFILE ── */}
          {activeTab==='profile' && (
            <div className="dash-profile-form" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              {/* Personal info */}
              <div style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:24, overflow:'hidden' }}>
                <div style={{ padding:'20px 28px', borderBottom:'1.5px solid var(--bd)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'.88rem', fontWeight:700, color:'var(--k)' }}>Personal Information</h3>
                  {!editMode
                    ? <button onClick={() => setEditMode(true)} style={{ display:'flex',alignItems:'center',gap:6,fontFamily:"'Syne',sans-serif",fontSize:'.72rem',fontWeight:600,color:'var(--k3)',background:'none',border:'none',cursor:'pointer' }}><Edit size={13} />Edit</button>
                    : <div style={{ display:'flex',gap:16 }}>
                        <button onClick={() => setEditMode(false)} style={{ color:'var(--k3)',background:'none',border:'none',cursor:'pointer' }}><X size={16} /></button>
                        <button onClick={handleSave} disabled={saving} style={{ display:'flex',alignItems:'center',gap:6,fontFamily:"'Syne',sans-serif",fontSize:'.72rem',fontWeight:600,color:'var(--r)',background:'none',border:'none',cursor:'pointer' }}><Save size={13} />{saving?'Saving…':'Save'}</button>
                      </div>
                  }
                </div>
                <div style={{ padding:'24px 28px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                    {[['Name',user?.fullName],['Email',user?.primaryEmailAddress?.emailAddress]].map(([l,v]) => (
                      <div key={l}>
                        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--k3)',marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:'.9rem',color:'var(--k)',fontWeight:500,wordBreak:'break-all' }}>{v||'—'}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height:1,background:'var(--bd)',marginBottom:20 }} />
                  {editMode ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {[['Phone','phone'],['City','city'],['State','state']].map(([ph,key]) => (
                        <input key={key} value={(editData as any)[key]} onChange={e => setEditData(p=>({...p,[key]:e.target.value}))}
                          placeholder={ph} className="cp-input-v4" style={{ borderRadius:12, padding:'10px 16px' }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                      {[['Phone',profile?.phone],['City',profile?.city],['State',profile?.state],['Language',profile?.preferredLanguage]].map(([l,v]) => (
                        <div key={l}>
                          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--k3)',marginBottom:4 }}>{l}</div>
                          <div style={{ fontSize:'.9rem',color:v?'var(--k)':'var(--bd)',fontWeight:v?500:400 }}>{v||'Not set'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Taste profile */}
              <div style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:24, overflow:'hidden' }}>
                <div style={{ padding:'20px 28px', borderBottom:'1.5px solid var(--bd)', display:'flex', alignItems:'center', gap:8 }}>
                  <Heart size={15} style={{ color:'var(--r)' }} />
                  <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:'.88rem',fontWeight:700,color:'var(--k)' }}>Museum Taste Profile</h3>
                </div>
                <div style={{ padding:'24px 28px' }}>
                  {bookings.length===0 ? (
                    <p style={{ fontSize:'.85rem',color:'var(--k3)',fontWeight:300 }}>Book museums to build your taste profile.</p>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {['History','Art','Science','Culture','Natural History'].map((type,i) => {
                        const count = bookings.filter(b=>(b.museum as any)?.type===type).length;
                        const pct = bookings.length ? Math.round((count/bookings.length)*100) : 0;
                        const colors = ['var(--r)','#3B6FD4','#2E7D32','#6B3FA0','#B8860B'];
                        return (
                          <div key={type}>
                            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                              <span style={{ fontFamily:"'Syne',sans-serif",fontSize:'.75rem',fontWeight:600,color:'var(--k2)' }}>{type}</span>
                              <span style={{ fontSize:'.72rem',color:'var(--k3)' }}>{pct}%</span>
                            </div>
                            <div style={{ height:6,background:'var(--bd)',borderRadius:4,overflow:'hidden' }}>
                              <div style={{ height:'100%',width:`${Math.max(pct,pct>0?2:0)}%`,background:colors[i],borderRadius:4,transition:'width 1s cubic-bezier(.16,1,.3,1)' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── QR MODAL ─── */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(24,21,15,.6)',backdropFilter:'blur(12px)' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'var(--w)',border:'1.5px solid var(--bd)',borderRadius:28,maxWidth:400,width:'100%',overflow:'hidden',boxShadow:'0 32px 80px rgba(24,21,15,.25)' }}>
            {/* Modal header */}
            <div style={{ background:'var(--k)',padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:2 }}>Your Ticket</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'1.4rem',color:'#fff',letterSpacing:'.04em' }}>Booking Confirmed</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,.6)' }}><X size={15} /></button>
            </div>
            {/* Modal body */}
            <div style={{ padding:'28px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
              <div style={{ padding:16,background:'#fff',border:'1.5px solid var(--bd)',borderRadius:16 }}>
                <QRCode
                  value={JSON.stringify({ ref:selected.bookingReference, museum:(selected.museum as any)?.name, date:selected.visitDate, time:selected.timeSlot, visitor:selected.visitorName })}
                  size={156}
                />
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--k3)',marginBottom:4 }}>Reference</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2.2rem',color:'var(--r)',letterSpacing:'.04em' }}>{selected.bookingReference}</div>
              </div>
              {/* Details */}
              <div style={{ width:'100%',background:'var(--c)',border:'1.5px solid var(--bd)',borderRadius:16,padding:'16px 20px',display:'flex',flexDirection:'column',gap:10 }}>
                {[
                  ['Museum',(selected.museum as any)?.name],
                  ['Date',selected.visitDate ? new Date(selected.visitDate).toLocaleDateString('en-IN',{dateStyle:'long'}) : '—'],
                  ['Time',selected.timeSlot],
                  ['Visitors',String((selected.adultTickets||0)+(selected.childTickets||0))],
                  ['Total',`₹${selected.totalAmount||0}`],
                ].map(([l,v]) => (
                  <div key={l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontSize:'.78rem',color:'var(--k3)' }}>{l}</span>
                    <span style={{ fontSize:'.85rem',fontWeight:600,color:'var(--k)',fontFamily:l==='Total'?"'Bebas Neue',cursive":'inherit' }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:'.72rem',color:'var(--k3)',textAlign:'center' }}>Show this QR at the museum entrance</p>
              {/* Actions */}
              <div style={{ display:'flex',gap:10,width:'100%' }}>
                {selected.status==='confirmed' && new Date(selected.visitDate)>=new Date() && (
                  <button onClick={() => { handleCancel(selected._id); setSelected(null); }}
                    style={{ flex:1,padding:'10px 0',border:'1.5px solid #E74C3C',borderRadius:100,fontFamily:"'Syne',sans-serif",fontSize:'.72rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'#E74C3C',background:'none',cursor:'pointer' }}>
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => downloadTicket(selected)}
                  style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 0',border:'1.5px solid var(--bd)',borderRadius:100,fontFamily:"'Syne',sans-serif",fontSize:'.72rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--k)',background:'none',cursor:'pointer',transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--k)';e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='var(--k)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--k)';e.currentTarget.style.borderColor='var(--bd)';}}
                >
                  <Download size={13} /> Download
                </button>
                <button className="btn-v4-fill" style={{ flex:2 }} onClick={() => setSelected(null)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

/* ─── Booking Card Component ─── */
function BookingCard({ booking, onSelect, onCancel, cancelling }: {
  booking: Booking;
  onSelect: (b:Booking)=>void;
  onCancel: (id:string)=>void;
  cancelling: string|null;
}) {
  const [downloading, setDownloading] = useState(false);
  const museum = (booking.museum as any) || (booking as any).museumSnapshot;
  const isPast = new Date(booking.visitDate) < new Date();
  const s = statusCfg[booking.status] || statusCfg.confirmed;
  const thumb = museum?.thumbnail || museum?.images?.[0];

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      await downloadTicket(booking);
    } catch {
      // silent fail
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div onClick={() => onSelect(booking)} style={{ background:'var(--w)', border:'1.5px solid var(--bd)', borderRadius:22, overflow:'hidden', cursor:'pointer', transition:'transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 16px 40px rgba(24,21,15,.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow=''; }}>
      {/* Museum image strip */}
      {thumb && (
        <div style={{ height:140, overflow:'hidden', position:'relative' }}>
          <img src={thumb} alt={museum?.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none';}} />
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(24,21,15,.7))' }} />
          {/* Status badge on image */}
          <div style={{ position:'absolute',top:12,right:12,background:s.bg,borderRadius:100,padding:'4px 12px',display:'flex',alignItems:'center',gap:5 }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:s.dot,display:'block' }} />
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:s.color }}>{s.label}</span>
          </div>
        </div>
      )}
      <div style={{ padding:'18px 20px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <h3 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'1.4rem',letterSpacing:'.03em',color:'var(--k)',lineHeight:1,marginBottom:4 }}>{museum?.name||'Museum'}</h3>
            <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:'.72rem',color:'var(--k3)' }}><MapPin size={11} />{museum?.city}, {museum?.state}</div>
          </div>
          {!thumb && (
            <div style={{ background:s.bg,borderRadius:100,padding:'4px 12px',display:'flex',alignItems:'center',gap:5,flexShrink:0 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:s.dot,display:'block' }} />
              <span style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:s.color }}>{s.label}</span>
            </div>
          )}
        </div>
        {/* Details grid */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16,padding:'14px 16px',background:'var(--c)',borderRadius:12 }}>
          {[
            { icon:<Calendar size={11} />, label:'Date', val:booking.visitDate?new Date(booking.visitDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—' },
            { icon:<Clock size={11} />,    label:'Time', val:booking.timeSlot||'—' },
            { icon:<Ticket size={11} />,   label:'Tickets', val:`${(booking.adultTickets||0)+(booking.childTickets||0)} ticket(s)` },
            { icon:null,                   label:'Amount', val:`₹${booking.totalAmount||0}`, bold:true },
          ].map(({icon,label,val,bold}) => (
            <div key={label}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.55rem',fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--k3)',marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:'.8rem',color:'var(--k)',fontWeight:bold?700:500,display:'flex',alignItems:'center',gap:4 }}>{icon}{val}</div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid var(--bd)' }}>
          <span style={{ fontFamily:'monospace',fontSize:'.65rem',color:'var(--k3)',letterSpacing:'.05em' }}>{booking.bookingReference}</span>
          <div style={{ display:'flex',gap:8,alignItems:'center' }} onClick={e=>e.stopPropagation()}>
            {booking.status==='confirmed' && !isPast && (
              <button onClick={() => onCancel(booking._id)} disabled={cancelling===booking._id}
                style={{ fontFamily:"'Syne',sans-serif",fontSize:'.65rem',fontWeight:700,color:'#C0392B',background:'none',border:'none',cursor:'pointer' }}>
                {cancelling===booking._id?'Cancelling…':'Cancel'}
              </button>
            )}
            {/* Download ticket button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              title="Download ticket"
              style={{
                display:'flex', alignItems:'center', gap:5,
                fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700,
                color: downloading ? 'var(--k3)' : 'var(--k)',
                background: downloading ? 'var(--c)' : 'var(--c)',
                border:'1.5px solid var(--bd)', borderRadius:100,
                padding:'5px 12px', cursor: downloading ? 'default' : 'pointer',
                transition:'all .2s',
              }}
              onMouseEnter={e => { if (!downloading) { e.currentTarget.style.background='var(--k)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='var(--k)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background='var(--c)'; e.currentTarget.style.color=downloading?'var(--k3)':'var(--k)'; e.currentTarget.style.borderColor='var(--bd)'; }}
            >
              <Download size={11} />
              {downloading ? 'Generating…' : 'Ticket'}
            </button>
            <button onClick={() => onSelect(booking)} style={{ display:'flex',alignItems:'center',gap:4,fontFamily:"'Syne',sans-serif",fontSize:'.65rem',fontWeight:700,color:'var(--r)',background:'none',border:'none',cursor:'pointer' }}>
              View QR <ArrowUpRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}