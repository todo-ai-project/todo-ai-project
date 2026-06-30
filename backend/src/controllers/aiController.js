const model = require('../config/gemini'); // ⭐️ 중괄호 없이 정확히 호출
const { db } = require('../config/firebase');

exports.generateTodoMate = async (req, res) => {
    const { userGoal, goalID, userID } = req.body;

    try {
        if (!userGoal) {
            return res.status(400).json({ 
                success: false, 
                message: "목표(userGoal)가 입력되지 않았습니다." 
            });
        }

        console.log(`[AI 요청 시작] 목표: ${userGoal}`);

        const prompt = `
너는 10년 경력의 베테랑 목표 달성 코치야. 
사용자의 목표 "${userGoal}"을 분석하여 30일 안에 반드시 성공할 수 있는 최적의 9단계 액션 플랜을 설계하라.

[미션: 마감 기한 중심 TODO 리스트 생성]
1. 구조 (카테고리별 3개씩, 총 9개):
   - learning_plan: 전략 수립 및 지식 습득
   - practical_goals: 직접적인 핵심 실행 행동
   - environment_setup: 지속 가능한 시스템 구축

2. 필수 형식:
   - 각 항목은 반드시 "D-숫자: 할 일 내용" 형식을 지킬 것.
   - 숫자는 30부터 1까지 논리적 순서로 배치.
   - 모든 문장은 한국어 명사형 종결 (~하기, ~설정, ~완료).
   - 각 문장은 공백 포함 25자 이내.

[출력 제한]
- 반드시 아래 예시와 같은 순수 JSON 데이터만 출력하라. 
- 마크다운 기호를 포함하지 마라.

{
  "learning_plan": ["D-30: 목표 구체화 및 자료 수집", "D-25: 핵심 전략 로드맵 작성", "D-20: 필요 도구 및 강의 선별"],
  "practical_goals": ["D-15: 매일 1시간 집중 실행하기", "D-10: 중간 점검 및 피드백 반영", "D-5: 최종 결과물 초안 완성"],
  "environment_setup": ["D-30: 방해 요소 제거 및 환경 정리", "D-15: 스터디 그룹 또는 커뮤니티 가입", "D-1: 최종 성과 공유 및 보상 부여"]
}
        `;

        // ⭐️ model이 정상적으로 로드되었다면 여기서 함수가 실행됩니다.
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();
        
        console.log("📩 Gemini 응답 수신 완료");

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI 응답에서 유효한 JSON 형식을 찾을 수 없습니다.");
        }
        
        const parsedData = JSON.parse(jsonMatch[0]);

        const batch = db.batch();
        const categories = ['learning_plan', 'practical_goals', 'environment_setup'];
        const savedTodos = [];

        categories.forEach(cat => {
            if (parsedData[cat] && Array.isArray(parsedData[cat])) {
                parsedData[cat].forEach((taskContent, index) => {
                    const todoRef = db.collection('todos').doc();
                    const todoData = {
                        content: taskContent,
                        category: cat,
                        goalID: goalID || "ai_generated_goal",
                        userID: userID || "test_user_1",
                        isDone: false,
                        order: index,
                        createdAt: new Date()
                    };
                    batch.set(todoRef, todoData);
                    savedTodos.push({ id: todoRef.id, ...todoData });
                });
            }
        });

        await batch.commit();
        console.log("✅ Firestore 저장 완료");

        return res.status(200).json({
            success: true,
            message: "AI 추천 할 일이 생성되어 DB에 저장되었습니다.",
            data: savedTodos 
        });

    } catch (error) {
        console.error("❌ AI Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "AI 플랜 생성 중 문제가 발생했습니다.",
            error: error.message
        });
    }
};