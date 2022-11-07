import * as React from 'react';
import cx from 'classnames';
import style from './UserStep.module.scss';
import type { StepsType } from '../types';
import { swalInput } from '../../utils/swalInput';
// import useStoryStore from '../../store/useStoryStore';

type UserStepProps = {
  isCreate: boolean,
  step: StepsType,
  storyName: string,
  onEditExamples: (
    userSay: string,
    intent: string,
    examples: string,
    storyName?: string,
  ) => void,
  onEditUserSay: (
    oriUserSay: string,
    userSay: string,
    storyName?: string,
  ) => void,
  onEditIntent: (oriIntent: String, intent: String, storyName?: string) => void,
  onRemoveUserStep: (intent: string, userSay: string) => void,
};

const UserStep: React.FC<UserStepProps> = (props) => {
  const {
    isCreate,
    step,
    storyName,
    onEditExamples,
    onEditUserSay,
    onEditIntent,
    onRemoveUserStep,
  } = props;
  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  const isGetStarted = step.intent === 'get_started';

  // 編輯例句
  const atAddExamples = React.useCallback(
    (
      userSay: string,
      intent: string,
      examples: string,
      currentStoryName: string | null,
    ) => {
      swalInput('新增例句', 'textarea', '請輸入例句', examples, true).then(
        (newExamples) => {
          if (newExamples === undefined || newExamples === examples) return;
          onEditExamples(userSay, intent, newExamples, currentStoryName);
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

  // 編輯意圖
  const atEditIntent = React.useCallback(
    (intent: string) => {
      swalInput('編輯意圖', 'textarea', '請輸入意圖', intent, true).then(
        (data) => {
          if (!data || !data.new || intent === data.new) return;
          onEditIntent(data.ori, data.new, storyName);
        },
      );
    },
    [onEditIntent, storyName],
  );

  return (
    <div className="row pt-2" id="userStep">
      <div className={cx('col-6', style.userStepContainer)}>
        {!isGetStarted && (
          <div className={cx('py-2')}>
            <button
              type="button"
              className="btn btn-info mx-2"
              onClick={() => atEditUserSay(step.user)}
            >
              編輯
            </button>
            <button
              type="button"
              className="btn btn-outline-warning mx-2"
              onClick={() => atEditIntent(step.intent)}
            >
              意圖
            </button>
            <button
              type="button"
              className="btn btn-primary mx-2"
              onClick={() =>
                atAddExamples(
                  step.user,
                  step.intent,
                  step.examples.toString(),
                  storyName,
                )
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
        )}

        <div className="d-flex flex-column">
          <div className="d-flex align-items-center pt-2">
            <div className={style.userTitle}>使用者:</div>
            <div className={style.userText}>
              {step.user ? step.user : showIntent}
            </div>
          </div>
          <div className="d-flex align-items-center pt-2">
            <div className={style.userTitle}>意圖:</div>
            <div className={style.userText}>{step.intent}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserStep);
