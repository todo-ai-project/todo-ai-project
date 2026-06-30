const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 사용자가 지정한 gemini-2.5-flash 버전 유지
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
});

// 모델 그 자체를 내보냅니다.
module.exports = model;