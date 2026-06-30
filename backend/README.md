## 🛠 환경 변수 설정 (.env)

이 프로젝트는 보안을 위해 `.env` 파일을 공유하지 않습니다. 
프로젝트를 실행하려면 루트 폴더(`backend/`)에 `.env` 파일을 생성하고 아래 항목들을 채워주세요.

### 필수 항목
- `PORT`: 서버 포트 번호 (기본값: 5000)
- `GEMINI_API_KEY`: Google Gemini AI 사용을 위한 API 키
- `FIREBASE_PROJECT_ID`: 파이어베이스 프로젝트 ID
- `FIREBASE_PRIVATE_KEY`: 파이어베이스 비공개 키
- `FIREBASE_CLIENT_EMAIL`: 파이어베이스 클라이언트 이메일

## 📂 파일 구조 설명
- `src/config/firebase.js`: Firebase DB 연결 설정
- `src/controllers/aiController.js`: Gemini AI 로직
- `src/utils/ddayCalc.js`: 날짜 D-Day 변환 도구
- `src/routes/goal.js`: 목표 설정 및 AI 생성 요청 라우트
