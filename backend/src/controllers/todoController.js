//backend>src>controllers>todoController.js
const { db } = require('../config/firebase');

// 1. 모든 할 일 목록 가져오기 (추가됨)
exports.getTodos = async (req, res) => {
  try {
    // 생성일자(createdAt) 기준 내림차순 정렬하여 가져오기
    const snapshot = await db.collection('todos').orderBy('createdAt', 'desc').get();
    
    const todos = snapshot.docs.map(doc => ({
      id: doc.id, // Firestore의 문서 ID를 id로 할당 (삭제 시 필요)
      text: doc.data().content, // 프론트엔드 변수명에 맞춤
      targetDate: doc.data().targetDate || "",
      completed: doc.data().isDone || false,
      category: doc.data().category,
      ...doc.data()
    }));

    res.status(200).json({ success: true, data: todos });
  } catch (error) {
    console.error("❌ [GET ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. 개별 할 일 생성
exports.createTodo = async (req, res) => {
  try {
    const { content, goalID, order, userID, targetDate } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "내용 누락" });

    const newTodo = {
      content,
      goalID: goalID || "default",
      order: order || 0,
      isDone: false,
      userID: userID || "anon_user_789",
      targetDate: targetDate || "",
      createdAt: new Date()
    };

    const docRef = await db.collection('todos').add(newTodo);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. 할 일 삭제 (실시간 DB 반영용)
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID가 필요합니다." });
    }

    // Firestore에서 문서 삭제
    await db.collection('todos').doc(id).delete();
    console.log(`🗑️ [Firestore] 삭제 성공: ${id}`);

    return res.status(200).json({
      success: true,
      message: "성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error("❌ [DELETE ERROR]", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};