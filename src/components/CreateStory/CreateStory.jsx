import * as React from 'react';
import { Toast } from 'utils/swalInput';
import style from './CreateStory.module.scss';
import StepControl from './StepControl';
import UserStep from '../UserStep';
import BotStep from '../BotStep';
// eslint-disable-next-line no-unused-vars
import { StepsType, ExampleType } from '../types';

type CreateStoryProps = {
  storyName: string,
  steps: StepsType,
  nlu: ExampleType[],
  onSetNewStory: (story: StoryType) => void,
  onClickSaveBtn: () => void,
};

const CreateStory: React.FC<CreateStoryProps> = (props) => {
  const { storyName, steps, nlu, onSetNewStory, onClickSaveBtn } = props;
  const [isUser, setIsUser] = React.useState(false);

  React.useEffect(() => {
    // 雙驚嘆號為判斷是否存在，只返回boolean
    setIsUser(steps.length ? !!steps[steps.length - 1].intent : false);
  }, [setIsUser, steps]);

  // 編輯使用者對話;
  const atEditUserSay = React.useCallback(
    (oriUserSay: string, userSay: string) => {
      // 驗證使用者對話是否重複
      const repeat = [];
      nlu.map((nluItem) =>
        nluItem.text === userSay ? repeat.push(userSay) : nluItem,
      );
      steps.map((step) =>
        step.user === userSay ? repeat.push(userSay) : step,
      );
      if (repeat.length) {
        return Toast.fire({
          icon: 'warning',
          title: `使用者對話『${userSay}』重複`,
        });
      }
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (step.user === oriUserSay) {
              step.user = userSay;
              step.intent = userSay;
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory, nlu, steps],
  );

  // 編輯例句
  const atEditExamples = React.useCallback(
    (intent: string, examples: string) => {
      const newExamples = examples
        .split(',')
        .map((example) => example.trimStart())
        .map((example) => example.trimEnd())
        .filter((example) => example !== '');
      const repeat = [];
      // 驗證例句是否重複
      newExamples.map((example) => {
        // 驗證所有例句
        nlu.map((nluItem) =>
          nluItem.text === example ? repeat.push(example) : nluItem,
        );

        // 驗證目前新增故事
        steps.map((step) => {
          if (step.user === example) {
            repeat.push(example);
          } else if (step.intent !== intent) {
            step.examples?.map((stepExample) =>
              stepExample === example ? repeat.push(example) : example,
            );
          }
          return step;
        });
        return example;
      });
      if (repeat.length) {
        return Toast.fire({
          title: '以下例句重複',
          text: `${repeat.toString()}`,
          icon: 'warning',
        });
      }
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (step.intent === intent) {
              step.examples = examples
                .split(',')
                .map((example) => example.trimStart())
                .map((example) => example.trimEnd())
                .filter((example) => example !== '');
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory, nlu, steps],
  );

  // 編輯機器人回覆
  const atEditBotRes = React.useCallback(
    (oriBotRes: string, botRes: string, action: string) => {
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (
              step.action &&
              step.action === action &&
              step.response === oriBotRes
            ) {
              step.response = botRes;
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory],
  );

  return (
    <div className={style.root}>
      <div className="col d-flex align-items-center">
        <div className={style.title}>{storyName}</div>
        <button
          type="button"
          className="btn btn-secondary mx-4"
          onClick={onClickSaveBtn}
        >
          儲存
        </button>
      </div>
      <div className={style.stepsPanel} id="stepsPanel">
        {steps.length !== 0 &&
          steps.map((step) => {
            // 要先將值取出來，再當作props傳進去，React才會檢查到有改變需要重新render
            const { intent, user, entities, examples, action, response } = step;
            return step.intent ? (
              <UserStep
                key={step.intent}
                step={{ intent, user, entities, examples }}
                storyName={storyName}
                onEditUserSay={atEditUserSay}
                onEditExamples={atEditExamples}
              />
            ) : (
              <BotStep
                key={step.action}
                step={{ action, response }}
                storyName={storyName}
                onEditBotRes={atEditBotRes}
              />
            );
          })}
      </div>
      <StepControl
        onSetNewStory={onSetNewStory}
        isUser={isUser}
        nlu={nlu}
        steps={steps}
      />
    </div>
  );
};

export default React.memo(CreateStory);
