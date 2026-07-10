//frontend>src>pages>TodoList>TodoList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import TodoItem from './TodoItem';

function TodoList() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get('/todos');
        if (response.data.success) {
          const mappedTodos = response.data.data.map(item => ({
            id: item.id,
            text: item.content,
            targetDate: item.targetDate || "",
            completed: item.isDone || false,
            highlighted: false
          }));
          setTodos(mappedTodos);
        }
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };
    fetchTodos();
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
      if (response.data.success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // ⭐️ 이제 DB에도 저장됨
  const handleUpdate = async (id, newText, newDate) => {
    const prevTodos = todos;
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText, targetDate: newDate } : todo
    ));
    try {
      await api.patch(`/todos/${id}`, { content: newText, targetDate: newDate });
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정 사항을 저장하지 못했습니다.");
      setTodos(prevTodos); // 실패 시 원상복구
    }
  };

  // ⭐️ 이제 DB에도 저장됨
  const handleToggle = async (id) => {
    const target = todos.find(todo => todo.id === id);
    if (!target) return;
    const prevTodos = todos;
    const nextCompleted = !target.completed;

    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: nextCompleted } : todo
    ));
    try {
      await api.patch(`/todos/${id}`, { isDone: nextCompleted });
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("완료 상태를 저장하지 못했습니다.");
      setTodos(prevTodos);
    }
  };

  const handleAddTodo = async () => {
    if (inputValue.trim() === '') return;
    try {
      const response = await api.post('/todos', {
        content: inputValue,
        targetDate: dueDate
      });
      if (response.data.success) {
        const newTodo = {
          id: response.data.id,
          text: inputValue,
          targetDate: dueDate,
          completed: false,
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

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.targetDate && !b.targetDate) return 0;
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return new Date(a.targetDate) - new Date(b.targetDate);
  });

  return (
    <div style={{
      backgroundColor: '#FBFAF9',
      minHeight: '100vh',
      width: '100%',
      padding: '60px 8%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 15px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#eee',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          홈으로
        </button>
      </div>

      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: '40px', textAlign: 'left', position: 'relative' }}>
          <p style={{ margin: '0 0 8px', fontSize: '16px', color: '#bbb', fontWeight: '600' }}>{formattedDate}</p>
          <h1 style={{ margin: 0, fontSize: '48px', fontWeight: '800', color: '#111' }}>To-Do</h1>
          <p style={{ margin: '12px 0 0', fontSize: '18px', color: '#999', fontWeight: '500' }}>
            {remainingCount}개 남음 · {completedCount}개 완료
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            border: '2px solid #ddd',
            borderRadius: '16px',
            backgroundColor: 'white',
            boxSizing: 'border-box',
            gap: '10px'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="새로운 목표를 추가해보세요"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontWeight: '500',
                flexGrow: 1,
                backgroundColor: 'transparent'
              }}
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#777',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
            />
            <button
              onClick={handleAddTodo}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ccc', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              +
            </button>
          </div>
          <div></div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: 'min-content',
        alignContent: 'start',
        gap: '20px',
        width: '100%',
        overflowY: 'auto',
        paddingRight: '10px',
        flexGrow: 1,
      }}>
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            text={todo.text}
            targetDate={todo.targetDate}
            dDay={calculateDDay(todo.targetDate)}
            completed={todo.completed}
            highlighted={todo.highlighted}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default TodoList;