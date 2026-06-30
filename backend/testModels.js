//backend>testModels.js
require("dotenv").config();

async function listGeminiModels() {
  try {
    // v1beta 버전을 사용하는 것이 가장 최신 모델을 확인하기 좋습니다.
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (data.error) {
      console.error("❌ 에러 발생:", data.error.message);
      return;
    }

    console.log("✅ 사용 가능한 모델 목록:");
    data.models.forEach((model) => {
      console.log(`- 모델명: ${model.name}`);
      console.log(`  설명: ${model.description}`);
      console.log(`  지원 기능: ${model.supportedGenerationMethods.join(", ")}`);
      console.log("-----------------------------------------");
    });
  } catch (err) {
    console.error("🚨 네트워크 에러:", err.message);
  }
}

listGeminiModels();