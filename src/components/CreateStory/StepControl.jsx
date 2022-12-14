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
  actions: string[],
  onSetNewStory: (story: StoryType) => void,
  onSetIsInputFocus: () => void,
};

const StepControl: React.FC<StepControlType> = (props) => {
  const { isUser, nlu, onSetNewStory, steps, actions, onSetIsInputFocus } =
    props;
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
      const actionName = randomBotResAction(actions);

      onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.concat([{ action: actionName, response: botRes }]),
        };
      });

      setConversation('');
    },
    [onSetNewStory, actions],
  );

  return (
    <div className="d-flex px-3 justify-content-start">
      <textarea
        className={cx('col-9', style.stepTextarea)}
        type="text"
        name="conversation"
        placeholder="輸入完對話後，請點擊左側步驟按鈕"
        onChange={atChange}
        value={conversation}
        rows={1}
        onFocus={() =>
          onSetIsInputFocus((prev) => (prev === undefined ? true : !prev))
        }
        onBlur={() => onSetIsInputFocus(undefined)}
      />
      <div className="col-2 mx-3">
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
          disabled={!isUser}
        >
          機器人
        </button>
      </div>
    </div>
  );
};

export default React.memo(StepControl);
