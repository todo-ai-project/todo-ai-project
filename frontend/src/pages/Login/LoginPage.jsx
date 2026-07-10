import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { toFakeEmail } from '../../utils/authEmail';

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!nickname.trim() || !password.trim()) {
      setError('닉네임과 비밀번호를 입력해주세요.');
      return;
    }
    if (mode === 'signup' && password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    const email = toFakeEmail(nickname);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nickname.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 닉네임입니다.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('닉네임 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/user-not-found') {
        setError('존재하지 않는 닉네임입니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('닉네임에 사용할 수 없는 문자가 포함되어 있습니다.');
      } else {
        setError(`오류가 발생했습니다. (${err.code})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>
        {mode === 'login' ? '로그인' : '회원가입'}
      </h1>

      <div className="card" style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="field"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
        {mode === 'signup' && (
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="field"
          />
        )}

        {error && <p style={{ color: 'var(--danger-text)', fontSize: '13px', margin: 0, fontWeight: 600 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn btn-coral" style={{ marginTop: '4px' }}>
          {loading ? '처리중...' : (mode === 'login' ? '로그인' : '회원가입')}
        </button>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          className="btn btn-ghost"
        >
          {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;