import MainLayout from '../templates/MainLayout';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: [
      'Account details (name, email) when you register via Clerk authentication.',
      'Booking data — museum, date, visitor count, ticket preferences — stored securely in our database.',
      'Voice inputs when you use the AI Voice Guide feature (processed client-side via Web Speech API; not stored on our servers).',
      'Usage analytics such as pages visited and features used, to improve the platform.',
      'Device and browser metadata for security and performance monitoring.',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: [
      'To process and confirm museum ticket bookings and issue QR tickets to your dashboard.',
      'To power AI-guided recommendations personalised to your mood and preferences.',
      'To send transactional emails (booking confirmations, receipts) — never unsolicited marketing.',
      'To improve platform features, fix bugs, and enhance performance.',
      'To comply with applicable Indian laws and regulatory requirements.',
    ],
  },
  {
    title: 'Data Sharing',
    content: [
      'We do not sell your personal data to third parties — ever.',
      'We share data with Clerk (authentication), MongoDB Atlas (database hosting), and Groq (AI processing) solely to operate the service.',
      'All third-party providers are bound by data processing agreements consistent with applicable privacy regulations.',
      'We may disclose data if required by Indian law or a valid court order.',
    ],
  },
  {
    title: 'Data Security',
    content: [
      'All data is transmitted over HTTPS/TLS encryption.',
      'Authentication is handled by Clerk, a SOC 2 Type II certified provider.',
      'Sensitive fields in our database are encrypted at rest.',
      'We conduct regular security reviews and dependency audits.',
    ],
  },
  {
    title: 'Your Rights',
    content: [
      'Access: request a copy of all personal data we hold about you.',
      'Correction: request updates to inaccurate or incomplete data.',
      'Deletion: request erasure of your account and associated data.',
      'Portability: receive your data in a machine-readable format.',
      'To exercise any right, email us at musema2026@gmail.com',
    ],
  },
  {
    title: 'Cookies',
    content: [
      'We use essential cookies only — for authentication sessions and security tokens.',
      'We do not use advertising or tracking cookies.',
      'You can disable cookies in your browser, though this may affect login functionality.',
    ],
  },
  {
    title: 'Changes to this Policy',
    content: [
      'We may update this policy periodically. Material changes will be communicated via email or an in-app notice.',
      'Continued use of Musema after changes constitutes acceptance of the revised policy.',
      'The date of the last update is noted at the bottom of this page.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <style>{`
        @media(max-width:768px){
          .priv-hero  { padding: 72px 14px 56px !important; }
          .priv-body  { padding: 44px 14px 72px !important; }
          .priv-hero h1 { font-size: clamp(2rem, 9vw, 3.2rem) !important; }
          .priv-sec   { margin-bottom: 32px !important; }
        }
      `}</style>
      {/* Hero */}
      <section className="priv-hero" style={{ background: 'var(--k)', padding: '100px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: 'auto', position: 'relative', zIndex: 1 }}>

          <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(4rem,8vw,7rem)', color: '#fff', lineHeight: .9, marginBottom: 20 }}>
            Privacy<br /><span style={{ color: 'var(--r)' }}>Policy</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.72, maxWidth: 560 }}>
            Your privacy matters to us. This policy explains what data Musema collects, how we use it, and the rights you have over it.
          </p>

        </div>
      </section>

      {/* Content */}
      <section className="priv-body" style={{ background: 'var(--w)', padding: '80px 40px 100px' }}>
        <div style={{ maxWidth: 800, margin: 'auto' }}>
          {SECTIONS.map((sec, i) => (
            <div key={i} style={{ marginBottom: 52, paddingBottom: 52, borderBottom: i < SECTIONS.length - 1 ? '1px solid var(--bd)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '1.1rem', color: 'var(--r)', minWidth: 32, opacity: .5 }}>0{i + 1}</span>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--k)' }}>{sec.title}</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sec.content.map((item, j) => (
                  <li key={j} style={{ display: 'flex', gap: 12, fontSize: '.92rem', lineHeight: 1.72, color: 'var(--k3)', fontWeight: 300 }}>
                    <span style={{ color: 'var(--r)', marginTop: 8, flexShrink: 0, fontSize: '.45rem' }}>●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div style={{ background: 'var(--c)', borderRadius: 20, padding: '32px 36px', display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, background: 'var(--r)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.9rem', color: 'var(--k)', marginBottom: 4 }}>Questions about this policy?</div>
              <div style={{ fontSize: '.85rem', color: 'var(--k3)' }}>Email us at <a href="mailto:musema2026@gmail.com" style={{ color: 'var(--r)', textDecoration: 'none', fontWeight: 500 }}>musema2026@gmail.com</a> — we respond within 48 hours.</div>
            </div>
          </div>
          <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
   
            <Link to="/faq" style={{ fontFamily: "'Syne',sans-serif", fontSize: '.78rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--k3)', textDecoration: 'none' }}>FAQ →</Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}