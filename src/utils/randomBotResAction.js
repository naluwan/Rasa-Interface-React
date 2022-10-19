// 機器人回覆代號產生器
export const randomBotResAction = (actions) => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = lower.toUpperCase();
  const num = '1234567890';
  const randomText = lower + upper + num;
  let text = 'utter_';
  for (let i = 0; i < 9; i += 1) {
    text += randomText[Math.floor(Math.random() * randomText.length)];
  }
  // 驗證action是否重複
  if (actions.some((action) => action === text)) {
    randomBotResAction();
  }
  return text;
};
