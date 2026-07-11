import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import goalCardImg from '../assets/goal-card.jpg';

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

  return (
    <div style={{ padding: '40px 6%', minHeight: '100vh', boxSizing: 'border-box' }}>
      <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 6px' }}>안녕하세요 👋</p>
      <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)', margin: '0 0 24px' }}>오늘은 뭘 해볼까요?</p>

      <div style={{ display: 'grid', gridTemplateColumns: total > 0 ? '1.3fr 1fr' : '1fr', gap: '14px', marginBottom: '22px' }}>
        <div style={{
          background: 'var(--primary)', borderRadius: '18px', padding: '28px 30px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px'
        }}>
          <div>
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'rgba(255,255,255,0.78)', margin: '0 0 10px' }}>오늘의 진행 상황</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: 'var(--fs-display)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{completed}</span>
              <span style={{ fontSize: 'var(--fs-md)', color: 'rgba(255,255,255,0.8)' }}>/ {total}개 완료</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: '#fff' }}>{progressPct}%</span>
            <div style={{ width: '160px', height: '10px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: '#fff', borderRadius: '999px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {upcoming.length > 0 ? (
          <div
            onClick={() => navigate('/list')}
            style={{
              background: 'var(--surface-soft)', borderRadius: '18px', padding: '22px 24px',
              boxShadow: '0 0 0 1px var(--border)', cursor: 'pointer',
            }}
          >
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 14px' }}>마감이 얼마 안 남았어요</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcoming.map((t) => {
                const urgent = t.daysLeft <= 0;
                const soon = t.daysLeft > 0 && t.daysLeft <= 3;
                const badgeBg = urgent ? 'var(--danger-soft)' : soon ? 'var(--clay-soft)' : 'var(--border)';
                const badgeColor = urgent ? 'var(--danger-text)' : soon ? 'var(--clay-text)' : 'var(--text-muted)';
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{
                      fontSize: 'var(--fs-base)', fontWeight: 500, color: 'var(--text-h)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.content}
                    </span>
                    <span className="badge" style={{ background: badgeBg, color: badgeColor, flexShrink: 0, fontSize: 'var(--fs-xs)' }}>
                      {formatDDay(t.daysLeft)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : total > 0 ? (
          <div style={{
            background: 'var(--surface-soft)', borderRadius: '18px', padding: '22px 24px',
            boxShadow: '0 0 0 1px var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              마감일이 등록된 할 일이 없어요.<br />할 일에 날짜를 추가하면 여기에 보여드릴게요.
            </p>
          </div>
        ) : null}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>

        <button
          onClick={() => navigate('/list')}
          style={{
            textAlign: 'left', border: 'none', cursor: 'pointer',
            background: 'var(--sage-soft)', borderRadius: '18px', padding: '20px 18px',
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '11px', background: 'var(--sage-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#fff',
          }}>
            <IconList size={19} />
          </div>
          <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--sage-text)', margin: '0 0 4px' }}>할 일 목록 보기</p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--sage-text)', margin: 0, lineHeight: 1.5 }}>목표별로 정리해서 보여드려요</p>
        </button>

        <button
          onClick={() => navigate('/mypage')}
          style={{
            textAlign: 'left', border: 'none', cursor: 'pointer',
            background: 'var(--border)', borderRadius: '18px', padding: '20px 18px',
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '11px', background: 'var(--text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#fff',
          }}>
            <IconUser size={19} />
          </div>
          <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--text-h)', margin: '0 0 4px' }}>마이페이지</p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>계정과 설정을 관리해요</p>
        </button>

        <button
          onClick={() => navigate('/make')}
          style={{
            position: 'relative', textAlign: 'left', border: 'none', cursor: 'pointer',
            borderRadius: '18px', padding: 0, overflow: 'hidden', minHeight: '160px',
            backgroundImage: `linear-gradient(180deg, rgba(24,32,27,0.05) 0%, rgba(24,32,27,0.75) 100%), url(${goalCardImg})`,
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--slate-soft)',
          }}
        >
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 16px' }}>
            <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>새 목표 만들기</p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>AI가 실행 계획을 짜드려요</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Home;