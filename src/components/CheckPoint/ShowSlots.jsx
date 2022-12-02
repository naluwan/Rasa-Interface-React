import * as React from 'react';
import cx from 'classnames';
import style from './ShowSlots.module.scss';

type ShowSlotsProps = {
  slotKey: string,
  slotValue: string,
};

const ShowSlots: React.FC<ShowSlotsProps> = (props) => {
  const { slotKey, slotValue } = props;
  return (
    <div className={cx('col-6', style.root)}>
      <div className={cx('slotContainer', style.slotKey)}>
        <span>記錄槽：</span>
        <span>{slotKey}</span>
      </div>
      <div className={cx('slotContainer', style.slotValue)}>
        <span>儲存槽：</span>
        <span>{slotValue}</span>
      </div>
    </div>
  );
};

export default React.memo(ShowSlots);
