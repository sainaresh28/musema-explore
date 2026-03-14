import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import ProtectedRoute    from './ProtectedRoute';
import AdminRoute        from './AdminRoute';
import Home              from '../pages/Home';
import Museums           from '../pages/Museums';
import Exhibitions       from '../pages/Exhibitions';
import About             from '../pages/About';
import Contact           from '../pages/Contact';
import MuseumDetail      from '../pages/MuseumDetail';
import Dashboard         from '../pages/Dashboard';
import PaymentPage       from '../pages/Payment';
import NotFound          from '../pages/NotFound';
import PrivacyPolicy     from '../pages/PrivacyPolicy';
import FAQ               from '../pages/FAQ';
import AdminLogin        from '../pages/admin/AdminLogin';
import AdminDashboard    from '../pages/admin/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const MUSEUM_IMGS = [
  'https://images.unsplash.com/photo-1558431382-9b06d0507edc?w=900&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=80',
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&q=80',
  'https://images.unsplash.com/photo-1664863988713-aaa4219e3064?w=900&q=80',
];

const AuthLayout = ({ children, mode }: { children: React.ReactNode; mode: 'in' | 'up' }) => {
  const img = MUSEUM_IMGS[mode === 'in' ? 0 : 2];
  return (
    <div className="auth-layout-root" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--k)' }}>
      <style>{`
        @media(max-width:768px) {
          .auth-layout-root { grid-template-columns: 1fr !important; }
          .auth-left-panel { display: none !important; }
          .auth-right-panel { padding: 40px 20px !important; }
        }
      `}</style>
      <div className="auth-left-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px' }}>
        <img src={img} alt="Museum" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(24,21,15,.3) 0%, rgba(24,21,15,.9) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.8rem', color: '#fff', letterSpacing: '.02em' }}>Musema</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(4rem,7vw,6.5rem)', lineHeight: .88, color: '#fff', marginBottom: 20 }}>
            India's<br /><span style={{ color: 'var(--r)' }}>700+</span><br />Museums
          </div>
          <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.7, maxWidth: 340, fontWeight: 300 }}>
            {mode === 'in' ? 'Welcome back. Your AI-guided museum journey continues.' : "Join explorers discovering India's extraordinary cultural heritage."}
          </p>
          <div style={{ display: 'flex', gap: 20, marginTop: 32 }}>
            {[{ n: '700+', l: 'Museums' }, { n: '1M+', l: 'Visitors' }, { n: '4.9★', l: 'Rating' }].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '1.8rem', color: 'var(--r)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', fontStyle: 'italic', color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>
            "Culture is the widening of the mind and of the spirit."<br />
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.65rem', fontStyle: 'normal', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 8, display: 'block' }}>— Jawaharlal Nehru</span>
          </p>
        </div>
      </div>
      <div className="auth-right-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c)', padding: '40px 20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--r)', marginBottom: 8 }}>
              {mode === 'in' ? 'Welcome Back' : 'Get Started Free'}
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '3rem', color: 'var(--k)', lineHeight: .95 }}>
              {mode === 'in' ? 'Sign in to\nyour account' : 'Create your\nMusema account'}
            </h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/sign-in/*"      element={<AuthLayout mode="in"><SignIn  routing="path" path="/sign-in"  signUpUrl="/sign-up" fallbackRedirectUrl="/museums" /></AuthLayout>} />
      <Route path="/sign-up/*"      element={<AuthLayout mode="up"><SignUp  routing="path" path="/sign-up"  signInUrl="/sign-in" /></AuthLayout>} />
      <Route path="/admin/login"     element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/"           element={<Home />} />
      <Route path="/museums"    element={<Museums />} />
      <Route path="/exhibitions" element={<Exhibitions />} />
      <Route path="/about"      element={<About />} />
      <Route path="/contact"    element={<Contact />} />
      <Route path="/museum/:id" element={<MuseumDetail />} />
      <Route path="/privacy"    element={<PrivacyPolicy />} />
      <Route path="/faq"        element={<FAQ />} />
      <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/payment"    element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="*"           element={<NotFound />} />
    </Routes>
  </>
);

export default AppRoutes;