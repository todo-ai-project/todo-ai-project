//frontend>src>pages>TodoList>TodoItem.jsx
import { useState } from 'react';

function TodoItem({ id, text, targetDate, dDay, completed, highlighted, onDelete, onUpdate, onToggle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [editDate, setEditDate] = useState(targetDate);

  const handleDeleteClick = () => {
    if (window.confirm('삭제하시겠습니까?')) onDelete(id);
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSave = () => {
    onUpdate(id, editValue, editDate);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: highlighted ? '0 0 0 2px var(--purple-strong)' : '0 0 0 1px var(--border)',
        opacity: completed ? 0.55 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexGrow: 1 }}>
        <div
          onClick={() => onToggle(id)}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: completed ? 'none' : '2px solid var(--border)',
            backgroundColor: completed ? 'var(--green)' : 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '13px',
            fontWeight: 'bold',
            marginTop: '2px',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {completed && '✓'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', width: '100%', textAlign: 'left' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="field"
                style={{ fontSize: '15px', padding: '8px 12px' }}
              />
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="field"
                style={{ fontSize: '13px', padding: '6px 12px', width: '160px', color: 'var(--text-muted)' }}
              />
            </div>
          ) : (
            <p style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: highlighted ? 700 : 500,
              color: completed ? 'var(--text-muted)' : 'var(--text-h)',
              textDecoration: completed ? 'line-through' : 'none'
            }}>
              {text}
            </p>
          )}

          {!isEditing && (
            <span className={dDay === 'D-Day' ? 'badge badge-coral' : 'badge badge-purple'}>
              {dDay}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        {isEditing ? (
          <button onClick={handleSave} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px' }}>저장</button>
        ) : (
          <button onClick={handleEditClick} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px' }}>수정</button>
        )}
        <button onClick={handleDeleteClick} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '13px' }}>삭제</button>
      </div>
    </div>
  );
}

export default TodoItem;