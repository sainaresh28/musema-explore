import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ── Tiny bar chart ────────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { _id: string; count: number; revenue?: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
      {data.slice(-14).map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div
            style={{
              width: '100%', background: 'var(--r)',
              height: `${(d.count / max) * 52}px`,
              borderRadius: '3px 3px 0 0', minHeight: 3,
              opacity: 0.7 + (i / data.length) * 0.3,
              transition: 'height .4s ease',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: '#edfbf2', color: '#1a7340', label: 'Confirmed' },
  cancelled: { bg: '#fff1f0', color: '#c0392b', label: 'Cancelled' },
  completed: { bg: '#eef2ff', color: '#3730a3', label: 'Completed' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] || { bg: '#f0f0f0', color: '#666', label: status };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: 100,
      fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
      fontFamily: "'Syne', sans-serif",
    }}>{cfg.label}</span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? 'var(--k)' : '#fff',
      border: `1.5px solid ${accent ? 'var(--k)' : 'var(--bd)'}`,
      borderRadius: 16, padding: '22px 24px',
    }}>
      <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: accent ? 'rgba(255,255,255,.45)' : 'var(--k3)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '2.4rem', color: accent ? '#fff' : 'var(--k)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: '.72rem', color: accent ? 'rgba(255,255,255,.35)' : 'var(--k3)', fontWeight: 300 }}>{sub}</div>}
    </div>
  );
}

