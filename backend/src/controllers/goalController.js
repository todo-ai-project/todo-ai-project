const { db } = require('../config/firebase');

exports.createGoal = async (req, res) => {
  try {
    const { content, deadline } = req.body;

    const newGoal = {
      content,
      deadline: new Date(deadline),
      createdAt: new Date(),
      userID: req.userID
    };

    const docRef = await db.collection('goals').add(newGoal);
    res.status(201).json({ success: true, id: docRef.id, message: "목표가 성공적으로 저장되었습니다!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};