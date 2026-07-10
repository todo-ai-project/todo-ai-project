const { db } = require('../config/firebase');

exports.getGoals = async (req, res) => {
  try {
    const snapshot = await db.collection('goals')
      .where('userID', '==', req.userID)
      .orderBy('createdAt', 'desc')
      .get();

    const goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    console.error("❌ [GET GOALS ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { content, deadline } = req.body;

    const newGoal = {
      content,
      createdAt: new Date(),
      userID: req.userID
    };

    if (deadline) {
      const parsedDeadline = new Date(deadline);
      if (!isNaN(parsedDeadline.getTime())) {
        newGoal.deadline = parsedDeadline;
      }
    }

    const docRef = await db.collection('goals').add(newGoal);
    res.status(201).json({ success: true, id: docRef.id, message: "목표가 성공적으로 저장되었습니다!" });
  } catch (error) {
    console.error("❌ [CREATE GOAL ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};