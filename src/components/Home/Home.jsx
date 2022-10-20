import * as React from 'react';
import style from './Home.module.scss';

const Home = () => {
  return (
    <div className={style.root}>
      <div className={style.container}>
        <h1>歡迎使用ChatBot</h1>
        <h4>
          請點擊上方<strong>故事流程</strong>進行故事流程設定
        </h4>
        <div className={style.versionInfo}>
          <h5>版本更新資訊：</h5>
          <ul>
            <li>
              新增故事<strong>儲存</strong>後，可直接點選新增故事繼續新增
            </li>
            <li>創建故事時，如發生錯誤，不會再將原本填的故事流程移除</li>
            <li>機器人回覆內容可使用純文字或按鈕</li>
            <li>
              如果誤刪故事，可恢復<strong>最後一筆</strong>刪除的故事
            </li>
            <li>執行訓練功能</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Home);
