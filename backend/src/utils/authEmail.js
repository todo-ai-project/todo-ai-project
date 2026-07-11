//backend>src>utils>authEmail.js
const EMAIL_DOMAIN = '@todoapp.local';

// 프론트의 utils/authEmail.js의 toFakeEmail과 반드시 동일한 결과가 나와야 함
function toFakeEmail(nickname) {
  const hex = Buffer.from(nickname.trim().toLowerCase(), 'utf8').toString('hex');
  return `${hex}${EMAIL_DOMAIN}`;
}

module.exports = { toFakeEmail };