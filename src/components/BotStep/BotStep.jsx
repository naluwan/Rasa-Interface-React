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
    storyName: string,
    action: string,
  ) => void,
};

const BotStep: React.FC<BotStepProps> = (props) => {
  const { step, storyName, onEditBotRes } = props;

  // 編輯機器人回覆
  const atEditBotResponse = (response: string, action: string) => {
    swalInput(
      '編輯機器人回覆',
      'textarea',
      '請輸入機器人回覆',
      response,
      true,
    ).then((data) => {
      console.log(data);
      if (!data || !data.newSay || response === data.newSay) return;
      onEditBotRes(data.oriBotRes, data.newSay, storyName, action);
    });
  };
  return (
    <div className="row justify-content-end">
      <div className="col-6">
        <div className="d-flex align-items-center">
          <div className={style.botTitle}>機器人:</div>
          <div className={style.botResponse}>{step.response}</div>
        </div>
        <div className="pt-2">
          <button
            type="button"
            className="btn btn-info mx-2"
            onClick={() => atEditBotResponse(step.response, step.action)}
          >
            編輯
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BotStep);
