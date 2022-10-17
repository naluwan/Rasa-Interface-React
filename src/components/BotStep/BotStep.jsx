import * as React from 'react';
import style from './BotStep.module.scss';
import type { StepsType } from '../types';
import { swalInput } from '../../utils/swalInput';

type BotStepProps = {
  step: StepsType,
  storyName: string,
  onEditBotRes: (
    oriBotRes: string,
    botRes: string,
    action: string,
    storyName?: string,
  ) => void,
};

const BotStep: React.FC<BotStepProps> = (props) => {
  const { step, storyName, onEditBotRes } = props;
  const textAreaRef = React.useRef();

  // textarea 自適應高度
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
  return (
    <div className="row justify-content-end" id="botStep">
      <div className="col-6">
        <div className="d-flex align-items-center">
          <div className={style.botTitle}>機器人:</div>
          <textarea
            className={style.botResponse}
            ref={textAreaRef}
            rows={1}
            readOnly
          />
        </div>
        <div className="pt-2">
          <button
            type="button"
            className="btn btn-info mx-2"
            onClick={() =>
              atEditBotResponse(step.response, step.action, storyName)
            }
          >
            編輯
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BotStep);
