//frontend>src>pages>MakeTodo>AnalyzePage.jsx
import React from 'react';

function AnalyzePage({ userGoal, isLoading, result, onGoToList, onReset }) {
  
  // ⭐️ [데이터 보정 로직]
  // 만약 result가 객체 형태({ learning_plan: [], ... })로 들어오면 배열로 변환합니다.
  let displayData = [];
  if (Array.isArray(result)) {
    displayData = result;
  } else if (result && typeof result === 'object') {
    // 객체 안에 담긴 모든 배열들을 하나로 합칩니다.
    displayData = Object.values(result).flat().filter(item => typeof item === 'string' || item.content);
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '0 20px', backgroundColor: '#FBFAF9', minHeight: '100vh' }}>
      
      {isLoading ? (
        <div>
          <div className="loader" style={spinnerStyle}></div>
          <h2 style={{ color: '#333', fontSize: '28px', fontWeight: '800' }}>
            ⏳ AI가 "{userGoal}" 분석 중...
          </h2>
          <p style={{ color: '#666' }}>최적의 액션 플랜을 세우고 있어요. 잠시만 기다려주세요!</p>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
            <button onClick={onReset} style={backButtonStyle}>← 다시 입력하기</button>
          </div>
          
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>✨ 분석 완료!</h1>
          <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>
            <strong>"{userGoal}"</strong> 성공을 위한 전략 리스트입니다.
          </p>
          
          <div style={resultBoxStyle}>
            {/* ⭐️ 보정된 displayData를 사용하여 체크 */}
            {displayData && displayData.length > 0 ? (
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {displayData.map((item, index) => {
                    // 데이터 형식이 문자열인지 객체인지에 따라 유연하게 처리
                    const content = typeof item === 'string' ? item : item.content;
                    const category = item.category || "액션 플랜";
                    
                    return (
                      <div key={index} style={itemStyle}>
                        <span style={badgeStyle(category)}>{category}</span>
                        <span style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{content}</span>
                      </div>
                    );
                  })}
                </div>
                
                <hr style={{ margin: '30px 0', border: '0.5px solid #eee' }} />
                
                <button 
                  onClick={onGoToList} 
                  style={saveButtonStyle}
                >
                  내 투두리스트에서 확인하기 💾
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px' }}>
                <p>⚠️ 데이터를 표시할 수 없습니다.</p>
                <p style={{ fontSize: '14px', color: '#999' }}>AI 응답 형식이 올바르지 않거나 비어있습니다.</p>
                <button onClick={onReset} style={{ ...backButtonStyle, marginTop: '10px' }}>다시 시도</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 스타일 (변화 없음) ---
const spinnerStyle = {
  width: '50px',
  height: '50px',
  border: '5px solid #f3f3f3',
  borderTop: '5px solid #aa3bff',
  borderRadius: '50%',
  margin: '0 auto 20px',
  animation: 'spin 1s linear infinite',
};

const resultBoxStyle = {
  border: 'none',
  padding: '40px',
  borderRadius: '24px',
  backgroundColor: 'white',
  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
  marginBottom: '50px'
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '12px 0',
  borderBottom: '1px solid #f9f9f9'
};

const badgeStyle = (category) => ({
  fontSize: '11px',
  padding: '4px 8px',
  borderRadius: '6px',
  backgroundColor: category.includes('learning') ? '#e1f5fe' : category.includes('practical') ? '#f3e5f5' : '#e8f5e9',
  color: category.includes('learning') ? '#0288d1' : category.includes('practical') ? '#8e24aa' : '#2e7d32',
  fontWeight: 'bold',
  minWidth: '100px',
  textAlign: 'center'
});

const backButtonStyle = {
  padding: '10px 20px',
  cursor: 'pointer',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '12px',
  fontWeight: '600',
  color: '#666'
};

const saveButtonStyle = {
  width: '100%',
  padding: '18px',
  cursor: 'pointer',
  backgroundColor: '#aa3bff',
  color: 'white',
  border: 'none',
  borderRadius: '15px',
  fontSize: '18px',
  fontWeight: 'bold',
  transition: 'transform 0.2s, background 0.2s',
  boxShadow: '0 5px 15px rgba(170, 59, 255, 0.3)'
};

export default AnalyzePage;