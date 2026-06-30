//backend>config>firebase.js
const admin = require("firebase-admin");
require("dotenv").config();

// 환경 변수에서 값 가져오기
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 중요: \n을 실제 줄바꿈으로 변환
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("🔥 Firebase 연결 성공!");
} catch (error) {
  console.error("❌ Firebase 연결 실패:", error);
}

const db = admin.firestore();
module.exports = { admin, db };