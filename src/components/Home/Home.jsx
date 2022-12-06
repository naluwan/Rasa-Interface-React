import * as React from 'react';
import { Link } from 'react-router-dom';
import style from './Home.module.scss';

const Home = () => {
  return (
    <div className={style.root}>
      <div className={style.container}>
        <h1>開始訓練你的機器人吧！</h1>
        <div className={style.Button}>
          <Link className="nav-link" to="/stories">
            <div>故事流程</div>
          </Link>
        </div>
      </div>
      <div className={style.sButtonBlock}>
        <div className={style.sButton}>Chat bot 教學</div>
      </div>
    </div>
  );
};

export default React.memo(Home);
