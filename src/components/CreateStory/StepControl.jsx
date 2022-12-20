import * as React from 'react';
import cx from 'classnames';
import { Toast } from 'utils/swalInput';
import shallow from 'zustand/shallow';
import style from './StepControl.module.scss';
import { StoryType, ExampleType, StepsType, CreateStoryState } from '../types';
import { randomBotResAction } from '../../utils/randomBotResAction';
import useCreateStoryStore from '../../store/useCreateStoryStore';

type StepControlType = {
  isUser: boolean,
  hasBranch: boolean,
  nlu: ExampleType[],
  stories: StoryType[],
  newStory: StoryType,
  steps: StepsType,
  actions: string[],
  onSetIsInputFocus: () => void,
};

const StepControl: React.FC<StepControlType> = (props) => {
  const { isUser, hasBranch, nlu, steps, actions, onSetIsInputFocus } = props;
  /**
   * @type {[string, Function]}
   */
  const [conversation, setConversation] = React.useState('');

  const { onCreateUserStep, onCreateBotStep, onSetMainStep } =
    useCreateStoryStore((state: CreateStoryState) => {
      return {
        onCreateUserStep: state.onCreateUserStep,
        onCreateBotStep: state.onCreateBotStep,
        onSetMainStep: state.onSetMainStep,
      };
    }, shallow);

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
      onCreateUserStep(userSay);
      setConversation('');
    },
    [nlu, steps, onCreateUserStep],
  );

  // 點擊機器人按鈕
  const atBotStep = React.useCallback(
    (botRes: string) => {
      if (!botRes) return;
      const actionName = randomBotResAction(actions);

      onCreateBotStep(actionName, botRes);

      setConversation('');
    },
    [onCreateBotStep, actions],
  );

  return (
    <div className={cx('d-flex px-3 justify-content-start ', style.stepBlock)}>
      <textarea
        className={cx(style.stepTextarea)}
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
      <div
        className={cx(
          ' mx-3 d-flex flex-column align-items-center',
          style.BtnBlock,
        )}
      >
        <div className="col-12 d-flex justify-content-around mb-1">
          <button
            className={cx('btn btn-success', style.userBtn)}
            onClick={() => atUserStep(conversation)}
            disabled={isUser}
          >
            使用者
          </button>
          <button
            className={cx('btn btn-primary', style.botBtn)}
            onClick={() => atBotStep(conversation)}
            disabled={!isUser || hasBranch}
          >
            機器人
          </button>
        </div>
        <button
          className={cx(
            'btn btn-warning mx-1 col-12',
            style.createBranchStoryModalBtn,
          )}
          data-bs-toggle="modal"
          data-bs-target="#createBranchStoryModal"
          disabled={!isUser || hasBranch}
          onClick={() => onSetMainStep()}
        >
          新增支線故事
        </button>
      </div>
    </div>
  );
};

export default React.memo(StepControl);
