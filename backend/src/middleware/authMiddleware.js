const { admin } = require('../config/firebase');

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.split(' ')[1]);
    req.userID = decoded.uid;
    req.nickname = decoded.name || null;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "토큰이 유효하지 않습니다." });
  }
};