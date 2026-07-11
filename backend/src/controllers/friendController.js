//backend>src>controllers>friendController.js
const { db, admin } = require('../config/firebase');

// 두 uid로 friendships 문서의 고유 ID를 생성 -> 친구 여부 확인을 O(1) get()으로 처리
function friendshipId(a, b) {
  return [a, b].sort().join('_');
}

async function assertFriendship(uidA, uidB) {
  const doc = await db.collection('friendships').doc(friendshipId(uidA, uidB)).get();
  return doc.exists;
}

// -------------------- 친구 요청 --------------------

// POST /friends/requests
exports.sendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = req.userID;

    if (!toUserId) {
      return res.status(400).json({ success: false, message: "toUserId가 필요합니다." });
    }
    if (toUserId === fromUserId) {
      return res.status(400).json({ success: false, message: "본인에게 친구 요청을 보낼 수 없습니다." });
    }

    const toUserDoc = await db.collection('users').doc(toUserId).get();
    if (!toUserDoc.exists) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    const isFriend = await assertFriendship(fromUserId, toUserId);
    if (isFriend) {
      return res.status(400).json({ success: false, message: "이미 친구입니다" });
    }

    const existingSnap = await db.collection('friend_requests')
      .where('fromUserId', '==', fromUserId)
      .where('toUserId', '==', toUserId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    if (!existingSnap.empty) {
      return res.status(400).json({ success: false, message: "이미 요청을 보냈습니다" });
    }

    // 상대방이 나에게 먼저 요청을 보낸 경우 -> 받은 요청함에서 수락하도록 안내 (스펙 외 추가한 예외처리)
    const reverseSnap = await db.collection('friend_requests')
      .where('fromUserId', '==', toUserId)
      .where('toUserId', '==', fromUserId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    if (!reverseSnap.empty) {
      return res.status(400).json({ success: false, message: "상대방이 이미 나에게 친구 요청을 보냈어요. 받은 요청함에서 수락해주세요." });
    }

    await db.collection('friend_requests').add({
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [SEND FRIEND REQUEST ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /friends/requests/received
exports.getReceivedRequests = async (req, res) => {
  try {
    const snapshot = await db.collection('friend_requests')
      .where('toUserId', '==', req.userID)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    const requests = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const fromUserDoc = await db.collection('users').doc(data.fromUserId).get();
      const fromUser = fromUserDoc.exists
        ? { id: fromUserDoc.id, nickname: fromUserDoc.data().nickname, photoURL: fromUserDoc.data().photoURL || null }
        : { id: data.fromUserId, nickname: '알 수 없음', photoURL: null };

      return { id: doc.id, fromUser, createdAt: data.createdAt };
    }));

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ [GET RECEIVED REQUESTS ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /friends/requests/:id/accept
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqRef = db.collection('friend_requests').doc(id);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      return res.status(404).json({ success: false, message: "요청을 찾을 수 없습니다." });
    }
    const data = reqDoc.data();
    if (data.toUserId !== req.userID) {
      return res.status(403).json({ success: false, message: "권한이 없습니다." });
    }
    if (data.status !== 'pending') {
      return res.status(400).json({ success: false, message: "이미 처리된 요청입니다." });
    }

    await reqRef.update({ status: 'accepted', updatedAt: new Date() });

    await db.collection('friendships').doc(friendshipId(data.fromUserId, data.toUserId)).set({
      members: [data.fromUserId, data.toUserId],
      createdAt: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [ACCEPT REQUEST ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /friends/requests/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqRef = db.collection('friend_requests').doc(id);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      return res.status(404).json({ success: false, message: "요청을 찾을 수 없습니다." });
    }
    const data = reqDoc.data();
    if (data.toUserId !== req.userID) {
      return res.status(403).json({ success: false, message: "권한이 없습니다." });
    }
    if (data.status !== 'pending') {
      return res.status(400).json({ success: false, message: "이미 처리된 요청입니다." });
    }

    await reqRef.update({ status: 'rejected', updatedAt: new Date() });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [REJECT REQUEST ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// -------------------- 친구 목록 / 목표 / 반응 --------------------

// GET /friends
exports.getFriends = async (req, res) => {
  try {
    const snapshot = await db.collection('friendships')
      .where('members', 'array-contains', req.userID)
      .get();

    const friendIds = snapshot.docs.map(doc => doc.data().members.find(m => m !== req.userID));

    if (friendIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const friendDocs = await Promise.all(friendIds.map(id => db.collection('users').doc(id).get()));

    const friends = friendDocs
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, nickname: doc.data().nickname, photoURL: doc.data().photoURL || null }));

    res.status(200).json({ success: true, data: friends });
  } catch (error) {
    console.error("❌ [GET FRIENDS ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /friends/:friendId/goals
// GET /friends/:friendId/goals — 이제 isPinned==true인 것만 반환
exports.getFriendGoals = async (req, res) => {
  try {
    const { friendId } = req.params;

    const isFriend = await assertFriendship(req.userID, friendId);
    if (!isFriend) {
      return res.status(403).json({ success: false, message: "친구가 아닙니다." });
    }

    const goalsSnapshot = await db.collection('goals')
      .where('userID', '==', friendId)
      .where('isPinned', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const goals = await Promise.all(goalsSnapshot.docs.map(async (doc) => {
      const goal = doc.data();

      const todosSnapshot = await db.collection('todos')
        .where('userID', '==', friendId)
        .where('goalID', '==', doc.id)
        .get();

      return {
        id: doc.id,
        content: goal.content,
        totalTodos: todosSnapshot.size,
        completedTodos: todosSnapshot.docs.filter(t => t.data().isDone).length,
        cheerCount: goal.cheerCount || 0,
        congratsCount: goal.congratsCount || 0,
      };
    }));

    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    console.error("❌ [GET FRIEND GOALS ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /friends/:friendId/goals/:goalId/react
// POST /friends/:friendId/goals/:goalId/react
exports.reactToGoal = async (req, res) => {
  try {
    const { friendId, goalId } = req.params;
    const { type } = req.body;
    const myId = req.userID;

    if (!['cheer', 'congrats'].includes(type)) {
      return res.status(400).json({ success: false, message: "type은 cheer 또는 congrats여야 합니다." });
    }

    const isFriend = await assertFriendship(myId, friendId);
    if (!isFriend) {
      return res.status(403).json({ success: false, message: "친구가 아닙니다." });
    }

    const goalRef = db.collection('goals').doc(goalId);
    const goalDoc = await goalRef.get();
    if (!goalDoc.exists || goalDoc.data().userID !== friendId) {
      return res.status(403).json({ success: false, message: "해당 친구의 목표가 아닙니다." });
    }

    const reactionRef = db.collection('goal_reactions').doc(`${goalId}_${myId}_${type}`);

    let alreadyReacted = false;
    try {
      await reactionRef.create({ goalId, reactedByUserId: myId, type, createdAt: new Date() });
    } catch (err) {
      alreadyReacted = true;
    }

    if (!alreadyReacted) {
      const countField = type === 'cheer' ? 'cheerCount' : 'congratsCount';
      await goalRef.set({ [countField]: admin.firestore.FieldValue.increment(1) }, { merge: true });

      // 알림 생성
      const actorDoc = await db.collection('users').doc(myId).get();
      const actorNickname = actorDoc.exists ? actorDoc.data().nickname : '친구';

      await db.collection('notifications').add({
        recipientUserId: friendId,
        actorUserId: myId,
        actorNickname,
        type,
        goalId,
        goalContent: goalDoc.data().content,
        isRead: false,
        createdAt: new Date(),
      });
    }

    const updatedGoalDoc = await goalRef.get();
    const updatedData = updatedGoalDoc.data();

    res.status(200).json({
      success: true,
      data: {
        cheerCount: updatedData.cheerCount || 0,
        congratsCount: updatedData.congratsCount || 0,
      },
    });
  } catch (error) {
    console.error("❌ [REACT TO GOAL ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};