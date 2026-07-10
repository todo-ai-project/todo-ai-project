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

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/todos');
        if (res.data.success) {
          const total = res.data.data.length;
          const completed = res.data.data.filter((t) => t.isDone).length;
          setStats({ total, completed });
        }
      } catch (err) {
        console.error('진행 상황 불러오기 실패', err);
      }
    };
    fetchStats();
  }, []);

  const progressPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

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

      <div style={{
        background: 'var(--primary)', borderRadius: '14px', padding: '18px 22px', marginBottom: '22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px'
      }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', margin: '0 0 6px' }}>오늘의 진행 상황</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>{stats.completed}</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>/ {stats.total}개 완료</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{progressPct}%</span>
          <div style={{ width: '140px', height: '8px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: '#fff', borderRadius: '999px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
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