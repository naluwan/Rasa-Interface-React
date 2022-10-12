import * as React from 'react';
// import shallow from 'zustand';
import style from './UserStep.module.scss';
import type { StepsType } from '../types';
import { swalInput } from '../../utils/swalInput';
// import useStoryStore from '../../store/useStoryStore';

type UserStepProps = {
  step: StepsType,
  storyName: string,
  onEditExamples: (intent: string, examples: string, storyName: string) => void,
  onEditUserSay: (
    oriUserSay: string,
    userSay: string,
    storyName: string,
  ) => void,
};

const UserStep: React.FC<UserStepProps> = (props) => {
  const { step, storyName, onEditExamples, onEditUserSay } = props;

  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  const atAddExamples = (
    intent: string,
    examples: string,
    currentStoryName: string,
  ) => {
    swalInput('新增例句', 'textarea', '請輸入例句', examples, true).then(
      (newExamples) => {
        if (!newExamples || newExamples === examples) return;
        onEditExamples(intent, newExamples, currentStoryName);
      },
    );
  };

  const atEditUserSay = (userSay: string) => {
    swalInput(
      '編輯使用者對話',
      'textarea',
      '請輸入使用者對話',
      userSay,
      true,
    ).then((data) => {
      if (!data || !data.newSay || userSay === data.newSay) return;
      onEditUserSay(data.oriSay, data.newSay, storyName);
    });
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
            onClick={() =>
              atAddExamples(step.intent, step.examples.toString(), storyName)
            }
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
