import * as React from 'react';
import shallow from 'zustand';
import style from './UserStep.module.scss';
import type { StepsType, State } from '../types';
import { swalInput } from '../../utils/swalInput';
import useStoryStore from '../../store/useStoryStore';

type UserStepProps = {
  step: StepsType,
};

const UserStep: React.FC<UserStepProps> = (props) => {
  const { step } = props;
  const { onEditExamples } = useStoryStore((state: State) => {
    return {
      onEditExamples: state.onEditExamples,
    };
  }, shallow);
  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  const atAddExamples = (examples: string) => {
    swalInput('新增例句', 'textarea', '請輸入例句', examples, true).then(
      (newExamples) => {
        if (!newExamples || newExamples === examples) return;
        onEditExamples(step.intent, newExamples);
      },
    );
  };

  const atEditUserSay = (userSay: string) => {
    swalInput('編輯使用者對話', 'text', '請輸入使用者對話', userSay, true);
  };

  return (
    <div className="row">
      <div className="col-6">
        <div className="d-flex align-items-center pt-3">
          <div className={style.userTitle}>使用者:</div>
          <div className={style.userText}>
            {step.user ? step.user : showIntent}
          </div>
        </div>
        <div className="pt-2">
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
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserStep);
