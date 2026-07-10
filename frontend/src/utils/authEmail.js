export const EMAIL_DOMAIN = '@todoapp.local';

export const toFakeEmail = (nick) => {
  const bytes = new TextEncoder().encode(nick.trim().toLowerCase());
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex}${EMAIL_DOMAIN}`;
};