import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { toFakeEmail } from '../utils/authEmail';
import loginHeroImg from '../assets/login-hero.jpg';

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="auth-grid">
      <div className="auth-brand" style={{ backgroundImage: `url(${loginHeroImg})` }}>
        <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
          AI TODO COACH
        </p>

        <div>
          <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, color: '#fff', margin: '0 0 14px' }}>
            매일 한 걸음씩<br />완성되는 하루
          </h1>
          <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            목표를 말하면 AI가 30일 완성 실행 계획을 짜드려요.<br />
            작은 할 일이 쌓이면 기록이 되고, 기록이 성장이 됩니다.
          </p>
        </div>

        <span />
      </div>

      <div className="auth-form-side">
        <div style={{ width: '100%', maxWidth: 340 }}>
          <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
            {mode === 'login' ? 'Sign in' : 'Sign up'}
          </p>
          <h2 style={{ fontSize: 'var(--fs-xl)', letterSpacing: '-0.02em', color: 'var(--text-h)', margin: '6px 0 26px' }}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 6 }}>닉네임</p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                className="field"
              />
            </div>

            <div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 6 }}>비밀번호</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="field"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 6 }}>비밀번호 확인</p>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="field"
                />
              </div>
            )}

            {error && (
              <p style={{ color: 'var(--danger-text)', fontSize: 'var(--fs-sm)', margin: '-2px 0 0', fontWeight: 600 }}>{error}</p>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: 6 }}>
              {loading ? '처리중...' : (mode === 'login' ? '로그인' : '회원가입')}
            </button>

            <p style={{ textAlign: 'center', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 20 }}>
              {mode === 'login' ? '아직 계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
              <span
                style={{ color: 'var(--primary-strong)', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              >
                {mode === 'login' ? '회원가입' : '로그인'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;