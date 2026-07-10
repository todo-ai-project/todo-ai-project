import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signOut,
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { toFakeEmail } from '../../utils/authEmail';
import api from '../../api';

function MyPage() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [nickname, setNickname] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/todos');
        if (res.data.success) {
          const total = res.data.data.length;
          const completed = res.data.data.filter((t) => t.isDone).length;
          setStats({ total, completed });
        }
      } catch (err) {
        console.error('통계 불러오기 실패', err);
      }
    };
    fetchStats();
  }, []);

  const reauthenticate = async (password) => {
    const credential = EmailAuthProvider.credential(toFakeEmail(user.displayName), password);
    await reauthenticateWithCredential(user, credential);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleNicknameChange = async () => {
    setError(''); setMessage('');
    if (!nickname.trim()) return setError('닉네임을 입력해주세요.');
    try {
      await updateProfile(user, { displayName: nickname.trim() });
      setMessage('닉네임이 변경되었습니다.');
    } catch (err) {
      setError('닉네임 변경에 실패했습니다.');
    }
  };

  const handlePasswordChange = async () => {
    setError(''); setMessage('');
    if (!currentPassword || !newPassword) return setError('현재 비밀번호와 새 비밀번호를 입력해주세요.');
    if (newPassword.length < 6) return setError('새 비밀번호는 6자 이상이어야 합니다.');
    try {
      await reauthenticate(currentPassword);
      await updatePassword(user, newPassword);
      setMessage('비밀번호가 변경되었습니다.');
      setCurrentPassword(''); setNewPassword('');
    } catch (err) {
      setError('현재 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    if (!currentPassword) return setError('계정 삭제 전 현재 비밀번호를 입력해주세요.');
    if (!window.confirm('정말 계정을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await reauthenticate(currentPassword);
      await deleteUser(user);
      navigate('/login');
    } catch (err) {
      setError('현재 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 8%', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
        ← 홈으로
      </button>

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>닉네임</p>
          <h2>{user?.displayName || '알 수 없음'}</h2>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost">로그아웃</button>
      </div>

      <div className="card" style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <span className="badge badge-coral">전체 할 일</span>
          <h2 style={{ marginTop: '10px', fontSize: '28px' }}>{stats.total}개</h2>
        </div>
        <div style={{ flex: 1 }}>
          <span className="badge badge-green">완료</span>
          <h2 style={{ marginTop: '10px', fontSize: '28px' }}>{stats.completed}개</h2>
        </div>
      </div>

      {(message || error) && (
        <p style={{ color: error ? 'var(--danger-text)' : 'var(--green-text)', fontSize: '14px', fontWeight: 600 }}>
          {error || message}
        </p>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontWeight: 700 }}>닉네임 변경</p>
        <input className="field" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <button onClick={handleNicknameChange} className="btn btn-purple">닉네임 저장</button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontWeight: 700 }}>비밀번호 변경</p>
        <input className="field" type="password" placeholder="현재 비밀번호" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <input className="field" type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={handlePasswordChange} className="btn btn-purple">비밀번호 변경</button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontWeight: 700, color: 'var(--danger-text)' }}>계정 삭제</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>삭제 전 현재 비밀번호를 위 칸에 입력해주세요.</p>
        <button onClick={handleDeleteAccount} className="btn btn-danger">계정 삭제</button>
      </div>
    </div>
  );
}

export default MyPage;