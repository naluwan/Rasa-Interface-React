import * as React from 'react';
import cx from 'classnames';
import style from './UserStep.module.scss';
import type { StepsType } from '../types';
import { swalInput } from '../../utils/swalInput';

type UserStepProps = {
  isCreate: boolean,
  step: StepsType,
  storyName: string,
  onEditExamples: (
    intent: string,
    examples: string,
    storyName?: string,
  ) => void,
  onEditUserSay: (
    oriUserSay: string,
    userSay: string,
    storyName?: string,
  ) => void,
  onRemoveUserStep: (intent: string, userSay: string) => void,
};

const UserStep: React.FC<UserStepProps> = (props) => {
  const {
    isCreate,
    step,
    storyName,
    onEditExamples,
    onEditUserSay,
    onRemoveUserStep,
  } = props;
  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  // 編輯例句
  const atAddExamples = React.useCallback(
    (intent: string, examples: string, currentStoryName: string | null) => {
      swalInput('新增例句', 'textarea', '請輸入例句', examples, true).then(
        (newExamples) => {
          if (newExamples === undefined || newExamples === examples) return;
          onEditExamples(intent, newExamples, currentStoryName);
        },
      );
    },
    [onEditExamples],
  );

  // 編輯使用者對話
  const atEditUserSay = React.useCallback(
    (userSay: string) => {
      swalInput(
        '編輯使用者對話',
        'textarea',
        '請輸入使用者對話',
        userSay,
        true,
      ).then((data) => {
        if (!data || !data.new || userSay === data.new) return;
        onEditUserSay(data.ori, data.new, storyName);
      });
    },
    [onEditUserSay, storyName],
  );

  return (
    <div className="row" id="userStep">
      <div className="col-6">
        <div className="d-flex align-items-center pt-3">
          <div className={style.userTitle}>使用者:</div>
          <div className={style.userText}>
            {step.user ? step.user : showIntent}
          </div>
        </div>
        <div className={cx('pt-2')}>
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
          {isCreate && (
            <button
              type="button"
              className="btn btn-danger mx-2"
              onClick={() => onRemoveUserStep(step.intent, step.user)}
            >
              刪除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserStep);
