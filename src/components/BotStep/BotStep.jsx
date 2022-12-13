import * as React from 'react';
import cx from 'classnames';
import shallow from 'zustand/shallow';
import style from './BotStep.module.scss';
import type { StepsType, StoryType, State } from '../types';
import {
  swalInput,
  swalMultipleInput,
  confirmWidget,
} from '../../utils/swalInput';
import ButtonItems from './ButtonItems';
import useStoryStore from '../../store/useStoryStore';

type BotStepProps = {
  step: StepsType,
  storyName: string,
  isCreate: boolean,
  checkPointName: string,
  connectBranchStoryName: string,
  onEditBotRes: (
    oriBotRes: string,
    botRes: string,
    action: string,
    storyName?: string,
    checkPointName?: string,
    connectStoryName?: string,
  ) => void,
  onRemoveBotStep: (action: string) => void,
  onAddResButtons: (
    action: string,
    title: string,
    payload: string,
    reply: string,
    storyName?: string,
    stories?: StoryType[],
    checkPointName?: string,
  ) => void,
  onEditResButtons: (
    action: string,
    title: string,
    oriPayload: string,
    payload: string,
    reply: string,
    storyName?: string,
    buttonAction?: string,
  ) => void,
  onRemoveResButton: (action: string, payload: string) => void,
};

const BotStep: React.FC<BotStepProps> = (props) => {
  const {
    isCreate,
    step,
    storyName,
    checkPointName,
    connectBranchStoryName,
    onEditBotRes,
    onRemoveBotStep,
    onAddResButtons,
    onEditResButtons,
    onRemoveResButton,
  } = props;

  const { stories } = useStoryStore((state: State) => {
    return {
      stories: state.stories,
    };
  }, shallow);

  // textarea 自適應高度
  const textAreaRef = React.useRef();
  React.useEffect(() => {
    textAreaRef.current.style = 'height:0px';
    textAreaRef.current.value = step.response;
    textAreaRef.current.style = `height: ${textAreaRef.current.scrollHeight}px`;
  }, [step.response]);

  // 編輯機器人回覆
  const atEditBotResponse = React.useCallback(
    (
      response: string,
      action: string,
      currentStoryName: string,
      currentCheckPointName: string,
      currentConnectBranchStoryName: string,
    ) => {
      return swalInput(
        '編輯機器人回覆',
        'textarea',
        '請輸入機器人回覆',
        response,
        true,
      ).then((data) => {
        if (!data || !data.new || response === data.new) return;
        onEditBotRes(
          data.ori,
          data.new,
          action,
          currentStoryName,
          currentCheckPointName,
          currentConnectBranchStoryName,
        );
      });
    },
    [onEditBotRes],
  );

  // 增加機器人回覆按鈕選項
  const atAddResButtons = React.useCallback(
    (
      action: string,
      currentStoryName: string,
      currentCheckPointName: string,
    ) => {
      return swalMultipleInput('新增機器人回覆選項', '', '', true).then(
        (data) => {
          if (!data || !data.title) return;
          const payload = `/${data.title}`;
          onAddResButtons(
            action,
            data.title,
            payload,
            data.reply,
            currentStoryName,
            stories,
            currentCheckPointName,
          );
        },
      );
    },
    [onAddResButtons, stories],
  );

  // 編輯機器人選項
  const atEditResButtons = React.useCallback(
    (title: string, reply: string, buttonActionName: string) => {
      return swalMultipleInput(`編輯『${title}』選項`, title, reply, true).then(
        (data) => {
          if (!data || !data.title || !data.reply) return;
          const payload = `/${data.title}`;
          onEditResButtons(
            step.action,
            data.title,
            data.oriPayload,
            payload,
            data.reply,
            storyName,
            buttonActionName,
            stories,
          );
        },
      );
    },
    [onEditResButtons, step.action, storyName, stories],
  );

  // 刪除機器人選項
  const atRemoveResButton = React.useCallback(
    (
      title: string,
      payload: string,
      buttonActionName: string,
      disabled: boolean,
    ) => {
      return confirmWidget(title, 'delete').then((result) => {
        if (!result.isConfirmed) return;
        onRemoveResButton(
          step.action,
          payload,
          storyName,
          buttonActionName,
          disabled,
        );
      });
    },
    [onRemoveResButton, step.action, storyName],
  );

  return (
    <div className="col-12">
      <div
        className={cx('row justify-content-end pt-2', style.botStep)}
        id="botStep"
      >
        <div className={cx('col-6', style.botStepContainer)}>
          <div className="py-2">
            <button
              type="button"
              className={cx('btn mx-2', style.editBtn)}
              onClick={() =>
                atEditBotResponse(
                  step.response,
                  step.action,
                  storyName,
                  checkPointName,
                  connectBranchStoryName,
                )
              }
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3043 2.75 17.863 2.75C18.421 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.571 21.275 6.113C21.2917 6.65433 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4ZM14.325 9.675L13.625 8.975L15.025 10.375L14.325 9.675Z"
                  fill="black"
                />
              </svg>
              編輯
            </button>
            <button
              type="button"
              className={cx('btn mx-2', style.addBtn)}
              onClick={() =>
                atAddResButtons(step.action, storyName, checkPointName)
              }
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19V13H5V11H11V5H13V11H19V13H13V19H11Z"
                  fill="black"
                />
              </svg>
              增加選項
            </button>
            {isCreate && (
              <button
                type="button"
                className="btn btn-danger mx-2"
                onClick={() => onRemoveBotStep(step.action)}
              >
                刪除
              </button>
            )}
          </div>
          <div className="d-flex align-items-center pt-2">
            <div className={style.botTitle}>機器人:</div>
            <textarea
              className={style.botResponse}
              ref={textAreaRef}
              rows={1}
              readOnly
            />
          </div>
          {step.buttons?.length > 0 &&
            step.buttons.map((button) => {
              const { title, payload, reply, disabled, buttonAction } = button;
              return (
                <ButtonItems
                  key={payload}
                  title={title}
                  payload={payload}
                  reply={reply}
                  disabled={disabled}
                  buttonAction={buttonAction}
                  onEditResButtons={atEditResButtons}
                  onRemoveResButton={atRemoveResButton}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BotStep);
