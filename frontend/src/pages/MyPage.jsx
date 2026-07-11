import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, storage } from '../firebaseConfig';
import { toFakeEmail } from '../utils/authEmail';
import api from '../api';
import BackButton from '../components/BackButton';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function IconUser({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function IconCamera({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  );
}

function IconTrash({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </svg>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const avatarStoragePathRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [nickname, setNickname] = useState(auth.currentUser?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(auth.currentUser?.photoURL || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [goals, setGoals] = useState([]);
  const [pinBusyId, setPinBusyId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      if (u) {
        setAvatarUrl(u.photoURL || '');
      }
    });
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/goals');
        if (res.data.success) setGoals(res.data.data.filter((g) => !g.archived));
      } catch (err) {
        console.error('목표 불러오기 실패', err);
      }
    };
    fetchGoals();
  }, []);

  const syncUserFromAuth = async () => {
    await auth.currentUser.reload();
    setCurrentUser(auth.currentUser);
    return auth.currentUser;
  };

  const reauthenticate = async (password) => {
    const credential = EmailAuthProvider.credential(toFakeEmail(currentUser.displayName), password);
    await reauthenticateWithCredential(currentUser, credential);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleNicknameChange = async () => {
    setError(''); setMessage('');
    const trimmed = nickname.trim();
    if (!trimmed) return setError('닉네임을 입력해주세요.');
    if (trimmed === currentUser.displayName) return setError('현재 닉네임과 동일합니다.');

    try {
      await api.patch('/users/me', { nickname: trimmed }); // 백엔드가 Admin SDK로 이메일+표시이름 변경
      alert('닉네임이 변경되었습니다. 새 닉네임으로 다시 로그인해주세요.');
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('닉네임 변경 실패', err);
      setError(err.response?.data?.message || '닉네임 변경에 실패했습니다.');
    }
  };

  const handlePasswordChange = async () => {
    setError(''); setMessage('');
    if (!currentPassword || !newPassword) return setError('현재 비밀번호와 새 비밀번호를 입력해주세요.');
    if (newPassword.length < 6) return setError('새 비밀번호는 6자 이상이어야 합니다.');
    try {
      await reauthenticate(currentPassword);
      await updatePassword(currentUser, newPassword);
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
      await deleteUser(currentUser);
      navigate('/login');
    } catch (err) {
      setError('현재 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleAvatarClick = () => {
    if (isUploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(''); setMessage('');

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있어요.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('5MB 이하의 이미지만 업로드할 수 있어요.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setIsUploadingAvatar(true);

    try {
      const path = `avatars/${currentUser.uid}/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      await updateProfile(currentUser, { photoURL: downloadUrl });
      await syncUserFromAuth();
      avatarStoragePathRef.current = path;
      setAvatarUrl(downloadUrl);
      setMessage('프로필 사진이 변경되었습니다.');
    } catch (err) {
      console.error('프로필 사진 업로드 실패', err);
      setError('프로필 사진 업로드에 실패했어요. 잠시 후 다시 시도해주세요.');
      setAvatarUrl(currentUser?.photoURL || '');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!avatarUrl || isUploadingAvatar) return;
    if (!window.confirm('프로필 사진을 삭제하고 기본 이미지로 되돌릴까요?')) return;

    setError(''); setMessage('');
    setIsUploadingAvatar(true);
    try {
      await updateProfile(currentUser, { photoURL: '' });
      await syncUserFromAuth();

      if (avatarStoragePathRef.current) {
        try {
          await deleteObject(ref(storage, avatarStoragePathRef.current));
        } catch (cleanupErr) {
          console.warn('스토리지 파일 정리 실패(무시 가능)', cleanupErr);
        }
        avatarStoragePathRef.current = null;
      }

      setAvatarUrl('');
      setMessage('프로필 사진이 삭제되었습니다.');
    } catch (err) {
      console.error('프로필 사진 삭제 실패', err);
      setError('프로필 사진 삭제에 실패했어요.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const pinnedCount = goals.filter((g) => g.isPinned).length;

  const handleTogglePin = async (goal) => {
    if (pinBusyId) return;
    const nextPinned = !goal.isPinned;
    if (nextPinned && pinnedCount >= 3) {
      alert('친구에게 보여줄 목표는 최대 3개까지 선택할 수 있어요.');
      return;
    }
    setPinBusyId(goal.id);
    const prevGoals = goals;
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, isPinned: nextPinned } : g)));
    try {
      await api.patch(`/goals/${goal.id}/pin`, { isPinned: nextPinned });
    } catch (err) {
      console.error('공개 설정 실패', err);
      alert(err.response?.data?.message || '설정을 저장하지 못했어요.');
      setGoals(prevGoals);
    } finally {
      setPinBusyId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', padding: '40px 6%', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <BackButton />

        <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 22px' }}>마이페이지</p>

        <div className="card" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '20px', marginBottom: '16px', padding: '26px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar-circle">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="프로필 사진" />
                ) : (
                  <span style={{ color: 'var(--primary-text)' }}><IconUser /></span>
                )}
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={isUploadingAvatar}
                  style={{
                    position: 'absolute', bottom: '-2px', left: '-2px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#fff', color: 'var(--danger-text)', border: '1.5px solid var(--danger-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isUploadingAvatar ? 'default' : 'pointer', opacity: isUploadingAvatar ? 0.6 : 1,
                  }}
                  aria-label="프로필 사진 삭제"
                >
                  <IconTrash />
                </button>
              )}

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--primary-strong)', color: '#fff', border: '2px solid var(--surface-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isUploadingAvatar ? 'default' : 'pointer', opacity: isUploadingAvatar ? 0.6 : 1,
                }}
                aria-label="프로필 사진 변경"
              >
                <IconCamera />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>닉네임</p>
              <h2 style={{ fontSize: 'var(--fs-xl)' }}>{currentUser?.displayName || '알 수 없음'}</h2>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <span className="badge badge-muted" style={{ fontSize: 'var(--fs-xs)' }}>전체 {stats.total}개</span>
                <span className="badge badge-primary" style={{ fontSize: 'var(--fs-xs)' }}>완료 {stats.completed}개</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">로그아웃</button>
        </div>

        {(message || error) && (
          <p style={{
            color: error ? 'var(--danger-text)' : 'var(--primary-text)', fontSize: 'var(--fs-base)',
            fontWeight: 600, margin: '0 0 16px',
          }}>
            {error || message}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>닉네임 변경</p>
              <input className="field" value={nickname} onChange={(e) => setNickname(e.target.value)} />
              <button onClick={handleNicknameChange} className="btn btn-primary btn-block">닉네임 저장</button>
            </div>

            <div className="card" style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
              background: 'var(--danger-soft)', boxShadow: '0 0 0 1px #E3B6AE',
            }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--danger-text)' }}>계정 삭제</p>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--danger-text)', opacity: 0.75 }}>
                삭제 전 현재 비밀번호를 오른쪽 "비밀번호 변경" 칸에 먼저 입력해주세요.
              </p>
              <button onClick={handleDeleteAccount} className="btn btn-danger" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                계정 삭제
              </button>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>비밀번호 변경</p>
            <input className="field" type="password" placeholder="현재 비밀번호" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <input className="field" type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={handlePasswordChange} className="btn btn-primary btn-block">비밀번호 변경</button>
          </div>

        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>친구에게 보여줄 목표</p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              최대 3개까지 선택할 수 있어요 ({pinnedCount}/3)
            </p>
          </div>
          {goals.length === 0 ? (
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>등록된 목표가 없어요.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {goals.map((g) => (
                <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!g.isPinned}
                    disabled={pinBusyId === g.id}
                    onChange={() => handleTogglePin(g)}
                  />
                  <span style={{ fontSize: 'var(--fs-base)', color: 'var(--text-h)' }}>{g.content}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;