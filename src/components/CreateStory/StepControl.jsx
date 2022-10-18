import * as React from 'react';
import cx from 'classnames';
import { Toast } from 'utils/swalInput';
import style from './StepControl.module.scss';
import { StoryType, ExampleType, StepsType } from '../types';
import { randomBotResAction } from '../../utils/randomBotResAction';

type StepControlType = {
  isUser: boolean,
  nlu: ExampleType[],
  steps: StepsType,
  onSetNewStory: (story: StoryType) => void,
};

const StepControl: React.FC<StepControlType> = (props) => {
  const { isUser, nlu, onSetNewStory, steps } = props;
  /**
   * @type {[string, Function]}
   */
  const [conversation, setConversation] = React.useState('');

  // 獲取輸入框文字
  const atChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setConversation(e.target.value);
    },
    [setConversation],
  );

  // 點擊使用者按鈕
  const atUserStep = React.useCallback(
    (userSay: string) => {
      if (!userSay) return;
      const repeat = [];
      nlu.map((nluItem) =>
        nluItem.text === userSay ? repeat.push(userSay) : nluItem,
      );
      steps.map((step) =>
        step.user === userSay ? repeat.push(userSay) : step,
      );
      if (repeat.length) {
        Toast.fire({
          icon: 'warning',
          title: `使用者對話『${userSay}』重複`,
        });
        setConversation('');
        return;
      }
      onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.concat([
            { user: userSay, intent: userSay, entities: [], examples: [] },
          ]),
        };
      });
      setConversation('');
    },
    [onSetNewStory, nlu, steps],
  );

  // 點擊機器人按鈕
  const atBotStep = React.useCallback(
    (botRes: string) => {
      if (!botRes) return;
      randomBotResAction().then((actionName) => {
        onSetNewStory((prev) => {
          return {
            ...prev,
            steps: prev.steps.concat([
              { action: actionName, response: botRes },
            ]),
          };
        });
      });
      setConversation('');
    },
    [onSetNewStory],
  );

  return (
    <div className="d-flex px-3 justify-content-start">
      <div className="col-2">
        <button
          className="btn btn-success mx-1"
          onClick={() => atUserStep(conversation)}
          disabled={isUser}
        >
          使用者
        </button>
        <button
          className="btn btn-primary mx-1"
          onClick={() => atBotStep(conversation)}
        >
          機器人
        </button>
      </div>
      <textarea
        className={cx('col-9', style.stepTextarea)}
        type="text"
        name="conversation"
        placeholder="輸入完對話後，請點擊左側步驟按鈕"
        onChange={atChange}
        value={conversation}
        rows={1}
      />
    </div>
  );
};

export default React.memo(StepControl);