// ── Search input ──────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '9px 14px', border: '1.5px solid var(--bd)', borderRadius: 10,
        fontSize: '.8rem', color: 'var(--k)', background: '#fff', outline: 'none',
        fontFamily: "'Syne', sans-serif", width: 260,
      }}
    />
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(24,21,15,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px', maxWidth: 400, width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}>
        <div style={{ fontSize: '.95rem', color: 'var(--k)', fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>{msg}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '9px 20px', border: '1.5px solid var(--bd)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '.78rem', fontWeight: 700 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: 'var(--r)', color: '#fff', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '.78rem', fontWeight: 700 }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'bookings' | 'users' | 'museums';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview',  icon: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z' },
  { key: 'bookings', label: 'Bookings',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { key: 'users',    label: 'Users',     icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 2a4 4 0 014 4v2m-4-6a4 4 0 100-8 4 4 0 000 8z' },
  { key: 'museums',  label: 'Museums',   icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [admin, setAdmin]         = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('musema_admin');
    if (!stored) { navigate('/admin/login'); return; }
    setAdmin(JSON.parse(stored));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('musema_admin_token');
    localStorage.removeItem('musema_admin');
    navigate('/admin/login');
  };

  

  if (!admin) return null;

  const S: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    background: '#f5f3ef',
    minHeight: '100vh',
  };

  return (
    <div className="admin-layout" style={{ ...S, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&display=swap');
        :root { --k:#18150f; --r:#C0392B; --k3:#7a7570; --bd:#e5e2db; --c:#faf8f4; --w:#fff; }
        * { box-sizing: border-box; margin: 0; }
        table { border-collapse: collapse; width: 100%; }
        th { text-align: left; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 3px; }
        .tab-btn:hover { background: var(--c) !important; }
        .row-hover:hover { background: #faf8f4 !important; }
        .action-btn:hover { opacity: .75 !important; }

        /* ── Admin Desktop slim sidebar (900px) ── */
        @media(max-width:900px) {
          .admin-sidebar { width: 64px !important; }
          .admin-sidebar-label, .admin-sidebar-text, .admin-portal-label { display: none !important; }
          .admin-sidebar-logo { justify-content: center !important; padding: 20px 12px !important; }
          .admin-sidebar-logo span { display: none !important; }
          .admin-sidebar-logo div { margin: 0 !important; }
          .admin-tab-btn { justify-content: center !important; padding: 14px 8px !important; }
          .admin-main { margin-left: 64px !important; }
        }

        /* ── Admin Mobile — hamburger drawer ── */
        @media(max-width:768px) {
          .admin-layout { flex-direction: column !important; }

          /* Fixed top navbar */
          .admin-sidebar {
            width: 100% !important; height: 56px !important; min-height: unset !important;
            position: fixed !important; top: 0 !important; left: 0 !important;
            flex-direction: row !important; align-items: center !important;
            z-index: 300 !important; overflow: visible !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,.1) !important;
            padding: 0 16px !important; justify-content: space-between !important;
          }

          /* Hide desktop logo & nav & footer inside sidebar */
          .admin-sidebar-logo { display: none !important; }
          .admin-sidebar-footer { display: none !important; }
          .admin-sidebar-nav { display: none !important; }

          /* Show mobile header section */
          .admin-mobile-header {
            display: flex !important; align-items: center !important;
            gap: 8px !important;
          }

          /* Hamburger button */
          .admin-hamburger {
            display: flex !important; align-items: center !important; justify-content: center !important;
            width: 40px !important; height: 40px !important;
            background: rgba(255,255,255,.08) !important; border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 8px !important; cursor: pointer !important; color: #fff !important;
            flex-shrink: 0 !important;
          }

          /* Drawer overlay */
          .admin-drawer-overlay {
            display: block !important; position: fixed !important;
            inset: 0 !important; background: rgba(0,0,0,.5) !important;
            z-index: 290 !important;
          }

          /* Slide-in drawer */
          .admin-drawer {
            display: flex !important; flex-direction: column !important;
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 240px !important; height: 100vh !important;
            background: var(--k) !important; z-index: 310 !important;
            padding: 0 !important;
            box-shadow: 4px 0 24px rgba(0,0,0,.3) !important;
            transform: translateX(-100%) !important;
            transition: transform .28s cubic-bezier(.16,1,.3,1) !important;
          }
          .admin-drawer.open { transform: translateX(0) !important; }

          /* Drawer header */
          .admin-drawer-head {
            display: flex !important; align-items: center !important;
            justify-content: space-between !important;
            padding: 18px 16px !important;
            border-bottom: 1px solid rgba(255,255,255,.08) !important;
          }

          /* Drawer nav items */
          .admin-drawer-nav { padding: 12px 10px !important; flex: 1 !important; }
          .admin-drawer-btn {
            display: flex !important; align-items: center !important; gap: 12px !important;
            width: 100% !important; padding: 12px 14px !important;
            border-radius: 10px !important; border: none !important;
            background: transparent !important; cursor: pointer !important;
            color: rgba(255,255,255,.5) !important;
            font-family: 'Syne',sans-serif !important; font-size: .78rem !important;
            font-weight: 700 !important; letter-spacing: .06em !important;
            text-transform: uppercase !important; margin-bottom: 2px !important;
            transition: all .15s !important; text-align: left !important;
          }
          .admin-drawer-btn.active {
            background: rgba(192,57,43,.18) !important; color: var(--r) !important;
            border-left: 3px solid var(--r) !important;
          }
          .admin-drawer-btn:not(.active):hover { background: rgba(255,255,255,.05) !important; color: rgba(255,255,255,.8) !important; }

          /* Drawer footer: admin info + signout */
          .admin-drawer-foot {
            padding: 14px 16px 24px !important;
            border-top: 1px solid rgba(255,255,255,.08) !important;
          }

          /* Push main content below fixed navbar */
          .admin-main { margin-left: 0 !important; padding: 72px 16px 24px !important; }
          .admin-page-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }

          /* Stats grids */
          .admin-stats-4 { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .admin-stats-3 { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .admin-charts-row { grid-template-columns: 1fr !important; gap: 14px !important; }
          .admin-top-6 { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }

          /* Tables — horizontal scroll */
          .admin-table-scroll { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
          .admin-table-scroll table { min-width: 580px !important; }

          /* Filter row */
          .admin-filter-row { flex-wrap: wrap !important; gap: 8px !important; }
          .admin-filter-row input, .admin-filter-row select { width: 100% !important; }

          /* Cards grid */
          .admin-cards-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        }

        @media(max-width:480px) {
          .admin-stats-4 { grid-template-columns: 1fr 1fr !important; }
          .admin-stats-3 { grid-template-columns: 1fr 1fr !important; }
          .admin-top-6 { grid-template-columns: 1fr 1fr !important; }
          .admin-main { padding: 68px 12px 20px !important; }
        }
      `}</style>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div className="admin-drawer-overlay" style={{ display: 'none' }} onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── MOBILE DRAWER ── */}
      <div className={`admin-drawer${drawerOpen ? ' open' : ''}`} style={{ display: 'none' }}>
        <div className="admin-drawer-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, background: 'var(--r)', borderRadius: '50%' }} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', fontFamily: "'Syne',sans-serif" }}>Musema</span>
            <span style={{ fontSize: '.5rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Admin</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 7, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,.6)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="admin-drawer-nav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`admin-drawer-btn${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setDrawerOpen(false); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="admin-drawer-foot">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '1.1rem', color: '#fff' }}>{admin?.name?.[0] || 'A'}</span>
            </div>
            <div>
              <div style={{ fontSize: '.72rem', color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>{admin?.name}</div>
              <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.3)', letterSpacing: '.05em' }}>{admin?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '9px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── SIDEBAR — desktop: fixed left | mobile: fixed top navbar ── */}
      <div className="admin-sidebar" style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: 'var(--k)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>

        {/* Mobile top-bar content  */}
        <div className="admin-mobile-header" style={{ display: 'none' }}>
          {/* Hamburger */}
          <button className="admin-hamburger" style={{ display: 'none' }} onClick={() => setDrawerOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, background: 'var(--r)', borderRadius: '50%' }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: "'Syne',sans-serif" }}>Musema</span>
            <span style={{ fontSize: '.5rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginLeft: 2 }}>Admin</span>
          </div>
          {/* Active tab label */}
          <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginLeft: 4 }}>
            · {TABS.find(t => t.key === activeTab)?.label}
          </span>
        </div>

        {/* Desktop logo (hidden on mobile) */}
        <div className="admin-sidebar-logo" style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 7, height: 7, background: 'var(--r)', borderRadius: '50%' }} />
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Musema</span>
          </div>
          <div style={{ fontSize: '.55rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginLeft: 15 }}>Admin Portal</div>
        </div>

        {/* Nav tabs */}
        <nav className="admin-sidebar-nav" style={{ padding: '16px 12px', flex: 1 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn admin-tab-btn${activeTab === tab.key ? ' admin-tab-btn-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: activeTab === tab.key ? 'rgba(192,57,43,.18)' : 'transparent',
                color: activeTab === tab.key ? 'var(--r)' : 'rgba(255,255,255,.45)',
                fontFamily: "'Syne', sans-serif", fontSize: '.78rem', fontWeight: 700,
                letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 4,
                transition: 'all .15s',
                borderLeft: activeTab === tab.key ? '2px solid var(--r)' : '2px solid transparent',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              <span className="admin-sidebar-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Desktop admin info + logout (hidden on mobile) */}
        <div className="admin-sidebar-footer" style={{ padding: '16px 16px 24px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '1.1rem', color: '#fff' }}>
                {admin.name?.[0] || 'A'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '.72rem', color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>{admin.name}</div>
              <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.3)', letterSpacing: '.05em' }}>{admin.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '8px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,.2)'; e.currentTarget.style.color = 'var(--r)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.4)'; }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main" style={{ marginLeft: 220, padding: '32px 36px', minHeight: '100vh' }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'users'    && <UsersTab />}
        {activeTab === 'museums'  && <MuseumsTab />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p style={{ color: 'var(--k3)' }}>Failed to load stats.</p>;

  const { overview, recentBookings, bookingsByMuseum, bookingsByDay, topMuseums } = data;

  return (
    <div>
      <PageHeader title="Overview" sub="Platform performance at a glance" />

      {/* Stat grid */}
      <div className="admin-stats-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Bookings"   value={overview.totalBookings}   sub="All time" accent />
        <StatCard label="Total Revenue"    value={`₹${overview.totalRevenue.toLocaleString('en-IN')}`} sub="Excl. cancelled" />
        <StatCard label="Registered Users" value={overview.totalUsers}      sub="Platform users" />
        <StatCard label="Active Museums"   value={overview.totalMuseums}    sub="In catalogue" />
      </div>

      <div className="admin-stats-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Confirmed"     value={overview.confirmedBookings} />
        <StatCard label="Cancelled"     value={overview.cancelledBookings} />
        <StatCard label="Avg. Booking"  value={`₹${Math.round(overview.avgBookingValue).toLocaleString('en-IN')}`} sub="Per transaction" />
      </div>

      {/* Charts row */}
      <div className="admin-charts-row" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Bookings last 30 days */}
        <div style={{ background: '#fff', border: '1.5px solid var(--bd)', borderRadius: 16, padding: '22px 24px' }}>
          <SectionLabel>Bookings — Last 30 days</SectionLabel>
          {bookingsByDay.length > 0
            ? <MiniBarChart data={bookingsByDay} />
            : <div style={{ height: 60, display: 'flex', alignItems: 'center', color: 'var(--k3)', fontSize: '.8rem' }}>No data yet</div>
          }
        </div>
        {/* Top museums by bookings */}
        <div style={{ background: '#fff', border: '1.5px solid var(--bd)', borderRadius: 16, padding: '22px 24px' }}>
          <SectionLabel>Top Museums</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
            {bookingsByMuseum.slice(0, 5).map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.78rem', color: 'var(--k)', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m._id || 'Unknown'}</span>
                <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '1rem', color: 'var(--r)', marginLeft: 12, flexShrink: 0 }}>{m.count}</span>
              </div>
            ))}
            {bookingsByMuseum.length === 0 && <div style={{ fontSize: '.78rem', color: 'var(--k3)' }}>No bookings yet</div>}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background: '#fff', border: '1.5px solid var(--bd)', borderRadius: 16, padding: '22px 24px', marginBottom: 28 }}>
        <SectionLabel>Recent Bookings</SectionLabel>
        <div className="admin-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ marginTop: 12, minWidth: 580 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--bd)' }}>
              {['Reference', 'Visitor', 'Museum', 'Date', 'Amount', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 12px', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b: any) => (
              <tr key={b._id} className="row-hover" style={{ borderBottom: '1px solid var(--bd)' }}>
                <td style={{ padding: '10px 12px', fontSize: '.75rem', color: 'var(--r)', fontWeight: 700, whiteSpace: 'nowrap' }}>{b.bookingReference}</td>
                <td style={{ padding: '10px 12px', fontSize: '.78rem', color: 'var(--k)', whiteSpace: 'nowrap' }}>{b.visitorName}</td>
                <td style={{ padding: '10px 12px', fontSize: '.75rem', color: 'var(--k3)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.museumSnapshot?.name || (b.museum?.name)}</td>
                <td style={{ padding: '10px 12px', fontSize: '.75rem', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{b.visitDate}</td>
                <td style={{ padding: '10px 12px', fontSize: '.78rem', color: 'var(--k)', fontWeight: 600, whiteSpace: 'nowrap' }}>₹{b.totalAmount}</td>
                <td style={{ padding: '10px 12px' }}><StatusBadge status={b.status} /></td>
              </tr>
            ))}
            {recentBookings.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--k3)', fontSize: '.82rem' }}>No bookings yet</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Top museums catalogue */}
      <div style={{ background: '#fff', border: '1.5px solid var(--bd)', borderRadius: 16, padding: '22px 24px' }}>
        <SectionLabel>Top Rated Museums</SectionLabel>
        <div className="admin-top-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          {topMuseums.map((m: any) => (
            <div key={m._id} style={{ border: '1.5px solid var(--bd)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: '.8rem', color: 'var(--k)', fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{m.name}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--k3)', marginBottom: 8 }}>{m.city}, {m.state}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.65rem', fontWeight: 700, color: '#b45309', background: '#fffbe6', padding: '2px 8px', borderRadius: 100 }}>★ {m.rating?.toFixed(1)}</span>
                <span style={{ fontSize: '.7rem', color: 'var(--k3)' }}>₹{m.ticketPrices?.adult || 0} adult</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKINGS TAB
// ─────────────────────────────────────────────────────────────────────────────
function BookingsTab() {
  const [data,     setData]     = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('all');
  const [page,     setPage]     = useState(1);
  const [confirm,  setConfirm]  = useState<{ msg: string; action: () => void } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getBookings({ page: String(page), search, status })
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, newStatus: string) => {
    setConfirm({
      msg: `Change booking status to "${newStatus}"?`,
      action: async () => {
        setConfirm(null);
        await adminApi.updateBooking(id, { status: newStatus });
        load();
      },
    });
  };

  return (
    <div>
      <PageHeader title="Bookings" sub="All platform bookings" />
      {confirm && <ConfirmModal msg={confirm.msg} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name, email, ref…" />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: '9px 14px', border: '1.5px solid var(--bd)', borderRadius: 10, fontSize: '.8rem', color: 'var(--k)', background: '#fff', fontFamily: "'Syne', sans-serif", cursor: 'pointer', outline: 'none' }}
        >
          {['all', 'confirmed', 'cancelled', 'completed'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {data && <span style={{ fontSize: '.75rem', color: 'var(--k3)', fontWeight: 600 }}>{data.total} bookings</span>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid var(--bd)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div className="admin-table-scroll" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--bd)', background: '#faf8f4' }}>
                  {['Reference', 'Visitor', 'Email', 'Museum', 'Visit Date', 'Tickets', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.bookings || []).map((b: any) => (
                  <tr key={b._id} className="row-hover" style={{ borderBottom: '1px solid var(--bd)' }}>
                    <td style={{ padding: '11px 14px', fontSize: '.72rem', color: 'var(--r)', fontWeight: 700, whiteSpace: 'nowrap' }}>{b.bookingReference}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.78rem', color: 'var(--k)', fontWeight: 600, whiteSpace: 'nowrap' }}>{b.visitorName}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.72rem', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{b.visitorEmail}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.museumSnapshot?.name || b.museum?.name || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{b.visitDate}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)', textAlign: 'center' }}>{(b.adultTickets || 0) + (b.childTickets || 0) + (b.seniorTickets || 0) + (b.studentTickets || 0)}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.78rem', color: 'var(--k)', fontWeight: 700, whiteSpace: 'nowrap' }}>₹{b.totalAmount}</td>
                    <td style={{ padding: '11px 14px' }}><StatusBadge status={b.status} /></td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {b.status !== 'confirmed'  && <ActionBtn label="Confirm"  color="#1a7340" bg="#edfbf2" onClick={() => changeStatus(b._id, 'confirmed')} />}
                        {b.status !== 'completed'  && <ActionBtn label="Complete" color="#3730a3" bg="#eef2ff" onClick={() => changeStatus(b._id, 'completed')} />}
                        {b.status !== 'cancelled'  && <ActionBtn label="Cancel"   color="#c0392b" bg="#fff1f0" onClick={() => changeStatus(b._id, 'cancelled')} />}
                      </div>
                    </td>
                  </tr>
                ))}
                {(data?.bookings?.length === 0) && (
                  <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--k3)', fontSize: '.85rem' }}>No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [confirm, setConfirm] = useState<{ msg: string; action: () => void } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getUsers({ page: String(page), search })
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggle = (user: any) => {
    setConfirm({
      msg: `${user.isActive ? 'Deactivate' : 'Activate'} user "${user.fullName || user.email}"?`,
      action: async () => { setConfirm(null); await adminApi.toggleUser(user._id); load(); },
    });
  };

  return (
    <div>
      <PageHeader title="Users" sub="Registered platform users" />
      {confirm && <ConfirmModal msg={confirm.msg} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or email…" />
        {data && <span style={{ fontSize: '.75rem', color: 'var(--k3)', fontWeight: 600 }}>{data.total} users</span>}
      </div>

      <div style={{ background: '#fff', border: '1.5px solid var(--bd)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div className="admin-table-scroll" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--bd)', background: '#faf8f4' }}>
                  {['Name', 'Email', 'Phone', 'City', 'Bookings', 'Spent', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.users || []).map((u: any) => (
                  <tr key={u._id} className="row-hover" style={{ borderBottom: '1px solid var(--bd)' }}>
                    <td style={{ padding: '11px 14px', fontSize: '.8rem', color: 'var(--k)', fontWeight: 600 }}>{u.fullName || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)' }}>{u.email}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)' }}>{u.city || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.8rem', color: 'var(--k)', fontWeight: 700, textAlign: 'center' }}>{u.stats?.totalBookings || 0}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.78rem', color: 'var(--k)', fontWeight: 700 }}>₹{(u.stats?.totalSpent || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.72rem', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: u.isActive ? '#edfbf2' : '#fff1f0', color: u.isActive ? '#1a7340' : '#c0392b' }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <ActionBtn label={u.isActive ? 'Deactivate' : 'Activate'} color={u.isActive ? '#c0392b' : '#1a7340'} bg={u.isActive ? '#fff1f0' : '#edfbf2'} onClick={() => toggle(u)} />
                    </td>
                  </tr>
                ))}
                {(data?.users?.length === 0) && (
                  <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--k3)', fontSize: '.85rem' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {data && data.pages > 1 && <Pagination page={page} pages={data.pages} onPage={setPage} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MUSEUMS TAB
// ─────────────────────────────────────────────────────────────────────────────
function MuseumsTab() {
  const [data,      setData]      = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [editing,   setEditing]   = useState<any | null>(null);
  const [confirm,   setConfirm]   = useState<{ msg: string; action: () => void } | null>(null);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getMuseums({ page: String(page), search })
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const deactivate = (m: any) => {
    setConfirm({
      msg: `Deactivate "${m.name}"? It will be hidden from users.`,
      action: async () => { setConfirm(null); await adminApi.deleteMuseum(m._id); load(); },
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await adminApi.updateMuseum(editing._id, {
        name:        editing.name,
        address:     editing.address,
        type:        editing.type,
        ticketPrices: editing.ticketPrices,
        latitude:    parseFloat(editing.latitude),
        longitude:   parseFloat(editing.longitude),
        isActive:    editing.isActive,
      });
      setEditing(null);
      load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Museums" sub="Manage the museum catalogue" />
      {confirm  && <ConfirmModal msg={confirm.msg} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      {/* Edit drawer */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(24,21,15,.55)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 460, background: '#fff', height: '100%', overflowY: 'auto', padding: '32px 28px', boxShadow: '-24px 0 60px rgba(0,0,0,.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: '1.8rem', color: 'var(--k)' }}>Edit Museum</div>
              <button onClick={() => setEditing(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--k3)', padding: 4 }}>✕</button>
            </div>
            {[
              { label: 'Name',    key: 'name' },
              { label: 'Address', key: 'address' },
              { label: 'Type',    key: 'type' },
              { label: 'Latitude',  key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--k3)', marginBottom: 6 }}>{f.label}</label>
                <input
                  value={editing[f.key] ?? ''}
                  onChange={e => setEditing({ ...editing, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--bd)', borderRadius: 8, fontSize: '.85rem', fontFamily: "'Syne', sans-serif", outline: 'none', color: 'var(--k)' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--k3)', marginBottom: 8 }}>Ticket Prices (₹)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['adult', 'child', 'senior', 'student'].map(k => (
                  <div key={k}>
                    <label style={{ fontSize: '.62rem', color: 'var(--k3)', textTransform: 'capitalize', marginBottom: 4, display: 'block' }}>{k}</label>
                    <input
                      type="number" value={editing.ticketPrices?.[k] ?? 0}
                      onChange={e => setEditing({ ...editing, ticketPrices: { ...editing.ticketPrices, [k]: Number(e.target.value) } })}
                      style={{ width: '100%', padding: '9px 11px', border: '1.5px solid var(--bd)', borderRadius: 8, fontSize: '.85rem', fontFamily: "'Syne', sans-serif", outline: 'none', color: 'var(--k)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <input type="checkbox" id="isActive" checked={editing.isActive} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} />
              <label htmlFor="isActive" style={{ fontSize: '.82rem', color: 'var(--k)', fontWeight: 600, cursor: 'pointer' }}>Active (visible to users)</label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--bd)', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: '.78rem', fontWeight: 700, color: 'var(--k3)' }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: 'var(--k)', color: '#fff', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: '.78rem', fontWeight: 700 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search museums…" />
        {data && <span style={{ fontSize: '.75rem', color: 'var(--k3)', fontWeight: 600, alignSelf: 'center' }}>{data.total} museums</span>}
      </div>

      <div style={{ background: '#fff', border: '1.5px solid var(--bd)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div className="admin-table-scroll" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--bd)', background: '#faf8f4' }}>
                  {['Museum', 'City', 'State', 'Type', 'Adult ₹', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--k3)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.museums || []).map((m: any) => (
                  <tr key={m._id} className="row-hover" style={{ borderBottom: '1px solid var(--bd)' }}>
                    <td style={{ padding: '11px 14px', fontSize: '.8rem', color: 'var(--k)', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)' }}>{m.city}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.75rem', color: 'var(--k3)' }}>{m.state}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '2px 9px', borderRadius: 100, fontSize: '.62rem', fontWeight: 700, background: '#fff0ed', color: 'var(--r)', border: '1px solid #fcc' }}>{m.type}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '.8rem', color: 'var(--k)', fontWeight: 700 }}>₹{m.ticketPrices?.adult || 0}</td>
                    <td style={{ padding: '11px 14px', fontSize: '.78rem', color: '#b45309', fontWeight: 700 }}>★ {m.rating?.toFixed(1)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', background: m.isActive ? '#edfbf2' : '#fff1f0', color: m.isActive ? '#1a7340' : '#c0392b' }}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionBtn label="Edit"       color="var(--k)"  bg="#f0ede7" onClick={() => setEditing({ ...m })} />
                        <ActionBtn label="Deactivate" color="#c0392b"   bg="#fff1f0" onClick={() => deactivate(m)} />
                      </div>
                    </td>
                  </tr>
                ))}
                {(data?.museums?.length === 0) && (
                  <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--k3)', fontSize: '.85rem' }}>No museums found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {data && data.pages > 1 && <Pagination page={page} pages={data.pages} onPage={setPage} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared small components
// ─────────────────────────────────────────────────────────────────────────────
function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '2.6rem', color: 'var(--k)', lineHeight: 0.95, marginBottom: 6 }}>{title}</h1>
      <p style={{ fontSize: '.82rem', color: 'var(--k3)', fontWeight: 300 }}>{sub}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--k3)', marginBottom: 12 }}>{children}</div>
  );
}

function ActionBtn({ label, color, bg, onClick }: { label: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button
      className="action-btn"
      onClick={onClick}
      style={{ padding: '4px 11px', border: 'none', borderRadius: 100, background: bg, color, fontSize: '.6rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Syne',sans-serif", transition: 'opacity .15s', whiteSpace: 'nowrap' }}
    >
      {label}
    </button>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: '2.5px solid var(--bd)', borderTopColor: 'var(--r)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />;
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {page > 1 && <PagBtn label="← Prev" onClick={() => onPage(page - 1)} />}
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = i + 1;
        return <PagBtn key={p} label={String(p)} onClick={() => onPage(p)} active={p === page} />;
      })}
      {page < pages && <PagBtn label="Next →" onClick={() => onPage(page + 1)} />}
    </div>
  );
}

function PagBtn({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 14px', border: `1.5px solid ${active ? 'var(--k)' : 'var(--bd)'}`, borderRadius: 8, background: active ? 'var(--k)' : '#fff', color: active ? '#fff' : 'var(--k3)', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: '.72rem', fontWeight: 700 }}>
      {label}
    </button>
  );
}
