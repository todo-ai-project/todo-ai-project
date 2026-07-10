const { db } = require('../config/firebase');

// 1. 내 할 일 목록만 가져오기
exports.getTodos = async (req, res) => {
  try {
    const snapshot = await db.collection('todos')
      .where('userID', '==', req.userID)
      .orderBy('createdAt', 'desc')
      .get();

    const todos = snapshot.docs.map(doc => ({
      id: doc.id,
      text: doc.data().content,
      targetDate: doc.data().targetDate || "",
      completed: doc.data().isDone || false,
      category: doc.data().category,
      goalID: doc.data().goalID,
      ...doc.data()
    }));

    res.status(200).json({ success: true, data: todos });
  } catch (error) {
    console.error("❌ [GET ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. 개별 할 일 생성 (userID는 토큰에서 가져옴, 클라이언트가 보내도 무시)
exports.createTodo = async (req, res) => {
  try {
    const { content, goalID, order, targetDate } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "내용 누락" });

    const newTodo = {
      content,
      goalID: goalID || "default",
      order: order || 0,
      isDone: false,
      userID: req.userID,
      targetDate: targetDate || "",
      createdAt: new Date()
    };

    const docRef = await db.collection('todos').add(newTodo);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. 할 일 수정 (완료 체크, 텍스트/날짜 수정) — 새로 추가
exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, targetDate, isDone } = req.body;

    const todoRef = db.collection('todos').doc(id);
    const todoDoc = await todoRef.get();

    if (!todoDoc.exists) {
      return res.status(404).json({ success: false, message: "할 일을 찾을 수 없습니다." });
    }
    // 본인 소유 데이터인지 확인
    if (todoDoc.data().userID !== req.userID) {
      return res.status(403).json({ success: false, message: "권한이 없습니다." });
    }

    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (targetDate !== undefined) updateData.targetDate = targetDate;
    if (isDone !==