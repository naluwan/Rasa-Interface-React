import * as React from 'react';
import cx from 'classnames';
import style from './StepControl.module.scss';
import { StoryType } from '../types';
import { randomBotResAction } from '../../utils/randomBotResAction';

type StepControlType = {
  isUser: boolean,
  onSetNewStory: (story: StoryType) => void,
};

const StepControl: React.FC<StepControlType> = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { isUser, onSetNewStory } = props;
  /**
   * @type {[string, Function]}
   */
  const [conversation, setConversation] = React.useState('');

  const atChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setConversation(e.target.value);
    },
    [setConversation],
  );

  const atUserStep = React.useCallback(
    (userSay: string) => {
      if (!userSay) return;
      onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.concat([
            { user: userSay, intent: userSay, entities: [] },
          ]),
        };
      });
      setConversation('');
    },
    [onSetNewStory],
  );

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
