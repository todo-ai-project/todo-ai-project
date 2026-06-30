//frontend>src>pages>MakeTodo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnalyzePage from "./AnalyzePage";

function MakeTodo() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 고정된 유저 ID (추후 로그인 구현 시 state나 context에서 가져옴)
  const CURRENT_USER_ID = "test_user_1";

  const handleSubmit = async () => {
    if (!goal.trim()) {
      alert("목표를 입력해주세요!");
      return;
    }

    setIsAnalyzing(true);
    setIsLoading(true);
    setResult(null);

    try {
      // 백엔드 AI 생성 API 호출
      const response = await axios.post('http://localhost:5001/api/todos/generate', {
        userGoal: goal,
        userID: CURRENT_USER_ID, // ⭐️ 일관된 ID 사용
        goalID: `goal_${Date.now()}`
      });

      console.log("AI 생성 결과:", response.data);

      if (response.data.success) {
        // 백엔드에서 전송한 저장된 Todo 배열을 상태에 저장
        setResult(response.data.data);
      } else {
        alert("AI 분석 플랜 생성에 실패했습니다.");
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("AI 요청 에러:", error);
      alert("서버 연결에 실패했습니다. 백엔드가 5001 포트에서 실행 중인지 확인하세요.");
      setIsAnalyzing(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 투두리스트 페이지로 이동하는 함수
  const handleGoToList = () => {
    // ⭐️ 중요: TodoList 페이지로 이동할 때 어떤 유저의 데이터를 볼지 힌트를 주거나, 
    // 그냥 이동 후 TodoList 컴포넌트 내부에서 "test_user_1" 데이터를 불러오게 해야 합니다.
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
      backgroundColor: '#FBFAF9', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px', color: '#111' }}>
        어떤 목표를 이루고 싶으신가요?
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
        AI가 당신의 목표를 분석해 최적의 할 일 리스트를 만들어드립니다.
      </p>
      
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        display: 'flex', 
        gap: '15px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}>
        <input 
          type="text" 
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="예: 집밥 만들어 먹기" 
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', fontWeight: '500' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button 
          onClick={handleSubmit}
          style={{
            padding: '15px 30px',
            backgroundColor: '#aa3bff',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          분석 시작
        </button>
      </div>
    </div>
  );
}

export default MakeTodo;