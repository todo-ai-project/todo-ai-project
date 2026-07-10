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
            "{userGoal}"을 위한 플랜을 짜고 있어요...
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>실행 가능한 단계로 하나씩 나누는 중이에요. 잠시만 기다려주세요!</p>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
            <button onClick={onReset} className="btn btn-ghost">← 다시 입력하기</button>
          </div>

          <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>플랜이 준비됐어요! 🎉</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '30px' }}>
            <strong style={{ color: 'var(--text-h)' }}>"{userGoal}"</strong>을 위해 이렇게 나눠봤어요.
          </p>

          <div className="card" style={{ padding: '32px', textAlign: 'left' }}>
            {displayData && displayData.length > 0 ? (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {displayData.map((item, index) => {
                    const content = typeof item === 'string' ? item : item.content;
                    const category = item.category || "액션 플랜";

                    return (
                      <div key={index} style={itemStyle}>
                        <span className="badge badge-muted" style={{ flexShrink: 0 }}>{category}</span>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-h)' }}>{content}</span>
                      </div>
                    );
                  })}
                </div>

                <hr style={{ margin: '28px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

                <button onClick={onGoToList} className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                  내 투두리스트에서 확인하기
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>플랜을 만드는 중에 문제가 생겼어요.</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>다시 한 번 시도해주시겠어요?</p>
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
  borderTop: '4px solid var(--accent)',
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