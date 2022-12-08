import * as React from 'react';
import cx from 'classnames';
import style from './ShowSlots.module.scss';

type ShowSlotsProps = {
  slotInfo: { slotKey: string, slotValue: string },
};

const ShowSlots: React.FC<ShowSlotsProps> = (props) => {
  const { slotInfo } = props;

  return (
    <div className={cx('col-6', style.root)}>
      <div className="d-flex">
        <div className={cx('slotContainer', style.slotKey)}>
          <span>記錄槽：</span>
          <span>{slotInfo.slotKey}</span>
        </div>
        <div className={cx('slotContainer', style.slotValue)}>
          <span>儲存槽：</span>
          <span>{slotInfo.slotValue}</span>
        </div>
      </div>
      <div className={cx('slotContainer')}>
        <button className="btn btn-primary mx-2">編輯</button>
        <button className="btn btn-danger mx-2">刪除</button>
      </div>
    </div>
  );
};

export default React.memo(ShowSlots);
