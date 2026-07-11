import React from 'react';

const CATEGORY_META = {
  learning_plan: {
    label: '학습 계획',
    description: '목표에 필요한 지식과 전략을 준비하는 단계예요.',
    badgeClass: 'badge-slate',
    accent: 'var(--slate)',
  },
  practical_goals: {
    label: '실전 목표',
    description: '직접 몸으로 부딪히며 실력을 쌓는 핵심 행동이에요.',
    badgeClass: 'badge-clay',
    accent: 'var(--clay)',
  },
  environment_setup: {
    label: '환경 조성',
    description: '꾸준히 이어갈 수 있도록 주변 환경과 시스템을 만드는 단계예요.',
    badgeClass: 'badge-sage',
    accent: 'var(--sage)',
  },
};

const DEFAULT_META = {
  label: '액션 플랜',
  description: '',
  badgeClass: 'badge-muted',
  accent: 'var(--text-muted)',
};

function AnalyzePage({ userGoal, isLoading, result, onGoToList, onReset }) {

  // 카테고리 순서를 유지하면서 항목들을 그룹핑
  const groups = [];
  if (Array.isArray(result)) {
    const map = new Map();
    result.forEach(item => {
      const content = typeof item === 'string' ? item : item.content;
      const category = (typeof item === 'object' && item.category) || 'etc';
      if (!content) return;
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(content);
    });
    map.forEach((items, category) => groups.push({ category, items }));
  } else if (result && typeof result === 'object') {
    Object.entries(result).forEach(([category, items]) => {
      if (!Array.isArray(items)) return;
      const contents = items
        .map(item => (typeof item === 'string' ? item : item.content))
        .filter(Boolean);
      if (contents.length > 0) groups.push({ category, items: contents });
    });
  }

  const hasData = groups.length > 0;

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
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
            <button onClick={onReset} className="btn btn-ghost btn-sm">← 다시 입력하기</button>
          </div>

          <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>플랜이 준비됐어요! 🎉</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '30px' }}>
            <strong style={{ color: 'var(--text-h)' }}>"{userGoal}"</strong>을 위해 이렇게 나눠봤어요.
          </p>

          {hasData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
              {groups.map(({ category, items }) => {
                const meta = CATEGORY_META[category] || DEFAULT_META;
                return (
                  <div
                    key={category}
                    className="card"
                    style={{ padding: '24px', borderLeft: `4px solid ${meta.accent}`, borderRadius: '14px' }}
                  >
                    <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>

                    {meta.description && (
                      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', margin: '8px 0 16px' }}>
                        {meta.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {items.map((content, index) => (
                        <div
                          key={index}
                          style={{
                            ...itemStyle,
                            borderBottom: index === items.length - 1 ? 'none' : '1px solid var(--border)',
                          }}
                        >
                          <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-h)' }}>{content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <button onClick={onGoToList} className="btn btn-primary btn-block" style={{ padding: '16px', marginTop: '8px' }}>
                내 투두리스트에서 확인하기
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p>플랜을 만드는 중에 문제가 생겼어요.</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>다시 한 번 시도해주시겠어요?</p>
              <button onClick={onReset} className="btn btn-ghost" style={{ marginTop: '16px' }}>다시 시도</button>
            </div>
          )}
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
  padding: '12px 2px',
};

export default AnalyzePage;