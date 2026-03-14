import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import MuseumChatbot from '../components/MuseumChatbot';
import Navigation from '../components/Navigation';

interface Props { children: ReactNode; showBack?: boolean; }

export default function MainLayout({ children, showBack }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
    const observeAll = () => { document.querySelectorAll('.R,.RL,.RR,.RS').forEach(el => io.observe(el)); };
    observeAll();
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home',        to: '/',            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: 'Museums',     to: '/museums',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg> },
    { label: 'Exhibitions', to: '/exhibitions', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
    { label: 'About',       to: '/about',       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'Contact',     to: '/contact',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ── */}
      <nav className="nav-v4">
        <div className="nav-v4-w">
          <Link to="/" className="nav-v4-logo">
            <img src="/musema.png" alt="Musema"
              style={{ height: 34, width: 'auto', objectFit: 'contain', display: 'block' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <span className="nav-v4-name">Musema</span>
          </Link>

          <div className="nav-v4-links">
            {showBack
              ? <Link to="/" className="nav-v4-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>Back
                </Link>
              : <>
                  {navLinks.map(l => (
                    <Link key={l.to} to={l.to} className={`nav-v4-link${location.pathname === l.to ? ' active' : ''}`}>{l.label}</Link>
                  ))}
                  <SignedIn>
                    <Link to="/dashboard" className={`nav-v4-link${location.pathname === '/dashboard' ? ' active' : ''}`}>Dashboard</Link>
                  </SignedIn>
                </>
            }
          </div>

          {/* Right controls — desktop only shows UserButton, mobile shows hamburger */}
          <div className="nav-right">
            <Navigation />
            <SignedIn>
              <div className="nav-avatar-desktop">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <button
              className={`mob-menu-btn${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            ><span /><span /><span /></button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {mobileOpen && <div className="mob-drawer-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ── MOBILE DRAWER ── */}
      <div className={`mob-nav-drawer${mobileOpen ? ' open' : ''}`}>
        <SignedIn>
          <div className="mob-user-row">
            <UserButton afterSignOutUrl="/" />
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.85rem', color: 'var(--k)' }}>My Account</div>
              <div style={{ fontSize: '.72rem', color: 'var(--k3)', marginTop: 1 }}>Signed in</div>
            </div>
          </div>
          <div className="mob-nav-divider" />
        </SignedIn>

        {showBack
          ? <Link to="/" className="mob-nav-link" onClick={() => setMobileOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>Back to Home
            </Link>
          : <>
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className={`mob-nav-link${location.pathname === l.to ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                  {l.icon}{l.label}
                </Link>
              ))}
              <SignedIn>
                <Link to="/dashboard" className={`mob-nav-link${location.pathname === '/dashboard' ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Dashboard
                </Link>
              </SignedIn>
            </>
        }

        <div className="mob-nav-divider" />

        <SignedOut>
          <Link to="/sign-in" className="mob-nav-link mob-signin-btn" onClick={() => setMobileOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>User Sign In
          </Link>
          <button className="mob-admin-btn" onClick={() => { setMobileOpen(false); navigate('/admin/login'); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Admin Sign In
          </button>
        </SignedOut>

        <div style={{ padding: '10px 12px 4px', fontSize: '.62rem', color: 'var(--k3)', fontFamily: "'Syne',sans-serif", fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>India's Museum Explorer</div>
      </div>

      {/* Spacer to push content below fixed navbar */}
      <div className="nav-spacer" />

      <main style={{ flex: 1 }}>{children}</main>

      {/* ── FOOTER ── */}
      <footer className="foot-v4">
        <div className="foot-inner">
          <div className="foot-v4-cols">
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.7rem', color: '#fff', marginBottom: 14 }}>Musema</div>
              <p style={{ fontSize: '.88rem', lineHeight: 1.7, color: 'rgba(255,255,255,.3)', fontWeight: 300, maxWidth: 260 }}>
                India's museum explorer. Discover, book, and experience 700+ museums with AI-guided tours and instant QR ticketing.
              </p>
            </div>
            {[
              { title: 'Explore',  links: [{ label: 'Museums', to: '/museums' }, { label: 'Exhibitions', to: '/exhibitions' }, { label: 'Dashboard', to: '/dashboard' }, { label: 'Book Tickets', to: '/museums' }] },
              { title: 'Features', links: [{ label: 'AI Chatbot', to: '/' }, { label: 'Voice Guide', to: '/' }, { label: 'Emotion AI', to: '/' }, { label: 'QR Tickets', to: '/dashboard' }] },
              { title: 'Company',  links: [{ label: 'About', to: '/about' }, { label: 'Contact', to: '/contact' }, { label: 'Privacy Policy', to: '/privacy' }, { label: 'FAQ', to: '/faq' }] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.75rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 14 }}>{col.title}</div>
                {col.links.map(l => <Link key={l.label} to={l.to} className="flink-v4">{l.label}</Link>)}
              </div>
            ))}
          </div>
          <div className="foot-copy">
            <span>© 2026 Musema. All rights reserved.</span>
            <span className="foot-tagline">made with ❤︎ by Sai Naresh</span>
          </div>
        </div>
      </footer>

      <MuseumChatbot />
    </div>
  );
}