//frontend>src>pages>TodoList>TodoList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TodoItem from './TodoItem';

function TodoList({ todos: initialTodos = [] }) {
  const navigate = useNavigate();
  
  // 상태 관리
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState(''); 

  // ⭐️ 데이터 불러오기 (컴포넌트 로드 시 실행)
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/todos');
        if (response.data.success) {
          // 백엔드 데이터 필드(content)를 프론트엔드 필드(text)로 변환하여 저장
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

  // 오늘 날짜 정보
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const day = dayNames[today.getDay()]; 
  const formattedDate = `${year}.${month}.${date}(${day})`;

  const completedCount = todos.filter(todo => todo.completed).length; 
  const remainingCount = todos.length - completedCount; 

  // D-Day 계산 함수 (기존 로직 유지)
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

  // ⭐️ 삭제 로직 (DB 실시간 반영)
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 할 일을 삭제할까요?")) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/todos/${id}`);
      if (response.data.success) {
        // DB 삭제 성공 시에만 화면에서 필터링
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleUpdate = (id, newText, newDate) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: newText, targetDate: newDate } : todo
    ));
  };

  const handleToggle = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleAddTodo = async () => {
    if (inputValue.trim() === '') return;
    
    try {
      // ⭐️ 수동 추가 시에도 DB에 저장
      const response = await axios.post('http://localhost:5000/api/todos', {
        content: inputValue,
        targetDate: dueDate,
        userID: "test_user_1"
      });

      if (response.data.success) {
        const newTodo = {
          id: response.data.id, // DB에서 생성된 실제 ID 사용
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

  // ⭐️ 정렬 로직 (기존 로직 유지)
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