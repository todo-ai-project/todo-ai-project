import { useState, useEffect, useRef } from 'react';
import BackButton from '../components/BackButton';
import api from '../api';
import TodoItem from './TodoItem';

const UNSORTED_GOAL_ID = 'default';
const DDAY_PREFIX = /^D-(\d+)\s*:\s*/;

const GOAL_THEMES = [
  { bar: 'var(--slate-strong)', title: 'var(--slate-text)', track: 'var(--slate-soft)', badge: 'var(--slate-text)' },
  { bar: 'var(--clay-strong)', title: 'var(--clay-text)', track: 'var(--clay-soft)', badge: 'var(--clay-text)' },
  { bar: 'var(--sage-strong)', title: 'var(--sage-text)', track: 'var(--sage-soft)', badge: 'var(--sage-text)' },
];

const navBtnStyle = {
  width: '26px', height: '26px', borderRadius: '50%', border: 'none',
  background: 'var(--surface-soft)', color: 'var(--text)', cursor: 'pointer', fontSize: '14px',
};

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onOutside]);
}

function GoalSelect({ value, onChange, goals }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const options = [{ id: UNSORTED_GOAL_ID, content: '미분류' }, ...goals];
  const selected = options.find(o => o.id === value) || options[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '999px', border: '1.5px solid var(--border)',
          background: 'var(--surface-soft)', fontSize: '13px', fontWeight: 600, color: 'var(--text)',
          cursor: 'pointer', maxWidth: '180px',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.content}</span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20,
          background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 10px 28px rgba(0,0,0,0.14)',
          border: '1px solid var(--border)', padding: '6px', minWidth: '180px', maxHeight: '240px', overflowY: 'auto',
        }}>
          {options.map(o => {
            const isSelected = o.id === value;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(o.id); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: isSelected ? 'var(--primary-soft)' : 'transparent',
                  color: isSelected ? 'var(--primary-text)' : 'var(--text)',
                  fontSize: '13px', fontWeight: isSelected ? 700 : 500,
                }}
              >
                {o.content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DatePicker({ value, onChange, placeholder = '날짜 선택' }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()));
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const formatValue = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handlePick = (d) => {
    onChange(formatValue(year, month, d));
    setOpen(false);
  };

  const displayLabel = value ? `${value.slice(0, 4)}.${value.slice(5, 7)}.${value.slice(8, 10)}` : placeholder;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '999px', border: '1.5px solid var(--border)',
          background: 'var(--surface-soft)', fontSize: '13px', fontWeight: 600,
          color: value ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer',
        }}
      >
        📅 {displayLabel}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20,
          background: 'var(--surface)', borderRadius: '18px', boxShadow: '0 10px 28px rgba(0,0,0,0.14)',
          border: '1px solid var(--border)', padding: '16px', width: '260px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} style={navBtnStyle}>‹</button>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-h)' }}>{year}년 {month + 1}월</span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} style={navBtnStyle}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <span key={d} style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>{d}</span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const dateStr = formatValue(year, month, d);
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePick(d)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                    fontSize: '12px', fontWeight: isSelected ? 700 : 500, cursor: 'pointer',
                    background: isSelected ? 'var(--primary-strong)' : 'transparent',
                    color: isSelected ? '#fff' : isToday ? 'var(--primary-strong)' : 'var(--text)',
                    boxShadow: isToday && !isSelected ? 'inset 0 0 0 1.5px var(--primary-strong)' : 'none',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              style={{ marginTop: '10px', width: '100%', padding: '8px', borderRadius: '999px', border: 'none', background: 'var(--surface-soft)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              날짜 지우기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedGoalID, setSelectedGoalID] = useState(UNSORTED_GOAL_ID);
  const [isApplyingLegacy, setIsApplyingLegacy] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, goalsRes] = await Promise.all([api.get('/todos'), api.get('/goals')]);

        if (todosRes.data.success) {
          const mappedTodos = todosRes.data.data.map(item => ({
            id: item.id,
            text: item.content,
            targetDate: item.targetDate || "",
            completed: item.isDone || false,
            goalID: item.goalID || UNSORTED_GOAL_ID,
            highlighted: false
          }));
          setTodos(mappedTodos);
        }
        if (goalsRes.data.success) {
          setGoals(goalsRes.data.data);
        }
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const day = dayNames[today.getDay()];
  const formattedDate = `${year}.${month}.${date}(${day})`;

  const completedCount = todos.filter(todo => todo.completed).length;
  const remainingCount = todos.length - completedCount;

  const legacyTargets = todos.filter(t => !t.targetDate && DDAY_PREFIX.test(t.text));

  const calculateDDay = (targetDateString) => {
    if (!targetDateString) return '마감일 없음';
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const targetDate = new Date(targetDateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const handleApplyLegacyDeadlines = async () => {
    if (legacyTargets.length === 0) return;
    if (!window.confirm(`${legacyTargets.length}개 할 일에 오늘 날짜 기준으로 마감일을 적용할까요?`)) return;

    setIsApplyingLegacy(true);
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const results = await Promise.all(legacyTargets.map(async (t) => {
      const match = t.text.match(DDAY_PREFIX);
      const days = parseInt(match[1], 10);
      const targetDateObj = new Date(base);
      targetDateObj.setDate(targetDateObj.getDate() + days);
      const targetDate = targetDateObj.toISOString().slice(0, 10);
      const cleanText = t.text.replace(DDAY_PREFIX, '');

      try {
        await api.patch(`/todos/${t.id}`, { content: cleanText, targetDate });
        return { id: t.id, targetDate, text: cleanText, ok: true };
      } catch (error) {
        console.error('마감일 적용 실패', t.id, error);
        return { id: t.id, ok: false };
      }
    }));

    setTodos(prev => prev.map(t => {
      const r = results.find(r => r.id === t.id);
      return r && r.ok ? { ...t, targetDate: r.targetDate, text: r.text } : t;
    }));

    const failedCount = results.filter(r => !r.ok).length;
    if (failedCount > 0) alert(`${failedCount}개는 적용에 실패했어요. 다시 시도해주세요.`);
    setIsApplyingLegacy(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 할 일을 삭제할까요?")) return;
    try {
      const response = await api.delete(`/todos/${id}`);
      if (response.data.success) setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleArchiveGoal = async (goalId) => {
    if (!window.confirm('이 목표를 보관함으로 옮길까요? 목록에서는 더 이상 안 보여요.')) return;
    try {
      await api.patch(`/goals/${goalId}/archive`, { archived: true });
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (error) {
      alert('보관에 실패했어요.');
    }
  };

  const handleUpdate = async (id, newText, newDate) => {
    const prevTodos = todos;
    setTodos(todos.map(todo => todo.id === id ? { ...todo, text: newText, targetDate: newDate } : todo));
    try {
      await api.patch(`/todos/${id}`, { content: newText, targetDate: newDate });
    } catch (error) {
      alert("수정 사항을 저장하지 못했습니다.");
      setTodos(prevTodos);
    }
  };

  const handleToggle = async (id) => {
    const target = todos.find(todo => todo.id === id);
    if (!target) return;
    const prevTodos = todos;
    const nextCompleted = !target.completed;
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: nextCompleted } : todo));
    try {
      await api.patch(`/todos/${id}`, { isDone: nextCompleted });
    } catch (error) {
      alert("완료 상태를 저장하지 못했습니다.");
      setTodos(prevTodos);
    }
  };

  const handleAddTodo = async () => {
    if (inputValue.trim() === '') return;
    try {
      const response = await api.post('/todos', { content: inputValue, targetDate: dueDate, goalID: selectedGoalID });
      if (response.data.success) {
        const newTodo = {
          id: response.data.id,
          text: inputValue,
          targetDate: dueDate,
          completed: false,
          goalID: selectedGoalID,
          highlighted: false,
        };
        setTodos([newTodo, ...todos]);
        setInputValue('');
        setDueDate('');
      }
    } catch (error) {
      alert("할 일을 저장하지 못했습니다.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTodo();
  };

  const sortTodos = (list) => [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.targetDate && !b.targetDate) return 0;
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return new Date(a.targetDate) - new Date(b.targetDate);
  });

  const groupedByGoal = goals.filter(g => !g.archived).map((g, index) => ({
    goal: g,
    theme: GOAL_THEMES[index % GOAL_THEMES.length],
    todos: sortTodos(todos.filter(t => t.goalID === g.id))
  })).filter(group => group.todos.length > 0);

  const unsortedTodos = sortTodos(todos.filter(t => !goals.some(g => g.id === t.goalID)));

  return (
    <div style={{ minHeight: '100vh', width: '100%', padding: '40px 6%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>

      <div style={{ marginBottom: '30px' }}>
        <BackButton />
        <p style={{ margin: '0 0 8px', fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600 }}>{formattedDate}</p>
        <h1 style={{ margin: 0, fontSize: '40px' }}>To-Do</h1>
        <p style={{ margin: '10px 0 0', fontSize: '16px', color: 'var(--text-muted)' }}>
          {remainingCount}개 남음 · {completedCount}개 완료
        </p>
      </div>

      <div
        className="card add-todo-card"
        style={{ padding: '18px 22px 20px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--surface)', marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>✏️</span>
          <input
            type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="오늘은 어떤 일을 해볼까요?"
            className="field"
            style={{ border: 'none', boxShadow: 'none', padding: '4px 0', fontSize: '17px', fontWeight: 600 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <GoalSelect value={selectedGoalID} onChange={setSelectedGoalID} goals={goals} />
          <DatePicker value={dueDate} onChange={setDueDate} placeholder="마감일 선택" />

          <button onClick={handleAddTodo} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '10px 22px' }}>
            + 추가하기
          </button>
        </div>
      </div>

      {legacyTargets.length > 0 && (
        <div className="card" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          marginBottom: '36px', background: 'var(--clay-soft)', boxShadow: '0 0 0 1px var(--clay)',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--clay-text)', fontWeight: 600 }}>
            AI가 처음에 알려준 디데이가 아직 실제 마감일로 저장 안 된 항목이 {legacyTargets.length}개 있어요.
          </p>
          <button onClick={handleApplyLegacyDeadlines} className="btn btn-primary btn-sm" disabled={isApplyingLegacy}>
            {isApplyingLegacy ? '적용 중...' : '지금 적용하기'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {groupedByGoal.map(({ goal, theme, todos: goalTodos }) => {
          const doneCount = goalTodos.filter(t => t.completed).length;
          const pct = goalTodos.length === 0 ? 0 : Math.round((doneCount / goalTodos.length) * 100);
          return (
            <div key={goal.id} className="card" style={{ borderLeft: `4px solid ${theme.bar}`, borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontSize: '17px', color: theme.title }}>{goal.content}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '80px', height: '5px', background: theme.track, borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: theme.bar }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: theme.badge }}>{doneCount}/{goalTodos.length}</span>
                    {pct === 100 && (
                      <button
                        onClick={() => handleArchiveGoal(goal.id)}
                        className="btn"
                        style={{
                          background: 'var(--clay-strong)', color: '#fff',
                          padding: '10px 20px', fontSize: 'var(--fs-base)', fontWeight: 700,
                        }}
                      >
                        📦 보관하기
                      </button>
                    )}
                  </div>
                </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {goalTodos.map((todo) => (
                  <TodoItem
                    key={todo.id} id={todo.id} text={todo.text} targetDate={todo.targetDate}
                    dDay={calculateDDay(todo.targetDate)} completed={todo.completed} highlighted={todo.highlighted}
                    onDelete={handleDelete} onUpdate={handleUpdate} onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {unsortedTodos.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 700 }}>미분류</h2>
              <span className="badge badge-muted">{unsortedTodos.filter(t => t.completed).length}/{unsortedTodos.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {unsortedTodos.map((todo) => (
                <TodoItem
                  key={todo.id} id={todo.id} text={todo.text} targetDate={todo.targetDate}
                  dDay={calculateDDay(todo.targetDate)} completed={todo.completed} highlighted={todo.highlighted}
                  onDelete={handleDelete} onUpdate={handleUpdate} onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        )}

        {todos.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>아직 할 일이 없어요. 위에서 추가해보세요!</p>
        )}
      </div>
    </div>
  );
}

export default TodoList;