import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AnalyzePage from "./AnalyzePage";
import BackButton from '../components/BackButton';

const DDAY_PREFIX = /^D-(\d+)\s*:\s*/;

function applyDefaultDeadlines(items) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Promise.all(items.map(async (item) => {
    if (typeof item === 'string' || !item.id) return item;

    const match = item.content && item.content.match(DDAY_PREFIX);
    if (!match) return item;

    const daysFromNow = parseInt(match[1], 10);
    const target = new Date(today);
    target.setDate(target.getDate() + daysFromNow);
    const targetDate = target.toISOString().slice(0, 10);
    const cleanContent = item.content.replace(DDAY_PREFIX, '');

    try {
      await api.patch(`/todos/${item.id}`, { targetDate, content: cleanContent });
      return { ...item, targetDate, content: cleanContent };
    } catch (err) {
      console.error('기본 마감일 설정 실패', err);
      return item;
    }
  }));
}

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
      const goalRes = await api.post('/goals', { content: goal });
      const goalID = goalRes.data.id;

      const response = await api.post('/todos/generate', {
        userGoal: goal,
        goalID
      });

      if (response.data.success) {
        const rawItems = Array.isArray(response.data.data)
          ? response.data.data
          : Object.values(response.data.data).flat();

        const enrichedItems = await applyDefaultDeadlines(rawItems);
        setResult(enrichedItems);
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
    <div style={{ minHeight: '100vh', width: '100%', padding: '40px 6%', boxSizing: 'border-box' }}>
      <BackButton />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', textAlign: 'center' }}>
          요즘 이루고 싶은 목표가 있으신가요?
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '40px', textAlign: 'center' }}>
          막연해도 괜찮아요. 한 줄만 적어주시면, 실행 가능한 계획으로 나눠드릴게요.
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
          <button onClick={handleSubmit} className="btn btn-primary">
            분석 시작
          </button>
        </div>
      </div>
    </div>
  );
}

export default MakeTodo;