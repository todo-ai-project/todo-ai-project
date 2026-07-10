//frontend>src>pages>MakeTodo>AnalyzePage.jsx
import React from 'react';

function AnalyzePage({ userGoal, isLoading, result, onGoToList, onReset }) {

  let displayData = [];
  if (Array.isArray(result)) {
    displayData = result;
  } else if (result && typeof result === 'object') {
    displayData = Object.values(result).flat().filter(item => typeof item === 'string' || item.content);
  }

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px 60px', minHeight: '100vh' }}>

      {isLoading ? (
        <div>
          <div className="loader" style={spinnerStyle}></div>
          <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>
            AI가 "{userGoal}" 분석 중...
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>최적의 액션 플랜을 세우고 있어요. 잠시만 기다려주세요!</p>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
            <button onClick={onReset} className="btn btn-ghost">← 다시 입력하기</button>
          </div>

          <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>분석 완료!</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '30px' }}>
            <strong style={{ color: 'var(--text-h)' }}>"{userGoal}"</strong> 성공을 위한 전략 리스트입니다.
          </p>

          <div className="card" style={{ padding: '32px', textAlign: 'left' }}>
            {displayData && displayData.length > 0 ? (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {displayData.map((item, index) => {
                    const content = typeof item === 'string' ? item : item.content;
                    const category = item.category || "액션 플랜";
                    const badgeClass = category.includes('learning')
                      ? 'badge-purple'
                      : category.includes('practical')
                        ? 'badge-coral'
                        : 'badge-green';

                    return (
                      <div key={index} style={itemStyle}>
                        <span className={`badge ${badgeClass}`} style={{ flexShrink: 0 }}>{category}</span>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-h)' }}>{content}</span>
                      </div>
                    );
                  })}
                </div>

                <hr style={{ margin: '28px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

                <button onClick={onGoToList} className="btn btn-purple" style={{ width: '100%', padding: '16px' }}>
                  내 투두리스트에서 확인하기
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>데이터를 표시할 수 없습니다.</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>AI 응답 형식이 올바르지 않거나 비어있습니다.</p>
                <button onClick={onReset} className="btn btn-ghost" style={{ marginTop: '10px' }}>다시 시도</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const spinnerStyle = {
  width: '44px',
  height: '44px',
  border: '4px solid var(--border)',
  borderTop: '4px solid var(--purple-strong)',
  borderRadius: '50%',
  margin: '0 auto 20px',
  animation: 'spin 1s linear infinite',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 0',
  borderBottom: '1px solid var(--border)'
};

export default AnalyzePage;