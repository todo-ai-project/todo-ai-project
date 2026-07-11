import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import BackButton from '../components/BackButton';

function IconUser({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function Avatar({ photoURL, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--primary-text)',
    }}>
      {photoURL ? <img src={photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconUser size={size * 0.5} />}
    </div>
  );
}

function GoalRow({ friendId, goal, onReacted }) {
  const [busy, setBusy] = useState(false);
  const total = goal.totalTodos || 0;
  const done = goal.completedTodos || 0;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const isComplete = total > 0 && done === total;

  const react = async (type) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post(`/friends/${friendId}/goals/${goal.id}/react`, { type });
      if (res.data.success) onReacted(goal.id, res.data.data);
    } catch (err) {
      console.error('응원/축하 실패', err);
      alert('잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text-h)', margin: '0 0 6px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {goal.content}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '110px', height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: isComplete ? 'var(--sage-strong)' : 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{done}/{total}</span>
        </div>
      </div>

      {isComplete ? (
        <button
          onClick={() => react('congrats')}
          disabled={busy}
          className="btn btn-sm"
          style={{ background: 'var(--sage-soft)', color: 'var(--sage-text)', flexShrink: 0 }}
        >
          🎉 축하하기{goal.congratsCount ? ` ${goal.congratsCount}` : ''}
        </button>
      ) : (
        <button
          onClick={() => react('cheer')}
          disabled={busy}
          className="btn btn-sm"
          style={{ background: 'var(--slate-soft)', color: 'var(--slate-text)', flexShrink: 0 }}
        >
          응원하기{goal.cheerCount ? ` ${goal.cheerCount}` : ''}
        </button>
      )}
    </div>
  );
}

function FriendCard({ friend }) {
  const [goals, setGoals] = useState(null);
  const [open, setOpen] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      const res = await api.get(`/friends/${friend.id}/goals`);
      if (res.data.success) setGoals(res.data.data);
    } catch (err) {
      console.error('친구 목표 불러오기 실패', err);
      setGoals([]);
    }
  }, [friend.id]);

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!goals) loadGoals();
  };

  const handleReacted = (goalId, data) => {
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, cheerCount: data.cheerCount, congratsCount: data.congratsCount } : g));
  };

  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div onClick={handleToggle} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
        <Avatar photoURL={friend.photoURL} />
        <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--text-h)', margin: 0, flex: 1 }}>{friend.nickname}</p>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{open ? '접기 ▲' : '목표 보기 ▾'}</span>
      </div>

      {open && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          {goals === null ? (
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>불러오는 중...</p>
          ) : goals.length === 0 ? (
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>아직 등록한 목표가 없어요.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {goals.map((g) => (
                <GoalRow key={g.id} friendId={friend.id} goal={g} onReacted={handleReacted} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Friends() {
  const [tab, setTab] = useState('friends'); // friends | requests | add
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [sentTo, setSentTo] = useState([]);

  const loadFriends = useCallback(async () => {
    try {
      const res = await api.get('/friends');
      if (res.data.success) setFriends(res.data.data);
    } catch (err) {
      console.error('친구 목록 불러오기 실패', err);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const res = await api.get('/friends/requests/received');
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error('친구 요청 불러오기 실패', err);
    }
  }, []);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, [loadFriends, loadRequests]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.get('/users/search', { params: { nickname: searchValue.trim() } });
      if (res.data.success) setSearchResults(res.data.data);
    } catch (err) {
      console.error('사용자 검색 실패', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (toUserId) => {
    try {
      const res = await api.post('/friends/requests', { toUserId });
      if (res.data.success) setSentTo((prev) => [...prev, toUserId]);
    } catch (err) {
      console.error('친구 요청 실패', err);
      alert(err.response?.data?.message || '친구 요청에 실패했어요.');
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await api.post(`/friends/requests/${requestId}/accept`);
      if (res.data.success) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        loadFriends();
      }
    } catch (err) {
      console.error('수락 실패', err);
      alert('수락에 실패했어요.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await api.post(`/friends/requests/${requestId}/reject`);
      if (res.data.success) setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error('거절 실패', err);
      alert('거절에 실패했어요.');
    }
  };

  const tabs = [
    { key: 'friends', label: `내 친구 ${friends.length}` },
    { key: 'requests', label: `받은 요청${requests.length > 0 ? ` ${requests.length}` : ''}` },
    { key: 'add', label: '친구 추가' },
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%', padding: '40px 6%', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1440px', margin: '0' }}>
        <BackButton />
        <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 22px' }}>친구</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="btn btn-sm"
              style={{
                background: tab === t.key ? 'var(--primary-strong)' : 'var(--surface-soft)',
                color: tab === t.key ? '#fff' : 'var(--text)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'friends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {friends.length === 0 ? (
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)', textAlign: 'center', marginTop: '30px' }}>
                아직 친구가 없어요. "친구 추가" 탭에서 닉네임으로 찾아보세요!
              </p>
            ) : (
              friends.map((f) => <FriendCard key={f.id} friend={f} />)
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {requests.length === 0 ? (
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--text-muted)', textAlign: 'center', marginTop: '30px' }}>
                받은 친구 요청이 없어요.
              </p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar photoURL={r.fromUser.photoURL} />
                  <p style={{ flex: 1, fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
                    {r.fromUser.nickname}
                  </p>
                  <button onClick={() => handleAccept(r.id)} className="btn btn-primary btn-sm">수락</button>
                  <button onClick={() => handleReject(r.id)} className="btn btn-ghost btn-sm">거절</button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'add' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              <input
                className="field"
                placeholder="닉네임으로 검색"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} className="btn btn-primary" disabled={isSearching}>
                {isSearching ? '검색중...' : '검색'}
              </button>
            </div>

            {searchResults === null ? (
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>닉네임을 입력하고 검색해보세요.</p>
            ) : searchResults.length === 0 ? (
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>일치하는 사용자가 없어요.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {searchResults.map((u) => {
                  const alreadySent = sentTo.includes(u.id);
                  const alreadyFriend = friends.some((f) => f.id === u.id);
                  return (
                    <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar photoURL={u.photoURL} />
                      <p style={{ flex: 1, fontSize: 'var(--fs-base)', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
                        {u.nickname}
                      </p>
                      {alreadyFriend ? (
                        <span className="badge badge-sage">이미 친구</span>
                      ) : alreadySent ? (
                        <span className="badge badge-muted">요청 보냄</span>
                      ) : (
                        <button onClick={() => handleSendRequest(u.id)} className="btn btn-primary btn-sm">친구 요청</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;