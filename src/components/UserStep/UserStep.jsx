import * as React from 'react';
import style from './UserStep.module.scss';
import type { StepsType } from '../types';
import { swalInput } from '../../utils/swalInput';

type UserStepProps = {
  step: StepsType,
};

const UserStep: React.FC<UserStepProps> = (props) => {
  const { step } = props;
  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  const atAddExamples = (examples: string) => {
    swalInput('新增例句', 'textarea', '請輸入例句', examples, true).then(
      (value) => {
        if (!value) return;
        // eslint-disable-next-line no-alert
        alert(value);
      },
    );
  };

  const atEditUserSay = (userSay: string) => {
    swalInput('編輯使用者對話', 'text', '請輸入使用者對話', userSay, true);
  };

  return (
    <>
      <div className="d-flex align-items-center pt-3">
        <div className={style.userTitle}>使用者:</div>
        <div className={style.userText}>
          {step.user ? step.user : showIntent}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-info mx-2"
        onClick={() => atEditUserSay(step.user)}
      >
        編輯
      </button>
      <button
        type="button"
        className="btn btn-primary mx-2"
        onClick={() => atAddExamples(step.examples.toString())}
      >
        例句
      </button>
      <button
        type="button"
        className="btn btn-danger mx-2"
        // onClick={() => atAddExamples(step.examples.toString())}
      >
        刪除
      </button>
    </>
  );
};

export default React.memo(UserStep);
