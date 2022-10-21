import * as React from 'react';
import cx from 'classnames';
import { HiDotsHorizontal } from 'react-icons/hi';
import style from './StepAlert.module.scss';

type StepAlertType = {
  stepRole: string,
};

const StepAlert: React.FC<StepAlertType> = (props) => {
  const { stepRole } = props;
  return (
    <div className={cx('row', stepRole !== 'user' && 'justify-content-end')}>
      <div className={cx('col-6', style.title)}>
        {stepRole === 'user' ? '使用者輸入中' : '機器人輸入中'}
        <HiDotsHorizontal className={cx(style.inputFocus)} />
      </div>
    </div>
  );
};

export default React.memo(StepAlert);
