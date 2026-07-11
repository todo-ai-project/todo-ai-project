//backend>src>controllers>goalController.js
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
      userID: req.userID,
      isPinned: false,
      archived: false,
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

// PATCH /goals/:id/pin  body: { isPinned: boolean }
// 친구에게 보여줄 목표 선택 (최대 3개)
exports.togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    const goalRef = db.collection('goals').doc(id);
    const goalDoc = await goalRef.get();
    if (!goalDoc.exists) {
      return res.status(404).json({ success: false, message: "목표를 찾을 수 없습니다." });
    }
    if (goalDoc.data().userID !== req.userID) {
      return res.status(403).json({ success: false, message: "권한이 없습니다." });
    }

    if (isPinned) {
      const pinnedSnapshot = await db.collection('goals')
        .where('userID', '==', req.userID)
        .where('isPinned', '==', true)
        .get();
      const otherPinnedCount = pinnedSnapshot.docs.filter(d => d.id !== id).length;
      if (otherPinnedCount >= 3) {
        return res.status(400).json({ success: false, message: "친구에게 보여줄 목표는 최대 3개까지 선택할 수 있어요." });
      }
    }

    await goalRef.update({ isPinned: !!isPinned });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [TOGGLE PIN ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /goals/:id/archive  body: { archived: boolean }
exports.toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;

    const goalRef = db.collection('goals').doc(id);
    const goalDoc = await goalRef.get();
    if (!goalDoc.exists) {
      return res.status(404).json({ success: false, message: "목표를 찾을 수 없습니다." });
    }
    if (goalDoc.data().userID !== req.userID) {
      return res.status(403).json({ success: false, message: "권한이 없습니다." });
    }

    const updateData = { archived: !!archived };
    if (archived) updateData.isPinned = false; // 보관하면 친구 공개도 자동 해제

    await goalRef.update(updateData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [TOGGLE ARCHIVE ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};