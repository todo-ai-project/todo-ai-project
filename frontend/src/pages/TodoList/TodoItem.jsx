//frontend>src>pages>TodoList>TodoItem.jsx
import { useState } from 'react';

function TodoItem({ id, text, targetDate, dDay, completed, highlighted, onDelete, onUpdate, onToggle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [editDate, setEditDate] = useState(targetDate); // 수정용 날짜 상태

  const handleDeleteClick = () => {
    if (window.confirm('삭제하시겠습니까?')) {
      onDelete(id);
    }
  };

  const handleEditClick = () => {
    if (window.confirm('수정하시겠습니까?')) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    // 텍스트와 날짜를 함께 부모 컴포넌트로 전달
    onUpdate(id, editValue, editDate);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div style={{
      display: 'flex',            
      justifyContent: 'space-between', 
      alignItems: 'center',      
      padding: '20px',
      border: highlighted ? '2px solid #406eff' : '1px solid #eee', 
      borderRadius: '12px',       
      backgroundColor: 'white',   
      // 완료 시 전체적인 투명도를 주어 어둡게 보이게 함
      opacity: completed ? 0.6 : 1, 
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', flexGrow: 1 }}>
        
        {/* ⭐️ 체크박스 (클릭 시 완료 토글) */}
        <div 
          onClick={() => onToggle(id)} // 부모의 토글 함수 호출
          style={{ 
            width: '24px', 
            height: '24px', 
            border: completed ? '2px solid #406eff' : '2px solid #eee', 
            borderRadius: '50%',
            backgroundColor: completed ? '#406eff' : 'white', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white', 
            fontSize: '14px',
            fontWeight: 'bold',
            marginTop: '2px',
            flexShrink: 0,
            cursor: 'pointer', // 클릭 가능 표시
            transition: 'all 0.2s'
          }}
        >
          {completed && '✓'} 
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', width: '100%', textAlign: 'left' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {/* 텍스트 수정 */}
              <input 
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  fontSize: '16px',
                  padding: '6px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  width: '90%',
                  outline: 'none'
                }}
              />
              {/* ⭐️ 날짜 수정 추가 */}
              <input 
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                style={{
                  fontSize: '13px',
                  padding: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  width: '150px',
                  color: '#666'
                }}
              />
            </div>
          ) : (
            <p style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: highlighted ? '600' : '500', 
              color: completed ? '#999' : '#333', 
              // ⭐️ 완료 시 취소선 긋기
              textDecoration: completed ? 'line-through' : 'none' 
            }}>
              {text}
            </p>
          )}
          
          {/* 디데이 표시 (수정 중이 아닐 때만 표시) */}
          {!isEditing && (
            <p style={{ margin: 0, fontSize: '13px', color: '#888', fontWeight: '500' }}>
              {dDay}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', fontSize: '18px', color: '#ccc', flexShrink: 0 }}>
        {isEditing ? (
          <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#406eff' }}>💾</button>
        ) : (
          <button onClick={handleEditClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>✏️</button>
        )}
        <button onClick={handleDeleteClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>🗑</button>
      </div>
    </div>
  );
}

export default TodoItem;