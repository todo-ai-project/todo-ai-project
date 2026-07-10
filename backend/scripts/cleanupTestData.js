// backend/scripts/cleanupTestData.js
require('dotenv').config({ path: '../.env' }); // .env 파일의 실제 경로에 맞게 수정
const { db } = require('../src/config/firebase');

async function deleteCollection(name) {
  const snapshot = await db.collection(name).get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`${name}: ${snapshot.size}개 삭제 완료`);
}

(async () => {
  await deleteCollection('todos');
  await deleteCollection('goals');
  process.exit(0);
})();