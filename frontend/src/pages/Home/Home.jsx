import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function IconSparkle({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
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

function calculateDaysLeft(targetDateString) {
  if (!targetDateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateString);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function formatDDay(days) {
  if (days === 0) return 'D-Day';
  if (days > 0) return `D-${days}`;
  return `D+${Math.abs(days)}`;
}

function Home() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await api.get('/todos');
        if (res.data.success) {
          setTodos(res.data.data);
        }
      } catch (err) {
        console.error('할 일 불러오기 실패', err);
      }
    };
    fetchTodos();
  }, []);

  const total = todos.length;
  const completed = todos.filter((t) => t.isDone).length;
  const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const upcoming = todos
    .filter((t) => !t.isDone && t.targetDate)
    .map((t) => ({ ...t, daysLeft: calculateDaysLeft(t.targetDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  const cards = [
    {
      key: 'make',
      to: '/make',
      icon: IconSparkle,
      title: '새 목표 만들기',
      desc: 'AI가 실행 계획을 짜드려요',
      chipBg: 'var(--slate-soft)',
      chipColor: 'var(--slate-strong)',
      titleColor: 'var(--slate-text)',
      descColor: 'var(--slate-text)',
    },
    {
      key: 'list',
      to: '/list',
      icon: IconList,
      title: '할 일 목록 보기',
      desc: '목표별로 정리해서 보여드려요',
      chipBg: 'var(--sage-soft)',
      chipColor: 'var(--sage-strong)',
      titleColor: 'var(--sage-text)',
      descColor: 'var(--sage-text)',
    },
    {
      key: 'mypage',
      to: '/mypage',
      icon: IconUser,
      title: '마이페이지',
      desc: '계정과 설정을 관리해요',
      chipBg: 'var(--border)',
      chipColor: 'var(--text)',
      titleColor: 'var(--text-h)',
      descColor: 'var(--text-muted)',
    },
  ];

  return (
    <div style={{ padding: '40px 6%', minHeight: '100vh', boxSizing: 'border-box' }}>
      <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 4px' }}>안녕하세요 👋</p>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px' }}>오늘은 뭘 해볼까요?</p>

      <div style={{ display: 'grid', gridTemplateColumns: total > 0 ? '1.3fr 1fr' : '1fr', gap: '14px', marginBottom: '22px' }}>
        <div style={{
          background: 'var(--primary)', borderRadius: '14px', padding: '18px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px'
        }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', margin: '0 0 6px' }}>오늘의 진행 상황</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>{completed}</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>/ {total}개 완료</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{progressPct}%</span>
            <div style={{ width: '140px', height: '8px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: '#fff', borderRadius: '999px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {upcoming.length > 0 ? (
          <div
            onClick={() => navigate('/list')}
            style={{
              background: 'var(--surface-soft)', borderRadius: '14px', padding: '16px 20px',
              boxShadow: '0 0 0 1px var(--border)', cursor: 'pointer',
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 12px' }}>마감이 얼마 안 남았어요</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcoming.map((t) => {
                const urgent = t.daysLeft <= 0;
                const soon = t.daysLeft > 0 && t.daysLeft <= 3;
                const badgeBg = urgent ? 'var(--danger-soft)' : soon ? 'var(--clay-soft)' : 'var(--border)';
                const badgeColor = urgent ? 'var(--danger-text)' : soon ? 'var(--clay-text)' : 'var(--text-muted)';
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: 500, color: 'var(--text-h)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.content}
                    </span>
                    <span className="badge" style={{ background: badgeBg, color: badgeColor, flexShrink: 0 }}>
                      {formatDDay(t.daysLeft)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : total > 0 ? (
          <div style={{
            background: 'var(--surface-soft)', borderRadius: '14px', padding: '16px 20px',
            boxShadow: '0 0 0 1px var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              마감일이 등록된 할 일이 없어요.<br />할 일에 날짜를 추가하면 여기에 보여드릴게요.
            </p>
          </div>
        ) : null}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {cards.map(({ key, to, icon: Icon, title, desc, chipBg, chipColor, titleColor, descColor }) => (
          <button
            key={key}
            onClick={() => navigate(to)}
            style={{
              textAlign: 'left', border: 'none', cursor: 'pointer',
              background: chipBg, borderRadius: '14px', padding: '18px 16px',
            }}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px', background: chipColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#fff',
            }}>
              <Icon />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: titleColor, margin: '0 0 4px' }}>{title}</p>
            <p style={{ fontSize: '12px', color: descColor, margin: 0, lineHeight: 1.5 }}>{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;