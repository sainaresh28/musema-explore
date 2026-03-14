import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('musema_admin_token', data.token);
      localStorage.setItem('musema_admin',       JSON.stringify(data.admin));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--k)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: "'Syne', sans-serif",
    }} className="admin-login-wrap">
      <style>{`
        @media(max-width:768px){
          .admin-login-wrap { grid-template-columns: 1fr !important; }
          .admin-login-left { display: none !important; }
          .admin-login-right { padding: 36px 20px !important; }
          .admin-login-right h1 { font-size: 2.4rem !important; }
        }
      `}</style>
      {/* Left panel */}
      <div className="admin-login-left" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px' }}>
        <img
          src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=85"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(192,57,43,0.15) 0%, rgba(24,21,15,0.95) 60%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, background: 'var(--r)', borderRadius: '50%' }} />
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '.02em' }}>Musema</span>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.58rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginLeft: 4, borderLeft: '1px solid rgba(255,255,255,.15)', paddingLeft: 12 }}>Admin Portal</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', lineHeight: 0.9, color: '#fff', marginBottom: 24 }}>
            Control<br /><span style={{ color: 'var(--r)' }}>Centre</span>
          </div>
          <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.72, maxWidth: 320, fontWeight: 300 }}>
            Manage museums, bookings, and users across India's largest cultural booking platform.
          </p>
          <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
            {[['700+', 'Museums'], ['51', 'States'], ['Live', 'Bookings']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '2rem', color: 'var(--r)', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.2)', letterSpacing: '.06em' }}>
            © {new Date().getFullYear()} Musema Pvt. Ltd. — Restricted access
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="admin-login-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--r)', marginBottom: 10 }}>Admin Access</div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '3.2rem', color: 'var(--k)', lineHeight: 0.95, margin: 0 }}>
              Sign in to<br />Dashboard
            </h1>
            <p style={{ fontSize: '.82rem', color: '#888', marginTop: 12, fontWeight: 300 }}>
              This portal is restricted to Musema staff only.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: 7 }}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@musema.in"
                required
                style={{
                  width: '100%', padding: '13px 16px', border: '1.5px solid #ddd',
                  borderRadius: 10, fontSize: '.9rem', color: 'var(--k)',
                  background: '#fff', outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'Syne', sans-serif", transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--k)'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: 7 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%', padding: '13px 16px', border: '1.5px solid #ddd',
                  borderRadius: 10, fontSize: '.9rem', color: 'var(--k)',
                  background: '#fff', outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'Syne', sans-serif", transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--k)'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {error && (
              <div style={{ background: '#fff1f0', border: '1px solid #fcc', borderRadius: 8, padding: '10px 14px', fontSize: '.8rem', color: '#c0392b', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#aaa' : 'var(--k)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '14px 24px', fontSize: '.8rem', fontWeight: 700,
                letterSpacing: '.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Syne', sans-serif", transition: 'background .2s', marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--r)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--k)'; }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 32, padding: '14px 16px', background: '#fff8f6', border: '1px solid #fde8e4', borderRadius: 10 }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#c0392b', marginBottom: 5 }}>🔒 Restricted Portal</div>
            <p style={{ fontSize: '.75rem', color: '#888', lineHeight: 1.6, margin: 0 }}>
              No sign-up available. Credentials are provisioned by Musema IT. Contact your administrator for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}