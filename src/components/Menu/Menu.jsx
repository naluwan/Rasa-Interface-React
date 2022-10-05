import * as React from 'react';
import { Link } from 'react-router-dom';
import style from './Menu.module.scss';

const Menu = () => {
  return (
    <div>
      <div className={style.itemLi}>
        <Link className="nav-link" to="/conversations">
          <span>對話紀錄:</span>
          <span className={style.btnSet}>設定</span>
        </Link>
      </div>
      <div className={style.itemLi}>
        <Link className="nav-link" to="/stories">
          <span>故事流程:</span>
          <span className={style.btnSet}>設定</span>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(Menu);
