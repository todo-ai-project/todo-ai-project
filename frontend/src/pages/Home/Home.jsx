//frontend>src>pages>Home>Home.jsx
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>환영합니다!</h1>
      <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px' }}>
        어느 페이지로 이동하시겠어요?
      </p>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/make')} className="btn btn-coral">
          목표 추가
        </button>

        <button onClick={() => navigate('/list')} className="btn btn-green">
          할 일 목록
        </button>

        <button onClick={() => navigate('/mypage')} className="btn btn-purple">
          마이페이지
        </button>
      </div>
    </div>
  );
}

export default Home;