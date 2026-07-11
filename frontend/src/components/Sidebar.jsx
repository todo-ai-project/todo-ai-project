import { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';

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

function IconUsers({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <circle cx="17.5" cy="8.5" r="2.4" />
      <path d="M15 14.6c2.9.3 5 2.3 5 5.4" />
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

function IconArchive({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function IconBell({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

const navItems = [
  { to: '/', label: '홈', icon: IconHome, end: true },
  { to: '/list', label: '할 일 목록', icon: IconList, end: false },
  { to: '/friends', label: '친구', icon: IconUsers, end: false, showBadge: true },
  { to: '/archive', label: '보관함', icon: IconArchive, end: false },
  { to: '/mypage', label: '마이페이지', icon: IconUser, end: false },
];

function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = dateInput._seconds ? new Date(dateInput._seconds * 1000) : new Date(dateInput);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

function Sidebar() {
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/friends/requests/received');
      if (res.data.success) setPendingCount(res.data.data.length);
    } catch (err) {
      console.error('친구 요청 불러오기 실패', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('알림 불러오기 실패', err);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchPending();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPending, fetchNotifications]);

  useEffect(() => {
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleToggleNotif = async () => {
    const next = !showNotif;
    setShowNotif(next);
    if (next && unreadCount > 0) {
      try {
        await api.post('/notifications/read-all');
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('알림 읽음 처리 실패', err);
      }
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingLeft: '6px' }}>
        <p style={{ fontSize: 'var(--fs-md)', fontWeight: 800, color: 'var(--text-h)', margin: 0 }}>
          투두메이트
        </p>

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={handleToggleNotif}
            style={{
              position: 'relative', width: '30px', height: '30px', borderRadius: '50%',
              border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
            }}
            aria-label="알림"
          >
            <IconBell />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px',
                borderRadius: '50%', background: 'var(--danger)',
              }} />
            )}
          </button>

          {showNotif && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 30,
              width: '280px', maxHeight: '340px', overflowY: 'auto',
              background: 'var(--surface)', borderRadius: '14px', boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
              border: '1px solid var(--border)', padding: '10px',
            }}>
              <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text-h)', margin: '4px 6px 8px' }}>알림</p>
              {notifications.length === 0 ? (
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', padding: '10px 6px' }}>알림이 없어요.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{ padding: '10px 8px', borderRadius: '10px', background: n.isRead ? 'transparent' : 'var(--primary-soft)' }}>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-h)', margin: '0 0 3px', lineHeight: 1.4 }}>
                      <strong>{n.actorNickname}</strong>님이 "{n.goalContent}"을(를) {n.type === 'congrats' ? '축하' : '응원'}했어요!
                    </p>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>{formatRelativeTime(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ to, label, icon: Icon, end, showBadge }) => (
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
              fontSize: 'var(--fs-base)', fontWeight: isActive ? 700 : 500,
              position: 'relative',
            })}
          >
            <span style={{ display: 'flex', color: 'inherit', opacity: 0.85 }}>
              <Icon />
            </span>
            {label}
            {showBadge && pendingCount > 0 && (
              <span style={{
                marginLeft: 'auto', minWidth: '18px', height: '18px', borderRadius: '999px',
                background: 'var(--danger)', color: '#fff', fontSize: '11px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
              }}>
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;