import { useState } from 'react';
import MainLayout from '../templates/MainLayout';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    category: 'Booking & Tickets',
    items: [
      { q: 'How do I book a museum ticket?', a: 'You can book in two ways: use our AI chatbot for a guided 8-step conversational flow, or visit any museum page and fill the booking form directly. Both deliver an instant QR ticket to your dashboard.' },
      { q: 'Can I book tickets for multiple visitors?', a: 'Yes. During the booking flow you can specify the number of adults, children, and senior citizens separately. Pricing adjusts automatically based on museum policies.' },
      { q: 'How do I receive my ticket?', a: 'Your QR ticket is delivered instantly to your Musema Dashboard. You can access it any time from the "My Bookings" section — no printing required, just scan at the gate.' },
      { q: 'Can I cancel or reschedule a booking?', a: 'Cancellation and rescheduling policies vary by museum. Check the individual museum page for their policy. To initiate, go to Dashboard → My Bookings and select the relevant booking.' },
      { q: 'Is there a booking fee?', a: 'Musema does not charge a platform fee. You pay the museum\'s published ticket price. Any applicable taxes are included in the displayed price.' },
    ],
  },
  {
    category: 'AI Features',
    items: [
      { q: 'What is the AI Museum Guide?', a: 'It\'s a conversational AI powered by Groq\'s LLaMA model that helps you discover museums, answer questions about exhibits, hours, and prices, and guide you through booking — all in natural language.' },
      { q: 'Does the AI support voice interaction?', a: 'Yes. Click the mic icon in the chatbot header to enter continuous voice conversation mode, or hold the mic button for push-to-talk. The AI also speaks responses aloud via text-to-speech (Chrome/Edge recommended).' },
      { q: 'What is Emotion AI?', a: 'Musema analyses the tone and sentiment of your conversation to gauge your mood — curious, adventurous, scholarly, family-oriented — and personalises museum recommendations accordingly.' },
      { q: 'Can the AI book for any museum in India?', a: 'Yes. Beyond our 38 seeded museums, the AI can fetch information and process bookings for 700+ museums across India by querying live data and Wikipedia context via Groq.' },
      { q: 'Is the AI information always accurate?', a: 'The AI is highly accurate but not infallible. For critical details (admission prices, opening hours on holidays), we recommend verifying directly with the museum.' },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      { q: 'How is my account secured?', a: 'Authentication is handled by Clerk, a SOC 2 Type II certified provider. All data is transmitted over HTTPS and sensitive fields are encrypted at rest.' },
      { q: 'Can I use Musema without an account?', a: 'You can browse museums, view exhibitions, and chat with the AI guide without an account. Booking tickets requires sign-in to associate QR tickets with your dashboard.' },
      { q: 'How do I delete my account?', a: 'Go to your account settings and select "Delete Account". This permanently removes all your personal data and booking history. This action is irreversible.' },
      { q: 'What data does Musema store about me?', a: 'We store your name, email, booking history, and preferences. We do not store voice recordings or payment card details. See our Privacy Policy for full details.' },
    ],
  },
  {
    category: 'Museums & Availability',
    items: [
      { q: 'How many museums are available?', a: 'Musema covers 700+ museums across all 28 states of India. 38 flagship museums have full details and Unsplash photo galleries; all others are powered by live AI lookups.' },
      { q: 'Why can\'t I find a specific museum?', a: 'Try searching by city or partial name on the Museums page. If it\'s a lesser-known institution, use the AI chatbot — it can look up any Indian museum in real time.' },
      { q: 'Do museums update their own information?', a: 'Core museum data (hours, pricing, contact) is maintained by the Musema team. For the most current details during holidays or special events, always check the museum\'s official website.' },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen(prev => prev === id ? null : id);

  return (
    <MainLayout>
      <style>{`
        @media(max-width:768px) {
          .faq-hero-sec { padding: 72px 16px 48px !important; }
          .faq-hero-sec h1 { font-size: clamp(2.8rem,10vw,5rem) !important; margin-bottom: 14px !important; }
          .faq-hero-sec p { font-size: .88rem !important; max-width: 100% !important; }
          .faq-body { padding: 32px 16px 60px !important; }
          .faq-category-label { font-size: .7rem !important; margin: 28px 0 14px !important; }
          .faq-item { padding: 16px !important; border-radius: 14px !important; margin-bottom: 8px !important; }
          .faq-item-q { font-size: .86rem !important; }
          .faq-item-a { font-size: .82rem !important; padding-top: 10px !important; }
        }
        @media(max-width:480px) {
          .faq-hero-sec { padding: 56px 12px 36px !important; }
          .faq-hero-sec h1 { font-size: clamp(2.4rem,9vw,3.8rem) !important; }
        }
      `}</style>
      {/* Hero */}
      <section className="faq-hero-sec" style={{ background: 'var(--k)', padding: '100px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: 'auto', position: 'relative', zIndex: 1 }}>

          <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 'clamp(4rem,8vw,7rem)', color: '#fff', lineHeight: .9, marginBottom: 20 }}>
            Frequently<br /><span style={{ color: 'var(--r)' }}>Asked</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.72, maxWidth: 560 }}>
            Everything you need to know about Musema — from booking tickets to AI features and account security.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-body" style={{ background: 'var(--w)', padding: '80px 40px 100px' }}>
        <div style={{ maxWidth: 800, margin: 'auto' }}>
          {FAQS.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 56 }}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 32, height: 2, background: 'var(--r)' }} />
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.7rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--r)' }}>{cat.category}</span>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {cat.items.map((item, ii) => {
                  const id = `${ci}-${ii}`;
                  const isOpen = open === id;
                  return (
                    <div
                      key={ii}
                      style={{
                        border: '1.5px solid',
                        borderColor: isOpen ? 'var(--r)' : 'var(--bd)',
                        borderRadius: 14,
                        overflow: 'hidden',
                        transition: 'border-color .2s',
                        background: isOpen ? 'var(--w)' : 'var(--c)',
                      }}
                    >
                      <button
                        onClick={() => toggle(id)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '20px 24px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                          background: 'none', border: 'none', cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: '.92rem', fontWeight: 600, color: 'var(--k)', lineHeight: 1.4 }}>{item.q}</span>
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: isOpen ? 'var(--r)' : 'var(--bd)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background .2s, transform .3s',
                          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 2v8M2 6h8" stroke={isOpen ? '#fff' : 'var(--k3)'} strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 24px 20px', fontSize: '.9rem', lineHeight: 1.75, color: 'var(--k3)', fontWeight: 300 }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Still need help */}
          <div style={{ background: 'var(--k)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '2.8rem', color: '#fff', lineHeight: 1, marginBottom: 12 }}>
                Still have <span style={{ color: 'var(--r)' }}>questions?</span>
              </div>
              <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.45)', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
                Our team is happy to help. Or ask our AI guide — it's available 24/7.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--r)', color: '#fff', fontFamily: "'Syne',sans-serif", fontSize: '.75rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '14px 28px', borderRadius: 100, textDecoration: 'none', transition: 'opacity .2s' }}>
                  Contact Us
                </Link>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontFamily: "'Syne',sans-serif", fontSize: '.75rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '14px 28px', borderRadius: 100, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.15)' }}>
                  Open AI Guide
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </MainLayout>
  );
}