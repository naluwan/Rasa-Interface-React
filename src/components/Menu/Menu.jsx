import * as React from 'react';
import { NavLink } from 'react-router-dom';
import style from './Menu.module.scss';

const Menu: React.FC<MenuProps> = () => {
  return (
    <div>
      <div className={style.itemLi}>
        <NavLink className="nav-link" to="/conversations">
          <span>對話紀錄:</span>
          <span className={style.btnSet}>設定</span>
        </NavLink>
      </div>
      <div className={style.itemLi}>
        <NavLink className="nav-link" to="/stories">
          <span>故事流程:</span>
          <span className={style.btnSet}>設定</span>
        </NavLink>
      </div>
    </div>
  );
};

export default React.memo(Menu);
