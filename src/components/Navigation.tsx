import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedOut } from '@clerk/clerk-react';
import { ChevronDown, User, ShieldCheck } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <SignedOut>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(v => !v)}
          className="btn-nav-v4"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Sign in
          <ChevronDown size={12} style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            background: 'var(--w)', border: '1.5px solid var(--bd)',
            borderRadius: 14, boxShadow: '0 12px 40px rgba(24,21,15,.13)',
            minWidth: 210, overflow: 'hidden', zIndex: 300,
            animation: 'dropIn .2s cubic-bezier(.16,1,.3,1) both',
          }}>
            {/* User Sign In → custom /sign-in page */}
            <button
              onClick={() => { setOpen(false); navigate('/sign-in'); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--c)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--c)', border: '1.5px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={15} color="var(--k)" />
              </div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.82rem', color: 'var(--k)' }}>User Sign In</div>
                <div style={{ fontSize: '.7rem', color: 'var(--k3)', marginTop: 2 }}>Browse &amp; book museums</div>
              </div>
            </button>
            <div style={{ height: '1px', background: 'var(--bd)', margin: '0 18px' }} />
            <button
              onClick={() => { setOpen(false); navigate('/admin/login'); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--c)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#FDE8DF', border: '1.5px solid #F4C4B0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={15} color="var(--r)" />
              </div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.82rem', color: 'var(--k)' }}>Admin Sign In</div>
                <div style={{ fontSize: '.7rem', color: 'var(--k3)', marginTop: 2 }}>Manage museums &amp; bookings</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </SignedOut>
  );
};

export default Navigation;
