//frontend>src>pages>MakeTodo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AnalyzePage from "./AnalyzePage";

function MakeTodo() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!goal.trim()) {
      alert("목표를 입력해주세요!");
      return;
    }

    setIsAnalyzing(true);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await api.post('/todos/generate', {
        userGoal: goal,
        goalID: `goal_${Date.now()}`
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        alert("AI 분석 플랜 생성에 실패했습니다.");
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("AI 요청 에러:", error);
      alert("서버 연결에 실패했습니다.");
      setIsAnalyzing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToList = () => {
    navigate('/list');
  };

  if (isAnalyzing) {
    return (
      <AnalyzePage
        isLoading={isLoading}
        result={result}
        userGoal={goal}
        onGoToList={handleGoToList}
        onReset={() => {
          setIsAnalyzing(false);
          setResult(null);
          setGoal('');
        }}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '10px', textAlign: 'center' }}>
        어떤 목표를 이루고 싶으신가요?
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '40px', textAlign: 'center' }}>
        AI가 당신의 목표를 분석해 최적의 할 일 리스트를 만들어드립니다.
      </p>

      <div className="card" style={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        gap: '12px',
      }}>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="예: 집밥 만들어 먹기"
          className="field"
          style={{ flex: 1, border: 'none', boxShadow: 'none', fontSize: '16px' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button onClick={handleSubmit} className="btn btn-purple">
          분석 시작
        </button>
      </div>
    </div>
  );
}

export default MakeTodo;