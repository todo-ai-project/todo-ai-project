import { NavLink } from 'react-router-dom';

function IconHome({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

function IconList({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" />
      <path d="M4 6l1 1 2-2" /><path d="M4 12l1 1 2-2" /><path d="M4 18l1 1 2-2" />
    </svg>
  );
}

function IconUser({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

const navItems = [
  { to: '/', label: '홈', icon: IconHome, end: true },
  { to: '/list', label: '할 일 목록', icon: IconList, end: false },
  { to: '/mypage', label: '마이페이지', icon: IconUser, end: false },
];

function Sidebar() {
  return (
    <div style={{
      width: '200px', flexShrink: 0,
      background: 'var(--surface-soft)',
      borderRight: '0.5px solid var(--border)',
      padding: '24px 14px',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 28px', paddingLeft: '6px' }}>
        투두메이트
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--text)',
              background: isActive ? 'var(--primary)' : 'transparent',
              fontSize: '14px', fontWeight: isActive ? 700 : 500,
            })}
          >
            <span style={{ display: 'flex', color: 'inherit', opacity: 0.85 }}>
              <Icon />
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;