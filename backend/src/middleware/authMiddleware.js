//backend>src>middleware>authMiddleware.js
const { admin, db } = require('../config/firebase');

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.split(' ')[1]);
    req.userID = decoded.uid;

    const userRef = db.collection('users').doc(req.userID);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // 최초 로그인: ID 토큰의 name 클레임은 가입 직후엔 아직 비어있을 수 있으므로
      // Admin SDK로 Firebase Auth의 실제 displayName을 직접 조회해서 정확한 값으로 생성
      const authUser = await admin.auth().getUser(req.userID);
      const nickname = authUser.displayName || `user_${req.userID.slice(0, 6)}`;
      await userRef.set({
        nickname,
        nicknameLower: nickname.toLowerCase(),
        photoURL: authUser.photoURL || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (/^user_[a-zA-Z0-9]{6}$/.test(userDoc.data().nickname || '')) {
      // 예전 버그로 임시 닉네임이 저장된 계정 -> 실제 displayName으로 자동 복구 (1회성 자가치유)
      const authUser = await admin.auth().getUser(req.userID);
      if (authUser.displayName && authUser.displayName !== userDoc.data().nickname) {
        await userRef.set({
          nickname: authUser.displayName,
          nicknameLower: authUser.displayName.toLowerCase(),
          updatedAt: new Date(),
        }, { merge: true });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "토큰이 유효하지 않습니다." });
  }
};