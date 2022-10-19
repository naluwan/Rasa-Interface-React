import * as React from 'react';
import style from './BotStep.module.scss';
import type { StepsType } from '../types';
import {
  swalInput,
  swalMultipleInput,
  confirmWidget,
} from '../../utils/swalInput';
import ButtonItems from './ButtonItems';

type BotStepProps = {
  step: StepsType,
  storyName: string,
  isCreate: boolean,
  onEditBotRes: (
    oriBotRes: string,
    botRes: string,
    action: string,
    storyName?: string,
  ) => void,
  onRemoveBotStep: (action: string) => void,
  onAddResButtons: (
    action: string,
    title: string,
    payload: string,
    reply: string,
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
    onEditBotRes,
    onRemoveBotStep,
    onAddResButtons,
    onEditResButtons,
    onRemoveResButton,
  } = props;

  // textarea 自適應高度
  const textAreaRef = React.useRef();
  React.useEffect(() => {
    textAreaRef.current.style = 'height:0px';
    textAreaRef.current.value = step.response;
    textAreaRef.current.style = `height: ${textAreaRef.current.scrollHeight}px`;
  }, [step.response]);

  // 編輯機器人回覆
  const atEditBotResponse = React.useCallback(
    (response: string, action: string, currentStoryName) => {
      return swalInput(
        '編輯機器人回覆',
        'textarea',
        '請輸入機器人回覆',
        response,
        true,
      ).then((data) => {
        if (!data || !data.new || response === data.new) return;
        onEditBotRes(data.ori, data.new, action, currentStoryName);
      });
    },
    [onEditBotRes],
  );

  // 增加機器人回覆選項
  const atAddResButtons = React.useCallback(
    (action: string) => {
      return swalMultipleInput('新增機器人回覆選項', '', '', true).then(
        (data) => {
          if (!data || !data.title) return;
          const payload = `/${data.title}`;
          onAddResButtons(action, data.title, payload, data.reply);
        },
      );
    },
    [onAddResButtons],
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
          );
        },
      );
    },
    [onEditResButtons, step.action, storyName],
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
    <div className="row justify-content-end" id="botStep">
      <div className="col-6">
        <div className="py-2">
          <button
            type="button"
            className="btn btn-info mx-2"
            onClick={() =>
              atEditBotResponse(step.response, step.action, storyName)
            }
          >
            編輯
          </button>
          <button
            type="button"
            className="btn btn-primary mx-2"
            onClick={() => atAddResButtons(step.action)}
          >
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
  );
};

export default React.memo(BotStep);
