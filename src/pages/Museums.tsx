import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, ChevronLeft, ChevronRight, X, Clock, Phone, Mail,
  Globe, Star, Ticket, ExternalLink, Building2, ArrowRight, Info
} from 'lucide-react';
import MainLayout from '../templates/MainLayout';
import { museumApi } from '../api';
import { getMuseumThumbnail } from '../utils/imageService';
import { getMuseumImage } from '../utils/museumImages';
import type { Museum } from '../@types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useUser } from '@clerk/clerk-react';

const WISHLIST_KEY = 'musema_wishlist';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CHOOSE_TYPES = ['All', 'History', 'Art', 'Science', 'Tribal', 'Culture', 'Natural History', 'Archaeological', 'Railway'];
const CARD_W   = 340;
const CARD_GAP = 20;

// ── Museum Detail Modal ──────────────────────────────────────────────────────
function MuseumModal({ museum, onClose, onBook }: {
  museum: Museum; onClose: () => void; onBook: (m: Museum) => void;
}) {
  const img     = getMuseumImage(museum.name) || museum.thumbnail || museum.images?.[0] || getMuseumThumbnail(museum);
  const hasCoords = !!(museum.latitude && museum.longitude);
  const price   = museum.ticketPrices?.adult ?? 0;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const days = museum.openingHours
    ? Object.entries(museum.openingHours).slice(0, 3)
    : [];

  return (
    <div
      onClick={handleBackdrop}
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(24,21,15,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        animation: 'fadeInOv .25s ease',
      }}
    >
      <style>{`
        @keyframes fadeInOv   { from{opacity:0} to{opacity:1} }
        @keyframes slideUpM   { from{opacity:0;transform:translateY(32px) scale(.97)} to{opacity:1;transform:none} }
        .mscroll::-webkit-scrollbar{width:4px}
        .mscroll::-webkit-scrollbar-track{background:transparent}
        .mscroll::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}
        .mrow{display:flex;align-items:flex-start;gap:12px;padding:13px 0;border-bottom:1px solid var(--bd)}
        .mrow:last-child{border-bottom:none}
        .mpill{display:inline-flex;align-items:baseline;gap:3px;background:var(--c);border:1.5px solid var(--bd);border-radius:100px;padding:5px 13px}
        .leaflet-container{border-radius:16px!important}
        .modal-body-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .modal-left { padding: 24px 24px 24px 28px; border-right: 1.5px solid var(--bd); }
        .modal-right { padding: 24px 28px 24px 24px; }
        .modal-action-bar { display: flex; gap: 10px; padding: 16px 24px; border-top: 1.5px solid var(--bd); flex-shrink: 0; }
        @media(max-width:768px) {
          .modal-backdrop { padding: 0 !important; align-items: flex-end !important; }
          .modal-card {
            border-radius: 24px 24px 0 0 !important;
            max-height: 92vh !important;
            max-width: 100% !important;
          }
          .modal-img-strip { height: 200px !important; }
          .modal-body-grid { grid-template-columns: 1fr !important; }
          .modal-left { border-right: none !important; border-bottom: 1.5px solid var(--bd); padding: 18px 16px !important; }
          .modal-right { padding: 18px 16px !important; }
          .modal-action-bar { padding: 12px 16px !important; }
          .modal-action-bar button { flex: 1 !important; justify-content: center !important; }
          .modal-name { font-size: 1.5rem !important; }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        className="modal-card"
        style={{
          background: 'var(--w)', borderRadius: 28,
          width: '100%', maxWidth: 920, maxHeight: '90vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(24,21,15,.35)',
          animation: 'slideUpM .35s cubic-bezier(.16,1,.3,1)',
        }}
      >
        {/* Image strip */}
        <div className="modal-img-strip" style={{ position: 'relative', height: 250, flexShrink: 0, overflow: 'hidden' }}>
          <img src={img} alt={museum.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=900&q=80'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,21,15,.72) 0%, transparent 55%)' }} />
          {/* Badges */}
          <div style={{ position: 'absolute', top: 16, left: 20, display: 'flex', gap: 8 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', background:'var(--r)', color:'#fff', padding:'5px 12px', borderRadius:100 }}>{museum.type}</span>
            {museum.rating > 0 && (
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,.92)', color:'var(--k)', padding:'5px 12px', borderRadius:100 }}>
                <Star size={10} fill="#F59E0B" color="#F59E0B" /> {museum.rating.toFixed(1)}
              </span>
            )}
          </div>
          {/* Close */}
          <button onClick={onClose}
            style={{ position:'absolute', top:16, right:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.92)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--k)', transition:'background .2s' }}
          ><X size={16} /></button>
          {/* Name */}
          <div style={{ position:'absolute', bottom:18, left:20, right:20 }}>
            <div className="modal-name" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'#fff', lineHeight:1, letterSpacing:'.03em', marginBottom:4 }}>{museum.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,.7)', fontSize:'.78rem' }}>
              <MapPin size={12} /> {museum.address || `${museum.city}, ${museum.state}`}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mscroll" style={{ overflowY: 'auto', flex: 1 }}>
          <div className="modal-body-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

            {/* LEFT: info */}
            <div className="modal-left" style={{ padding: '24px 24px 24px 28px', borderRight: '1.5px solid var(--bd)' }}>
              {/* About */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', marginBottom:8 }}>About</div>
                <p style={{ fontSize:'.85rem', lineHeight:1.76, color:'var(--k3)', fontWeight:300, margin:0 }}>
                  {museum.description || `${museum.name} is a distinguished museum in ${museum.city}, ${museum.state}, recognised for its cultural significance and diverse collections.`}
                </p>
              </div>
              {/* Details */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', marginBottom:8 }}>Details</div>
                {museum.establishedYear && (
                  <div className="mrow">
                    <Building2 size={15} style={{ color:'var(--r)', marginTop:1, flexShrink:0 }} />
                    <div><div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.63rem', fontWeight:700, color:'var(--k3)', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:1 }}>Established</div>
                    <div style={{ fontSize:'.83rem', color:'var(--k)', fontWeight:500 }}>{museum.establishedYear}</div></div>
                  </div>
                )}
                {days.length > 0 && (
                  <div className="mrow">
                    <Clock size={15} style={{ color:'var(--r)', marginTop:1, flexShrink:0 }} />
                    <div style={{ flex:1 }}><div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.63rem', fontWeight:700, color:'var(--k3)', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:4 }}>Hours</div>
                    {days.map(([d, h]) => (
                      <div key={d} style={{ display:'flex', justifyContent:'space-between', fontSize:'.8rem', color:'var(--k3)', marginBottom:2, gap:16 }}>
                        <span style={{ textTransform:'capitalize' }}>{d}</span>
                        <span style={{ color:'var(--k)', fontWeight:500 }}>{h}</span>
                      </div>
                    ))}</div>
                  </div>
                )}
                {museum.contactPhone && (
                  <div className="mrow">
                    <Phone size={15} style={{ color:'var(--r)', marginTop:1, flexShrink:0 }} />
                    <div><div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.63rem', fontWeight:700, color:'var(--k3)', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:1 }}>Phone</div>
                    <div style={{ fontSize:'.83rem', color:'var(--k)', fontWeight:500 }}>{museum.contactPhone}</div></div>
                  </div>
                )}
                {museum.contactEmail && (
                  <div className="mrow">
                    <Mail size={15} style={{ color:'var(--r)', marginTop:1, flexShrink:0 }} />
                    <div><div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.63rem', fontWeight:700, color:'var(--k3)', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:1 }}>Email</div>
                    <div style={{ fontSize:'.83rem', color:'var(--k)', fontWeight:500 }}>{museum.contactEmail}</div></div>
                  </div>
                )}
                {museum.website && (
                  <div className="mrow">
                    <Globe size={15} style={{ color:'var(--r)', marginTop:1, flexShrink:0 }} />
                    <div><div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.63rem', fontWeight:700, color:'var(--k3)', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:1 }}>Website</div>
                    <a href={museum.website} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:'.83rem', color:'var(--r)', fontWeight:500, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                      Visit <ExternalLink size={10} />
                    </a></div>
                  </div>
                )}
              </div>
              {/* Ticket prices */}
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  <Ticket size={11} style={{ color:'var(--r)' }} /> Ticket Prices
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {([
                    { label:'Adult',   val: museum.ticketPrices?.adult   },
                    { label:'Child',   val: museum.ticketPrices?.child   },
                    { label:'Senior',  val: museum.ticketPrices?.senior  },
                    { label:'Student', val: museum.ticketPrices?.student },
                  ] as { label: string; val: number | undefined }[]).filter(t => t.val !== undefined).map(t => (
                    <div key={t.label} className="mpill">
                      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.58rem', fontWeight:700, color:'var(--k3)', letterSpacing:'.07em', textTransform:'uppercase' }}>{t.label}</span>
                      <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.15rem', color: t.val === 0 ? 'var(--k3)' : 'var(--k)', marginLeft:5 }}>
                        {t.val === 0 ? 'Free' : `₹${t.val}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: map */}
            <div className="modal-right" style={{ padding: '24px 28px 24px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--k3)', display:'flex', alignItems:'center', gap:5 }}>
                <MapPin size={11} style={{ color:'var(--r)' }} /> Location
              </div>

              {hasCoords ? (
                <div
                  style={{ flex:1, minHeight:260, borderRadius:16, overflow:'hidden', border:'1.5px solid var(--bd)', cursor:'pointer', position:'relative' }}
                  title="Click to open in Google Maps"
                  onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(museum.name + ', ' + (museum.address || museum.city + ', ' + museum.state))}`, '_blank', 'noopener,noreferrer')}
                >
                  <MapContainer
                    center={[museum.latitude!, museum.longitude!]}
                    zoom={15}
                    style={{ height: '100%', minHeight: 260, width: '100%' }}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    dragging={false}
                    doubleClickZoom={false}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[museum.latitude!, museum.longitude!]}>
                      <Popup>
                        <strong style={{ fontFamily:"'Syne',sans-serif" }}>{museum.name}</strong><br/>
                        <span style={{ fontSize:'.82rem' }}>{museum.city}, {museum.state}</span>
                      </Popup>
                    </Marker>
                  </MapContainer>
                  {/* "Open in Google Maps" overlay hint */}
                  <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', zIndex:1000, background:'rgba(24,21,15,.72)', backdropFilter:'blur(3px)', borderRadius:100, padding:'5px 14px', display:'flex', alignItems:'center', gap:5, pointerEvents:'none', whiteSpace:'nowrap' }}>
                    <ExternalLink size={10} style={{ color:'#fff' }} />
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.58rem', fontWeight:700, color:'#fff', letterSpacing:'.06em', textTransform:'uppercase' }}>Open in Google Maps</span>
                  </div>
                </div>
              ) : (
                <div style={{ flex:1, minHeight:260, borderRadius:16, border:'1.5px dashed var(--bd)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--c)', gap:8 }}>
                  <MapPin size={28} style={{ color:'var(--bd)' }} />
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.78rem', color:'var(--k3)', fontWeight:500 }}>{museum.city}, {museum.state}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--k3)', opacity:.6 }}>Coordinates not available</div>
                </div>
              )}

              <div style={{ background:'var(--c)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:9 }}>
                <MapPin size={13} style={{ color:'var(--r)', marginTop:2, flexShrink:0 }} />
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.68rem', fontWeight:700, color:'var(--k)', marginBottom:2 }}>{museum.name}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--k3)', lineHeight:1.5 }}>{museum.address || `${museum.city}, ${museum.state}`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'18px 28px', borderTop:'1.5px solid var(--bd)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--w)', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:'.7rem', color:'var(--k3)', fontWeight:500, marginBottom:2 }}>Adult ticket from</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
              {price === 0
                ? <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.7rem', color:'var(--k)' }}>Free Entry</span>
                : <><span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.82rem', color:'var(--k3)' }}>₹</span>
                   <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.7rem', color:'var(--k)' }}>{price}</span>
                   <span style={{ fontSize:'.72rem', color:'var(--k3)', marginLeft:4 }}>per person</span></>
              }
            </div>
          </div>
          <div className="modal-action-bar" style={{ display:'flex', gap:9 }}>
            <button onClick={onClose}
              style={{ background:'transparent', border:'1.5px solid var(--bd)', borderRadius:100, padding:'10px 20px', fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--k3)', cursor:'pointer', transition:'all .2s' }}
            >Close</button>
            <button onClick={() => { onBook(museum); onClose(); }}
              style={{ background:'var(--k)', border:'none', borderRadius:100, padding:'10px 26px', fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'#fff', cursor:'pointer', transition:'background .2s', display:'flex', alignItems:'center', gap:7 }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--r)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--k)')}
            >Book Tickets <ArrowRight size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── India Full Map Modal ─────────────────────────────────────────────────────
function IndiaMapModal({ museums, onClose }: { museums: Museum[]; onClose: () => void }) {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const validMuseums = useMemo(
    () => museums.filter(m => m.latitude && m.longitude && m.latitude !== 0 && m.longitude !== 0),
    [museums]
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', h); };
  }, [onClose]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(mapRef.current!, {
        center: [22.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = (color = '#C0392B') => L.divIcon({
        className: '',
        html: `<div style="position:relative;width:28px;height:36px">
          <svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22s14-12.67 14-22C28 6.27 21.73 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="14" cy="14" r="5" fill="white"/>
          </svg>
        </div>`,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -38],
      });

      validMuseums.forEach(museum => {
        const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(museum.name + ', ' + (museum.address || museum.city + ', ' + museum.state))}`;
        const marker = L.marker([museum.latitude!, museum.longitude!], { icon: pinIcon() });
        marker.bindPopup(`
          <div style="min-width:210px;font-family:'Syne',sans-serif;padding:4px 2px">
            <div style="font-weight:700;font-size:13px;color:#18150f;margin-bottom:3px;line-height:1.2">${museum.name}</div>
            <div style="font-size:11px;color:#888;margin-bottom:6px">${museum.city}, ${museum.state}</div>
            <div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap">
              <span style="background:#fff0ed;color:#C0392B;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;border:1px solid #fcc">${museum.type}</span>
              ${museum.rating ? `<span style="background:#fffbe6;color:#b45309;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;border:1px solid #fde68a">★ ${museum.rating.toFixed(1)}</span>` : ''}
            </div>
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:5px;background:#18150f;color:#fff;padding:6px 14px;border-radius:100px;font-size:11px;font-weight:700;text-decoration:none;letter-spacing:.04em">
              Open in Google Maps ↗
            </a>
          </div>
        `);
        marker.addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [validMuseums]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(24,21,15,0.82)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        animation: 'fadeInOv .25s ease',
      }}
    >
      <style>{`@keyframes fadeInOv{from{opacity:0}to{opacity:1}} @keyframes slideUpM{from{opacity:0;transform:translateY(32px) scale(.97)}to{opacity:1;transform:none}} .leaflet-container{font-family:'Syne',sans-serif!important}`}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--w)', borderRadius: 24,
          width: '100%', maxWidth: 1200, height: '88vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(24,21,15,.5)',
          animation: 'slideUpM .35s cubic-bezier(.16,1,.3,1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1.5px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--k3)', marginBottom: 4 }}>Interactive Map</div>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '1.8rem', color: 'var(--k)', lineHeight: 1 }}>
              Museums Across India
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.75rem', fontWeight: 600, color: 'var(--r)', marginLeft: 12, verticalAlign: 'middle' }}>
                {validMuseums.length} locations
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--bd)', background: 'var(--c)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--k)', transition: 'all .2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--k)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--c)'; e.currentTarget.style.color = 'var(--k)'; }}
          >
            <X size={16} />
          </button>
        </div>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {/* Hint */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(24,21,15,.75)', backdropFilter: 'blur(4px)', borderRadius: 100, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 7, pointerEvents: 'none' }}>
            <MapPin size={12} style={{ color: 'var(--r)' }} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.65rem', fontWeight: 600, color: '#fff', letterSpacing: '.06em' }}>Click a pin to open in Google Maps</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Museums() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();

  const [allMuseums,     setAllMuseums]     = useState<Museum[]>([]);
  const [chooseType,     setChooseType]     = useState('All');
  const [loading,        setLoading]        = useState(true);
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);
  const [containerW,     setContainerW]     = useState(1100);
  const [showMapModal,   setShowMapModal]   = useState(false);

  // ── Wishlist (per user, stored in localStorage) ──────────────
  const wishlistKey = user ? `${WISHLIST_KEY}_${user.id}` : WISHLIST_KEY;
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(wishlistKey) || '[]'); } catch { return []; }
  });

  // Re-sync wishlist when user changes
  useEffect(() => {
    try { setWishlist(JSON.parse(localStorage.getItem(wishlistKey) || '[]')); } catch { setWishlist([]); }
  }, [wishlistKey]);

  const toggleWishlist = useCallback((museumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = prev.includes(museumId) ? prev.filter(id => id !== museumId) : [...prev, museumId];
      localStorage.setItem(wishlistKey, JSON.stringify(next));
      return next;
    });
  }, [wishlistKey]);

  // ── Continuous pixel offset (live during drag/wheel) ──────────
  const [offset,    setOffset]    = useState(0);
  const offsetRef                  = useRef(0);       // always in sync, no stale closures
  const isDragging                 = useRef(false);
  const dragStartX                 = useRef(0);
  const dragStartOffset            = useRef(0);
  const wheelAccum                 = useRef(0);
  const wheelTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef               = useRef<HTMLDivElement>(null);
  const trackRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => { if (containerRef.current) setContainerW(containerRef.current.clientWidth); };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    museumApi.getAll()
      .then(d => setAllMuseums(d.museums || []))
      .catch(() => setAllMuseums([]))
      .finally(() => setLoading(false));
  }, []);

  // Reset to start when filter changes
  useEffect(() => { offsetRef.current = 0; setOffset(0); }, [chooseType]);

  const filtered = useMemo(
    () => chooseType === 'All' ? allMuseums : allMuseums.filter(m => m.type === chooseType),
    [chooseType, allMuseums]
  );

  const totalTrackW = filtered.length * (CARD_W + CARD_GAP) - CARD_GAP;
  const maxOffset   = Math.max(0, totalTrackW - containerW);
  const cardsPerPage = Math.max(1, Math.floor((containerW + CARD_GAP) / (CARD_W + CARD_GAP)));
  const totalPages   = Math.max(1, Math.ceil(filtered.length / cardsPerPage));
  const page         = Math.round(offset / (cardsPerPage * (CARD_W + CARD_GAP)));
  const canPrev      = offset > 0;
  const canNext      = offset < maxOffset;

  // Direct DOM helper — moves track without React re-render (zero jank during drag)
  const setTrackX = useCallback((x: number, animate: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate ? 'transform .32s cubic-bezier(.4,0,.2,1)' : 'none';
    el.style.transform  = `translateX(-${x}px)`;
  }, []);

  // Clamp + snap helper: snap to nearest card grid after gesture ends
  const snapTo = useCallback((raw: number) => {
    const clamped = Math.max(0, Math.min(maxOffset, raw));
    const snapped = Math.round(clamped / (CARD_W + CARD_GAP)) * (CARD_W + CARD_GAP);
    const final   = Math.max(0, Math.min(maxOffset, snapped));
    offsetRef.current = final;
    setOffset(final);
    setTrackX(final, true);
  }, [maxOffset, setTrackX]);

  const slideBy = useCallback((delta: number) => {
    snapTo(offsetRef.current + delta);
  }, [snapTo]);

  const prev = useCallback(() => slideBy(-(cardsPerPage * (CARD_W + CARD_GAP))), [slideBy, cardsPerPage]);
  const next = useCallback(() => slideBy( cardsPerPage * (CARD_W + CARD_GAP)),  [slideBy, cardsPerPage]);

  // ── Wheel / trackpad ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only intercept horizontal scroll (trackpad swipe) or diagonal
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.3;
      if (!isHorizontal) return;
      e.preventDefault();

      const delta = e.deltaX;
      const next  = Math.max(0, Math.min(maxOffset, offsetRef.current + delta));
      offsetRef.current = next;
      setTrackX(next, false);   // direct DOM — no React re-render, zero lag

      // Debounced snap
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => { snapTo(offsetRef.current); }, 150);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); if (wheelTimer.current) clearTimeout(wheelTimer.current); };
  }, [maxOffset, snapTo, setTrackX]);

  // ── Touch / pointer drag ──────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      isDragging.current   = true;
      dragStartX.current   = e.clientX;
      dragStartOffset.current = offsetRef.current;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const dx   = dragStartX.current - e.clientX;
      const next = Math.max(0, Math.min(maxOffset, dragStartOffset.current + dx));
      offsetRef.current = next;
      setTrackX(next, false);   // direct DOM — 1:1 with finger, no transition lag
    };

    const onPointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      el.style.cursor = 'grab';
      snapTo(offsetRef.current);
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup',   onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup',   onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [maxOffset, snapTo, setTrackX]);
  const openMuseum  = useCallback((m: Museum) => setSelectedMuseum(m), []);
  const closeMuseum = useCallback(() => setSelectedMuseum(null), []);
  const bookMuseum  = useCallback((m: Museum) => {
    const dest = `/payment?museumId=${m._id}&museum=${encodeURIComponent(m.name)}`;
    if (!isSignedIn) {
      navigate(`/sign-in?redirect_url=${encodeURIComponent(dest)}`);
      return;
    }
    navigate(dest);
  }, [navigate, isSignedIn]);

  return (
    <MainLayout>
      <style>{`
        @media(max-width:768px) {
          .museums-hero { min-height: 56vh !important; padding: 80px 0 40px !important; }
          .museums-hero-inner { grid-template-columns: 1fr !important; gap: 24px !important; padding: 0 16px !important; }
          .museums-hero h1 { font-size: clamp(2.4rem,10vw,4rem) !important; }
          .museums-hero-right { display: none !important; }
          .museums-hero-stats { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .museums-filter-bar { padding: 16px !important; flex-direction: column !important; gap: 10px !important; }
          .museums-filter-bar input,
          .museums-filter-bar select { width: 100% !important; }
          /* Type tabs — wrap into a neat grid on mobile */
          .museums-type-tabs {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            padding: 12px 16px !important;
            justify-content: flex-start !important;
          }
          .museums-type-tabs button { flex: 0 0 auto !important; font-size: .7rem !important; padding: 6px 14px !important; }
          .museums-grid { grid-template-columns: 1fr !important; gap: 16px !important; padding: 20px 16px !important; }
          .museums-cta-section { flex-direction: column !important; text-align: center !important; gap: 16px !important; padding: 48px 20px !important; }
          .museums-cta-section > div:first-child { max-width: 100% !important; }
          .museum-card-grid-2 { grid-template-columns: 1fr !important; }
          /* Card carousel — show card peek so user knows it's swipeable */
          .choose-carousel-wrap {
            overflow: visible !important;
          }
          .choose-carousel-track {
            /* Show a sliver of the next card */
            padding-right: 48px !important;
          }
        }
        @media(max-width:480px) {
          .museums-hero-stats { grid-template-columns: 1fr 1fr !important; }
          .museums-hero h1 { font-size: clamp(2rem,9vw,3rem) !important; }
        }
      `}</style>
      {/* Hero */}
      <section className="museums-hero" style={{ background:'var(--k)', minHeight:'72vh', overflow:'hidden', position:'relative', display:'flex', alignItems:'center' }}>
        {/* noise */}
        <div style={{ position:'absolute', inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")", pointerEvents:'none', zIndex:0 }} />
        {/* warm radial glow left */}
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'55%', height:'140%', background:'radial-gradient(ellipse at center, rgba(180,70,30,.18) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

        <div className="museums-hero-inner" style={{ maxWidth:1360, margin:'auto', padding:'80px 40px', position:'relative', zIndex:1, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

          {/* LEFT: text */}
          <div className="R">
            <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(4rem,7vw,7.5rem)', lineHeight:.88, color:'#fff', margin:'0 0 28px' }}>
              India's<br/><span style={{ color:'var(--r)' }}>700+</span><br/>Museums
            </h1>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'.92rem', lineHeight:1.76, color:'rgba(255,255,255,.45)', fontWeight:300, maxWidth:360, marginBottom:40 }}>
              Discover museums across 28 states — filter by type, explore stories, and book your visit in seconds.
            </p>
            {/* Stats row */}
            <div style={{ display:'flex', gap:0 }}>
              {[{n:'700+',l:'Museums'},{n:'28',l:'States'},{n:'2 min',l:'To Book'}].map((s,i) => (
                <div key={i} style={{ paddingRight:28, marginRight:28, borderRight: i<2 ? '1px solid rgba(255,255,255,.12)' : 'none' }}>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'2rem', color:'#fff', lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.6rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: image collage */}
          <div className="RR d1" style={{ position:'relative', height:480 }}>
            {/* Main large image */}
            <div style={{ position:'absolute', top:0, right:0, width:'72%', height:'74%', borderRadius:20, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.5)' }}>
              <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/56/90/49/caption.jpg?w=1200&h=-1&s=1" alt="Museum" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, transparent 50%, rgba(24,21,15,.4))' }} />
            </div>
            {/* Small bottom-left image */}
            <div style={{ position:'absolute', bottom:0, left:0, width:'48%', height:'52%', borderRadius:16, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,.5)', border:'2px solid rgba(255,255,255,.07)' }}>
              <img src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=85" alt="India museum" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
     
          </div>
        </div>
      </section>

      {/* Slider Section */}
      <section style={{ background:'var(--w)', padding:'64px 0 96px' }}>
        <div style={{ maxWidth:1360, margin:'auto', padding:'0 40px' }}>

          {/* Header + arrows */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:32 }}>
            <div>
              <div className="R" style={{ fontFamily:"'Syne',sans-serif", fontSize:'.68rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--k3)', marginBottom:8 }}>Browse &amp; Book</div>
              <h2 className="R d1" style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(2.6rem,5vw,4rem)', lineHeight:.95, color:'var(--k)', margin:0 }}>
                Choose your <em style={{ color:'var(--r)', fontStyle:'normal' }}>Destination</em>
              </h2>
            </div>
            <div className="R d1" style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:4 }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'.72rem', fontWeight:700, color:'var(--k3)', letterSpacing:'.08em', minWidth:80, textAlign:'center' }}>
                {loading ? '—' : `${filtered.length} museums`}
              </span>
              <button onClick={prev} disabled={!canPrev || loading} aria-label="Previous"
                style={{ width:48, height:48, borderRadius:'50%', border:'1.5px solid var(--bd)', background: canPrev && !loading ? 'var(--k)' : 'var(--c2)', color: canPrev && !loading ? '#fff' : 'var(--k3)', display:'flex', alignItems:'center', justifyContent:'center', cursor: canPrev && !loading ? 'pointer' : 'not-allowed', transition:'all .2s', flexShrink:0 }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} disabled={!canNext || loading} aria-label="Next"
                style={{ width:48, height:48, borderRadius:'50%', border:'1.5px solid var(--bd)', background: canNext && !loading ? 'var(--k)' : 'var(--c2)', color: canNext && !loading ? '#fff' : 'var(--k3)', display:'flex', alignItems:'center', justifyContent:'center', cursor: canNext && !loading ? 'pointer' : 'not-allowed', transition:'all .2s', flexShrink:0 }}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="R d1" style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:40 }}>
            {CHOOSE_TYPES.map(t => (
              <button key={t} onClick={() => setChooseType(t)} className={`fp-v4${chooseType === t ? ' active' : ''}`}>{t}</button>
            ))}
          </div>

          {/* Slider viewport */}
          <div ref={containerRef} className="choose-carousel-wrap" style={{ overflow:'hidden', position:'relative', width:'100%', cursor:'grab', userSelect:'none', touchAction:'pan-y' }}>
            {loading ? (
              <div style={{ display:'flex', gap:CARD_GAP }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ minWidth:CARD_W, background:'var(--c)', border:'1.5px solid var(--bd)', borderRadius:24, overflow:'hidden', flexShrink:0 }}>
                    <div style={{ height:220, background:'var(--c2)', margin:'12px 12px 0', borderRadius:16, animation:'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ padding:'18px 20px 24px', display:'flex', flexDirection:'column', gap:10 }}>
                      {[40,80,55,100].map((w,j) => (
                        <div key={j} style={{ height: j===1 ? 24 : 10, width:`${w}%`, background:'var(--c2)', borderRadius:6, animation:'pulse 1.5s ease-in-out infinite' }} />
                      ))}
                    </div>
                  </div>
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'64px 0', color:'var(--k3)', fontFamily:"'Syne',sans-serif", fontSize:'.85rem', fontWeight:600 }}>
                No museums found for "{chooseType}"
              </div>
            ) : (
              <div ref={trackRef} style={{
                display:'flex', gap:CARD_GAP,
                transform:`translateX(-${offset}px)`,
                willChange:'transform',
              }}>
                {filtered.map((museum, i) => {
                  const cardImg = getMuseumImage(museum.name) || museum.thumbnail || museum.images?.[0] || getMuseumThumbnail(museum);
                  const isDark  = i % 4 === 1;
                  const price   = museum.ticketPrices?.adult ?? 0;
                  return (
                    <div key={museum._id} className="ccard-v4"
                      style={{ minWidth:CARD_W, maxWidth:CARD_W, flexShrink:0, ...(isDark ? { background:'var(--k)', borderColor:'var(--k)' } : {}) }}>
                      <div className="ccard-v4-img" style={{ position:'relative' }}>
                        <img src={cardImg} alt={museum.name}
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=700&q=80'; }} />
                        {isSignedIn && (
                          <button
                            onClick={e => toggleWishlist(museum._id, e)}
                            title={wishlist.includes(museum._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            style={{
                              position:'absolute', top:10, right:10,
                              width:34, height:34, borderRadius:'50%',
                              background: wishlist.includes(museum._id) ? 'rgba(229,62,62,0.92)' : 'rgba(255,255,255,0.88)',
                              border:'none', cursor:'pointer',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              boxShadow:'0 2px 8px rgba(0,0,0,.18)',
                              transition:'all .2s cubic-bezier(.16,1,.3,1)',
                              zIndex:10,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
                          >
                            <Star
                              size={16}
                              fill={wishlist.includes(museum._id) ? '#fff' : 'transparent'}
                              color={wishlist.includes(museum._id) ? '#fff' : '#E53E3E'}
                              strokeWidth={2}
                            />
                          </button>
                        )}
                      </div>
                      <div style={{ padding:'18px 20px 20px' }}>
                        <div className="ccard-v4-type" style={isDark ? { color:'var(--r)' } : {}}>{museum.type} · {museum.city}</div>
                        <div className={`ccard-v4-name${isDark ? ' ccard-v4-name-w' : ''}`}>{museum.name}</div>
                        <div className="ccard-v4-loc" style={isDark ? { color:'rgba(255,255,255,.45)' } : {}}>
                          <MapPin size={11} />{museum.city}, {museum.state}
                        </div>
                        <div style={{ marginTop:12, marginBottom:10 }}>
                          <div className="ccard-v4-price" style={isDark ? { color:'rgba(255,255,255,.5)' } : {}}>
                            {price === 0
                              ? <strong style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.4rem', color: isDark ? '#fff' : 'var(--k)' }}>FREE</strong>
                              : <>₹<strong style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'1.4rem', color: isDark ? '#fff' : 'var(--k)' }}>{price}</strong>/Person</>
                            }
                          </div>
                        </div>
                        {/* Two buttons */}
                        <div style={{ display:'flex', gap:8 }}>
                          <button
                            onClick={() => openMuseum(museum)}
                            style={{
                              flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5,
                              background:'transparent',
                              border: isDark ? '1.5px solid rgba(255,255,255,.22)' : '1.5px solid var(--bd)',
                              borderRadius:100, padding:'8px 10px',
                              fontFamily:"'Syne',sans-serif", fontSize:'.63rem', fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
                              color: isDark ? 'rgba(255,255,255,.65)' : 'var(--k3)',
                              cursor:'pointer', transition:'all .2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.55)' : 'var(--k)'; e.currentTarget.style.color = isDark ? '#fff' : 'var(--k)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,.22)' : 'var(--bd)'; e.currentTarget.style.color = isDark ? 'rgba(255,255,255,.65)' : 'var(--k3)'; }}
                          >
                            <Info size={11} /> Learn More
                          </button>
                          <button className="ccard-v4-btn"
                            style={{ flex:1, justifyContent:'center', ...(isDark ? { background:'var(--r)' } : {}) }}
                            onClick={() => bookMuseum(museum)}
                          >Book Now</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Page dots */}
          {!loading && totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:28 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => { const target = i * cardsPerPage * (CARD_W + CARD_GAP); offsetRef.current = Math.min(maxOffset, target); setOffset(offsetRef.current); }}
                  style={{ height:4, width: i === page ? 28 : 8, borderRadius:2, background: i === page ? 'var(--r)' : 'var(--bd)', border:'none', cursor:'pointer', padding:0, transition:'all .35s cubic-bezier(.16,1,.3,1)' }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map CTA */}
      <section style={{ background:'var(--c)', padding:'80px 0' }}>
        <div className="museums-cta-section" style={{ maxWidth:1360, margin:'auto', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:40 }}>
          <div className="R">
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.68rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--k3)', marginBottom:12 }}>Interactive Map</div>
            <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(2.5rem,5vw,4rem)', lineHeight:.95, color:'var(--k)', marginBottom:16 }}>
              Find Museums<br/><em style={{ color:'var(--r)', fontStyle:'normal' }}>Near You</em>
            </h2>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'.85rem', lineHeight:1.72, color:'var(--k3)', fontWeight:300, maxWidth:340 }}>
              Explore all 700+ museums on an interactive map of India — filter by state, type, or distance.
            </p>
          </div>
          <div className="RR"><button className="btn-v4-stroke" onClick={() => setShowMapModal(true)}>Open Map View</button></div>
        </div>
      </section>

      {/* Museum Detail Modal */}
      {selectedMuseum && (
        <MuseumModal museum={selectedMuseum} onClose={closeMuseum} onBook={bookMuseum} />
      )}

      {/* India Full Map Modal */}
      {showMapModal && (
        <IndiaMapModal museums={allMuseums} onClose={() => setShowMapModal(false)} />
      )}
    </MainLayout>
  );
}