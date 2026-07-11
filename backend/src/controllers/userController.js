//backend>src>controllers>userController.js
const { db, admin } = require('../config/firebase');
const { toFakeEmail } = require('../utils/authEmail');

// GET /users/search?nickname=xxx
exports.searchUsers = async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ success: false, message: "검색어를 입력해주세요." });
    }
    const keyword = nickname.trim().toLowerCase();

    const snapshot = await db.collection('users').limit(500).get();

    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.id !== req.userID && u.nicknameLower && u.nicknameLower.includes(keyword))
      .slice(0, 20)
      .map(u => ({ id: u.id, nickname: u.nickname, photoURL: u.photoURL || null }));

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("❌ [SEARCH USERS ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /users/me
exports.updateMe = async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ success: false, message: "닉네임을 입력해주세요." });
    }
    const trimmed = nickname.trim();
    const newEmail = toFakeEmail(trimmed);

    // Admin 권한으로 로그인 이메일 + displayName을 직접 변경
    // (클라이언트 updateEmail()은 이메일 인증을 요구해서 가짜 이메일 구조엔 쓸 수 없음 -> 서버에서 우회)
    try {
      await admin.auth().updateUser(req.userID, {
        email: newEmail,
        displayName: trimmed,
      });
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        return res.status(400).json({ success: false, message: "이미 사용 중인 닉네임입니다." });
      }
      throw err;
    }

    await db.collection('users').doc(req.userID).set({
      nickname: trimmed,
      nicknameLower: trimmed.toLowerCase(),
      updatedAt: new Date(),
    }, { merge: true });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [UPDATE ME ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};