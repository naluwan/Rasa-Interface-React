import { fetchAllAction } from 'services/api';

// 機器人回覆代號產生器
export const randomBotResAction = async () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = lower.toUpperCase();
  const num = '1234567890';
  const randomText = lower + upper + num;
  let text = 'utter_';
  for (let i = 0; i < 9; i += 1) {
    text += randomText[Math.floor(Math.random() * randomText.length)];
  }
  let actionsArr = [];
  // 回資料庫查找所有actions
  actionsArr = await fetchAllAction();
  // 驗證action是否重複
  if (actionsArr.some((action) => action === text)) {
    randomBotResAction();
  }
  return text;
};
