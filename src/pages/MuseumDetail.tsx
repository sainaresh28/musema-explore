import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useMuseum } from '../hooks/useMuseums';
import { bookingApi } from '../api';
import { getMuseumImage } from '../utils/museumImages';
import MainLayout from '../templates/MainLayout';
import { MapPin, Clock, Star, Minus, Plus, CheckCircle, X, ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { TIME_SLOTS } from '../utils/constants';

export default function MuseumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { museum, loading } = useMuseum(id!);

  const [visitDate, setVisitDate]   = useState('');
  const [timeSlot, setTimeSlot]     = useState('');
  const [adultTix, setAdultTix]     = useState(1);
  const [childTix, setChildTix]     = useState(0);
  const [seniorTix, setSeniorTix]   = useState(0);
  const [studentTix, setStudentTix] = useState(0);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [special, setSpecial]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR]         = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [activeImg, setActiveImg]   = useState(0);

  useEffect(() => {
    if (user) { setName(user.fullName||''); setEmail(user.primaryEmailAddress?.emailAddress||''); }
  }, [user]);

  const prices = museum?.ticketPrices || { adult:0, child:0, senior:0, student:0 };
  const total  = adultTix*prices.adult + childTix*prices.child + seniorTix*prices.senior + studentTix*prices.student;

  const handleBook = async () => {
    if (!visitDate || !timeSlot || !name || !email || !phone) { toast.error('Please fill in all required fields'); return; }
    if (total===0) { toast.error('Please select at least one ticket'); return; }
    setSubmitting(true);
    try {
      const data = await bookingApi.create({
        museumId:museum!._id, visitDate, timeSlot,
        adultTickets:adultTix, childTickets:childTix, seniorTickets:seniorTix, studentTickets:studentTix,
        visitorName:name, visitorEmail:email, visitorPhone:phone, specialRequirements:special
      });
      setBookingRef(data.booking.bookingReference);
      setShowQR(true);
      toast.success('Booking confirmed!');
    } catch(err:any) { toast.error(err.message||'Booking failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <MainLayout showBack>
      <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:40,height:40,border:'2.5px solid var(--bd)',borderTopColor:'var(--r)',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px' }} />
          <p style={{ fontFamily:"'Syne',sans-serif",fontSize:'.8rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--k3)' }}>Loading museum…</p>
        </div>
      </div>
    </MainLayout>
  );

  if (!museum) return (
    <MainLayout showBack>
      <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center' }}>
        <div>
          <div style={{ marginBottom:16, display:'flex', justifyContent:'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--bd)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg></div>
          <h2 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2.5rem',color:'var(--k)',marginBottom:8 }}>Museum Not Found</h2>
          <button className="btn-v4-fill" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </MainLayout>
  );

  const TixRow = ({ label, count, set, price }: { label:string; count:number; set:(n:number)=>void; price:number }) => (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid var(--bd)' }}>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.82rem',fontWeight:600,color:'var(--k)' }}>{label}</div>
        <div style={{ fontSize:'.72rem',color:'var(--k3)',marginTop:2 }}>₹{price} per person</div>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:12 }}>
        <button onClick={() => set(Math.max(0,count-1))} style={{ width:30,height:30,borderRadius:'50%',border:'1.5px solid var(--bd)',background:'var(--c)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'border-color .2s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--k)'}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--bd)'}}>
          <Minus size={12} />
        </button>
        <span style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'1.4rem',color:'var(--k)',width:24,textAlign:'center',lineHeight:1 }}>{count}</span>
        <button onClick={() => set(count+1)} style={{ width:30,height:30,borderRadius:'50%',border:'1.5px solid var(--bd)',background:'var(--c)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'border-color .2s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--k)'}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='var(--bd)'}}>
          <Plus size={12} />
        </button>
      </div>
    </div>
  );

  const namedImg = getMuseumImage(museum.name);
  const imgs = namedImg ? [namedImg, namedImg, namedImg] : (museum.images?.length ? museum.images : ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80']);

  return (
    <MainLayout showBack>
      <style>{`
        @media(max-width:768px) {
          .mdetail-hero { height: 280px !important; }
          .mdetail-hero-thumbs { display: none !important; }
          .mdetail-hero-overlay { padding: 16px !important; }
          .mdetail-hero-overlay h1 { font-size: clamp(1.6rem,6vw,2.2rem) !important; line-height: 1.1 !important; }
          .mdetail-hero-meta { flex-wrap: wrap !important; gap: 8px !important; }
          .mdetail-layout { grid-template-columns: 1fr !important; gap: 24px !important; padding: 24px 16px 60px !important; }
          .mdetail-img-grid { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .mdetail-info-grid { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .mdetail-sidebar { position: static !important; }
          .mdetail-book-box { padding: 20px 16px !important; }
          .mdetail-ticket-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .mdetail-section { padding: 20px 0 !important; }
          .mdetail-booking-modal { padding: 20px 16px !important; max-width: 100% !important; border-radius: 20px 20px 0 0 !important; }
        }
        @media(max-width:480px) {
          .mdetail-hero { height: 220px !important; }
          .mdetail-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ background:'var(--c)' }}>

        {/* ── HERO IMAGE GALLERY ── */}
        <div className="mdetail-hero" style={{ position:'relative', height:480, overflow:'hidden', background:'var(--k)' }}>
          <img src={imgs[activeImg]} alt={museum.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'opacity .4s' }}
            onError={e => { (e.currentTarget as HTMLImageElement).src='https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80'; }} />
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(24,21,15,.8))' }} />
          {/* Thumbnails */}
          {imgs.length > 1 && (
            <div style={{ position:'absolute',bottom:20,left:40,display:'flex',gap:8 }}>
              {imgs.slice(0,4).map((_,i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  style={{ width:i===activeImg?48:36,height:6,borderRadius:4,background:i===activeImg?'#fff':'rgba(255,255,255,.4)',border:'none',cursor:'pointer',transition:'all .2s' }} />
              ))}
            </div>
          )}
          {/* Museum info overlay */}
          <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'32px 40px',maxWidth:1360,margin:'0 auto' }}>
            <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:24 }}>
              <div>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                  <span style={{ background:'rgba(201,78,28,.9)',borderRadius:8,padding:'4px 12px',fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'#fff' }}>{museum.type}</span>
                  {museum.establishedYear && <span style={{ fontFamily:"'Syne',sans-serif",fontSize:'.7rem',color:'rgba(255,255,255,.5)' }}>Est. {museum.establishedYear}</span>}
                </div>
                <h1 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(2.5rem,5vw,4.5rem)',color:'#fff',lineHeight:.92,letterSpacing:'.02em',marginBottom:10 }}>{museum.name}</h1>
                <div style={{ display:'flex',alignItems:'center',gap:6,color:'rgba(255,255,255,.6)',fontSize:'.82rem' }}>
                  <MapPin size={13} />{museum.address}, {museum.city}, {museum.state}
                </div>
              </div>
              {museum.rating && (
                <div style={{ flexShrink:0,display:'flex',alignItems:'center',gap:8,background:'rgba(24,21,15,.7)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,padding:'10px 18px' }}>
                  <Star size={14} style={{ color:'#F59E0B',fill:'#F59E0B' }} />
                  <span style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'1.4rem',color:'#fff',lineHeight:1 }}>{museum.rating.toFixed(1)}</span>
                  {museum.totalReviews>0 && <span style={{ fontSize:'.72rem',color:'rgba(255,255,255,.45)' }}>({museum.totalReviews.toLocaleString()})</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ maxWidth:1360,margin:'auto',padding:'48px 40px' }}>
          <div className="mdetail-layout" style={{ display:'grid',gridTemplateColumns:'1fr 380px',gap:48,alignItems:'start' }}>

            {/* ── LEFT: Info ── */}
            <div style={{ display:'flex',flexDirection:'column',gap:40 }}>

              {/* About */}
              {museum.description && (
                <section>
                  <h2 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2rem',letterSpacing:'.03em',color:'var(--k)',marginBottom:14 }}>About</h2>
                  <p style={{ fontSize:'.95rem',lineHeight:1.78,color:'var(--k3)',fontWeight:300 }}>{museum.description}</p>
                </section>
              )}

              {/* Ticket prices */}
              <section>
                <h2 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2rem',letterSpacing:'.03em',color:'var(--k)',marginBottom:14 }}>Ticket Prices</h2>
                <div className="mdetail-img-grid" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
                  {[{l:'Adult',p:prices.adult},{l:'Child',p:prices.child},{l:'Senior',p:prices.senior},{l:'Student',p:prices.student}].map(({l,p}) => (
                    <div key={l} style={{ textAlign:'center',padding:'16px 12px',background:'var(--w)',border:'1.5px solid var(--bd)',borderRadius:16 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.62rem',fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--k3)',marginBottom:6 }}>{l}</div>
                      <div style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'1.8rem',color:p===0?'#2ECC71':'var(--k)',lineHeight:1 }}>
                        {p===0?'Free':`₹${p}`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Facilities */}
              {museum.facilities?.length>0 && (
                <section>
                  <h2 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2rem',letterSpacing:'.03em',color:'var(--k)',marginBottom:14 }}>Facilities</h2>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:10 }}>
                    {museum.facilities.map((f: string) => (
                      <span key={f} style={{ display:'flex',alignItems:'center',gap:7,background:'var(--w)',border:'1.5px solid var(--bd)',borderRadius:100,padding:'7px 16px',fontFamily:"'Syne',sans-serif",fontSize:'.72rem',fontWeight:600,color:'var(--k2)' }}>
                        <CheckCircle size={12} style={{ color:'#2ECC71' }} />{f}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Opening hours info */}
              {museum.openingHours && (
                <section>
                  <h2 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2rem',letterSpacing:'.03em',color:'var(--k)',marginBottom:14 }}>Opening Hours</h2>
                  <div style={{ display:'flex',alignItems:'center',gap:10,background:'var(--w)',border:'1.5px solid var(--bd)',borderRadius:16,padding:'16px 20px' }}>
                    <Clock size={16} style={{ color:'var(--r)',flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:'.88rem',fontWeight:600,color:'var(--k)' }}>{museum.openingHours}</div>
                      {museum.closedOn && <div style={{ fontSize:'.75rem',color:'var(--k3)',marginTop:2 }}>Closed: {museum.closedOn}</div>}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* ── RIGHT: Booking Panel ── */}
            <div style={{ position:'sticky',top:88 }}>
              <div style={{ background:'var(--w)',border:'1.5px solid var(--bd)',borderRadius:24,overflow:'hidden',boxShadow:'0 8px 32px rgba(24,21,15,.08)' }}>
                {/* Panel header */}
                <div style={{ background:'var(--k)',padding:'20px 24px' }}>
                  <h3 style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'1.5rem',letterSpacing:'.04em',color:'#fff',marginBottom:2 }}>Book Tickets</h3>
                  <p style={{ fontFamily:"'Syne',sans-serif",fontSize:'.65rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.4)' }}>Instant confirmation · Digital QR</p>
                </div>

                <div style={{ padding:'20px 24px',display:'flex',flexDirection:'column',gap:16 }}>

                  {/* Date */}
                  <div>
                    <label style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--k3)',display:'block',marginBottom:6 }}>Visit Date *</label>
                    <input type="date" value={visitDate} onChange={e=>setVisitDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                      className="cp-input-v4" style={{ width:'100%',borderRadius:12,padding:'10px 14px' }} />
                  </div>

                  {/* Time */}
                  <div>
                    <label style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--k3)',display:'block',marginBottom:6 }}>Time Slot *</label>
                    <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)} className="cp-input-v4" style={{ width:'100%',borderRadius:12,padding:'10px 14px',cursor:'pointer' }}>
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Tickets */}
                  <div>
                    <label style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--k3)',display:'block',marginBottom:6 }}>Tickets</label>
                    <div style={{ background:'var(--c)',border:'1.5px solid var(--bd)',borderRadius:16,padding:'0 16px' }}>
                      <TixRow label="Adult"   count={adultTix}   set={setAdultTix}   price={prices.adult}   />
                      <TixRow label="Child"   count={childTix}   set={setChildTix}   price={prices.child}   />
                      <TixRow label="Senior"  count={seniorTix}  set={setSeniorTix}  price={prices.senior}  />
                      <TixRow label="Student" count={studentTix} set={setStudentTix} price={prices.student} />
                    </div>
                  </div>

                  {/* Visitor info */}
                  <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                    <label style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--k3)' }}>Visitor Info</label>
                    <input placeholder="Full Name *" value={name} onChange={e=>setName(e.target.value)} className="cp-input-v4" style={{ borderRadius:12,padding:'10px 14px' }} />
                    <input type="email" placeholder="Email *" value={email} onChange={e=>setEmail(e.target.value)} className="cp-input-v4" style={{ borderRadius:12,padding:'10px 14px' }} />
                    <input placeholder="Phone *" value={phone} onChange={e=>setPhone(e.target.value)} className="cp-input-v4" style={{ borderRadius:12,padding:'10px 14px' }} />
                    <textarea placeholder="Special requirements (optional)" value={special} onChange={e=>setSpecial(e.target.value)}
                      className="cp-input-v4" style={{ borderRadius:12,padding:'10px 14px',resize:'none',height:64 }} />
                  </div>

                  {/* Total */}
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:'var(--c)',borderRadius:14,border:'1.5px solid var(--bd)' }}>
                    <span style={{ fontFamily:"'Syne',sans-serif",fontSize:'.75rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--k3)' }}>Total Amount</span>
                    <span style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2rem',color:'var(--k)',lineHeight:1 }}>₹{total}</span>
                  </div>

                  {/* Book button */}
                  <button className="btn-v4-fill" style={{ width:'100%',justifyContent:'center',padding:'14px 0',fontSize:'.82rem' }}
                    onClick={handleBook} disabled={submitting || total===0}>
                    {submitting ? (
                      <span style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 1s linear infinite' }} />
                        Processing…
                      </span>
                    ) : `Confirm Booking — ₹${total}`}
                  </button>
                  <p style={{ textAlign:'center',fontFamily:"'Syne',sans-serif",fontSize:'.62rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--k3)' }}>
                    Instant confirmation · No hidden fees
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QR MODAL ── */}
      {showQR && (
        <div onClick={() => setShowQR(false)} style={{ position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(24,21,15,.6)',backdropFilter:'blur(12px)' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'var(--w)',border:'1.5px solid var(--bd)',borderRadius:28,maxWidth:400,width:'100%',overflow:'hidden',boxShadow:'0 32px 80px rgba(24,21,15,.3)' }}>
            <div style={{ background:'var(--k)',padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'1.8rem',color:'#fff',letterSpacing:'.04em',lineHeight:1 }}>Booking Confirmed!</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.65rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginTop:4 }}>Show QR at museum entrance</div>
              </div>
              <button onClick={() => setShowQR(false)} style={{ width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,.6)' }}><X size={15} /></button>
            </div>
            <div style={{ padding:'28px 24px',display:'flex',flexDirection:'column',alignItems:'center',gap:20 }}>
              <div style={{ padding:16,background:'#fff',border:'1.5px solid var(--bd)',borderRadius:16 }}>
                <QRCode value={JSON.stringify({ ref:bookingRef, museum:museum.name, visitDate, timeSlot, visitor:name })} size={156} />
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.6rem',fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--k3)',marginBottom:4 }}>Reference</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive",fontSize:'2.4rem',color:'var(--r)',letterSpacing:'.04em' }}>{bookingRef}</div>
              </div>
              <div style={{ width:'100%',background:'var(--c)',border:'1.5px solid var(--bd)',borderRadius:14,padding:'14px 18px',display:'flex',flexDirection:'column',gap:8 }}>
                {[['Museum',museum.name],['Date',visitDate],['Time',timeSlot],['Total',`₹${total}`]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex',justifyContent:'space-between' }}>
                    <span style={{ fontSize:'.78rem',color:'var(--k3)' }}>{l}</span>
                    <span style={{ fontSize:'.82rem',fontWeight:600,color:'var(--k)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',gap:10,width:'100%' }}>
                <button className="btn-v4-stroke" style={{ flex:1,justifyContent:'center' }} onClick={() => setShowQR(false)}>Close</button>
                <button className="btn-v4-fill" style={{ flex:1,justifyContent:'center' }} onClick={() => navigate('/dashboard')}>
                  My Dashboard <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}