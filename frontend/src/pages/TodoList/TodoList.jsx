import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';
import api from '../../api';
import TodoItem from './TodoItem';

const UNSORTED_GOAL_ID = 'default';

const GOAL_THEMES = [
  { bar: 'var(--slate-strong)', title: 'var(--slate-text)', track: 'var(--slate-soft)', badge: 'var(--slate-text)' },
  { bar: 'var(--clay-strong)', title: 'var(--clay-text)', track: 'var(--clay-soft)', badge: 'var(--clay-text)' },
  { bar: 'var(--sage-strong)', title: 'var(--sage-text)', track: 'var(--sage-soft)', badge: 'var(--sage-text)' },
];

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedGoalID, setSelectedGoalID] = useState(UNSORTED_GOAL_ID);

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

  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 할 일을 삭제할까요?")) return;
    try {
      const response = await api.delete(`/todos/${id}`);
      if (response.data.success) setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
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

  const groupedByGoal = goals.map((g, index) => ({
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

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', flexWrap: 'wrap' }}>
        <input
          type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="새로운 할 일을 추가해보세요"
          className="field" style={{ border: 'none', boxShadow: 'none', flexGrow: 1, minWidth: '160px' }}
        />
        <select
          value={selectedGoalID} onChange={(e) => setSelectedGoalID(e.target.value)}
          className="field" style={{ border: '1.5px solid var(--border)', width: 'auto', color: 'var(--text)' }}
        >
          <option value={UNSORTED_GOAL_ID}>미분류</option>
          {goals.map(g => (
            <option key={g.id} value={g.id}>{g.content}</option>
          ))}
        </select>
        <input
          type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="field" style={{ border: 'none', boxShadow: 'none', width: 'auto', color: 'var(--text-muted)' }}
        />
        <button onClick={handleAddTodo} className="btn btn-primary" style={{ padding: '10px 18px' }}>+</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {groupedByGoal.map(({ goal, theme, todos: goalTodos }) => {
          const doneCount = goalTodos.filter(t => t.completed).length;
          const pct = goalTodos.length === 0 ? 0 : Math.round((doneCount / goalTodos.length) * 100);
          return (
            <div key={goal.id} className="card" style={{ borderLeft: `4px solid ${theme.bar}`, borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '17px', color: theme.title }}>{goal.content}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '80px', height: '5px', background: theme.track, borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: theme.bar }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: theme.badge }}>{doneCount}/{goalTodos.length}</span>
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