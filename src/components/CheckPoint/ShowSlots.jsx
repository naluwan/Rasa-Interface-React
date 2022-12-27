import * as React from 'react';
import cx from 'classnames';
import style from './ShowSlots.module.scss';

type ShowSlotsProps = {
  slotInfo: { slotKey: string, slotValue: string },
};

const ShowSlots: React.FC<ShowSlotsProps> = (props) => {
  const { slotInfo } = props;

  return (
    <div className="row">
      <div className="col-sm-12 col-md-12 col-lg-6">
        <div className={cx(style.root)}>
          <div className={cx('d-flex mt-2', style.slotBlock)}>
            <div className={cx('slotContainer', style.slotKey)}>
              <span>記錄槽：</span>
              <span>{slotInfo.slotKey}</span>
            </div>
            <div className={cx('slotContainer', style.slotValue)}>
              <span>儲存槽：</span>
              <span>
                {slotInfo.slotValue === null ? 'null' : slotInfo.slotValue}
              </span>
            </div>
          </div>
          <div className={cx('slotContainer', style.slotBtnBlock)}>
            <button className="btn btn-primary mx-2 mt-2">編輯</button>
            <button className="btn btn-danger mx-2 mt-2">刪除</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ShowSlots);
