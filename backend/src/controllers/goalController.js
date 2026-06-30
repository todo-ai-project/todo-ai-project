//backend>src>controllers>goalController.js
const { db } = require('../config/firebase');

exports.createGoal = async (req, res) => {
  try {
    const { content, deadline, userID } = req.body; // 클라이언트가 보낸 데이터

    const newGoal = {
      content,
      deadline: new Date(deadline), // 문자열로 들어온 날짜를 Date 객체로 변환
      createdAt: new Date(),
      userID: userID || "anon_user_default" // 유저 ID가 없으면 기본값
    };

    const docRef = await db.collection('goals').add(newGoal);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      message: "목표가 성공적으로 저장되었습니다!"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};