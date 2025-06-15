/**
 * 日本時間（JST）の現在時刻をISO形式で返す
 * @returns {string} 日本時間のISO形式文字列
 */
export function getJSTISOString(): string {
  const now = new Date();
  const jstOffset = 9 * 60; // JSTはUTC+9
  const jstTime = new Date(now.getTime() + jstOffset * 60000);
  return jstTime.toISOString();
} 