import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import api from '../api';

function Archive() {
  const [goals, setGoals] = useState(null);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsRes, todosRes] = await Promise.all([api.get('/goals'), api.get('/todos')]);
        if (goalsRes.data.success) setGoals(goalsRes.data.data.filter((g) => g.archived));
        if (todosRes.data.success) setTodos(todosRes.data.data);
      } catch (err) {
        console.error('보관함 불러오기 실패', err);
        setGoals([]);
      }
    };
    fetchData();
  }, []);

  const handleRestore = async (goalId) => {
    try {
      await api.patch(`/goals/${goalId}/archive`, { archived: false });
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      alert('복원에 실패했어요.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', padding: '40px 6%', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <BackButton />
        <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 22px' }}>보관함</p>

        {goals === null ? (
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)' }}>불러오는 중...</p>
        ) : goals.length === 0 ? (
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)', textAlign: 'center', marginTop: '30px' }}>
            보관된 목표가 없어요. 완료한 목표를 "할 일 목록"에서 보관해보세요.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.map((g) => {
              const goalTodos = todos.filter((t) => t.goalID === g.id);
              const done = goalTodos.filter((t) => t.completed).length;
              return (
                <div key={g.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--text-h)', margin: '0 0 4px' }}>{g.content}</p>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>
                      {done}/{goalTodos.length}개 완료 · 응원 {g.cheerCount || 0} · 축하 {g.congratsCount || 0}
                    </p>
                  </div>
                  <button onClick={() => handleRestore(g.id)} className="btn btn-ghost btn-sm">복원하기</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Archive;