//backend>src>app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. 환경변수 설정
dotenv.config();

// 2. Firebase 연결
require('./config/firebase');

// 3. 라우터 및 미들웨어 불러오기
const todoRouter = require('./routes/todo');
const goalRouter = require('./routes/goal');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// 4. 미들웨어 설정
// 반드시 라우팅 설정보다 위에 있어야 합니다.
app.use(cors());
app.use(express.json());

// 5. 기본 접속 테스트
app.get('/', (req, res) => {
    res.status(200).send('🚀 AI 투두 메이트 서버가 가동 중입니다!');
});

// 6. API 라우팅 (인증 필요)
app.use('/api/todos', authMiddleware, todoRouter);
app.use('/api/goals', authMiddleware, goalRouter);

// 7. 404 경로 처리
app.use((req, res) => {
    res.status(404).json({ success: false, message: "경로를 찾을 수 없습니다." });
});

// 8. 글로벌 서버 에러 핸들러
app.use((err, req, res, next) => {
    console.error("🚨 서버 내부 에러 발생:", err.stack);
    res.status(500).json({ success: false, message: "서버 내부 에러 발생" });
});

// 9. 서버 실행 설정
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log('-----------------------------------------');
    console.log(`✅ 서버가 성공적으로 가동되었습니다!`);
    console.log(`🔗 접속 주소 : http://localhost:${PORT}`);
    console.log(`[GET]  접속 확인 : http://localhost:${PORT}/`);
    console.log(`[POST] AI 추천   : http://localhost:${PORT}/api/todos/generate`);
    console.log('-----------------------------------------');
}).on('error', (err) => {
    // 포트가 이미 사용 중인 경우 등 실행 에러 처리
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 에러: ${PORT}번 포트가 이미 사용 중입니다. 다른 포트를 사용하거나 해당 프로세스를 종료하세요.`);
    } else {
        console.error(`❌ 서버 실행 중 에러가 발생했습니다:`, err);
    }
});

// 예기치 못한 종료 방지
process.on('uncaughtException', (err) => {
    console.error('🚨 예상치 못한 예외 발생 (서버 유지 중):', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 처리되지 않은 프로미스 거부:', reason);
});