const { db } = require('../config/firebase');

exports.createGoal = async (req, res) => {
  try {
    const { content, deadline } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "목표 내용이 필요합니다." });

    const newGoal = {
      content,
      deadline: deadline ? new Date(deadline) : null,
      createdAt: new Date(),
      userID: req.userID
    };

    const docRef = await db.collection('goals').add(newGoal);
    res.status(201).json({ success: true, id: docRef.id, message: "목표가 성공적으로 저장되었습니다!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 내 목표 목록 조회 — 신규
exports.getGoals = async (req, res) => {
  try {
    const snapshot = await db.collection('goals')
      .where('userID', '==', req.userID)
      .orderBy('createdAt', 'desc')
      .get();

    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};