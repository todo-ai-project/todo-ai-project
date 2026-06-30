//frontend>src>pages>Home>Home.jsx
import { useNavigate } from 'react-router-dom';

function Home() {
  // 페이지를 이동시켜주는 마법의 함수!
  const navigate = useNavigate();

  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: '#FBFAF9', height: '100vh' }}>
      <h1 style={{ fontSize: '36px', color: '#111', marginBottom: '10px' }}>환영합니다! 🏠</h1>
      <p style={{ fontSize: '18px', color: '#888', marginBottom: '40px' }}>어느 페이지로 이동하시겠어요?</p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate('/make')} 
          style={{ padding: '20px 40px', fontSize: '18px', fontWeight: 'bold', borderRadius: '16px', backgroundColor: 'white', color: '#406eff', border: '2px solid #406eff', cursor: 'pointer' }}
        >
          목표 추가 (MakeTodo)
        </button>

        <button 
          onClick={() => navigate('/list')} 
          style={{ padding: '20px 40px', fontSize: '18px', fontWeight: 'bold', borderRadius: '16px', backgroundColor: '#406eff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          할 일 목록 (TodoList)
        </button>
      </div>
    </div>
  );
}

export default Home;