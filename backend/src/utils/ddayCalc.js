//backend>src>utils>ddayCals.js
const getDDay = (deadline) => {
    // 날짜가 없으면 계산할 수 없으니 null 반환
    if (!deadline) return null;

    // 입력받은 날짜를 Date 객체로 변환
    const targetDate = new Date(deadline);
    const today = new Date();

    // 시간 차이 때문에 계산이 꼬이지 않도록 '시/분/초'를 모두 0으로 초기화
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // 두 날짜의 밀리초(ms) 차이를 구함
    const diffTime = targetDate.getTime() - today.getTime();

    // 밀리초를 '일(day)' 단위로 변환 (1000ms * 60초 * 60분 * 24시간)
    // Math.ceil을 써서 오늘 기준 남은 날짜를 올림 처리
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

// 다른 파일(컨트롤러 등)에서 가져다 쓸 수 있게 내보내기
module.exports = { getDDay };