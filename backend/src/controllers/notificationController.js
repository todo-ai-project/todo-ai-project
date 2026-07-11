//backend>src>controllers>notificationController.js
const { db } = require('../config/firebase');

// GET /notifications
exports.getNotifications = async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('recipientUserId', '==', req.userID)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error("❌ [GET NOTIFICATIONS ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('recipientUserId', '==', req.userID)
      .where('isRead', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
    await batch.commit();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [MARK ALL READ ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};